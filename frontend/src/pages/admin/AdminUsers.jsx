import { useState, useEffect } from 'react'
import { Search, Ban, Trash2, Shield } from 'lucide-react'
import authService from '@/services/authService'
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
  const [confirmModal, setConfirmModal] = useState(null) // { type, user }

  const load = (p = 1, q = search) => {
    setLoading(true)
    adminService.getUsers({ page: p, search: q, limit: 10 })
      .then(r => { setUsers(r.data?.data || []); setTotal(r.data?.total || 0) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleSearch = () => { setPage(1); load(1, search) }

  const ban = async (u) => {
    try { await adminService.banUser(u.id); toast.success(`Đã ${u.is_banned ? 'bỏ cấm' : 'cấm'} ${u.display_name}`); load(page) }
    catch { toast.error('Lỗi') }
    setConfirmModal(null)
  }

  const del = async (u) => {
    try { await adminService.deleteUser(u.id); toast.success('Đã xoá người dùng'); load(page) }
    catch { toast.error('Lỗi') }
    setConfirmModal(null)
  }

  const ROLE_BADGE = { admin: 'badge-red', user: 'badge-blue' }

  return (
    <div className="p-6 max-w-5xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Quản lý người dùng</h1>
        <span className="badge-gray">{total} người dùng</span>
      </div>

      {/* Search */}
      <div className="flex gap-2 mb-5">
        <input value={search} onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          className="input flex-1 max-w-sm" placeholder="Tìm theo tên, username, email..." />
        <button onClick={handleSearch} className="btn-primary px-4"><Search size={16} /></button>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? <Spinner /> : users.length === 0 ? (
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
                    <td className="px-4 py-3 text-[var(--text-muted)]">{u.email}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={ROLE_BADGE[u.role] || 'badge-gray'}>{u.role}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={u.is_banned ? 'badge-red' : 'badge-green'}>{u.is_banned ? 'Bị cấm' : 'Hoạt động'}</span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setConfirmModal({ type: 'ban', user: u })}
                          className="btn-icon text-yellow-500 hover:text-yellow-600" title={u.is_banned ? 'Bỏ cấm' : 'Cấm'}>
                          <Ban size={15} />
                        </button>
                        <button onClick={() => setConfirmModal({ type: 'delete', user: u })}
                          className="btn-icon text-red-400 hover:text-red-500" title="Xoá">
                          <Trash2 size={15} />
                        </button>
                      </div>
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

      {/* Confirm modal */}
      <Modal open={!!confirmModal} onClose={() => setConfirmModal(null)}
        title={confirmModal?.type === 'ban' ? (confirmModal?.user?.is_banned ? 'Bỏ cấm người dùng' : 'Cấm người dùng') : 'Xoá người dùng'}>
        <p className="text-sm mb-5">
          {confirmModal?.type === 'ban'
            ? `Bạn có chắc muốn ${confirmModal?.user?.is_banned ? 'bỏ cấm' : 'cấm'} tài khoản `
            : 'Bạn có chắc muốn xoá tài khoản '}
          <strong>{confirmModal?.user?.display_name}</strong>?
          {confirmModal?.type === 'delete' && ' Thao tác này không thể hoàn tác.'}
        </p>
        <div className="flex gap-2 justify-end">
          <button onClick={() => setConfirmModal(null)} className="btn-secondary">Huỷ</button>
          <button onClick={() => confirmModal?.type === 'ban' ? ban(confirmModal.user) : del(confirmModal.user)}
            className={confirmModal?.type === 'delete' ? 'btn-danger' : 'btn-primary'}>
            Xác nhận
          </button>
        </div>
      </Modal>
    </div>
  )
}
