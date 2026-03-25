import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, UserPlus } from 'lucide-react'
import toast from 'react-hot-toast'
import authService from '@/services/authService'
import { useAuthStore } from '@/store/authStore'

export default function RegisterPage() {
  const [form, setForm] = useState({
    username: '',
    display_name: '',
    email: '',
    password: '',
    confirm: '',
  })
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const setAuth = useAuthStore((state) => state.setAuth)
  const navigate = useNavigate()

  const handle = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  const validate = () => {
    if (!form.username || !form.display_name || !form.email || !form.password || !form.confirm) {
      return 'Vui lòng nhập đầy đủ thông tin'
    }
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(form.username)) {
      return 'Username chỉ gồm chữ, số, gạch dưới (3-20 ký tự)'
    }
    if (!/\S+@\S+\.\S+/.test(form.email)) {
      return 'Email không hợp lệ'
    }
    if (form.password.length < 6) {
      return 'Mật khẩu tối thiểu 6 ký tự'
    }
    if (form.password !== form.confirm) {
      return 'Mật khẩu xác nhận không khớp'
    }
    return null
  }

  const submit = async (e) => {
    e.preventDefault()

    const err = validate()
    if (err) return toast.error(err)

    setLoading(true)
    try {
      const res = await authService.register({
        username: form.username.trim(),
        display_name: form.display_name.trim(),
        email: form.email.trim(),
        password: form.password,
      })

      setAuth(res.user, res.token)
      toast.success('Đăng ký thành công!')
      navigate('/')
    } catch (err) {
      toast.error(err.message || 'Đăng ký thất bại')
    } finally {
      setLoading(false)
    }
  }

  const fields = [
    { name: 'username', label: 'Tên đăng nhập', placeholder: 'vd: player123', type: 'text' },
    { name: 'display_name', label: 'Tên hiển thị', placeholder: 'vd: Game Pro', type: 'text' },
    { name: 'email', label: 'Email', placeholder: 'you@email.com', type: 'email' },
  ]

  return (
    <div className="card p-6 animate-fade-in">
      <h2 className="text-xl font-bold mb-1">Tạo tài khoản</h2>
      <p className="text-sm text-[var(--text-muted)] mb-6">Tham gia sàn đấu ngay hôm nay</p>

      <form onSubmit={submit} className="space-y-3">
        {fields.map((f) => (
          <div key={f.name}>
            <label className="block text-sm font-medium mb-1.5">{f.label}</label>
            <input
              name={f.name}
              type={f.type}
              value={form[f.name]}
              onChange={handle}
              className="input"
              placeholder={f.placeholder}
            />
          </div>
        ))}

        <div>
          <label className="block text-sm font-medium mb-1.5">Mật khẩu</label>
          <div className="relative">
            <input
              name="password"
              type={show ? 'text' : 'password'}
              value={form.password}
              onChange={handle}
              className="input pr-10"
              placeholder="Tối thiểu 6 ký tự"
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

        <div>
          <label className="block text-sm font-medium mb-1.5">Xác nhận mật khẩu</label>
          <input
            name="confirm"
            type="password"
            value={form.confirm}
            onChange={handle}
            className="input"
            placeholder="Nhập lại mật khẩu"
          />
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-2">
          {loading ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <UserPlus size={16} />
          )}
          Đăng ký
        </button>
      </form>

      <p className="text-center text-sm text-[var(--text-muted)] mt-5">
        Đã có tài khoản?{' '}
        <Link to="/login" className="text-primary-500 hover:underline font-medium">
          Đăng nhập
        </Link>
      </p>
    </div>
  )
}