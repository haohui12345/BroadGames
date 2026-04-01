// Session header for multiplayer-ready games with timer controls and help.
import { useState, useEffect, useRef } from 'react'
import { Save, FolderOpen, RotateCcw, Clock, BookOpen, Star, Settings2 } from 'lucide-react'
import { useGameStore } from '@/store/gameStore'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import GameHelpModal from '@/components/game/GameHelpModal'

export default function GameSessionHeader({
  gameSlug,
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
  const [timeLeft, setTimeLeft] = useState(timerDuration)
  const [showTimerEdit, setShowTimerEdit] = useState(false)
  const [customInput, setCustomInput] = useState('')
  const [showHelp, setShowHelp] = useState(false)
  const intervalRef = useRef(null)
  const timeoutFiredRef = useRef(false)

  // Reset timer khi timerKey hoặc timerDuration thay đổi
  useEffect(() => {
    if (!showTimer) return
    clearInterval(intervalRef.current)
    setTimeLeft(timerDuration)
    timeoutFiredRef.current = false
  }, [timerKey, timerDuration, showTimer])

  // Chạy / dừng timer
  useEffect(() => {
    if (!showTimer) return
    clearInterval(intervalRef.current)
    if (paused) return

    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current)
          if (!timeoutFiredRef.current) {
            timeoutFiredRef.current = true
            // Dùng setTimeout để tránh gọi setState trong render cycle
            setTimeout(() => onTimeout?.(), 0)
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(intervalRef.current)
  }, [paused, showTimer, timerKey, timerDuration])

  const handleSave = () => { onSave?.(); toast.success('Đã lưu game!') }
  const handleLoad = () => {
    if (!savedGames[gameSlug]) return toast.error('Chưa có game đã lưu')
    onLoad?.(); toast.success('Đã tải game!')
  }

  const applyTimer = (val) => {
    const n = Number(val)
    if (n >= 5 && n <= 3600) { setTimerDuration(n); setShowTimerEdit(false); setCustomInput('') }
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
            <span className={clsx(
              'font-mono text-sm font-bold tabular-nums',
              urgentTimer ? 'text-red-500 animate-pulse' : 'text-[var(--text-primary)]'
            )}>
              {mm}:{ss}
            </span>
            <button
              onClick={() => setShowTimerEdit(v => !v)}
              className="btn-icon"
              title="Chỉnh thời gian"
            >
              <Settings2 size={13} />
            </button>

            {showTimerEdit && (
              <div className="absolute top-8 left-1/2 -translate-x-1/2 z-50 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl shadow-lg p-3 flex flex-col gap-2 min-w-[160px]">
                <p className="text-xs font-medium text-[var(--text-muted)] mb-1">Chọn thời gian</p>
                <div className="grid grid-cols-3 gap-1">
                  {[30, 60, 120, 180, 300, 600].map(v => (
                    <button
                      key={v}
                      onClick={() => applyTimer(v)}
                      className={clsx(
                        'text-xs px-2 py-1.5 rounded-lg border transition-colors',
                        timerDuration === v
                          ? 'bg-primary-500 text-white border-primary-600'
                          : 'border-[var(--border)] hover:bg-[var(--bg-secondary)]'
                      )}
                    >
                      {v >= 60 ? `${v / 60}p` : `${v}s`}
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
                    onChange={e => setCustomInput(e.target.value)}
                    className="input text-xs py-1 flex-1"
                    onKeyDown={e => { if (e.key === 'Enter') applyTimer(customInput) }}
                  />
                  <button onClick={() => applyTimer(customInput)} className="btn-primary text-xs px-2 py-1">
                    OK
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-xs text-[var(--text-muted)]">Free mode</div>
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
