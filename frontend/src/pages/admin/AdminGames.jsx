// Admin games screen: toggle availability and edit game settings.
import { useState, useEffect } from 'react'
import { ToggleLeft, ToggleRight, Edit2, Save, X, AlertTriangle, Power, PowerOff } from 'lucide-react'
import adminService from '@/services/adminService'
import Spinner from '@/components/common/Spinner'
import Modal from '@/components/common/Modal'
import toast from 'react-hot-toast'
import clsx from 'clsx'

export default function AdminGames() {
  const [games, setGames]           = useState([])
  const [loading, setLoading]       = useState(true)
  const [toggling, setToggling]     = useState(null)
  const [editGame, setEditGame]     = useState(null)
  const [editForm, setEditForm]     = useState({})
  const [saving, setSaving]         = useState(false)
  const [confirmGame, setConfirmGame] = useState(null)
  const [bulkLoading, setBulkLoading] = useState(false)

  // Load all games so the admin can toggle and edit them in one place.
  const load = () => {
    setLoading(true)
    adminService.getGames()
      .then(r => setGames(r.data || []))
      .catch(() => toast.error('Không tải được danh sách game'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  // Ask for confirmation before disabling an enabled game.
  const handleToggleClick = (game) => {
    if (game.enabled) setConfirmGame(game)
    else doToggle(game)
  }

  // Toggle a single game and patch the local list immediately.
  const doToggle = async (game) => {
    setToggling(game.id)
    try {
      await adminService.toggleGame(game.id)
      toast.success(game.enabled ? `Đã tắt "${game.name}"` : `Đã bật "${game.name}"`)
      setGames(prev => prev.map(g =>
        g.id === game.id ? { ...g, enabled: !g.enabled } : g
      ))
    } catch {
      toast.error('Không thể thay đổi trạng thái game')
    } finally {
      setToggling(null)
      setConfirmGame(null)
    }
  }

  // Bật/tắt tất cả game
  const handleBulkToggle = async (enableAll) => {
    const targets = games.filter(g => g.enabled !== enableAll)
    if (targets.length === 0) return
    setBulkLoading(true)
    try {
      await Promise.all(targets.map(g => adminService.toggleGame(g.id)))
      setGames(prev => prev.map(g => ({ ...g, enabled: enableAll })))
      toast.success(enableAll ? 'Đã bật tất cả game' : 'Đã tắt tất cả game')
    } catch {
      toast.error('Có lỗi xảy ra, vui lòng thử lại')
      load()
    } finally {
      setBulkLoading(false)
    }
  }

  // Open the edit modal with the current board size and status.
  const openEdit = (g) => {
    setEditGame(g)
    setEditForm({ board_size: g.board_size, enabled: g.enabled })
  }

  // Save the edited game settings back to the backend.
  const saveEdit = async () => {
    setSaving(true)
    try {
      await adminService.updateGame(editGame.id, editForm)
      toast.success('Đã lưu cài đặt!')
      setGames(prev => prev.map(g =>
        g.id === editGame.id
          ? { ...g, board_size: editForm.board_size, enabled: editForm.enabled }
          : g
      ))
      setEditGame(null)
    } catch {
      toast.error('Lỗi khi lưu')
    } finally {
      setSaving(false)
    }
  }

  const enabledCount  = games.filter(g => g.enabled).length
  const disabledCount = games.length - enabledCount

  return (
    <div className="p-6 max-w-4xl mx-auto animate-fade-in">

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Quản lý game</h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            {enabledCount}/{games.length} game đang bật
          </p>
        </div>

        {/* Bulk actions */}
        {!loading && games.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkToggle(false)}
              disabled={bulkLoading || enabledCount === 0}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border border-[var(--border)] hover:bg-red-50 hover:border-red-200 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:border-red-800 dark:hover:text-red-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <PowerOff size={14} />
              Tắt tất cả
            </button>
            <button
              onClick={() => handleBulkToggle(true)}
              disabled={bulkLoading || disabledCount === 0}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border border-[var(--border)] hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-600 dark:hover:bg-emerald-900/20 dark:hover:border-emerald-800 dark:hover:text-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <Power size={14} />
              Bật tất cả
            </button>
            <button onClick={load} disabled={loading} className="btn-secondary text-sm">
              Làm mới
            </button>
          </div>
        )}
      </div>

      {/* Summary badges */}
      {!loading && games.length > 0 && (
        <div className="flex items-center gap-3 mb-5">
          <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {enabledCount} đang bật
          </span>
          {disabledCount > 0 && (
            <span className="flex items-center gap-1.5 text-sm font-medium text-gray-500 bg-gray-100 dark:bg-gray-800 dark:text-gray-400 px-3 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-gray-400" />
              {disabledCount} đã tắt
            </span>
          )}
        </div>
      )}

      {/* Game list */}
      {loading ? (
        <Spinner />
      ) : games.length === 0 ? (
        <div className="text-center py-16 text-[var(--text-muted)]">Chưa có game nào.</div>
      ) : (
        <div className="card divide-y divide-[var(--border)] overflow-hidden">
          {games.map(g => (
            <div
              key={g.id}
              className={clsx(
                'flex items-center gap-4 px-5 py-4 transition-all',
                'hover:bg-[var(--bg-secondary)]',
                !g.enabled && 'opacity-60'
              )}
            >
              {/* Emoji */}
              <div className={clsx('text-2xl w-10 text-center shrink-0 transition-all', !g.enabled && 'grayscale')}>
                {g.emoji || '🎮'}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{g.name}</span>
                  <span className={clsx(
                    'text-xs px-2 py-0.5 rounded-full font-medium',
                    g.enabled
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                  )}>
                    {g.enabled ? '● Bật' : '○ Tắt'}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-0.5 text-xs text-[var(--text-muted)]">
                  <span>{g.slug}</span>
                  {g.board_size && <span>· {g.board_size}×{g.board_size}</span>}
                  {g.total_plays > 0 && <span>· {g.total_plays} lượt chơi</span>}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Edit */}
                <button
                  onClick={() => openEdit(g)}
                  className="btn-icon text-xs"
                  title="Cài đặt"
                >
                  <Edit2 size={15} />
                </button>

                {/* Toggle switch */}
                <button
                  onClick={() => handleToggleClick(g)}
                  disabled={toggling === g.id || bulkLoading}
                  title={g.enabled ? 'Nhấn để tắt game' : 'Nhấn để bật game'}
                  className="disabled:opacity-50 transition-all"
                >
                  {toggling === g.id ? (
                    <span className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin block" />
                  ) : g.enabled ? (
                    <ToggleRight size={32} className="text-emerald-500 hover:text-emerald-400 transition-colors" />
                  ) : (
                    <ToggleLeft size={32} className="text-gray-300 dark:text-gray-600 hover:text-gray-400 transition-colors" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal xác nhận TẮT game */}
      <Modal open={!!confirmGame} onClose={() => setConfirmGame(null)} title="Xác nhận tắt game">
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
            <AlertTriangle size={20} className="text-amber-500 mt-0.5 shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-amber-700 dark:text-amber-400">
                Tắt game "{confirmGame?.name}"?
              </p>
              <p className="text-amber-600 dark:text-amber-500 mt-1">
                Game sẽ bị ẩn khỏi danh sách và người chơi không thể truy cập.
              </p>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setConfirmGame(null)} className="btn-secondary">
              <X size={14} /> Huỷ
            </button>
            <button
              onClick={() => doToggle(confirmGame)}
              disabled={toggling === confirmGame?.id}
              className="btn-primary bg-amber-500 hover:bg-amber-600 flex items-center gap-1.5"
            >
              {toggling === confirmGame?.id
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <ToggleLeft size={14} />}
              Xác nhận tắt
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal cài đặt game */}
      <Modal open={!!editGame} onClose={() => setEditGame(null)} title={`Cài đặt: ${editGame?.name}`}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Kích thước bàn game</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={editForm.board_size || ''}
                onChange={e => setEditForm(f => ({ ...f, board_size: Number(e.target.value) }))}
                className="input w-24"
                min={3} max={20}
              />
              <span className="text-sm text-[var(--text-muted)]">
                → Bàn cờ {editForm.board_size}×{editForm.board_size} ô
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Trạng thái</label>
            <button
              onClick={() => setEditForm(f => ({ ...f, enabled: !f.enabled }))}
              className={clsx(
                'flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all w-full',
                editForm.enabled
                  ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                  : 'border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-muted)]'
              )}
            >
              {editForm.enabled
                ? <ToggleRight size={22} />
                : <ToggleLeft size={22} />}
              <span className="text-sm font-medium">
                {editForm.enabled ? 'Game đang bật — nhấn để tắt' : 'Game đang tắt — nhấn để bật'}
              </span>
            </button>
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <button onClick={() => setEditGame(null)} className="btn-secondary flex items-center gap-1">
              <X size={14} /> Huỷ
            </button>
            <button onClick={saveEdit} disabled={saving} className="btn-primary flex items-center gap-1">
              {saving
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <Save size={14} />}
              Lưu
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
