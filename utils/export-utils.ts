import type { Deal } from "@/types/deal"
import type { TalentProfile } from "@/components/talent-selector"

export const handleExport = (deals: Deal[], talent?: TalentProfile) => {
  // Export functionality - could integrate with Google Sheets API
  console.log("Exporting deals:", deals.length, "for talent:", talent?.name)

  // For now, download as JSON
  const exportData = {
    talent: talent,
    deals: deals,
    exportedAt: new Date().toISOString(),
    totalValue: deals.reduce((sum, deal) => {
      const value = Number.parseInt(deal.valueRange.replace(/[^0-9]/g, ""))
      return sum + value
    }, 0),
  }

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `deals-export-${talent?.name || "unknown"}-${new Date().toISOString().split("T")[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export const handleGenerateOutreach = (deal: Deal, talent?: TalentProfile) => {
  // Generate outreach functionality
  console.log("Generating outreach for deal:", deal.brand, "and talent:", talent?.name)

  // This would typically open the outreach modal or generate email content
  return {
    subject: `Partnership Opportunity: ${talent?.name} x ${deal.brand}`,
    body: `Dear ${deal.contact.name},\n\nI hope this email finds you well. I'm reaching out regarding a potential partnership opportunity between ${deal.brand} and ${talent?.name}.\n\nBest regards,\nDeal Hunter Team`,
    recipient: deal.contact.email,
  }
}
