// src/lib/utils/generateCertificatePDF.ts
// Client-side PDF generation using html2canvas + jsPDF (landscape, 900×636px)
//
// document.fonts.ready is awaited before capture so that Bebas Neue and
// DM Sans are fully loaded — without this, html2canvas renders fallback fonts.
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export async function generateCertificatePDF(
  elementId: string,
  filename: string
): Promise<void> {
  const element = document.getElementById(elementId)
  if (!element) throw new Error('Certificate element not found')

  // Wait for all web fonts to finish loading before capturing
  await document.fonts.ready

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#0a0a0a',
    logging: false,
  })

  const imgData = canvas.toDataURL('image/png')
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'px',
    format: [900, 636],
  })

  pdf.addImage(imgData, 'PNG', 0, 0, 900, 636)
  pdf.save(filename)
}
