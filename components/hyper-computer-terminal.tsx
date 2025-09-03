"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Send, Loader2, ChevronDown, ChevronRight, FileText, Database, Globe } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import type { TalentProfile } from "./talent-profile-manager"

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

interface StreamMessage {
  type: "agent_step" | "deal_found" | "stream_complete" | "error"
  data: any
  timestamp: string
}

const quickPrompts = [
  "Find brand deals for a professional athlete",
  "Analyze uploaded media kit for partnership opportunities",
  "Search for endorsement deals in sports nutrition",
  "Generate outreach email for Nike partnership",
]

interface HyperComputerTerminalProps {
  selectedTalent?: TalentProfile
  onDealsFound?: (deals: any[]) => void
}

export function HyperComputerTerminal({ selectedTalent, onDealsFound }: HyperComputerTerminalProps) {
  const [input, setInput] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const [messages, setMessages] = useState<AgentStep[]>([])
  const [mockMode, setMockMode] = useState(true) // Added mock mode toggle
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const simulateStreaming = async (query: string) => {
    const mockSteps: Omit<AgentStep, "id">[] = [
      {
        agent: "file_processor",
        status: "running",
        message: "Processing uploaded talent files...",
        sources: ["media-kit.pdf", "stats-2024.xlsx"],
        timestamp: new Date().toISOString(),
      },
      {
        agent: "profile_analyzer",
        status: "running",
        message: "Analyzing talent profile and performance metrics",
        sources: ["media-kit.pdf"],
        timestamp: new Date().toISOString(),
      },
      {
        agent: "deal_matcher",
        status: "running",
        message: "Searching brand partnership database for matching opportunities",
        sources: ["brand_database", "partnership_criteria"],
        timestamp: new Date().toISOString(),
      },
      {
        agent: "deal_matcher",
        status: "completed",
        message: "Found 12 high-value brand deals matching talent profile",
        sources: ["nike_partnership", "gatorade_campaign", "under_armour_deal"],
        timestamp: new Date().toISOString(),
        data: { deals_found: 12, avg_score: 8.4 },
      },
    ]

    for (let i = 0; i < mockSteps.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const step: AgentStep = {
        ...mockSteps[i],
        id: `step-${Date.now()}-${i}`,
        expanded: false,
      }

      setMessages((prev) => {
        const newMessages = [...prev]
        if (i > 0 && newMessages[i - 1]) {
          newMessages[i - 1] = { ...newMessages[i - 1], status: "completed", expanded: true }
        }
        return [...newMessages, step]
      })
    }

    // Complete the final step
    setMessages((prev) => {
      const newMessages = [...prev]
      if (newMessages.length > 0) {
        newMessages[newMessages.length - 1] = {
          ...newMessages[newMessages.length - 1],
          status: "completed",
          expanded: true,
        }
      }
      return newMessages
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isStreaming) return

    setIsStreaming(true)
    const userQuery = input
    setInput("")

    // Add user message
    const userMessage: AgentStep = {
      id: `user-${Date.now()}`,
      agent: "user",
      status: "completed",
      message: userQuery,
      timestamp: new Date().toISOString(),
      expanded: true,
    }
    setMessages((prev) => [...prev, userMessage])

    try {
      if (mockMode) {
        await simulateStreaming(userQuery)
      } else {
        // TODO: Implement real streaming API call
        console.log("Real streaming not implemented yet")
      }
    } catch (error) {
      console.error("Streaming error:", error)
    } finally {
      setIsStreaming(false)
    }
  }

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt)
  }

  const toggleStepExpansion = (stepId: string) => {
    setMessages((prev) => prev.map((msg) => (msg.id === stepId ? { ...msg, expanded: !msg.expanded } : msg)))
  }

  const getAgentIcon = (agent: string) => {
    switch (agent) {
      case "file_processor":
        return <FileText className="w-4 h-4" />
      case "profile_analyzer":
        return <Database className="w-4 h-4" />
      case "deal_matcher":
        return <Globe className="w-4 h-4" />
      default:
        return <div className="w-4 h-4 bg-primary rounded-full" />
    }
  }

  const handleDiscoveryComplete = (session: any) => {
    console.log("[v0] Discovery session completed:", session)
    if (onDealsFound) {
      onDealsFound(session.deals)
    }
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Chat Messages Area */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Welcome Message */}
          {messages.length === 0 && (
            <div className="text-center py-8">
              <h2 className="text-2xl font-semibold mb-2">Hyper Computer Terminal</h2>
              <p className="text-muted-foreground mb-6">
                Upload talent files and discover high-value brand deals with AI-powered matching
              </p>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Quick prompts:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {quickPrompts.map((prompt, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickPrompt(prompt)}
                      className="text-xs"
                    >
                      {prompt}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div key={message.id} className="space-y-2">
              {message.agent === "user" ? (
                <div className="flex justify-end">
                  <div className="bg-primary text-primary-foreground p-3 rounded-lg max-w-2xl">{message.message}</div>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {message.status === "running" ? (
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    ) : (
                      getAgentIcon(message.agent)
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium capitalize">{message.agent.replace("_", " ")}</span>
                      <Badge variant={message.status === "completed" ? "default" : "secondary"} className="text-xs">
                        {message.status}
                      </Badge>
                      {message.data?.deals_found && (
                        <Badge variant="outline" className="text-xs">
                          {message.data.deals_found} deals found
                        </Badge>
                      )}
                    </div>

                    <div className="bg-card border rounded-lg">
                      <button
                        onClick={() => toggleStepExpansion(message.id)}
                        className="w-full p-3 text-left flex items-center justify-between hover:bg-accent/50 transition-colors"
                      >
                        <span className="text-sm">{message.message}</span>
                        {message.expanded ? (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        )}
                      </button>

                      {message.expanded && (
                        <div className="px-3 pb-3 border-t border-border">
                          <div className="pt-2 space-y-2">
                            {message.sources && (
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Sources:</p>
                                <div className="flex flex-wrap gap-1">
                                  {message.sources.map((source, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs">
                                      {source}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {message.data && (
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Details:</p>
                                <pre className="text-xs bg-secondary p-2 rounded font-mono">
                                  {JSON.stringify(message.data, null, 2)}
                                </pre>
                              </div>
                            )}

                            <p className="text-xs text-muted-foreground">
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area - Fixed at bottom */}
      <div className="border-t border-border bg-card p-4">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe your talent or ask about deal opportunities..."
              className="flex-1"
              disabled={isStreaming}
            />
            <Button type="submit" disabled={isStreaming || !input.trim()}>
              {isStreaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>

          {mockMode && (
            <div className="flex items-center justify-center mt-2">
              <Badge variant="outline" className="text-xs">
                Mock Mode - Using simulated data
              </Badge>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
