import { useEffect, useState } from 'react'
import userService from '@/services/userService'

const games = [
  { slug: '', name: 'Tất cả trò chơi' },
  { slug: 'caro5', name: 'Caro hàng 5' },
  { slug: 'caro4', name: 'Caro hàng 4' },
  { slug: 'tictactoe', name: 'Tic-tac-toe' },
  { slug: 'snake', name: 'Rắn săn mồi' },
  { slug: 'match3', name: 'Ghép hàng 3' },
  { slug: 'memory', name: 'Cờ trí nhớ' },
  { slug: 'draw', name: 'Bảng vẽ tự do' },
]

export default function RankingPage() {
  const [ranking, setRanking] = useState([])
  const [type, setType] = useState('global')
  const [gameSlug, setGameSlug] = useState('')

  useEffect(() => {
    userService
      .getRanking({ type, gameSlug, page: 1 })
      .then((r) => {
        const raw = r.data || []
        const seen = new Set()
        const unique = raw.filter(item => {
          if (!item.user_id || seen.has(item.user_id)) return false
          seen.add(item.user_id)
          return true
        })
        setRanking(unique)
      })
      .catch(() => setRanking([]))
  }, [type, gameSlug])

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Bảng xếp hạng</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Xem xếp hạng theo từng trò chơi: toàn hệ thống, bạn bè, cá nhân.</p>
        </div>

        <div className="flex gap-3">
          <select
            value={gameSlug}
            onChange={(e) => setGameSlug(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-700 bg-black text-white"
          >
            {games.map((g) => (
              <option key={g.slug} value={g.slug} className="bg-black text-white">
                {g.name}
              </option>
            ))}
          </select>

          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-700 bg-black text-white"
          >
            <option value="global" className="bg-black text-white">Toàn hệ thống</option>
            <option value="friends" className="bg-black text-white">Bạn bè</option>
            <option value="personal" className="bg-black text-white">Cá nhân</option>
          </select>
        </div>
      </div>

      <div className="card divide-y divide-[var(--border)]">
        {ranking.map((item, index) => (
          <div key={item.user_id ? `uid-${item.user_id}` : `rank-${index}`} className="px-4 py-4 flex items-center gap-4">
            <div className="w-8 text-center font-bold">{index + 1}</div>
            <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center font-bold">
              {item.display_name?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="flex-1">
              <div className="font-medium">{item.display_name}</div>
              <div className="text-xs text-[var(--text-muted)]">@{item.username || 'nguoi-dung'}</div>
            </div>
            <div className="font-bold">{item.score ?? item.wins ?? 0}</div>
          </div>
        ))}
        {!ranking.length && <div className="px-4 py-8 text-center text-[var(--text-muted)]">Chưa có dữ liệu xếp hạng.</div>}
      </div>
    </div>
  )
}
