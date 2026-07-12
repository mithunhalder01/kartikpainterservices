import { useRef, useState } from 'react'
import { ImageOff } from 'lucide-react'
import toast from 'react-hot-toast'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE_BYTES = 5 * 1024 * 1024

export default function ImageDropzone({ preview, onFile, className = '', previewClassName = 'max-h-32 rounded-md object-contain', label = 'Drag & drop an image, or click to browse (max 5MB)' }) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef(null)

  const acceptFile = (file) => {
    if (!file) return
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('Only JPEG, PNG, or WEBP images are allowed')
      return
    }
    if (file.size > MAX_SIZE_BYTES) {
      toast.error('Image must be under 5MB')
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
      {preview ? (
        <img src={preview} alt="" className={previewClassName} />
      ) : (
        <>
          <ImageOff size={20} className="text-text-subtle" />
          <span className="text-[12px] text-text-muted text-center px-4">{label}</span>
        </>
      )}
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
        onChange={(e) => acceptFile(e.target.files?.[0])} />
    </div>
  )
}
