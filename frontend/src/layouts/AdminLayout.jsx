import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Users, Gamepad2, BarChart3, LogOut, Sun, Moon, ChevronLeft } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'
import authService from '@/services/authService'
import clsx from 'clsx'

const NAV = [
  { to: '/admin',         icon: LayoutDashboard, label: 'Dashboard',      end: true },
  { to: '/admin/users',   icon: Users,           label: 'Người dùng' },
  { to: '/admin/games',   icon: Gamepad2,        label: 'Quản lý Game' },
  { to: '/admin/stats',   icon: BarChart3,       label: 'Thống kê' },
]

export default function AdminLayout() {
  const { logout } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try { await authService.logout() } catch {}
    logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-[var(--bg-primary)] overflow-hidden">
      {/* Sidebar */}
      <aside className="flex flex-col w-56 h-full bg-[var(--bg-card)] border-r border-[var(--border)]">
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-[var(--border)]">
          <div className="w-8 h-8 rounded-xl bg-red-500 flex items-center justify-center text-white font-bold text-sm">A</div>
          <div>
            <div className="font-bold text-sm leading-tight">BoardZone</div>
            <div className="text-xs text-[var(--text-muted)]">Admin Panel</div>
          </div>
        </div>

        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {NAV.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to} to={to} end={end}
              className={({ isActive }) => clsx('nav-link', isActive ? 'active' : '')}
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-2 border-t border-[var(--border)] space-y-0.5">
          <NavLink to="/" className="nav-link">
            <ChevronLeft size={18} />
            <span>Về trang Client</span>
          </NavLink>
          <button onClick={toggleTheme} className="nav-link w-full">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            <span>{theme === 'dark' ? 'Sáng' : 'Tối'}</span>
          </button>
          <button onClick={handleLogout} className="nav-link w-full text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
            <LogOut size={18} />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
