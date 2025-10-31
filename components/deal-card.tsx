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
    if (score >= 9) return "text-[var(--status-crawler-positive-foreground)]"
    if (score >= 7) return "text-[var(--status-medium)]"
    return "text-[var(--status-crawler-negative-foreground)]"
  }

  const getValueColor = (value: string) => {
    const numValue = Number.parseInt(value.replace(/[^0-9]/g, ""))
    if (numValue >= 100000) return "text-[var(--status-crawler-positive-foreground)]"
    if (numValue >= 50000) return "text-[var(--status-medium)]"
    return "text-muted-foreground"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "text-blue-400"
      case "contacted":
        return "text-[var(--status-medium)]"
      case "negotiating":
        return "text-[var(--status-medium)]"
      case "closed":
        return "text-[var(--status-crawler-positive-foreground)]"
      case "rejected":
        return "text-[var(--status-crawler-negative-foreground)]"
      default:
        return "text-muted-foreground"
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
    <Card className="flex h-full flex-col gap-4 rounded-2xl border border-border/40 bg-background/60 p-5 shadow-sm transition-transform hover:-translate-y-0.5">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-muted-foreground" />
            <h5 className="text-sm font-semibold text-foreground">{deal.brand}</h5>
            {linkedStepId && (
              <Badge variant="outline" className="text-xs uppercase tracking-wide border-border/50">
                Linked
              </Badge>
            )}
          </div>
          <div>
            <p className="text-base font-medium text-foreground">{deal.title}</p>
            <p className="text-xs text-muted-foreground">{deal.category}</p>
          </div>
          <Badge
            variant="outline"
            className={`inline-flex w-fit items-center gap-1 rounded-full border-transparent bg-secondary/40 px-3 py-1 text-xs font-medium capitalize ${getStatusColor(deal.status || "new")}`}
          >
            {getStatusIcon(deal.status || "new")}
            {(deal.status || "new").charAt(0).toUpperCase() + (deal.status || "new").slice(1)}
          </Badge>
        </div>
        <div className="text-right">
          <div className={`flex items-center justify-end gap-1 ${getScoreColor(deal.matchScore)}`}>
            <Star className="w-5 h-5 fill-current" />
            <span className="text-2xl font-semibold">{deal.matchScore}</span>
          </div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Match Score</p>
        </div>
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{deal.description}</p>

      {deal.crmData && (
        <div className="rounded-xl border border-border/40 bg-secondary/30 p-3 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Users className="w-3 h-3 text-blue-400" />
              <span className="text-muted-foreground">Account Manager</span>
              <span className="font-medium text-foreground">{deal.crmData.accountManager}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span>Last Contact:</span>
              <span>
                {deal.crmData.lastContact ? new Date(deal.crmData.lastContact).toLocaleDateString() : "Never"}
              </span>
            </div>
          </div>
          {deal.crmData.nextFollowUp && (
            <div className="mt-2 flex items-center gap-2 text-muted-foreground">
              <span>Next Follow-up:</span>
              <span className="font-medium text-[var(--status-medium)]">
                {new Date(deal.crmData.nextFollowUp).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <div className="space-y-1">
          <p className="text-xs uppercase text-muted-foreground tracking-wide">Value Range</p>
          <span className={`text-lg font-semibold ${getValueColor(deal.valueRange)}`}>{deal.valueRange}</span>
        </div>
        {deal.deadline && (
          <div className="space-y-1">
            <p className="text-xs uppercase text-muted-foreground tracking-wide">Deadline</p>
            <div className="flex items-center gap-2 text-foreground">
              <Calendar className="w-4 h-4" />
              <span>{new Date(deal.deadline).toLocaleDateString()}</span>
            </div>
          </div>
        )}
        {deal.pipelineData && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs uppercase text-muted-foreground tracking-wide">
              <span>Close Probability</span>
              <span className="text-foreground">{deal.pipelineData.probability}%</span>
            </div>
            <Progress value={deal.pipelineData.probability} className="h-2 rounded-full" />
          </div>
        )}
        {deal.requirements && deal.requirements.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs uppercase text-muted-foreground tracking-wide">Key Requirements</p>
            <div className="flex flex-wrap gap-2">
              {deal.requirements.slice(0, 3).map((req, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs bg-secondary/40 border-border/40">
                  {req}
                </Badge>
              ))}
              {deal.requirements.length > 3 && (
                <Badge variant="secondary" className="text-xs bg-secondary/40 border-border/40">
                  +{deal.requirements.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {deal.tags.map((tag) => (
          <Badge key={tag} variant="outline" className="text-xs rounded-full border-border/40 text-muted-foreground">
            {tag}
          </Badge>
        ))}
      </div>

      <div className="mt-auto space-y-3">
        <div className="flex flex-col sm:flex-row flex-wrap gap-2">
          <Button variant="cta" size="sm" onClick={() => onViewDetails(deal)} className="gap-2">
            <Eye className="w-4 h-4" />
            View Details
          </Button>
          <Button variant="cta" size="sm" onClick={() => onGenerateOutreach(deal)} className="gap-2">
            <Mail className="w-4 h-4" />
            Generate Outreach
          </Button>
        </div>

        {deal.engagement && (
          <div className="rounded-xl border border-border/40 bg-secondary/30 p-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground uppercase tracking-wide">Expected Engagement</span>
              <div className="flex items-center gap-2 text-[var(--status-crawler-positive-foreground)]">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-semibold">{deal.engagement}%</span>
              </div>
            </div>
          </div>
        )}

        {deal.emailTracking && (
          <div className="rounded-xl border border-border/40 bg-secondary/30 p-3 text-xs">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="space-y-1">
                <p className="text-muted-foreground uppercase tracking-wide">Sent</p>
                <span className="text-sm font-semibold text-foreground">{deal.emailTracking.sent}</span>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground uppercase tracking-wide">Opened</p>
                <span className="text-sm font-semibold text-[var(--status-crawler-positive-foreground)]">
                  {deal.emailTracking.opened}
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground uppercase tracking-wide">Replied</p>
                <span className="text-sm font-semibold text-[var(--status-medium)]">
                  {deal.emailTracking.replied}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
