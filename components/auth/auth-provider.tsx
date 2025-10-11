"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"

import { API_BASE_URL } from "@/lib/config"
import { getAuthStatus } from "@/services/deal-hunter-api"

interface User {
  email?: string
  name?: string
  avatar?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
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

  useEffect(() => {
    const checkSession = async () => {
      try {
        const status = await getAuthStatus()
        if (status.authenticated) {
          setUser({
            email: status.email,
            name: status.name || status.email,
          })
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error("Session check failed:", error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()
  }, [])

  const signIn = async () => {
    setIsLoading(true)
    try {
      window.location.href = "/api/auth/login"
      return
    } catch (error) {
      console.error("Failed to fetch Google auth URL, falling back to direct redirect", error)
    }

    setIsLoading(false)
    window.location.href = `${API_BASE_URL}/auth/login`
  }

  const signOut = async () => {
    setIsLoading(true)
    setUser(null)
    window.location.href = `${API_BASE_URL}/auth/login?logout=1`
  }

  const refreshSession = async () => {
    try {
      const status = await getAuthStatus()
      if (status.authenticated) {
        setUser({
          email: status.email,
          name: status.name || status.email,
        })
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error("Session refresh failed:", error)
      setUser(null)
    }
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    signIn,
    signOut,
    refreshSession,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
