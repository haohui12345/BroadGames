// Simple paginator used by list pages with compact ellipsis logic.
import { ChevronLeft, ChevronRight } from 'lucide-react'
import clsx from 'clsx'

export default function Pagination({ page, total, limit = 10, onChange }) {
  const totalPages = Math.ceil(total / limit)
  if (totalPages <= 1) return null

  const pages = []
  const delta = 2
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - delta && i <= page + delta)) {
      pages.push(i)
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...')
    }
  }

  return (
    <div className="flex items-center justify-center gap-1 mt-4">
      <button onClick={() => onChange(page - 1)} disabled={page === 1} className="btn-icon disabled:opacity-30">
        <ChevronLeft size={16} />
      </button>
      {pages.map((p, i) =>
        p === '...' ? (
          <span key={i} className="w-8 text-center text-sm text-[var(--text-muted)]">…</span>
        ) : (
          <button key={p} onClick={() => onChange(p)}
            className={clsx('w-8 h-8 rounded-lg text-sm font-medium transition-all',
              p === page ? 'bg-primary-500 text-white' : 'hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)]')}>
            {p}
          </button>
        )
      )}
      <button onClick={() => onChange(page + 1)} disabled={page === totalPages} className="btn-icon disabled:opacity-30">
        <ChevronRight size={16} />
      </button>
    </div>
  )
}
