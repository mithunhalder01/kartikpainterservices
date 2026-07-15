import { useRef, useState } from 'react'
import { ImageOff } from 'lucide-react'
import toast from 'react-hot-toast'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE_BYTES = 5 * 1024 * 1024

// HEIC/HEIF (iPhone photos) can't be displayed by browsers, so we convert
// them to JPEG in the browser before uploading. Some browsers report an empty
// mimetype for .heic files, so we also sniff the file extension.
const isHeic = (file) =>
  /image\/hei(c|f)/i.test(file.type) || /\.hei[cf]$/i.test(file.name || '')

export default function ImageDropzone({ preview, onFile, className = '', previewClassName = 'max-h-32 rounded-md object-contain', label = 'Drag & drop an image, or click to browse (max 5MB)' }) {
  const [dragging, setDragging] = useState(false)
  const [converting, setConverting] = useState(false)
  const inputRef = useRef(null)

  const acceptFile = async (file) => {
    if (!file) return
    if (file.size > MAX_SIZE_BYTES) {
      toast.error('Image must be under 5MB')
      return
    }

    if (isHeic(file)) {
      try {
        setConverting(true)
        const { default: heic2any } = await import('heic2any')
        const blob = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.9 })
        const converted = Array.isArray(blob) ? blob[0] : blob
        const jpegName = (file.name || 'image').replace(/\.hei[cf]$/i, '') + '.jpg'
        onFile(new File([converted], jpegName, { type: 'image/jpeg' }))
      } catch {
        toast.error('Could not convert this HEIC image. Please try a JPG or PNG.')
      } finally {
        setConverting(false)
      }
      return
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('Only JPEG, PNG, WEBP, or HEIC images are allowed')
      return
    }
    onFile(file)
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragging(false)
        acceptFile(e.dataTransfer.files?.[0])
      }}
      className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-lg py-8 cursor-pointer transition-colors
        ${dragging ? 'border-accent bg-accent/5' : 'border-border hover:bg-surface'} ${className}`}>
      {converting ? (
        <span className="text-[12px] text-text-muted text-center px-4">Converting HEIC image…</span>
      ) : preview ? (
        <img src={preview} alt="" className={previewClassName} />
      ) : (
        <>
          <ImageOff size={20} className="text-text-subtle" />
          <span className="text-[12px] text-text-muted text-center px-4">{label}</span>
        </>
      )}
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif" className="hidden"
        onChange={(e) => acceptFile(e.target.files?.[0])} />
    </div>
  )
}
