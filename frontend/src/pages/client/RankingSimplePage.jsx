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

const scopes = [
  { value: 'global', label: 'Toàn hệ thống' },
  { value: 'friends', label: 'Bạn bè' },
  { value: 'personal', label: 'Cá nhân' },
]

const PAGE_SIZE = 50
const MAX_PAGES = 8

function mergePlayers(rows) {
  const players = new Map()

  rows.forEach((item, index) => {
    const key = item.user_id || item.username || `player-${index}`
    const current = players.get(key) || {
      user_id: item.user_id,
      username: item.username,
      display_name: item.display_name,
      avatar_url: item.avatar_url,
      score: 0,
      wins: 0,
      losses: 0,
      draws: 0,
    }

    current.score += Number(item.score || 0)
    current.wins += Number(item.wins || 0)
    current.losses += Number(item.losses || 0)
    current.draws += Number(item.draws || 0)

    players.set(key, current)
  })

  return Array.from(players.values()).sort((left, right) =>
    Number(right.score || 0) - Number(left.score || 0) ||
    Number(right.wins || 0) - Number(left.wins || 0) ||
    String(left.display_name || left.username || '').localeCompare(String(right.display_name || right.username || ''), 'vi')
  )
}

async function loadRanking(type, gameSlug) {
  const rows = []

  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const response = await userService.getRanking({ type, gameSlug, page, limit: PAGE_SIZE })
    const data = response.data || []

    rows.push(...data)

    if (data.length < PAGE_SIZE) break
    if (type === 'personal') break
  }

  return mergePlayers(rows)
}

export default function RankingSimplePage() {
  const [ranking, setRanking] = useState([])
  const [type, setType] = useState('global')
  const [gameSlug, setGameSlug] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    setLoading(true)

    loadRanking(type, gameSlug)
      .then((data) => {
        if (active) setRanking(data)
      })
      .catch(() => {
        if (active) setRanking([])
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [type, gameSlug])

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Bảng xếp hạng</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Danh sách tất cả người chơi theo bộ lọc đã chọn.
          </p>
        </div>

        <div className="flex gap-3 flex-wrap">
          <select
            value={gameSlug}
            onChange={(event) => setGameSlug(event.target.value)}
            className="px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-primary)]"
          >
            {games.map((game) => (
              <option key={game.slug} value={game.slug}>
                {game.name}
              </option>
            ))}
          </select>

          <select
            value={type}
            onChange={(event) => setType(event.target.value)}
            className="px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-primary)]"
          >
            {scopes.map((scope) => (
              <option key={scope.value} value={scope.value}>
                {scope.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="text-sm text-[var(--text-muted)]">
        {loading ? 'Đang tải dữ liệu...' : `${ranking.length} người chơi`}
      </div>

      <div className="card divide-y divide-[var(--border)] overflow-hidden">
        {ranking.map((item, index) => (
          <div
            key={item.user_id || item.username || `rank-${index}`}
            className="px-4 py-4 flex items-center gap-4"
          >
            <div className="w-8 text-center font-bold">{index + 1}</div>
            <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center font-bold">
              {item.display_name?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{item.display_name || 'Người chơi'}</div>
              <div className="text-xs text-[var(--text-muted)] truncate">@{item.username || 'nguoi-dung'}</div>
            </div>
            <div className="text-right">
              <div className="font-bold">{item.score || 0}</div>
              <div className="text-xs text-[var(--text-muted)]">
                W {item.wins || 0} / L {item.losses || 0} / D {item.draws || 0}
              </div>
            </div>
          </div>
        ))}

        {!loading && !ranking.length && (
          <div className="px-4 py-8 text-center text-[var(--text-muted)]">
            Chưa có dữ liệu xếp hạng.
          </div>
        )}
      </div>
    </div>
  )
}
