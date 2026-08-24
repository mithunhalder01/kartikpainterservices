// Money helpers shared by the quotation editor, the khata and the PDFs.
export const rupee = (n) => `₹${Math.round(Number(n) || 0).toLocaleString('en-IN')}`

// jsPDF's built-in Helvetica has no rupee glyph, so PDFs spell it out.
export const rupeePdf = (n) => `Rs. ${Math.round(Number(n) || 0).toLocaleString('en-IN')}`

const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100

export const lineAmount = (item) => round2((Number(item.qty) || 0) * (Number(item.rate) || 0))

// Mirrors server/utils/quoteTotals.js — the server stays the authority, this just
// keeps the editor's numbers live while typing.
export function computeTotals(quote) {
  const items = quote.items || []
  const byKind = { work: 0, material: 0, labour: 0 }
  let subtotal = 0

  for (const item of items) {
    const amount = lineAmount(item)
    subtotal += amount
    const kind = item.kind || 'work'
    byKind[kind] = round2((byKind[kind] || 0) + amount)
  }
  subtotal = round2(subtotal)

  const discountAmount = quote.discountIsPct
    ? round2(subtotal * (Number(quote.discount) || 0) / 100)
    : round2(Math.min(Number(quote.discount) || 0, subtotal))

  const taxable = round2(subtotal - discountAmount)
  const gstAmount = round2(taxable * (Number(quote.gstPercent) || 0) / 100)
  const grandTotal = Math.round(taxable + gstAmount)
  const cost = round2((Number(quote.materialCost) || 0) + (Number(quote.otherCost) || 0))

  return { subtotal, byKind, discountAmount, taxable, gstAmount, grandTotal, cost }
}

const ONES = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
  'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

function twoDigits(n) {
  if (n < 20) return ONES[n]
  const t = TENS[Math.floor(n / 10)]
  return n % 10 ? `${t} ${ONES[n % 10]}` : t
}

// Indian numbering — crore, lakh, thousand. Every bill here carries the amount
// in words, so this is not optional polish.
export function amountInWords(value) {
  let n = Math.round(Number(value) || 0)
  if (n <= 0) return 'Zero Rupees Only'

  const parts = []
  const units = [
    [10000000, 'Crore'],
    [100000, 'Lakh'],
    [1000, 'Thousand'],
    [100, 'Hundred'],
  ]
  for (const [divisor, label] of units) {
    if (n >= divisor) {
      const count = Math.floor(n / divisor)
      parts.push(`${twoDigits(count)} ${label}`)
      n %= divisor
    }
  }
  if (n > 0) parts.push(twoDigits(n))

  return `${parts.join(' ')} Rupees Only`
}
