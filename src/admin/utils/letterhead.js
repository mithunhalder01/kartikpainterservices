// Shared A4 letterhead: the branded band at the top and the contact bar at the
// bottom. Both the letter pad and the quotation print through these, so a change
// to the logo or the footer shows up on every document the business sends out.
export const LAYOUT = {
  pageW: 210,
  pageH: 297,
  margin: 18,
  headerH: 34,
  ruleY: 36,
  bodyTop: 48,
  footerH: 20,
  lineH: 5.6,
  fontSize: 10.5,
}

export function hexToRgb(hex) {
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

/* Loads an image URL into a data URL so jsPDF can embed it. Returns null on
   failure — a missing logo must never block a download. */
export async function loadImage(url) {
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

export function drawHeader(doc, head, logo) {
  const { margin, ruleY, pageW } = LAYOUT
  const accent = hexToRgb(head.accentColor)
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

export function drawFooter(doc, head) {
  const { pageW, pageH, footerH } = LAYOUT
  doc.setFillColor(...hexToRgb(head.accentColor))
  doc.rect(0, pageH - footerH, pageW, footerH, 'F')

  const lines = footerLines(head)
  doc.setTextColor(255, 255, 255).setFont('helvetica', 'normal')
  const startY = pageH - footerH + (footerH - (lines.length - 1) * 4) / 2 + 1
  lines.forEach((line, i) => {
    doc.setFontSize(i === 0 ? 8.5 : 7.5)
    doc.text(line, pageW / 2, startY + i * 4, { align: 'center', maxWidth: pageW - 20 })
  })
}

/* Every page gets the same furniture, so callers only track the body cursor. */
export function makePageFrame(doc, head, logo) {
  const paint = () => { drawHeader(doc, head, logo); drawFooter(doc, head) }
  paint()
  return {
    bottomLimit: LAYOUT.pageH - LAYOUT.footerH - 10,
    newPage() { doc.addPage(); paint(); return LAYOUT.bodyTop },
  }
}
