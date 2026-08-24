import { LAYOUT, loadImage, drawHeader, drawFooter, hexToRgb } from './letterhead'
import { rupeePdf, amountInWords } from './money'

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December']

/* One A4 wage slip a worker can be handed at settlement time. */
export async function downloadWageSlip({ labour, row, entries, year, month }, head) {
  const [{ jsPDF }, autoTableMod] = await Promise.all([import('jspdf'), import('jspdf-autotable')])
  const autoTable = autoTableMod.default || autoTableMod.autoTable

  const { pageW, margin, bodyTop, footerH } = LAYOUT
  const accent = hexToRgb(head.accentColor)

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const logo = await loadImage(head.logoUrl)
  drawHeader(doc, head, logo)
  drawFooter(doc, head)

  let y = bodyTop
  doc.setFont('helvetica', 'bold').setFontSize(13).setTextColor(...accent)
  doc.text('WAGE SLIP', margin, y)
  doc.setFont('helvetica', 'normal').setFontSize(9).setTextColor(90, 90, 90)
  doc.text(`${MONTHS[month - 1]} ${year}`, pageW - margin, y, { align: 'right' })
  y += 9

  doc.setTextColor(20, 20, 20).setFont('helvetica', 'bold').setFontSize(11)
  doc.text(labour.name, margin, y); y += 5
  doc.setFont('helvetica', 'normal').setFontSize(9).setTextColor(90, 90, 90)
  doc.text([
    labour.designation || 'Worker',
    labour.phone && `Phone: ${labour.phone}`,
    labour.dailyWage && `Rate: ${rupeePdf(labour.dailyWage)}/day`,
    labour.overtimeRate ? `OT: ${rupeePdf(labour.overtimeRate)}/hr` : '',
  ].filter(Boolean).join('   •   '), margin, y)
  y += 8

  const body = [
    ['Present days', `${row.P}`, ''],
    ['Half days', `${row.H}`, ''],
    ['Absent days', `${row.A}`, ''],
    ['Payable days', `${row.payableDays}`, rupeePdf(row.dayWage)],
  ]
  if (row.overtimeHours) body.push(['Overtime hours', `${row.overtimeHours}`, rupeePdf(row.overtimePay)])
  if (row.bonus) body.push(['Bonus', '', rupeePdf(row.bonus)])
  body.push([{ content: 'Total earned', styles: { fontStyle: 'bold' } }, '',
    { content: rupeePdf(row.dayWage + row.overtimePay + row.bonus), styles: { fontStyle: 'bold' } }])
  if (row.advance) body.push(['Advance taken', '', `- ${rupeePdf(row.advance)}`])
  if (row.payment) body.push(['Already paid', '', `- ${rupeePdf(row.payment)}`])
  if (row.deduction) body.push(['Deduction', '', `- ${rupeePdf(row.deduction)}`])

  autoTable(doc, {
    head: [['Description', 'Count', 'Amount']],
    body,
    startY: y,
    margin: { left: margin, right: margin, bottom: footerH + 10 },
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 2, lineColor: [225, 225, 225], lineWidth: 0.1 },
    headStyles: { fillColor: [15, 15, 15], textColor: 255, fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 96 },
      1: { cellWidth: 28, halign: 'center' },
      2: { cellWidth: 50, halign: 'right' },
    },
  })

  y = (doc.lastAutoTable?.finalY || y) + 6

  doc.setFillColor(...accent)
  doc.rect(pageW - margin - 78, y, 78, 10, 'F')
  doc.setFont('helvetica', 'bold').setFontSize(11).setTextColor(255, 255, 255)
  doc.text('Net payable', pageW - margin - 75, y + 6.5)
  doc.text(rupeePdf(row.balance), pageW - margin - 3, y + 6.5, { align: 'right' })
  y += 15

  doc.setFont('helvetica', 'italic').setFontSize(8.5).setTextColor(70, 70, 70)
  doc.text(`In words: ${amountInWords(row.balance)}`, margin, y)
  y += 8

  if (entries?.length) {
    doc.setFont('helvetica', 'bold').setFontSize(9).setTextColor(20, 20, 20)
    doc.text('Payments this month', margin, y); y += 5
    doc.setFont('helvetica', 'normal').setFontSize(8.5).setTextColor(80, 80, 80)
    entries.slice(0, 12).forEach((e) => {
      doc.text(
        `${new Date(e.date).toLocaleDateString('en-IN')}  ·  ${e.type}  ·  ${rupeePdf(e.amount)}  ·  ${e.mode}${e.note ? `  ·  ${e.note}` : ''}`,
        margin, y,
      )
      y += 4.2
    })
    y += 4
  }

  /* Both sides sign the same sheet — that is the whole point of handing it over */
  y = Math.max(y + 8, 232)
  doc.setDrawColor(150, 150, 150).setLineWidth(0.3)
  doc.line(margin, y, margin + 55, y)
  doc.line(pageW - margin - 55, y, pageW - margin, y)
  doc.setFont('helvetica', 'normal').setFontSize(8.5).setTextColor(110, 110, 110)
  doc.text('Worker signature', margin, y + 4.5)
  doc.text('For ' + (head.companyName || ''), pageW - margin, y + 4.5, { align: 'right' })

  const stem = `wage-slip-${labour.name}-${MONTHS[month - 1]}-${year}`
    .toLowerCase().replace(/[^a-z0-9]+/g, '-')
  doc.save(`${stem}.pdf`)
}
