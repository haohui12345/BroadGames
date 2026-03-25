import { useState, useEffect } from 'react'
import { BarChart3, Users, Gamepad2, TrendingUp } from 'lucide-react'
import authService from '@/services/authService'
import Spinner from '@/components/common/Spinner'

export default function AdminStats() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminService.getStats()
      .then(r => setStats(r.data?.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />

  const topGames = stats?.hot_games || []
  const maxPlays = topGames[0]?.play_count || 1

  const METRICS = stats ? [
    { label:'Tổng tài khoản',   val: stats.total_users        ?? 0, icon: Users,    color:'text-blue-500' },
    { label:'Tổng trận đấu',    val: stats.total_games        ?? 0, icon: Gamepad2, color:'text-purple-500' },
    { label:'Người dùng mới hôm nay', val: stats.new_users_today ?? 0, icon: TrendingUp, color:'text-emerald-500' },
    { label:'Trận hôm nay',     val: stats.games_today        ?? 0, icon: BarChart3, color:'text-yellow-500' },
  ] : []

  return (
    <div className="p-6 max-w-4xl mx-auto animate-fade-in">
      <h1 className="text-2xl font-bold mb-6">Thống kê hệ thống</h1>

      {/* Key metrics */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {METRICS.map(({ label, val, icon: Icon, color }) => (
          <div key={label} className="card p-4 text-center">
            <Icon size={20} className={`${color} mx-auto mb-2`} />
            <div className="text-2xl font-bold">{val.toLocaleString()}</div>
            <div className="text-xs text-[var(--text-muted)] mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Game popularity */}
        <div className="card p-5">
          <h2 className="font-semibold mb-4 flex items-center gap-2"><Gamepad2 size={16} /> Lượt chơi theo game</h2>
          {topGames.length === 0 ? (
            <div className="text-sm text-[var(--text-muted)] py-4 text-center">Chưa có dữ liệu</div>
          ) : (
            <div className="space-y-3">
              {topGames.map((g, i) => (
                <div key={g.slug}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium">{g.name}</span>
                    <span className="text-[var(--text-muted)]">{(g.play_count || 0).toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${(g.play_count / maxPlays) * 100}%`, background: `hsl(${220 + i * 30}, 70%, 55%)` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* User stats */}
        <div className="card p-5">
          <h2 className="font-semibold mb-4 flex items-center gap-2"><Users size={16} /> Người dùng</h2>
          <div className="space-y-4">
            {[
              { label:'Tổng tài khoản',    val: stats?.total_users     ?? 0 },
              { label:'Tài khoản Admin',   val: stats?.total_admins    ?? 0 },
              { label:'Tài khoản bị cấm',  val: stats?.banned_users    ?? 0 },
              { label:'Đăng ký hôm nay',   val: stats?.new_users_today ?? 0 },
            ].map(({ label, val }) => (
              <div key={label} className="flex justify-between items-center py-2 border-b border-[var(--border)] last:border-0">
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
