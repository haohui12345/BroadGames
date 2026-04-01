// Keyboard-friendly grid board used by the turn-based games and game selector.
import { useEffect, useCallback, useState } from 'react'
import { ChevronLeft, ChevronRight, CornerDownLeft, Delete, Lightbulb } from 'lucide-react'
import clsx from 'clsx'

/**
 * GameBoard — core reusable board component
 * Props:
 *   rows, cols       — board dimensions
 *   renderCell(r,c)  — returns { content, className }
 *   onLeft, onRight, onEnter, onBack, onHint — handlers
 *   cursor           — { row, col } current cursor position
 *   highlightCells   — array of {row,col} to highlight (win line etc.)
 *   disabled         — disable input
 *   footer           — extra JSX below board
 */
export default function GameBoard({
  rows, cols,
  renderCell,
  onLeft, onRight, onUp, onDown, onEnter, onBack, onHint,
  cursor,
  disabled = false,
  footer,
  cellSize = 36,
}) {
  const [hintActive, setHintActive] = useState(false)

  // Keyboard support
  useEffect(() => {
    if (disabled) return
    const handle = (e) => {
      switch (e.key) {
        case 'ArrowLeft':  e.preventDefault(); onLeft?.(); break
        case 'ArrowRight': e.preventDefault(); onRight?.(); break
        case 'ArrowUp':    e.preventDefault(); onUp?.(); break
        case 'ArrowDown':  e.preventDefault(); onDown?.(); break
        case 'Enter':      e.preventDefault(); onEnter?.(); break
        case 'Backspace':
        case 'Escape':     e.preventDefault(); onBack?.(); break
        case 'h':
        case 'H':          handleHint(); break
      }
    }
    window.addEventListener('keydown', handle)
    return () => window.removeEventListener('keydown', handle)
  }, [disabled, onLeft, onRight, onUp, onDown, onEnter, onBack, onHint])

  const handleHint = () => {
    setHintActive(true)
    onHint?.()
    setTimeout(() => setHintActive(false), 1500)
  }

  const BUTTONS = [
    { label: 'Left',  icon: ChevronLeft,    action: onLeft,  key: '←' },
    { label: 'Right', icon: ChevronRight,   action: onRight, key: '→' },
    { label: 'ENTER', icon: CornerDownLeft, action: onEnter, key: '↵', accent: true },
    { label: 'Back',  icon: Delete,         action: onBack,  key: 'Esc' },
    { label: 'Hint',  icon: Lightbulb,      action: handleHint, key: 'H', active: hintActive },
  ]

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Board */}
      <div
        className="relative rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--bg-card)]"
        style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.12)' }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
            gridTemplateRows:    `repeat(${rows}, ${cellSize}px)`,
            gap: '2px',
            padding: '8px',
            background: 'var(--border)',
          }}
        >
          {Array.from({ length: rows }, (_, r) =>
            Array.from({ length: cols }, (_, c) => {
              const isCursor = cursor?.row === r && cursor?.col === c
              const cell = renderCell(r, c)
              return (
                <div
                  key={`${r}-${c}`}
                  className={clsx(
                    'cell',
                    { 'cell-filled': !!cell?.content },
                    isCursor && !disabled && 'ring-2 ring-primary-400 ring-offset-0',
                    cell?.className,
                  )}
                  style={{ width: cellSize, height: cellSize, fontSize: cellSize * 0.45, background: 'var(--bg-card)' }}
                  onClick={() => !disabled && onEnter?.({ row: r, col: c })}
                >
                  {cell?.content}
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* 5 control buttons */}
      <div className="flex items-center gap-2">
        {BUTTONS.map(({ label, icon: Icon, action, key, accent, active }) => (
          <button
            key={label}
            onClick={() => !disabled && action?.()}
            disabled={disabled}
            className={clsx(
              'flex flex-col items-center gap-1 px-4 py-2.5 rounded-xl border text-xs font-medium',
              'transition-all duration-150 active:scale-95 disabled:opacity-40',
              accent
                ? 'bg-primary-500 hover:bg-primary-600 text-white border-primary-600'
                : active
                ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 border-yellow-300 dark:border-yellow-700'
                : 'bg-[var(--bg-card)] hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-[var(--border)]'
            )}
          >
            <Icon size={16} />
            <span>{label}</span>
            <span className="text-[10px] opacity-60">{key}</span>
          </button>
        ))}
      </div>

      {footer}
    </div>
  )
}
