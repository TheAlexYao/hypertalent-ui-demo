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
    <div className="flex h-full flex-col gap-3">
      <Card className="rounded-xl border border-border/40 bg-background/70 px-4 py-3">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{subtitle}</p>
      </Card>

      <Card className="flex-1 overflow-hidden rounded-xl border border-border/40 bg-background/60">
        <div className="h-full overflow-y-auto p-4">
          <ChatResultsPanel
            selectedTalent={selectedTalent}
            onTalentChange={onTalentChange}
            files={files}
            onFilesChange={onFilesChange}
          />
        </div>
      </Card>
    </div>
  )
}
