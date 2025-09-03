"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, PieChart, Pie, Cell } from "recharts"
import { TrendingUp, Target, Download, Star } from "lucide-react"

interface TalentPerformanceReportProps {
  talentName: string
  timeframe: string
}

export function TalentPerformanceReport({ talentName, timeframe }: TalentPerformanceReportProps) {
  // Mock performance data
  const performanceMetrics = {
    totalDeals: 47,
    avgMatchScore: 8.2,
    totalValue: "$2.4M",
    conversionRate: 34,
    responseRate: 78,
    avgDealSize: "$51K",
  }

  const monthlyTrends = [
    { month: "Jan", deals: 8, value: 420000, score: 7.8 },
    { month: "Feb", deals: 12, value: 580000, score: 8.1 },
    { month: "Mar", deals: 15, value: 720000, score: 8.4 },
    { month: "Apr", deals: 18, value: 890000, score: 8.6 },
    { month: "May", deals: 22, value: 1100000, score: 8.3 },
    { month: "Jun", deals: 25, value: 1350000, score: 8.7 },
  ]

  const categoryPerformance = [
    { category: "Sports", deals: 15, value: 850000, avgScore: 8.9 },
    { category: "Fashion", deals: 12, value: 680000, avgScore: 8.2 },
    { category: "Tech", deals: 10, value: 520000, avgScore: 7.8 },
    { category: "Lifestyle", deals: 8, value: 340000, avgScore: 8.1 },
    { category: "Gaming", deals: 2, value: 50000, avgScore: 7.5 },
  ]

  const dealStageDistribution = [
    { stage: "New", count: 12, color: "#3b82f6" },
    { stage: "Contacted", count: 18, color: "#f59e0b" },
    { stage: "Negotiating", count: 10, color: "#10b981" },
    { stage: "Closed", count: 7, color: "#8b5cf6" },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Talent Performance Report</h2>
          <p className="text-foreground/70">
            {talentName} • {timeframe}
          </p>
        </div>
        <Button className="gap-2">
          <Download className="w-4 h-4" />
          Export Report
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-500">{performanceMetrics.totalDeals}</div>
          <p className="text-sm text-foreground/60">Total Deals</p>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-green-500">{performanceMetrics.avgMatchScore}</div>
          <p className="text-sm text-foreground/60">Avg Match Score</p>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-purple-500">{performanceMetrics.totalValue}</div>
          <p className="text-sm text-foreground/60">Total Value</p>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-orange-500">{performanceMetrics.conversionRate}%</div>
          <p className="text-sm text-foreground/60">Conversion Rate</p>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-cyan-500">{performanceMetrics.responseRate}%</div>
          <p className="text-sm text-foreground/60">Response Rate</p>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-pink-500">{performanceMetrics.avgDealSize}</div>
          <p className="text-sm text-foreground/60">Avg Deal Size</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Monthly Deal Trends
          </h3>
          <ChartContainer config={{}} className="h-64">
            <LineChart data={monthlyTrends}>
              <XAxis dataKey="month" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line type="monotone" dataKey="deals" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ChartContainer>
        </Card>

        {/* Deal Stage Distribution */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5" />
            Deal Stage Distribution
          </h3>
          <ChartContainer config={{}} className="h-64">
            <PieChart>
              <Pie data={dealStageDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="count">
                {dealStageDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
            </PieChart>
          </ChartContainer>
        </Card>

        {/* Category Performance */}
        <Card className="p-6 lg:col-span-2">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Star className="w-5 h-5" />
            Category Performance Analysis
          </h3>
          <div className="space-y-3">
            {categoryPerformance.map((category) => (
              <div key={category.category} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="font-medium">{category.category}</div>
                  <Badge variant="secondary">{category.deals} deals</Badge>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="text-foreground/70">${(category.value / 1000).toFixed(0)}K value</div>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-500" />
                    {category.avgScore}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
