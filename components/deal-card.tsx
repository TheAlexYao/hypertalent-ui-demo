"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Star,
  Mail,
  Eye,
  TrendingUp,
  Calendar,
  Building,
  Users,
  MessageCircle,
  Clock,
  CheckCircle2,
} from "lucide-react"
import type { Deal } from "@/types/deal"

interface DealCardProps {
  deal: Deal
  onViewDetails: (deal: Deal) => void
  onGenerateOutreach: (deal: Deal) => void
  linkedStepId?: string
}

export function DealCard({ deal, onViewDetails, onGenerateOutreach, linkedStepId }: DealCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 9) return "text-green-500"
    if (score >= 7) return "text-yellow-500"
    return "text-orange-500"
  }

  const getValueColor = (value: string) => {
    const numValue = Number.parseInt(value.replace(/[^0-9]/g, ""))
    if (numValue >= 100000) return "text-green-500"
    if (numValue >= 50000) return "text-blue-500"
    return "text-gray-500"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "text-blue-500"
      case "contacted":
        return "text-yellow-500"
      case "negotiating":
        return "text-orange-500"
      case "closed":
        return "text-green-500"
      case "rejected":
        return "text-red-500"
      default:
        return "text-gray-500"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "new":
        return <Clock className="w-3 h-3" />
      case "contacted":
        return <Mail className="w-3 h-3" />
      case "negotiating":
        return <MessageCircle className="w-3 h-3" />
      case "closed":
        return <CheckCircle2 className="w-3 h-3" />
      case "rejected":
        return <Clock className="w-3 h-3" />
      default:
        return <Clock className="w-3 h-3" />
    }
  }

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Building className="w-4 h-4 text-muted-foreground" />
            <h5 className="font-semibold text-sm">{deal.brand}</h5>
            {linkedStepId && (
              <Badge variant="outline" className="text-xs">
                Linked
              </Badge>
            )}
            <Badge variant="outline" className={`text-xs gap-1 ${getStatusColor(deal.status || "new")}`}>
              {getStatusIcon(deal.status || "new")}
              {(deal.status || "new").charAt(0).toUpperCase() + (deal.status || "new").slice(1)}
            </Badge>
          </div>
          <h6 className="text-sm text-muted-foreground mb-1">{deal.title}</h6>
          <p className="text-xs text-muted-foreground">{deal.category}</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right">
            <div className="flex items-center gap-1">
              <Star className={`w-4 h-4 fill-current ${getScoreColor(deal.matchScore)}`} />
              <span className={`text-sm font-medium ${getScoreColor(deal.matchScore)}`}>{deal.matchScore}</span>
            </div>
            <p className="text-xs text-muted-foreground">Match</p>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{deal.description}</p>

      {deal.crmData && (
        <div className="mb-3 p-2 bg-secondary/30 rounded-lg">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Users className="w-3 h-3 text-blue-500" />
              <span className="text-muted-foreground">CRM:</span>
              <span className="font-medium">{deal.crmData.accountManager}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">Last Contact:</span>
              <span>
                {deal.crmData.lastContact ? new Date(deal.crmData.lastContact).toLocaleDateString() : "Never"}
              </span>
            </div>
          </div>
          {deal.crmData.nextFollowUp && (
            <div className="flex items-center justify-between text-xs mt-1">
              <span className="text-muted-foreground">Next Follow-up:</span>
              <span className="font-medium text-orange-500">
                {new Date(deal.crmData.nextFollowUp).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Metadata */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Value Range:</span>
          <span className={`font-medium ${getValueColor(deal.valueRange)}`}>{deal.valueRange}</span>
        </div>

        {deal.pipelineData && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Close Probability:</span>
              <span className="font-medium">{deal.pipelineData.probability}%</span>
            </div>
            <Progress value={deal.pipelineData.probability} className="h-1" />
          </div>
        )}

        {deal.deadline && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Deadline:</span>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{new Date(deal.deadline).toLocaleDateString()}</span>
            </div>
          </div>
        )}

        {deal.requirements && deal.requirements.length > 0 && (
          <div className="text-xs">
            <span className="text-muted-foreground">Requirements:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {deal.requirements.slice(0, 2).map((req, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {req}
                </Badge>
              ))}
              {deal.requirements.length > 2 && (
                <Badge variant="secondary" className="text-xs">
                  +{deal.requirements.length - 2} more
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1 mb-3">
        {deal.tags.map((tag) => (
          <Badge key={tag} variant="outline" className="text-xs">
            {tag}
          </Badge>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => onViewDetails(deal)} className="flex-1 gap-1">
          <Eye className="w-3 h-3" />
          Details
        </Button>
        <Button variant="default" size="sm" onClick={() => onGenerateOutreach(deal)} className="flex-1 gap-1">
          <Mail className="w-3 h-3" />
          Outreach
        </Button>
      </div>

      {/* Performance Indicators */}
      {deal.engagement && (
        <div className="mt-2 pt-2 border-t border-border">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Expected Engagement:</span>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-green-500" />
              <span className="text-green-500 font-medium">{deal.engagement}%</span>
            </div>
          </div>
        </div>
      )}

      {deal.emailTracking && (
        <div className="mt-2 pt-2 border-t border-border">
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center">
              <div className="font-medium text-blue-500">{deal.emailTracking.sent}</div>
              <div className="text-muted-foreground">Sent</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-green-500">{deal.emailTracking.opened}</div>
              <div className="text-muted-foreground">Opened</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-purple-500">{deal.emailTracking.replied}</div>
              <div className="text-muted-foreground">Replied</div>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
