// Attendance exports. Both formats render the same monthly register:
// rows = labour, columns = 1..N of the month, then P/H/A totals and payable wage.
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December']

const STATUS_LABEL = { P: 'Present', H: 'Half Day', A: 'Absent' }

export const monthName = (m) => MONTHS[m - 1] || ''

export function isoFor(year, month, day) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export function isSunday(year, month, day) {
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay() === 0
}

// jsPDF's built-in Helvetica has no rupee glyph, so PDFs spell it out as "Rs."
const inrPdf = (n) => `Rs. ${Number(n || 0).toLocaleString('en-IN')}`

/* Builds the shared table model so PDF and Excel can never drift apart. */
function buildGrid({ year, month, days, labours, records, totals }) {
  const dayCols = Array.from({ length: days }, (_, i) => i + 1)

  const head = ['#', 'Name', 'Role', ...dayCols.map(String), 'P', 'H', 'A', 'Days', 'Wage']

  const rows = labours.map((l, i) => {
    const marks = records[l._id] || {}
    const t = totals[l._id] || { P: 0, H: 0, A: 0, payableDays: 0, wage: 0 }
    return [
      i + 1,
      l.name,
      l.designation || '',
      ...dayCols.map((d) => marks[isoFor(year, month, d)]?.status || ''),
      t.P, t.H, t.A,
      t.payableDays,
      t.wage,
    ]
  })

  const grand = labours.reduce((acc, l) => {
    const t = totals[l._id] || {}
    acc.P += t.P || 0; acc.H += t.H || 0; acc.A += t.A || 0
    acc.days += t.payableDays || 0; acc.wage += t.wage || 0
    return acc
  }, { P: 0, H: 0, A: 0, days: 0, wage: 0 })

  const footer = [
    '', 'TOTAL', '',
    ...dayCols.map(() => ''),
    grand.P, grand.H, grand.A, grand.days, grand.wage,
  ]

  return { head, rows, footer, dayCols, grand }
}

const fileStem = (year, month) => `attendance-${monthName(month).toLowerCase()}-${year}`

/* ── Excel (.xlsx) ── */
export async function exportAttendanceExcel(data, company = 'Kartik Painter Services') {
  const XLSX = await import('xlsx')
  const { year, month } = data
  const { head, rows, footer, dayCols } = buildGrid(data)

  const aoa = [
    [company],
    [`Attendance Register — ${monthName(month)} ${year}`],
    ['Legend:', 'P = Present', 'H = Half Day', 'A = Absent'],
    [],
    head,
    ...rows,
    footer,
  ]

  const sheet = XLSX.utils.aoa_to_sheet(aoa)
  sheet['!cols'] = [
    { wch: 4 }, { wch: 22 }, { wch: 14 },
    ...dayCols.map(() => ({ wch: 3.5 })),
    { wch: 5 }, { wch: 5 }, { wch: 5 }, { wch: 7 }, { wch: 11 },
  ]
  sheet['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 5 } },
  ]

  // second sheet: plain summary, easier to read on a phone
  const summary = XLSX.utils.aoa_to_sheet([
    ['Name', 'Role', 'Phone', 'Present', 'Half Day', 'Absent', 'Payable Days', 'Daily Wage', 'Total Wage'],
    ...data.labours.map((l) => {
      const t = data.totals[l._id] || {}
      return [l.name, l.designation || '', l.phone || '', t.P || 0, t.H || 0, t.A || 0,
        t.payableDays || 0, l.dailyWage || 0, t.wage || 0]
    }),
  ])
  summary['!cols'] = [{ wch: 22 }, { wch: 14 }, { wch: 14 }, { wch: 9 }, { wch: 10 },
    { wch: 9 }, { wch: 13 }, { wch: 11 }, { wch: 12 }]

  const book = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(book, sheet, 'Register')
  XLSX.utils.book_append_sheet(book, summary, 'Summary')
  XLSX.writeFile(book, `${fileStem(year, month)}.xlsx`)
}

/* ── PDF (landscape A4) ── */
export async function exportAttendancePdf(data, company = 'Kartik Painter Services') {
  const [{ jsPDF }, autoTableMod] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ])
  const autoTable = autoTableMod.default || autoTableMod.autoTable

  const { year, month, days } = data
  const { head, rows, footer, grand } = buildGrid(data)

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()

  doc.setFont('helvetica', 'bold').setFontSize(14).setTextColor(10, 10, 10)
  doc.text(company, 8, 12)
  doc.setFont('helvetica', 'normal').setFontSize(10).setTextColor(90, 90, 90)
  doc.text(`Attendance Register — ${monthName(month)} ${year}`, 8, 17.5)
  doc.setFontSize(8)
  doc.text('P = Present    H = Half Day    A = Absent', pageW - 8, 12, { align: 'right' })
  doc.text(`Generated ${new Date().toLocaleDateString('en-IN')}`, pageW - 8, 17, { align: 'right' })

  const dayWidths = {}
  for (let d = 0; d < days; d += 1) {
    dayWidths[3 + d] = { cellWidth: 167 / days, halign: 'center' }
  }

  autoTable(doc, {
    head: [head],
    body: rows,
    foot: [footer],
    startY: 21,
    margin: { left: 8, right: 8, bottom: 12 },
    theme: 'grid',
    styles: { fontSize: 6, cellPadding: 0.9, lineColor: [225, 225, 225], lineWidth: 0.1, textColor: [40, 40, 40] },
    headStyles: { fillColor: [10, 10, 10], textColor: 255, fontSize: 6, halign: 'center', valign: 'middle' },
    footStyles: { fillColor: [244, 244, 242], textColor: [10, 10, 10], fontStyle: 'bold', fontSize: 6 },
    alternateRowStyles: { fillColor: [252, 252, 251] },
    columnStyles: {
      0: { cellWidth: 6, halign: 'center' },
      1: { cellWidth: 32, halign: 'left', fontStyle: 'bold' },
      2: { cellWidth: 20, halign: 'left', textColor: [115, 115, 115] },
      ...dayWidths,
      [3 + days]:     { cellWidth: 8,  halign: 'center' },
      [4 + days]:     { cellWidth: 8,  halign: 'center' },
      [5 + days]:     { cellWidth: 8,  halign: 'center' },
      [6 + days]:     { cellWidth: 10, halign: 'center', fontStyle: 'bold' },
      [7 + days]:     { cellWidth: 16, halign: 'right',  fontStyle: 'bold' },
    },
    didParseCell(hook) {
      const col = hook.column.index
      const dayNum = col - 2                       // columns 3..(2+days) hold day 1..days
      if (dayNum >= 1 && dayNum <= days && isSunday(year, month, dayNum)) {
        hook.cell.styles.fillColor = hook.section === 'head' ? [60, 60, 60] : [245, 240, 235]
      }
      if (hook.section === 'body' && dayNum >= 1 && dayNum <= days) {
        const v = hook.cell.raw
        if (v === 'A') hook.cell.styles.textColor = [200, 40, 40]
        else if (v === 'H') hook.cell.styles.textColor = [190, 120, 20]
        else if (v === 'P') hook.cell.styles.textColor = [25, 130, 70]
        hook.cell.styles.fontStyle = 'bold'
      }
      if (hook.section === 'foot' && col === 7 + days) hook.cell.text = [String(grand.wage)]
    },
    didDrawPage() {
      const page = doc.internal.getNumberOfPages()
      doc.setFontSize(7).setTextColor(150)
      doc.text(`Page ${page}`, pageW - 8, doc.internal.pageSize.getHeight() - 6, { align: 'right' })
    },
  })

  const afterY = (doc.lastAutoTable?.finalY || 21) + 6
  if (afterY < doc.internal.pageSize.getHeight() - 14) {
    doc.setFont('helvetica', 'normal').setFontSize(8).setTextColor(80)
    doc.text(
      `Crew: ${data.labours.length}    Present: ${grand.P}    Half Day: ${grand.H}    Absent: ${grand.A}    Payable Days: ${grand.days}    Total Wage: ${inrPdf(grand.wage)}`,
      8, afterY,
    )
  }

  doc.save(`${fileStem(year, month)}.pdf`)
}

export { STATUS_LABEL }
