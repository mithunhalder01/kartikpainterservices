// Strips all HTML tags — every text field in this app is plain text, never rich text,
// so a full sanitize-html allowlist engine is unnecessary (and its htmlparser2 dependency
// ships an ESM build that breaks `require()` under Vercel's Node runtime).
export function stripHtml(text = '') {
  return String(text).replace(/<[^>]*>/g, '').trim()
}
