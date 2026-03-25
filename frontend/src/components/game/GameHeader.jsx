import { useState, useEffect, useRef } from 'react'
import { Save, FolderOpen, RotateCcw, Clock, BookOpen, Star } from 'lucide-react'
import { useGameStore } from '@/store/gameStore'
import toast from 'react-hot-toast'
import clsx from 'clsx'

export default function GameHeader({ gameSlug, gameName, score, onReset, onSave, onLoad, timerKey, paused }) {
  const { timerDuration, setTimerDuration, savedGames } = useGameStore()
  const [timeLeft, setTimeLeft] = useState(timerDuration)
  const [showTimerEdit, setShowTimerEdit] = useState(false)
  const intervalRef = useRef(null)

  // Reset timer whenever timerKey changes (new turn)
  useEffect(() => {
    setTimeLeft(timerDuration)
    clearInterval(intervalRef.current)
    if (paused) return
    intervalRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(intervalRef.current); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [timerKey, timerDuration, paused])

  const handleSave = () => {
    onSave?.()
    toast.success('Đã lưu game!')
  }
  const handleLoad = () => {
    if (!savedGames[gameSlug]) return toast.error('Chưa có game đã lưu')
    onLoad?.()
    toast.success('Đã tải game!')
  }

  const urgentTimer = timeLeft <= 10 && timeLeft > 0

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-[var(--bg-card)] border-b border-[var(--border)]">
      {/* Game name + score */}
      <div className="flex items-center gap-4">
        <div>
          <div className="text-sm font-bold">{gameName}</div>
          {score != null && (
            <div className="text-xs text-[var(--text-muted)] flex items-center gap-1">
              <Star size={11} className="text-yellow-500" /> {score} điểm
            </div>
          )}
        </div>
      </div>

      {/* Timer */}
      <div className="flex items-center gap-1.5">
        <Clock size={14} className={urgentTimer ? 'text-red-500' : 'text-[var(--text-muted)]'} />
        <span
          className={clsx('font-mono text-sm font-bold tabular-nums', urgentTimer ? 'text-red-500 animate-pulse' : 'text-[var(--text-primary)]')}
          onClick={() => setShowTimerEdit(v => !v)}
          title="Click để đổi thời gian"
          style={{ cursor: 'pointer' }}
        >
          {String(timeLeft).padStart(2, '0')}s
        </span>
        {showTimerEdit && (
          <select
            value={timerDuration}
            onChange={e => { setTimerDuration(Number(e.target.value)); setShowTimerEdit(false) }}
            className="input text-xs py-0.5 w-20"
          >
            {[15, 30, 60, 120, 300].map(v => <option key={v} value={v}>{v}s</option>)}
          </select>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <button onClick={handleSave} className="btn-icon" title="Lưu game">
          <Save size={16} />
        </button>
        <button onClick={handleLoad} className="btn-icon" title="Tải game">
          <FolderOpen size={16} />
        </button>
        <button onClick={onReset} className="btn-icon" title="Chơi lại">
          <RotateCcw size={16} />
        </button>
      </div>
    </div>
  )
}
