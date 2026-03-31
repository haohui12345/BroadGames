import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Spinner from '@/components/common/Spinner'
import gameService from '@/services/gameService'

export default function GameAvailabilityGuard({ slug, children }) {
  const [loading, setLoading] = useState(true)
  const [game, setGame] = useState(null)

  useEffect(() => {
    let mounted = true

    gameService
      .getGameBySlug(slug, { force: true })
      .then((response) => {
        if (mounted) setGame(response.data || null)
      })
      .catch(() => {
        if (mounted) setGame(null)
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [slug])

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <Spinner />
      </div>
    )
  }

  if (!game?.enabled) {
    return (
      <div className="p-6 max-w-xl mx-auto">
        <div className="card p-6 text-center space-y-3">
          <div className="text-4xl">🎮</div>
          <h1 className="text-2xl font-bold">Game đang tạm tắt</h1>
          <p className="text-sm text-[var(--text-muted)]">
            Trò chơi này hiện không khả dụng trên hệ thống. Bạn có thể quay lại danh sách game để chọn trò khác.
          </p>
          <div className="pt-2">
            <Link to="/games" className="btn-primary inline-flex">
              Về danh sách game
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return children
}
