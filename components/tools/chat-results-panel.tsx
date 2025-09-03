"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Download, MessageSquare, Users, Calendar } from "lucide-react"
import { useState } from "react"
import type { UploadedFile } from "../file-upload-zone"

interface ChatResultsPanelProps {
  selectedTalent?: any
  onTalentChange: (talent: any) => void
  files: UploadedFile[]
  onFilesChange: (files: UploadedFile[]) => void
}

const mockDocuments = [
  {
    id: "doc-1",
    title: "Nike Partnership Proposal",
    type: "Contract Draft",
    status: "Generated",
    createdAt: "2025-01-15T10:30:00Z",
    size: "2.4 MB",
  },
  {
    id: "doc-2",
    title: "Q1 Brand Strategy Report",
    type: "Strategic Analysis",
    status: "In Progress",
    createdAt: "2025-01-15T09:15:00Z",
    size: "1.8 MB",
  },
  {
    id: "doc-3",
    title: "Media Kit Template",
    type: "Template",
    status: "Ready",
    createdAt: "2025-01-14T16:45:00Z",
    size: "3.2 MB",
  },
]

const mockInsights = [
  {
    id: "insight-1",
    title: "Market Opportunity Analysis",
    description: "Sports nutrition market showing 23% growth in athlete endorsements",
    confidence: 0.89,
    sources: 12,
  },
  {
    id: "insight-2",
    title: "Optimal Contract Terms",
    description: "Performance-based clauses increase deal value by average 34%",
    confidence: 0.92,
    sources: 8,
  },
]

export function ChatResultsPanel({ selectedTalent, onTalentChange, files, onFilesChange }: ChatResultsPanelProps) {
  const [activeTab, setActiveTab] = useState<"documents" | "insights">("documents")

  return (
    <div className="space-y-6">
      {/* File Context Indicator */}
      {files.length > 0 && (
        <div className="p-3 bg-secondary/50 rounded-lg border">
          <p className="text-xs text-muted-foreground">
            Using context from {files.filter((f) => f.status === "completed").length} uploaded files
          </p>
        </div>
      )}

      {/* Document Library */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium">Generated Content</h4>
          <div className="flex gap-1">
            <Button
              variant={activeTab === "documents" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("documents")}
            >
              Documents
            </Button>
            <Button
              variant={activeTab === "insights" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("insights")}
            >
              Insights
            </Button>
          </div>
        </div>

        {activeTab === "documents" && (
          <div className="space-y-2">
            {mockDocuments.map((doc) => (
              <Card key={doc.id} className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{doc.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {doc.type} • {doc.size}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={doc.status === "Generated" ? "default" : "secondary"} className="text-xs">
                      {doc.status}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <Download className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === "insights" && (
          <div className="space-y-2">
            {mockInsights.map((insight) => (
              <Card key={insight.id} className="p-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h5 className="text-sm font-medium">{insight.title}</h5>
                    <Badge variant="outline" className="text-xs">
                      {Math.round(insight.confidence * 100)}% confidence
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{insight.description}</p>
                  <p className="text-xs text-muted-foreground">{insight.sources} sources analyzed</p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div>
        <h4 className="text-sm font-medium mb-3">Quick Actions</h4>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" className="gap-2 justify-start bg-transparent">
            <MessageSquare className="w-3 h-3" />
            Draft Email
          </Button>
          <Button variant="outline" size="sm" className="gap-2 justify-start bg-transparent">
            <FileText className="w-3 h-3" />
            Create Proposal
          </Button>
          <Button variant="outline" size="sm" className="gap-2 justify-start bg-transparent">
            <Users className="w-3 h-3" />
            Schedule Meeting
          </Button>
          <Button variant="outline" size="sm" className="gap-2 justify-start bg-transparent">
            <Calendar className="w-3 h-3" />
            Set Reminder
          </Button>
        </div>
      </div>
    </div>
  )
}
