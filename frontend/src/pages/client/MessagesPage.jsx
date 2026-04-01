// Direct messages screen with friend sidebar and polling-based chat refresh.
import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Send } from 'lucide-react'
import userService from '@/services/userService'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

export default function MessagesPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const [friends, setFriends] = useState([])
  const [messages, setMessages] = useState([])
  const [selectedId, setSelectedId] = useState(id || null)
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)
  const pollRef = useRef(null)

  // Load danh sách bạn bè
  useEffect(() => {
    userService.getFriends()
      .then(r => {
        const list = r.data || []
        setFriends(list)
        if (!selectedId && list.length > 0) setSelectedId(list[0].id)
      })
      .finally(() => setLoading(false))
  }, [])

  // Load tin nhắn khi chọn bạn + polling mỗi 3s
  useEffect(() => {
    if (!selectedId) return

    const fetchMessages = async () => {
      try {
        const res = await userService.getMessages(selectedId)
        setMessages(res.data || [])
      } catch {}
    }

    fetchMessages()
    clearInterval(pollRef.current)
    pollRef.current = setInterval(fetchMessages, 3000)
    return () => clearInterval(pollRef.current)
  }, [selectedId])

  // Auto-scroll xuống cuối
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSelectFriend = (friendId) => {
    setSelectedId(friendId)
    setMessages([])
    navigate(`/messages/${friendId}`, { replace: true })
  }

  const handleSend = async (e) => {
    e.preventDefault()
    const text = content.trim()
    if (!text || !selectedId) return
    setSending(true)
    try {
      const res = await userService.sendMessage({ receiver_id: selectedId, content: text })
      if (res.data) setMessages(prev => [...prev, res.data])
      setContent('')
    } catch (err) {
      toast.error(err?.message || 'Không gửi được tin nhắn')
    } finally {
      setSending(false)
    }
  }

  const selectedFriend = friends.find(f => f.id === selectedId)

  return (
    <div className="p-4 h-[calc(100vh-4rem)] flex gap-4">
      {/* Sidebar bạn bè */}
      <div className="w-72 card flex flex-col overflow-hidden flex-shrink-0">
        <div className="p-4 border-b border-[var(--border)] font-bold text-lg">Tin nhắn</div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-sm text-[var(--text-muted)]">Đang tải...</div>
          ) : friends.length === 0 ? (
            <div className="p-4 text-sm text-[var(--text-muted)]">Chưa có bạn bè để nhắn tin.</div>
          ) : (
            friends.map(f => (
              <button
                key={f.id}
                onClick={() => handleSelectFriend(f.id)}
                className={`w-full text-left px-4 py-3 border-b border-[var(--border)] hover:bg-[var(--bg-secondary)] transition ${selectedId === f.id ? 'bg-[var(--bg-secondary)]' : ''}`}
              >
                <div className="font-medium">{f.display_name || f.username}</div>
                <div className="text-xs text-[var(--text-muted)]">@{f.username}</div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Khung chat */}
      <div className="flex-1 card flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-[var(--border)]">
          {selectedFriend ? (
            <>
              <div className="font-bold">{selectedFriend.display_name || selectedFriend.username}</div>
              <div className="text-xs text-[var(--text-muted)]">@{selectedFriend.username}</div>
            </>
          ) : (
            <div className="text-[var(--text-muted)]">Chọn cuộc trò chuyện</div>
          )}
        </div>

        {/* Tin nhắn */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {!selectedFriend ? (
            <div className="text-sm text-[var(--text-muted)]">Hãy chọn một người bạn để bắt đầu nhắn tin.</div>
          ) : messages.length === 0 ? (
            <div className="text-sm text-[var(--text-muted)]">Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!</div>
          ) : (
            messages.map((msg, i) => {
              const isMine = msg.sender_id === user?.id
              return (
                <div key={msg.id || i} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm ${
                    isMine
                      ? 'bg-primary-500 text-white rounded-br-md'
                      : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-bl-md'
                  }`}>
                    <div>{msg.content}</div>
                    <div className={`text-[11px] mt-1 ${isMine ? 'text-white/60' : 'text-[var(--text-muted)]'}`}>
                      {msg.created_at ? new Date(msg.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : ''}
                    </div>
                  </div>
                </div>
              )
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input gửi tin */}
        <form onSubmit={handleSend} className="p-4 border-t border-[var(--border)] flex gap-3">
          <input
            type="text"
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder={selectedFriend ? 'Nhập tin nhắn...' : 'Chọn bạn bè trước'}
            disabled={!selectedFriend || sending}
            className="input flex-1"
          />
          <button
            type="submit"
            disabled={!selectedFriend || !content.trim() || sending}
            className="btn-primary flex items-center gap-2"
          >
            <Send size={16} />
            {sending ? 'Đang gửi...' : 'Gửi'}
          </button>
        </form>
      </div>
    </div>
  )
}
