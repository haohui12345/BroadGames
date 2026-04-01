// Lightweight shell used by gameplay screens so they stay distraction-free.
import { Outlet, useNavigate } from 'react-router-dom'
import { ArrowLeft, Sun, Moon } from 'lucide-react'
import { useThemeStore } from '@/store/themeStore'

export default function GameLayout() {
  const { theme, toggleTheme } = useThemeStore()
  const navigate = useNavigate()

  return (
    <div className="flex flex-col h-screen bg-[var(--bg-primary)]">
      {/* Minimal top bar */}
      <header className="flex items-center justify-between px-4 h-12 border-b border-[var(--border)] bg-[var(--bg-card)] flex-shrink-0">
        <button onClick={() => navigate('/games')} className="btn-ghost flex items-center gap-1.5 text-sm">
          <ArrowLeft size={16} />
          Danh sách game
        </button>
        <span className="font-bold text-sm tracking-tight text-[var(--text-secondary)]">BoardZone</span>
        <button onClick={toggleTheme} className="btn-icon">
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </header>

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
