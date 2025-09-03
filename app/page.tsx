"use client"

import React from "react"

import { useState, useRef, useCallback } from "react"
import { Sidebar } from "@/components/sidebar"
import { TopToolSelector } from "@/components/top-tool-selector"
import { HyperComputerTerminal } from "@/components/hyper-computer-terminal"
import { ResultsPanel } from "@/components/results-panel"
import { ProtectedRoute } from "@/components/auth/protected-route"
import type { UploadedFile } from "@/components/file-upload-zone"

export type ToolType = "chat" | "crawler" | "deal-hunter" | "gameplan" | "simulation"

export default function DealHunterPage() {
  const [activeTool, setActiveTool] = useState<ToolType>("deal-hunter")
  const [rightPanelWidth, setRightPanelWidth] = useState(384) // 96 * 4 = 384px (w-96)
  const [isResizing, setIsResizing] = useState(false)
  const [sharedFiles, setSharedFiles] = useState<UploadedFile[]>([])
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
  }, [])

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing || !containerRef.current) return

      const containerRect = containerRef.current.getBoundingClientRect()
      const newWidth = containerRect.right - e.clientX

      // Constrain width between 320px and 720px
      const constrainedWidth = Math.max(320, Math.min(720, newWidth))
      setRightPanelWidth(constrainedWidth)
    },
    [isResizing],
  )

  const handleMouseUp = useCallback(() => {
    setIsResizing(false)
  }, [])

  React.useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      document.body.style.cursor = "col-resize"
      document.body.style.userSelect = "none"
    } else {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
      document.body.style.cursor = ""
      document.body.style.userSelect = ""
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
      document.body.style.cursor = ""
      document.body.style.userSelect = ""
    }
  }, [isResizing, handleMouseMove, handleMouseUp])

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-background text-foreground luxury-fade-in">
        {/* Left Sidebar - Fixed 280px for more luxury spacing */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Tool Selector */}
          <TopToolSelector activeTool={activeTool} onToolChange={setActiveTool} />

          {/* Three Column Layout with refined spacing */}
          <div className="flex-1 flex min-h-0" ref={containerRef}>
            {/* Center - Hyper Computer Terminal */}
            <div className="flex-1 min-w-[680px] border-r border-border/50">
              <HyperComputerTerminal activeTool={activeTool} files={sharedFiles} />
            </div>

            <div
              className={`w-1 bg-border/30 hover:bg-border/60 cursor-col-resize transition-colors relative group ${
                isResizing ? "bg-border/80" : ""
              }`}
              onMouseDown={handleMouseDown}
            >
              <div className="absolute inset-y-0 -left-1 -right-1 group-hover:bg-border/20 transition-colors" />
            </div>

            {/* Right - Results Panel (Resizable) with dynamic width */}
            <div className="min-w-80 max-w-[720px] border-l border-border/20" style={{ width: rightPanelWidth }}>
              <ResultsPanel activeTool={activeTool} sharedFiles={sharedFiles} onSharedFilesChange={setSharedFiles} />
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
