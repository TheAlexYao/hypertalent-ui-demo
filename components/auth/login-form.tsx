"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Target, Loader2, AlertCircle, LogIn } from "lucide-react"
import { useAuth } from "./auth-provider"

export function LoginForm() {
  const { signIn, isLoading } = useAuth()

  const handleGoogleSignIn = async () => {
    await signIn()
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
            Google OAuth Required
          </Badge>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Continue to Google to authenticate and return to Deal Hunter automatically.
          </p>
          <Button onClick={handleGoogleSignIn} className="w-full gap-2" disabled={isLoading}>
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
            {isLoading ? "Redirecting..." : "Sign in with Google"}
          </Button>
        </div>
      </Card>
    </div>
  )
}
