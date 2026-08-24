import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Download, Save, FilePlus2, Trash2, Loader2, Settings2, FileText,
  ImagePlus, Check, ChevronDown,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../api/client'
import ConfirmDialog from '../components/ConfirmDialog'
import { downloadLetterPdf, formatLetterDate, footerLines, LAYOUT } from '../utils/letterPdf'

const MM = 3.7795275591           // 1mm in CSS px at 96dpi
const PAGE_W = LAYOUT.pageW * MM  // 793.7
const PAGE_H = LAYOUT.pageH * MM  // 1122.5

const field = 'w-full px-3 py-2 text-[13px] border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent'
const label = 'block text-[11.5px] font-medium text-text-muted mb-1'

const todayISO = () => new Date().toISOString().slice(0, 10)

const BLANK = {
  title: '', refNo: '', letterDate: todayISO(), toName: '', toAddress: '',
  subject: '', salutation: 'Dear Sir/Madam,', body: '',
  closing: 'Yours faithfully,', signName: '', signTitle: '',
}

/* ── The A4 sheet. Sizes are in mm so it matches letterPdf.js one-for-one. ── */
function LetterSheet({ letter, head }) {
  const mm = (v) => `${v}mm`
  const accent = head.accentColor || '#E07A3A'
  const lines = footerLines(head)

  return (
    <div
      className="bg-white shadow-[0_4px_24px_rgba(0,0,0,0.10)] relative overflow-hidden"
      style={{ width: mm(LAYOUT.pageW), height: mm(LAYOUT.pageH), fontFamily: 'Helvetica, Arial, sans-serif', color: '#141414' }}
    >
      {/* header */}
      <div className="flex items-start justify-between"
        style={{ padding: `${mm(13)} ${mm(LAYOUT.margin)} 0` }}>
        <div className="flex items-start" style={{ gap: mm(5) }}>
          {head.logoUrl && (
            <img src={head.logoUrl} alt="" style={{ height: mm(15), maxWidth: mm(48), objectFit: 'contain' }} />
          )}
          <div style={{ paddingTop: mm(2) }}>
            <p style={{ fontSize: mm(5.3), fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.01em' }}>
              {head.companyName}
            </p>
            {head.tagline && (
              <p style={{ fontSize: mm(2.8), color: '#6e6e6e', marginTop: mm(1.4) }}>{head.tagline}</p>
            )}
            {head.gst && (
              <p style={{ fontSize: mm(2.6), color: '#8c8c8c', marginTop: mm(1.2) }}>GSTIN: {head.gst}</p>
            )}
          </div>
        </div>
      </div>

      {/* rules */}
      <div style={{ position: 'absolute', left: mm(LAYOUT.margin), right: mm(LAYOUT.margin), top: mm(LAYOUT.ruleY) }}>
        <div style={{ height: mm(0.9), background: accent }} />
        <div style={{ height: mm(0.25), background: '#d7d7d7', marginTop: mm(1.1) }} />
      </div>

      {/* body */}
      <div style={{
        position: 'absolute',
        left: mm(LAYOUT.margin), right: mm(LAYOUT.margin),
        top: mm(LAYOUT.bodyTop - 3.5), bottom: mm(LAYOUT.footerH + 6),
        fontSize: mm(3.7), lineHeight: 1.52, overflow: 'hidden',
      }}>
        {(letter.refNo || letter.letterDate) && (
          <div className="flex justify-between" style={{ fontSize: mm(3.2), color: '#5a5a5a', marginBottom: mm(6) }}>
            <span>{letter.refNo ? `Ref: ${letter.refNo}` : ''}</span>
            <span>{letter.letterDate ? `Date: ${formatLetterDate(letter.letterDate)}` : ''}</span>
          </div>
        )}

        {(letter.toName || letter.toAddress) && (
          <div style={{ marginBottom: mm(5) }}>
            <p>To,</p>
            {letter.toName && <p style={{ fontWeight: 700 }}>{letter.toName}</p>}
            {letter.toAddress && (
              <p style={{ whiteSpace: 'pre-wrap', maxWidth: '62%' }}>{letter.toAddress}</p>
            )}
          </div>
        )}

        {letter.subject && (
          <p style={{ fontWeight: 700, marginBottom: mm(4) }}>Subject: {letter.subject}</p>
        )}

        {letter.salutation && <p style={{ marginBottom: mm(3) }}>{letter.salutation}</p>}

        <div style={{ whiteSpace: 'pre-wrap' }}>{letter.body}</div>

        <div style={{ marginTop: mm(12) }}>
          {letter.closing && <p style={{ marginBottom: mm(13) }}>{letter.closing}</p>}
          <div style={{ width: mm(55), borderTop: '0.3mm solid #969696' }} />
          {letter.signName && <p style={{ fontWeight: 700, marginTop: mm(1.8) }}>{letter.signName}</p>}
          {letter.signTitle && <p style={{ fontSize: mm(3), color: '#6e6e6e' }}>{letter.signTitle}</p>}
          {head.footerNote && (
            <p style={{ fontSize: mm(2.6), color: '#969696', fontStyle: 'italic', marginTop: mm(2) }}>{head.footerNote}</p>
          )}
        </div>
      </div>

      {/* footer bar */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        height: mm(LAYOUT.footerH), background: accent, color: '#fff',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: mm(1.2), padding: `0 ${mm(10)}`, textAlign: 'center',
      }}>
        {lines.map((line, i) => (
          <p key={i} style={{ fontSize: mm(i === 0 ? 3 : 2.65), lineHeight: 1.2, opacity: i === 0 ? 1 : 0.92 }}>
            {line}
          </p>
        ))}
      </div>
    </div>
  )
}

/* ── Letterhead editor ── */
function HeadEditor({ head, onSaved }) {
  const [form, setForm] = useState(head)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef(null)
  const queryClient = useQueryClient()

  useEffect(() => { setForm(head) }, [head])

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const saveMutation = useMutation({
    mutationFn: () => {
      const { logoPublicId, ...payload } = form
      return api.put('/admin/letters/settings', payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['letterhead'] })
      toast.success('Letterhead saved')
      onSaved?.()
    },
    onError: (err) => toast.error(err.message || 'Could not save'),
  })

  const uploadLogo = async (file) => {
    if (!file) return
    setUploading(true)
    try {
      const body = new FormData()
      body.append('image', file)
      const next = await api.post('/admin/letters/settings/logo', body, { isForm: true })
      setForm(next)
      queryClient.invalidateQueries({ queryKey: ['letterhead'] })
      toast.success('Logo updated')
    } catch (err) {
      toast.error(err.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const rows = [
    ['companyName', 'Company name'], ['tagline', 'Tagline'], ['gst', 'GSTIN'],
    ['website', 'Website URL'], ['phone', 'Mobile number'], ['altPhone', 'Alternate number'],
    ['email', 'Email'], ['address', 'Address'],
    ['instagram', 'Instagram'], ['facebook', 'Facebook'], ['youtube', 'YouTube'],
    ['footerNote', 'Small note under signature'],
  ]

  return (
    <div className="space-y-3.5">
      <div>
        <label className={label}>Logo (top-left of the page)</label>
        <div className="flex items-center gap-3">
          <div className="w-20 h-14 rounded-lg border border-border bg-surface flex items-center justify-center overflow-hidden shrink-0">
            {form.logoUrl
              ? <img src={form.logoUrl} alt="" className="max-w-full max-h-full object-contain" />
              : <ImagePlus size={18} className="text-text-subtle" />}
          </div>
          <div className="flex-1">
            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => uploadLogo(e.target.files?.[0])} />
            <button onClick={() => fileRef.current?.click()} disabled={uploading}
              className="px-3 py-1.5 text-[12.5px] font-medium border border-border rounded-md hover:bg-surface transition-colors disabled:opacity-60">
              {uploading ? <Loader2 size={13} className="animate-spin inline" /> : 'Upload logo'}
            </button>
            <p className="text-[11px] text-text-subtle mt-1">PNG with transparent background works best.</p>
          </div>
        </div>
      </div>

      {rows.map(([key, text]) => (
        <div key={key}>
          <label className={label}>{text}</label>
          <input value={form[key] || ''} onChange={set(key)} className={field} />
        </div>
      ))}

      <div>
        <label className={label}>Accent colour (line + footer bar)</label>
        <div className="flex items-center gap-2">
          <input type="color" value={form.accentColor || '#E07A3A'} onChange={set('accentColor')}
            className="w-11 h-9 rounded-md border border-border cursor-pointer bg-white" />
          <input value={form.accentColor || ''} onChange={set('accentColor')} className={field} />
        </div>
      </div>

      <button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}
        className="btn-accent w-full justify-center py-2.5 text-[13px] disabled:opacity-60">
        {saveMutation.isPending ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
        Save Letterhead
      </button>
    </div>
  )
}

/* ── Page ── */
export default function Letterpad() {
  const [tab, setTab] = useState('letter')
  const [letter, setLetter] = useState(BLANK)
  const [letterId, setLetterId] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [listOpen, setListOpen] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [scale, setScale] = useState(1)
  const [view, setView] = useState('write')   // phones show one pane at a time
  const wrapRef = useRef(null)
  const queryClient = useQueryClient()

  const { data: head } = useQuery({
    queryKey: ['letterhead'],
    queryFn: () => api.get('/admin/letters/settings'),
  })

  const { data: letters } = useQuery({
    queryKey: ['letters'],
    queryFn: () => api.get('/admin/letters'),
  })

  // fit the A4 sheet to whatever width the preview column has
  useLayoutEffect(() => {
    const el = wrapRef.current
    if (!el) return undefined
    const fit = () => setScale(Math.min(1, Math.max(0.2, (el.clientWidth - 8) / PAGE_W)))
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const set = (k) => (e) => setLetter((l) => ({ ...l, [k]: e.target.value }))

  const saveMutation = useMutation({
    mutationFn: ({ asNew }) => (letterId && !asNew
      ? api.put(`/admin/letters/${letterId}`, letter)
      : api.post('/admin/letters', letter)),
    onSuccess: (saved) => {
      setLetterId(saved._id)
      queryClient.invalidateQueries({ queryKey: ['letters'] })
      toast.success('Letter saved')
    },
    onError: (err) => toast.error(err.message || 'Could not save'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/letters/${id}`),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['letters'] })
      if (id === letterId) { setLetterId(null); setLetter(BLANK) }
      setDeleteTarget(null)
      toast.success('Letter deleted')
    },
    onError: (err) => toast.error(err.message || 'Delete failed'),
  })

  const load = (saved) => {
    setLetter({ ...BLANK, ...saved, letterDate: saved.letterDate || todayISO() })
    setLetterId(saved._id)
    setListOpen(false)
    setTab('letter')
  }

  const startNew = () => { setLetter(BLANK); setLetterId(null); setListOpen(false); setTab('letter') }

  const download = async () => {
    setDownloading(true)
    try {
      await downloadLetterPdf(letter, head || {})
      toast.success('PDF downloaded')
    } catch (err) {
      toast.error(err?.message || 'Could not generate PDF')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="flex flex-col lg:h-[calc(100vh-140px)] lg:min-h-[560px]">
      {/* page header — stays visible in both mobile panes */}
      <div className="flex items-center justify-between gap-3 mb-3 shrink-0">
        <div className="min-w-0">
          <h1 className="text-[18px] font-bold text-text-primary">Letter Pad</h1>
          <p className="text-[12px] text-text-muted hidden sm:block">
            A4 · preview shows page 1 — a long letter continues onto page 2 in the PDF
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex lg:hidden items-center p-0.5 bg-surface rounded-lg">
            {[['write', 'Write'], ['preview', 'Preview']].map(([key, text]) => (
              <button key={key} onClick={() => setView(key)}
                className={`px-2.5 py-1.5 text-[12px] font-medium rounded-md transition-colors
                  ${view === key ? 'bg-white text-text-primary shadow-sm' : 'text-text-muted'}`}>
                {text}
              </button>
            ))}
          </div>
          <button onClick={download} disabled={downloading}
            className="btn-accent px-3 sm:px-4 py-2 text-[13px] disabled:opacity-60">
            {downloading ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
            <span className="hidden sm:inline">Download PDF</span>
            <span className="sm:hidden">PDF</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">
      {/* editor box */}
      <div className={`w-full lg:w-[360px] shrink-0 flex-col rounded-2xl border border-border bg-white overflow-hidden
                       ${view === 'preview' ? 'hidden lg:flex' : 'flex'}`}>
        <div className="flex items-center gap-1 p-1.5 border-b border-border bg-surface/60 shrink-0">
          {[
            { key: 'letter', label: 'Letter', icon: FileText },
            { key: 'head', label: 'Letterhead', icon: Settings2 },
          ].map(({ key, label: l, icon: Icon }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[12.5px] font-medium rounded-lg transition-colors
                ${tab === key ? 'bg-white text-text-primary shadow-sm' : 'text-text-muted hover:text-text-primary'}`}>
              <Icon size={14} /> {l}
            </button>
          ))}
        </div>

        <div className="lg:flex-1 lg:overflow-y-auto p-4">
          {tab === 'head' ? (
            <HeadEditor head={head || {}} />
          ) : (
            <div className="space-y-3.5">
              <div className="relative">
                <button onClick={() => setListOpen((o) => !o)}
                  className="w-full flex items-center justify-between px-3 py-2 text-[12.5px] border border-border rounded-md hover:bg-surface transition-colors">
                  <span className="truncate text-text-muted">
                    {letterId ? letter.title || 'Untitled letter' : 'Saved letters'}
                  </span>
                  <ChevronDown size={14} className="text-text-subtle shrink-0" />
                </button>
                {listOpen && (
                  <div className="absolute z-30 left-0 right-0 mt-1 bg-white border border-border rounded-xl shadow-xl max-h-64 overflow-y-auto">
                    <button onClick={startNew}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-[12.5px] font-medium text-accent hover:bg-surface transition-colors border-b border-border">
                      <FilePlus2 size={14} /> New blank letter
                    </button>
                    {letters?.length ? letters.map((s) => (
                      <div key={s._id} className="flex items-center border-b border-border last:border-0">
                        <button onClick={() => load(s)} className="flex-1 text-left px-3 py-2 hover:bg-surface transition-colors min-w-0">
                          <p className="text-[12.5px] font-medium text-text-primary truncate">{s.title || s.subject || 'Untitled'}</p>
                          <p className="text-[11px] text-text-subtle">{new Date(s.updatedAt).toLocaleDateString('en-IN')}</p>
                        </button>
                        <button onClick={() => setDeleteTarget(s)}
                          className="p-2 text-text-subtle hover:text-red-600 transition-colors">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )) : <p className="px-3 py-4 text-[12.5px] text-text-subtle text-center">No saved letters yet</p>}
                  </div>
                )}
              </div>

              <div>
                <label className={label}>Letter name (for your list only)</label>
                <input value={letter.title} onChange={set('title')} className={field} placeholder="Quotation — Sector 62" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={label}>Ref. no.</label>
                  <input value={letter.refNo} onChange={set('refNo')} className={field} placeholder="KPS/2026/014" />
                </div>
                <div>
                  <label className={label}>Date</label>
                  <input type="date" value={letter.letterDate} onChange={set('letterDate')} className={field} />
                </div>
              </div>

              <div>
                <label className={label}>To (name)</label>
                <input value={letter.toName} onChange={set('toName')} className={field} placeholder="Mr. Sharma" />
              </div>
              <div>
                <label className={label}>To (address)</label>
                <textarea rows={2} value={letter.toAddress} onChange={set('toAddress')} className={field} />
              </div>
              <div>
                <label className={label}>Subject</label>
                <input value={letter.subject} onChange={set('subject')} className={field} placeholder="Quotation for interior painting" />
              </div>
              <div>
                <label className={label}>Salutation</label>
                <input value={letter.salutation} onChange={set('salutation')} className={field} />
              </div>
              <div>
                <label className={label}>Body — leave a blank line between paragraphs</label>
                <textarea rows={12} value={letter.body} onChange={set('body')} className={`${field} leading-relaxed`}
                  placeholder="Type the letter here…" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className={label}>Closing</label>
                  <input value={letter.closing} onChange={set('closing')} className={field} />
                </div>
                <div>
                  <label className={label}>Signature name</label>
                  <input value={letter.signName} onChange={set('signName')} className={field} placeholder="Kartik Halder" />
                </div>
                <div>
                  <label className={label}>Designation</label>
                  <input value={letter.signTitle} onChange={set('signTitle')} className={field} placeholder="Proprietor" />
                </div>
              </div>
            </div>
          )}
        </div>

        {tab === 'letter' && (
          <div className="flex gap-2 p-3 border-t border-border bg-surface/50 shrink-0">
            <button onClick={() => saveMutation.mutate({ asNew: false })} disabled={saveMutation.isPending}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 text-[12.5px] font-medium border border-border
                         rounded-md bg-white hover:bg-surface transition-colors disabled:opacity-60">
              {saveMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {letterId ? 'Save' : 'Save letter'}
            </button>
            {letterId && (
              <button onClick={() => saveMutation.mutate({ asNew: true })} title="Save as a new copy"
                className="px-3 py-2 text-[12.5px] font-medium border border-border rounded-md bg-white hover:bg-surface transition-colors">
                <FilePlus2 size={14} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* preview */}
      <div className={`flex-1 flex-col min-w-0 ${view === 'write' ? 'hidden lg:flex' : 'flex'}`}>
        <div ref={wrapRef} className="lg:flex-1 overflow-auto rounded-2xl bg-surface border border-border p-2">
          <div style={{ width: PAGE_W * scale, height: PAGE_H * scale, margin: '0 auto' }}>
            <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}>
              <LetterSheet letter={letter} head={head || {}} />
            </div>
          </div>
        </div>
      </div>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget._id)}
        loading={deleteMutation.isPending}
        title="Delete this letter?"
        description={deleteTarget?.title || deleteTarget?.subject || 'Untitled letter'}
      />
    </div>
  )
}
