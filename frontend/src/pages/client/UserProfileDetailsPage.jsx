import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import userService from '@/services/userService'
import { useAuthStore } from '@/store/authStore'

export default function UserProfileDetailsPage() {
  const { id } = useParams()
  const { user } = useAuthStore()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const isMe = useMemo(() => String(user?.id) === String(id), [user, id])

  useEffect(() => {
    let mounted = true

    if (isMe) {
      setProfile(user)
      setLoading(false)
      return undefined
    }

    userService.getProfile(id)
      .then((response) => {
        if (mounted) setProfile(response.data)
      })
      .catch(() => {
        if (mounted) setProfile(null)
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [id, isMe, user])

  if (loading) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="card p-6 text-sm text-[var(--text-muted)]">Dang tai ho so nguoi dung...</div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="card p-6 text-sm text-[var(--text-muted)]">Khong tim thay nguoi dung.</div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="card p-6">
        <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-2xl font-bold mb-4">
          {profile.display_name?.[0]?.toUpperCase() || '?'}
        </div>
        <h1 className="text-2xl font-bold">{profile.display_name}</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">@{profile.username}</p>
        <p className="mt-4 text-sm">{profile.bio || 'Chua co mo ta.'}</p>
      </div>
    </div>
  )
}
