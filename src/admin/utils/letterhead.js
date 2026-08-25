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
/* ── Designed letterhead mode ──
   A ready-made A4 design is printed as a full-page background and the document
   types inside the blank area the designer left. The text stays real text, so
   it is still crisp and selectable — only the stationery is an image. */

const num = (v, fallback) => (Number.isFinite(Number(v)) ? Number(v) : fallback)

// Where a document may write, in millimetres from the page edges.
export function contentBox(head = {}) {
  if (head.useSheet) {
    return {
      left:   num(head.sheetLeft, 18),
      right:  LAYOUT.pageW - num(head.sheetRight, 18),
      top:    num(head.sheetTop, 60),
      bottom: LAYOUT.pageH - num(head.sheetBottom, 65),
    }
  }
  return {
    left:   LAYOUT.margin,
    right:  LAYOUT.pageW - LAYOUT.margin,
    top:    LAYOUT.bodyTop,
    bottom: LAYOUT.pageH - LAYOUT.footerH - 10,
  }
}

export const boxWidth = (box) => box.right - box.left

// A designed sheet usually carries its own signature line and contact strip, so
// the document must not draw a second one over the top.
export const sheetHasSignature = (head = {}) => !!(head.useSheet && head.sheetHasSignature)

export async function prepareAssets(head = {}) {
  if (head.useSheet) return { sheet: await loadImage(head.sheetImageUrl), logo: null }
  return { sheet: null, logo: await loadImage(head.logoUrl) }
}

const imageFormat = (dataUrl) => (/^data:image\/(jpe?g)/i.test(dataUrl) ? 'JPEG' : 'PNG')

export function makePageFrame(doc, head, assets = {}) {
  const box = contentBox(head)

  const paint = () => {
    if (head.useSheet && assets.sheet) {
      // the alias makes jsPDF store the sheet once, however many pages use it
      doc.addImage(assets.sheet, imageFormat(assets.sheet), 0, 0,
        LAYOUT.pageW, LAYOUT.pageH, 'letterhead-sheet', 'FAST')
      return
    }
    drawHeader(doc, head, assets.logo)
    drawFooter(doc, head)
  }

  paint()
  return {
    box,
    bottomLimit: box.bottom,
    newPage() { doc.addPage(); paint(); return box.top },
  }
}
