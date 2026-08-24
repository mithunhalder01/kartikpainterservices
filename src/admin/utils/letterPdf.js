// A4 letterpad renderer. The on-screen preview (Letterpad.jsx) and this file share
// the LAYOUT constants below in millimetres, so what you see is what gets printed.
export const LAYOUT = {
  pageW: 210,
  pageH: 297,
  margin: 18,
  headerH: 34,      // logo / company / ref+date band
  ruleY: 36,
  bodyTop: 48,
  footerH: 20,      // accent bar pinned to the bottom edge
  lineH: 5.6,
  fontSize: 10.5,
}

const hexToRgb = (hex) => {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex || '')
  if (!m) return [224, 122, 58]
  const n = parseInt(m[1], 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

export function formatLetterDate(iso) {
  if (!iso) return ''
  const d = new Date(`${iso}T00:00:00`)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
}

/* Loads an image URL into a data URL so jsPDF can embed it. Returns null on failure
   (missing logo must never block the download). */
async function loadImage(url) {
  if (!url) return null
  try {
    const res = await fetch(url, { mode: 'cors' })
    if (!res.ok) return null
    const blob = await res.blob()
    return await new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = () => resolve(null)
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

const compact = (parts, sep = '   •   ') => parts.filter(Boolean).join(sep)

export function footerLines(head) {
  return [
    compact([
      head.website,
      [head.phone, head.altPhone].filter(Boolean).join(' / '),
      head.email,
    ]),
    head.address || '',
    compact([
      head.instagram && `Instagram: ${head.instagram}`,
      head.facebook && `Facebook: ${head.facebook}`,
      head.youtube && `YouTube: ${head.youtube}`,
    ]),
  ].filter(Boolean)
}

export async function downloadLetterPdf(letter, head) {
  const { jsPDF } = await import('jspdf')
  const { pageW, pageH, margin, ruleY, bodyTop, footerH, lineH } = LAYOUT
  const accent = hexToRgb(head.accentColor)
  const contentW = pageW - margin * 2

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const logo = await loadImage(head.logoUrl)

  const drawHeader = () => {
    let textX = margin
    if (logo) {
      try {
        const props = doc.getImageProperties(logo)
        const h = 15
        const w = Math.min(48, (props.width / props.height) * h)
        doc.addImage(logo, margin, 13, w, h, undefined, 'FAST')
        textX = margin + w + 5
      } catch {
        textX = margin
      }
    }

    doc.setTextColor(15, 15, 15).setFont('helvetica', 'bold').setFontSize(15)
    doc.text(head.companyName || '', textX, 20)
    if (head.tagline) {
      doc.setFont('helvetica', 'normal').setFontSize(8).setTextColor(110, 110, 110)
      doc.text(head.tagline, textX, 25)
    }
    if (head.gst) {
      doc.setFont('helvetica', 'normal').setFontSize(7.5).setTextColor(140, 140, 140)
      doc.text(`GSTIN: ${head.gst}`, textX, 29.5)
    }

    doc.setDrawColor(...accent).setLineWidth(0.9)
    doc.line(margin, ruleY, pageW - margin, ruleY)
    doc.setDrawColor(215, 215, 215).setLineWidth(0.25)
    doc.line(margin, ruleY + 1.4, pageW - margin, ruleY + 1.4)
  }

  const drawFooter = () => {
    doc.setFillColor(...accent)
    doc.rect(0, pageH - footerH, pageW, footerH, 'F')

    const lines = footerLines(head)
    doc.setTextColor(255, 255, 255).setFont('helvetica', 'normal')
    const startY = pageH - footerH + (footerH - (lines.length - 1) * 4) / 2 + 1
    lines.forEach((line, i) => {
      doc.setFontSize(i === 0 ? 8.5 : 7.5)
      doc.text(line, pageW / 2, startY + i * 4, { align: 'center', maxWidth: pageW - 20 })
    })
  }

  drawHeader()
  drawFooter()

  let y = bodyTop
  const bottomLimit = pageH - footerH - 10

  const newPage = () => {
    doc.addPage()
    drawHeader()
    drawFooter()
    y = bodyTop
  }
  const need = (space) => { if (y + space > bottomLimit) newPage() }

  /* Ref + date, right aligned under the rule */
  doc.setFont('helvetica', 'normal').setFontSize(9).setTextColor(90, 90, 90)
  if (letter.refNo) {
    doc.text(`Ref: ${letter.refNo}`, margin, y)
  }
  if (letter.letterDate) {
    doc.text(`Date: ${formatLetterDate(letter.letterDate)}`, pageW - margin, y, { align: 'right' })
  }
  if (letter.refNo || letter.letterDate) y += 10

  /* Recipient */
  doc.setTextColor(20, 20, 20)
  if (letter.toName || letter.toAddress) {
    doc.setFont('helvetica', 'normal').setFontSize(10)
    doc.text('To,', margin, y); y += lineH
    if (letter.toName) {
      doc.setFont('helvetica', 'bold')
      doc.text(letter.toName, margin, y); y += lineH
    }
    if (letter.toAddress) {
      doc.setFont('helvetica', 'normal')
      doc.splitTextToSize(letter.toAddress, contentW * 0.6).forEach((line) => {
        need(lineH); doc.text(line, margin, y); y += lineH
      })
    }
    y += 5
  }

  /* Subject */
  if (letter.subject) {
    need(lineH * 2)
    doc.setFont('helvetica', 'bold').setFontSize(10.5)
    const subject = `Subject: ${letter.subject}`
    doc.splitTextToSize(subject, contentW).forEach((line) => {
      need(lineH); doc.text(line, margin, y); y += lineH
    })
    y += 4
  }

  /* Salutation */
  if (letter.salutation) {
    need(lineH)
    doc.setFont('helvetica', 'normal').setFontSize(10.5)
    doc.text(letter.salutation, margin, y)
    y += lineH + 3
  }

  /* Body — blank lines separate paragraphs */
  doc.setFont('helvetica', 'normal').setFontSize(LAYOUT.fontSize).setTextColor(30, 30, 30)
  const paragraphs = String(letter.body || '').split(/\n\s*\n/)
  paragraphs.forEach((para, pIndex) => {
    para.split('\n').forEach((raw) => {
      const text = raw.trim()
      if (!text) { y += lineH * 0.5; return }
      doc.splitTextToSize(text, contentW).forEach((line) => {
        need(lineH)
        doc.text(line, margin, y)
        y += lineH
      })
    })
    if (pIndex < paragraphs.length - 1) y += lineH * 0.7
  })

  /* Signature block */
  need(34)
  y += 10
  doc.setFont('helvetica', 'normal').setFontSize(10).setTextColor(30, 30, 30)
  if (letter.closing) { doc.text(letter.closing, margin, y); y += 18 }
  else y += 14

  doc.setDrawColor(150, 150, 150).setLineWidth(0.3)
  doc.line(margin, y, margin + 55, y)
  y += 5
  if (letter.signName) {
    doc.setFont('helvetica', 'bold').setFontSize(10)
    doc.text(letter.signName, margin, y); y += 4.6
  }
  if (letter.signTitle) {
    doc.setFont('helvetica', 'normal').setFontSize(8.5).setTextColor(110, 110, 110)
    doc.text(letter.signTitle, margin, y); y += 4.6
  }
  if (head.footerNote) {
    doc.setFont('helvetica', 'italic').setFontSize(7.5).setTextColor(150, 150, 150)
    doc.text(head.footerNote, margin, y + 2)
  }

  const stem = (letter.title || letter.subject || 'letter')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'letter'
  doc.save(`${stem}.pdf`)
}
