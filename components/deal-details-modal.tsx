"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Star,
  Building,
  Calendar,
  DollarSign,
  TrendingUp,
  Users,
  Mail,
  FileText,
  Phone,
  Clock,
  Target,
  BarChart3,
  Activity,
} from "lucide-react"
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
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            {deal.brand} - {deal.title}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="crm">CRM Integration</TabsTrigger>
            <TabsTrigger value="pipeline">Pipeline Tracking</TabsTrigger>
            <TabsTrigger value="engagement">Email Engagement</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
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
          </TabsContent>

          <TabsContent value="crm" className="space-y-6">
            {deal.crmData ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <Card className="p-4">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Account Management
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Account Manager:</span>
                        <span className="font-medium">{deal.crmData.accountManager}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Deal Stage:</span>
                        <Badge variant="outline">{deal.crmData.dealStage}</Badge>
                      </div>
                      {deal.crmData.assignedTo && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Assigned To:</span>
                          <span>{deal.crmData.assignedTo}</span>
                        </div>
                      )}
                    </div>
                  </Card>

                  <Card className="p-4">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Activity Timeline
                    </h4>
                    <div className="space-y-2 text-sm">
                      {deal.crmData.lastContact && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Last Contact:</span>
                          <span>{new Date(deal.crmData.lastContact).toLocaleDateString()}</span>
                        </div>
                      )}
                      {deal.crmData.nextFollowUp && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Next Follow-up:</span>
                          <span className="font-medium text-orange-500">
                            {new Date(deal.crmData.nextFollowUp).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </Card>
                </div>

                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Contact History
                  </h4>
                  <div className="space-y-2">
                    {deal.crmData.contactHistory.map((contact, index) => (
                      <Card key={index} className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {contact.type === "email" && <Mail className="w-4 h-4 text-blue-500" />}
                            {contact.type === "call" && <Phone className="w-4 h-4 text-green-500" />}
                            {contact.type === "meeting" && <Users className="w-4 h-4 text-purple-500" />}
                            {contact.type === "note" && <FileText className="w-4 h-4 text-gray-500" />}
                            <div>
                              <p className="text-sm font-medium">{contact.subject}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(contact.date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          {contact.outcome && (
                            <Badge variant="outline" className="text-xs">
                              {contact.outcome}
                            </Badge>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <Card className="p-6 text-center">
                <Users className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">No CRM data available for this deal</p>
                <Button variant="outline" className="mt-2 bg-transparent">
                  Connect to CRM
                </Button>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="pipeline" className="space-y-6">
            {deal.pipelineData ? (
              <>
                <div className="grid grid-cols-3 gap-4">
                  <Card className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-500">{deal.pipelineData.probability}%</div>
                    <p className="text-sm text-muted-foreground">Close Probability</p>
                    <Progress value={deal.pipelineData.probability} className="mt-2 h-2" />
                  </Card>

                  <Card className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-500">
                      ${(deal.pipelineData.dealValue / 1000).toFixed(0)}K
                    </div>
                    <p className="text-sm text-muted-foreground">Deal Value</p>
                  </Card>

                  <Card className="p-4 text-center">
                    <div className="text-2xl font-bold text-purple-500">{deal.pipelineData.daysInStage}</div>
                    <p className="text-sm text-muted-foreground">Days in Stage</p>
                  </Card>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Card className="p-4">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Pipeline Status
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Current Stage:</span>
                        <Badge variant="outline">{deal.pipelineData.stage}</Badge>
                      </div>
                      {deal.pipelineData.expectedCloseDate && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Expected Close:</span>
                          <span>{new Date(deal.pipelineData.expectedCloseDate).toLocaleDateString()}</span>
                        </div>
                      )}
                      {deal.pipelineData.lastActivity && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Last Activity:</span>
                          <span>{deal.pipelineData.lastActivity}</span>
                        </div>
                      )}
                    </div>
                  </Card>

                  <Card className="p-4">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Next Actions
                    </h4>
                    <div className="space-y-2 text-sm">
                      {deal.pipelineData.nextAction && (
                        <div className="p-2 bg-secondary/50 rounded">
                          <p className="font-medium">{deal.pipelineData.nextAction}</p>
                        </div>
                      )}
                      <Button variant="outline" size="sm" className="w-full bg-transparent">
                        Schedule Follow-up
                      </Button>
                      <Button variant="outline" size="sm" className="w-full bg-transparent">
                        Update Stage
                      </Button>
                    </div>
                  </Card>
                </div>
              </>
            ) : (
              <Card className="p-6 text-center">
                <BarChart3 className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">No pipeline data available for this deal</p>
                <Button variant="outline" className="mt-2 bg-transparent">
                  Initialize Pipeline Tracking
                </Button>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="engagement" className="space-y-6">
            {deal.emailTracking ? (
              <>
                <div className="grid grid-cols-5 gap-4">
                  <Card className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-500">{deal.emailTracking.sent}</div>
                    <p className="text-sm text-muted-foreground">Emails Sent</p>
                  </Card>

                  <Card className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-500">{deal.emailTracking.opened}</div>
                    <p className="text-sm text-muted-foreground">Opened</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {deal.emailTracking.sent > 0
                        ? Math.round((deal.emailTracking.opened / deal.emailTracking.sent) * 100)
                        : 0}
                      % rate
                    </p>
                  </Card>

                  <Card className="p-4 text-center">
                    <div className="text-2xl font-bold text-purple-500">{deal.emailTracking.clicked}</div>
                    <p className="text-sm text-muted-foreground">Clicked</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {deal.emailTracking.opened > 0
                        ? Math.round((deal.emailTracking.clicked / deal.emailTracking.opened) * 100)
                        : 0}
                      % CTR
                    </p>
                  </Card>

                  <Card className="p-4 text-center">
                    <div className="text-2xl font-bold text-orange-500">{deal.emailTracking.replied}</div>
                    <p className="text-sm text-muted-foreground">Replied</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {deal.emailTracking.sent > 0
                        ? Math.round((deal.emailTracking.replied / deal.emailTracking.sent) * 100)
                        : 0}
                      % rate
                    </p>
                  </Card>

                  <Card className="p-4 text-center">
                    <div className="text-2xl font-bold text-red-500">{deal.emailTracking.bounced}</div>
                    <p className="text-sm text-muted-foreground">Bounced</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {deal.emailTracking.sent > 0
                        ? Math.round((deal.emailTracking.bounced / deal.emailTracking.sent) * 100)
                        : 0}
                      % rate
                    </p>
                  </Card>
                </div>

                <Card className="p-4">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Engagement Score
                  </h4>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Progress value={deal.emailTracking.engagementScore} className="h-3" />
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{deal.emailTracking.engagementScore}/100</div>
                      <p className="text-xs text-muted-foreground">Engagement Score</p>
                    </div>
                  </div>
                  {deal.emailTracking.lastEmailDate && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Last email sent: {new Date(deal.emailTracking.lastEmailDate).toLocaleDateString()}
                    </p>
                  )}
                </Card>

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 bg-transparent">
                    View Email History
                  </Button>
                  <Button variant="outline" className="flex-1 bg-transparent">
                    Schedule Follow-up
                  </Button>
                  <Button className="flex-1">Send Email</Button>
                </div>
              </>
            ) : (
              <Card className="p-6 text-center">
                <Mail className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">No email engagement data available</p>
                <Button variant="outline" className="mt-2 bg-transparent">
                  Start Email Campaign
                </Button>
              </Card>
            )}
          </TabsContent>
        </Tabs>

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
