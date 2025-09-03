"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import {
  BarChart3,
  CalendarIcon,
  Eye,
  Filter,
  Mail,
  Plus,
  Target,
  CheckCircle,
  XCircle,
  ArrowRight,
  FileSpreadsheet,
  Bell,
  MessageSquare,
} from "lucide-react"
import { useState, useMemo } from "react"
import { format } from "date-fns"
import type { Deal } from "@/types/deal"
import type { TalentProfile } from "./talent-profile-manager"

interface PipelineStage {
  id: string
  name: string
  color: string
  icon: React.ReactNode
  description: string
}

interface DealActivity {
  id: string
  dealId: string
  type: "email_sent" | "email_opened" | "email_replied" | "status_changed" | "note_added" | "follow_up_scheduled"
  description: string
  timestamp: string
  metadata?: any
}

interface FollowUpTask {
  id: string
  dealId: string
  type: "email" | "call" | "meeting" | "reminder"
  title: string
  description: string
  dueDate: string
  status: "pending" | "completed" | "overdue"
  priority: "low" | "medium" | "high"
}

interface PipelineAnalytics {
  totalDeals: number
  totalValue: number
  avgDealValue: number
  conversionRate: number
  avgTimeToClose: number
  stageDistribution: { [key: string]: number }
  monthlyTrends: { month: string; deals: number; value: number }[]
  topPerformingCategories: { category: string; deals: number; value: number }[]
}

interface PipelineManagementProps {
  deals: Deal[]
  talent?: TalentProfile
  onDealUpdate: (dealId: string, updates: Partial<Deal>) => void
  onExportPipeline: () => void
}

const pipelineStages: PipelineStage[] = [
  {
    id: "new",
    name: "New",
    color: "bg-blue-500",
    icon: <Target className="w-4 h-4" />,
    description: "Newly discovered opportunities",
  },
  {
    id: "contacted",
    name: "Contacted",
    color: "bg-yellow-500",
    icon: <Mail className="w-4 h-4" />,
    description: "Initial outreach sent",
  },
  {
    id: "negotiating",
    name: "Negotiating",
    color: "bg-orange-500",
    icon: <MessageSquare className="w-4 h-4" />,
    description: "In active discussions",
  },
  {
    id: "closed",
    name: "Closed",
    color: "bg-green-500",
    icon: <CheckCircle className="w-4 h-4" />,
    description: "Deal completed successfully",
  },
  {
    id: "rejected",
    name: "Rejected",
    color: "bg-red-500",
    icon: <XCircle className="w-4 h-4" />,
    description: "Opportunity declined",
  },
]

export function PipelineManagementDashboard({
  deals,
  talent,
  onDealUpdate,
  onExportPipeline,
}: PipelineManagementProps) {
  const [activeTab, setActiveTab] = useState("pipeline")
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)
  const [showDealModal, setShowDealModal] = useState(false)
  const [showFollowUpModal, setShowFollowUpModal] = useState(false)
  const [filterStage, setFilterStage] = useState<string>("all")
  const [sortBy, setSortBy] = useState<"date" | "value" | "score">("date")

  // Mock data for activities and follow-ups
  const [activities] = useState<DealActivity[]>([
    {
      id: "1",
      dealId: "deal-1",
      type: "email_sent",
      description: "Initial outreach email sent to Nike partnership team",
      timestamp: "2024-01-15T10:30:00Z",
    },
    {
      id: "2",
      dealId: "deal-1",
      type: "email_opened",
      description: "Email opened by Sarah Johnson",
      timestamp: "2024-01-15T14:22:00Z",
    },
    {
      id: "3",
      dealId: "deal-2",
      type: "status_changed",
      description: "Status changed from New to Contacted",
      timestamp: "2024-01-14T16:45:00Z",
    },
  ])

  const [followUpTasks, setFollowUpTasks] = useState<FollowUpTask[]>([
    {
      id: "1",
      dealId: "deal-1",
      type: "email",
      title: "Follow up on Nike partnership",
      description: "Send follow-up email with additional performance metrics",
      dueDate: "2024-01-20",
      status: "pending",
      priority: "high",
    },
    {
      id: "2",
      dealId: "deal-2",
      type: "call",
      title: "Schedule call with Gatorade team",
      description: "Discuss campaign timeline and deliverables",
      dueDate: "2024-01-18",
      status: "pending",
      priority: "medium",
    },
  ])

  // Calculate analytics
  const analytics: PipelineAnalytics = useMemo(() => {
    const totalDeals = deals.length
    const totalValue = deals.reduce((sum, deal) => {
      const value = Number.parseInt(deal.valueRange.replace(/[^0-9]/g, "")) || 0
      return sum + value
    }, 0)
    const avgDealValue = totalDeals > 0 ? totalValue / totalDeals : 0

    const closedDeals = deals.filter((d) => d.status === "closed").length
    const conversionRate = totalDeals > 0 ? (closedDeals / totalDeals) * 100 : 0

    const stageDistribution = deals.reduce(
      (acc, deal) => {
        acc[deal.status || "new"] = (acc[deal.status || "new"] || 0) + 1
        return acc
      },
      {} as { [key: string]: number },
    )

    const categoryPerformance = deals.reduce(
      (acc, deal) => {
        if (!acc[deal.category]) {
          acc[deal.category] = { deals: 0, value: 0 }
        }
        acc[deal.category].deals += 1
        acc[deal.category].value += Number.parseInt(deal.valueRange.replace(/[^0-9]/g, "")) || 0
        return acc
      },
      {} as { [key: string]: { deals: number; value: number } },
    )

    const topPerformingCategories = Object.entries(categoryPerformance)
      .map(([category, data]) => ({ category, ...data }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)

    return {
      totalDeals,
      totalValue,
      avgDealValue,
      conversionRate,
      avgTimeToClose: 14, // Mock data
      stageDistribution,
      monthlyTrends: [], // Mock data
      topPerformingCategories,
    }
  }, [deals])

  // Filter and sort deals
  const filteredDeals = useMemo(() => {
    let filtered = [...deals]

    if (filterStage !== "all") {
      filtered = filtered.filter((deal) => (deal.status || "new") === filterStage)
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "value":
          const aValue = Number.parseInt(a.valueRange.replace(/[^0-9]/g, "")) || 0
          const bValue = Number.parseInt(b.valueRange.replace(/[^0-9]/g, "")) || 0
          return bValue - aValue
        case "score":
          return b.matchScore - a.matchScore
        case "date":
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })

    return filtered
  }, [deals, filterStage, sortBy])

  const updateDealStatus = (dealId: string, newStatus: string) => {
    onDealUpdate(dealId, { status: newStatus as Deal["status"] })
  }

  const addFollowUpTask = (task: Omit<FollowUpTask, "id">) => {
    const newTask: FollowUpTask = {
      ...task,
      id: `task-${Date.now()}`,
    }
    setFollowUpTasks((prev) => [...prev, newTask])
  }

  const completeFollowUpTask = (taskId: string) => {
    setFollowUpTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, status: "completed" } : task)))
  }

  const getStageInfo = (stageId: string) => {
    return pipelineStages.find((stage) => stage.id === stageId) || pipelineStages[0]
  }

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`
    return `$${value}`
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-500"
      case "medium":
        return "text-yellow-500"
      case "low":
        return "text-green-500"
      default:
        return "text-gray-500"
    }
  }

  const overdueTasks = followUpTasks.filter((task) => task.status === "pending" && new Date(task.dueDate) < new Date())

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Pipeline Management</h2>
          <p className="text-muted-foreground">Track deals, manage follow-ups, and analyze performance</p>
        </div>
        <div className="flex items-center gap-2">
          {overdueTasks.length > 0 && (
            <Badge variant="destructive" className="gap-1">
              <Bell className="w-3 h-3" />
              {overdueTasks.length} overdue
            </Badge>
          )}
          <Button onClick={onExportPipeline} className="gap-2">
            <FileSpreadsheet className="w-4 h-4" />
            Export Pipeline
          </Button>
        </div>
      </div>

      {/* Analytics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-primary">{analytics.totalDeals}</div>
          <p className="text-sm text-muted-foreground">Total Deals</p>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-green-500">{formatCurrency(analytics.totalValue)}</div>
          <p className="text-sm text-muted-foreground">Pipeline Value</p>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-500">{formatCurrency(analytics.avgDealValue)}</div>
          <p className="text-sm text-muted-foreground">Avg Deal Value</p>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-purple-500">{analytics.conversionRate.toFixed(1)}%</div>
          <p className="text-sm text-muted-foreground">Conversion Rate</p>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-orange-500">{analytics.avgTimeToClose}d</div>
          <p className="text-sm text-muted-foreground">Avg Time to Close</p>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pipeline">Pipeline View</TabsTrigger>
          <TabsTrigger value="tasks">
            Follow-ups ({followUpTasks.filter((t) => t.status === "pending").length})
          </TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="activity">Activity Feed</TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline" className="space-y-4">
          {/* Filters */}
          <Card className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium">Filters:</span>
              </div>

              <Select value={filterStage} onValueChange={setFilterStage}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Stages" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stages</SelectItem>
                  {pipelineStages.map((stage) => (
                    <SelectItem key={stage.id} value={stage.id}>
                      {stage.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date Created</SelectItem>
                  <SelectItem value="value">Deal Value</SelectItem>
                  <SelectItem value="score">Match Score</SelectItem>
                </SelectContent>
              </Select>

              <div className="ml-auto text-sm text-muted-foreground">
                {filteredDeals.length} of {deals.length} deals
              </div>
            </div>
          </Card>

          {/* Pipeline Stages */}
          <div className="grid grid-cols-5 gap-4">
            {pipelineStages.map((stage) => {
              const stageDeals = filteredDeals.filter((deal) => (deal.status || "new") === stage.id)
              const stageValue = stageDeals.reduce((sum, deal) => {
                return sum + (Number.parseInt(deal.valueRange.replace(/[^0-9]/g, "")) || 0)
              }, 0)

              return (
                <Card key={stage.id} className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                    <h3 className="font-semibold text-sm">{stage.name}</h3>
                    <Badge variant="secondary" className="ml-auto">
                      {stageDeals.length}
                    </Badge>
                  </div>

                  <div className="text-xs text-muted-foreground mb-3">{formatCurrency(stageValue)} total value</div>

                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {stageDeals.map((deal) => (
                      <Card
                        key={deal.id}
                        className="p-3 cursor-pointer hover:shadow-sm transition-shadow"
                        onClick={() => {
                          setSelectedDeal(deal)
                          setShowDealModal(true)
                        }}
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <h4 className="font-medium text-sm">{deal.brand}</h4>
                            <Badge variant="outline" className="text-xs">
                              {deal.matchScore}
                            </Badge>
                          </div>

                          <p className="text-xs text-muted-foreground line-clamp-2">{deal.title}</p>

                          <div className="flex items-center justify-between text-xs">
                            <span className="text-green-600 font-medium">{deal.valueRange}</span>
                            <span className="text-muted-foreground">{format(new Date(deal.createdAt), "MMM d")}</span>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Follow-up Tasks</h3>
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Add Task
            </Button>
          </div>

          <div className="space-y-3">
            {followUpTasks.map((task) => {
              const deal = deals.find((d) => d.id === task.dealId)
              const isOverdue = task.status === "pending" && new Date(task.dueDate) < new Date()

              return (
                <Card key={task.id} className={`p-4 ${isOverdue ? "border-red-200 bg-red-50/50" : ""}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{task.title}</h4>
                        <Badge variant="outline" className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                        {isOverdue && (
                          <Badge variant="destructive" className="text-xs">
                            Overdue
                          </Badge>
                        )}
                      </div>

                      <p className="text-sm text-muted-foreground mb-2">{task.description}</p>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Deal: {deal?.brand}</span>
                        <span>Due: {format(new Date(task.dueDate), "MMM d, yyyy")}</span>
                        <span>Type: {task.type}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {task.status === "pending" && (
                        <Button size="sm" onClick={() => completeFollowUpTask(task.id)} className="gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Complete
                        </Button>
                      )}
                      {task.status === "completed" && (
                        <Badge variant="default" className="gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Done
                        </Badge>
                      )}
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Stage Distribution */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Pipeline Distribution
            </h3>
            <div className="space-y-3">
              {pipelineStages.map((stage) => {
                const count = analytics.stageDistribution[stage.id] || 0
                const percentage = analytics.totalDeals > 0 ? (count / analytics.totalDeals) * 100 : 0

                return (
                  <div key={stage.id} className="flex items-center gap-3">
                    <div className="flex items-center gap-2 w-24">
                      <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                      <span className="text-sm">{stage.name}</span>
                    </div>
                    <div className="flex-1">
                      <Progress value={percentage} className="h-2" />
                    </div>
                    <div className="w-16 text-sm text-right">
                      {count} ({percentage.toFixed(0)}%)
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>

          {/* Top Categories */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Top Performing Categories</h3>
            <div className="space-y-3">
              {analytics.topPerformingCategories.map((category, index) => (
                <div key={category.category} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </div>
                    <span className="font-medium">{category.category}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatCurrency(category.value)}</div>
                    <div className="text-xs text-muted-foreground">{category.deals} deals</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <h3 className="font-semibold">Recent Activity</h3>

          <div className="space-y-3">
            {activities.map((activity) => {
              const deal = deals.find((d) => d.id === activity.dealId)

              return (
                <Card key={activity.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {activity.type === "email_sent" && <Mail className="w-4 h-4 text-blue-500" />}
                      {activity.type === "email_opened" && <Eye className="w-4 h-4 text-green-500" />}
                      {activity.type === "email_replied" && <MessageSquare className="w-4 h-4 text-purple-500" />}
                      {activity.type === "status_changed" && <ArrowRight className="w-4 h-4 text-orange-500" />}
                    </div>

                    <div className="flex-1">
                      <p className="text-sm">{activity.description}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <span>Deal: {deal?.brand}</span>
                        <span>•</span>
                        <span>{format(new Date(activity.timestamp), "MMM d, h:mm a")}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Deal Details Modal */}
      <Dialog open={showDealModal} onOpenChange={setShowDealModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Deal Management - {selectedDeal?.brand}</DialogTitle>
          </DialogHeader>

          {selectedDeal && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Current Status</Label>
                  <Select
                    value={selectedDeal.status || "new"}
                    onValueChange={(value) => updateDealStatus(selectedDeal.id, value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {pipelineStages.map((stage) => (
                        <SelectItem key={stage.id} value={stage.id}>
                          {stage.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Priority</Label>
                  <Select defaultValue="medium">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Notes</Label>
                <Textarea placeholder="Add notes about this deal..." className="min-h-24" />
              </div>

              <div className="flex gap-2">
                <Button className="gap-2">
                  <Mail className="w-4 h-4" />
                  Send Follow-up
                </Button>
                <Button variant="outline" className="gap-2 bg-transparent">
                  <CalendarIcon className="w-4 h-4" />
                  Schedule Task
                </Button>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDealModal(false)}>
              Close
            </Button>
            <Button>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
