"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Star, Building, Calendar, DollarSign, TrendingUp, Users, Mail, FileText } from "lucide-react"
import type { Deal } from "@/types/deal"

interface DealDetailsModalProps {
  deal: Deal | null
  isOpen: boolean
  onClose: () => void
  onGenerateOutreach: (deal: Deal) => void
}

export function DealDetailsModal({ deal, isOpen, onClose, onGenerateOutreach }: DealDetailsModalProps) {
  if (!deal) return null

  const getScoreColor = (score: number) => {
    if (score >= 9) return "text-green-500"
    if (score >= 7) return "text-yellow-500"
    return "text-orange-500"
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            {deal.brand} - {deal.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Overview */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Star className={`w-5 h-5 fill-current ${getScoreColor(deal.matchScore)}`} />
                <span className="font-semibold">Match Score</span>
              </div>
              <div className={`text-2xl font-bold ${getScoreColor(deal.matchScore)}`}>{deal.matchScore}/10</div>
              <p className="text-xs text-muted-foreground mt-1">Based on talent profile and brand alignment</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-green-500" />
                <span className="font-semibold">Value Range</span>
              </div>
              <div className="text-2xl font-bold text-green-500">{deal.valueRange}</div>
              <p className="text-xs text-muted-foreground mt-1">Estimated partnership value</p>
            </Card>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-sm text-muted-foreground">{deal.description}</p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Building className="w-4 h-4" />
                Brand Details
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category:</span>
                  <span>{deal.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Industry:</span>
                  <span>{deal.industry || "Consumer Goods"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Company Size:</span>
                  <span>{deal.companySize || "Large Enterprise"}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Timeline
              </h4>
              <div className="space-y-2 text-sm">
                {deal.deadline && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Deadline:</span>
                    <span>{new Date(deal.deadline).toLocaleDateString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Campaign Duration:</span>
                  <span>{deal.duration || "3-6 months"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Start Date:</span>
                  <span>{deal.startDate || "Flexible"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Requirements */}
          {deal.requirements && deal.requirements.length > 0 && (
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Requirements
              </h4>
              <div className="flex flex-wrap gap-2">
                {deal.requirements.map((req, idx) => (
                  <Badge key={idx} variant="secondary">
                    {req}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Performance Metrics */}
          {deal.engagement && (
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Expected Performance
              </h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-lg font-semibold text-green-500">{deal.engagement}%</div>
                  <p className="text-xs text-muted-foreground">Engagement Rate</p>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-blue-500">{deal.reach || "2.5M"}</div>
                  <p className="text-xs text-muted-foreground">Estimated Reach</p>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-purple-500">{deal.conversions || "3.2%"}</div>
                  <p className="text-xs text-muted-foreground">Conversion Rate</p>
                </div>
              </div>
            </div>
          )}

          {/* Tags */}
          <div>
            <h4 className="font-medium mb-2">Tags</h4>
            <div className="flex flex-wrap gap-2">
              {deal.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Contact Information */}
          {deal.contact && (
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Contact Information
              </h4>
              <div className="bg-secondary/50 p-3 rounded-lg text-sm">
                <div className="flex justify-between mb-1">
                  <span className="text-muted-foreground">Contact:</span>
                  <span>{deal.contact.name || "Brand Manager"}</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-muted-foreground">Email:</span>
                  <span>{deal.contact.email || "partnerships@brand.com"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Department:</span>
                  <span>{deal.contact.department || "Marketing Partnerships"}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={() => onGenerateOutreach(deal)} className="gap-2">
            <Mail className="w-4 h-4" />
            Generate Outreach
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
