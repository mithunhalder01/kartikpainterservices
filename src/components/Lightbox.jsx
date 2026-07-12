import { useEffect, useRef, useCallback } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

export default function Lightbox({ images, index, onClose, onNavigate }) {
  const touchStart = useRef(null)
  const touchEnd = useRef(null)
  const MIN_SWIPE = 50

  const image = images[index]

  const next = useCallback(() => {
    onNavigate((index + 1) % images.length)
  }, [index, images.length, onNavigate])

  const prev = useCallback(() => {
    onNavigate((index - 1 + images.length) % images.length)
  }, [index, images.length, onNavigate])

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') prev()
    }
    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [onClose, next, prev])

  if (!image) return null

  const onTouchStart = (e) => { touchStart.current = e.targetTouches[0].clientX }
  const onTouchMove = (e) => { touchEnd.current = e.targetTouches[0].clientX }
  const onTouchEnd = () => {
    if (touchStart.current == null || touchEnd.current == null) return
    const delta = touchStart.current - touchEnd.current
    if (Math.abs(delta) >= MIN_SWIPE) (delta > 0 ? next() : prev())
    touchStart.current = null
    touchEnd.current = null
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-sm animate-[fade-up_0.15s_ease]"
      onClick={onClose}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <button
        onClick={(e) => { e.stopPropagation(); onClose() }}
        aria-label="Close"
        className="absolute top-3 right-3 sm:top-5 sm:right-5 z-10 w-10 h-10 sm:w-11 sm:h-11
                   rounded-full bg-white/10 hover:bg-white/20 text-white
                   flex items-center justify-center transition-colors">
        <X size={20} />
      </button>

      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); prev() }}
            aria-label="Previous image"
            className="absolute left-2 sm:left-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12
                       rounded-full bg-white/10 hover:bg-white/20 text-white
                       flex items-center justify-center transition-colors">
            <ChevronLeft size={22} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); next() }}
            aria-label="Next image"
            className="absolute right-2 sm:right-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12
                       rounded-full bg-white/10 hover:bg-white/20 text-white
                       flex items-center justify-center transition-colors">
            <ChevronRight size={22} />
          </button>
        </>
      )}

      <div className="max-w-[92vw] max-h-[86vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
        <img
          src={image.imageUrl}
          alt={image.label || 'Gallery photo'}
          className="max-w-[92vw] max-h-[78vh] object-contain rounded-md select-none"
          draggable={false}
        />
        {(image.label || image.category) && (
          <div className="mt-3 text-center px-4">
            {image.label && <p className="text-white text-[14px] font-medium">{image.label}</p>}
            {image.category && <p className="text-white/50 text-[11px] uppercase tracking-widest mt-0.5">{image.category}</p>}
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="absolute bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 text-white/60 text-[12px]">
          {index + 1} / {images.length}
        </div>
      )}
    </div>
  )
}
