"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { XAxis, YAxis, LineChart, Line } from "recharts"
import { TrendingUp, Search, Download, Eye } from "lucide-react"

export function MarketIntelligenceReport() {
  // Mock market intelligence data
  const marketOverview = {
    totalBrands: 1247,
    activeCampaigns: 89,
    avgBudget: "$75K",
    growthRate: 23,
    topCategories: ["Sports", "Fashion", "Tech"],
    marketSentiment: 78,
  }

  const industryTrends = [
    { month: "Jan", sports: 45, fashion: 38, tech: 52, lifestyle: 29 },
    { month: "Feb", sports: 52, fashion: 41, tech: 48, lifestyle: 33 },
    { month: "Mar", sports: 48, fashion: 45, tech: 55, lifestyle: 37 },
    { month: "Apr", sports: 58, fashion: 42, tech: 61, lifestyle: 41 },
    { month: "May", sports: 62, fashion: 48, tech: 58, lifestyle: 44 },
    { month: "Jun", sports: 67, fashion: 52, tech: 64, lifestyle: 48 },
  ]

  const competitorAnalysis = [
    { brand: "Nike", campaigns: 23, budget: 2400000, sentiment: 89, growth: 15 },
    { brand: "Adidas", campaigns: 19, budget: 1800000, sentiment: 82, growth: 12 },
    { brand: "Under Armour", campaigns: 14, budget: 950000, sentiment: 76, growth: 8 },
    { brand: "Puma", campaigns: 11, budget: 720000, sentiment: 71, growth: 18 },
    { brand: "New Balance", campaigns: 8, budget: 480000, sentiment: 68, growth: 22 },
  ]

  const emergingOpportunities = [
    { category: "Sustainable Fashion", growth: 45, brands: 67, avgBudget: 85000 },
    { category: "Gaming Peripherals", growth: 38, brands: 34, avgBudget: 120000 },
    { category: "Wellness Tech", growth: 32, brands: 89, avgBudget: 95000 },
    { category: "Plant-Based Foods", growth: 28, brands: 156, avgBudget: 65000 },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Market Intelligence Report</h2>
          <p className="text-foreground/70">Comprehensive market analysis and competitive insights</p>
        </div>
        <Button className="gap-2">
          <Download className="w-4 h-4" />
          Export Report
        </Button>
      </div>

      {/* Market Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-500">{marketOverview.totalBrands}</div>
          <p className="text-sm text-foreground/60">Total Brands</p>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-green-500">{marketOverview.activeCampaigns}</div>
          <p className="text-sm text-foreground/60">Active Campaigns</p>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-purple-500">{marketOverview.avgBudget}</div>
          <p className="text-sm text-foreground/60">Avg Budget</p>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-orange-500">{marketOverview.growthRate}%</div>
          <p className="text-sm text-foreground/60">Growth Rate</p>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-cyan-500">{marketOverview.marketSentiment}%</div>
          <p className="text-sm text-foreground/60">Market Sentiment</p>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-pink-500">{marketOverview.topCategories.length}</div>
          <p className="text-sm text-foreground/60">Top Categories</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Industry Trends */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Industry Campaign Trends
          </h3>
          <ChartContainer config={{}} className="h-64">
            <LineChart data={industryTrends}>
              <XAxis dataKey="month" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line type="monotone" dataKey="sports" stroke="#3b82f6" strokeWidth={2} />
              <Line type="monotone" dataKey="fashion" stroke="#f59e0b" strokeWidth={2} />
              <Line type="monotone" dataKey="tech" stroke="#10b981" strokeWidth={2} />
              <Line type="monotone" dataKey="lifestyle" stroke="#8b5cf6" strokeWidth={2} />
            </LineChart>
          </ChartContainer>
        </Card>

        {/* Emerging Opportunities */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Search className="w-5 h-5" />
            Emerging Opportunities
          </h3>
          <div className="space-y-4">
            {emergingOpportunities.map((opp) => (
              <div key={opp.category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{opp.category}</span>
                  <Badge variant="secondary" className="gap-1">
                    <TrendingUp className="w-3 h-3" />+{opp.growth}%
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-foreground/70">
                  <span>{opp.brands} brands</span>
                  <span>${(opp.avgBudget / 1000).toFixed(0)}K avg</span>
                </div>
                <Progress value={opp.growth} className="h-2" />
              </div>
            ))}
          </div>
        </Card>

        {/* Competitor Analysis */}
        <Card className="p-6 lg:col-span-2">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Competitive Landscape Analysis
          </h3>
          <div className="space-y-3">
            {competitorAnalysis.map((competitor) => (
              <div key={competitor.brand} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="font-medium">{competitor.brand}</div>
                  <Badge variant="outline">{competitor.campaigns} campaigns</Badge>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <div className="font-medium">${(competitor.budget / 1000000).toFixed(1)}M</div>
                    <div className="text-xs text-foreground/60">Budget</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">{competitor.sentiment}%</div>
                    <div className="text-xs text-foreground/60">Sentiment</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-green-500">+{competitor.growth}%</div>
                    <div className="text-xs text-foreground/60">Growth</div>
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
