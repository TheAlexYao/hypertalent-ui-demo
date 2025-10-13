"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"

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

  const signIn = async () => {
    setIsLoading(true)
    try {
      const authWindow = window.open(
        "/api/auth/login",
        "hypertalent-google-auth",
        "width=520,height=680,noopener,noreferrer",
      )

      if (!authWindow) {
        window.location.href = "/api/auth/login"
        return
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

      setIsLoading(false)
      return
    } catch (error) {
      console.error("Failed to complete Google authentication", error)
      setIsLoading(false)
      window.location.href = `${API_BASE_URL}/auth/login`
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
