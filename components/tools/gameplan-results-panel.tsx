"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Target, TrendingUp, Building, Users } from "lucide-react"
import { useState } from "react"
import type { TalentProfile } from "../talent-selector"

interface GameplanResultsPanelProps {
  selectedTalent?: TalentProfile
  onTalentChange: (talent: TalentProfile) => void
  files: any[]
  onFilesChange: (files: any[]) => void
}

const mockPackages = [
  {
    id: "pkg-1",
    venue: "MetLife Stadium",
    packageType: "Naming Rights",
    duration: "5 years",
    estimatedROI: 3.2,
    audienceReach: "2.1M",
    demographics: "18-54, Sports Fans",
    price: "$2.5M/year",
    confidence: 0.94,
  },
  {
    id: "pkg-2",
    venue: "Madison Square Garden",
    packageType: "Premium Sponsorship",
    duration: "3 years",
    estimatedROI: 2.8,
    audienceReach: "1.8M",
    demographics: "25-45, Urban Professional",
    price: "$1.2M/year",
    confidence: 0.87,
  },
  {
    id: "pkg-3",
    venue: "Yankee Stadium",
    packageType: "Digital Integration",
    duration: "2 years",
    estimatedROI: 4.1,
    audienceReach: "3.2M",
    demographics: "21-65, Baseball Fans",
    price: "$800K/year",
    confidence: 0.91,
  },
]

const mockCampaignGoals = [
  "Brand Awareness",
  "Lead Generation",
  "Market Penetration",
  "Product Launch",
  "Customer Retention",
]

export function GameplanResultsPanel({
  selectedTalent,
  onTalentChange,
  files,
  onFilesChange,
}: GameplanResultsPanelProps) {
  const [campaignBudget, setCampaignBudget] = useState("")
  const [selectedGoals, setSelectedGoals] = useState<string[]>([])
  const [targetDemographic, setTargetDemographic] = useState("")

  const toggleGoal = (goal: string) => {
    setSelectedGoals((prev) => (prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]))
  }

  const getROIColor = (roi: number) => {
    if (roi >= 3.5) return "text-green-500"
    if (roi >= 2.5) return "text-yellow-500"
    return "text-red-500"
  }

  return (
    <div className="space-y-6">
      {/* Campaign Goals Input */}
      <div>
        <h4 className="text-sm font-medium mb-3">Campaign Configuration</h4>
        <Card className="p-4">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Campaign Budget</label>
              <Input
                placeholder="e.g., $500K - $2M annually"
                value={campaignBudget}
                onChange={(e) => setCampaignBudget(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Target Demographics</label>
              <Input
                placeholder="e.g., 18-34, Sports Enthusiasts, Urban"
                value={targetDemographic}
                onChange={(e) => setTargetDemographic(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Campaign Goals</label>
              <div className="flex flex-wrap gap-2">
                {mockCampaignGoals.map((goal) => (
                  <Button
                    key={goal}
                    variant={selectedGoals.includes(goal) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleGoal(goal)}
                    className="text-xs"
                  >
                    {goal}
                  </Button>
                ))}
              </div>
            </div>

            <Button className="w-full">
              <Target className="w-4 h-4 mr-2" />
              Find Matching Opportunities
            </Button>
          </div>
        </Card>
      </div>

      {/* Partnership Packages */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium">Partnership Packages</h4>
          <Badge variant="outline">{mockPackages.length} matches found</Badge>
        </div>

        <div className="space-y-3">
          {mockPackages.map((pkg) => (
            <Card key={pkg.id} className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{pkg.venue}</span>
                    <Badge variant="secondary" className="text-xs">
                      {pkg.packageType}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{pkg.price}</p>
                    <p className="text-xs text-muted-foreground">{pkg.duration}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <TrendingUp className={`w-4 h-4 ${getROIColor(pkg.estimatedROI)}`} />
                    <span>ROI: {pkg.estimatedROI}x</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span>Reach: {pkg.audienceReach}</span>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground">
                  <p>Demographics: {pkg.demographics}</p>
                  <p>Confidence: {Math.round(pkg.confidence * 100)}%</p>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                    View Details
                  </Button>
                  <Button size="sm" className="flex-1">
                    Generate Proposal
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* ROI Simulator */}
      <div>
        <h4 className="text-sm font-medium mb-3">ROI Simulator</h4>
        <Card className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Projected Annual ROI</span>
              <span className="text-lg font-semibold text-green-500">3.2x</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Break-even Timeline</span>
              <span className="text-sm text-muted-foreground">8 months</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Risk Assessment</span>
              <Badge variant="outline" className="text-xs">
                Low Risk
              </Badge>
            </div>
            <Button variant="outline" size="sm" className="w-full bg-transparent">
              Run Advanced Simulation
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
