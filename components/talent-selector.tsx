"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Plus,
  User,
  Star,
  TrendingUp,
  Zap,
  Upload,
  X,
  RefreshCw,
  FileText,
  ImageIcon,
  Video,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle,
} from "lucide-react"
import { useState, useCallback, useRef } from "react"

export interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  status: "uploading" | "completed" | "error" | "processing"
  progress: number
  url?: string
  error?: string
  talentId?: string
}

export interface TalentProfile {
  id: string
  name: string
  category: string
  avatar?: string
  stats: {
    followers: number
    engagement: number
    deals: number
  }
  status: "active" | "inactive"
}

interface TalentSelectorProps {
  selectedTalent?: TalentProfile
  onTalentChange: (talent: TalentProfile) => void
  onCreateNew: () => void
  onStartDiscovery?: () => void
  isDiscovering?: boolean
}

const ACCEPTED_TYPES = {
  "application/pdf": [".pdf"],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
  "application/vnd.ms-excel": [".xls"],
  "image/*": [".jpg", ".jpeg", ".png", ".gif", ".webp"],
  "video/*": [".mp4", ".mov", ".avi", ".mkv"],
}

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

const mockTalents: TalentProfile[] = [
  {
    id: "talent-1",
    name: "John Doe",
    category: "Professional Athlete",
    stats: { followers: 125000, engagement: 4.2, deals: 8 },
    status: "active",
  },
  {
    id: "talent-2",
    name: "Sarah Johnson",
    category: "Fitness Influencer",
    stats: { followers: 89000, engagement: 6.1, deals: 12 },
    status: "active",
  },
  {
    id: "talent-3",
    name: "Mike Chen",
    category: "Gaming Creator",
    stats: { followers: 234000, engagement: 3.8, deals: 5 },
    status: "active",
  },
]

export function TalentSelector({
  selectedTalent,
  onTalentChange,
  onCreateNew,
  onStartDiscovery,
  isDiscovering,
}: TalentSelectorProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const handleTalentSelect = (talentId: string) => {
    const talent = mockTalents.find((t) => t.id === talentId)
    if (talent) {
      onTalentChange(talent)
    }
  }

  const handleCreateNew = () => {
    setIsCreating(true)
    // Simulate creating new talent profile
    setTimeout(() => {
      const newTalent: TalentProfile = {
        id: `talent-${Date.now()}`,
        name: "New Talent",
        category: "Uncategorized",
        stats: { followers: 0, engagement: 0, deals: 0 },
        status: "active",
      }
      onTalentChange(newTalent)
      setIsCreating(false)
    }, 1000)
  }

  const getFileIcon = (type: string) => {
    if (type.includes("pdf")) return <FileText className="w-4 h-4" />
    if (type.includes("sheet") || type.includes("excel")) return <FileSpreadsheet className="w-4 h-4" />
    if (type.includes("image")) return <ImageIcon className="w-4 h-4" />
    if (type.includes("video")) return <Video className="w-4 h-4" />
    return <FileText className="w-4 h-4" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return `File size exceeds ${formatFileSize(MAX_FILE_SIZE)} limit`
    }

    const acceptedTypes = Object.keys(ACCEPTED_TYPES)
    const isValidType = acceptedTypes.some((type) => {
      if (type.includes("*")) {
        return file.type.startsWith(type.split("*")[0])
      }
      return file.type === type
    })

    if (!isValidType) {
      return "File type not supported"
    }

    return null
  }

  const simulateUpload = async (file: UploadedFile): Promise<void> => {
    return new Promise((resolve, reject) => {
      let progress = 0
      const interval = setInterval(() => {
        progress += Math.random() * 15
        if (progress >= 100) {
          progress = 100
          clearInterval(interval)

          if (Math.random() < 0.1) {
            setFiles((prev) =>
              prev.map((f) =>
                f.id === file.id ? { ...f, status: "error", error: "Upload failed. Please try again." } : f,
              ),
            )
            reject(new Error("Upload failed"))
          } else {
            setFiles((prev) =>
              prev.map((f) =>
                f.id === file.id
                  ? { ...f, status: "completed", progress: 100, url: `https://mock-s3.com/${f.name}` }
                  : f,
              ),
            )
            resolve()
          }
        } else {
          setFiles((prev) => prev.map((f) => (f.id === file.id ? { ...f, progress } : f)))
        }
      }, 200)
    })
  }

  const handleFiles = useCallback(
    async (fileList: FileList) => {
      const newFiles: UploadedFile[] = []

      Array.from(fileList).forEach((file) => {
        const error = validateFile(file)
        const uploadFile: UploadedFile = {
          id: `file-${Date.now()}-${Math.random()}`,
          name: file.name,
          size: file.size,
          type: file.type,
          status: error ? "error" : "uploading",
          progress: 0,
          error,
          talentId: selectedTalent?.id,
        }
        newFiles.push(uploadFile)
      })

      const updatedFiles = [...files, ...newFiles]
      setFiles(updatedFiles)

      newFiles
        .filter((file) => !file.error)
        .forEach((file) => {
          simulateUpload(file).catch(console.error)
        })
    },
    [files, selectedTalent?.id],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      const droppedFiles = e.dataTransfer.files
      if (droppedFiles.length > 0) {
        handleFiles(droppedFiles)
      }
    },
    [handleFiles],
  )

  const handleFileSelect = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = e.target.files
      if (selectedFiles && selectedFiles.length > 0) {
        handleFiles(selectedFiles)
      }
      e.target.value = ""
    },
    [handleFiles],
  )

  const removeFile = useCallback((fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId))
  }, [])

  const retryUpload = useCallback(
    (fileId: string) => {
      const file = files.find((f) => f.id === fileId)
      if (file) {
        const updatedFile = { ...file, status: "uploading" as const, progress: 0, error: undefined }
        setFiles((prev) => prev.map((f) => (f.id === fileId ? updatedFile : f)))
        simulateUpload(updatedFile).catch(console.error)
      }
    },
    [files],
  )

  const completedFiles = files.filter((f) => f.status === "completed")
  const hasProcessableFiles = completedFiles.length > 0

  return (
    <div className="space-y-4 py-[16] mx-4 px-6">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Selected Talent</h4>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCreateNew}
          disabled={isCreating}
          className="gap-1 bg-transparent border-primary"
        >
          <Plus className="w-3 h-3" />
          {isCreating ? "Creating..." : "New"}
        </Button>
      </div>

      {/* Talent Selector Dropdown */}
      <Select value={selectedTalent?.id} onValueChange={handleTalentSelect}>
        <SelectTrigger>
          <SelectValue placeholder="Select a talent profile" />
        </SelectTrigger>
        <SelectContent>
          {mockTalents.map((talent) => (
            <SelectItem key={talent.id} value={talent.id}>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center">
                  <User className="w-3 h-3" />
                </div>
                <span>{talent.name}</span>
                <Badge variant="outline" className="text-xs">
                  {talent.category}
                </Badge>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Selected Talent Card */}
      {selectedTalent && (
        <Card className="p-4 my-[16]">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium">
                {selectedTalent.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </span>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h5 className="font-medium">{selectedTalent.name}</h5>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span className="font-medium">{formatNumber(selectedTalent.stats.followers)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    <span className="font-medium">{selectedTalent.stats.engagement}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    <span className="font-medium">{selectedTalent.stats.deals}</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{selectedTalent.category}</p>
            </div>
          </div>

          <div className="mt-4 space-y-4">
            {/* Upload Zone */}
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors border-foreground px-6 ${
                isDragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-accent/5"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-foreground mb-2">
                Drag & drop files or{" "}
                <button onClick={handleFileSelect} className="text-primary hover:underline font-medium">
                  click to upload
                </button>
              </p>
              <p className="text-xs text-muted-foreground">
                Supports PDF, Excel, images, and videos up to {formatFileSize(MAX_FILE_SIZE)}
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={Object.keys(ACCEPTED_TYPES).join(",")}
                onChange={handleFileInputChange}
                className="hidden"
              />
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Uploaded Files ({files.length})</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {files.map((file) => (
                    <div key={file.id} className="flex items-center gap-2 p-3 bg-secondary rounded-lg">
                      <div className="flex-shrink-0">{getFileIcon(file.type)}</div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium truncate">{file.name}</p>
                          <div className="flex items-center gap-1">
                            {file.status === "completed" && <CheckCircle className="w-4 h-4 text-green-500" />}
                            {file.status === "error" && <AlertCircle className="w-4 h-4 text-destructive" />}
                            <Badge variant="secondary" className="text-xs">
                              {formatFileSize(file.size)}
                            </Badge>
                          </div>
                        </div>

                        {file.status === "uploading" && <Progress value={file.progress} className="h-1" />}

                        {file.error && <p className="text-xs text-destructive">{file.error}</p>}
                      </div>

                      <div className="flex items-center gap-1">
                        {file.status === "error" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => retryUpload(file.id)}
                            className="h-6 w-6 p-0"
                          >
                            <RefreshCw className="w-3 h-3" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(file.id)}
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {onStartDiscovery && (
            <div className="border-t mt-[0] pt-[0]">
              <Button
                onClick={onStartDiscovery}
                disabled={isDiscovering}
                className="w-full gap-2 bg-[#AE94FB] hover:bg-[#9B7EF7] text-black font-medium"
                size="sm"
              >
                <Zap className="w-4 h-4" />
                {isDiscovering ? "Discovering..." : "Start Discovery"}
              </Button>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
