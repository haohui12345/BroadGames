// Shell for login and register pages with theme toggle and centered branding.
import { Outlet } from 'react-router-dom'
import { useThemeStore } from '@/store/themeStore'
import { Sun, Moon } from 'lucide-react'

export default function AuthLayout() {
  const { theme, toggleTheme } = useThemeStore()
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-secondary)] px-4">
      <button onClick={toggleTheme} className="absolute top-4 right-4 btn-icon">
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>
      <div className="mb-8 text-center">
        <div className="w-12 h-12 rounded-2xl bg-primary-500 flex items-center justify-center text-white font-bold text-xl mx-auto mb-3">B</div>
        <h1 className="text-2xl font-bold">BoardZone</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">Sàn đấu trí tuệ</p>
      </div>
      <div className="w-full max-w-sm">
        <Outlet />
      </div>
    </div>
  )
}
