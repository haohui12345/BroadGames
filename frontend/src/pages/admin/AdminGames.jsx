import { useState, useEffect } from 'react'
import { ToggleLeft, ToggleRight, Edit2, Save, X } from 'lucide-react'
import authService from '@/services/authService'
import Spinner from '@/components/common/Spinner'
import Modal from '@/components/common/Modal'
import toast from 'react-hot-toast'

export default function AdminGames() {
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [editGame, setEditGame] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    adminService.getGames()
      .then(r => setGames(r.data?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const toggle = async (slug) => {
    try { await adminService.toggleGame(slug); toast.success('Đã cập nhật!'); load() }
    catch { toast.error('Lỗi') }
  }

  const openEdit = (g) => { setEditGame(g); setEditForm({ board_rows: g.board_rows, board_cols: g.board_cols, timer: g.timer }) }

  const saveEdit = async () => {
    setSaving(true)
    try {
      await adminService.updateGame(editGame.slug, editForm)
      toast.success('Đã lưu cài đặt game!')
      setEditGame(null); load()
    } catch { toast.error('Lỗi') }
    finally { setSaving(false) }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto animate-fade-in">
      <h1 className="text-2xl font-bold mb-6">Quản lý Game</h1>

      {loading ? <Spinner /> : (
        <div className="grid grid-cols-2 gap-4">
          {games.map(g => (
            <div key={g.slug} className="card p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{g.emoji || '🎮'}</div>
                  <div>
                    <div className="font-semibold">{g.name}</div>
                    <div className="text-xs text-[var(--text-muted)]">{g.slug}</div>
                  </div>
                </div>
                <button onClick={() => toggle(g.slug)} className={`text-2xl transition-colors ${g.enabled ? 'text-emerald-500' : 'text-gray-300 dark:text-gray-600'}`}>
                  {g.enabled ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs mb-4">
                {[
                  { label:'Board', val: g.board_rows && g.board_cols ? `${g.board_rows}×${g.board_cols}` : '—' },
                  { label:'Timer', val: g.timer ? `${g.timer}s` : '—' },
                  { label:'Lượt chơi', val: g.play_count ?? 0 },
                ].map(({ label, val }) => (
                  <div key={label} className="bg-[var(--bg-secondary)] rounded-lg p-2 text-center">
                    <div className="font-bold">{val}</div>
                    <div className="text-[var(--text-muted)]">{label}</div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <span className={g.enabled ? 'badge-green' : 'badge-gray'}>{g.enabled ? 'Đang bật' : 'Đã tắt'}</span>
                <button onClick={() => openEdit(g)} className="btn-ghost text-xs px-2 py-1">
                  <Edit2 size={13} /> Cài đặt
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      <Modal open={!!editGame} onClose={() => setEditGame(null)} title={`Cài đặt: ${editGame?.name}`}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1.5">Số hàng bàn game</label>
              <input type="number" value={editForm.board_rows || ''} onChange={e => setEditForm(f => ({ ...f, board_rows: Number(e.target.value) }))}
                className="input" min={3} max={20} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Số cột bàn game</label>
              <input type="number" value={editForm.board_cols || ''} onChange={e => setEditForm(f => ({ ...f, board_cols: Number(e.target.value) }))}
                className="input" min={3} max={20} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Thời gian mỗi lượt (giây)</label>
            <input type="number" value={editForm.timer || ''} onChange={e => setEditForm(f => ({ ...f, timer: Number(e.target.value) }))}
              className="input" min={5} max={300} />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button onClick={() => setEditGame(null)} className="btn-secondary"><X size={14}/> Huỷ</button>
            <button onClick={saveEdit} disabled={saving} className="btn-primary">
              {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={14}/>}
              Lưu
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
