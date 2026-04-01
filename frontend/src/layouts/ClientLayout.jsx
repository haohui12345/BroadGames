// Main client shell with sidebar navigation and account controls.
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { Home, Gamepad2, Trophy, Users, MessageSquare, Medal, LogOut, Settings, Sun, Moon, ChevronLeft, ChevronRight, Shield } from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'
import authService from '@/services/authService'
import clsx from 'clsx'

const NAV = [
  { to: '/',          icon: Home,         label: 'Trang chủ' },
  { to: '/games',     icon: Gamepad2,     label: 'Trò chơi' },
  { to: '/ranking',   icon: Trophy,       label: 'Bảng xếp hạng' },
  { to: '/friends',   icon: Users,        label: 'Bạn bè' },
  { to: '/messages',  icon: MessageSquare,label: 'Tin nhắn' },
  { to: '/achievements', icon: Medal,     label: 'Thành tựu' },
]

export default function ClientLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const { user, logout } = useAuthStore()
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
      <aside className={clsx(
        'flex flex-col h-full bg-[var(--bg-card)] border-r border-[var(--border)]',
        'transition-all duration-300 ease-in-out relative',
        collapsed ? 'w-16' : 'w-56'
      )}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-[var(--border)]">
          <div className="w-8 h-8 rounded-xl bg-primary-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">B</div>
          {!collapsed && <span className="font-bold text-base tracking-tight">BoardZone</span>}
        </div>

        {/* Nav links */}
        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => clsx(
                'nav-link',
                collapsed ? 'justify-center px-0' : '',
                isActive ? 'active' : ''
              )}
              title={collapsed ? label : undefined}
            >
              <Icon size={18} className="flex-shrink-0" />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="p-2 border-t border-[var(--border)] space-y-0.5">
          <button onClick={toggleTheme} className={clsx('nav-link w-full', collapsed ? 'justify-center px-0' : '')}>
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            {!collapsed && <span>{theme === 'dark' ? 'Sáng' : 'Tối'}</span>}
          </button>

          {user?.role === 'admin' && (
            <NavLink
              to="/admin"
              className={({ isActive }) => clsx('nav-link', collapsed ? 'justify-center px-0' : '', isActive ? 'active' : '')}
              title={collapsed ? 'Admin' : undefined}
            >
              <Shield size={18} className="text-primary-500" />
              {!collapsed && <span className="text-primary-500 font-medium">Admin</span>}
            </NavLink>
          )}

          <NavLink to="/profile" className={({ isActive }) => clsx('nav-link', collapsed ? 'justify-center px-0' : '', isActive ? 'active' : '')}>
            <Settings size={18} />
            {!collapsed && <span>Tài khoản</span>}
          </NavLink>
          <button onClick={handleLogout} className={clsx('nav-link w-full text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20', collapsed ? 'justify-center px-0' : '')}>
            <LogOut size={18} />
            {!collapsed && <span>Đăng xuất</span>}
          </button>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(v => !v)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-[var(--bg-card)] border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors z-10"
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
