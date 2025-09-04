"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { FileText, Download, MessageSquare, Users, Calendar, Search, History } from "lucide-react"
import { useState } from "react"
import type { UploadedFile } from "../file-upload-zone"

interface ChatResultsPanelProps {
  selectedTalent?: any
  onTalentChange: (talent: any) => void
  files: UploadedFile[]
  onFilesChange: (files: UploadedFile[]) => void
}

const mockChatHistory = [
  {
    id: "chat-1",
    title: "Nike Partnership Strategy",
    timestamp: "2025-01-15T10:30:00Z",
    preview: "Discussed endorsement terms and performance metrics...",
    messageCount: 12,
  },
  {
    id: "chat-2",
    title: "Q1 Brand Analysis",
    timestamp: "2025-01-15T09:15:00Z",
    preview: "Analyzed market positioning and competitor landscape...",
    messageCount: 8,
  },
  {
    id: "chat-3",
    title: "Media Kit Generation",
    timestamp: "2025-01-14T16:45:00Z",
    preview: "Created comprehensive media kit with performance data...",
    messageCount: 15,
  },
]

const quickPrompts = [
  "Draft a partnership proposal for [Brand Name]",
  "Analyze my market positioning vs competitors",
  "Create a media kit highlighting my achievements",
  "Generate contract terms for endorsement deal",
  "Write a pitch email for potential sponsors",
  "Develop a content strategy for Q1 campaigns",
]

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
  const [activeTab, setActiveTab] = useState<"documents" | "insights" | "history" | "prompts">("prompts")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredHistory = mockChatHistory.filter(
    (chat) =>
      chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.preview.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      {/* File Context Indicator */}
      {files.length > 0 && (
        <div className="p-3 bg-secondary/50 rounded-lg border">
          <p className="text-xs text-foreground/70">
            Using context from {files.filter((f) => f.status === "completed").length} uploaded files
          </p>
        </div>
      )}

      {/* Enhanced Tab Navigation */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-foreground">AI Assistant</h4>
          <div className="flex gap-1">
            <Button
              variant={activeTab === "prompts" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("prompts")}
            >
              Prompts
            </Button>
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
            <Button
              variant={activeTab === "history" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("history")}
            >
              History
            </Button>
          </div>
        </div>

        {activeTab === "prompts" && (
          <div className="space-y-2">
            <p className="text-xs text-foreground/70 mb-3">Click any prompt to start a conversation with AI</p>
            {quickPrompts.map((prompt, index) => (
              <Card key={index} className="p-3 hover:bg-secondary/50 cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-4 h-4 text-blue-500" />
                  <p className="text-sm text-foreground">{prompt}</p>
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === "documents" && (
          <div className="space-y-2">
            {mockDocuments.map((doc) => (
              <Card key={doc.id} className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{doc.title}</p>
                      <p className="text-xs text-foreground/60">
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
                    <h5 className="text-sm font-medium text-foreground">{insight.title}</h5>
                    <Badge variant="outline" className="text-xs">
                      {Math.round(insight.confidence * 100)}% confidence
                    </Badge>
                  </div>
                  <p className="text-xs text-foreground/70">{insight.description}</p>
                  <p className="text-xs text-foreground/60">{insight.sources} sources analyzed</p>
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === "history" && (
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 text-muted-foreground" />
              <Input
                placeholder="Search chat history..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 text-sm"
              />
            </div>
            <div className="space-y-2">
              {filteredHistory.map((chat) => (
                <Card key={chat.id} className="p-3 hover:bg-secondary/50 cursor-pointer transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <History className="w-3 h-3 text-muted-foreground" />
                      <h5 className="text-sm font-medium text-foreground">{chat.title}</h5>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {chat.messageCount} messages
                    </Badge>
                  </div>
                  <p className="text-xs text-foreground/70 mb-1">{chat.preview}</p>
                  <p className="text-xs text-foreground/60">{new Date(chat.timestamp).toLocaleDateString()}</p>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Quick Actions */}
      <div>
        <h4 className="text-sm font-medium mb-3 text-foreground">Document Generation</h4>
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
