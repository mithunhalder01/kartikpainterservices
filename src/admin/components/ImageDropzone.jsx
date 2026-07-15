import { useRef, useState } from 'react'
import { ImageOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { prepareImageFile, isHeic } from '../utils/prepareImageFile'

export default function ImageDropzone({ preview, onFile, className = '', previewClassName = 'max-h-32 rounded-md object-contain', label = 'Drag & drop an image, or click to browse (max 5MB)' }) {
  const [dragging, setDragging] = useState(false)
  const [converting, setConverting] = useState(false)
  const inputRef = useRef(null)

  const acceptFile = async (file) => {
    if (!file) return
    try {
      if (isHeic(file)) setConverting(true)
      const prepared = await prepareImageFile(file)
      onFile(prepared)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setConverting(false)
    }
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
