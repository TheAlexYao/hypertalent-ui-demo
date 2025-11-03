"use client"
import { Link as LinkIcon, AlertCircle, FileSpreadsheet, ExternalLink, Loader2, Zap } from "lucide-react"
import { useState, useEffect, useRef, useCallback } from "react"
import { type UploadedFile } from "./file-upload-zone"
import { TalentSelector, type TalentProfile } from "./talent-selector"
import { DealDetailsModal } from "./deal-details-modal"
import { OutreachModal } from "./outreach-modal"
import { ExportModal } from "./export-modal"
import { DealEvaluationInterface } from "./deal-evaluation-interface"
import { ChatSidebar } from "./chat-sidebar"
import { CrawlerResultsPanel } from "./tools/crawler-results-panel"
import { GameplanResultsPanel } from "./tools/gameplan-results-panel"
import { SimulationResultsPanel } from "./tools/simulation-results-panel"
import type { Deal } from "@/types/deal"
import type { ToolType } from "@/app/page"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { DEAL_STATUS_POLL_INTERVAL_MS, DEAL_STATUS_POLL_TIMEOUT_MS } from "@/lib/config"
import { cn } from "@/lib/utils"
import { getDealSearchStatus, initiateDealSearch, createDealsSpreadsheet } from "@/services/deal-hunter-api"
import type { BackendDeal, DealSearchStatusResponse } from "@/types/backend"

const DRIVE_LINK_STORAGE_KEY_PREFIX = "hyper-talent-drive-folder"
const TOOL_TYPES: ToolType[] = ["chat", "crawler", "deal-hunter", "gameplan", "simulation"]
const TOOL_DISPLAY_NAMES: Record<ToolType, string> = {
  chat: "AI Chat",
  crawler: "Web Crawler",
  "deal-hunter": "Deal Hunter",
  gameplan: "GamePlan X",
  simulation: "Simulation",
}

const getDriveLinkStorageKey = (tool: ToolType) => `${DRIVE_LINK_STORAGE_KEY_PREFIX}-${tool}`
const DEAL_RESULTS_LIMIT = 500
const DEAL_DISPLAY_LIMIT = 20

type SearchStatus = "idle" | "queued" | "in_progress" | "completed" | "failed"

const resolveSearchStatus = (response: DealSearchStatusResponse | null | undefined): SearchStatus => {
  if (!response || typeof response !== "object") {
    return "failed"
  }
  const rawStatus = typeof response.status === "string" ? response.status.trim().toLowerCase() : ""
  const normalized = rawStatus.replace(/\s+/g, "_")

  if (
    normalized.includes("fail") ||
    normalized.includes("error") ||
    normalized.includes("cancel") ||
    normalized.includes("abort")
  ) {
    return "failed"
  }

  if (
    normalized.includes("complete") ||
    normalized.includes("success") ||
    normalized.includes("done") ||
    normalized.includes("finish")
  ) {
    return "completed"
  }

  if (normalized.includes("queue") || normalized.includes("wait") || normalized.includes("pending")) {
    return "queued"
  }

  if (
    normalized.includes("progress") ||
    normalized.includes("process") ||
    normalized.includes("run") ||
    normalized.includes("active") ||
    normalized.includes("start")
  ) {
    return "in_progress"
  }

  if (response.error) {
    return "failed"
  }

  if (response.completed_at) {
    return "completed"
  }

  if (Array.isArray(response.deals) && response.deals.length > 0) {
    return "completed"
  }

  if (response.progress === 1 || response.progress === 100) {
    return "completed"
  }

  return "in_progress"
}

const normalizeProgressValue = (value: number | null | undefined): number | null => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return null
  }
  const scaled = value <= 1 ? value * 100 : value
  if (!Number.isFinite(scaled)) {
    return null
  }
  return Math.max(0, Math.min(100, scaled))
}

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
  const [isDealListTruncated, setIsDealListTruncated] = useState(false)
  const [isDiscovering, setIsDiscovering] = useState(false)
  const [showDiscoveryEngine, setShowDiscoveryEngine] = useState(false)
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showOutreachModal, setShowOutreachModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false)
  const [driveFolderLinks, setDriveFolderLinks] = useState<Record<ToolType, string>>({
    chat: "",
    crawler: "",
    "deal-hunter": "",
    gameplan: "",
    simulation: "",
  })
  const [driveLinkInput, setDriveLinkInput] = useState("")
  const [driveLinkError, setDriveLinkError] = useState("")
  const [dealHunterPrompt, setDealHunterPrompt] = useState("")
  const [searchId, setSearchId] = useState<string | null>(null)
  const [searchStatus, setSearchStatus] = useState<SearchStatus>("idle")
  const [searchStartedAt, setSearchStartedAt] = useState<string | undefined>()
  const [searchCompletedAt, setSearchCompletedAt] = useState<string | undefined>()
  const [searchError, setSearchError] = useState<string>("")
  const [isPollingStatus, setIsPollingStatus] = useState(false)
  const [statusMessage, setStatusMessage] = useState("")
  const [statusProgress, setStatusProgress] = useState<number | null>(null)
  const [spreadsheetUrl, setSpreadsheetUrl] = useState<string | null>(null)
  const [spreadsheetError, setSpreadsheetError] = useState<string>("")
  const [isGeneratingSpreadsheet, setIsGeneratingSpreadsheet] = useState(false)
  const sheetRequestRef = useRef(false)
  const activeDriveFolderLink = driveFolderLinks[activeTool] || ""

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
    setDriveFolderLinks((prev) => {
      const next = { ...prev }
      TOOL_TYPES.forEach((tool) => {
        const storedLink = localStorage.getItem(getDriveLinkStorageKey(tool))
        if (storedLink) {
          next[tool] = storedLink
        }
      })
      return next
    })
  }, [])

  useEffect(() => {
    setDriveLinkInput(activeDriveFolderLink)
    setDriveLinkError("")
  }, [activeTool, activeDriveFolderLink])

  const updateDriveFolderLink = useCallback(
    (tool: ToolType, link: string) => {
      setDriveFolderLinks((prev) => ({ ...prev, [tool]: link }))

      if (typeof window !== "undefined") {
        const storageKey = getDriveLinkStorageKey(tool)
        if (link) {
          localStorage.setItem(storageKey, link)
        } else {
          localStorage.removeItem(storageKey)
        }
      }

      if (tool === "deal-hunter" && !link) {
        setSpreadsheetUrl(null)
        sheetRequestRef.current = false
      }
    },
    [setDriveFolderLinks, setSpreadsheetUrl],
  )

  const extractDriveFolderId = (link: string): string | null => {
    try {
      const url = new URL(link)
      const folderMatch = url.pathname.match(/\/folders\/([\w-]+)/)
      if (folderMatch && folderMatch[1]) {
        return folderMatch[1]
      }
      return null
    } catch (error) {
      console.error("Invalid Google Drive link", error)
      return null
    }
  }

  const mapBackendDealToDeal = (backendDeal: BackendDeal, index: number): Deal => {
    const nowIso = new Date().toISOString()
    const fallbackTitle = backendDeal.brand ? `${backendDeal.brand} Opportunity` : "Deal Opportunity"

    return {
      id: backendDeal.id || `deal-${index}-${Date.now()}`,
      brand: backendDeal.brand || backendDeal.contact?.name || "Unknown Brand",
      title: backendDeal.title || fallbackTitle,
      category: backendDeal.category || "General",
      valueRange: backendDeal.value_range || "$0",
      matchScore: backendDeal.match_score ?? 0,
      description: backendDeal.description || "AI-identified partnership opportunity.",
      tags: backendDeal.tags || [],
      deadline: undefined,
      requirements: backendDeal.requirements || [],
      engagement: undefined,
      reach: undefined,
      conversions: undefined,
      industry: backendDeal.category || "General",
      companySize: undefined,
      duration: undefined,
      startDate: undefined,
      contact: {
        name: backendDeal.contact?.name,
        email: backendDeal.contact?.email,
        department: backendDeal.contact?.department,
      },
      status: (backendDeal.status as Deal["status"]) || "new",
      createdAt: nowIso,
      updatedAt: nowIso,
    }
  }

  const generateSpreadsheet = useCallback(async () => {
    if (!activeDriveFolderLink) {
      setSpreadsheetError("Connect a Google Drive folder before generating the spreadsheet.")
      sheetRequestRef.current = false
      return
    }

    if (isGeneratingSpreadsheet) return

    const folderId = extractDriveFolderId(activeDriveFolderLink)
    if (!folderId) {
      setSpreadsheetError("Unable to read folder ID from the provided link. Confirm it contains /folders/. ")
      sheetRequestRef.current = false
      return
    }

    setIsGeneratingSpreadsheet(true)
    setSpreadsheetError("")

    try {
      const response = await createDealsSpreadsheet(folderId, { limit: DEAL_RESULTS_LIMIT })
      let url: string | undefined
      if (typeof response === "string") {
        url = response
      } else if (response && typeof (response as any).url === "string") {
        url = (response as any).url
      } else if (response && typeof (response as any).spreadsheetUrl === "string") {
        url = (response as any).spreadsheetUrl
      } else if (response && typeof (response as any).spreadsheet_url === "string") {
        url = (response as any).spreadsheet_url
      }

      if (url) {
        setSpreadsheetUrl(url)
        sheetRequestRef.current = true
      } else {
        setSpreadsheetError("Spreadsheet URL was not returned. Check Drive permissions and retry.")
        sheetRequestRef.current = false
      }
    } catch (error) {
      console.error("Failed to generate spreadsheet", error)
      setSpreadsheetError("Failed to create Google Sheet. Please try again.")
      sheetRequestRef.current = false
    } finally {
      setIsGeneratingSpreadsheet(false)
    }
  }, [activeDriveFolderLink, isGeneratingSpreadsheet])

  useEffect(() => {
    if (!searchId) return

    let cancelled = false
    let timeoutId: number | null = null
    const pollStartedAt = Date.now()

    const pollStatus = async () => {
      if (cancelled) return
      setIsPollingStatus(true)

      try {
        const statusResponse = await getDealSearchStatus(searchId)
        if (!statusResponse || typeof statusResponse !== "object") {
          throw new Error("Invalid status response from backend")
        }
        if (cancelled) return

        const normalizedStatus = resolveSearchStatus(statusResponse)
        setSearchStatus(normalizedStatus)
        if (typeof statusResponse.message === "string" && statusResponse.message.trim().length > 0) {
          setStatusMessage(statusResponse.message)
        } else {
          if (normalizedStatus === "queued") {
            setStatusMessage("Job queued. Waiting for backend to start.")
          } else if (normalizedStatus === "in_progress") {
            setStatusMessage("Analyzing Google Drive documents…")
          }
        }
        setStatusProgress(normalizeProgressValue(statusResponse.progress))
        if (statusResponse.started_at) {
          setSearchStartedAt(statusResponse.started_at)
        }

        if (normalizedStatus === "completed") {
          const mappedDeals = (statusResponse.deals || [])
            .slice(0, DEAL_RESULTS_LIMIT)
            .map((deal, index) => mapBackendDealToDeal(deal, index))
          const limitedDeals = mappedDeals.slice(0, DEAL_DISPLAY_LIMIT)
          setDeals(limitedDeals)
          setFilteredDeals(limitedDeals)
          setIsDealListTruncated(mappedDeals.length > DEAL_DISPLAY_LIMIT)
          setIsDiscovering(false)
          setStatusMessage(statusResponse.message || "Discovery completed successfully.")
          setStatusProgress(100)
          setSearchCompletedAt(statusResponse.completed_at || new Date().toISOString())
          setSearchError("")
          const spreadsheetFromStatus = statusResponse.spreadsheet_url || statusResponse.sheet_url
          if (spreadsheetFromStatus) {
            setSpreadsheetUrl(spreadsheetFromStatus)
            sheetRequestRef.current = true
          } else if (!sheetRequestRef.current) {
            generateSpreadsheet()
          }

          setIsPollingStatus(false)
          setSearchId(null)
          return
        }

        if (normalizedStatus === "failed") {
          const failureMessage = statusResponse.error || statusResponse.message || "Discovery failed. Please try again."
          setSearchError(failureMessage)
          setStatusMessage(failureMessage)
          setIsDiscovering(false)
          setStatusProgress(null)
          setIsPollingStatus(false)
          setSearchId(null)
          sheetRequestRef.current = false
          return
        }

        if (Date.now() - pollStartedAt > DEAL_STATUS_POLL_TIMEOUT_MS) {
          const timeoutMessage = "Discovery is taking longer than expected. Please try again."
          setSearchError(timeoutMessage)
          setStatusMessage(timeoutMessage)
          setSearchStatus("failed")
          setIsDiscovering(false)
          setStatusProgress(null)
          setIsPollingStatus(false)
          setSearchId(null)
          sheetRequestRef.current = false
          return
        }

        timeoutId = window.setTimeout(pollStatus, DEAL_STATUS_POLL_INTERVAL_MS)
      } catch (error) {
        if (cancelled) return
        console.error("Failed to poll deal search status", error)
        const fallbackMessage =
          error instanceof Error ? error.message : "Unable to check discovery status. Please try again."
        setSearchError(fallbackMessage)
        setStatusMessage(fallbackMessage)
        setSearchStatus("failed")
        setIsDiscovering(false)
        setStatusProgress(null)
        setIsPollingStatus(false)
        sheetRequestRef.current = false
        setSearchId(null)
      }
    }

    pollStatus()

    return () => {
      cancelled = true
      if (timeoutId) {
        window.clearTimeout(timeoutId)
      }
      setIsPollingStatus(false)
    }
  }, [searchId, generateSpreadsheet])

  const handleStartDiscovery = async () => {
    if (activeTool !== "deal-hunter" && !selectedTalent) {
      alert("Please select a talent profile first")
      return
    }
    if (activeTool === "deal-hunter" && !activeDriveFolderLink) {
      setDriveLinkInput("")
      setDriveLinkError("Please add a Google Drive folder before starting discovery.")
      setIsDriveModalOpen(true)
      return
    }

    if (activeTool !== "deal-hunter") {
      setShowDiscoveryEngine(true)
      setIsDiscovering(true)
      return
    }

    try {
      setStatusMessage("")
      setStatusProgress(null)
      setSearchError("")
      setDeals([])
      setFilteredDeals([])
      setIsDealListTruncated(false)
      setShowDiscoveryEngine(true)
      setIsDiscovering(true)
      setSearchStatus("queued")
      setStatusMessage("Job queued. Waiting for backend to start.")
      setStatusProgress(0)
      setSearchStartedAt(new Date().toISOString())
      setSearchCompletedAt(undefined)
      setSpreadsheetUrl(null)
      setSpreadsheetError("")
      sheetRequestRef.current = false
      setSearchId(null)

      const trimmedPrompt = dealHunterPrompt.trim()
      const promptParts: string[] = [
        "Analyze the connected Google Drive folder contents to identify brand partnership and sponsorship opportunities.",
      ]
      if (selectedTalent?.name) {
        promptParts.push(`Use available context about ${selectedTalent.name} when relevant.`)
      }
      if (selectedTalent?.category) {
        promptParts.push(`Talent category: ${selectedTalent.category}.`)
      }
      if (trimmedPrompt.length > 0) {
        promptParts.push(`Focus the search on opportunities related to: ${trimmedPrompt}.`)
      }
      const prompt = promptParts.join(" ")

      const response = await initiateDealSearch({
        drive_link: activeDriveFolderLink,
        prompt,
      })

      if (!response || typeof response !== "object" || typeof response.search_id !== "string") {
        throw new Error("Backend did not return a search ID.")
      }

      setSearchId(response.search_id)
      if (response.status) {
        const initialStatus = resolveSearchStatus({
          search_id: response.search_id,
          status: response.status,
          message: response.message,
        } as DealSearchStatusResponse)
        setSearchStatus(initialStatus)
        if (response.message) {
          setStatusMessage(response.message)
        } else if (initialStatus === "completed") {
          setStatusMessage("Discovery completed successfully.")
        } else if (initialStatus === "failed") {
          setStatusMessage("Discovery failed. Please try again.")
        }
        if (initialStatus === "completed") {
          setStatusProgress(100)
        } else if (initialStatus === "failed") {
          setStatusProgress(null)
          setSearchError(response.message || "Discovery failed. Please try again.")
        }
      }
    } catch (error) {
      console.error("Failed to initiate deal search", error)
      const message =
        error instanceof Error ? error.message : "Failed to start discovery. Please try again."
      setSearchError(message)
      setStatusMessage(message)
      setStatusProgress(null)
      setIsDiscovering(false)
      setSearchStatus("failed")
      sheetRequestRef.current = false
    }
  }

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
        return null
      case "crawler":
        return <CrawlerResultsPanel {...commonProps} />
      case "gameplan":
        return <GameplanResultsPanel {...commonProps} />
      case "simulation":
        return <SimulationResultsPanel {...commonProps} />
      case "deal-hunter":
      default: {
        const statusLabelMap: Record<SearchStatus, string> = {
          idle: "Ready",
          queued: "Queued",
          in_progress: "Running",
          completed: "Completed",
          failed: "Failed",
        }
        const badgeVariant = searchStatus === "completed" ? "default" : searchStatus === "failed" ? "destructive" : "secondary"
        const fallbackDescription =
          searchStatus === "failed"
            ? searchError || "Discovery failed. Please try again."
            : searchStatus === "completed"
              ? "Discovery finished. Review deals below."
              : searchStatus === "queued"
                ? "Job queued. Waiting for backend to start."
                : searchStatus === "in_progress"
                  ? "Analyzing Google Drive documents…"
                  : "Start a discovery to generate opportunities."
        const description = statusMessage || fallbackDescription
        const totalDeals = deals.length
        const avgMatchScore =
          totalDeals > 0 ? deals.reduce((sum, deal) => sum + (deal.matchScore || 0), 0) / totalDeals : 0
        const startedAtLabel = searchStartedAt ? new Date(searchStartedAt).toLocaleTimeString() : undefined
        const completedAtLabel = searchCompletedAt ? new Date(searchCompletedAt).toLocaleTimeString() : undefined

        return (
          <>
            {showDiscoveryEngine && (
              <div className="mx-10 space-y-4">
                <Card className="p-4 space-y-4">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                    <div className="space-y-1">
                      <h4 className="font-medium">Discovery Status</h4>
                      {startedAtLabel && (
                        <p className="text-xs text-muted-foreground">Started {startedAtLabel}</p>
                      )}
                      {completedAtLabel && (
                        <p className="text-xs text-muted-foreground">Completed {completedAtLabel}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {isPollingStatus && searchStatus !== "completed" && searchStatus !== "failed" && (
                        <Badge variant="outline" className="text-xs">
                          Polling backend…
                        </Badge>
                      )}
                      <Badge variant={badgeVariant} className="text-xs capitalize">
                        {statusLabelMap[searchStatus]}
                      </Badge>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground">{description}</p>

                  {(searchStatus === "queued" || searchStatus === "in_progress") && (
                    <div className="space-y-2">
                      {statusProgress !== null ? (
                        <div className="flex items-center gap-3">
                          <Progress value={statusProgress} className="flex-1 h-2" />
                          <span className="text-xs text-muted-foreground w-12 text-right">
                            {Math.round(statusProgress)}%
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>
                            {statusMessage ||
                              (searchStatus === "queued"
                                ? "Waiting for the backend to start…"
                                : "Analyzing documents…")}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {searchStatus === "failed" && (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-center gap-2 text-sm text-destructive">
                        <AlertCircle className="w-4 h-4" />
                        <span>{searchError || statusMessage || "Discovery failed. Please retry."}</span>
                      </div>
                      <Button
                        variant="cta"
                        size="sm"
                        className="self-start"
                        onClick={handleStartDiscovery}
                        disabled={isDiscovering}
                      >
                        Retry Discovery
                      </Button>
                    </div>
                  )}

                  {searchStatus === "completed" && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-3xl font-semibold text-primary">{totalDeals}</div>
                        <p className="text-xs text-muted-foreground">Deals Found</p>
                      </div>
                      <div>
                        <div className="text-3xl font-semibold text-primary">{avgMatchScore.toFixed(1)}</div>
                        <p className="text-xs text-muted-foreground">Average Match Score</p>
                      </div>
                      <div>
                        <div className="text-3xl font-semibold text-primary">
                          {completedAtLabel || startedAtLabel || "--"}
                        </div>
                        <p className="text-xs text-muted-foreground">Completion Time</p>
                      </div>
                    </div>
                  )}
                </Card>

                <Card className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <h4 className="font-medium flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-green-600" />
                      Google Sheets Output
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Access the generated spreadsheet or create a fresh export once discovery completes.
                    </p>
                    {spreadsheetError && (
                      <div className="flex items-center gap-2 text-xs text-destructive mt-2">
                        <AlertCircle className="w-3 h-3" />
                        <span>{spreadsheetError}</span>
                      </div>
                    )}
                    {spreadsheetUrl && (
                      <p className="text-xs text-muted-foreground mt-2 break-all">
                        {spreadsheetUrl}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center">
                    {spreadsheetUrl ? (
                      <Button asChild variant="outline" className="gap-2">
                        <a href={spreadsheetUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4" />
                          Open Spreadsheet
                        </a>
                      </Button>
                    ) : (
                      <Button
                        onClick={generateSpreadsheet}
                        disabled={isGeneratingSpreadsheet || searchStatus !== "completed"}
                        className="gap-2"
                      >
                        {isGeneratingSpreadsheet ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
                        {isGeneratingSpreadsheet ? "Generating..." : "Generate Spreadsheet"}
                      </Button>
                    )}
                  </div>
                </Card>
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
            {isDealListTruncated && (
              <p className="text-xs text-muted-foreground mt-2">
                Showing the first {DEAL_DISPLAY_LIMIT} opportunities. Download the spreadsheet for the complete set.
              </p>
            )}
          </>
        )
      }
    }
  }

  const renderDriveConnectionCard = (tool: ToolType, options?: { showPrompt?: boolean }) => {
    const driveLink = driveFolderLinks[tool] || ""
    const hasDriveLinkForTool = driveLink.trim().length > 0
    const displayName = TOOL_DISPLAY_NAMES[tool]
    const description =
      tool === "deal-hunter"
        ? `${displayName} pulls context directly from this shared folder. Local uploads stay disabled.`
        : `${displayName} uses your shared Google Drive folder to personalize insights.`

    return (
      <Card className="bg-background/60 border border-border/40 rounded-lg p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <p className="text-sm font-medium flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-primary" />
              Google Drive Folder
            </p>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
          {hasDriveLinkForTool && (
            <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
              Connected
            </Badge>
          )}
        </div>

        {hasDriveLinkForTool ? (
          <div className="space-y-4">
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground break-all border border-border/40 rounded-md p-3 bg-background/80">
                {driveLink}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="border-white/40 bg-transparent text-muted-foreground hover:border-primary hover:bg-primary hover:text-primary-foreground focus-visible:border-primary focus-visible:ring-primary/40 active:bg-white/90 active:text-black active:border-white/70 min-w-[150px] max-w-[250px]"
                >
                  <a href={driveLink} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4" />
                    Open Folder
                  </a>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/40 bg-transparent text-muted-foreground hover:border-primary hover:bg-primary hover:text-primary-foreground focus-visible:border-primary focus-visible:ring-primary/40 active:bg-white/90 active:text-black active:border-white/70 min-w-[150px] max-w-[250px]"
                  onClick={() => {
                    setDriveLinkInput(driveLink)
                    setDriveLinkError("")
                    setIsDriveModalOpen(true)
                  }}
                >
                  Change Folder
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive/80"
                  onClick={() => {
                    updateDriveFolderLink(tool, "")
                    setDriveLinkInput("")
                    setDriveLinkError("")
                  }}
                >
                  Remove
                </Button>
              </div>
            </div>

            {options?.showPrompt ? (
              <>
                <div className="space-y-2">
                  <Label
                    htmlFor="deal-hunter-prompt"
                    className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
                  >
                    Discovery Prompt
                  </Label>
                  <Textarea
                    id="deal-hunter-prompt"
                    placeholder='e.g. "Find me sports drinks brands"'
                    value={dealHunterPrompt}
                    onChange={(event) => setDealHunterPrompt(event.target.value)}
                    className="min-h-[96px] resize-y"
                  />
                  <p className="text-xs text-muted-foreground">
                    Guide {displayName} toward specific categories, product types, or partnership goals.
                  </p>
                </div>

                <div className="flex justify-center w-full">
                  <Button
                    onClick={handleStartDiscovery}
                    disabled={isDiscovering}
                    variant="cta"
                    size="lg"
                    className="gap-2 w-full max-w-md"
                  >
                    <Zap className="w-4 h-4" />
                    {isDiscovering ? "Discovering..." : "Start Discovery"}
                  </Button>
                </div>
              </>
            ) : (
              <p className="text-xs text-muted-foreground">
                Connected documents will enrich upcoming {displayName} analyses.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 text-xs text-destructive">
              <AlertCircle className="w-3 h-3" />
              <span>Connect a Google Drive folder before running {displayName}.</span>
            </div>
            <div className="flex justify-center w-full">
              <Button
                size="lg"
                variant="cta"
                className="w-full max-w-md"
                onClick={() => {
                  setDriveLinkInput("")
                  setDriveLinkError("")
                  setIsDriveModalOpen(true)
                }}
              >
                Add Folder
              </Button>
            </div>
          </div>
        )}
      </Card>
    )
  }

  const renderToolSpecificPanel = () => {
    const { title, subtitle } = getTerminalTitle()
    const header = (
      <div className="bg-secondary/20 border border-border/50 rounded-lg px-5 py-4">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
      </div>
    )

    if (activeTool === "chat") {
      return (
        <ChatSidebar
          title={title}
          subtitle={subtitle}
          selectedTalent={selectedTalent}
          onTalentChange={setSelectedTalent}
          files={files}
          onFilesChange={handleFilesChange}
        />
      )
    }

    if (activeTool === "deal-hunter") {
      return (
        <div className="space-y-4">
          {header}
          <div className="bg-secondary/20 border border-border/50 rounded-lg p-8 space-y-6">
            {renderDriveConnectionCard("deal-hunter", { showPrompt: true })}
          </div>

          {/* Tool-Specific Results Section */}
          <div className="border-border border-t-[0] pt-[0]">{renderToolResults()}</div>
        </div>
      )
    }

    const hideTalentSelector = ["crawler", "gameplan", "simulation"].includes(activeTool)

    return (
      <div className="space-y-4">
        {header}

        {!hideTalentSelector && (
          <div className="bg-secondary/20 border border-border/50 rounded-lg p-6">
            <TalentSelector
              selectedTalent={selectedTalent}
              onTalentChange={setSelectedTalent}
              onCreateNew={() => console.log("Create new talent")}
              onStartDiscovery={handleStartDiscovery}
              isDiscovering={isDiscovering}
            />
          </div>
        )}

        {/* Drive Folder Section */}
        <div className="bg-secondary/20 border border-border/50 rounded-lg p-6">
          {renderDriveConnectionCard(activeTool)}
        </div>

        {/* Tool Results Section - Full width */}
        <div className="bg-secondary/20 border border-border/50 rounded-lg p-6">{renderToolResults()}</div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <div
        className={cn(
          "flex-1 overflow-y-auto bg-background text-foreground",
          activeTool === "chat" ? "px-4 py-4" : "mx-8 px-6 py-6",
        )}
      >
        <div className={cn("h-full", activeTool === "chat" ? "" : "space-y-4")}>{renderToolSpecificPanel()}</div>
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
              Paste a shared Google Drive folder link. {TOOL_DISPLAY_NAMES[activeTool]} uses the documents in this
              folder for analysis.
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
              {activeDriveFolderLink && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    updateDriveFolderLink(activeTool, "")
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
                updateDriveFolderLink(activeTool, trimmed)
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
