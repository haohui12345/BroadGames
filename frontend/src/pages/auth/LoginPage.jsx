import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import toast from 'react-hot-toast'
import authService from '@/services/authService'
import { useAuthStore } from '@/store/authStore'

export default function LoginPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)
  const [form, setForm] = useState({ email: '', password: '' })
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }))

  const validate = () => {
    if (!form.email.trim() || !form.password.trim())
      return 'Vui lòng nhập đầy đủ email và mật khẩu'
    if (form.password.length < 6)
      return 'Mật khẩu tối thiểu 6 ký tự'
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const err = validate()
    if (err) return toast.error(err)

    setLoading(true)
    try {
      // authService.login nhận username = email, tự gửi đúng lên BE
      const res = await authService.login({
        username: form.email.trim(),
        password: form.password,
      })
      setAuth(res.user, res.token)
      toast.success('Đăng nhập thành công!')
      navigate(res.user.role === 'admin' ? '/admin' : '/')
    } catch (err) {
      toast.error(err.message || 'Email hoặc mật khẩu không đúng')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card p-6 animate-fade-in">
      <h2 className="text-xl font-bold mb-1">Đăng nhập</h2>
      <p className="text-sm text-[var(--text-muted)] mb-6">Chào mừng bạn quay lại BoardZone</p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1.5">Email</label>
          <input
            type="email"
            name="email"
            placeholder="Nhập email"
            value={form.email}
            onChange={handleChange}
            className="input"
            autoComplete="email"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Mật khẩu</label>
          <div className="relative">
            <input
              type={show ? 'text' : 'password'}
              name="password"
              placeholder="Nhập mật khẩu"
              value={form.password}
              onChange={handleChange}
              className="input pr-10"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-2">
          {loading
            ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : <LogIn size={16} />}
          Đăng nhập
        </button>
      </form>

      {/* Tài khoản test từ seed BE */}
      <div className="mt-5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-3 text-sm">
        <p className="font-medium mb-1">Tài khoản test</p>
        <p className="text-[var(--text-muted)]">User: player1@test.com / password123</p>
        <p className="text-[var(--text-muted)]">Admin: admin@ltudweb.com / admin123</p>
      </div>

      <p className="text-center text-sm text-[var(--text-muted)] mt-5">
        Chưa có tài khoản?{' '}
        <Link to="/register" className="text-primary-500 hover:underline font-medium">
          Đăng ký
        </Link>
      </p>
    </div>
  )
}
