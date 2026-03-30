import { useEffect, useState } from 'react'
import userService from '@/services/userService'
import api from '@/utils/api'

export default function AchievementsPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchAchievements = () => {
    setLoading(true)
    userService.getAchievements()
      .then(r => setItems((r.data || []).map(a => ({ ...a, is_unlocked: Boolean(a.is_unlocked) }))))
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    // Check thành tựu mới rồi load lại
    api.post('/achievements/check').catch(() => {}).finally(fetchAchievements)
  }, [])

  const unlocked = items.filter(a => a.is_unlocked)

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Thành tựu</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            {unlocked.length}/{items.length} thành tựu đã mở khóa
          </p>
        </div>
        <button
          onClick={fetchAchievements}
          className="btn-secondary text-sm"
          disabled={loading}
        >
          {loading ? 'Đang tải...' : '🔄 Làm mới'}
        </button>
      </div>

      {loading ? (
        <div className="text-[var(--text-muted)]">Đang tải...</div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4">
            {items.map(a => (
              <div
                key={a.id}
                className={`relative card p-5 transition-all duration-300 ${
                  a.is_unlocked
                    ? 'border-2 border-yellow-400 shadow-[0_0_16px_2px_rgba(234,179,8,0.35)]'
                    : 'opacity-50 grayscale'
                }`}
              >
                {a.is_unlocked && (
                  <span className="absolute top-2 right-2 bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                    ✓
                  </span>
                )}
                <div className="text-3xl mb-3">{a.is_unlocked ? (a.icon_url || '🏆') : '🔒'}</div>
                <div className="font-bold">{a.name}</div>
                <div className="text-sm text-[var(--text-muted)] mt-1">{a.description}</div>
                {a.game_name && (
                  <div className="text-xs text-primary-500 mt-2">🎮 {a.game_name}</div>
                )}
                {a.is_unlocked && a.unlocked_at && (
                  <div className="text-xs text-[var(--text-muted)] mt-1">
                    {new Date(a.unlocked_at).toLocaleDateString('vi-VN')}
                  </div>
                )}
              </div>
            ))}
          </div>

          {!items.length && (
            <div className="card p-6 text-[var(--text-muted)]">Chưa có thành tựu nào.</div>
          )}
        </>
      )}
    </div>
  )
}
