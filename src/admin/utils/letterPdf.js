import {
  LAYOUT, loadImage, makePageFrame, formatLetterDate, footerLines,
} from './letterhead'

// Re-exported so the letter pad page keeps importing from one place.
export { LAYOUT, formatLetterDate, footerLines }

export async function downloadLetterPdf(letter, head) {
  const { jsPDF } = await import('jspdf')
  const { pageW, margin, bodyTop, lineH } = LAYOUT
  const contentW = pageW - margin * 2

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const logo = await loadImage(head.logoUrl)
  const frame = makePageFrame(doc, head, logo)

  let y = bodyTop
  const need = (space) => { if (y + space > frame.bottomLimit) y = frame.newPage() }

  /* Ref + date, on one line under the rule */
  doc.setFont('helvetica', 'normal').setFontSize(9).setTextColor(90, 90, 90)
  if (letter.refNo) doc.text(`Ref: ${letter.refNo}`, margin, y)
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
    doc.splitTextToSize(`Subject: ${letter.subject}`, contentW).forEach((line) => {
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
