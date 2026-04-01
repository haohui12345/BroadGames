// Local profile form that updates the in-memory auth store.
import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore()
  const [form, setForm] = useState({
    display_name: user?.display_name || '',
    email: user?.email || '',
    bio: user?.bio || '',
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    updateUser(form)
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tài khoản</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">Quản lý thông tin cá nhân.</p>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        <div>
          <label className="block text-sm mb-2">Tên hiển thị</label>
          <input
            value={form.display_name}
            onChange={(e) => setForm((s) => ({ ...s, display_name: e.target.value }))}
            className="w-full px-4 py-2 rounded-xl border border-[var(--border)] bg-transparent outline-none"
          />
        </div>

        <div>
          <label className="block text-sm mb-2">Email</label>
          <input
            value={form.email}
            onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
            className="w-full px-4 py-2 rounded-xl border border-[var(--border)] bg-transparent outline-none"
          />
        </div>

        <div>
          <label className="block text-sm mb-2">Giới thiệu</label>
          <textarea
            rows="4"
            value={form.bio}
            onChange={(e) => setForm((s) => ({ ...s, bio: e.target.value }))}
            className="w-full px-4 py-2 rounded-xl border border-[var(--border)] bg-transparent outline-none"
          />
        </div>

        <button className="btn-primary" type="submit">Lưu thay đổi</button>
      </form>
    </div>
  )
}
