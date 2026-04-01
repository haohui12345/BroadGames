// Admin stats screen: summarizes totals and gameplay distribution.
import { useState, useEffect } from 'react'
import { BarChart3, Users, Gamepad2, TrendingUp, ShieldOff } from 'lucide-react'
import adminService from '@/services/adminService'
import Spinner from '@/components/common/Spinner'

export default function AdminStats() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  // This screen is read-only, so a single fetch is enough.
  useEffect(() => {
    adminService.getStats()
      .then(r => setStats(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-6"><Spinner /></div>

  // These derived values drive the chart scaling and the summary text.
  const topGames = stats?.hot_games || []
  const maxPlays = topGames[0]?.play_count || 1

  const METRICS = [
    { label: 'Tổng tài khoản',       val: stats?.total_users    ?? 0, icon: Users,     color: 'text-blue-500',    bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Tổng trận đấu',        val: stats?.total_matches  ?? 0, icon: Gamepad2,  color: 'text-purple-500',  bg: 'bg-purple-50 dark:bg-purple-900/20' },
    { label: 'Đang hoạt động',       val: stats?.online_users   ?? 0, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { label: 'Tài khoản bị khoá',   val: stats?.banned_users   ?? 0, icon: ShieldOff, color: 'text-rose-500',    bg: 'bg-rose-50 dark:bg-rose-900/20' },
  ]

  return (
    <div className="p-6 max-w-4xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Thống kê hệ thống</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">Tổng quan số liệu toàn hệ thống</p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {METRICS.map(({ label, val, icon: Icon, color, bg }) => (
          <div key={label} className="card p-4 text-center">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mx-auto mb-2`}>
              <Icon size={20} className={color} />
            </div>
            <div className="text-2xl font-bold">{val.toLocaleString()}</div>
            <div className="text-xs text-[var(--text-muted)] mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Game popularity chart */}
        <div className="card p-5">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Gamepad2 size={16} className="text-purple-500" /> Lượt chơi theo game
          </h2>
          {topGames.length === 0 ? (
            <div className="text-sm text-[var(--text-muted)] py-8 text-center">
              Chưa có dữ liệu
            </div>
          ) : (
            <div className="space-y-3">
              {topGames.map((g, i) => (
                <div key={`${g.slug ?? g.name}-${i}`}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium">{g.name}</span>
                    <span className="text-[var(--text-muted)]">{(g.play_count || 0).toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${((g.play_count || 0) / maxPlays) * 100}%`,
                        background: `hsl(${220 + i * 30}, 70%, 55%)`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* User breakdown */}
        <div className="card p-5">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Users size={16} className="text-blue-500" /> Người dùng
          </h2>
          <div className="space-y-1">
            {[
              { label: 'Tổng tài khoản',     val: stats?.total_users    ?? 0 },
              { label: 'Tài khoản Admin',    val: stats?.total_admins   ?? 0 },
              { label: 'Tài khoản bị khoá', val: stats?.banned_users   ?? 0 },
              { label: 'Tổng game',          val: stats?.total_games    ?? 0 },
              { label: 'Tổng trận đấu',     val: stats?.total_matches  ?? 0 },
            ].map(({ label, val }) => (
              <div key={label} className="flex justify-between items-center py-2.5 border-b border-[var(--border)] last:border-0">
                <span className="text-sm text-[var(--text-secondary)]">{label}</span>
                <span className="font-bold">{val.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
