import { useState, useEffect, useRef } from 'react'
import { Save, FolderOpen, RotateCcw, Clock, BookOpen, Star } from 'lucide-react'
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
  const { timerDuration, setTimerDuration, savedGames } = useGameStore()
  const [timeLeft, setTimeLeft] = useState(timerDuration)
  const [showTimerEdit, setShowTimerEdit] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const intervalRef = useRef(null)
  const timeoutHandledRef = useRef(false)

  useEffect(() => {
    if (!showTimer) return
    setTimeLeft(timerDuration)
    timeoutHandledRef.current = false
    clearInterval(intervalRef.current)
  }, [showTimer, timerKey, timerDuration])

  useEffect(() => {
    clearInterval(intervalRef.current)
    if (!showTimer || paused || timeLeft <= 0) return

    intervalRef.current = setInterval(() => {
      setTimeLeft((currentTime) => {
        if (currentTime <= 1) {
          clearInterval(intervalRef.current)
          return 0
        }
        return currentTime - 1
      })
    }, 1000)

    return () => clearInterval(intervalRef.current)
  }, [showTimer, paused, timeLeft])

  useEffect(() => {
    if (!showTimer || timeLeft > 0 || timeoutHandledRef.current) return
    timeoutHandledRef.current = true
    onTimeout?.()
  }, [showTimer, timeLeft, onTimeout])

  const handleSave = () => {
    onSave?.()
    toast.success('Da luu game!')
  }

  const handleLoad = () => {
    if (!savedGames[gameSlug]) return toast.error('Chua co game da luu')
    onLoad?.()
    toast.success('Da tai game!')
  }

  const urgentTimer = timeLeft <= 10 && timeLeft > 0

  return (
    <>
      <div className="flex items-center justify-between px-4 py-3 bg-[var(--bg-card)] border-b border-[var(--border)]">
        <div className="flex items-center gap-4">
          <div>
            <div className="text-sm font-bold">{gameName}</div>
            {score != null ? (
              <div className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                <Star size={11} className="text-yellow-500" /> {score} diem
              </div>
            ) : null}
          </div>
        </div>

        {showTimer ? (
          <div className="flex items-center gap-1.5">
            <Clock size={14} className={urgentTimer ? 'text-red-500' : 'text-[var(--text-muted)]'} />
            <span
              className={clsx(
                'font-mono text-sm font-bold tabular-nums',
                urgentTimer ? 'text-red-500 animate-pulse' : 'text-[var(--text-primary)]'
              )}
              onClick={() => setShowTimerEdit((value) => !value)}
              title="Click de doi thoi gian"
              style={{ cursor: 'pointer' }}
            >
              {String(timeLeft).padStart(2, '0')}s
            </span>
            {showTimerEdit ? (
              <select
                value={timerDuration}
                onChange={(event) => {
                  setTimerDuration(Number(event.target.value))
                  setShowTimerEdit(false)
                }}
                className="input text-xs py-0.5 w-20"
              >
                {[15, 30, 60, 120, 300].map((value) => (
                  <option key={value} value={value}>{value}s</option>
                ))}
              </select>
            ) : null}
          </div>
        ) : (
          <div className="text-xs text-[var(--text-muted)]">Free mode</div>
        )}

        <div className="flex items-center gap-1">
          {help?.items?.length ? (
            <button onClick={() => setShowHelp(true)} className="btn-icon" title="Huong dan">
              <BookOpen size={16} />
            </button>
          ) : null}
          {onSave ? (
            <button onClick={handleSave} className="btn-icon" title="Luu game">
              <Save size={16} />
            </button>
          ) : null}
          {onLoad ? (
            <button onClick={handleLoad} className="btn-icon" title="Tai game">
              <FolderOpen size={16} />
            </button>
          ) : null}
          <button onClick={onReset} className="btn-icon" title="Choi lai">
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      <GameHelpModal open={showHelp} onClose={() => setShowHelp(false)} help={help} />
    </>
  )
}
