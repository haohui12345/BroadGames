// Generic modal with escape-key close and backdrop click handling.
import { useEffect } from 'react'
import { X } from 'lucide-react'

export default function Modal({ open, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    if (!open) return
    const h = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [open, onClose])

  if (!open) return null

  const sizes = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-2xl' }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className={`relative card w-full ${sizes[size]} animate-bounce-in`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
          <h3 className="font-bold text-base">{title}</h3>
          <button onClick={onClose} className="btn-icon"><X size={16} /></button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  )
}
