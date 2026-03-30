import { useEffect, useState } from 'react'
import { UserPlus, UserCheck, UserX, Search, Users } from 'lucide-react'
import userService from '@/services/userService'
import toast from 'react-hot-toast'

export default function FriendsPage() {
  const [friends, setFriends] = useState([])
  const [requests, setRequests] = useState([])
  const [keyword, setKeyword] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [sentIds, setSentIds] = useState(new Set()) // id đã gửi lời mời

  const load = async () => {
    setLoading(true)
    try {
      const [f, r] = await Promise.all([
        userService.getFriends(),
        userService.getFriendRequests(),
      ])
      setFriends(f.data || [])
      setRequests(r.data || [])
    } catch {
      toast.error('Không thể tải dữ liệu')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleSearch = async () => {
    if (!keyword.trim()) return
    try {
      const res = await userService.search(keyword)
      setResults(res.data || [])
    } catch {
      toast.error('Tìm kiếm thất bại')
    }
  }

  const addFriend = async (id) => {
    try {
      await userService.sendFriendRequest(id)
      setSentIds(prev => new Set([...prev, id]))
      toast.success('Đã gửi lời mời kết bạn!')
    } catch (err) {
      toast.error(err?.message || 'Không thể gửi lời mời')
    }
  }

  const acceptRequest = async (requesterId) => {
    try {
      await userService.acceptFriendRequest(requesterId)
      toast.success('Đã chấp nhận lời mời!')
      await load()
    } catch {
      toast.error('Không thể chấp nhận lời mời')
    }
  }

  const declineRequest = async (requesterId) => {
    try {
      await userService.declineFriendRequest(requesterId)
      toast.success('Đã từ chối lời mời')
      await load()
    } catch {
      toast.error('Không thể từ chối lời mời')
    }
  }

  const removeFriend = async (id) => {
    try {
      await userService.removeFriend(id)
      toast.success('Đã hủy kết bạn')
      await load()
    } catch {
      toast.error('Không thể hủy kết bạn')
    }
  }

  const friendIds = new Set(friends.map(f => f.id))
  const requestIds = new Set(requests.map(r => r.from_user_id))

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Bạn bè</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">Tìm kiếm, kết bạn và quản lý danh sách bạn bè.</p>
      </div>

      {/* Tìm kiếm */}
      <div className="card p-4 flex gap-3">
        <input
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          className="input flex-1"
          placeholder="Tìm theo username hoặc tên..."
        />
        <button onClick={handleSearch} className="btn-primary flex items-center gap-2">
          <Search size={16} /> Tìm kiếm
        </button>
      </div>

      {/* Kết quả tìm kiếm */}
      {results.length > 0 && (
        <div className="card p-5">
          <h2 className="text-lg font-semibold mb-4">Kết quả tìm kiếm</h2>
          <div className="grid grid-cols-2 gap-3">
            {results.map(u => {
              const isFriend = friendIds.has(u.id)
              const isPending = requestIds.has(u.id) || sentIds.has(u.id)
              return (
                <div key={u.id} className="border border-[var(--border)] rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{u.full_name || u.username}</div>
                    <div className="text-sm text-[var(--text-muted)]">@{u.username}</div>
                  </div>
                  {isFriend ? (
                    <span className="text-xs text-green-500 flex items-center gap-1"><UserCheck size={14}/> Bạn bè</span>
                  ) : isPending ? (
                    <span className="text-xs text-[var(--text-muted)] flex items-center gap-1"><UserPlus size={14}/> Đã gửi</span>
                  ) : (
                    <button onClick={() => addFriend(u.id)} className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1">
                      <UserPlus size={14}/> Kết bạn
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">
        {/* Danh sách bạn bè */}
        <div className="card p-5">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users size={18}/> Bạn bè ({friends.length})
          </h2>
          {loading ? (
            <div className="text-[var(--text-muted)] text-sm">Đang tải...</div>
          ) : friends.length === 0 ? (
            <div className="text-[var(--text-muted)] text-sm">Chưa có bạn bè.</div>
          ) : (
            <div className="space-y-3">
              {friends.map(f => (
                <div key={f.id} className="flex items-center justify-between border border-[var(--border)] rounded-xl px-4 py-3">
                  <div>
                    <div className="font-medium">{f.display_name || f.full_name || f.username}</div>
                    <div className="text-sm text-[var(--text-muted)]">@{f.username}</div>
                  </div>
                  <button onClick={() => removeFriend(f.id)} className="btn-ghost text-red-500 text-xs flex items-center gap-1">
                    <UserX size={14}/> Hủy
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Lời mời kết bạn */}
        <div className="card p-5">
          <h2 className="text-lg font-semibold mb-4">Lời mời kết bạn ({requests.length})</h2>
          {requests.length === 0 ? (
            <div className="text-[var(--text-muted)] text-sm">Không có lời mời chờ xử lý.</div>
          ) : (
            <div className="space-y-3">
              {requests.map(r => (
                <div key={r.id} className="flex items-center justify-between border border-[var(--border)] rounded-xl px-4 py-3">
                  <div>
                    <div className="font-medium">{r.from_name || r.from_username}</div>
                    <div className="text-sm text-[var(--text-muted)]">@{r.from_username}</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => acceptRequest(r.from_user_id)} className="btn-primary text-xs px-3 py-1.5">
                      Chấp nhận
                    </button>
                    <button onClick={() => declineRequest(r.from_user_id)} className="btn-ghost text-xs px-3 py-1.5 text-red-500">
                      Từ chối
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
