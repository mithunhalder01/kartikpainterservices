import { LAYOUT, loadImage, drawHeader, drawFooter, hexToRgb, formatLetterDate } from './letterhead'
import { computeTotals, lineAmount, amountInWords, rupeePdf } from './money'

const KIND_LABEL = { work: '', material: 'Material', labour: 'Labour' }

export function quoteFileName(quote) {
  const stem = (quote.quoteNo || 'quotation').replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '')
  return `${stem.toLowerCase()}.pdf`
}

/* Groups line items under their section headings, in the order they first appear. */
function buildBody(items) {
  const sections = []
  const index = new Map()
  items.forEach((item) => {
    const key = (item.section || '').trim()
    if (!index.has(key)) { index.set(key, sections.length); sections.push({ key, items: [] }) }
    sections[index.get(key)].items.push(item)
  })

  const rows = []
  let n = 0
  const multiple = sections.length > 1 || (sections[0] && sections[0].key)

  for (const section of sections) {
    if (multiple && section.key) {
      rows.push([{
        content: section.key,
        colSpan: 6,
        styles: { fontStyle: 'bold', fillColor: [244, 244, 242], textColor: [40, 40, 40] },
      }])
    }
    for (const item of section.items) {
      n += 1
      const tag = KIND_LABEL[item.kind || 'work']
      rows.push([
        n,
        tag ? `${item.description}  (${tag})` : item.description,
        Number(item.qty) || 0,
        item.unit || '',
        rupeePdf(item.rate),
        rupeePdf(lineAmount(item)),
      ])
    }
  }
  return rows
}

export async function downloadQuotationPdf(quote, head) {
  const [{ jsPDF }, autoTableMod] = await Promise.all([import('jspdf'), import('jspdf-autotable')])
  const autoTable = autoTableMod.default || autoTableMod.autoTable

  const { pageW, pageH, margin, bodyTop, footerH } = LAYOUT
  const contentW = pageW - margin * 2
  const accent = hexToRgb(head.accentColor)
  const totals = computeTotals(quote)

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const logo = await loadImage(head.logoUrl)
  const frame = () => { drawHeader(doc, head, logo); drawFooter(doc, head) }

  let y = bodyTop

  /* Title row */
  doc.setFont('helvetica', 'bold').setFontSize(13).setTextColor(...accent)
  doc.text('QUOTATION', margin, y)
  doc.setFont('helvetica', 'normal').setFontSize(9).setTextColor(90, 90, 90)
  if (quote.quoteNo) doc.text(`No: ${quote.quoteNo}`, pageW - margin, y - 3.5, { align: 'right' })
  if (quote.quoteDate) doc.text(`Date: ${formatLetterDate(quote.quoteDate)}`, pageW - margin, y + 1, { align: 'right' })
  y += 8

  /* Customer */
  doc.setTextColor(20, 20, 20).setFontSize(9.5)
  doc.setFont('helvetica', 'normal')
  doc.text('To,', margin, y); y += 4.6
  doc.setFont('helvetica', 'bold').setFontSize(10.5)
  doc.text(quote.customerName || '', margin, y); y += 4.8
  doc.setFont('helvetica', 'normal').setFontSize(9).setTextColor(80, 80, 80)
  if (quote.customerAddress) {
    doc.splitTextToSize(quote.customerAddress, contentW * 0.6).forEach((line) => {
      doc.text(line, margin, y); y += 4.2
    })
  }
  if (quote.customerPhone) { doc.text(`Phone: ${quote.customerPhone}`, margin, y); y += 4.2 }
  y += 3

  if (quote.title) {
    doc.setFont('helvetica', 'bold').setFontSize(10).setTextColor(20, 20, 20)
    doc.splitTextToSize(`Work: ${quote.title}`, contentW).forEach((line) => {
      doc.text(line, margin, y); y += 4.8
    })
    y += 2
  }

  autoTable(doc, {
    head: [['#', 'Description', 'Qty', 'Unit', 'Rate', 'Amount']],
    body: buildBody(quote.items || []),
    startY: y,
    margin: { left: margin, right: margin, top: bodyTop, bottom: footerH + 10 },
    theme: 'grid',
    styles: { fontSize: 8.5, cellPadding: 1.8, lineColor: [225, 225, 225], lineWidth: 0.1, textColor: [35, 35, 35] },
    headStyles: { fillColor: [15, 15, 15], textColor: 255, fontSize: 8.5, halign: 'center' },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 74 },
      2: { cellWidth: 20, halign: 'right' },
      3: { cellWidth: 18, halign: 'center' },
      4: { cellWidth: 24, halign: 'right' },
      5: { cellWidth: 28, halign: 'right', fontStyle: 'bold' },
    },
    // every page of a multi-page quote keeps the letterhead and contact bar
    didDrawPage: () => frame(),
  })

  y = (doc.lastAutoTable?.finalY || y) + 6

  const ensure = (space) => {
    if (y + space > pageH - footerH - 10) { doc.addPage(); frame(); y = bodyTop }
  }

  /* Totals — right-aligned block */
  ensure(40)
  const boxW = 78
  const boxX = pageW - margin - boxW
  const rows = [
    ['Subtotal', rupeePdf(totals.subtotal)],
    totals.discountAmount > 0 && [
      quote.discountIsPct ? `Discount (${quote.discount}%)` : 'Discount',
      `- ${rupeePdf(totals.discountAmount)}`,
    ],
    Number(quote.gstPercent) > 0 && [`GST @ ${quote.gstPercent}%`, rupeePdf(totals.gstAmount)],
  ].filter(Boolean)

  doc.setFontSize(9).setFont('helvetica', 'normal').setTextColor(60, 60, 60)
  rows.forEach(([label, value]) => {
    doc.text(label, boxX, y)
    doc.text(value, pageW - margin, y, { align: 'right' })
    y += 5
  })

  doc.setFillColor(...accent)
  doc.rect(boxX - 3, y - 1.5, boxW + 3, 9, 'F')
  doc.setFont('helvetica', 'bold').setFontSize(10.5).setTextColor(255, 255, 255)
  doc.text('Total', boxX, y + 4.5)
  doc.text(rupeePdf(totals.grandTotal), pageW - margin, y + 4.5, { align: 'right' })
  y += 13

  /* Amount in words */
  ensure(12)
  doc.setFont('helvetica', 'italic').setFontSize(8.5).setTextColor(70, 70, 70)
  doc.splitTextToSize(`In words: ${amountInWords(totals.grandTotal)}`, contentW).forEach((line) => {
    doc.text(line, margin, y); y += 4.2
  })
  y += 4

  /* Terms */
  const terms = String(quote.terms || '').split('\n').map((t) => t.trim()).filter(Boolean)
  if (terms.length) {
    ensure(10 + terms.length * 4.2)
    doc.setFont('helvetica', 'bold').setFontSize(9).setTextColor(20, 20, 20)
    doc.text('Terms & Conditions', margin, y); y += 5
    doc.setFont('helvetica', 'normal').setFontSize(8.5).setTextColor(70, 70, 70)
    terms.forEach((term) => {
      doc.splitTextToSize(`•  ${term}`, contentW).forEach((line) => {
        ensure(5); doc.text(line, margin, y); y += 4.2
      })
    })
    y += 3
  }

  if (quote.validDays > 0) {
    ensure(6)
    doc.setFont('helvetica', 'normal').setFontSize(8).setTextColor(120, 120, 120)
    doc.text(`This quotation is valid for ${quote.validDays} days from the date above.`, margin, y)
    y += 6
  }

  /* Signature */
  ensure(28)
  y += 8
  doc.setDrawColor(150, 150, 150).setLineWidth(0.3)
  doc.line(pageW - margin - 55, y, pageW - margin, y)
  y += 5
  doc.setFont('helvetica', 'bold').setFontSize(9.5).setTextColor(30, 30, 30)
  if (quote.signName) doc.text(quote.signName, pageW - margin, y, { align: 'right' })
  y += 4.4
  doc.setFont('helvetica', 'normal').setFontSize(8).setTextColor(110, 110, 110)
  if (quote.signTitle) doc.text(quote.signTitle, pageW - margin, y, { align: 'right' })

  doc.save(quoteFileName(quote))
}

/* Short message for sharing the quote over WhatsApp. */
export function whatsappText(quote, head) {
  const totals = computeTotals(quote)
  return [
    `Namaste ${quote.customerName || ''}`.trim() + ',',
    '',
    `${head.companyName || 'Our'} quotation${quote.quoteNo ? ` (${quote.quoteNo})` : ''}${quote.title ? ` for ${quote.title}` : ''}:`,
    `Total: ${rupeePdf(totals.grandTotal)}`,
    quote.validDays > 0 ? `Valid for ${quote.validDays} days.` : '',
    '',
    'The detailed PDF is attached. Please let us know if you would like any changes.',
    head.phone ? `\n${head.companyName || ''} — ${head.phone}`.trim() : '',
  ].filter(Boolean).join('\n')
}
