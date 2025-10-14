"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState, useCallback } from "react"

import { API_BASE_URL } from "@/lib/config"
import { getAuthStatus } from "@/services/deal-hunter-api"
import { getSessionId, setSessionId, clearSessionId } from "@/lib/session"
import type { AuthStatusResponse } from "@/types/backend"

interface User {
  email?: string
  name?: string
  avatar?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  sessionId: string | null
  signIn: () => Promise<void>
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [sessionId, setSessionIdState] = useState<string | null>(() => getSessionId())

  const resolveSessionId = useCallback((data: unknown): string | null => {
    if (!data || typeof data !== "object") {
      return typeof data === "string" && data.length > 0 ? data : null
    }

    if (typeof (data as { sessionId?: unknown }).sessionId === "string") {
      return (data as { sessionId: string }).sessionId
    }

    const payload = (data as { payload?: unknown }).payload
    if (payload && typeof payload === "object" && payload !== null && typeof (payload as { session_id?: unknown }).session_id === "string") {
      return (payload as { session_id: string }).session_id
    }

    return null
  }, [])

  const applyAuthStatus = (status: AuthStatusResponse) => {
    if (status.authenticated) {
      setUser({
        email: status.email,
        name: status.name || status.email,
      })
      if (status.session_id) {
        setSessionId(status.session_id)
        setSessionIdState(status.session_id)
      }
    } else {
      setUser(null)
      clearSessionId()
      setSessionIdState(null)
    }
  }

  const synchronizeSessionFromSignal = useCallback(
    (nextSessionId: string | null) => {
      if (nextSessionId) {
        setSessionId(nextSessionId)
        setSessionIdState((previous) => (previous === nextSessionId ? previous : nextSessionId))
      } else {
        clearSessionId()
        setSessionIdState((previous) => (previous === null ? previous : null))
      }

      getAuthStatus()
        .then(applyAuthStatus)
        .catch((error) => {
          console.error("Auth status refresh failed after session signal:", error)
          if (!nextSessionId) {
            setUser(null)
          }
        })
    },
    [applyAuthStatus, clearSessionId, setSessionId, setSessionIdState, setUser],
  )

  const pollAuthStatus = async (timeoutMs = 60_000, intervalMs = 1_500) => {
    const start = Date.now()
    while (Date.now() - start < timeoutMs) {
      try {
        const status = await getAuthStatus()
        if (status.authenticated) {
          applyAuthStatus(status)
          return
        }
      } catch (error) {
        console.error("Auth status polling failed:", error)
      }
      await new Promise((resolve) => setTimeout(resolve, intervalMs))
    }
    throw new Error("Authentication timed out. Please complete Google sign-in and try again.")
  }

  useEffect(() => {
    const checkSession = async () => {
      try {
        const status = await getAuthStatus()
        applyAuthStatus(status)
      } catch (error) {
        console.error("Session check failed:", error)
        setUser(null)
        clearSessionId()
        setSessionIdState(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return

    const handleAuthMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return
      const data = event.data
      if (!data || typeof data !== "object" || data.type !== "hypertalent-auth") return

      const sessionIdFromMessage = resolveSessionId(data)
      if (sessionIdFromMessage === sessionId) {
        return
      }

      synchronizeSessionFromSignal(sessionIdFromMessage)
    }

    window.addEventListener("message", handleAuthMessage)
    return () => window.removeEventListener("message", handleAuthMessage)
  }, [resolveSessionId, sessionId, synchronizeSessionFromSignal])

  useEffect(() => {
    if (typeof window === "undefined") return

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== "hyper-talent-session-id") return
      const nextSessionId = typeof event.newValue === "string" && event.newValue.length > 0 ? event.newValue : null
      if (nextSessionId === sessionId) {
        return
      }
      synchronizeSessionFromSignal(nextSessionId)
    }

    window.addEventListener("storage", handleStorage)

    let authChannel: BroadcastChannel | null = null
    let handleBroadcast: ((event: MessageEvent) => void) | null = null

    if (typeof window.BroadcastChannel === "function") {
      authChannel = new BroadcastChannel("hypertalent-auth")
      handleBroadcast = (event: MessageEvent) => {
        const data = event.data
        if (!data || typeof data !== "object" || (data as { type?: string }).type !== "hypertalent-auth") {
          return
        }

        const nextSessionId = resolveSessionId(data)
        if (nextSessionId === sessionId) {
          return
        }
        synchronizeSessionFromSignal(nextSessionId)
      }
      authChannel.addEventListener("message", handleBroadcast)
    }

    return () => {
      window.removeEventListener("storage", handleStorage)
      if (authChannel && handleBroadcast) {
        authChannel.removeEventListener("message", handleBroadcast)
        authChannel.close()
      } else if (authChannel) {
        authChannel.close()
      }
    }
  }, [resolveSessionId, sessionId, synchronizeSessionFromSignal])

  const signIn = async () => {
    setIsLoading(true)
    try {
      const authWindow = window.open("/api/auth/login", "hypertalent-google-auth", "width=520,height=680")

      if (!authWindow) {
        throw new Error("Pop-up blocked. Allow pop-ups for this site to continue.")
      }

      try {
        authWindow.opener = null
        authWindow.focus()
      } catch (error) {
        console.warn("Unable to adjust auth window", error)
      }

      try {
        await pollAuthStatus()
      } finally {
        try {
          authWindow.close()
        } catch (error) {
          console.warn("Unable to close auth window", error)
        }
      }
    } catch (error) {
      console.error("Failed to complete Google authentication", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = async () => {
    setIsLoading(true)
    setUser(null)
    clearSessionId()
    setSessionIdState(null)
    window.location.href = `${API_BASE_URL}/auth/login?logout=1`
  }

  const refreshSession = async () => {
    try {
      const status = await getAuthStatus()
      applyAuthStatus(status)
    } catch (error) {
      console.error("Session refresh failed:", error)
      setUser(null)
      clearSessionId()
      setSessionIdState(null)
    }
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    sessionId,
    signIn,
    signOut,
    refreshSession,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
