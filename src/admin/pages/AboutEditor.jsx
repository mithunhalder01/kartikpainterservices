import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2, ChevronUp, ChevronDown, User } from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../api/client'
import TagList from '../components/TagList'
import ImageDropzone from '../components/ImageDropzone'

const emptySections = {
  hero: { heading: '', subheading: '' },
  story: { heading: '', paragraph1: '', paragraph2: '', image: '' },
  stats: [],
  team: [],
  brands: [],
  areas: [],
}

function move(arr, from, to) {
  const copy = [...arr]
  const [item] = copy.splice(from, 1)
  copy.splice(to, 0, item)
  return copy
}

function Section({ title, children }) {
  return (
    <div className="rounded-xl border border-border bg-white p-5">
      <h2 className="text-[14px] font-semibold text-text-primary mb-4">{title}</h2>
      {children}
    </div>
  )
}

function Field({ label, ...props }) {
  return (
    <div>
      <label className="block text-[12px] font-medium text-text-muted mb-1.5">{label}</label>
      <input {...props}
        className="w-full px-3 py-2 text-[13px] border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent/30" />
    </div>
  )
}

async function uploadImage(file) {
  const form = new FormData()
  form.append('image', file)
  const res = await api.post('/admin/about/upload', form, { isForm: true })
  return res.url
}

export default function AboutEditor() {
  const queryClient = useQueryClient()
  const [sections, setSections] = useState(emptySections)
  const [uploading, setUploading] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-about'],
    queryFn: () => api.get('/admin/about'),
  })

  useEffect(() => {
    if (data) setSections({ ...emptySections, ...data })
  }, [data])

  const saveMutation = useMutation({
    mutationFn: () => api.put('/admin/about', { sections }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-about'] })
      toast.success('About page updated')
    },
    onError: (err) => toast.error(err.message || 'Save failed'),
  })

  const set = (path, value) => {
    setSections((prev) => {
      const next = { ...prev }
      if (path.includes('.')) {
        const [group, key] = path.split('.')
        next[group] = { ...next[group], [key]: value }
      } else {
        next[path] = value
      }
      return next
    })
  }

  const handleHeroImage = async (file) => {
    if (!file) return
    setUploading('hero')
    try {
      const url = await uploadImage(file)
      set('story.image', url)
    } catch (err) {
      toast.error(err.message || 'Upload failed')
    } finally {
      setUploading('')
    }
  }

  const handleTeamPhoto = async (index, file) => {
    setUploading(`team-${index}`)
    try {
      const url = await uploadImage(file)
      setSections((prev) => {
        const team = [...prev.team]
        team[index] = { ...team[index], img: url }
        return { ...prev, team }
      })
    } catch (err) {
      toast.error(err.message || 'Upload failed')
    } finally {
      setUploading('')
    }
  }

  if (isLoading) return <p className="text-[13px] text-text-muted">Loading…</p>

  return (
    <div className="max-w-3xl space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-[20px] font-bold text-text-primary">About Page</h1>
        <button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}
          className="btn-accent text-[13px] px-4 py-2 disabled:opacity-60">
          {saveMutation.isPending ? 'Saving…' : 'Save Changes'}
        </button>
      </div>

      <Section title="Hero">
        <div className="space-y-3">
          <Field label="Heading" value={sections.hero.heading}
            onChange={(e) => set('hero.heading', e.target.value)} placeholder="15 years of craft. One standard." />
          <Field label="Subheading" value={sections.hero.subheading}
            onChange={(e) => set('hero.subheading', e.target.value)}
            placeholder="Since 2009, we've been the name Noida families and businesses trust." />
        </div>
      </Section>

      <Section title="Our Story">
        <div className="space-y-3">
          <Field label="Heading" value={sections.story.heading}
            onChange={(e) => set('story.heading', e.target.value)} />
          <div>
            <label className="block text-[12px] font-medium text-text-muted mb-1.5">Paragraph 1</label>
            <textarea value={sections.story.paragraph1} onChange={(e) => set('story.paragraph1', e.target.value)} rows={3}
              className="w-full px-3 py-2 text-[13px] border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent/30 resize-none" />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-text-muted mb-1.5">Paragraph 2</label>
            <textarea value={sections.story.paragraph2} onChange={(e) => set('story.paragraph2', e.target.value)} rows={3}
              className="w-full px-3 py-2 text-[13px] border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent/30 resize-none" />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-text-muted mb-1.5">Story Image</label>
            <ImageDropzone
              preview={sections.story.image}
              onFile={handleHeroImage}
              label={uploading === 'hero' ? 'Uploading…' : 'Drag & drop an image, or click to browse (max 5MB)'} />
          </div>
        </div>
      </Section>

      <Section title="Stats">
        <div className="space-y-2">
          {sections.stats.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <input value={s.value} onChange={(e) => {
                const stats = [...sections.stats]; stats[i] = { ...stats[i], value: e.target.value }; set('stats', stats)
              }} placeholder="500+" className="w-24 px-3 py-2 text-[13px] border border-border rounded-md" />
              <input value={s.label} onChange={(e) => {
                const stats = [...sections.stats]; stats[i] = { ...stats[i], label: e.target.value }; set('stats', stats)
              }} placeholder="Projects Done" className="flex-1 px-3 py-2 text-[13px] border border-border rounded-md" />
              <button onClick={() => i > 0 && set('stats', move(sections.stats, i, i - 1))} className="p-1.5 text-text-muted hover:bg-surface rounded-md"><ChevronUp size={14} /></button>
              <button onClick={() => i < sections.stats.length - 1 && set('stats', move(sections.stats, i, i + 1))} className="p-1.5 text-text-muted hover:bg-surface rounded-md"><ChevronDown size={14} /></button>
              <button onClick={() => set('stats', sections.stats.filter((_, idx) => idx !== i))} className="p-1.5 text-red-500 hover:bg-red-50 rounded-md"><Trash2 size={14} /></button>
            </div>
          ))}
          <button onClick={() => set('stats', [...sections.stats, { value: '', label: '' }])}
            className="flex items-center gap-1.5 text-[12.5px] font-medium text-accent hover:text-accent-600 mt-2">
            <Plus size={14} /> Add stat
          </button>
        </div>
      </Section>

      <Section title="Team">
        <div className="space-y-3">
          {sections.team.map((m, i) => (
            <div key={i} className="flex items-center gap-3 border border-border rounded-lg p-3">
              <label className="w-12 h-12 rounded-full bg-surface border border-border overflow-hidden flex items-center justify-center cursor-pointer shrink-0">
                {m.img ? <img src={m.img} alt="" className="w-full h-full object-cover" /> : <User size={16} className="text-text-subtle" />}
                <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleTeamPhoto(i, e.target.files[0])} />
              </label>
              <div className="flex-1 grid grid-cols-3 gap-2">
                <input value={m.name} onChange={(e) => {
                  const team = [...sections.team]; team[i] = { ...team[i], name: e.target.value }; set('team', team)
                }} placeholder="Name" className="px-2.5 py-1.5 text-[12.5px] border border-border rounded-md" />
                <input value={m.role} onChange={(e) => {
                  const team = [...sections.team]; team[i] = { ...team[i], role: e.target.value }; set('team', team)
                }} placeholder="Role" className="px-2.5 py-1.5 text-[12.5px] border border-border rounded-md" />
                <input value={m.exp} onChange={(e) => {
                  const team = [...sections.team]; team[i] = { ...team[i], exp: e.target.value }; set('team', team)
                }} placeholder="Experience" className="px-2.5 py-1.5 text-[12.5px] border border-border rounded-md" />
              </div>
              <button onClick={() => i > 0 && set('team', move(sections.team, i, i - 1))} className="p-1.5 text-text-muted hover:bg-surface rounded-md"><ChevronUp size={14} /></button>
              <button onClick={() => i < sections.team.length - 1 && set('team', move(sections.team, i, i + 1))} className="p-1.5 text-text-muted hover:bg-surface rounded-md"><ChevronDown size={14} /></button>
              <button onClick={() => set('team', sections.team.filter((_, idx) => idx !== i))} className="p-1.5 text-red-500 hover:bg-red-50 rounded-md"><Trash2 size={14} /></button>
            </div>
          ))}
          <button onClick={() => set('team', [...sections.team, { name: '', role: '', exp: '', img: '' }])}
            className="flex items-center gap-1.5 text-[12.5px] font-medium text-accent hover:text-accent-600">
            <Plus size={14} /> Add team member
          </button>
        </div>
      </Section>

      <Section title="Brand Logos">
        <TagList items={sections.brands} onChange={(brands) => set('brands', brands)} placeholder="e.g. Asian Paints" />
      </Section>

      <Section title="Areas Covered">
        <TagList items={sections.areas} onChange={(areas) => set('areas', areas)} placeholder="e.g. Noida" />
      </Section>
    </div>
  )
}
