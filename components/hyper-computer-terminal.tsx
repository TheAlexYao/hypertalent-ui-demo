"use client"
import { Button } from "@/components/ui/button"
import type React from "react"

import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Send,
  Loader2,
  ChevronDown,
  ChevronRight,
  FileText,
  Database,
  Globe,
  MessageSquare,
  Gamepad2,
  Play,
} from "lucide-react"
import { useState, useRef, useEffect } from "react"
import type { TalentProfile } from "./talent-profile-manager"
import type { ToolType } from "@/app/page"
import type { UploadedFile } from "./file-upload-zone"

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

const getQuickPrompts = (tool: ToolType): string[] => {
  switch (tool) {
    case "chat":
      return [
        "Draft a partnership proposal for Nike",
        "Analyze market trends in sports nutrition",
        "Create a media kit template",
        "Generate contract negotiation points",
      ]
    case "crawler":
      return [
        "Scan NIL registries for new opportunities",
        "Monitor competitor brand campaigns",
        "Find emerging brand partnerships",
        "Track industry sentiment changes",
      ]
    case "deal-hunter":
      return [
        "Find brand deals for a professional athlete",
        "Analyze uploaded media kit for partnership opportunities",
        "Search for endorsement deals in sports nutrition",
        "Generate outreach email for Nike partnership",
      ]
    case "gameplan":
      return [
        "Find naming rights opportunities",
        "Calculate ROI for stadium sponsorship",
        "Match brands to venue properties",
        "Generate partnership packages",
      ]
    case "simulation":
      return [
        "Model 3-year endorsement deal outcomes",
        "Simulate brand alignment impact",
        "Forecast social media growth",
        "Compare exclusive vs multi-brand strategies",
      ]
    default:
      return []
  }
}

const getToolConfig = (tool: ToolType) => {
  switch (tool) {
    case "chat":
      return {
        title: "AI Chat Terminal",
        subtitle: "Strategic conversations with your AI agency",
        agents: [
          { name: "prompt_interpreter", description: "Analyzes user intent and context" },
          { name: "brand_strategist", description: "Develops partnership strategies" },
          { name: "contract_composer", description: "Creates legal documents and terms" },
          { name: "calendar_sync", description: "Manages scheduling and deadlines" },
        ],
      }
    case "crawler":
      return {
        title: "Web Crawler Terminal",
        subtitle: "Market intelligence on autopilot",
        agents: [
          { name: "opportunity_radar", description: "Scans for new partnership opportunities" },
          { name: "pr_scanner", description: "Monitors media and sentiment" },
          { name: "campaign_detector", description: "Identifies active brand campaigns" },
          { name: "scraping_agent", description: "Extracts structured data from sources" },
        ],
      }
    case "deal-hunter":
      return {
        title: "Deal Hunter Terminal",
        subtitle: "Find, negotiate, and close automatically",
        agents: [
          { name: "file_processor", description: "Processes uploaded talent files" },
          { name: "profile_analyzer", description: "Analyzes talent metrics and fit" },
          { name: "deal_matcher", description: "Matches talent to brand opportunities" },
          { name: "outreach_composer", description: "Creates personalized outreach" },
        ],
      }
    case "gameplan":
      return {
        title: "GamePlan X Terminal",
        subtitle: "The autonomous sponsorship exchange",
        agents: [
          { name: "brand_strategy", description: "Analyzes brand campaign objectives" },
          { name: "match_engine", description: "Matches brands to optimal opportunities" },
          { name: "roi_simulator", description: "Calculates partnership ROI projections" },
          { name: "marketplace_composer", description: "Creates marketplace listings" },
        ],
      }
    case "simulation":
      return {
        title: "Simulation Terminal",
        subtitle: "Model outcomes, optimize futures",
        agents: [
          { name: "simulation_planner", description: "Sets up forecasting models" },
          { name: "revenue_forecaster", description: "Predicts financial outcomes" },
          { name: "talent_persona", description: "Models talent behavior patterns" },
          { name: "media_effectiveness", description: "Measures campaign impact" },
        ],
      }
    default:
      return {
        title: "Hyper Computer Terminal",
        subtitle: "AI-powered talent management",
        agents: [],
      }
  }
}

interface HyperComputerTerminalProps {
  selectedTalent?: TalentProfile
  onDealsFound?: (deals: any[]) => void
  activeTool: ToolType
  files?: UploadedFile[]
}

export function HyperComputerTerminal({
  selectedTalent,
  onDealsFound,
  activeTool,
  files = [],
}: HyperComputerTerminalProps) {
  const [input, setInput] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const [messages, setMessages] = useState<AgentStep[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const toolConfig = getToolConfig(activeTool)
  const quickPrompts = getQuickPrompts(activeTool)

  useEffect(() => {
    setMessages([])
    setInput("")
    setIsStreaming(false)
  }, [activeTool])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const simulateStreaming = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isStreaming) return

    const query = input.trim()
    setInput("")
    setIsStreaming(true)

    // Add user message
    const userMessage: AgentStep = {
      id: `user-${Date.now()}`,
      agent: "user",
      status: "completed",
      message: query,
      timestamp: new Date().toISOString(),
      expanded: false,
    }
    setMessages((prev) => [...prev, userMessage])

    const completedFiles = files.filter((f) => f.status === "completed")
    const fileNames = completedFiles.map((f) => f.name)

    const getToolSpecificSteps = (tool: ToolType): Omit<AgentStep, "id">[] => {
      const baseFileProcessingSteps =
        completedFiles.length > 0
          ? [
              {
                agent: "file_processor",
                status: "running" as const,
                message: `Processing ${completedFiles.length} uploaded files for talent context...`,
                sources: fileNames,
                timestamp: new Date().toISOString(),
              },
              {
                agent: "file_processor",
                status: "completed" as const,
                message: `Successfully extracted talent data from ${fileNames.join(", ")} - Ready for ${tool} analysis`,
                sources: fileNames,
                timestamp: new Date().toISOString(),
                data: {
                  files_processed: completedFiles.length,
                  data_extracted: true,
                  talent_context_available: true,
                  tool_optimized: tool,
                },
              },
            ]
          : [
              {
                agent: "file_processor",
                status: "completed" as const,
                message: "No files uploaded - Using basic talent profile for analysis",
                sources: ["default_profile"],
                timestamp: new Date().toISOString(),
                data: { files_processed: 0, using_defaults: true },
              },
            ]

      switch (tool) {
        case "chat":
          return [
            ...baseFileProcessingSteps,
            {
              agent: "prompt_interpreter",
              status: "running",
              message: "Analyzing strategic request and available talent context...",
              sources: ["conversation_context", "talent_profile", ...fileNames],
              timestamp: new Date().toISOString(),
            },
            {
              agent: "brand_strategist",
              status: "running",
              message: `Developing strategic recommendations ${completedFiles.length > 0 ? "based on uploaded talent data" : "using available context"}`,
              sources: ["market_data", "brand_intelligence", ...fileNames],
              timestamp: new Date().toISOString(),
            },
            {
              agent: "contract_composer",
              status: "completed",
              message: `Generated strategic proposal with ${completedFiles.length > 0 ? "personalized" : "standard"} negotiation points`,
              sources: ["legal_templates", "industry_standards", ...fileNames],
              timestamp: new Date().toISOString(),
              data: {
                documents_created: 3,
                clauses_suggested: 12,
                file_context_used: completedFiles.length > 0,
                personalization_level: completedFiles.length > 0 ? "high" : "standard",
              },
            },
          ]
        case "crawler":
          return [
            ...baseFileProcessingSteps,
            {
              agent: "opportunity_radar",
              status: "running",
              message: `Scanning NIL registries and brand databases ${completedFiles.length > 0 ? "for talent-specific opportunities" : "for market opportunities"}...`,
              sources: ["nil_registry", "sec_filings", "press_releases", ...fileNames],
              timestamp: new Date().toISOString(),
            },
            {
              agent: "campaign_detector",
              status: "running",
              message: `Detecting active brand campaigns ${completedFiles.length > 0 ? "matching uploaded talent profile" : "in target market"}`,
              sources: ["social_media", "brand_websites", "industry_news", ...fileNames],
              timestamp: new Date().toISOString(),
            },
            {
              agent: "pr_scanner",
              status: "completed",
              message: `Found 24 new opportunities ${completedFiles.length > 0 ? "tailored to uploaded talent data" : "in market"} with 78% avg sentiment`,
              sources: ["media_monitoring", "brand_sentiment", ...fileNames],
              timestamp: new Date().toISOString(),
              data: {
                opportunities_found: 24,
                avg_sentiment: 0.78,
                personalized: completedFiles.length > 0,
                talent_match_score: completedFiles.length > 0 ? 0.89 : 0.65,
              },
            },
          ]
        case "gameplan":
          return [
            ...baseFileProcessingSteps,
            {
              agent: "brand_strategy",
              status: "running",
              message: `Analyzing brand campaign objectives ${completedFiles.length > 0 ? "and talent fit from uploaded files" : "with available data"}...`,
              sources: ["brand_profile", "campaign_goals", ...fileNames],
              timestamp: new Date().toISOString(),
            },
            {
              agent: "match_engine",
              status: "running",
              message: `Matching brands to optimal sponsorship opportunities ${completedFiles.length > 0 ? "using talent-specific parameters" : "with market data"}`,
              sources: ["venue_inventory", "audience_data", "pricing_models", ...fileNames],
              timestamp: new Date().toISOString(),
            },
            {
              agent: "roi_simulator",
              status: "completed",
              message: `Generated 8 partnership packages ${completedFiles.length > 0 ? "optimized for talent profile" : "with standard ROI projections"}`,
              sources: ["historical_performance", "market_rates", ...fileNames],
              timestamp: new Date().toISOString(),
              data: {
                packages_created: 8,
                avg_roi: completedFiles.length > 0 ? 3.4 : 2.8,
                talent_optimized: completedFiles.length > 0,
                confidence_level: completedFiles.length > 0 ? 0.92 : 0.76,
              },
            },
          ]
        case "simulation":
          return [
            ...baseFileProcessingSteps,
            {
              agent: "simulation_planner",
              status: "running",
              message: `Setting up forecasting models ${completedFiles.length > 0 ? "with uploaded talent data" : "with available metrics"}...`,
              sources: ["historical_data", "market_trends", ...fileNames],
              timestamp: new Date().toISOString(),
            },
            {
              agent: "revenue_forecaster",
              status: "running",
              message: `Running Monte Carlo simulations ${completedFiles.length > 0 ? "using talent-specific parameters" : "with market averages"}`,
              sources: ["performance_data", "market_volatility", ...fileNames],
              timestamp: new Date().toISOString(),
            },
            {
              agent: "media_effectiveness",
              status: "completed",
              message: `Completed 1000 scenario simulations ${completedFiles.length > 0 ? "using talent-specific parameters" : "with confidence intervals"}`,
              sources: ["engagement_models", "conversion_rates", ...fileNames],
              timestamp: new Date().toISOString(),
              data: {
                scenarios_run: 1000,
                confidence_level: completedFiles.length > 0 ? 0.95 : 0.82,
                personalized: completedFiles.length > 0,
                expected_roi_range: completedFiles.length > 0 ? "2.8x - 4.2x" : "1.9x - 3.1x",
              },
            },
          ]
        default:
          return [
            ...baseFileProcessingSteps,
            {
              agent: "profile_analyzer",
              status: "running",
              message: `Analyzing talent profile ${completedFiles.length > 0 ? "from uploaded files" : "and performance metrics"}`,
              sources: completedFiles.length > 0 ? fileNames : ["talent_profile"],
              timestamp: new Date().toISOString(),
            },
            {
              agent: "deal_matcher",
              status: "completed",
              message: `Found 12 high-value brand deals ${completedFiles.length > 0 ? "matching uploaded talent profile" : "in market"}`,
              sources: ["nike_partnership", "gatorade_campaign", "under_armour_deal", ...fileNames],
              timestamp: new Date().toISOString(),
              data: {
                deals_found: 12,
                avg_score: completedFiles.length > 0 ? 8.7 : 7.2,
                file_context_used: completedFiles.length > 0,
                personalization_level: completedFiles.length > 0 ? "high" : "standard",
              },
            },
          ]
      }
    }

    const mockSteps = getToolSpecificSteps(activeTool)

    for (let i = 0; i < mockSteps.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const step: AgentStep = {
        ...mockSteps[i],
        id: `step-${Date.now()}-${i}`,
        expanded: false,
      }

      setMessages((prev) => {
        const newMessages = [...prev]
        if (i > 0 && newMessages[newMessages.length - 1]) {
          const lastIndex = newMessages.length - 1
          if (newMessages[lastIndex].agent !== "user") {
            newMessages[lastIndex] = { ...newMessages[lastIndex], status: "completed", expanded: true }
          }
        }
        return [...newMessages, step]
      })
    }

    // Complete the final step
    setMessages((prev) => {
      const newMessages = [...prev]
      if (newMessages.length > 0) {
        const lastIndex = newMessages.length - 1
        if (newMessages[lastIndex].agent !== "user") {
          newMessages[lastIndex] = {
            ...newMessages[lastIndex],
            status: "completed",
            expanded: true,
          }
        }
      }
      return newMessages
    })

    setIsStreaming(false)
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
      case "prompt_interpreter":
        return <FileText className="w-4 h-4" />
      case "profile_analyzer":
      case "brand_strategist":
      case "brand_strategy":
        return <Database className="w-4 h-4" />
      case "deal_matcher":
      case "opportunity_radar":
      case "campaign_detector":
        return <Globe className="w-4 h-4" />
      case "contract_composer":
      case "outreach_composer":
        return <MessageSquare className="w-4 h-4" />
      case "match_engine":
      case "marketplace_composer":
        return <Gamepad2 className="w-4 h-4" />
      case "simulation_planner":
      case "revenue_forecaster":
      case "roi_simulator":
        return <Play className="w-4 h-4" />
      default:
        return <div className="w-4 h-4 bg-primary rounded-full" />
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
              <h2 className="text-2xl font-semibold mb-2">{toolConfig.title}</h2>
              <p className="text-muted-foreground mb-6">{toolConfig.subtitle}</p>

              <div className="mb-6 p-4 bg-secondary/30 rounded-lg border max-w-2xl mx-auto">
                <p className="text-sm font-medium mb-3">Active AI Agents:</p>
                <div className="grid grid-cols-2 gap-2">
                  {toolConfig.agents.map((agent, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-background/50 rounded text-left">
                      {getAgentIcon(agent.name)}
                      <div>
                        <p className="text-xs font-medium capitalize">{agent.name.replace("_", " ")}</p>
                        <p className="text-xs text-muted-foreground">{agent.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {files.filter((f) => f.status === "completed").length > 0 && (
                <div className="mb-4 p-3 bg-green-500/10 rounded-lg border border-green-500/20 max-w-md mx-auto">
                  <p className="text-sm text-green-700 dark:text-green-400 font-medium">
                    ✓ Ready to analyze {files.filter((f) => f.status === "completed").length} uploaded files
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-500 mt-1">
                    File context will enhance all AI agent responses
                  </p>
                </div>
              )}

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
                      {message.data?.file_context_used && (
                        <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600 border-green-500/20">
                          📁 Using file context
                        </Badge>
                      )}
                      {message.data?.personalized && (
                        <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-600 border-blue-500/20">
                          🎯 Personalized
                        </Badge>
                      )}
                      {message.data?.confidence_level && (
                        <Badge
                          variant="outline"
                          className="text-xs bg-purple-500/10 text-purple-600 border-purple-500/20"
                        >
                          {Math.round(message.data.confidence_level * 100)}% confidence
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
        <form onSubmit={simulateStreaming} className="max-w-4xl mx-auto">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask ${toolConfig.title.replace(" Terminal", "")} about talent opportunities...`}
              className="flex-1"
              disabled={isStreaming}
            />
            <Button type="submit" disabled={isStreaming || !input.trim()}>
              {isStreaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>

          <div className="flex items-center justify-center mt-2">
            <Badge variant="outline" className="text-xs">
              Mock Mode - Using simulated data
            </Badge>
          </div>
        </form>
      </div>
    </div>
  )
}
