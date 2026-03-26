import { useState, useEffect, useRef } from 'react'
import { Users, Plus, RefreshCw, LogIn, Clock } from 'lucide-react'
import gameService from '@/services/gameService'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

/**
 * MultiplayerLobby - Danh sách phòng chờ và tạo phòng mới (vs người)
 * Props:
 *   gameSlug: string
 *   boardSize: number
 *   onJoin: (session) => void
 *   onBack: () => void
 */
export default function MultiplayerLobby({ gameSlug, boardSize, onJoin, onBack }) {
  const user = useAuthStore(s => s.user)
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const intervalRef = useRef(null)

  const fetchRooms = async () => {
    try {
      const res = await gameService.getWaitingRooms(gameSlug)
      setRooms(res.data || [])
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRooms()
    // Tự động refresh phòng chờ mỗi 5 giây
    intervalRef.current = setInterval(fetchRooms, 5000)
    return () => clearInterval(intervalRef.current)
  }, [gameSlug])

  const createRoom = async () => {
    setCreating(true)
    try {
      const res = await gameService.createRoom({ game_slug: gameSlug, board_size: boardSize })
      if (res.data) {
        toast.success('Đã tạo phòng! Đang chờ người chơi...')
        onJoin({ ...res.data, isHost: true })
      }
    } catch {
      toast.error('Không thể tạo phòng')
    } finally {
      setCreating(false)
    }
  }

  const joinRoom = async (room) => {
    try {
      const res = await gameService.joinRoom(room.id)
      if (res.data) {
        toast.success(`Đã vào phòng của ${room.host_username}!`)
        onJoin({ ...res.data, isHost: false })
      }
    } catch (err) {
      toast.error(err?.message || 'Không thể vào phòng')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="card w-full max-w-md p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users size={20} className="text-primary-500" />
            <h2 className="text-lg font-bold">Chơi vs Người</h2>
          </div>
          <button onClick={fetchRooms} className="btn-icon" title="Làm mới">
            <RefreshCw size={16} />
          </button>
        </div>

        {/* Tạo phòng mới */}
        <button
          onClick={createRoom}
          disabled={creating}
          className="btn-primary w-full justify-center mb-4 flex items-center gap-2"
        >
          {creating
            ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : <Plus size={16} />}
          Tạo phòng mới
        </button>

        {/* Danh sách phòng chờ */}
        <div className="mb-4">
          <p className="text-xs text-[var(--text-muted)] mb-2 font-medium">PHÒNG ĐANG CHỜ ({rooms.length})</p>
          {loading ? (
            <div className="py-8 text-center text-sm text-[var(--text-muted)]">Đang tải...</div>
          ) : rooms.length === 0 ? (
            <div className="py-8 text-center text-sm text-[var(--text-muted)]">
              Chưa có phòng nào. Hãy tạo phòng đầu tiên!
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {rooms.map(room => (
                <div
                  key={room.id}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]"
                >
                  <div>
                    <div className="font-medium text-sm">{room.host_username}</div>
                    <div className="text-xs text-[var(--text-muted)] flex items-center gap-1 mt-0.5">
                      <Clock size={10} />
                      Board {room.board_size}×{room.board_size}
                    </div>
                  </div>
                  {room.host_id === user?.id ? (
                    <span className="text-xs text-[var(--text-muted)] px-2">Phòng của bạn</span>
                  ) : (
                    <button
                      onClick={() => joinRoom(room)}
                      className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1"
                    >
                      <LogIn size={12} /> Vào
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <button onClick={onBack} className="btn-secondary w-full justify-center">
          Quay lại
        </button>
      </div>
    </div>
  )
}