// Admin shell with navigation, quick game toggles, and moderation actions.
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Users, Gamepad2, BarChart3, LogOut, Sun, Moon, ChevronLeft, ToggleLeft, ToggleRight, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'
import adminService from '@/services/adminService'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const NAV = [
  { to: '/admin',        icon: LayoutDashboard, label: 'Dashboard',    end: true },
  { to: '/admin/users',  icon: Users,           label: 'Người dùng' },
  { to: '/admin/games',  icon: Gamepad2,        label: 'Quản lý Game' },
  { to: '/admin/stats',  icon: BarChart3,       label: 'Thống kê' },
]

export default function AdminLayout() {
  const { logout, user } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()
  const navigate = useNavigate()

  const [games, setGames] = useState([])
  const [panelOpen, setPanelOpen] = useState(false)
  const [toggling, setToggling] = useState(null)
  const [loadingGames, setLoadingGames] = useState(false)

  const loadGames = () => {
    setLoadingGames(true)
    adminService.getGames()
      .then(r => setGames(r.data || []))
      .catch(() => {})
      .finally(() => setLoadingGames(false))
  }

  useEffect(() => {
    if (panelOpen && games.length === 0) loadGames()
  }, [panelOpen])

  const handleToggle = async (game) => {
    setToggling(game.id)
    try {
      await adminService.toggleGame(game.id)
      setGames(prev => prev.map(g =>
        g.id === game.id ? { ...g, enabled: !g.enabled } : g
      ))
      toast.success(game.enabled ? `Đã tắt "${game.name}"` : `Đã bật "${game.name}"`)
    } catch {
      toast.error('Không thể thay đổi trạng thái')
    } finally {
      setToggling(null)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const enabledCount = games.filter(g => g.enabled).length

  return (
    <div className="flex h-screen bg-[var(--bg-primary)] overflow-hidden">
      {/* Sidebar */}
      <aside className="flex flex-col w-56 h-full bg-[var(--bg-card)] border-r border-[var(--border)] shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-[var(--border)]">
          <div className="w-8 h-8 rounded-xl bg-red-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
            A
          </div>
          <div className="min-w-0">
            <div className="font-bold text-sm leading-tight truncate">BoardZone</div>
            <div className="text-xs text-[var(--text-muted)]">Admin Panel</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {NAV.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to} to={to} end={end}
              className={({ isActive }) => clsx('nav-link', isActive && 'active')}
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}

          {/* Quick Toggle Panel */}
          <div className="mt-2 pt-2 border-t border-[var(--border)]">
            <button
              onClick={() => setPanelOpen(v => !v)}
              className="nav-link w-full justify-between"
            >
              <div className="flex items-center gap-2.5">
                <ToggleRight size={18} />
                <span>Bật/tắt Game</span>
              </div>
              <div className="flex items-center gap-1.5">
                {games.length > 0 && (
                  <span className={clsx(
                    'text-xs font-bold px-1.5 py-0.5 rounded-full',
                    enabledCount === games.length
                      ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                  )}>
                    {enabledCount}/{games.length}
                  </span>
                )}
                {panelOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </div>
            </button>

            {panelOpen && (
              <div className="mt-1 ml-1 space-y-0.5">
                {/* Header reload */}
                <div className="flex items-center justify-between px-2 py-1">
                  <span className="text-xs text-[var(--text-muted)]">
                    {loadingGames ? 'Đang tải...' : `${enabledCount}/${games.length} đang bật`}
                  </span>
                  <button
                    onClick={loadGames}
                    disabled={loadingGames}
                    className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-40"
                    title="Làm mới"
                  >
                    <RefreshCw size={12} className={loadingGames ? 'animate-spin' : ''} />
                  </button>
                </div>

                {loadingGames ? (
                  <div className="flex justify-center py-3">
                    <span className="w-4 h-4 border-2 border-[var(--border)] border-t-primary-500 rounded-full animate-spin" />
                  </div>
                ) : games.length === 0 ? (
                  <div className="text-xs text-center py-2 text-[var(--text-muted)]">Không có game</div>
                ) : (
                  games.map(game => (
                    <div
                      key={game.id}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors"
                    >
                      <span className={clsx('text-base shrink-0 transition-all', !game.enabled && 'grayscale opacity-50')}>
                        {game.emoji || '🎮'}
                      </span>
                      <span className={clsx(
                        'flex-1 text-xs truncate transition-colors',
                        game.enabled ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'
                      )}>
                        {game.name}
                      </span>
                      <button
                        onClick={() => handleToggle(game)}
                        disabled={toggling === game.id}
                        title={game.enabled ? 'Nhấn để tắt' : 'Nhấn để bật'}
                        className="shrink-0 disabled:opacity-40 transition-all"
                      >
                        {toggling === game.id ? (
                          <span className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin block" />
                        ) : game.enabled ? (
                          <ToggleRight size={20} className="text-emerald-500 hover:text-emerald-400 transition-colors" />
                        ) : (
                          <ToggleLeft size={20} className="text-gray-400 hover:text-gray-300 transition-colors" />
                        )}
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </nav>

        {/* Bottom */}
        <div className="p-2 border-t border-[var(--border)] space-y-0.5">
          <div className="flex items-center gap-2 px-3 py-2 mb-1">
            <div className="w-7 h-7 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-xs font-bold text-red-600 dark:text-red-400 shrink-0">
              {user?.username?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-medium truncate">{user?.username || 'Admin'}</div>
              <div className="text-xs text-[var(--text-muted)]">Admin</div>
            </div>
          </div>

          <NavLink to="/" className="nav-link">
            <ChevronLeft size={18} />
            <span>Về trang Client</span>
          </NavLink>

          <button onClick={toggleTheme} className="nav-link w-full">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            <span>{theme === 'dark' ? 'Chế độ sáng' : 'Chế độ tối'}</span>
          </button>

          <button
            onClick={handleLogout}
            className="nav-link w-full text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <LogOut size={18} />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto bg-[var(--bg-primary)]">
        <Outlet />
      </main>
    </div>
  )
}
