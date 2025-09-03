"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Play, BarChart3, TrendingUp, AlertCircle, RefreshCw } from "lucide-react"
import { useState } from "react"
import { TalentSelector, type TalentProfile } from "../talent-selector"

interface SimulationResultsPanelProps {
  selectedTalent?: TalentProfile
  onTalentChange: (talent: TalentProfile) => void
  files: any[]
  onFilesChange: (files: any[]) => void
}

const mockScenarios = [
  {
    id: "scenario-1",
    name: "Exclusive Nike Deal",
    type: "Single Brand",
    duration: "3 years",
    projectedRevenue: "$2.4M",
    confidence: 0.87,
    riskLevel: "Medium",
    outcomes: {
      best: "$3.1M",
      expected: "$2.4M",
      worst: "$1.8M",
    },
  },
  {
    id: "scenario-2",
    name: "Multi-Brand Portfolio",
    type: "Diversified",
    duration: "3 years",
    projectedRevenue: "$3.2M",
    confidence: 0.92,
    riskLevel: "Low",
    outcomes: {
      best: "$4.1M",
      expected: "$3.2M",
      worst: "$2.6M",
    },
  },
  {
    id: "scenario-3",
    name: "Performance-Based Deal",
    type: "Variable",
    duration: "2 years",
    projectedRevenue: "$1.8M",
    confidence: 0.74,
    riskLevel: "High",
    outcomes: {
      best: "$2.9M",
      expected: "$1.8M",
      worst: "$900K",
    },
  },
]

const mockMetrics = [
  { label: "Social Media Growth", current: 2.1, projected: 3.8, unit: "M followers" },
  { label: "Engagement Rate", current: 4.2, projected: 6.1, unit: "%" },
  { label: "Brand Alignment Score", current: 7.8, projected: 8.9, unit: "/10" },
  { label: "Market Value", current: 1.2, projected: 2.1, unit: "M USD" },
]

export function SimulationResultsPanel({
  selectedTalent,
  onTalentChange,
  files,
  onFilesChange,
}: SimulationResultsPanelProps) {
  const [activeScenario, setActiveScenario] = useState("scenario-1")
  const [simulationProgress, setSimulationProgress] = useState(100)
  const [isRunning, setIsRunning] = useState(false)

  const runSimulation = () => {
    setIsRunning(true)
    setSimulationProgress(0)

    const interval = setInterval(() => {
      setSimulationProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsRunning(false)
          return 100
        }
        return prev + 10
      })
    }, 200)
  }

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case "low":
        return "text-green-500"
      case "medium":
        return "text-yellow-500"
      case "high":
        return "text-red-500"
      default:
        return "text-gray-500"
    }
  }

  const selectedScenario = mockScenarios.find((s) => s.id === activeScenario)

  return (
    <div className="space-y-6">
      {/* Talent Context */}
      <TalentSelector
        selectedTalent={selectedTalent}
        onTalentChange={onTalentChange}
        onCreateNew={() => console.log("Create new talent")}
      />

      {/* Simulation Controls */}
      <div>
        <h4 className="text-sm font-medium mb-3">Simulation Engine</h4>
        <Card className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Monte Carlo Iterations</span>
              <Badge variant="outline">1,000 runs</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Time Horizon</span>
              <span className="text-xs text-muted-foreground">36 months</span>
            </div>
            {isRunning && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Progress</span>
                  <span className="text-xs text-muted-foreground">{simulationProgress}%</span>
                </div>
                <Progress value={simulationProgress} className="h-2" />
              </div>
            )}
            <Button onClick={runSimulation} disabled={isRunning} className="w-full gap-2">
              {isRunning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              {isRunning ? "Running Simulation..." : "Run New Simulation"}
            </Button>
          </div>
        </Card>
      </div>

      {/* Scenario Comparison */}
      <div>
        <h4 className="text-sm font-medium mb-3">Scenario Outcomes</h4>
        <div className="space-y-2">
          {mockScenarios.map((scenario) => (
            <Card
              key={scenario.id}
              className={`p-3 cursor-pointer transition-colors ${
                activeScenario === scenario.id ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => setActiveScenario(scenario.id)}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{scenario.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {scenario.type}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{scenario.projectedRevenue}</p>
                    <p className="text-xs text-muted-foreground">{scenario.duration}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <AlertCircle className={`w-3 h-3 ${getRiskColor(scenario.riskLevel)}`} />
                    <span>{scenario.riskLevel} Risk</span>
                  </div>
                  <span>{Math.round(scenario.confidence * 100)}% confidence</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Detailed Forecast */}
      {selectedScenario && (
        <div>
          <h4 className="text-sm font-medium mb-3">Outcome Distribution</h4>
          <Card className="p-4">
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-muted-foreground">Best Case</p>
                  <p className="text-sm font-medium text-green-500">{selectedScenario.outcomes.best}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Expected</p>
                  <p className="text-sm font-medium">{selectedScenario.outcomes.expected}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Worst Case</p>
                  <p className="text-sm font-medium text-red-500">{selectedScenario.outcomes.worst}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Key Metrics Projection */}
      <div>
        <h4 className="text-sm font-medium mb-3">Performance Metrics</h4>
        <div className="space-y-2">
          {mockMetrics.map((metric, index) => (
            <Card key={index} className="p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">{metric.label}</span>
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {metric.current} → {metric.projected} {metric.unit}
                    </span>
                    <TrendingUp className="w-3 h-3 text-green-500" />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
