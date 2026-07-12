import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Plus, Trash2, Pencil, Home, Building2, Droplets,
  Sparkles, Briefcase, Layers, PaintBucket, Wrench, Hammer, Palette,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../api/client'
import { SkeletonRow } from '../components/Skeleton'
import EmptyState from '../components/EmptyState'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import TagList from '../components/TagList'
import ImageDropzone from '../components/ImageDropzone'

const ICONS = { Home, Building2, Droplets, Sparkles, Briefcase, Layers, PaintBucket, Wrench, Hammer, Palette }

function slugify(text) {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function IconPicker({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {Object.entries(ICONS).map(([name, Icon]) => (
        <button key={name} type="button" onClick={() => onChange(name)}
          className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-colors
            ${value === name ? 'bg-dark border-dark text-white' : 'border-border text-text-muted hover:bg-surface'}`}>
          <Icon size={16} />
        </button>
      ))}
    </div>
  )
}

function ServiceFormModal({ open, onClose, editing }) {
  const [slug, setSlug] = useState(editing?.slug || '')
  const [slugTouched, setSlugTouched] = useState(!!editing)
  const [iconName, setIconName] = useState(editing?.iconName || 'Layers')
  const [title, setTitle] = useState(editing?.title || '')
  const [price, setPrice] = useState(editing?.price || '')
  const [shortDesc, setShortDesc] = useState(editing?.shortDesc || '')
  const [desc, setDesc] = useState(editing?.desc || '')
  const [longDesc, setLongDesc] = useState(editing?.longDesc || '')
  const [seoTitle, setSeoTitle] = useState(editing?.seoTitle || '')
  const [seoDesc, setSeoDesc] = useState(editing?.seoDesc || '')
  const [seoKeywords, setSeoKeywords] = useState(editing?.seoKeywords || '')
  const [features, setFeatures] = useState(editing?.features || [])
  const [areas, setAreas] = useState(editing?.areas || [])
  const [isActive, setIsActive] = useState(editing?.isActive ?? true)
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(editing?.image || '')
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => {
      const form = new FormData()
      form.append('slug', slug)
      form.append('iconName', iconName)
      form.append('title', title)
      form.append('price', price)
      form.append('shortDesc', shortDesc)
      form.append('desc', desc)
      form.append('longDesc', longDesc)
      form.append('seoTitle', seoTitle)
      form.append('seoDesc', seoDesc)
      form.append('seoKeywords', seoKeywords)
      form.append('features', JSON.stringify(features))
      form.append('areas', JSON.stringify(areas))
      form.append('isActive', isActive)
      if (file) form.append('image', file)
      return editing
        ? api.put(`/admin/services/${editing._id}`, form, { isForm: true })
        : api.post('/admin/services', form, { isForm: true })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] })
      toast.success(editing ? 'Service updated' : 'Service added')
      onClose()
    },
    onError: (err) => toast.error(err.message || 'Save failed'),
  })

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Edit Service' : 'Add Service'} width="max-w-2xl">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[12px] font-medium text-text-muted mb-1.5">Title</label>
            <input value={title} onChange={(e) => {
              setTitle(e.target.value)
              if (!slugTouched) setSlug(slugify(e.target.value))
            }} className="w-full px-3 py-2 text-[13px] border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent/30" />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-text-muted mb-1.5">Slug (URL)</label>
            <input value={slug} onChange={(e) => { setSlug(slugify(e.target.value)); setSlugTouched(true) }}
              className="w-full px-3 py-2 text-[13px] border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent/30" />
          </div>
        </div>

        <div>
          <label className="block text-[12px] font-medium text-text-muted mb-1.5">Icon</label>
          <IconPicker value={iconName} onChange={setIconName} />
        </div>

        <div>
          <label className="block text-[12px] font-medium text-text-muted mb-1.5">Image</label>
          <ImageDropzone preview={preview} onFile={(f) => { setFile(f); setPreview(URL.createObjectURL(f)) }} />
        </div>

        <div>
          <label className="block text-[12px] font-medium text-text-muted mb-1.5">Price</label>
          <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="₹12 – ₹45 / sq.ft"
            className="w-full px-3 py-2 text-[13px] border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent/30" />
        </div>

        <div>
          <label className="block text-[12px] font-medium text-text-muted mb-1.5">Short Description (services list)</label>
          <textarea value={shortDesc} onChange={(e) => setShortDesc(e.target.value)} rows={2}
            className="w-full px-3 py-2 text-[13px] border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent/30 resize-none" />
        </div>

        <div>
          <label className="block text-[12px] font-medium text-text-muted mb-1.5">Description (services page)</label>
          <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={2}
            className="w-full px-3 py-2 text-[13px] border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent/30 resize-none" />
        </div>

        <div>
          <label className="block text-[12px] font-medium text-text-muted mb-1.5">Long Description (detail page)</label>
          <textarea value={longDesc} onChange={(e) => setLongDesc(e.target.value)} rows={4}
            className="w-full px-3 py-2 text-[13px] border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent/30 resize-none" />
        </div>

        <div>
          <label className="block text-[12px] font-medium text-text-muted mb-1.5">Features</label>
          <TagList items={features} onChange={setFeatures} placeholder="e.g. 2-year workmanship warranty" />
        </div>

        <div>
          <label className="block text-[12px] font-medium text-text-muted mb-1.5">Areas Served</label>
          <TagList items={areas} onChange={setAreas} placeholder="e.g. Noida Sector 62" />
        </div>

        <details className="border border-border rounded-md p-3">
          <summary className="text-[12.5px] font-medium text-text-muted cursor-pointer">SEO fields (optional)</summary>
          <div className="space-y-3 mt-3">
            <input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder="SEO title"
              className="w-full px-3 py-2 text-[13px] border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent/30" />
            <textarea value={seoDesc} onChange={(e) => setSeoDesc(e.target.value)} rows={2} placeholder="SEO description"
              className="w-full px-3 py-2 text-[13px] border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent/30 resize-none" />
            <input value={seoKeywords} onChange={(e) => setSeoKeywords(e.target.value)} placeholder="SEO keywords, comma separated"
              className="w-full px-3 py-2 text-[13px] border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent/30" />
          </div>
        </details>

        <label className="flex items-center gap-2 text-[13px] text-text-primary">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
          Visible on public site
        </label>

        <button onClick={() => mutation.mutate()} disabled={mutation.isPending || !title.trim() || !slug.trim()}
          className="w-full btn-accent justify-center py-2.5 text-[13px] disabled:opacity-60">
          {mutation.isPending ? 'Saving…' : 'Save'}
        </button>
      </div>
    </Modal>
  )
}

export default function Services() {
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const queryClient = useQueryClient()

  const { data: services = [], isLoading } = useQuery({
    queryKey: ['admin-services'],
    queryFn: () => api.get('/admin/services'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/services/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] })
      setDeleteTarget(null)
      toast.success('Service deleted')
    },
    onError: (err) => toast.error(err.message || 'Delete failed'),
  })

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-[20px] font-bold text-text-primary">Services</h1>
        <button onClick={() => { setEditing(null); setModalOpen(true) }} className="btn-accent text-[13px] px-4 py-2">
          <Plus size={15} /> Add Service
        </button>
      </div>

      <div className="rounded-xl border border-border bg-white overflow-hidden">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} cols={4} />)
        ) : services.length ? (
          services.map((s) => {
            const Icon = ICONS[s.iconName] || Layers
            return (
              <div key={s._id} className="flex items-center gap-4 px-4 py-3.5 border-b border-border last:border-0">
                <div className="w-12 h-12 rounded-lg bg-surface border border-border overflow-hidden flex items-center justify-center shrink-0">
                  {s.image ? <img src={s.image} alt="" className="w-full h-full object-cover" /> : <Icon size={16} className="text-text-muted" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-text-primary truncate flex items-center gap-2">
                    <Icon size={13} className="text-accent shrink-0" /> {s.title}
                  </p>
                  <p className="text-[12.5px] text-text-muted truncate">/{s.slug} · {s.price || 'No price set'}</p>
                </div>
                {!s.isActive && <span className="text-[10px] px-2 py-0.5 bg-surface rounded-full text-text-muted shrink-0">Hidden</span>}
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => { setEditing(s); setModalOpen(true) }} className="p-1.5 text-text-muted hover:text-text-primary hover:bg-surface rounded-md"><Pencil size={14} /></button>
                  <button onClick={() => setDeleteTarget(s)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-md"><Trash2 size={14} /></button>
                </div>
              </div>
            )
          })
        ) : (
          <EmptyState title="No services yet" description="Click Add Service to create the first one." />
        )}
      </div>

      {modalOpen && <ServiceFormModal open={modalOpen} onClose={() => setModalOpen(false)} editing={editing} />}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget._id)}
        loading={deleteMutation.isPending}
        title="Delete this service?"
        description="It will disappear from the public Services page and its own service page."
      />
    </div>
  )
}
