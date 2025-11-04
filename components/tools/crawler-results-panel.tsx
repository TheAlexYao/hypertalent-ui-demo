"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import {
  Globe,
  TrendingUp,
  ExternalLink,
  Filter,
  Activity,
  Eye,
  Brain,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
} from "lucide-react"
import { useState, useEffect } from "react"
import type { TalentProfile } from "../talent-selector"
import type { UploadedFile } from "../file-upload-zone"

interface CrawlerResultsPanelProps {
  selectedTalent?: TalentProfile
  onTalentChange: (talent: TalentProfile) => void
  files: UploadedFile[]
  onFilesChange: (files: UploadedFile[]) => void
}

const mockScanningStatus = {
  isScanning: true,
  currentSource: "NIL Registry",
  progress: 67,
  pagesScanned: 1247,
  newOpportunities: 3,
  estimatedTimeRemaining: "2m 15s",
}

const mockBrandDossiers = [
  {
    id: "dossier-1",
    brand: "Gatorade",
    logo: "/gatorade-logo.jpg",
    industry: "Sports Nutrition",
    marketCap: "$22.4B",
    sentiment: 0.89,
    recentActivity: "Launched new protein line targeting college athletes",
    partnerships: 47,
    avgDealValue: "$125K",
    preferredDemographics: ["College Athletes", "18-24", "High Performance"],
    riskFactors: ["Seasonal spending", "Performance-based contracts"],
    lastUpdated: "2025-01-15T10:30:00Z",
  },
  {
    id: "dossier-2",
    brand: "Under Armour",
    logo: "/under-armour-inspired-logo.png",
    industry: "Athletic Apparel",
    marketCap: "$8.1B",
    sentiment: 0.76,
    recentActivity: "Expanding NIL program for emerging sports",
    partnerships: 23,
    avgDealValue: "$85K",
    preferredDemographics: ["Emerging Sports", "16-22", "Social Media Savvy"],
    riskFactors: ["Brand repositioning", "Competitive market"],
    lastUpdated: "2025-01-15T09:45:00Z",
  },
]

const mockOpportunities = [
  {
    id: "opp-1",
    source: "NIL Registry",
    brand: "Gatorade",
    title: "Hydration Campaign Q2 2025",
    category: "Sports Nutrition",
    sentiment: 0.85,
    urgency: "high",
    deadline: "2025-02-15",
    estimatedValue: "$75K-150K",
    confidence: 0.92,
    sentimentBreakdown: {
      positive: 0.85,
      neutral: 0.12,
      negative: 0.03,
      sources: ["Press releases", "Social media", "Financial reports"],
    },
  },
  {
    id: "opp-2",
    source: "SEC Filing",
    brand: "Under Armour",
    title: "Performance Gear Partnership",
    category: "Athletic Apparel",
    sentiment: 0.78,
    urgency: "medium",
    deadline: "2025-03-01",
    estimatedValue: "$50K-100K",
    confidence: 0.87,
    sentimentBreakdown: {
      positive: 0.78,
      neutral: 0.18,
      negative: 0.04,
      sources: ["Industry reports", "Competitor analysis"],
    },
  },
  {
    id: "opp-3",
    source: "Press Release",
    brand: "Red Bull",
    title: "Extreme Sports Initiative",
    category: "Energy Drinks",
    sentiment: 0.91,
    urgency: "low",
    deadline: "2025-04-15",
    estimatedValue: "$100K-200K",
    confidence: 0.79,
    sentimentBreakdown: {
      positive: 0.91,
      neutral: 0.07,
      negative: 0.02,
      sources: ["Event announcements", "Athlete testimonials"],
    },
  },
]

const mockSources = [
  {
    name: "NIL Registry",
    status: "scanning",
    lastScan: "Live",
    opportunities: 8,
    health: "excellent",
    responseTime: "1.2s",
    successRate: 98.5,
  },
  {
    name: "SEC Filings",
    status: "active",
    lastScan: "2 min ago",
    opportunities: 3,
    health: "good",
    responseTime: "2.8s",
    successRate: 94.2,
  },
  {
    name: "Press Releases",
    status: "active",
    lastScan: "30s ago",
    opportunities: 12,
    health: "excellent",
    responseTime: "0.9s",
    successRate: 99.1,
  },
  {
    name: "Social Media",
    status: "error",
    lastScan: "1 hour ago",
    opportunities: 0,
    health: "poor",
    responseTime: "timeout",
    successRate: 45.3,
  },
]

export function CrawlerResultsPanel({ files }: CrawlerResultsPanelProps) {
  const [activeTab, setActiveTab] = useState<"opportunities" | "sources" | "dossiers">("opportunities")
  const [filterUrgency, setFilterUrgency] = useState<string>("all")
  const [scanProgress, setScanProgress] = useState(mockScanningStatus.progress)

  useEffect(() => {
    if (mockScanningStatus.isScanning) {
      const interval = setInterval(() => {
        setScanProgress((prev) => {
          const newProgress = prev + Math.random() * 3
          return newProgress > 100 ? 100 : newProgress
        })
      }, 2000)
      return () => clearInterval(interval)
    }
  }, [])

  const filteredOpportunities = mockOpportunities.filter(
    (opp) => filterUrgency === "all" || opp.urgency === filterUrgency,
  )

  const getSentimentTone = (sentiment: number) => {
    return "text-[#B240B6]"
  }

  const getConfidenceTone = (confidence: number) => {
    return "text-[#FB8CFF]"
  }

  const getUrgencyBadgeClasses = (urgency: string) => {
    switch (urgency) {
      case "high":
        return "bg-[var(--status-crawler-negative)] text-[var(--status-crawler-negative-foreground)] border-transparent"
      case "medium":
        return "bg-[var(--status-crawler-warning)] text-[var(--status-crawler-warning-foreground)] border-transparent"
      case "low":
        return "bg-[var(--status-crawler-positive)] text-[var(--status-crawler-positive-foreground)] border-transparent"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getHealthColor = (health: string) => {
    switch (health) {
      case "excellent":
        return "text-[var(--status-crawler-positive-foreground)]"
      case "good":
        return "text-[var(--status-medium)]"
      case "poor":
        return "text-[var(--status-crawler-negative-foreground)]"
      default:
        return "text-gray-500"
    }
  }

  const getToggleButtonClasses = (isActive: boolean) =>
    cn(
      "border transition-colors shadow-none hover:border-primary hover:bg-primary hover:text-primary-foreground focus-visible:border-primary focus-visible:ring-primary/40",
      isActive
        ? "bg-white/90 text-black border-white/70"
        : "bg-transparent text-muted-foreground border-white/40",
    )

  return (
    <div className="space-y-5">
      {/* File Context Indicator */}
      {files.length > 0 && (
        <div className="p-3 bg-secondary/50 rounded-lg border">
          <p className="text-xs text-muted-foreground">
            Using context from {files.filter((f) => f.status === "completed").length} uploaded files for targeted
            scanning
          </p>
        </div>
      )}

      <Card className="p-5 border border-border/40 bg-background/60 rounded-2xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center rounded-full bg-blue-500/10 p-2">
              <Activity className="w-4 h-4 text-blue-400" />
            </span>
            <div>
              <h4 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">Live Market Scanning</h4>
              <p className="text-lg font-medium text-foreground">{mockScanningStatus.currentSource}</p>
            </div>
          </div>
          <Badge variant="outline" className="gap-1 text-xs uppercase tracking-wide border-blue-400/40 text-blue-300 bg-blue-500/10">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            Active
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          <div>
            <p className="text-xs text-muted-foreground">Progress</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold text-foreground">{Math.round(scanProgress)}%</span>
              <span className="text-xs text-muted-foreground">complete</span>
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Pages Analyzed</p>
            <span className="text-3xl font-semibold text-foreground">
              {mockScanningStatus.pagesScanned.toLocaleString()}
            </span>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">New Opportunities</p>
            <span className="text-3xl font-semibold text-muted-foreground">
              {mockScanningStatus.newOpportunities}
            </span>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <Progress value={scanProgress} className="h-2.5" />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Real-time stream with intelligent retries</span>
            <span>{mockScanningStatus.newOpportunities} surfaced this pass</span>
          </div>
        </div>
      </Card>

      {/* Enhanced Scan Configuration */}
      <div>
        <h4 className="text-sm font-medium mb-3 uppercase tracking-wide text-muted-foreground">Intelligence Parameters</h4>
        <Card className="p-5 rounded-2xl border border-border/40 bg-background/40 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Active Sources</span>
            <Badge variant="outline" className="border-transparent bg-[var(--status-crawler-positive)] text-[var(--status-crawler-positive-foreground)]">
              {mockSources.filter((s) => s.status === "active" || s.status === "scanning").length}/4
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Scan Frequency</span>
            <span className="text-sm font-medium text-foreground">Real-time + Every 5 minutes</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">AI Sentiment Analysis</span>
            <Badge variant="outline" className="gap-1 border-transparent bg-blue-500/10 text-blue-200">
              <Brain className="w-3 h-3" />
              Enabled
            </Badge>
          </div>
          <Button variant="outline" size="sm" className="w-full gap-2 border-border/60 bg-transparent hover:bg-border/20">
            Configure Intelligence
          </Button>
        </Card>
      </div>

      {/* Enhanced Results Tabs */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium">Market Intelligence</h4>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              className={cn(getToggleButtonClasses(activeTab === "opportunities"), "px-3")}
              onClick={() => setActiveTab("opportunities")}
            >
              Opportunities
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={cn(getToggleButtonClasses(activeTab === "dossiers"), "px-3")}
              onClick={() => setActiveTab("dossiers")}
            >
              Brand Dossiers
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={cn(getToggleButtonClasses(activeTab === "sources"), "px-3")}
              onClick={() => setActiveTab("sources")}
            >
              Sources
            </Button>
          </div>
        </div>

        {activeTab === "opportunities" && (
          <div className="space-y-3">
            {/* Filters */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Button
                variant="outline"
                size="sm"
                className={cn(getToggleButtonClasses(filterUrgency === "all"), "px-3")}
                onClick={() => setFilterUrgency("all")}
              >
                All
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={cn(getToggleButtonClasses(filterUrgency === "high"), "px-3")}
                onClick={() => setFilterUrgency("high")}
              >
                High Priority
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={cn(getToggleButtonClasses(filterUrgency === "medium"), "px-3")}
                onClick={() => setFilterUrgency("medium")}
              >
                Medium
              </Button>
            </div>

            {/* Enhanced Opportunities List */}
            <div className="space-y-2">
              {filteredOpportunities.map((opp) => (
                <Card
                  key={opp.id}
                  className="p-4 sm:p-5 flex flex-col gap-4 rounded-2xl border border-border/40 bg-background/60 transition-transform hover:-translate-y-0.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2">
                      <span className="mt-1 text-muted-foreground">
                        <Globe className="w-4 h-4" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{opp.brand}</p>
                        <p className="text-xs text-muted-foreground">{opp.category}</p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-xs font-medium capitalize ${getUrgencyBadgeClasses(opp.urgency)}`}
                    >
                      {opp.urgency}
                    </Badge>
                  </div>

                  <p className="text-base text-foreground leading-snug">{opp.title}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-[var(--status-crawler-positive)]/20 p-2">
                        <TrendingUp className="w-4 h-4 text-[var(--status-crawler-positive-foreground)]" />
                      </span>
                      <div>
                        <p className="text-xs uppercase text-muted-foreground tracking-wide">Sentiment</p>
                        <span className={`text-3xl font-semibold leading-tight ${getSentimentTone(opp.sentiment)}`}>
                          {Math.round(opp.sentiment * 100)}%
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-muted-foreground tracking-wide">Est. Value</p>
                      <span className="text-3xl font-semibold leading-tight text-foreground">{opp.estimatedValue}</span>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-muted-foreground tracking-wide">Confidence</p>
                      <span className={`text-3xl font-semibold leading-tight ${getConfidenceTone(opp.confidence)}`}>
                        {Math.round(opp.confidence * 100)}%
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Sentiment breakdown</span>
                      <span>{opp.sentimentBreakdown.sources.length} sources</span>
                    </div>
                    <div className="flex h-1.5 overflow-hidden rounded-full">
                      <span
                        className="bg-[#B240B6]"
                        style={{ width: `${opp.sentimentBreakdown.positive * 100}%` }}
                      />
                      <span
                        className="bg-gray-500"
                        style={{ width: `${opp.sentimentBreakdown.neutral * 100}%` }}
                      />
                      <span
                        className="bg-[#FB8CFF]"
                        style={{ width: `${opp.sentimentBreakdown.negative * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="truncate">
                      {opp.source} • {opp.estimatedValue}
                    </span>
                    <span>Due {new Date(opp.deadline).toLocaleDateString()}</span>
                  </div>

                  <Button variant="cta" size="sm" className="mt-auto self-start gap-2">
                    <Eye className="w-3 h-3" />
                    View Brand Dossier
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === "dossiers" && (
          <div className="space-y-2">
            {mockBrandDossiers.map((dossier) => (
              <Card key={dossier.id} className="p-4 sm:p-5 rounded-2xl border border-border/40 bg-background/60 space-y-4">
                <div className="flex items-center gap-3">
                  <img
                    src={dossier.logo || "/placeholder.svg"}
                    alt={`${dossier.brand} logo`}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h5 className="text-sm font-semibold text-foreground">{dossier.brand}</h5>
                      <Badge
                        variant="outline"
                        className="text-xs border-transparent bg-[var(--status-crawler-positive)] text-[var(--status-crawler-positive-foreground)]"
                      >
                        {Math.round(dossier.sentiment * 100)}% positive
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {dossier.industry} • {dossier.marketCap}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="text-muted-foreground uppercase tracking-wide">Partnerships</p>
                    <span className="text-base font-semibold text-foreground">{dossier.partnerships}</span>
                  </div>
                  <div>
                    <p className="text-muted-foreground uppercase tracking-wide">Avg Deal</p>
                    <span className="text-base font-semibold text-foreground">{dossier.avgDealValue}</span>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Recent Activity</p>
                  <p className="text-sm leading-relaxed text-foreground/80">{dossier.recentActivity}</p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Target Demographics</p>
                  <div className="flex flex-wrap gap-2">
                    {dossier.preferredDemographics.map((demo, index) => (
                      <Badge key={index} variant="secondary" className="text-xs bg-secondary/60 border-border/40">
                        {demo}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2 border-border/60 bg-transparent hover:bg-border/20"
                >
                  <ExternalLink className="w-3 h-3" />
                  Full Intelligence Report
                </Button>
              </Card>
            ))}
          </div>
        )}

        {activeTab === "sources" && (
          <div className="space-y-2">
            {mockSources.map((source, index) => (
              <Card
                key={index}
                className="p-4 sm:p-5 rounded-2xl border border-border/40 bg-background/60 flex flex-col gap-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center rounded-full bg-secondary/60 p-2">
                      {source.status === "scanning" && <Zap className="w-4 h-4 text-blue-400 animate-pulse" />}
                      {source.status === "active" && (
                        <CheckCircle className="w-4 h-4 text-[var(--status-crawler-positive-foreground)]" />
                      )}
                      {source.status === "error" && (
                        <AlertCircle className="w-4 h-4 text-[var(--status-crawler-negative-foreground)]" />
                      )}
                      {source.status === "paused" && <Clock className="w-4 h-4 text-muted-foreground" />}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{source.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {source.status === "scanning" ? "Scanning now..." : `Last scan: ${source.lastScan}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-foreground">{source.opportunities}</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Opportunities</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
                  <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                    <span className="flex items-center gap-1">
                      Health:
                      <span className={`${getHealthColor(source.health)} font-medium capitalize`}>
                        {source.health}
                      </span>
                    </span>
                    <span>Response: {source.responseTime}</span>
                  </div>
                  <span className="text-sm font-semibold text-[var(--status-crawler-positive-foreground)]">
                    {source.successRate}% success
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
