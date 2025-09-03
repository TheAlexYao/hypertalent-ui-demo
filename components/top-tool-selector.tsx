import { Button } from "@/components/ui/button"
import { MessageSquare, Globe, Target, Gamepad2, Play } from "lucide-react"

const tools = [
  { id: "chat", name: "AI Chat", icon: MessageSquare },
  { id: "crawler", name: "Web Crawler", icon: Globe },
  { id: "deal-hunter", name: "Deal Hunter", icon: Target, active: true },
  { id: "gameplan", name: "GamePlan X", icon: Gamepad2 },
  { id: "simulation", name: "Simulation", icon: Play },
]

export function TopToolSelector() {
  return (
    <div className="border-b border-border bg-card">
      <div className="flex items-center gap-2 p-4">
        <span className="text-sm text-muted-foreground mr-2">Tools:</span>
        {tools.map((tool) => {
          const Icon = tool.icon
          return (
            <Button key={tool.id} variant={tool.active ? "default" : "ghost"} size="sm" className="gap-2">
              <Icon className="w-4 h-4" />
              {tool.name}
            </Button>
          )
        })}
      </div>
    </div>
  )
}
