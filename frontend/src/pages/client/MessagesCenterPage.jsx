// Message center wrapper: keeps the inbox shell aligned with the routed chat view.
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import userService from '@/services/userService'
import { useAuthStore } from '@/store/authStore'

function sortMessages(messages) {
  return [...messages].sort((left, right) => {
    const leftTime = new Date(left.created_at || 0).getTime()
    const rightTime = new Date(right.created_at || 0).getTime()
    return leftTime - rightTime
  })
}

export default function MessagesCenterPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [friends, setFriends] = useState([])
  const [messages, setMessages] = useState([])
  const [selectedFriendId, setSelectedFriendId] = useState(id || '')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    let mounted = true

    userService.getFriends()
      .then((response) => {
        if (!mounted) return
        const nextFriends = response.data || []
        setFriends(nextFriends)

        const fallbackFriendId = String(id || nextFriends[0]?.id || '')
        setSelectedFriendId(fallbackFriendId)
      })
      .catch(() => {
        if (mounted) {
          setFriends([])
          setSelectedFriendId('')
        }
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [id])

  useEffect(() => {
    if (!selectedFriendId) {
      setMessages([])
      return
    }

    let mounted = true

    userService.getMessages(selectedFriendId)
      .then((response) => {
        if (mounted) setMessages(sortMessages(response.data || []))
      })
      .catch(() => {
        if (mounted) setMessages([])
      })

    return () => {
      mounted = false
    }
  }, [selectedFriendId])

  const selectedFriend = useMemo(
    () => friends.find((friend) => String(friend.id) === String(selectedFriendId)),
    [friends, selectedFriendId]
  )

  const handleSelectFriend = (friendId) => {
    const nextId = String(friendId)
    setSelectedFriendId(nextId)
    navigate(`/messages/${nextId}`)
  }

  const handleSend = async (event) => {
    event.preventDefault()

    const text = content.trim()
    if (!text || !selectedFriendId) return

    try {
      setSending(true)
      const response = await userService.sendMessage({
        receiver_id: selectedFriendId,
        content: text,
      })
      const newMessage = response.data
      if (newMessage) {
        setMessages((current) => sortMessages([...current, newMessage]))
      }
      setContent('')
    } catch (error) {
      toast.error(error.message || 'Không gửi được tin nhắn')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="p-6 h-full">
      <div className="grid grid-cols-12 gap-4 h-[calc(100vh-3rem)]">
        <div className="col-span-4 card overflow-hidden flex flex-col">
          <div className="p-4 border-b border-[var(--border)]">
            <h1 className="text-2xl font-bold">Tin nhắn</h1>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-[var(--text-muted)]">Đang tải...</div>
            ) : friends.length === 0 ? (
              <div className="p-4 text-[var(--text-muted)]">Chưa có bạn bè để nhắn tin</div>
            ) : (
              friends.map((friend) => (
                <button
                  key={friend.id}
                  onClick={() => handleSelectFriend(friend.id)}
                  className={`w-full text-left px-4 py-4 border-b border-[var(--border)] hover:bg-white/5 transition ${
                    String(selectedFriendId) === String(friend.id) ? 'bg-white/5' : ''
                  }`}
                >
                  <div className="font-semibold">{friend.display_name}</div>
                  <div className="text-sm text-[var(--text-muted)]">@{friend.username}</div>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="col-span-8 card overflow-hidden flex flex-col">
          <div className="p-4 border-b border-[var(--border)]">
            <h2 className="text-2xl font-bold">
              {selectedFriend ? selectedFriend.display_name : 'Chọn cuộc trò chuyện'}
            </h2>
            {selectedFriend ? (
              <p className="text-sm text-[var(--text-muted)] mt-1">@{selectedFriend.username}</p>
            ) : null}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {!selectedFriend ? (
              <div className="text-[var(--text-muted)]">Hãy chọn một người bạn để bắt đầu nhắn tin.</div>
            ) : messages.length === 0 ? (
              <div className="text-[var(--text-muted)]">Chưa có tin nhắn nào.</div>
            ) : (
              messages.map((message) => {
                const myId = user?.id
                const isMine =
                  String(message.sender_id) === String(myId) ||
                  String(message.from_user_id) === String(myId) ||
                  String(message.sender?.id) === String(myId)

                return (
                  <div key={message.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                        isMine
                          ? 'bg-primary-500 text-white rounded-br-md'
                          : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-bl-md'
                      }`}
                    >
                      <div className="text-sm font-medium mb-1">
                        {isMine ? 'Bạn' : selectedFriend?.display_name || 'Người dùng'}
                      </div>
                      <div>{message.content}</div>
                      <div className={`text-[11px] mt-1 ${isMine ? 'text-white/70' : 'text-[var(--text-muted)]'}`}>
                        {message.created_at ? new Date(message.created_at).toLocaleString('vi-VN') : ''}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          <form onSubmit={handleSend} className="p-4 border-t border-[var(--border)] flex gap-3">
            <input
              type="text"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder={selectedFriend ? 'Nhập tin nhắn...' : 'Chọn bạn bè trước khi nhắn'}
              disabled={!selectedFriend || sending}
              className="input flex-1"
            />
            <button
              type="submit"
              disabled={!selectedFriend || !content.trim() || sending}
              className="btn-primary"
            >
              {sending ? 'Đang gửi...' : 'Gửi'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
