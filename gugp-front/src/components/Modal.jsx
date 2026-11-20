import { useEffect, useId, useRef } from 'react'
import { X } from 'lucide-react'

export default function Modal({ open, onClose, title, children, width = 'max-w-md' }) {
  const titleId = useId()
  const panelRef = useRef(null)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  })

  useEffect(() => {
    if (!open) return
    const previous = document.activeElement
    const onKey = (e) => {
      if (e.key === 'Escape') onCloseRef.current()
    }
    window.addEventListener('keydown', onKey)
    // Place le focus dans la fenêtre si aucun champ n'a pris l'autofocus.
    const t = setTimeout(() => {
      if (panelRef.current && !panelRef.current.contains(document.activeElement)) {
        panelRef.current.focus()
      }
    }, 0)
    return () => {
      clearTimeout(t)
      window.removeEventListener('keydown', onKey)
      if (previous && typeof previous.focus === 'function') previous.focus()
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:px-4">
      <button
        aria-label="Fermer"
        tabIndex={-1}
        className="animate-fade-in absolute inset-0 bg-ink-2/45 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`animate-scale-in relative max-h-[90dvh] w-full ${width} overflow-y-auto rounded-t-2xl border border-line bg-surface shadow-lift outline-none sm:rounded-2xl`}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-surface/95 px-5 py-4 backdrop-blur">
          <h2 id={titleId} className="text-[1.05rem] font-semibold text-ink">{title}</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-paper-2 hover:text-ink"
            aria-label="Fermer la fenêtre"
          >
            <X size={17} aria-hidden="true" />
          </button>
        </div>
        <div className="px-5 py-5">{children}</div>
      </div>
    </div>
  )
}
