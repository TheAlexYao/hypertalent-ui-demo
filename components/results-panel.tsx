"use client"

import { Button } from "@/components/ui/button"
import { Download, FileText, CheckCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { FileUploadZone, type UploadedFile } from "./file-upload-zone"
import { TalentSelector, type TalentProfile } from "./talent-selector"
import type { DealFilters as DealFiltersType } from "./deal-filters"
import { DealDetailsModal } from "./deal-details-modal"
import { OutreachModal } from "./outreach-modal"
import { ExportModal } from "./export-modal"
import { DealEvaluationInterface } from "./deal-evaluation-interface"
import { AIDealDiscoveryEngine } from "./ai-deal-discovery-engine"
import type { Deal } from "@/types/deal"
import type { ToolType } from "@/app/page"
import { Badge } from "@/components/ui/badge"

import { ChatResultsPanel } from "./tools/chat-results-panel"
import { CrawlerResultsPanel } from "./tools/crawler-results-panel"
import { GameplanResultsPanel } from "./tools/gameplan-results-panel"
import { SimulationResultsPanel } from "./tools/simulation-results-panel"

const mockDeals: Deal[] = [
  {
    id: "deal-1",
    brand: "Nike",
    title: "Nike Partnership",
    category: "Athletic Apparel",
    valueRange: "$50K-100K",
    matchScore: 9.2,
    description: "High-value endorsement opportunity for athletic wear and footwear with global reach",
    tags: ["Sports", "Apparel", "Global"],
    deadline: "2025-03-15",
    requirements: ["Social media presence", "Athletic performance", "Brand alignment"],
    engagement: 4.8,
    reach: "2.5M",
    conversions: "3.2%",
    industry: "Sports & Recreation",
    companySize: "Large Enterprise",
    duration: "12 months",
    startDate: "2025-02-01",
    contact: {
      name: "Sarah Johnson",
      email: "partnerships@nike.com",
      department: "Global Partnerships",
    },
    status: "new",
    createdAt: "2025-01-15T10:30:00Z",
    updatedAt: "2025-01-15T10:30:00Z",
  },
  {
    id: "deal-2",
    brand: "Gatorade",
    title: "Sports Nutrition Campaign",
    category: "Sports Nutrition",
    valueRange: "$25K-50K",
    matchScore: 8.7,
    description: "Social media campaign for new product launch targeting athletic performance",
    tags: ["Nutrition", "Social Media", "Performance"],
    deadline: "2025-02-28",
    requirements: ["Athletic endorsement", "Social engagement", "Video content"],
    engagement: 5.2,
    reach: "1.8M",
    conversions: "4.1%",
    industry: "Food & Beverage",
    companySize: "Large Enterprise",
    duration: "6 months",
    startDate: "2025-01-20",
    contact: {
      name: "Mike Chen",
      email: "marketing@gatorade.com",
      department: "Brand Marketing",
    },
    status: "new",
    createdAt: "2025-01-15T10:31:00Z",
    updatedAt: "2025-01-15T10:31:00Z",
  },
  {
    id: "deal-3",
    brand: "Under Armour",
    title: "Training Gear Collaboration",
    category: "Athletic Apparel",
    valueRange: "$75K-150K",
    matchScore: 8.9,
    description: "Exclusive training gear line collaboration with performance testing and feedback",
    tags: ["Apparel", "Training", "Collaboration"],
    deadline: "2025-04-01",
    requirements: ["Product testing", "Feedback sessions", "Marketing content"],
    engagement: 4.5,
    reach: "3.1M",
    conversions: "2.8%",
    industry: "Sports & Recreation",
    companySize: "Large Enterprise",
    duration: "18 months",
    startDate: "2025-03-01",
    contact: {
      name: "Alex Rivera",
      email: "partnerships@underarmour.com",
      department: "Athlete Partnerships",
    },
    status: "new",
    createdAt: "2025-01-15T10:32:00Z",
    updatedAt: "2025-01-15T10:32:00Z",
  },
]

interface ResultsPanelProps {
  activeTool: ToolType
  sharedFiles?: UploadedFile[]
  onSharedFilesChange?: (files: UploadedFile[]) => void
}

export function ResultsPanel({ activeTool, sharedFiles = [], onSharedFilesChange }: ResultsPanelProps) {
  const [selectedTalent, setSelectedTalent] = useState<TalentProfile>()
  const [files, setFiles] = useState<UploadedFile[]>(sharedFiles)
  const [deals, setDeals] = useState<Deal[]>([])
  const [filteredDeals, setFilteredDeals] = useState<Deal[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [isDiscovering, setIsDiscovering] = useState(false)
  const [showDiscoveryEngine, setShowDiscoveryEngine] = useState(false)
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showOutreachModal, setShowOutreachModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)

  const [filters, setFilters] = useState<DealFiltersType>({
    search: "",
    category: "",
    valueRange: "",
    minScore: 0,
    sortBy: "score",
    sortOrder: "desc",
    tags: [],
  })

  useEffect(() => {
    setFiles(sharedFiles)
  }, [sharedFiles])

  useEffect(() => {
    const savedFiles = localStorage.getItem("hyper-talent-files")
    if (savedFiles && sharedFiles.length === 0) {
      try {
        const parsedFiles = JSON.parse(savedFiles)
        setFiles(parsedFiles)
        if (onSharedFilesChange) {
          onSharedFilesChange(parsedFiles)
        }
      } catch (error) {
        console.error("Failed to load saved files:", error)
      }
    }
  }, [sharedFiles.length, onSharedFilesChange])

  useEffect(() => {
    localStorage.setItem("hyper-talent-files", JSON.stringify(files))
  }, [files])

  const handleProcessFiles = async () => {
    if (!selectedTalent) {
      alert("Please select a talent profile first")
      return
    }

    setIsProcessing(true)
    setShowDiscoveryEngine(true)
    setIsDiscovering(true)
  }

  const handleDiscoveryComplete = (discoveredDeals: Deal[]) => {
    setDeals(discoveredDeals)
    setIsDiscovering(false)
    setIsProcessing(false)
    // Keep discovery engine visible to show results
  }

  const handleSessionComplete = (session: any) => {
    console.log("Discovery session completed:", session)
    setIsDiscovering(false)
  }

  const handleStartDiscovery = () => {
    if (!selectedTalent) {
      alert("Please select a talent profile first")
      return
    }
    setShowDiscoveryEngine(true)
    setIsDiscovering(true)
  }

  const availableCategories = Array.from(new Set(mockDeals.map((deal) => deal.category)))
  const availableTags = Array.from(new Set(mockDeals.flatMap((deal) => deal.tags)))

  const handleViewDetails = (deal: Deal) => {
    setSelectedDeal(deal)
    setShowDetailsModal(true)
  }

  const handleGenerateOutreach = (deal: Deal) => {
    setSelectedDeal(deal)
    setShowOutreachModal(true)
  }

  const handleExport = () => {
    setShowExportModal(true)
  }

  const handleFilesChange = (newFiles: UploadedFile[]) => {
    setFiles(newFiles)
    if (onSharedFilesChange) {
      onSharedFilesChange(newFiles)
    }
  }

  const renderToolSpecificPanel = () => {
    const completedFiles = files.filter((f) => f.status === "completed")

    return (
      <>
        <div className="bg-secondary/20 border border-border/50 rounded-lg p-4">
          <div className="mb-4">
            <TalentSelector
              selectedTalent={selectedTalent}
              onTalentChange={setSelectedTalent}
              onCreateNew={() => console.log("Create new talent")}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Talent Context & Files
                {completedFiles.length > 0 && (
                  <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600 border-green-500/20">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    {completedFiles.length} files ready
                  </Badge>
                )}
              </h4>
              {completedFiles.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  P0 Feature - Files Drive Everything
                </Badge>
              )}
            </div>

            <FileUploadZone
              files={files}
              onFilesChange={handleFilesChange}
              onProcessFiles={handleProcessFiles}
              talentId={selectedTalent?.id}
            />

            {completedFiles.length > 0 && (
              <div className="mt-3 p-2 bg-green-500/5 border border-green-500/20 rounded text-xs text-green-700 dark:text-green-400">
                <p className="font-medium">✓ File Context Active</p>
                <p>AI agents will use uploaded files to personalize all responses and recommendations.</p>
              </div>
            )}
          </div>
        </div>

        {/* Tool-Specific Results Section */}
        <div className="border-t border-border pt-4">{renderToolResults()}</div>
      </>
    )
  }

  const renderToolResults = () => {
    const commonProps = {
      selectedTalent,
      onTalentChange: setSelectedTalent,
      files,
      onFilesChange: handleFilesChange,
    }

    switch (activeTool) {
      case "chat":
        return <ChatResultsPanel {...commonProps} />
      case "crawler":
        return <CrawlerResultsPanel {...commonProps} />
      case "gameplan":
        return <GameplanResultsPanel {...commonProps} />
      case "simulation":
        return <SimulationResultsPanel {...commonProps} />
      case "deal-hunter":
      default:
        return (
          <>
            {showDiscoveryEngine && selectedTalent && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium">AI Deal Discovery</h4>
                  {files.filter((f) => f.status === "completed").length > 0 && (
                    <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-600 border-blue-500/20">
                      Using {files.filter((f) => f.status === "completed").length} files for context
                    </Badge>
                  )}
                </div>
                <AIDealDiscoveryEngine
                  selectedTalent={selectedTalent}
                  query="Find brand partnership deals for this talent"
                  onDealsFound={handleDiscoveryComplete}
                  onSessionComplete={handleSessionComplete}
                />
              </div>
            )}

            {deals.length > 0 && (
              <DealEvaluationInterface
                deals={deals}
                selectedTalent={selectedTalent}
                onViewDetails={handleViewDetails}
                onGenerateOutreach={handleGenerateOutreach}
                onExportDeals={(dealsToExport) => {
                  setFilteredDeals(dealsToExport)
                  setShowExportModal(true)
                }}
              />
            )}
          </>
        )
    }
  }

  return (
    <div className="flex flex-col h-full bg-card">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Results & Artifacts</h3>
          <div className="flex items-center gap-2">
            {selectedTalent && !isDiscovering && activeTool === "deal-hunter" && (
              <Button variant="outline" size="sm" onClick={handleStartDiscovery} className="gap-1 bg-transparent">
                Start Discovery
              </Button>
            )}
            {filteredDeals.length > 0 && (
              <Button variant="outline" size="sm" onClick={handleExport} className="gap-1 bg-transparent">
                <Download className="w-3 h-3" />
                Export ({filteredDeals.length})
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">{renderToolSpecificPanel()}</div>

      {/* Modals */}
      <DealDetailsModal
        deal={selectedDeal}
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        onGenerateOutreach={handleGenerateOutreach}
      />

      <OutreachModal
        deal={selectedDeal}
        isOpen={showOutreachModal}
        onClose={() => setShowOutreachModal(false)}
        talentName={selectedTalent?.name}
      />

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        deals={filteredDeals}
        talent={selectedTalent}
        files={files}
      />
    </div>
  )
}
