import { useEffect, useState } from 'react'
import userService from '@/services/userService'
import Pagination from '@/components/common/Pagination'

export default function FriendsPage() {
  const [friends, setFriends] = useState([])
  const [requests, setRequests] = useState([])
  const [keyword, setKeyword] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [pageFriends, setPageFriends] = useState(1)
  const [pageRequests, setPageRequests] = useState(1)
  const [pageResults, setPageResults] = useState(1)
  const limit = 10

  const load = async () => {
    setLoading(true)
    try {
      const [f, r] = await Promise.all([
        userService.getFriends(),
        userService.getFriendRequests?.(),
      ])
      setFriends(f.data || [])
      setRequests(r?.data || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleSearch = async () => {
    const res = await userService.search(keyword)
    setResults(res.data || [])
    setPageResults(1)
  }

  const addFriend = async (id) => {
    await userService.sendFriendRequest(id)
    await load()
    await handleSearch()
  }

  const acceptRequest = async (id) => {
    await userService.acceptFriendRequest(id)
    await load()
  }

  const removeFriend = async (id) => {
    await userService.removeFriend(id)
    await load()
  }

  const friendsPageItems = friends.slice((pageFriends - 1) * limit, pageFriends * limit)
  const requestsPageItems = requests.slice((pageRequests - 1) * limit, pageRequests * limit)
  const resultsPageItems = results.slice((pageResults - 1) * limit, pageResults * limit)

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Bạn bè</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">Tìm kiếm, kết bạn và quản lý danh sách bạn bè.</p>
      </div>

      <div className="card p-4 flex gap-3">
        <input value={keyword} onChange={(e) => setKeyword(e.target.value)} className="input flex-1" placeholder="Tìm theo tên, username, email..." />
        <button onClick={handleSearch} className="btn-primary">Tìm kiếm</button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="card p-5">
          <h2 className="text-lg font-semibold mb-4">Danh sách bạn bè</h2>
          {loading ? <div>Đang tải...</div> : friends.length === 0 ? <div className="text-[var(--text-muted)]">Chưa có bạn bè.</div> : (
            <div className="space-y-3">
              {friendsPageItems.map((f) => (
                <div key={f.id} className="flex items-center justify-between border border-[var(--border)] rounded-xl px-4 py-3">
                  <div>
                    <div className="font-medium">{f.display_name}</div>
                    <div className="text-sm text-[var(--text-muted)]">@{f.username}</div>
                  </div>
                  <button onClick={() => removeFriend(f.id)} className="btn-ghost">Xóa</button>
                </div>
              ))}
              <Pagination page={pageFriends} total={friends.length} limit={limit} onChange={setPageFriends} />
            </div>
          )}
        </div>

        <div className="card p-5">
          <h2 className="text-lg font-semibold mb-4">Lời mời kết bạn</h2>
          {requests.length === 0 ? <div className="text-[var(--text-muted)]">Không có lời mời chờ xử lý.</div> : (
            <div className="space-y-3">
              {requestsPageItems.map((r) => (
                <div key={r.id} className="flex items-center justify-between border border-[var(--border)] rounded-xl px-4 py-3">
                  <div>
                    <div className="font-medium">{r.from_name || r.from_user_name || r.from_username || r.from_user_id}</div>
                    <div className="text-sm text-[var(--text-muted)]">{r.status}</div>
                  </div>
                  <button onClick={() => acceptRequest(r.from_user_id || r.id)} className="btn-primary">Chấp nhận</button>
                </div>
              ))}
              <Pagination page={pageRequests} total={requests.length} limit={limit} onChange={setPageRequests} />
            </div>
          )}
        </div>
      </div>

      <div className="card p-5">
        <h2 className="text-lg font-semibold mb-4">Kết quả tìm kiếm</h2>
        {results.length === 0 ? <div className="text-[var(--text-muted)]">Chưa có kết quả.</div> : (
          <div className="grid grid-cols-2 gap-3">
            {resultsPageItems.map((u) => (
              <div key={u.id} className="border border-[var(--border)] rounded-xl p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium">{u.display_name}</div>
                  <div className="text-sm text-[var(--text-muted)]">@{u.username}</div>
                </div>
                <button disabled={u.is_friend} onClick={() => addFriend(u.id)} className="btn-primary disabled:opacity-50">
                  {u.is_friend ? 'Đã là bạn' : 'Kết bạn'}
                </button>
              </div>
            ))}
            <div className="col-span-2">
              <Pagination page={pageResults} total={results.length} limit={limit} onChange={setPageResults} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
