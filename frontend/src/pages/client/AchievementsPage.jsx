import { useEffect, useState } from 'react'
import userService from '@/services/userService'

export default function AchievementsPage() {
  const [items, setItems] = useState([])

  useEffect(() => {
    userService.getAchievements?.()
      .then((r) => setItems(r.data || []))
      .catch(() => setItems([]))
  }, [])

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Thành tựu</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">Theo dõi huy hiệu và tiến độ của bạn.</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {items.map((a, i) => (
          <div key={a.id || i} className="card p-5">
            <div className="text-3xl mb-3">{a.icon || '🏆'}</div>
            <div className="font-bold">{a.title}</div>
            <div className="text-sm text-[var(--text-muted)] mt-1">{a.description}</div>
          </div>
        ))}
        {!items.length && <div className="card p-6 text-[var(--text-muted)]">Chưa có thành tựu.</div>}
      </div>
    </div>
  )
}