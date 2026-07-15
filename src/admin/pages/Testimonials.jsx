import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2, Pencil, Star, User } from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../api/client'
import { SkeletonRow } from '../components/Skeleton'
import EmptyState from '../components/EmptyState'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import StarPicker from '../components/StarPicker'

function TestimonialFormModal({ open, onClose, editing }) {
  const [name, setName] = useState(editing?.name || '')
  const [location, setLocation] = useState(editing?.location || '')
  const [stars, setStars] = useState(editing?.stars || 5)
  const [text, setText] = useState(editing?.text || '')
  const [isActive, setIsActive] = useState(editing?.isActive ?? true)
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(editing?.photoUrl || '')
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => {
      const form = new FormData()
      form.append('name', name)
      form.append('location', location)
      form.append('stars', stars)
      form.append('text', text)
      form.append('isActive', isActive)
      if (file) form.append('image', file)
      return editing
        ? api.put(`/admin/testimonials/${editing._id}`, form, { isForm: true })
        : api.post('/admin/testimonials', form, { isForm: true })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-testimonials'] })
      toast.success(editing ? 'Testimonial updated' : 'Testimonial added')
      onClose()
    },
    onError: (err) => toast.error(err.message || 'Save failed'),
  })

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Edit Testimonial' : 'Add Testimonial'}>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <label className="w-14 h-14 rounded-full bg-surface border border-border overflow-hidden flex items-center justify-center cursor-pointer shrink-0">
            {preview ? <img src={preview} alt="" className="w-full h-full object-cover" /> : <User size={18} className="text-text-subtle" />}
            <input type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif" className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (!f) return
                setFile(f)
                setPreview(URL.createObjectURL(f))
              }} />
          </label>
          <p className="text-[12px] text-text-muted">Optional customer photo</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[12px] font-medium text-text-muted mb-1.5">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-[13px] border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent/30" />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-text-muted mb-1.5">Location</label>
            <input value={location} onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 text-[13px] border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent/30" />
          </div>
        </div>

        <div>
          <label className="block text-[12px] font-medium text-text-muted mb-1.5">Rating</label>
          <StarPicker value={stars} onChange={setStars} />
        </div>

        <div>
          <label className="block text-[12px] font-medium text-text-muted mb-1.5">Testimonial</label>
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4}
            className="w-full px-3 py-2 text-[13px] border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent/30 resize-none" />
        </div>

        <label className="flex items-center gap-2 text-[13px] text-text-primary">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
          Visible on public site
        </label>

        <button onClick={() => mutation.mutate()} disabled={mutation.isPending || !name.trim() || !text.trim()}
          className="w-full btn-accent justify-center py-2.5 text-[13px] disabled:opacity-60">
          {mutation.isPending ? 'Saving…' : 'Save'}
        </button>
      </div>
    </Modal>
  )
}

export default function Testimonials() {
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const queryClient = useQueryClient()

  const { data: testimonials = [], isLoading } = useQuery({
    queryKey: ['admin-testimonials'],
    queryFn: () => api.get('/admin/testimonials'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/testimonials/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-testimonials'] })
      setDeleteTarget(null)
      toast.success('Testimonial deleted')
    },
    onError: (err) => toast.error(err.message || 'Delete failed'),
  })

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-[20px] font-bold text-text-primary">Testimonials</h1>
        <button onClick={() => { setEditing(null); setModalOpen(true) }} className="btn-accent text-[13px] px-4 py-2">
          <Plus size={15} /> Add Testimonial
        </button>
      </div>

      <div className="rounded-xl border border-border bg-white overflow-hidden">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} cols={4} />)
        ) : testimonials.length ? (
          testimonials.map((t) => (
            <div key={t._id} className="flex items-center gap-4 px-4 py-3.5 border-b border-border last:border-0">
              <div className="w-9 h-9 rounded-full bg-surface border border-border overflow-hidden flex items-center justify-center shrink-0">
                {t.photoUrl ? <img src={t.photoUrl} alt="" className="w-full h-full object-cover" /> : <User size={14} className="text-text-subtle" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-text-primary truncate">{t.name} {t.location && <span className="text-text-muted font-normal">· {t.location}</span>}</p>
                <p className="text-[12.5px] text-text-muted truncate">{t.text}</p>
              </div>
              <div className="flex items-center gap-0.5 shrink-0">
                {Array.from({ length: t.stars }).map((_, i) => <Star key={i} size={12} className="fill-accent text-accent" />)}
              </div>
              {!t.isActive && <span className="text-[10px] px-2 py-0.5 bg-surface rounded-full text-text-muted shrink-0">Hidden</span>}
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => { setEditing(t); setModalOpen(true) }} className="p-1.5 text-text-muted hover:text-text-primary hover:bg-surface rounded-md"><Pencil size={14} /></button>
                <button onClick={() => setDeleteTarget(t)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-md"><Trash2 size={14} /></button>
              </div>
            </div>
          ))
        ) : (
          <EmptyState title="No testimonials yet" description="Click Add Testimonial to create the first one." />
        )}
      </div>

      {modalOpen && <TestimonialFormModal open={modalOpen} onClose={() => setModalOpen(false)} editing={editing} />}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget._id)}
        loading={deleteMutation.isPending}
        title="Delete this testimonial?"
      />
    </div>
  )
}
