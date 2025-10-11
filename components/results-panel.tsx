"use client"
import { FileText, CheckCircle, Link as LinkIcon, AlertCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { FileUploadZone, type UploadedFile } from "./file-upload-zone"
import { TalentSelector, type TalentProfile } from "./talent-selector"
import type { DealFilters as DealFiltersType } from "./deal-filters"
import { DealDetailsModal } from "./deal-details-modal"
import { OutreachModal } from "./outreach-modal"
import { ExportModal } from "./export-modal"
import { DealEvaluationInterface } from "./deal-evaluation-interface"
import { AIDealDiscoveryEngine } from "./ai-deal-discovery-engine"
import { ChatResultsPanel } from "./tools/chat-results-panel"
import { CrawlerResultsPanel } from "./tools/crawler-results-panel"
import { GameplanResultsPanel } from "./tools/gameplan-results-panel"
import { SimulationResultsPanel } from "./tools/simulation-results-panel"
import type { Deal } from "@/types/deal"
import type { ToolType } from "@/app/page"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

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

const DRIVE_LINK_STORAGE_KEY = "hyper-talent-drive-folder"

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
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false)
  const [driveFolderLink, setDriveFolderLink] = useState<string>("")
  const [driveLinkInput, setDriveLinkInput] = useState("")
  const [driveLinkError, setDriveLinkError] = useState("")

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

  useEffect(() => {
    if (typeof window === "undefined") return
    const storedLink = localStorage.getItem(DRIVE_LINK_STORAGE_KEY)
    if (storedLink) {
      setDriveFolderLink(storedLink)
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    if (driveFolderLink) {
      localStorage.setItem(DRIVE_LINK_STORAGE_KEY, driveFolderLink)
    } else {
      localStorage.removeItem(DRIVE_LINK_STORAGE_KEY)
    }
  }, [driveFolderLink])

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
    if (activeTool === "deal-hunter" && !driveFolderLink) {
      setDriveLinkInput("")
      setDriveLinkError("Please add a Google Drive folder before starting discovery.")
      setIsDriveModalOpen(true)
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

  const getTerminalTitle = () => {
    switch (activeTool) {
      case "chat":
        return {
          title: "AI Assistant Terminal",
          subtitle: "Intelligent conversations and document generation",
        }
      case "crawler":
        return {
          title: "Market Intelligence Terminal",
          subtitle: "Real-time brand opportunity discovery",
        }
      case "gameplan":
        return {
          title: "Strategic Planning Terminal",
          subtitle: "Campaign strategy and execution planning",
        }
      case "simulation":
        return {
          title: "Deal Simulation Terminal",
          subtitle: "Model and predict partnership outcomes",
        }
      case "deal-hunter":
      default:
        return {
          title: "Deal Hunter Terminal",
          subtitle: "Find, negotiate, and close automatically",
        }
    }
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
              <div className="mx-10">
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

  const renderToolSpecificPanel = () => {
    const completedFiles = files.filter((f) => f.status === "completed")
    const hasDriveLink = driveFolderLink.trim().length > 0

    if (activeTool === "deal-hunter") {
      return (
        <>
          <div className="bg-secondary/20 border border-border/50 rounded-lg p-8 border-none py-0">
            <div className="mb-6">
              <TalentSelector
                selectedTalent={selectedTalent}
                onTalentChange={setSelectedTalent}
                onCreateNew={() => console.log("Create new talent")}
                onStartDiscovery={handleStartDiscovery}
                isDiscovering={isDiscovering}
              />
            </div>

            <div className="space-y-4 pb-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-background/60 border border-border/40 rounded-lg p-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <LinkIcon className="w-4 h-4 text-primary" />
                    Google Drive Folder
                  </p>
                  {hasDriveLink ? (
                    <p className="text-xs text-muted-foreground break-all">{driveFolderLink}</p>
                  ) : (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Required before running Deal Hunter
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {hasDriveLink && (
                    <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                      Connected
                    </Badge>
                  )}
                  <Button variant="outline" size="sm" onClick={() => {
                    setDriveLinkInput(driveFolderLink)
                    setDriveLinkError("")
                    setIsDriveModalOpen(true)
                  }}>
                    {hasDriveLink ? "Change Folder" : "Add Folder"}
                  </Button>
                </div>
              </div>

              <FileUploadZone
                files={files}
                onFilesChange={handleFilesChange}
                onProcessFiles={handleProcessFiles}
                talentId={selectedTalent?.id}
                uploadDisabled
                onRequestUpload={() => {
                  setDriveLinkInput(driveFolderLink)
                  setDriveLinkError("")
                  setIsDriveModalOpen(true)
                }}
                disabledHelperText="Connect a shared Google Drive folder instead of uploading files."
                disabledCtaLabel="Set Google Drive Folder"
              />

              {hasDriveLink && (
                <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded text-xs text-emerald-700 dark:text-emerald-400">
                  <p className="font-medium">✓ Drive folder connected</p>
                  <p>Deal Hunter will analyze documents from this folder during discovery.</p>
                </div>
              )}
            </div>
          </div>

          {/* Tool-Specific Results Section */}
          <div className="border-border border-t-[0] pt-[0]">{renderToolResults()}</div>
        </>
      )
    }

    return (
      <div className="space-y-6">
        {/* Talent Selector Section */}
        <div className="bg-secondary/20 border border-border/50 rounded-lg p-6">
          <TalentSelector
            selectedTalent={selectedTalent}
            onTalentChange={setSelectedTalent}
            onCreateNew={() => console.log("Create new talent")}
            onStartDiscovery={handleStartDiscovery}
            isDiscovering={isDiscovering}
          />
        </div>

        {/* File Upload Section */}
        <div className="bg-secondary/20 border border-border/50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Context Files
              {completedFiles.length > 0 && (
                <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600 border-green-500/20">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {completedFiles.length} ready
                </Badge>
              )}
            </h4>
          </div>

          <FileUploadZone
            files={files}
            onFilesChange={handleFilesChange}
            onProcessFiles={handleProcessFiles}
            talentId={selectedTalent?.id}
            uploadDisabled
            onRequestUpload={() => {
              setDriveLinkInput(driveFolderLink)
              setDriveLinkError("")
              setIsDriveModalOpen(true)
            }}
            disabledHelperText="Connect a shared Google Drive folder instead of uploading files."
            disabledCtaLabel="Set Google Drive Folder"
          />

          {completedFiles.length > 0 && (
            <div className="mt-3 p-2 bg-green-500/5 border border-green-500/20 rounded text-xs text-green-700 dark:text-green-400">
              <p className="font-medium">✓ File Context Active</p>
              <p>AI will use uploaded files for personalized responses.</p>
            </div>
          )}
        </div>

        {/* Tool Results Section - Full width */}
        <div className="bg-secondary/20 border border-border/50 rounded-lg p-6">{renderToolResults()}</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full items-stretch">
      {/* Header */}
      <div className="p-4 border-border bg-background border-none border-b-[0]">
        
      </div>

      <div className="flex-1 overflow-y-auto py-[16] space-y-4 text-foreground bg-background border-none rounded-none shadow-none mx-8 px-6">
        {renderToolSpecificPanel()}
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

      <Dialog open={isDriveModalOpen} onOpenChange={setIsDriveModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect Google Drive Folder</DialogTitle>
            <DialogDescription>
              Paste a shared Google Drive folder link. Deal Hunter uses the documents in this folder for analysis.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="drive-link">Folder Link</Label>
              <Input
                id="drive-link"
                placeholder="https://drive.google.com/drive/folders/..."
                value={driveLinkInput}
                onChange={(e) => {
                  setDriveLinkInput(e.target.value)
                  if (driveLinkError) {
                    setDriveLinkError("")
                  }
                }}
              />
              {driveLinkError && <p className="text-xs text-destructive">{driveLinkError}</p>}
            </div>
            <p className="text-xs text-muted-foreground">
              Make sure the folder link is shared with the backend service account and includes “/folders/” in the URL.
            </p>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2">
            <div className="flex gap-2 order-2 sm:order-1">
              {driveFolderLink && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setDriveFolderLink("")
                    setDriveLinkInput("")
                    setDriveLinkError("")
                    setIsDriveModalOpen(false)
                  }}
                >
                  Remove Link
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => setIsDriveModalOpen(false)}>
                Cancel
              </Button>
            </div>
            <Button
              size="sm"
              onClick={() => {
                const trimmed = driveLinkInput.trim()
                const isValid = (() => {
                  if (!trimmed) return false
                  try {
                    const url = new URL(trimmed)
                    const isDrive = url.hostname.includes("drive.google.com")
                    const isFolder = url.pathname.includes("/folders/")
                    const isFile = url.pathname.includes("/file/")
                    return isDrive && isFolder && !isFile
                  } catch {
                    return false
                  }
                })()

                if (!isValid) {
                  setDriveLinkError("Please enter a valid Google Drive folder link.")
                  return
                }
                setDriveFolderLink(trimmed)
                setIsDriveModalOpen(false)
              }}
            >
              Save Folder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
