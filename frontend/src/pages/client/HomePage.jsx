import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Trophy, Gamepad2, Star, ChevronRight, Play } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useGameStore } from '@/store/gameStore'
import userService from '@/services/userService'
import gameService from '@/services/gameService'

const GAMES = [
  { slug: 'caro5', name: 'Caro 5', emoji: '⬛', color: 'from-blue-500 to-indigo-600' },
  { slug: 'caro4', name: 'Caro 4', emoji: '🔷', color: 'from-indigo-500 to-purple-600' },
  { slug: 'tictactoe', name: 'Tic-tac-toe', emoji: '❌', color: 'from-purple-500 to-pink-600' },
  { slug: 'snake', name: 'Rắn săn mồi', emoji: '🐍', color: 'from-green-500 to-emerald-600' },
  { slug: 'match3', name: 'Ghép hàng 3', emoji: '💎', color: 'from-yellow-500 to-orange-500' },
  { slug: 'memory', name: 'Cờ trí nhớ', emoji: '🧠', color: 'from-pink-500 to-rose-600' },
  { slug: 'draw', name: 'Bảng vẽ', emoji: '🎨', color: 'from-teal-500 to-cyan-600' },
]

const GAME_COLORS = Object.fromEntries(GAMES.map((game) => [game.slug, game.color]))

export default function HomePage() {
  const { user } = useAuthStore()
  const { scores } = useGameStore()
  const [ranking, setRanking] = useState([])
  const [games, setGames] = useState([])

  useEffect(() => {
    userService
      .getRanking({ type: 'global', page: 1 })
      .then((r) => {
          const raw = r.data || []
          // Dedupe theo user_id phòng API trả về trùng
          const seen = new Set()
          const unique = raw.filter((item) => {
            const id = item.user_id
            if (!id || seen.has(id)) return false
            seen.add(id)
            return true
          })
          setRanking(unique.slice(0, 5))
        })
      .catch(() => setRanking([]))

    gameService
      .getGames({ onlyEnabled: true, force: true })
      .then((response) => setGames(response.data || []))
      .catch(() => setGames([]))
  }, [])

  const totalWins = Object.values(scores || {}).reduce((s, g) => s + (g?.wins || 0), 0)
  const firstGamePath = games[0]?.slug ? `/play/${games[0].slug}` : '/games'
  const featuredGames = games.slice(0, 4)

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Chào, {user?.display_name || 'người chơi'} 👋</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Sẵn sàng cho trận đấu tiếp theo chưa?
          </p>
        </div>

        <Link to={firstGamePath} className="btn-primary">
          <Play size={16} /> Chơi ngay
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: Trophy, label: 'Số trận thắng', value: totalWins, color: 'text-yellow-500' },
          { icon: Gamepad2, label: 'Game đã chơi', value: Object.keys(scores || {}).length, color: 'text-primary-500' },
          { icon: Star, label: 'Điểm thưởng', value: totalWins * 10, color: 'text-pink-500' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="card p-4 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl bg-[var(--bg-secondary)] flex items-center justify-center ${color}`}>
              <Icon size={20} />
            </div>
            <div>
              <div className="text-xl font-bold">{value}</div>
              <div className="text-xs text-[var(--text-muted)]">{label}</div>
            </div>
          </div>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg">Trò chơi</h2>
          <Link to="/games" className="text-sm text-primary-500 hover:underline flex items-center gap-1">
            Xem tất cả <ChevronRight size={14} />
          </Link>
        </div>

        {featuredGames.length === 0 ? (
          <div className="card p-4 text-sm text-[var(--text-muted)]">Hiện chưa có game nào đang được bật.</div>
        ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {featuredGames.map((g) => (
            <Link
              key={g.slug}
              to={`/play/${g.slug}`}
              className="card p-4 text-center hover:scale-105 transition-transform duration-200 cursor-pointer group"
            >
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${g.color || GAME_COLORS[g.slug] || 'from-slate-500 to-slate-700'} flex items-center justify-center text-2xl mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                {g.emoji}
              </div>
              <div className="text-sm font-semibold">{g.name}</div>

              {scores?.[g.slug] && (
                <div className="text-xs text-[var(--text-muted)] mt-1">
                  {scores[g.slug].wins}W / {scores[g.slug].losses}L
                </div>
              )}
            </Link>
          ))}
        </div>
        )}
      </div>

      {ranking.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg">Bảng xếp hạng</h2>
            <Link to="/ranking" className="text-sm text-primary-500 hover:underline flex items-center gap-1">
              Xem đầy đủ <ChevronRight size={14} />
            </Link>
          </div>

          <div className="card divide-y divide-[var(--border)]">
            {ranking.map((r, i) => (
              <div key={r.user_id ? `uid-${r.user_id}` : `rank-${i}`} className="flex items-center gap-3 px-4 py-3">
                <span
                  className={`w-6 text-center font-bold text-sm ${
                    i === 0 ? 'text-yellow-500' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-orange-500' : 'text-[var(--text-muted)]'
                  }`}
                >
                  {i + 1}
                </span>

                <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-sm font-bold text-primary-600 dark:text-primary-400">
                  {r.display_name?.[0]?.toUpperCase() || '?'}
                </div>

                <span className="flex-1 text-sm font-medium">{r.display_name}</span>
                <span className="text-sm font-bold text-[var(--text-secondary)]">
                  {r.score ?? r.wins ?? 0} đ
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
