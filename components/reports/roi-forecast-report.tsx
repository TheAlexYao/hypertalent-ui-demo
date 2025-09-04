"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, AreaChart, Area } from "recharts"
import { TrendingUp, DollarSign, Target, AlertCircle, Download } from "lucide-react"

export function ROIForecastReport() {
  // Mock ROI forecast data
  const forecastMetrics = {
    projectedROI: 340,
    confidenceLevel: 87,
    breakEvenMonth: 4,
    totalInvestment: 250000,
    projectedRevenue: 850000,
    riskLevel: "Medium",
  }

  const monthlyProjections = [
    { month: "Jul", investment: 50000, revenue: 15000, roi: -70, confidence: 65 },
    { month: "Aug", investment: 75000, revenue: 35000, roi: -53, confidence: 72 },
    { month: "Sep", investment: 100000, revenue: 68000, roi: -32, confidence: 78 },
    { month: "Oct", investment: 125000, revenue: 115000, roi: -8, confidence: 82 },
    { month: "Nov", investment: 150000, revenue: 180000, roi: 20, confidence: 85 },
    { month: "Dec", investment: 175000, revenue: 265000, roi: 51, confidence: 87 },
    { month: "Jan", investment: 200000, revenue: 375000, roi: 88, confidence: 89 },
    { month: "Feb", investment: 225000, revenue: 510000, roi: 127, confidence: 91 },
    { month: "Mar", investment: 250000, revenue: 680000, roi: 172, confidence: 88 },
    { month: "Apr", investment: 250000, revenue: 850000, roi: 240, confidence: 85 },
  ]

  const scenarioAnalysis = [
    { scenario: "Conservative", roi: 180, probability: 85, revenue: 450000, timeline: 8 },
    { scenario: "Realistic", roi: 340, probability: 70, revenue: 850000, timeline: 6 },
    { scenario: "Optimistic", roi: 520, probability: 45, revenue: 1300000, timeline: 4 },
  ]

  const riskFactors = [
    { factor: "Market Volatility", impact: "High", probability: 35, mitigation: "Diversify partnerships" },
    { factor: "Competition", impact: "Medium", probability: 60, mitigation: "Unique value proposition" },
    { factor: "Economic Downturn", impact: "High", probability: 25, mitigation: "Flexible contracts" },
    { factor: "Platform Changes", impact: "Low", probability: 40, mitigation: "Multi-platform strategy" },
  ]

  const getROIColor = (roi: number) => {
    if (roi >= 200) return "text-green-500"
    if (roi >= 100) return "text-yellow-500"
    if (roi >= 0) return "text-orange-500"
    return "text-red-500"
  }

  const getRiskColor = (impact: string) => {
    switch (impact) {
      case "High":
        return "text-red-500"
      case "Medium":
        return "text-yellow-500"
      case "Low":
        return "text-green-500"
      default:
        return "text-gray-500"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">ROI Forecast Report</h2>
          <p className="text-foreground/70">Revenue projections and investment analysis</p>
        </div>
        <Button className="gap-2">
          <Download className="w-4 h-4" />
          Export Report
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="p-4 text-center">
          <div className={`text-2xl font-bold ${getROIColor(forecastMetrics.projectedROI)}`}>
            {forecastMetrics.projectedROI}%
          </div>
          <p className="text-sm text-foreground/60">Projected ROI</p>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-500">{forecastMetrics.confidenceLevel}%</div>
          <p className="text-sm text-foreground/60">Confidence Level</p>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-green-500">{forecastMetrics.breakEvenMonth}</div>
          <p className="text-sm text-foreground/60">Break-even (months)</p>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-purple-500">
            ${(forecastMetrics.totalInvestment / 1000).toFixed(0)}K
          </div>
          <p className="text-sm text-foreground/60">Total Investment</p>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-cyan-500">
            ${(forecastMetrics.projectedRevenue / 1000).toFixed(0)}K
          </div>
          <p className="text-sm text-foreground/60">Projected Revenue</p>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-orange-500">{forecastMetrics.riskLevel}</div>
          <p className="text-sm text-foreground/60">Risk Level</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly ROI Projections */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Monthly ROI Projections
          </h3>
          <ChartContainer config={{}} className="h-64">
            <LineChart data={monthlyProjections}>
              <XAxis dataKey="month" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line type="monotone" dataKey="roi" stroke="#3b82f6" strokeWidth={2} />
              <Line type="monotone" dataKey="confidence" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" />
            </LineChart>
          </ChartContainer>
        </Card>

        {/* Revenue vs Investment */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Revenue vs Investment Timeline
          </h3>
          <ChartContainer config={{}} className="h-64">
            <AreaChart data={monthlyProjections}>
              <XAxis dataKey="month" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area type="monotone" dataKey="revenue" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
              <Area
                type="monotone"
                dataKey="investment"
                stackId="2"
                stroke="#f59e0b"
                fill="#f59e0b"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ChartContainer>
        </Card>

        {/* Scenario Analysis */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5" />
            Scenario Analysis
          </h3>
          <div className="space-y-4">
            {scenarioAnalysis.map((scenario) => (
              <div key={scenario.scenario} className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{scenario.scenario}</span>
                  <Badge variant={scenario.scenario === "Realistic" ? "default" : "secondary"}>
                    {scenario.probability}% likely
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className={`font-medium ${getROIColor(scenario.roi)}`}>{scenario.roi}% ROI</div>
                    <div className="text-xs text-foreground/60">Return</div>
                  </div>
                  <div>
                    <div className="font-medium">${(scenario.revenue / 1000).toFixed(0)}K</div>
                    <div className="text-xs text-foreground/60">Revenue</div>
                  </div>
                  <div>
                    <div className="font-medium">{scenario.timeline} months</div>
                    <div className="text-xs text-foreground/60">Timeline</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Risk Assessment */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Risk Assessment
          </h3>
          <div className="space-y-4">
            {riskFactors.map((risk) => (
              <div key={risk.factor} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{risk.factor}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={getRiskColor(risk.impact)}>
                      {risk.impact}
                    </Badge>
                    <span className="text-xs text-foreground/60">{risk.probability}%</span>
                  </div>
                </div>
                <Progress value={risk.probability} className="h-2" />
                <p className="text-xs text-foreground/60">{risk.mitigation}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
