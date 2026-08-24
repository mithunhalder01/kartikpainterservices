// Totals are computed here and never trusted from the client, so the amount a
// customer sees on the PDF is the same number the payment ledger works against.
const round = (n) => Math.round((Number(n) || 0) * 100) / 100

export function lineAmount(item) {
  return round((Number(item.qty) || 0) * (Number(item.rate) || 0))
}

export function computeTotals(quote) {
  const items = quote.items || []

  const byKind = { work: 0, material: 0, labour: 0 }
  let subtotal = 0
  for (const item of items) {
    const amount = lineAmount(item)
    subtotal += amount
    byKind[item.kind || 'work'] = round((byKind[item.kind || 'work'] || 0) + amount)
  }
  subtotal = round(subtotal)

  const discountAmount = quote.discountIsPct
    ? round(subtotal * (Number(quote.discount) || 0) / 100)
    : round(Math.min(Number(quote.discount) || 0, subtotal))

  const taxable = round(subtotal - discountAmount)
  const gstAmount = round(taxable * (Number(quote.gstPercent) || 0) / 100)
  const grandTotal = Math.round(taxable + gstAmount)   // invoices settle in whole rupees

  const cost = round((Number(quote.materialCost) || 0) + (Number(quote.otherCost) || 0))

  return { subtotal, byKind, discountAmount, taxable, gstAmount, grandTotal, cost }
}

// Indian financial year runs April → March.
export function financialYear(date = new Date()) {
  const y = date.getFullYear()
  const start = date.getMonth() >= 3 ? y : y - 1
  return `${start}-${String((start + 1) % 100).padStart(2, '0')}`
}
