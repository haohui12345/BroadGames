import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useGameStore } from '@/store/gameStore'
import gameService from '@/services/gameService'

const GAMES = [
  { slug: 'caro5', name: 'Caro hàng 5', desc: 'Đặt 5 quân liên tiếp để thắng.', emoji: '⬛' },
  { slug: 'caro4', name: 'Caro hàng 4', desc: 'Biến thể nhanh hơn của caro.', emoji: '🔷' },
  { slug: 'tictactoe', name: 'Tic-tac-toe', desc: 'Game 3x3 cổ điển.', emoji: '❌' },
  { slug: 'snake', name: 'Rắn săn mồi', desc: 'Điều khiển rắn ăn mồi.', emoji: '🐍' },
  { slug: 'match3', name: 'Ghép hàng 3', desc: 'Ghép 3 biểu tượng cùng loại.', emoji: '💎' },
  { slug: 'memory', name: 'Cờ trí nhớ', desc: 'Lật thẻ và tìm cặp giống nhau.', emoji: '🧠' },
  { slug: 'draw', name: 'Bảng vẽ tự do', desc: 'Vẽ tự do trên bàn game.', emoji: '🎨' },
]

export default function GamesPage() {
  const { scores } = useGameStore()
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    gameService
      .getGames({ onlyEnabled: true, force: true })
      .then((response) => {
        if (!mounted) return
        setGames(response.data || [])
      })
      .catch(() => {
        if (!mounted) return
        setGames([])
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [])

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Danh sách trò chơi</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">Chọn một trò chơi để bắt đầu.</p>
      </div>

      {loading ? (
        <div className="card p-6 text-sm text-[var(--text-muted)]">Đang tải danh sách game...</div>
      ) : games.length === 0 ? (
        <div className="card p-6 text-sm text-[var(--text-muted)]">Hiện không có game nào đang được bật.</div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {(loading || games.length === 0 ? [] : games).map((g) => (
          <Link key={g.slug} to={`/play/${g.slug}`} className="card p-5 hover:scale-[1.02] transition-transform">
            <div className="text-3xl mb-3">{g.emoji}</div>
            <div className="font-bold">{g.name}</div>
            <div className="text-sm text-[var(--text-muted)] mt-1">{g.description || g.desc || 'Sẵn sàng để bắt đầu ván mới.'}</div>
            <div className="text-xs text-[var(--text-muted)] mt-3">
              {scores?.[g.slug] ? `${scores[g.slug].wins} thắng / ${scores[g.slug].losses} thua` : 'Chưa có dữ liệu'}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
