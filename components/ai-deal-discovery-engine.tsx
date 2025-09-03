"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Brain, FileSearch, Target, Zap, CheckCircle, AlertCircle, TrendingUp, Users } from "lucide-react"
import { useState } from "react"
import type { Deal } from "@/types/deal"
import type { TalentProfile } from "./talent-profile-manager"

interface AIAgent {
  id: string
  name: string
  description: string
  status: "idle" | "running" | "completed" | "error"
  progress: number
  results?: any
  processingTime?: number
  icon: React.ReactNode
}

interface DiscoverySession {
  id: string
  talentId: string
  query: string
  agents: AIAgent[]
  deals: Deal[]
  totalProcessingTime: number
  status: "running" | "completed" | "error"
  startTime: string
}

interface AIDiscoveryEngineProps {
  selectedTalent?: TalentProfile
  query: string
  onDealsFound: (deals: Deal[]) => void
  onSessionComplete: (session: DiscoverySession) => void
}

// Mock brand database for deal matching
const mockBrandDatabase = [
  {
    brand: "Nike",
    categories: ["Sports", "Fitness", "Lifestyle"],
    dealTypes: ["Endorsement", "Product Placement", "Campaign"],
    budgetRange: "$50K-$500K",
    targetAudience: "Athletes, Fitness Enthusiasts",
    requirements: ["1M+ followers", "Sports content", "High engagement"],
  },
  {
    brand: "Gatorade",
    categories: ["Sports", "Nutrition", "Performance"],
    dealTypes: ["Sponsorship", "Content Creation", "Event Partnership"],
    budgetRange: "$25K-$200K",
    targetAudience: "Athletes, Active Lifestyle",
    requirements: ["Sports background", "Performance content", "500K+ followers"],
  },
  {
    brand: "Patagonia",
    categories: ["Outdoor", "Sustainability", "Adventure"],
    dealTypes: ["Brand Ambassador", "Content Partnership", "Campaign"],
    budgetRange: "$15K-$100K",
    targetAudience: "Outdoor Enthusiasts, Eco-conscious",
    requirements: ["Outdoor content", "Sustainability values", "Authentic storytelling"],
  },
  {
    brand: "Red Bull",
    categories: ["Energy", "Extreme Sports", "Gaming", "Music"],
    dealTypes: ["Sponsorship", "Event Partnership", "Content Creation"],
    budgetRange: "$30K-$300K",
    targetAudience: "Young Adults, Gamers, Athletes",
    requirements: ["High energy content", "Young audience", "Creative content"],
  },
  {
    brand: "Under Armour",
    categories: ["Sports", "Fitness", "Performance"],
    dealTypes: ["Endorsement", "Product Testing", "Campaign"],
    budgetRange: "$40K-$250K",
    targetAudience: "Athletes, Fitness Community",
    requirements: ["Athletic background", "Performance focus", "Training content"],
  },
]

const AIDiscoveryEngine = ({ selectedTalent, query, onDealsFound, onSessionComplete }: AIDiscoveryEngineProps) => {
  const [session, setSession] = useState<DiscoverySession | null>(null)
  const [isRunning, setIsRunning] = useState(false)

  const initializeAgents = (): AIAgent[] => [
    {
      id: "file_processor",
      name: "File Processor Agent",
      description: "Analyzes uploaded documents to extract talent metrics, audience data, and performance indicators",
      status: "idle",
      progress: 0,
      icon: <FileSearch className="w-4 h-4" />,
    },
    {
      id: "profile_analyzer",
      name: "Profile Analyzer Agent",
      description: "Processes talent profile data to identify strengths, audience demographics, and brand alignment",
      status: "idle",
      progress: 0,
      icon: <Users className="w-4 h-4" />,
    },
    {
      id: "deal_matcher",
      name: "Deal Matcher Agent",
      description: "Searches brand partnership database using AI similarity scoring and compatibility analysis",
      status: "idle",
      progress: 0,
      icon: <Target className="w-4 h-4" />,
    },
    {
      id: "opportunity_scorer",
      name: "Opportunity Scorer Agent",
      description: "Ranks and scores deal opportunities based on talent fit, value potential, and success probability",
      status: "idle",
      progress: 0,
      icon: <TrendingUp className="w-4 h-4" />,
    },
  ]

  const calculateMatchScore = (talent: TalentProfile, brand: any): number => {
    let score = 0

    // Category alignment (40% weight)
    const talentCategories = talent.brandAlignment?.categories || []
    const brandCategories = brand.categories || []
    const categoryMatch = brandCategories.some((cat: string) => talentCategories.includes(cat))
    if (categoryMatch) score += 4

    // Follower requirements (30% weight)
    const requirements = brand.requirements || []
    const followerReq = requirements.find((req: string) => req.includes("followers"))
    if (followerReq) {
      const reqNumber = Number.parseInt(followerReq.replace(/\D/g, ""))
      const followerCount = talent.stats?.followers || 0
      if (followerCount >= reqNumber) score += 3
    }

    // Engagement rate (20% weight)
    const engagementRate = talent.stats?.engagement || 0
    if (engagementRate >= 4.0) score += 2
    else if (engagementRate >= 2.0) score += 1

    // Past brand alignment (10% weight)
    const pastBrands = talent.brandAlignment?.pastBrands || []
    const brandAlignment = pastBrands.length > 0 ? 1 : 0
    score += brandAlignment

    return Math.min(score, 10)
  }

  const generateMockDeals = (talent: TalentProfile): Deal[] => {
    return mockBrandDatabase
      .map((brand, index) => {
        const matchScore = calculateMatchScore(talent, brand)
        const baseValue = Number.parseInt(brand.budgetRange.split("-")[0].replace(/\D/g, ""))
        const maxValue = Number.parseInt(brand.budgetRange.split("-")[1].replace(/\D/g, ""))

        const followerCount = talent.stats?.followers || 0
        const engagementRate = talent.stats?.engagement || 0
        const category = talent.category || "Creator"
        const brandCategories = brand.categories || []
        const dealTypes = brand.dealTypes || []
        const requirements = brand.requirements || []

        return {
          id: `deal-${Date.now()}-${index}`,
          brand: brand.brand,
          title: `${dealTypes[0] || "Partnership"} Partnership with ${brand.brand}`,
          category: brandCategories[0] || "General",
          valueRange: brand.budgetRange,
          matchScore,
          description: `Exclusive ${(dealTypes[0] || "partnership").toLowerCase()} opportunity with ${brand.brand}. Perfect for ${category.toLowerCase()}s with strong ${brandCategories.join(", ").toLowerCase()} content.`,
          tags: [...brandCategories, ...dealTypes],
          deadline: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          requirements: requirements,
          engagement: engagementRate,
          reach: `${Math.floor(followerCount * (engagementRate / 100))}`,
          conversions: `${(matchScore * 0.5).toFixed(1)}%`,
          industry: brandCategories[0] || "General",
          companySize: "Enterprise",
          duration: "6 months",
          startDate: new Date(Date.now() + Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          contact: {
            name: `${brand.brand} Partnership Team`,
            email: `partnerships@${brand.brand.toLowerCase().replace(/\s+/g, "")}.com`,
            department: "Brand Partnerships",
          },
          status: "new",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      })
      .sort((a, b) => b.matchScore - a.matchScore)
  }

  const runAgent = async (agentId: string, agents: AIAgent[]): Promise<AIAgent[]> => {
    return new Promise((resolve) => {
      const startTime = Date.now()

      // Update agent to running status
      let updatedAgents = agents.map((agent) =>
        agent.id === agentId ? { ...agent, status: "running" as const, progress: 0 } : agent,
      )
      setSession((prev) => (prev ? { ...prev, agents: updatedAgents } : null))

      // Simulate progress
      const progressInterval = setInterval(() => {
        updatedAgents = updatedAgents.map((agent) => {
          if (agent.id === agentId && agent.status === "running") {
            const newProgress = Math.min(agent.progress + Math.random() * 25, 95)
            return { ...agent, progress: newProgress }
          }
          return agent
        })
        setSession((prev) => (prev ? { ...prev, agents: updatedAgents } : null))
      }, 300)

      // Complete after random time
      setTimeout(
        () => {
          clearInterval(progressInterval)
          const processingTime = Date.now() - startTime

          // Generate results based on agent type
          let results = {}
          switch (agentId) {
            case "file_processor":
              const documentsCount = selectedTalent?.documents?.length || 0
              results = {
                documentsProcessed: documentsCount,
                metricsExtracted: ["follower_count", "engagement_rate", "audience_demographics"],
                dataQuality: "High",
              }
              break
            case "profile_analyzer":
              const demographics = selectedTalent?.demographics || {}
              const brandAlignment = selectedTalent?.brandAlignment || {}
              results = {
                audienceInsights: {
                  primaryAge: demographics.ageRange || "18-34",
                  topInterests: demographics.interests || [],
                  locations: demographics.topLocations || [],
                },
                brandFit: brandAlignment.categories || [],
              }
              break
            case "deal_matcher":
              const deals = selectedTalent ? generateMockDeals(selectedTalent) : []
              results = {
                dealsFound: deals.length,
                avgMatchScore: deals.reduce((sum, deal) => sum + deal.matchScore, 0) / deals.length,
                topBrands: deals.slice(0, 3).map((d) => d.brand),
              }
              break
            case "opportunity_scorer":
              results = {
                dealsScored: mockBrandDatabase.length,
                highValueDeals: 3,
                recommendedActions: ["Focus on top 3 matches", "Prepare custom pitch decks"],
              }
              break
          }

          updatedAgents = updatedAgents.map((agent) =>
            agent.id === agentId
              ? {
                  ...agent,
                  status: "completed" as const,
                  progress: 100,
                  results,
                  processingTime,
                }
              : agent,
          )

          resolve(updatedAgents)
        },
        2000 + Math.random() * 3000,
      )
    })
  }

  const startDiscovery = async () => {
    if (!selectedTalent) return

    setIsRunning(true)
    const sessionId = `session-${Date.now()}`
    const startTime = new Date().toISOString()

    const newSession: DiscoverySession = {
      id: sessionId,
      talentId: selectedTalent.id,
      query,
      agents: initializeAgents(),
      deals: [],
      totalProcessingTime: 0,
      status: "running",
      startTime,
    }

    setSession(newSession)

    try {
      let currentAgents = newSession.agents

      // Run agents sequentially
      for (const agent of currentAgents) {
        currentAgents = await runAgent(agent.id, currentAgents)
        setSession((prev) => (prev ? { ...prev, agents: currentAgents } : null))
      }

      // Generate final deals
      const finalDeals = generateMockDeals(selectedTalent)
      const totalTime = currentAgents.reduce((sum, agent) => sum + (agent.processingTime || 0), 0)

      const completedSession: DiscoverySession = {
        ...newSession,
        agents: currentAgents,
        deals: finalDeals,
        totalProcessingTime: totalTime,
        status: "completed",
      }

      setSession(completedSession)
      onDealsFound(finalDeals)
      onSessionComplete(completedSession)
    } catch (error) {
      console.error("Discovery session error:", error)
      setSession((prev) => (prev ? { ...prev, status: "error" } : null))
    } finally {
      setIsRunning(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI Deal Discovery Engine
          </h3>
          <p className="text-sm text-muted-foreground">
            Multi-agent system for intelligent brand partnership discovery
          </p>
        </div>

        <Button onClick={startDiscovery} disabled={!selectedTalent || isRunning} className="gap-2">
          <Zap className="w-4 h-4" />
          {isRunning ? "Discovering..." : "Start Discovery"}
        </Button>
      </div>

      {!selectedTalent && (
        <Card className="p-6 text-center">
          <Users className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-muted-foreground">Select a talent profile to begin AI-powered deal discovery</p>
        </Card>
      )}

      {session && (
        <div className="space-y-4">
          {/* Session Overview */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-medium">Discovery Session</h4>
                <p className="text-sm text-muted-foreground">
                  Started {new Date(session.startTime).toLocaleTimeString()}
                </p>
              </div>
              <Badge variant={session.status === "completed" ? "default" : "secondary"}>{session.status}</Badge>
            </div>

            {session.status === "completed" && (
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">{session.deals.length}</div>
                  <p className="text-xs text-muted-foreground">Deals Found</p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">
                    {session.deals.length > 0
                      ? (session.deals.reduce((sum, deal) => sum + deal.matchScore, 0) / session.deals.length).toFixed(
                          1,
                        )
                      : "0"}
                  </div>
                  <p className="text-xs text-muted-foreground">Avg Match Score</p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">
                    {(session.totalProcessingTime / 1000).toFixed(1)}s
                  </div>
                  <p className="text-xs text-muted-foreground">Processing Time</p>
                </div>
              </div>
            )}
          </Card>

          {/* AI Agents Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {session.agents.map((agent) => (
              <Card key={agent.id} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">{agent.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-sm">{agent.name}</h5>
                      {getStatusIcon(agent.status)}
                    </div>

                    <p className="text-xs text-muted-foreground mb-3">{agent.description}</p>

                    {agent.status === "running" && (
                      <div className="space-y-2">
                        <Progress value={agent.progress} className="h-2" />
                        <p className="text-xs text-muted-foreground">{agent.progress.toFixed(0)}% complete</p>
                      </div>
                    )}

                    {agent.status === "completed" && agent.results && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs">
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          <span>Completed in {((agent.processingTime || 0) / 1000).toFixed(1)}s</span>
                        </div>

                        {agent.id === "deal_matcher" && agent.results.dealsFound && (
                          <div className="flex items-center gap-2 text-xs">
                            <Target className="w-3 h-3" />
                            <span>{agent.results.dealsFound} deals found</span>
                          </div>
                        )}

                        {agent.id === "file_processor" && agent.results.documentsProcessed && (
                          <div className="flex items-center gap-2 text-xs">
                            <FileSearch className="w-3 h-3" />
                            <span>{agent.results.documentsProcessed} documents processed</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export { AIDiscoveryEngine as AIDealDiscoveryEngine, AIDiscoveryEngine }
