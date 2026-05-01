import jsPDF from "jspdf"
import html2canvas from "html2canvas"

export async function exportInsightsPDF(
  chartsElement: HTMLElement,
  summaryData: {
    dateRange: string
    totalSpent: number
    recurringTotal: number
    categoryBreakdown: { name: string; amount: number }[]
    topSubscriptions: { merchant: string; amount: number }[]
  }
) {
  const pdf = new jsPDF("p", "mm", "a4")
  const pageWidth = pdf.internal.pageSize.getWidth()

  // Title
  pdf.setFontSize(20)
  pdf.setTextColor(30, 30, 30)
  pdf.text("Tallyr — Insights Report", 14, 20)

  // Date range
  pdf.setFontSize(10)
  pdf.setTextColor(120, 120, 120)
  pdf.text(`Period: ${summaryData.dateRange}`, 14, 28)
  pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 34)

  // Summary
  pdf.setFontSize(12)
  pdf.setTextColor(30, 30, 30)
  pdf.text("Summary", 14, 46)

  pdf.setFontSize(10)
  pdf.setTextColor(60, 60, 60)
  pdf.text(`Total Spent: $${summaryData.totalSpent.toFixed(2)}`, 14, 54)
  pdf.text(`Recurring Total: $${summaryData.recurringTotal.toFixed(2)}/mo`, 14, 60)

  // Category breakdown
  let y = 72
  pdf.setFontSize(12)
  pdf.setTextColor(30, 30, 30)
  pdf.text("Category Breakdown", 14, y)
  y += 8

  pdf.setFontSize(9)
  pdf.setTextColor(60, 60, 60)
  for (const cat of summaryData.categoryBreakdown.slice(0, 12)) {
    pdf.text(`${cat.name}: $${cat.amount.toFixed(2)}`, 14, y)
    y += 6
  }

  // Top subscriptions
  y += 4
  pdf.setFontSize(12)
  pdf.setTextColor(30, 30, 30)
  pdf.text("Top Subscriptions", 14, y)
  y += 8

  pdf.setFontSize(9)
  pdf.setTextColor(60, 60, 60)
  for (const sub of summaryData.topSubscriptions) {
    pdf.text(`${sub.merchant}: $${sub.amount.toFixed(2)}/mo`, 14, y)
    y += 6
  }

  // Chart snapshots
  try {
    const canvas = await html2canvas(chartsElement, {
      scale: 2,
      backgroundColor: "#ffffff",
      logging: false,
    })
    const imgData = canvas.toDataURL("image/png")
    const imgWidth = pageWidth - 28
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    // If charts won't fit on first page, add a new page
    if (y + imgHeight + 10 > pdf.internal.pageSize.getHeight()) {
      pdf.addPage()
      y = 20
    } else {
      y += 8
    }

    pdf.addImage(imgData, "PNG", 14, y, imgWidth, imgHeight)
  } catch {
    // Skip charts if html2canvas fails
  }

  pdf.save("tallyr-insights.pdf")
}
