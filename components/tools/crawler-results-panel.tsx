"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Globe, TrendingUp, ExternalLink, Filter } from "lucide-react"
import { useState } from "react"
import type { TalentProfile } from "../talent-selector"
import type { UploadedFile } from "../file-upload-zone"

interface CrawlerResultsPanelProps {
  selectedTalent?: TalentProfile
  onTalentChange: (talent: TalentProfile) => void
  files: UploadedFile[]
  onFilesChange: (files: UploadedFile[]) => void
}

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
  },
]

const mockSources = [
  { name: "NIL Registry", status: "active", lastScan: "2 min ago", opportunities: 8 },
  { name: "SEC Filings", status: "active", lastScan: "5 min ago", opportunities: 3 },
  { name: "Press Releases", status: "active", lastScan: "1 min ago", opportunities: 12 },
  { name: "Social Media", status: "paused", lastScan: "1 hour ago", opportunities: 0 },
]

export function CrawlerResultsPanel({
  selectedTalent,
  onTalentChange,
  files,
  onFilesChange,
}: CrawlerResultsPanelProps) {
  const [activeTab, setActiveTab] = useState<"opportunities" | "sources">("opportunities")
  const [filterUrgency, setFilterUrgency] = useState<string>("all")

  const filteredOpportunities = mockOpportunities.filter(
    (opp) => filterUrgency === "all" || opp.urgency === filterUrgency,
  )

  const getSentimentColor = (sentiment: number) => {
    if (sentiment >= 0.8) return "text-green-500"
    if (sentiment >= 0.6) return "text-yellow-500"
    return "text-red-500"
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high":
        return "destructive"
      case "medium":
        return "secondary"
      case "low":
        return "outline"
      default:
        return "outline"
    }
  }

  return (
    <div className="space-y-6">
      {/* Scan Configuration */}
      <div>
        <h4 className="text-sm font-medium mb-3">Scan Parameters</h4>
        <Card className="p-3">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Active Sources</span>
              <Badge variant="default">{mockSources.filter((s) => s.status === "active").length}/4</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Scan Frequency</span>
              <span className="text-xs text-muted-foreground">Every 5 minutes</span>
            </div>
            <Button variant="outline" size="sm" className="w-full bg-transparent">
              Configure Sources
            </Button>
          </div>
        </Card>
      </div>

      {/* Results Tabs */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium">Market Intelligence</h4>
          <div className="flex gap-1">
            <Button
              variant={activeTab === "opportunities" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("opportunities")}
            >
              Opportunities
            </Button>
            <Button
              variant={activeTab === "sources" ? "default" : "ghost"}
              size="sm"
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
                variant={filterUrgency === "all" ? "default" : "ghost"}
                size="sm"
                onClick={() => setFilterUrgency("all")}
              >
                All
              </Button>
              <Button
                variant={filterUrgency === "high" ? "default" : "ghost"}
                size="sm"
                onClick={() => setFilterUrgency("high")}
              >
                High Priority
              </Button>
              <Button
                variant={filterUrgency === "medium" ? "default" : "ghost"}
                size="sm"
                onClick={() => setFilterUrgency("medium")}
              >
                Medium
              </Button>
            </div>

            {/* Opportunities List */}
            <div className="space-y-2">
              {filteredOpportunities.map((opp) => (
                <Card key={opp.id} className="p-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{opp.brand}</span>
                        <Badge variant={getUrgencyColor(opp.urgency)} className="text-xs">
                          {opp.urgency}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className={`w-3 h-3 ${getSentimentColor(opp.sentiment)}`} />
                        <span className="text-xs text-muted-foreground">{Math.round(opp.sentiment * 100)}%</span>
                      </div>
                    </div>
                    <p className="text-sm">{opp.title}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {opp.source} • {opp.estimatedValue}
                      </span>
                      <span>Due: {new Date(opp.deadline).toLocaleDateString()}</span>
                    </div>
                    <Button variant="ghost" size="sm" className="w-full gap-2">
                      <ExternalLink className="w-3 h-3" />
                      Generate Dossier
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === "sources" && (
          <div className="space-y-2">
            {mockSources.map((source, index) => (
              <Card key={index} className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-full ${source.status === "active" ? "bg-green-500" : "bg-gray-400"}`}
                    />
                    <div>
                      <p className="text-sm font-medium">{source.name}</p>
                      <p className="text-xs text-muted-foreground">Last scan: {source.lastScan}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{source.opportunities}</p>
                    <p className="text-xs text-muted-foreground">opportunities</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
