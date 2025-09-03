"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
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

export function ResultsPanel() {
  const [selectedTalent, setSelectedTalent] = useState<TalentProfile>()
  const [files, setFiles] = useState<UploadedFile[]>([])
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
    const savedFiles = localStorage.getItem("hyper-talent-files")
    if (savedFiles) {
      try {
        setFiles(JSON.parse(savedFiles))
      } catch (error) {
        console.error("Failed to load saved files:", error)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("hyper-talent-files", JSON.stringify(files))
  }, [files])

  useEffect(() => {
    let filtered = [...deals]

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(
        (deal) =>
          deal.brand.toLowerCase().includes(searchLower) ||
          deal.title.toLowerCase().includes(searchLower) ||
          deal.description.toLowerCase().includes(searchLower) ||
          deal.tags.some((tag) => tag.toLowerCase().includes(searchLower)),
      )
    }

    if (filters.category) {
      filtered = filtered.filter((deal) => deal.category === filters.category)
    }

    if (filters.valueRange) {
      filtered = filtered.filter((deal) => {
        const dealValue = Number.parseInt(deal.valueRange.replace(/[^0-9]/g, ""))
        if (filters.valueRange === "0-25000") return dealValue <= 25000
        if (filters.valueRange === "25000-50000") return dealValue > 25000 && dealValue <= 50000
        if (filters.valueRange === "50000-100000") return dealValue > 50000 && dealValue <= 100000
        if (filters.valueRange === "100000+") return dealValue > 100000
        return true
      })
    }

    if (filters.minScore > 0) {
      filtered = filtered.filter((deal) => deal.matchScore >= filters.minScore)
    }

    if (filters.tags.length > 0) {
      filtered = filtered.filter((deal) => filters.tags.some((tag) => deal.tags.includes(tag)))
    }

    filtered.sort((a, b) => {
      let aValue: any, bValue: any

      switch (filters.sortBy) {
        case "score":
          aValue = a.matchScore
          bValue = b.matchScore
          break
        case "value":
          aValue = Number.parseInt(a.valueRange.replace(/[^0-9]/g, ""))
          bValue = Number.parseInt(b.valueRange.replace(/[^0-9]/g, ""))
          break
        case "brand":
          aValue = a.brand
          bValue = b.brand
          break
        case "deadline":
          aValue = new Date(a.deadline || "2099-12-31")
          bValue = new Date(b.deadline || "2099-12-31")
          break
        default:
          aValue = a.matchScore
          bValue = b.matchScore
      }

      if (filters.sortOrder === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    setFilteredDeals(filtered)
  }, [deals, filters])

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

  return (
    <div className="flex flex-col h-full bg-card">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Results & Artifacts</h3>
          <div className="flex items-center gap-2">
            {selectedTalent && !isDiscovering && (
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

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Talent Selector */}
        <TalentSelector
          selectedTalent={selectedTalent}
          onTalentChange={setSelectedTalent}
          onCreateNew={() => console.log("Create new talent")}
        />

        {showDiscoveryEngine && selectedTalent && (
          <div>
            <h4 className="text-sm font-medium mb-2">AI Deal Discovery</h4>
            <AIDealDiscoveryEngine
              selectedTalent={selectedTalent}
              query="Find brand partnership deals for this talent"
              onDealsFound={handleDiscoveryComplete}
              onSessionComplete={handleSessionComplete}
            />
          </div>
        )}

        {!showDiscoveryEngine && (
          <div>
            <h4 className="text-sm font-medium mb-2">File Management</h4>
            <FileUploadZone
              files={files}
              onFilesChange={setFiles}
              onProcessFiles={handleProcessFiles}
              talentId={selectedTalent?.id}
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
      </div>

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
