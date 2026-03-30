import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useGameStore } from '@/store/gameStore'
import gameService from '@/services/gameService'

export default function GamesPage() {
  const { scores } = useGameStore()
  const [games, setGames] = useState([])
  const [selectedGame, setSelectedGame] = useState(null)
  const [comments, setComments] = useState([])
  const [loadingComments, setLoadingComments] = useState(false)

  useEffect(() => {
    gameService
      .getGames()
      .then((res) => {
        const list = res.data || []
        setGames(list)
        setSelectedGame(list[0] || null)
      })
      .catch(() => {
        setGames([])
        setSelectedGame(null)
      })
  }, [])

  useEffect(() => {
    if (!selectedGame?.id) {
      setComments([])
      return
    }
    setLoadingComments(true)
    gameService
      .getCommentsByGame(selectedGame.id)
      .then((res) => setComments(res.data || []))
      .catch(() => setComments([]))
      .finally(() => setLoadingComments(false))
  }, [selectedGame?.id])

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Danh sách trò chơi</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">Chọn một trò chơi để bắt đầu (chỉ hiển thị game đang bật).</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {games.map((g) => (
          <div
            key={g.slug}
            className="card p-5 hover:scale-[1.02] transition-transform cursor-pointer"
            onClick={() => setSelectedGame(g)}
          >
            <Link to={`/play/${g.slug}`} className="block">
              <div className="text-3xl mb-3">{g.emoji || '🎮'}</div>
              <div className="font-bold">{g.name}</div>
              <div className="text-sm text-[var(--text-muted)] mt-1">{g.description || 'Chưa có mô tả'}</div>
            </Link>
            <div className="text-xs text-[var(--text-muted)] mt-3">
              {scores?.[g.slug] ? `${scores[g.slug].wins} thắng / ${scores[g.slug].losses} thua` : 'Chưa có dữ liệu'}
            </div>
          </div>
        ))}
        {!games.length && (
          <div className="card p-6 text-[var(--text-muted)] col-span-3 text-center">
            Chưa có game khả dụng.
          </div>
        )}
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Đánh giá gần đây</h2>
          {selectedGame && <span className="text-sm text-[var(--text-muted)]">{selectedGame.name}</span>}
        </div>
        {loadingComments ? (
          <div className="text-sm text-[var(--text-muted)]">Đang tải đánh giá...</div>
        ) : !comments.length ? (
          <div className="text-sm text-[var(--text-muted)]">Chưa có đánh giá cho game này.</div>
        ) : (
          <div className="space-y-3">
            {comments.slice(0, 6).map((c, idx) => (
              <div key={c.id || idx} className="border border-[var(--border)] rounded-xl p-3">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-sm">{c.full_name || c.username || 'Người chơi'}</div>
                  <div className="text-yellow-500 text-sm">{'★'.repeat(c.rating || 0)}</div>
                </div>
                <div className="text-sm text-[var(--text-muted)] mt-1">{c.comment || 'Không có nhận xét.'}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}