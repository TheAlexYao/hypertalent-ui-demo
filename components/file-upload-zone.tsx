"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
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

interface FileUploadZoneProps {
  files: UploadedFile[]
  onFilesChange: (files: UploadedFile[]) => void
  onProcessFiles: () => void
  maxFileSize?: number
  acceptedTypes?: string[]
  talentId?: string
}

const ACCEPTED_TYPES = {
  "application/pdf": [".pdf"],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
  "application/vnd.ms-excel": [".xls"],
  "image/*": [".jpg", ".jpeg", ".png", ".gif", ".webp"],
  "video/*": [".mp4", ".mov", ".avi", ".mkv"],
}

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

export function FileUploadZone({
  files,
  onFilesChange,
  onProcessFiles,
  maxFileSize = MAX_FILE_SIZE,
  acceptedTypes = Object.keys(ACCEPTED_TYPES),
  talentId,
}: FileUploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
    if (file.size > maxFileSize) {
      return `File size exceeds ${formatFileSize(maxFileSize)} limit`
    }

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

          // Simulate occasional upload failures
          if (Math.random() < 0.1) {
            onFilesChange(
              files.map((f) =>
                f.id === file.id ? { ...f, status: "error", error: "Upload failed. Please try again." } : f,
              ),
            )
            reject(new Error("Upload failed"))
          } else {
            onFilesChange(
              files.map((f) =>
                f.id === file.id
                  ? { ...f, status: "completed", progress: 100, url: `https://mock-s3.com/${f.name}` }
                  : f,
              ),
            )
            resolve()
          }
        } else {
          onFilesChange(files.map((f) => (f.id === file.id ? { ...f, progress } : f)))
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
          talentId,
        }
        newFiles.push(uploadFile)
      })

      const updatedFiles = [...files, ...newFiles]
      onFilesChange(updatedFiles)

      // Start uploads for valid files
      newFiles
        .filter((file) => !file.error)
        .forEach((file) => {
          simulateUpload(file).catch(console.error)
        })
    },
    [files, onFilesChange, talentId],
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
      // Reset input value to allow selecting the same file again
      e.target.value = ""
    },
    [handleFiles],
  )

  const removeFile = useCallback(
    (fileId: string) => {
      onFilesChange(files.filter((f) => f.id !== fileId))
    },
    [files, onFilesChange],
  )

  const retryUpload = useCallback(
    (fileId: string) => {
      const file = files.find((f) => f.id === fileId)
      if (file) {
        const updatedFile = { ...file, status: "uploading" as const, progress: 0, error: undefined }
        onFilesChange(files.map((f) => (f.id === fileId ? updatedFile : f)))
        simulateUpload(updatedFile).catch(console.error)
      }
    },
    [files, onFilesChange],
  )

  const completedFiles = files.filter((f) => f.status === "completed")
  const hasProcessableFiles = completedFiles.length > 0

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-accent/5"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground mb-2">
          Drag & drop files or{" "}
          <button onClick={handleFileSelect} className="text-primary hover:underline">
            click to upload
          </button>
        </p>
        <p className="text-xs text-muted-foreground">
          Supports PDF, Excel, images, and videos up to {formatFileSize(maxFileSize)}
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(",")}
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
                    <Button variant="ghost" size="sm" onClick={() => retryUpload(file.id)} className="h-6 w-6 p-0">
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

      {/* Process Files Button */}
      {hasProcessableFiles && (
        <Button onClick={onProcessFiles} className="w-full" size="sm">
          Process Files ({completedFiles.length})
        </Button>
      )}
    </div>
  )
}
