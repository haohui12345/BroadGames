import { useState, useEffect } from 'react'
import { Users, Gamepad2, Trophy, TrendingUp, Activity } from 'lucide-react'
import adminService from '@/services/adminService'
import Spinner from '@/components/common/Spinner'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminService.getStats()
      .then(r => setStats(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const CARDS = stats ? [
    { label: 'Tổng người dùng', val: stats.total_users    ?? 0, icon: Users,     color: 'text-blue-500',    bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Tổng trận đã chơi', val: stats.total_matches ?? 0, icon: Gamepad2, color: 'text-purple-500',  bg: 'bg-purple-50 dark:bg-purple-900/20' },
    { label: 'Đang hoạt động',  val: stats.online_users   ?? 0, icon: Activity,  color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { label: 'Tài khoản bị khoá', val: stats.banned_users ?? 0, icon: TrendingUp, color: 'text-rose-500',   bg: 'bg-rose-50 dark:bg-rose-900/20' },
  ] : []

  return (
    <div className="p-6 max-w-5xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">Tổng quan hệ thống</p>
      </div>

      {loading ? <Spinner /> : (
        <>
          {/* Stats cards */}
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
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <Trophy size={16} className="text-yellow-500" /> Top game được chơi nhiều nhất
              </h2>
              <div className="space-y-3">
                {stats.hot_games.map((g, i) => (
                  <div key={`${g.slug}-${i}`} className="flex items-center gap-3">
                    <span className="w-5 text-sm text-[var(--text-muted)] font-bold">{i + 1}</span>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{g.name}</span>
                        <span className="text-[var(--text-muted)]">{(g.play_count || 0).toLocaleString()} lượt</span>
                      </div>
                      <div className="h-1.5 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${((g.play_count || 0) / (stats.hot_games[0]?.play_count || 1)) * 100}%`,
                            background: `hsl(${220 + i * 30}, 70%, 55%)`
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty state nếu chưa có data */}
          {(!stats?.hot_games || stats.hot_games.length === 0) && (
            <div className="card p-8 text-center text-[var(--text-muted)]">
              <Gamepad2 size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Chưa có trận đấu nào được ghi nhận.</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}