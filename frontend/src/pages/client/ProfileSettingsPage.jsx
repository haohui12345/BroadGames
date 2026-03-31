import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import authService from '@/services/authService'
import userService from '@/services/userService'
import { useAuthStore } from '@/store/authStore'

function mapForm(profile) {
  return {
    username: profile?.username || '',
    display_name: profile?.display_name || profile?.full_name || '',
    email: profile?.email || '',
    bio: profile?.bio || '',
  }
}

export default function ProfileSettingsPage() {
  const { user, updateUser } = useAuthStore()
  const [form, setForm] = useState(mapForm(user))
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let mounted = true

    userService.getMyProfile()
      .then((response) => {
        if (!mounted || !response.data) return
        const nextUser = response.data
        updateUser(nextUser)
        setForm(mapForm(nextUser))
      })
      .catch(() => {
        if (!mounted) return
        setForm(mapForm(user))
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)

    try {
      const response = await authService.updateProfile({
        username: form.username.trim(),
        display_name: form.display_name.trim(),
        bio: form.bio.trim(),
      })
      const nextUser = response.user || response.data || response
      updateUser({
        ...nextUser,
        display_name: nextUser.display_name || nextUser.full_name || nextUser.username,
      })
      toast.success('Cập nhật profile thành công')
    } catch (error) {
      toast.error(error.message || 'Không thể cập nhật profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="card p-6 text-sm text-[var(--text-muted)]">Đang tải thông tin tài khoản...</div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tài khoản</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">Quản lý tên hiển thị, username và thông tin giới thiệu.</p>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        <div>
          <label className="block text-sm mb-2">Username</label>
          <input
            name="username"
            value={form.username}
            onChange={handleChange}
            className="input"
          />
        </div>

        <div>
          <label className="block text-sm mb-2">Tên hiển thị</label>
          <input
            name="display_name"
            value={form.display_name}
            onChange={handleChange}
            className="input"
          />
        </div>

        <div>
          <label className="block text-sm mb-2">Email</label>
          <input
            name="email"
            value={form.email}
            readOnly
            className="input opacity-70 cursor-not-allowed"
          />
          <p className="text-xs text-[var(--text-muted)] mt-1">Email hiện tại chỉ để xem, backend chưa hỗ trợ đổi email.</p>
        </div>

        <div>
          <label className="block text-sm mb-2">Giới thiệu</label>
          <textarea
            name="bio"
            rows="4"
            value={form.bio}
            onChange={handleChange}
            className="input resize-none"
          />
        </div>

        <button className="btn-primary" type="submit" disabled={saving}>
          {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>
      </form>
    </div>
  )
}
