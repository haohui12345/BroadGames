import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

export default function UserProfilePage() {
  const { id } = useParams()
  const { user } = useAuthStore()

  const profile = useMemo(() => {
    if (String(user?.id) === String(id)) return user
    return {
      id,
      display_name: `Người chơi ${id}`,
      username: `user${id}`,
      bio: 'Hồ sơ người dùng đang ở chế độ mock.',
    }
  }, [id, user])

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="card p-6">
        <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-2xl font-bold mb-4">
          {profile?.display_name?.[0]?.toUpperCase() || '?'}
        </div>
        <h1 className="text-2xl font-bold">{profile?.display_name}</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">@{profile?.username}</p>
        <p className="mt-4 text-sm">{profile?.bio || 'Chưa có mô tả.'}</p>
      </div>
    </div>
  )
}