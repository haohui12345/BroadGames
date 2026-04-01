// Admin users screen: search, paginate, ban, and unban accounts.
import { useState, useEffect } from 'react'
import { Search, Ban, Shield, UserCheck } from 'lucide-react'
import adminService from '@/services/adminService'
import Avatar from '@/components/common/Avatar'
import Pagination from '@/components/common/Pagination'
import Spinner from '@/components/common/Spinner'
import Modal from '@/components/common/Modal'
import Empty from '@/components/common/Empty'
import toast from 'react-hot-toast'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [confirmModal, setConfirmModal] = useState(null) // { user }
  const [toggling, setToggling] = useState(null)

  // Fetch one page of users and keep the total count for pagination.
  const load = (p = 1, q = search) => {
    setLoading(true)
    adminService.getUsers({ page: p, q })
      .then(r => {
        setUsers(r.data || [])
        setTotal(r.total || 0)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  // Search resets to page 1 so results always start from the first page.
  const handleSearch = () => { setPage(1); load(1, search) }

  // Toggle ban/unban and update the row immediately for a responsive UI.
  const handleToggle = async (u) => {
    setToggling(u.id)
    try {
      await adminService.toggleUserActive(u.id)
      toast.success(u.is_banned ? `Đã mở khoá ${u.display_name}` : `Đã khoá ${u.display_name}`)
      // Cập nhật local ngay
      setUsers(prev => prev.map(x =>
        x.id === u.id ? { ...x, is_banned: !x.is_banned, status: x.is_banned ? 'active' : 'banned' } : x
      ))
    } catch {
      toast.error('Không thể thay đổi trạng thái')
    } finally {
      setToggling(null)
      setConfirmModal(null)
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Quản lý người dùng</h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">{total} tài khoản</p>
        </div>
      </div>

      {/* Search bar */}
      <div className="flex gap-2 mb-5">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          className="input flex-1 max-w-sm"
          placeholder="Tìm theo username, email..."
        />
        <button onClick={handleSearch} className="btn-primary px-4">
          <Search size={16} />
        </button>
      </div>

      {/* User table */}
      <div className="card overflow-hidden">
        {loading ? <div className="p-8"><Spinner /></div> : users.length === 0 ? (
          <Empty icon="👥" title="Không có người dùng" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-[var(--text-muted)] text-xs">
                  <th className="text-left px-5 py-3 font-medium">Người dùng</th>
                  <th className="text-left px-4 py-3 font-medium">Email</th>
                  <th className="text-center px-4 py-3 font-medium">Vai trò</th>
                  <th className="text-center px-4 py-3 font-medium">Trạng thái</th>
                  <th className="text-right px-5 py-3 font-medium">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-[var(--bg-secondary)] transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar user={u} size="sm" />
                        <div>
                          <div className="font-medium">{u.display_name}</div>
                          <div className="text-xs text-[var(--text-muted)]">@{u.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[var(--text-muted)] text-xs">{u.email}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        u.role === 'admin'
                          ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                          : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                      }`}>
                        {u.role === 'admin' ? '🛡 Admin' : 'User'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        u.is_banned
                          ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                          : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                      }`}>
                        {u.is_banned ? '🔒 Bị khoá' : '✓ Hoạt động'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => setConfirmModal({ user: u })}
                          disabled={toggling === u.id}
                          className={`btn-icon ${u.is_banned ? 'text-emerald-500 hover:text-emerald-600' : 'text-yellow-500 hover:text-yellow-600'}`}
                          title={u.is_banned ? 'Mở khoá' : 'Khoá tài khoản'}
                        >
                          {toggling === u.id
                            ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin block" />
                            : u.is_banned ? <UserCheck size={15} /> : <Ban size={15} />
                          }
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="px-5 pb-3">
          <Pagination page={page} total={total} onChange={(p) => { setPage(p); load(p) }} />
        </div>
      </div>

      {/* Confirmation dialog */}
      <Modal
        open={!!confirmModal}
        onClose={() => setConfirmModal(null)}
        title={confirmModal?.user?.is_banned ? 'Mở khoá tài khoản' : 'Khoá tài khoản'}
      >
        <div className="space-y-4">
          <p className="text-sm">
            {confirmModal?.user?.is_banned
              ? <>Mở khoá tài khoản <strong>{confirmModal?.user?.display_name}</strong>? Người dùng có thể đăng nhập lại.</>
              : <>Khoá tài khoản <strong>{confirmModal?.user?.display_name}</strong>? Người dùng sẽ không thể đăng nhập.</>
            }
          </p>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setConfirmModal(null)} className="btn-secondary">Huỷ</button>
            <button
              onClick={() => handleToggle(confirmModal.user)}
              disabled={toggling === confirmModal?.user?.id}
              className={confirmModal?.user?.is_banned ? 'btn-primary' : 'btn-danger'}
            >
              {confirmModal?.user?.is_banned ? 'Mở khoá' : 'Khoá'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
