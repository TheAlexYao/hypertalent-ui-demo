"use client"

import { Card } from "@/components/ui/card"
import type { UploadedFile } from "./file-upload-zone"
import type { TalentProfile } from "./talent-selector"
import { ChatResultsPanel } from "./tools/chat-results-panel"

interface ChatSidebarProps {
  title: string
  subtitle: string
  selectedTalent?: TalentProfile
  onTalentChange: (talent: TalentProfile) => void
  files: UploadedFile[]
  onFilesChange: (files: UploadedFile[]) => void
}

export function ChatSidebar({
  title,
  subtitle,
  selectedTalent,
  onTalentChange,
  files,
  onFilesChange,
}: ChatSidebarProps) {
  return (
    <Card className="flex-1 overflow-hidden rounded-2xl border border-border/40 bg-background/60">
      <div className="h-full overflow-y-auto p-4">
        <ChatResultsPanel
          title={title}
          subtitle={subtitle}
          selectedTalent={selectedTalent}
          onTalentChange={onTalentChange}
          files={files}
          onFilesChange={onFilesChange}
        />
      </div>
    </Card>
  )
}
