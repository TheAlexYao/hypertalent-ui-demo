"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, User, Star, TrendingUp } from "lucide-react"
import { useState } from "react"

export interface TalentProfile {
  id: string
  name: string
  category: string
  avatar?: string
  stats: {
    followers: number
    engagement: number
    deals: number
  }
  status: "active" | "inactive"
}

interface TalentSelectorProps {
  selectedTalent?: TalentProfile
  onTalentChange: (talent: TalentProfile) => void
  onCreateNew: () => void
}

const mockTalents: TalentProfile[] = [
  {
    id: "talent-1",
    name: "John Doe",
    category: "Professional Athlete",
    stats: { followers: 125000, engagement: 4.2, deals: 8 },
    status: "active",
  },
  {
    id: "talent-2",
    name: "Sarah Johnson",
    category: "Fitness Influencer",
    stats: { followers: 89000, engagement: 6.1, deals: 12 },
    status: "active",
  },
  {
    id: "talent-3",
    name: "Mike Chen",
    category: "Gaming Creator",
    stats: { followers: 234000, engagement: 3.8, deals: 5 },
    status: "active",
  },
]

export function TalentSelector({ selectedTalent, onTalentChange, onCreateNew }: TalentSelectorProps) {
  const [isCreating, setIsCreating] = useState(false)

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const handleTalentSelect = (talentId: string) => {
    const talent = mockTalents.find((t) => t.id === talentId)
    if (talent) {
      onTalentChange(talent)
    }
  }

  const handleCreateNew = () => {
    setIsCreating(true)
    // Simulate creating new talent profile
    setTimeout(() => {
      const newTalent: TalentProfile = {
        id: `talent-${Date.now()}`,
        name: "New Talent",
        category: "Uncategorized",
        stats: { followers: 0, engagement: 0, deals: 0 },
        status: "active",
      }
      onTalentChange(newTalent)
      setIsCreating(false)
    }, 1000)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Selected Talent</h4>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCreateNew}
          disabled={isCreating}
          className="gap-1 bg-transparent"
        >
          <Plus className="w-3 h-3" />
          {isCreating ? "Creating..." : "New"}
        </Button>
      </div>

      {/* Talent Selector Dropdown */}
      <Select value={selectedTalent?.id} onValueChange={handleTalentSelect}>
        <SelectTrigger>
          <SelectValue placeholder="Select a talent profile" />
        </SelectTrigger>
        <SelectContent>
          {mockTalents.map((talent) => (
            <SelectItem key={talent.id} value={talent.id}>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center">
                  <User className="w-3 h-3" />
                </div>
                <span>{talent.name}</span>
                <Badge variant="outline" className="text-xs">
                  {talent.category}
                </Badge>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Selected Talent Card */}
      {selectedTalent && (
        <Card className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium">
                {selectedTalent.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </span>
            </div>
            <div className="flex-1">
              <h5 className="font-medium">{selectedTalent.name}</h5>
              <p className="text-xs text-muted-foreground mb-2">{selectedTalent.category}</p>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <User className="w-3 h-3" />
                    <span className="font-medium">{formatNumber(selectedTalent.stats.followers)}</span>
                  </div>
                  <p className="text-muted-foreground">Followers</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <TrendingUp className="w-3 h-3" />
                    <span className="font-medium">{selectedTalent.stats.engagement}%</span>
                  </div>
                  <p className="text-muted-foreground">Engagement</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Star className="w-3 h-3" />
                    <span className="font-medium">{selectedTalent.stats.deals}</span>
                  </div>
                  <p className="text-muted-foreground">Deals</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
