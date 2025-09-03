"use client"

import { Button } from "@/components/ui/button"
import { Search, Users, Target, BarChart3, Settings, User, LogOut } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"

export function Sidebar() {
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error("Sign out failed:", error)
    }
  }

  return (
    <div className="w-60 bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo/Brand */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
            <Target className="w-4 h-4 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h1 className="font-semibold text-sidebar-foreground">Hyper Talent</h1>
            <p className="text-xs text-sidebar-accent-foreground">Deal Hunter</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        <Button variant="ghost" className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent">
          <Search className="w-4 h-4" />
          Deal Discovery
        </Button>
        <Button variant="ghost" className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent">
          <Users className="w-4 h-4" />
          Talent Profiles
        </Button>
        <Button variant="ghost" className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent">
          <BarChart3 className="w-4 h-4" />
          Analytics
        </Button>
        <Button variant="ghost" className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent">
          <Settings className="w-4 h-4" />
          Settings
        </Button>
      </nav>

      {/* User Menu */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="space-y-2">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-sidebar-accent/50">
            <User className="w-4 h-4" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">{user?.name}</p>
              <p className="text-xs text-sidebar-accent-foreground truncate">{user?.email}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <LogOut className="w-3 h-3" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  )
}
