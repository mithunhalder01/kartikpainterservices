import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2, Pencil, X } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core'
import { SortableContext, arrayMove, useSortable, rectSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { api } from '../api/client'
import { SkeletonCard } from '../components/Skeleton'
import EmptyState from '../components/EmptyState'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import ImageDropzone from '../components/ImageDropzone'

function SortableCard({ image, onEdit, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: image._id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}
      className="rounded-xl border border-border overflow-hidden bg-white cursor-grab active:cursor-grabbing group">
      <div className="aspect-[4/3] bg-surface relative overflow-hidden">
        <img src={image.imageUrl} alt={image.label} className="w-full h-full object-cover" />
        {!image.isActive && (
          <span className="absolute top-2 left-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded-full">Hidden</span>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
          <button onPointerDown={(e) => e.stopPropagation()} onClick={() => onEdit(image)}
            className="p-2 bg-white rounded-full text-text-primary hover:bg-surface"><Pencil size={14} /></button>
          <button onPointerDown={(e) => e.stopPropagation()} onClick={() => onDelete(image)}
            className="p-2 bg-white rounded-full text-red-600 hover:bg-red-50"><Trash2 size={14} /></button>
        </div>
      </div>
      <div className="p-2.5">
        <p className="text-[12.5px] font-medium text-text-primary truncate">{image.label || 'Untitled'}</p>
        <span className="inline-block mt-1 text-[10.5px] px-2 py-0.5 bg-surface rounded-full text-text-muted">{image.category}</span>
      </div>
    </div>
  )
}

function ImageFormModal({ open, onClose, categories, editing }) {
  const [category, setCategory] = useState(editing?.category || categories[0]?.name || '')
  const [label, setLabel] = useState(editing?.label || '')
  const [isActive, setIsActive] = useState(editing?.isActive ?? true)
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(editing?.imageUrl || '')
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => {
      const form = new FormData()
      form.append('category', category)
      form.append('label', label)
      form.append('isActive', isActive)
      if (file) form.append('image', file)
      return editing
        ? api.put(`/admin/gallery/${editing._id}`, form, { isForm: true })
        : api.post('/admin/gallery', form, { isForm: true })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-gallery'] })
      toast.success(editing ? 'Image updated' : 'Image added')
      onClose()
    },
    onError: (err) => toast.error(err.message || 'Save failed'),
  })

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Edit Image' : 'Add Image'}>
      <div className="space-y-4">
        {!editing && (
          <div>
            <label className="block text-[12px] font-medium text-text-muted mb-1.5">Image</label>
            <ImageDropzone preview={preview} onFile={(f) => { setFile(f); setPreview(URL.createObjectURL(f)) }} />
          </div>
        )}

        <div>
          <label className="block text-[12px] font-medium text-text-muted mb-1.5">Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 text-[13px] border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent/30">
            {categories.map((c) => <option key={c._id} value={c.name}>{c.name}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-[12px] font-medium text-text-muted mb-1.5">Label</label>
          <input value={label} onChange={(e) => setLabel(e.target.value)}
            className="w-full px-3 py-2 text-[13px] border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent/30"
            placeholder="e.g. Living room interior painting" />
        </div>

        <label className="flex items-center gap-2 text-[13px] text-text-primary">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
          Visible on public site
        </label>

        <button onClick={() => mutation.mutate()} disabled={mutation.isPending || (!editing && !file)}
          className="w-full btn-accent justify-center py-2.5 text-[13px] disabled:opacity-60">
          {mutation.isPending ? 'Saving…' : 'Save'}
        </button>
      </div>
    </Modal>
  )
}

export default function Gallery() {
  const [filterCategory, setFilterCategory] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteCategoryTarget, setDeleteCategoryTarget] = useState(null)
  const [newCategory, setNewCategory] = useState('')
  const queryClient = useQueryClient()
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const { data: categories = [] } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => api.get('/admin/categories'),
  })

  const { data: images = [], isLoading } = useQuery({
    queryKey: ['admin-gallery', filterCategory],
    queryFn: () => api.get(`/admin/gallery${filterCategory ? `?category=${encodeURIComponent(filterCategory)}` : ''}`),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/gallery/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-gallery'] })
      setDeleteTarget(null)
      toast.success('Image deleted')
    },
    onError: (err) => toast.error(err.message || 'Delete failed'),
  })

  const reorderMutation = useMutation({
    mutationFn: (items) => api.patch('/admin/gallery/reorder', { items }),
  })

  const addCategoryMutation = useMutation({
    mutationFn: (name) => api.post('/admin/categories', { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] })
      setNewCategory('')
      toast.success('Category added')
    },
    onError: (err) => toast.error(err.message || 'Failed to add category'),
  })

  const deleteCategoryMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/categories/${id}`),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] })
      if (deleteCategoryTarget?.name === filterCategory) setFilterCategory('')
      setDeleteCategoryTarget(null)
      toast.success('Category deleted')
    },
    onError: (err) => toast.error(err.message || 'Failed to delete category'),
  })

  const handleDragEnd = (event) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = images.findIndex((i) => i._id === active.id)
    const newIndex = images.findIndex((i) => i._id === over.id)
    const reordered = arrayMove(images, oldIndex, newIndex)

    queryClient.setQueryData(['admin-gallery', filterCategory], reordered)
    reorderMutation.mutate(reordered.map((img, idx) => ({ id: img._id, order: idx })))
  }

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-[20px] font-bold text-text-primary">Gallery</h1>
        <button onClick={() => { setEditing(null); setModalOpen(true) }}
          disabled={!categories.length}
          className="btn-accent text-[13px] px-4 py-2 disabled:opacity-50">
          <Plus size={15} /> Add Image
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-5">
        <button onClick={() => setFilterCategory('')}
          className={`px-3 py-1.5 text-[12.5px] rounded-full border transition-colors
            ${!filterCategory ? 'bg-dark text-white border-dark' : 'border-border text-text-muted hover:bg-surface'}`}>
          All
        </button>
        {categories.map((c) => (
          <div key={c._id} className="group relative">
            <button onClick={() => setFilterCategory(c.name)}
              className={`pl-3 pr-2 py-1.5 text-[12.5px] rounded-full border transition-colors flex items-center gap-1.5
                ${filterCategory === c.name ? 'bg-dark text-white border-dark' : 'border-border text-text-muted hover:bg-surface'}`}>
              {c.name}
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => { e.stopPropagation(); setDeleteCategoryTarget(c) }}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); setDeleteCategoryTarget(c) } }}
                className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-opacity
                  opacity-0 group-hover:opacity-100 hover:bg-black/10
                  ${filterCategory === c.name ? 'hover:bg-white/20' : ''}`}>
                <X size={11} />
              </span>
            </button>
          </div>
        ))}
        <div className="flex items-center gap-1.5 ml-2">
          <input value={newCategory} onChange={(e) => setNewCategory(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && newCategory.trim() && addCategoryMutation.mutate(newCategory.trim())}
            placeholder="New category…"
            className="px-2.5 py-1.5 text-[12.5px] border border-border rounded-full w-32 focus:outline-none focus:ring-2 focus:ring-accent/30" />
        </div>
      </div>

      {!categories.length && !isLoading && (
        <EmptyState title="Add a category first" description="Create at least one category above before uploading images." />
      )}

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : images.length ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={images.map((i) => i._id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((image) => (
                <SortableCard key={image._id} image={image}
                  onEdit={(img) => { setEditing(img); setModalOpen(true) }}
                  onDelete={setDeleteTarget} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : categories.length ? (
        <EmptyState title="No images yet" description="Click Add Image to upload your first gallery photo." />
      ) : null}

      {modalOpen && (
        <ImageFormModal open={modalOpen} onClose={() => setModalOpen(false)} categories={categories} editing={editing} />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget._id)}
        loading={deleteMutation.isPending}
        title="Delete this image?"
        description="This will permanently remove it from Cloudinary and the site."
      />

      <ConfirmDialog
        open={!!deleteCategoryTarget}
        onClose={() => setDeleteCategoryTarget(null)}
        onConfirm={() => deleteCategoryMutation.mutate(deleteCategoryTarget._id)}
        loading={deleteCategoryMutation.isPending}
        title={`Delete "${deleteCategoryTarget?.name}"?`}
        description="Images already in this category won't be deleted, but they'll no longer have a valid category until you reassign them."
      />
    </div>
  )
}
