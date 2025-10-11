import { useEffect, useMemo, useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, AlertCircle, Zap, FileSearch, Users, Target, TrendingUp } from "lucide-react"
import type { Deal } from "@/types/deal"

type AgentStatus = "idle" | "running" | "completed" | "error"

interface Agent {
  id: "file_processor" | "profile_analyzer" | "deal_matcher" | "opportunity_scorer"
  name: string
  description: string
  status: AgentStatus
  progress: number
  icon: JSX.Element
  resultSummary?: string[]
  processingTime?: number
}

const agentBlueprints: Omit<Agent, "status" | "progress">[] = [
  {
    id: "file_processor",
    name: "File Processor Agent",
    description: "Analyzes Google Drive documents to extract talent metrics and context",
    icon: <FileSearch className="w-4 h-4" />,
  },
  {
    id: "profile_analyzer",
    name: "Profile Analyzer Agent",
    description: "Synthesizes talent profile data, demographics, and brand alignment",
    icon: <Users className="w-4 h-4" />,
  },
  {
    id: "deal_matcher",
    name: "Deal Matcher Agent",
    description: "Matches talent signals to brand databases with semantic AI search",
    icon: <Target className="w-4 h-4" />,
  },
  {
    id: "opportunity_scorer",
    name: "Opportunity Scorer Agent",
    description: "Ranks opportunities, estimates value range, and prepares insights",
    icon: <TrendingUp className="w-4 h-4" />,
  },
]

const buildInitialAgents = (): Agent[] =>
  agentBlueprints.map((agent) => ({
    ...agent,
    status: "idle" as AgentStatus,
    progress: 0,
  }))

const wait = (ms: number, register: (id: number) => void) =>
  new Promise<void>((resolve) => {
    const timeoutId = window.setTimeout(() => resolve(), ms)
    register(timeoutId)
  })

interface DealHunterDiscoveryTimelineProps {
  status: "idle" | "queued" | "in_progress" | "completed" | "failed"
  startedAt?: string
  completedAt?: string
  deals?: Deal[]
  isPolling?: boolean
  error?: string
}

export function DealHunterDiscoveryTimeline({
  status,
  startedAt,
  completedAt,
  deals = [],
  isPolling = false,
  error,
}: DealHunterDiscoveryTimelineProps) {
  const [agents, setAgents] = useState<Agent[]>(buildInitialAgents())
  const [isAnimating, setIsAnimating] = useState(false)
  const timeoutsRef = useRef<number[]>([])
  const startTimeRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((id) => window.clearTimeout(id))
      timeoutsRef.current = []
    }
  }, [])

  const registerTimeout = (id: number) => {
    timeoutsRef.current.push(id)
  }

  const resetAgents = () => {
    timeoutsRef.current.forEach((id) => window.clearTimeout(id))
    timeoutsRef.current = []
    startTimeRef.current = null
    setAgents(buildInitialAgents())
    setIsAnimating(false)
  }

  useEffect(() => {
    if (status === "idle") {
      resetAgents()
    }
  }, [status])

  useEffect(() => {
    if (!(status === "queued" || status === "in_progress") || isAnimating) {
      return
    }

    let cancelled = false

    const runTimeline = async () => {
      setIsAnimating(true)
      startTimeRef.current = Date.now()
      let currentAgents = buildInitialAgents()
      currentAgents = currentAgents.map((agent, index) =>
        index === 0 ? { ...agent, status: "running", progress: 15 } : agent,
      )
      setAgents(currentAgents)

      const transitionAgent = async (agentIndex: number) => {
        if (cancelled) return
        await wait(1600 + agentIndex * 400, registerTimeout)
        if (cancelled) return
        currentAgents = currentAgents.map((agent, index) => {
          if (index === agentIndex) {
            return { ...agent, status: "completed", progress: 100, processingTime: 1600 + agentIndex * 400 }
          }
          if (index === agentIndex + 1) {
            return { ...agent, status: "running", progress: 20 }
          }
          return agent
        })
        setAgents(currentAgents)
      }

      // Advance through first three agents
      await transitionAgent(0)
      if (cancelled) return
      await transitionAgent(1)
      if (cancelled) return
      // Start deal matcher
      await transitionAgent(2)
      if (cancelled) return

      // Leave final agent running until completion
      setAgents((prev) =>
        prev.map((agent, index) =>
          index === 3 ? { ...agent, status: "running", progress: 70 } : agent,
        ),
      )
    }

    runTimeline().catch((err) => {
      console.error("Failed to run discovery timeline", err)
    })

    return () => {
      cancelled = true
      resetAgents()
    }
  }, [status, isAnimating])

  useEffect(() => {
    if (status !== "completed") return

    timeoutsRef.current.forEach((id) => window.clearTimeout(id))
    timeoutsRef.current = []
    const totalProcessingTime =
      startTimeRef.current !== null ? Date.now() - startTimeRef.current : undefined

    setAgents((prev) =>
      prev.map((agent, index) => {
        if (index < 3) {
          return agent.status === "completed" ? agent : { ...agent, status: "completed", progress: 100 }
        }
        if (agent.id === "opportunity_scorer") {
          return {
            ...agent,
            status: "completed",
            progress: 100,
            processingTime: totalProcessingTime,
          }
        }
        return agent
      }),
    )
    setIsAnimating(false)
  }, [status])

  useEffect(() => {
    if (status !== "failed") return
    timeoutsRef.current.forEach((id) => window.clearTimeout(id))
    timeoutsRef.current = []
    setAgents((prev) =>
      prev.map((agent, index) => {
        if (index === 3 && agent.status !== "completed") {
          return { ...agent, status: "error", progress: agent.progress || 30 }
        }
        if (index < 3 && agent.status === "running") {
          return { ...agent, status: "completed", progress: 100 }
        }
        return agent
      }),
    )
    setIsAnimating(false)
  }, [status])

  const summary = useMemo(() => {
    const totalDeals = deals.length
    const avgMatchScore =
      totalDeals > 0
        ? deals.reduce((sum, deal) => sum + (deal.matchScore || 0), 0) / totalDeals
        : 0
    const durationMs =
      startTimeRef.current && status === "completed" ? Date.now() - startTimeRef.current : undefined

    return {
      totalDeals,
      avgMatchScore,
      totalProcessingTime: durationMs,
    }
  }, [deals, status])

  const renderStatusIcon = (agentStatus: AgentStatus) => {
    switch (agentStatus) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-500" />
      case "running":
        return <Zap className="w-4 h-4 text-blue-500 animate-pulse" />
      default:
        return <div className="w-4 h-4 rounded-full bg-muted" />
    }
  }

  const formattedStatus = status === "in_progress" ? "running" : status

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <div>
            <h4 className="font-medium">Discovery Session</h4>
            {startedAt && (
              <p className="text-xs text-muted-foreground">
                Started {new Date(startedAt).toLocaleTimeString()}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isPolling && status !== "completed" && status !== "failed" && (
              <Badge variant="outline" className="text-xs">
                Polling backend…
              </Badge>
            )}
            <Badge
              variant={status === "completed" ? "default" : status === "failed" ? "destructive" : "secondary"}
              className="text-xs capitalize"
            >
              {formattedStatus.replace("_", " ")}
            </Badge>
          </div>
        </div>

        {status === "completed" && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl font-semibold text-primary">{summary.totalDeals}</div>
              <p className="text-xs text-muted-foreground">Deals Found</p>
            </div>
            <div>
              <div className="text-3xl font-semibold text-primary">{summary.avgMatchScore.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">Average Match Score</p>
            </div>
            <div>
              <div className="text-3xl font-semibold text-primary">
                {completedAt ? new Date(completedAt).toLocaleTimeString() : startTimeRef.current ? `${((Date.now() - startTimeRef.current) / 1000).toFixed(1)}s` : "--"}
              </div>
              <p className="text-xs text-muted-foreground">Completion Time</p>
            </div>
          </div>
        )}

        {status === "failed" && (
          <div className="flex items-center gap-2 text-sm text-destructive mt-2">
            <AlertCircle className="w-4 h-4" />
            {error || "Discovery session failed. Please retry."}
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {agents.map((agent) => (
          <Card key={agent.id} className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">{agent.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-sm">{agent.name}</h5>
                  {renderStatusIcon(agent.status)}
                </div>
                <p className="text-xs text-muted-foreground mb-3">{agent.description}</p>
                {agent.status === "running" && (
                  <div className="space-y-2">
                    <Progress value={Math.max(agent.progress, 15)} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {Math.max(agent.progress, 15).toFixed(0)}% complete
                    </p>
                  </div>
                )}
                {agent.status === "completed" && (
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="w-3 h-3" />
                      <span>Completed</span>
                    </div>
                    {agent.processingTime && (
                      <p className="text-xs">Runtime {(agent.processingTime / 1000).toFixed(1)}s</p>
                    )}
                  </div>
                )}
                {agent.status === "error" && (
                  <div className="flex items-center gap-2 text-xs text-destructive">
                    <AlertCircle className="w-3 h-3" />
                    <span>Encountered an error. Please retry.</span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
