"use client"

import type { Deal } from "@/types/deal"
import type { TalentProfile } from "@/components/talent-selector"
import type { UploadedFile } from "@/components/file-upload-zone"

interface ExportData {
  talent?: TalentProfile
  deals: Deal[]
  files: UploadedFile[]
  exportedAt: string
  exportedBy?: string
}

interface GoogleSheetsResponse {
  success: boolean
  spreadsheetUrl?: string
  error?: string
}

export class ExportService {
  private static instance: ExportService
  private apiBaseUrl = "/api/export"

  static getInstance(): ExportService {
    if (!ExportService.instance) {
      ExportService.instance = new ExportService()
    }
    return ExportService.instance
  }

  async exportToGoogleSheets(data: ExportData): Promise<GoogleSheetsResponse> {
    try {
      // Simulate API call to backend Google Sheets integration
      const response = await fetch(`${this.apiBaseUrl}/sheets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data,
          sheetName: `Deals_${data.talent?.name || "Export"}_${new Date().toISOString().split("T")[0]}`,
        }),
      })

      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`)
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error("Google Sheets export failed:", error)

      // Fallback to CSV export
      this.exportToCSV(data)

      return {
        success: false,
        error: "Google Sheets export failed. Downloaded CSV instead.",
      }
    }
  }

  exportToCSV(data: ExportData): void {
    const csvContent = this.generateCSV(data)
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)

    const link = document.createElement("a")
    link.href = url
    link.download = `deals_export_${Date.now()}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  exportToJSON(data: ExportData): void {
    const jsonContent = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonContent], { type: "application/json" })
    const url = URL.createObjectURL(blob)

    const link = document.createElement("a")
    link.href = url
    link.download = `deals_export_${Date.now()}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  private generateCSV(data: ExportData): string {
    const headers = [
      "Brand",
      "Title",
      "Category",
      "Value Range",
      "Match Score",
      "Description",
      "Tags",
      "Deadline",
      "Requirements",
      "Engagement",
      "Reach",
      "Status",
      "Contact Name",
      "Contact Email",
      "Created At",
    ]

    const rows = data.deals.map((deal) => [
      deal.brand,
      deal.title,
      deal.category,
      deal.valueRange,
      deal.matchScore.toString(),
      deal.description,
      deal.tags.join("; "),
      deal.deadline || "",
      deal.requirements?.join("; ") || "",
      deal.engagement?.toString() || "",
      deal.reach || "",
      deal.status || "new",
      deal.contact?.name || "",
      deal.contact?.email || "",
      deal.createdAt,
    ])

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")),
    ].join("\n")

    return csvContent
  }

  async generateExportSummary(data: ExportData): Promise<string> {
    const totalValue = data.deals.reduce((sum, deal) => {
      const value = Number.parseInt(deal.valueRange.replace(/[^0-9]/g, "")) || 0
      return sum + value
    }, 0)

    const avgScore = data.deals.reduce((sum, deal) => sum + deal.matchScore, 0) / data.deals.length

    const summary = `
# Deal Export Summary

**Talent:** ${data.talent?.name || "N/A"}
**Export Date:** ${new Date(data.exportedAt).toLocaleString()}
**Total Deals:** ${data.deals.length}
**Average Match Score:** ${avgScore.toFixed(1)}/10
**Estimated Total Value:** $${totalValue.toLocaleString()}

## Top Deals by Match Score:
${data.deals
  .sort((a, b) => b.matchScore - a.matchScore)
  .slice(0, 5)
  .map((deal, idx) => `${idx + 1}. ${deal.brand} - ${deal.title} (${deal.matchScore}/10)`)
  .join("\n")}

## Categories:
${Array.from(new Set(data.deals.map((d) => d.category)))
  .map((cat) => `- ${cat}: ${data.deals.filter((d) => d.category === cat).length} deals`)
  .join("\n")}
    `.trim()

    return summary
  }
}
