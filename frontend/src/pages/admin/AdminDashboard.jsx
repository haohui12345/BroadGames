import { useState, useEffect } from 'react'
import { Users, Gamepad2, Trophy, TrendingUp, Activity } from 'lucide-react'
import authService from '@/services/authService'
import Spinner from '@/components/common/Spinner'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminService.getStats()
      .then(r => setStats(r.data?.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const CARDS = stats ? [
    { label:'Tổng người dùng', val: stats.total_users      ?? 0, icon: Users,    color:'text-blue-500',   bg:'bg-blue-50 dark:bg-blue-900/20' },
    { label:'Trận đã chơi',    val: stats.total_games      ?? 0, icon: Gamepad2, color:'text-purple-500', bg:'bg-purple-50 dark:bg-purple-900/20' },
    { label:'Người dùng mới',  val: stats.new_users_today  ?? 0, icon: TrendingUp, color:'text-emerald-500', bg:'bg-emerald-50 dark:bg-emerald-900/20' },
    { label:'Đang online',     val: stats.online_users     ?? 0, icon: Activity, color:'text-rose-500',   bg:'bg-rose-50 dark:bg-rose-900/20' },
  ] : []

  return (
    <div className="p-6 max-w-5xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">Tổng quan hệ thống</p>
      </div>

      {loading ? <Spinner /> : (
        <>
          <div className="grid grid-cols-4 gap-4 mb-8">
            {CARDS.map(({ label, val, icon: Icon, color, bg }) => (
              <div key={label} className="card p-5">
                <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                  <Icon size={20} className={color} />
                </div>
                <div className="text-2xl font-bold">{val.toLocaleString()}</div>
                <div className="text-xs text-[var(--text-muted)] mt-0.5">{label}</div>
              </div>
            ))}
          </div>

          {/* Game hot */}
          {stats?.hot_games?.length > 0 && (
            <div className="card p-5 mb-6">
              <h2 className="font-semibold mb-4 flex items-center gap-2"><Trophy size={16} className="text-yellow-500" /> Game hot nhất</h2>
              <div className="space-y-3">
                {stats.hot_games.map((g, i) => (
                  <div key={g.slug} className="flex items-center gap-3">
                    <span className="w-5 text-sm text-[var(--text-muted)] font-bold">{i+1}</span>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{g.name}</span>
                        <span className="text-[var(--text-muted)]">{g.play_count} lượt</span>
                      </div>
                      <div className="h-1.5 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                        <div className="h-full bg-primary-500 rounded-full" style={{ width: `${(g.play_count / stats.hot_games[0].play_count) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent users */}
          {stats?.recent_users?.length > 0 && (
            <div className="card p-5">
              <h2 className="font-semibold mb-4">Người dùng mới nhất</h2>
              <div className="divide-y divide-[var(--border)]">
                {stats.recent_users.map(u => (
                  <div key={u.id} className="flex items-center gap-3 py-2.5">
                    <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-sm font-bold text-primary-600">
                      {u.display_name?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{u.display_name}</div>
                      <div className="text-xs text-[var(--text-muted)]">@{u.username}</div>
                    </div>
                    <div className="text-xs text-[var(--text-muted)]">{u.created_at ? new Date(u.created_at).toLocaleDateString('vi') : ''}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
