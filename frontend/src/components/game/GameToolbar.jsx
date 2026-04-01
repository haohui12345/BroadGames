// Alternate toolbar used by games that need a richer timer editor.
import { useState, useEffect, useRef } from 'react'
import { Save, FolderOpen, RotateCcw, Clock, BookOpen, Star, Settings2 } from 'lucide-react'
import { useGameStore } from '@/store/gameStore'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import GameHelpModal from '@/components/game/GameHelpModal'

export default function GameToolbar({
  gameName,
  score,
  onReset,
  onSave,
  onLoad,
  timerKey,
  paused,
  onTimeout,
  showTimer = true,
  help,
}) {
  const { timerDuration, setTimerDuration } = useGameStore()
  const normalizedTimerDuration = Math.max(5, Number(timerDuration) || 30)
  const [timeLeft, setTimeLeft] = useState(normalizedTimerDuration)
  const [showTimerEdit, setShowTimerEdit] = useState(false)
  const [customInput, setCustomInput] = useState('')
  const [showHelp, setShowHelp] = useState(false)
  const intervalRef = useRef(null)
  const timeoutFiredRef = useRef(false)
  const deadlineRef = useRef(null)
  const timeLeftRef = useRef(normalizedTimerDuration)

  useEffect(() => {
    clearInterval(intervalRef.current)
    if (!showTimer) return
    setTimeLeft(normalizedTimerDuration)
    timeLeftRef.current = normalizedTimerDuration
    deadlineRef.current = Date.now() + normalizedTimerDuration * 1000
    timeoutFiredRef.current = false
  }, [timerKey, normalizedTimerDuration, showTimer])

  useEffect(() => {
    timeLeftRef.current = timeLeft
  }, [timeLeft])

  useEffect(() => {
    clearInterval(intervalRef.current)
    if (!showTimer || timeLeftRef.current <= 0) return
    if (paused) {
      deadlineRef.current = null
      return
    }

    if (!deadlineRef.current) {
      deadlineRef.current = Date.now() + timeLeftRef.current * 1000
    }

    intervalRef.current = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((deadlineRef.current - Date.now()) / 1000))
      timeLeftRef.current = remaining
      setTimeLeft((prev) => (prev === remaining ? prev : remaining))
      if (remaining <= 0) {
        clearInterval(intervalRef.current)
      }
    }, 250)

    return () => clearInterval(intervalRef.current)
  }, [paused, showTimer, timerKey, normalizedTimerDuration])

  useEffect(() => {
    if (!showTimer || timeLeft > 0 || timeoutFiredRef.current) return
    timeoutFiredRef.current = true
    onTimeout?.()
  }, [showTimer, timeLeft, onTimeout])

  const handleSave = async () => {
    try {
      const ok = await onSave?.()
      if (ok === false) return
      toast.success('Đã lưu game!')
    } catch {
      toast.error('Không thể lưu game')
    }
  }

  const handleLoad = async () => {
    try {
      const loaded = await onLoad?.()
      if (loaded === false) {
        toast.error('Chưa có game đã lưu')
        return
      }
      toast.success('Đã tải game!')
    } catch {
      toast.error('Không thể tải game')
    }
  }

  const applyTimer = (value) => {
    const seconds = Number(value)
    if (seconds >= 5 && seconds <= 3600) {
      setTimerDuration(seconds)
      setShowTimerEdit(false)
      setCustomInput('')
    }
  }

  const urgentTimer = timeLeft <= 10 && timeLeft > 0
  const mm = String(Math.floor(timeLeft / 60)).padStart(2, '0')
  const ss = String(timeLeft % 60).padStart(2, '0')

  return (
    <>
      <div className="flex items-center justify-between px-4 py-3 bg-[var(--bg-card)] border-b border-[var(--border)]">
        <div className="flex items-center gap-4">
          <div>
            <div className="text-sm font-bold">{gameName}</div>
            {score != null ? (
              <div className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                <Star size={11} className="text-yellow-500" /> {score} điểm
              </div>
            ) : null}
          </div>
        </div>

        {showTimer ? (
          <div className="flex items-center gap-1.5 relative">
            <Clock size={14} className={urgentTimer ? 'text-red-500' : 'text-[var(--text-muted)]'} />
            <span
              className={clsx(
                'font-mono text-sm font-bold tabular-nums',
                urgentTimer ? 'text-red-500 animate-pulse' : 'text-[var(--text-primary)]'
              )}
            >
              {mm}:{ss}
            </span>
            <button onClick={() => setShowTimerEdit((value) => !value)} className="btn-icon" title="Chỉnh thời gian">
              <Settings2 size={13} />
            </button>

            {showTimerEdit ? (
              <div className="absolute top-8 left-1/2 -translate-x-1/2 z-50 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl shadow-lg p-3 flex flex-col gap-2 min-w-[160px]">
                <p className="text-xs font-medium text-[var(--text-muted)] mb-1">Chọn thời gian</p>
                <div className="grid grid-cols-3 gap-1">
                  {[30, 60, 120, 180, 300, 600].map((value) => (
                    <button
                      key={value}
                      onClick={() => applyTimer(value)}
                      className={clsx(
                        'text-xs px-2 py-1.5 rounded-lg border transition-colors',
                        normalizedTimerDuration === value
                          ? 'bg-primary-500 text-white border-primary-600'
                          : 'border-[var(--border)] hover:bg-[var(--bg-secondary)]'
                      )}
                    >
                      {value >= 60 ? `${value / 60}p` : `${value}s`}
                    </button>
                  ))}
                </div>
                <div className="flex gap-1 mt-1">
                  <input
                    type="number"
                    min={5}
                    max={3600}
                    placeholder="Tự nhập (s)"
                    value={customInput}
                    onChange={(event) => setCustomInput(event.target.value)}
                    className="input text-xs py-1 flex-1"
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') applyTimer(customInput)
                    }}
                  />
                  <button onClick={() => applyTimer(customInput)} className="btn-primary text-xs px-2 py-1">
                    OK
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="text-xs text-[var(--text-muted)]">Chế độ tự do</div>
        )}

        <div className="flex items-center gap-1">
          {help?.items?.length ? (
            <button onClick={() => setShowHelp(true)} className="btn-icon" title="Hướng dẫn">
              <BookOpen size={16} />
            </button>
          ) : null}
          {onSave ? (
            <button onClick={handleSave} className="btn-icon" title="Lưu game">
              <Save size={16} />
            </button>
          ) : null}
          {onLoad ? (
            <button onClick={handleLoad} className="btn-icon" title="Tải game">
              <FolderOpen size={16} />
            </button>
          ) : null}
          <button onClick={onReset} className="btn-icon" title="Chơi lại">
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      <GameHelpModal open={showHelp} onClose={() => setShowHelp(false)} help={help} />
    </>
  )
}
