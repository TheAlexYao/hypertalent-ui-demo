"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"

interface User {
  id: string
  email: string
  name: string
  role: "talent_manager" | "bd_executive" | "admin"
  avatar?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<void>
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

  // Mock user for development
  const mockUser: User = {
    id: "user-1",
    email: "sarah@hypertalent.com",
    name: "Sarah M.",
    role: "talent_manager",
    avatar: undefined,
  }

  useEffect(() => {
    // Simulate checking for existing session
    const checkSession = async () => {
      try {
        // In real implementation, this would check AWS Cognito session
        const savedUser = localStorage.getItem("hyper-talent-user")
        if (savedUser) {
          setUser(JSON.parse(savedUser))
        } else {
          // Auto-login for demo purposes
          setUser(mockUser)
          localStorage.setItem("hyper-talent-user", JSON.stringify(mockUser))
        }
      } catch (error) {
        console.error("Session check failed:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()
  }, [])

  const signIn = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      // Simulate AWS Cognito sign in
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock authentication - in real app, this would call Cognito
      if (email && password) {
        const authenticatedUser = { ...mockUser, email }
        setUser(authenticatedUser)
        localStorage.setItem("hyper-talent-user", JSON.stringify(authenticatedUser))
      } else {
        throw new Error("Invalid credentials")
      }
    } catch (error) {
      console.error("Sign in failed:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = async () => {
    setIsLoading(true)
    try {
      // Simulate AWS Cognito sign out
      await new Promise((resolve) => setTimeout(resolve, 500))

      setUser(null)
      localStorage.removeItem("hyper-talent-user")
      localStorage.removeItem("hyper-talent-files")
    } catch (error) {
      console.error("Sign out failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshSession = async () => {
    try {
      // In real implementation, this would refresh AWS Cognito tokens
      const savedUser = localStorage.getItem("hyper-talent-user")
      if (savedUser) {
        setUser(JSON.parse(savedUser))
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
