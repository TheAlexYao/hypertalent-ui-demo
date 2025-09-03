"use client"

import { Button } from "@/components/ui/button"
import { MessageSquare, Globe, Target, Gamepad2, Play } from "lucide-react"
import type { ToolType } from "@/app/page"

interface TopToolSelectorProps {
  activeTool: ToolType
  onToolChange: (tool: ToolType) => void
}

const tools = [
  { id: "chat" as ToolType, name: "AI Chat", icon: MessageSquare },
  { id: "crawler" as ToolType, name: "Web Crawler", icon: Globe },
  { id: "deal-hunter" as ToolType, name: "Deal Hunter", icon: Target },
  { id: "gameplan" as ToolType, name: "GamePlan X", icon: Gamepad2 },
  { id: "simulation" as ToolType, name: "Simulation", icon: Play },
]

export function TopToolSelector({ activeTool, onToolChange }: TopToolSelectorProps) {
  return (
    <div className="border-b border-border bg-card">
      <div className="flex items-center gap-2 p-4">
        <span className="text-sm text-muted-foreground mr-2">Tools:</span>
        {tools.map((tool) => {
          const Icon = tool.icon
          return (
            <Button
              key={tool.id}
              variant={activeTool === tool.id ? "default" : "ghost"}
              size="sm"
              className="gap-2"
              onClick={() => onToolChange(tool.id)}
            >
              <Icon className="w-4 h-4" />
              {tool.name}
            </Button>
          )
        })}
      </div>
    </div>
  )
}
