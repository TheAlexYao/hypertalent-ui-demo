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
  const [rightPanelWidth, setRightPanelWidth] = useState(352) // Default width for chat-focused layout
  const [isResizing, setIsResizing] = useState(false)
  const [sharedFiles, setSharedFiles] = useState<UploadedFile[]>([])
  const containerRef = useRef<HTMLDivElement>(null)
  const chatHasTerminal = activeTool === "chat"

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    if (chatHasTerminal) {
      setIsResizing(true)
    }
  }, [chatHasTerminal])

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing || !containerRef.current || !chatHasTerminal) return

      const containerRect = containerRef.current.getBoundingClientRect()
      const newWidth = containerRect.right - e.clientX

      // Constrain width between 320px and 480px for the chat results column
      const constrainedWidth = Math.max(320, Math.min(480, newWidth))
      setRightPanelWidth(constrainedWidth)
    },
    [isResizing, chatHasTerminal],
  )

  const handleMouseUp = useCallback(() => {
    setIsResizing(false)
  }, [])

  React.useEffect(() => {
    if (isResizing && chatHasTerminal) {
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
  }, [isResizing, handleMouseMove, handleMouseUp, chatHasTerminal])

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
            {chatHasTerminal && (
              <>
                {/* Center - Hyper Computer Terminal */}
                <div className="flex-1 min-w-[400px] border-r border-border/50">
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
              </>
            )}

            {/* Right - Results Panel (Resizable for other tools, full width for deal-hunter) */}
            <div
              className={
                chatHasTerminal
                  ? "min-w-[320px] max-w-[480px] border-l border-border/20"
                  : "flex-1"
              }
              style={chatHasTerminal ? { width: rightPanelWidth } : {}}
            >
              <ResultsPanel activeTool={activeTool} sharedFiles={sharedFiles} onSharedFilesChange={setSharedFiles} />
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
