import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../api/client'
import Section from '../components/EditorSection'
import ImageDropzone from '../components/ImageDropzone'
import { move } from '../utils/arrayMove'

const emptySections = {
  whyChooseUs: {
    heading: '',
    paragraph: '',
    image: '',
    ctaLabel: '',
    points: [],
  },
}

async function uploadImage(file) {
  const form = new FormData()
  form.append('image', file)
  const res = await api.post('/admin/home/upload', form, { isForm: true })
  return res.url
}

export default function HomeEditor() {
  const queryClient = useQueryClient()
  const [sections, setSections] = useState(emptySections)
  const [uploading, setUploading] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-home'],
    queryFn: () => api.get('/admin/home'),
  })

  useEffect(() => {
    if (data) {
      setSections({
        whyChooseUs: { ...emptySections.whyChooseUs, ...data.whyChooseUs },
      })
    }
  }, [data])

  const saveMutation = useMutation({
    mutationFn: () => api.put('/admin/home', { sections }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-home'] })
      toast.success('Home page updated')
    },
    onError: (err) => toast.error(err.message || 'Save failed'),
  })

  const setWhyChooseUs = (key, value) => {
    setSections((prev) => ({ ...prev, whyChooseUs: { ...prev.whyChooseUs, [key]: value } }))
  }

  const handleImage = async (file) => {
    setUploading(true)
    try {
      const url = await uploadImage(file)
      setWhyChooseUs('image', url)
    } catch (err) {
      toast.error(err.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  if (isLoading) return <p className="text-[13px] text-text-muted">Loading…</p>

  const points = sections.whyChooseUs.points

  return (
    <div className="max-w-3xl space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-[20px] font-bold text-text-primary">Home Page</h1>
        <button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}
          className="btn-accent text-[13px] px-4 py-2 disabled:opacity-60">
          {saveMutation.isPending ? 'Saving…' : 'Save Changes'}
        </button>
      </div>

      <Section title="Why Choose Us">
        <div className="space-y-4">
          <div>
            <label className="block text-[12px] font-medium text-text-muted mb-1.5">Heading</label>
            <textarea value={sections.whyChooseUs.heading} onChange={(e) => setWhyChooseUs('heading', e.target.value)} rows={2}
              placeholder="Quality you can see.&#10;Honesty you can trust."
              className="w-full px-3 py-2 text-[13px] border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent/30 resize-none" />
          </div>

          <div>
            <label className="block text-[12px] font-medium text-text-muted mb-1.5">Paragraph</label>
            <textarea value={sections.whyChooseUs.paragraph} onChange={(e) => setWhyChooseUs('paragraph', e.target.value)} rows={3}
              placeholder="We don't cut corners, use inferior materials, or surprise you with extra bills…"
              className="w-full px-3 py-2 text-[13px] border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent/30 resize-none" />
          </div>

          <div>
            <label className="block text-[12px] font-medium text-text-muted mb-1.5">Image</label>
            <ImageDropzone
              preview={sections.whyChooseUs.image}
              onFile={handleImage}
              label={uploading ? 'Uploading…' : 'Drag & drop an image, or click to browse (max 5MB)'} />
          </div>

          <div>
            <label className="block text-[12px] font-medium text-text-muted mb-1.5">Button Label</label>
            <input value={sections.whyChooseUs.ctaLabel} onChange={(e) => setWhyChooseUs('ctaLabel', e.target.value)}
              placeholder="Book Free Site Visit"
              className="w-full px-3 py-2 text-[13px] border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent/30" />
          </div>

          <div>
            <label className="block text-[12px] font-medium text-text-muted mb-2">Feature Points</label>
            <div className="space-y-2">
              {points.map((p, i) => (
                <div key={i} className="flex items-start gap-2 border border-border rounded-lg p-3">
                  <div className="flex-1 space-y-2">
                    <input value={p.title} onChange={(e) => {
                      const next = [...points]; next[i] = { ...next[i], title: e.target.value }; setWhyChooseUs('points', next)
                    }} placeholder="On-Time Delivery" className="w-full px-2.5 py-1.5 text-[12.5px] border border-border rounded-md" />
                    <input value={p.desc} onChange={(e) => {
                      const next = [...points]; next[i] = { ...next[i], desc: e.target.value }; setWhyChooseUs('points', next)
                    }} placeholder="The date we commit to is the date we deliver." className="w-full px-2.5 py-1.5 text-[12.5px] border border-border rounded-md" />
                  </div>
                  <button onClick={() => i > 0 && setWhyChooseUs('points', move(points, i, i - 1))} className="p-1.5 text-text-muted hover:bg-surface rounded-md"><ChevronUp size={14} /></button>
                  <button onClick={() => i < points.length - 1 && setWhyChooseUs('points', move(points, i, i + 1))} className="p-1.5 text-text-muted hover:bg-surface rounded-md"><ChevronDown size={14} /></button>
                  <button onClick={() => setWhyChooseUs('points', points.filter((_, idx) => idx !== i))} className="p-1.5 text-red-500 hover:bg-red-50 rounded-md"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
            <button onClick={() => setWhyChooseUs('points', [...points, { title: '', desc: '' }])}
              className="flex items-center gap-1.5 text-[12.5px] font-medium text-accent hover:text-accent-600 mt-2">
              <Plus size={14} /> Add feature point
            </button>
          </div>
        </div>
      </Section>
    </div>
  )
}
