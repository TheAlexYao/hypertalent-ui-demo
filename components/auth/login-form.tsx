"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Target, Loader2, Mail, Lock, AlertCircle } from "lucide-react"
import { useState } from "react"
import { useAuth } from "./auth-provider"

export function LoginForm() {
  const [email, setEmail] = useState("sarah@hypertalent.com")
  const [password, setPassword] = useState("demo123")
  const [error, setError] = useState("")
  const { signIn, isLoading } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      await signIn(email, password)
    } catch (err) {
      setError("Invalid email or password. Please try again.")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-8">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Target className="w-6 h-6 text-primary-foreground" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold">Hyper Talent</h1>
            <p className="text-sm text-muted-foreground">Deal Hunter</p>
          </div>
        </div>

        {/* Demo Badge */}
        <div className="text-center mb-6">
          <Badge variant="secondary" className="gap-1">
            <AlertCircle className="w-3 h-3" />
            Demo Mode - Auto-login enabled
          </Badge>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="pl-9"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="pl-9"
                required
              />
            </div>
          </div>

          {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">{error}</div>}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>Demo Credentials:</p>
          <p>Email: sarah@hypertalent.com</p>
          <p>Password: demo123</p>
        </div>
      </Card>
    </div>
  )
}
