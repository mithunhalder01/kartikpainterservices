import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, X, Trash2, Phone, Mail, MapPin } from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../api/client'
import { SkeletonRow } from '../components/Skeleton'
import EmptyState from '../components/EmptyState'
import StatusBadge from '../components/StatusBadge'
import ConfirmDialog from '../components/ConfirmDialog'

const STATUSES = ['New', 'Contacted', 'Quoted', 'Won', 'Lost']

export default function Leads() {
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState(null)
  const [noteText, setNoteText] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['leads', { status, search, page }],
    queryFn: () => {
      const params = new URLSearchParams({ page, limit: 20 })
      if (status) params.set('status', status)
      if (search) params.set('search', search)
      return api.get(`/admin/leads?${params.toString()}`)
    },
    keepPreviousData: true,
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => api.patch(`/admin/leads/${id}`, payload),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      setSelected(updated)
      toast.success('Lead updated')
    },
    onError: (err) => toast.error(err.message || 'Update failed'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/leads/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      setDeleteTarget(null)
      setSelected(null)
      toast.success('Lead deleted')
    },
    onError: (err) => toast.error(err.message || 'Delete failed'),
  })

  const addNote = () => {
    if (!noteText.trim()) return
    updateMutation.mutate({ id: selected._id, payload: { note: noteText.trim() } })
    setNoteText('')
  }

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-[20px] font-bold text-text-primary">Leads</h1>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search name, phone, email…"
            className="w-full pl-9 pr-3 py-2 text-[13px] border border-border rounded-md
                       focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
          />
        </div>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }}
          className="px-3 py-2 text-[13px] border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent/30">
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="rounded-xl border border-border bg-white overflow-hidden">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} cols={5} />)
        ) : data?.leads?.length ? (
          <>
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-border bg-surface/60 text-left">
                  <th className="px-4 py-2.5 font-semibold text-text-muted">Name</th>
                  <th className="px-4 py-2.5 font-semibold text-text-muted">Phone</th>
                  <th className="px-4 py-2.5 font-semibold text-text-muted">Service</th>
                  <th className="px-4 py-2.5 font-semibold text-text-muted">Status</th>
                  <th className="px-4 py-2.5 font-semibold text-text-muted">Date</th>
                </tr>
              </thead>
              <tbody>
                {data.leads.map((lead) => (
                  <tr key={lead._id} onClick={() => setSelected(lead)}
                    className="border-b border-border last:border-0 hover:bg-surface/60 cursor-pointer transition-colors">
                    <td className="px-4 py-3 font-medium text-text-primary">{lead.name}</td>
                    <td className="px-4 py-3 text-text-muted">{lead.phone}</td>
                    <td className="px-4 py-3 text-text-muted">{lead.serviceInterested || '—'}</td>
                    <td className="px-4 py-3"><StatusBadge status={lead.status} /></td>
                    <td className="px-4 py-3 text-text-muted">{new Date(lead.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {data.pages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                <span className="text-[12px] text-text-muted">Page {data.page} of {data.pages}</span>
                <div className="flex gap-2">
                  <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}
                    className="px-3 py-1.5 text-[12px] border border-border rounded-md disabled:opacity-40">Prev</button>
                  <button disabled={page >= data.pages} onClick={() => setPage((p) => p + 1)}
                    className="px-3 py-1.5 text-[12px] border border-border rounded-md disabled:opacity-40">Next</button>
                </div>
              </div>
            )}
          </>
        ) : (
          <EmptyState title="No leads found" description="Try a different search or status filter." />
        )}
      </div>

      {/* Detail drawer */}
      {selected && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSelected(null)} />
          <div className="relative w-full max-w-md bg-white h-full overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-white">
              <h3 className="text-[15px] font-semibold text-text-primary">{selected.name}</h3>
              <button onClick={() => setSelected(null)} className="p-1.5 text-text-muted hover:bg-surface rounded-md">
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-5">
              <div className="space-y-2 text-[13px]">
                <p className="flex items-center gap-2 text-text-muted"><Phone size={13} /> {selected.phone}</p>
                {selected.email && <p className="flex items-center gap-2 text-text-muted"><Mail size={13} /> {selected.email}</p>}
                {selected.area && <p className="flex items-center gap-2 text-text-muted"><MapPin size={13} /> {selected.area}</p>}
              </div>

              {selected.message && (
                <div>
                  <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wide mb-1">Message</p>
                  <p className="text-[13px] text-text-primary bg-surface rounded-md p-3">{selected.message}</p>
                </div>
              )}

              <div>
                <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wide mb-1.5">Status</p>
                <select value={selected.status}
                  onChange={(e) => updateMutation.mutate({ id: selected._id, payload: { status: e.target.value } })}
                  className="w-full px-3 py-2 text-[13px] border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent/30">
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wide mb-1.5">Notes</p>
                <div className="space-y-2 mb-3 max-h-48 overflow-y-auto">
                  {selected.notes?.length ? [...selected.notes].reverse().map((note) => (
                    <div key={note._id} className="text-[12.5px] bg-surface rounded-md p-2.5">
                      <p className="text-text-primary">{note.text}</p>
                      <p className="text-text-subtle mt-1 text-[11px]">{new Date(note.createdAt).toLocaleString()}</p>
                    </div>
                  )) : <p className="text-[12.5px] text-text-subtle">No notes yet.</p>}
                </div>
                <div className="flex gap-2">
                  <input value={noteText} onChange={(e) => setNoteText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addNote()}
                    placeholder="Add a note…"
                    className="flex-1 px-3 py-2 text-[13px] border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent/30" />
                  <button onClick={addNote} className="px-3 py-2 text-[13px] font-medium bg-dark text-white rounded-md">Add</button>
                </div>
              </div>

              <button onClick={() => setDeleteTarget(selected)}
                className="flex items-center gap-1.5 text-[13px] text-red-600 hover:text-red-700">
                <Trash2 size={13} /> Delete lead
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget._id)}
        loading={deleteMutation.isPending}
        title="Delete this lead?"
        description="This action cannot be undone."
      />
    </div>
  )
}
