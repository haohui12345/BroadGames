import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import userService from '@/services/userService'
import { useAuthStore } from '@/store/authStore'
import Pagination from '@/components/common/Pagination'

export default function MessagesPage() {
  const { id } = useParams()
  const { user } = useAuthStore()

  const [friends, setFriends] = useState([])
  const [messages, setMessages] = useState([])
  const [selectedFriendId, setSelectedFriendId] = useState(id || '')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [pageFriends, setPageFriends] = useState(1)
  const [pageMessages, setPageMessages] = useState(1)
  const limit = 10

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)

        const friendsRes = await userService.getFriends()
        const friendsData = friendsRes.data || []
        setFriends(friendsData)

        const currentFriendId = id || friendsData[0]?.id || ''
        setSelectedFriendId(currentFriendId)

        if (currentFriendId) {
          const messagesRes = await userService.getMessages(currentFriendId)
          const messagesData = messagesRes.data || []
          setMessages(messagesData)
        }
      } catch (error) {
        console.error('Lỗi tải tin nhắn:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [id])

  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedFriendId) return

      try {
        const res = await userService.getMessages(selectedFriendId)
        setMessages(res.data || [])
      } catch (error) {
        console.error('Lỗi tải hội thoại:', error)
      }
    }

    loadMessages()
  }, [selectedFriendId])

  useEffect(() => {
    setPageMessages(1)
  }, [selectedFriendId])

  const selectedFriend = useMemo(
    () => friends.find((f) => f.id === selectedFriendId),
    [friends, selectedFriendId]
  )

  const friendsPageItems = friends.slice((pageFriends - 1) * limit, pageFriends * limit)
  const messagesPageItems = messages.slice((pageMessages - 1) * limit, pageMessages * limit)

  const handleSelectFriend = async (friendId) => {
    setSelectedFriendId(friendId)
  }

  const handleSend = async (e) => {
    e.preventDefault()

    const text = content.trim()
    if (!text || !selectedFriendId) return

    try {
      setSending(true)

      const res = await userService.sendMessage({
        receiver_id: selectedFriendId,
        content: text,
      })

      const newMessage = res.data
      if (newMessage) {
        setMessages((prev) => [...prev, newMessage])
      }

      setContent('')
    } catch (error) {
      console.error('Lỗi gửi tin nhắn:', error)
      alert(error.message || 'Không gửi được tin nhắn')
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
              friendsPageItems.map((friend) => (
                <button
                  key={friend.id}
                  onClick={() => handleSelectFriend(friend.id)}
                  className={`w-full text-left px-4 py-4 border-b border-[var(--border)] hover:bg-white/5 transition ${
                    selectedFriendId === friend.id ? 'bg-white/5' : ''
                  }`}
                >
                  <div className="font-semibold">{friend.display_name}</div>
                  <div className="text-sm text-[var(--text-muted)]">@{friend.username}</div>
                </button>
              ))
            )}
          </div>
          <div className="p-3 border-t border-[var(--border)]">
            <Pagination page={pageFriends} total={friends.length} limit={limit} onChange={setPageFriends} />
          </div>
        </div>

        <div className="col-span-8 card overflow-hidden flex flex-col">
          <div className="p-4 border-b border-[var(--border)]">
            <h2 className="text-2xl font-bold">
              {selectedFriend ? selectedFriend.display_name : 'Chọn cuộc trò chuyện'}
            </h2>
            {selectedFriend && (
              <p className="text-sm text-[var(--text-muted)] mt-1">@{selectedFriend.username}</p>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {!selectedFriend ? (
              <div className="text-[var(--text-muted)]">Hãy chọn một người bạn để bắt đầu nhắn tin.</div>
            ) : messages.length === 0 ? (
              <div className="text-[var(--text-muted)]">Chưa có tin nhắn nào.</div>
            ) : (
              messagesPageItems.map((msg) => {
                const myId = user?.id
                const isMine =
                  msg.sender_id === myId ||
                  msg.from_user_id === myId ||
                  msg.sender?.id === myId

                return (
                  <div
                    key={msg.id}
                    className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                  >
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

                      <div>{msg.content}</div>

                      <div
                        className={`text-[11px] mt-1 ${
                          isMine ? 'text-white/70' : 'text-[var(--text-muted)]'
                        }`}
                      >
                        {msg.created_at
                          ? new Date(msg.created_at).toLocaleString('vi-VN')
                          : ''}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
          {messages.length > limit && (
            <div className="p-3 border-t border-[var(--border)]">
              <Pagination page={pageMessages} total={messages.length} limit={limit} onChange={setPageMessages} />
            </div>
          )}

          <form
            onSubmit={handleSend}
            className="p-4 border-t border-[var(--border)] flex gap-3"
          >
            <input
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                selectedFriend ? 'Nhập tin nhắn...' : 'Chọn bạn bè trước khi nhắn'
              }
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