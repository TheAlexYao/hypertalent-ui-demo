"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronRight, Download } from "lucide-react"
import { useState } from "react"

interface AgentStep {
  id: string
  agent: string
  status: "running" | "completed" | "error"
  message: string
  sources?: string[]
  timestamp: string
  expanded?: boolean
  data?: any
}

interface ReasoningTraceProps {
  steps: AgentStep[]
  onToggleExpansion: (stepId: string) => void
  maxSteps?: number
}

export function ReasoningTrace({ steps, onToggleExpansion, maxSteps = 200 }: ReasoningTraceProps) {
  const [showAll, setShowAll] = useState(false)

  const displaySteps = showAll ? steps : steps.slice(-maxSteps)
  const hasMoreSteps = steps.length > maxSteps

  const downloadTrace = () => {
    const traceData = {
      timestamp: new Date().toISOString(),
      steps: steps,
      metadata: {
        total_steps: steps.length,
        completed_steps: steps.filter((s) => s.status === "completed").length,
        running_steps: steps.filter((s) => s.status === "running").length,
        error_steps: steps.filter((s) => s.status === "error").length,
      },
    }

    const blob = new Blob([JSON.stringify(traceData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `reasoning-trace-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (steps.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">AI Reasoning Trace</h3>
        <div className="flex items-center gap-2">
          {hasMoreSteps && (
            <Button variant="ghost" size="sm" onClick={() => setShowAll(!showAll)} className="text-xs">
              {showAll ? `Show Recent ${maxSteps}` : `Show All ${steps.length}`}
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={downloadTrace} className="gap-1">
            <Download className="w-3 h-3" />
            Download
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {displaySteps.map((step) => (
          <div key={step.id} className="bg-card border rounded-lg">
            <button
              onClick={() => onToggleExpansion(step.id)}
              className="w-full p-3 text-left flex items-center justify-between hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    step.status === "completed" ? "default" : step.status === "error" ? "destructive" : "secondary"
                  }
                  className="text-xs"
                >
                  {step.agent}
                </Badge>
                <span className="text-sm">{step.message}</span>
              </div>
              {step.expanded ? (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              )}
            </button>

            {step.expanded && (
              <div className="px-3 pb-3 border-t border-border">
                <div className="pt-2 space-y-2">
                  {step.sources && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Sources:</p>
                      <div className="flex flex-wrap gap-1">
                        {step.sources.map((source, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {source}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {step.data && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Data:</p>
                      <pre className="text-xs bg-secondary p-2 rounded font-mono overflow-x-auto">
                        {JSON.stringify(step.data, null, 2)}
                      </pre>
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground">{new Date(step.timestamp).toLocaleString()}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
