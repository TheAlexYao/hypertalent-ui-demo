"use client"

import React from "react"

import { useState, useRef, useCallback } from "react"
import { Sidebar } from "@/components/sidebar"
import { TopToolSelector } from "@/components/top-tool-selector"
import { ResultsPanel } from "@/components/results-panel"
import { HyperComputerTerminal } from "@/components/hyper-computer-terminal"
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

          {/* Two Column Layout with refined spacing */}
          <div className="flex-1 flex min-h-0" ref={containerRef}>
            {activeTool === "deal-hunter" ? (
              // Deal Hunter: Full width results panel only
              <div className="flex-1 min-w-[680px]">
                <ResultsPanel activeTool={activeTool} sharedFiles={sharedFiles} onSharedFilesChange={setSharedFiles} />
              </div>
            ) : (
              // Other sections: Terminal + Results with resizable layout
              <>
                {/* Center - Terminal */}
                <div className="flex-1 min-w-[680px]">
                  <HyperComputerTerminal
                    activeTool={activeTool}
                    sharedFiles={sharedFiles}
                    onSharedFilesChange={setSharedFiles}
                  />
                </div>

                {/* Resize Handle */}
                <div
                  className="w-1 bg-border hover:bg-accent cursor-col-resize transition-colors"
                  onMouseDown={handleMouseDown}
                />

                {/* Right - Results Panel */}
                <div className="bg-card border-l" style={{ width: rightPanelWidth }}>
                  <ResultsPanel
                    activeTool={activeTool}
                    sharedFiles={sharedFiles}
                    onSharedFilesChange={setSharedFiles}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
