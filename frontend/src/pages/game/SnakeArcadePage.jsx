// Enhanced snake page with timer, save/load, and end-of-game result overlay.
import { useEffect, useMemo, useRef, useState } from 'react'
import GameToolbar from '@/components/game/GameToolbar'
import GameResult from '@/components/game/GameResult'
import { useGameStore } from '@/store/gameStore'
import { getGameHelp } from '@/data/gameHelp'
import { ensureSoloSession, loadGameSnapshot, recordSoloGameResult, saveGameSnapshot } from '@/utils/gamePersistence'

const BOARD_SIZE = 15
const INITIAL_SNAKE = [
  { x: 7, y: 7 },
  { x: 6, y: 7 },
]
const INITIAL_DIRECTION = { x: 1, y: 0 }

function getRandomFood(snake) {
  while (true) {
    const food = {
      x: Math.floor(Math.random() * BOARD_SIZE),
      y: Math.floor(Math.random() * BOARD_SIZE),
    }

    const isOnSnake = snake.some((part) => part.x === food.x && part.y === food.y)
    if (!isOnSnake) return food
  }
}

export default function SnakeArcadePage() {
  const { recordResult } = useGameStore()
  const help = getGameHelp('snake')

  const [snake, setSnake] = useState(INITIAL_SNAKE)
  const [food, setFood] = useState(() => getRandomFood(INITIAL_SNAKE))
  const [direction, setDirection] = useState(INITIAL_DIRECTION)
  const [running, setRunning] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [timerKey, setTimerKey] = useState(0)
  const [gameResult, setGameResult] = useState(null)
  const [soloSessionId, setSoloSessionId] = useState(null)

  const directionRef = useRef(INITIAL_DIRECTION)
  const scoreRef = useRef(0)
  const resultHandledRef = useRef(false)

  // Create the backend session lazily so save/load and results have an id.
  const ensureCurrentSoloSession = async () =>
    ensureSoloSession({
      sessionId: soloSessionId,
      setSessionId: setSoloSessionId,
      gameSlug: 'snake',
      boardSize: BOARD_SIZE,
    })

  // Keep refs synced with the React state for the interval callback.
  useEffect(() => {
    directionRef.current = direction
  }, [direction])

  // Track the score in a ref because the tick callback reads it outside render.
  useEffect(() => {
    scoreRef.current = score
  }, [score])

  // Keyboard control: arrows/WASD steer the snake, Enter toggles running.
  useEffect(() => {
    const handleKeyDown = (event) => {
      const key = event.key.toLowerCase()

      if (key === 'enter') {
        if (!gameResult) setRunning((value) => !value)
        return
      }

      if (key === 'arrowup' || key === 'w') {
        if (directionRef.current.y !== 1) setDirection({ x: 0, y: -1 })
      } else if (key === 'arrowdown' || key === 's') {
        if (directionRef.current.y !== -1) setDirection({ x: 0, y: 1 })
      } else if (key === 'arrowleft' || key === 'a') {
        if (directionRef.current.x !== 1) setDirection({ x: -1, y: 0 })
      } else if (key === 'arrowright' || key === 'd') {
        if (directionRef.current.x !== -1) setDirection({ x: 1, y: 0 })
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [gameResult])

  // Finish the game exactly once and send the final result to the backend.
  const finishGame = async (message) => {
    if (resultHandledRef.current) return
    resultHandledRef.current = true
    setRunning(false)
    setGameOver(true)
    setGameResult({ kind: 'lose', message })
    await recordSoloGameResult({
      ensureSession: ensureCurrentSoloSession,
      setSessionId: setSoloSessionId,
      recordResult,
      gameSlug: 'snake',
      result: 'loss',
      winnerSide: 'guest',
      scoreHost: scoreRef.current,
      scoreGuest: scoreRef.current + 1,
    })
  }

  // Main loop: move snake, detect collision, and grow when food is eaten.
  useEffect(() => {
    if (!running || gameOver || gameResult) return

    const timer = setInterval(() => {
      setSnake((prevSnake) => {
        const head = prevSnake[0]
        const nextHead = {
          x: head.x + directionRef.current.x,
          y: head.y + directionRef.current.y,
        }

        const hitWall =
          nextHead.x < 0 ||
          nextHead.x >= BOARD_SIZE ||
          nextHead.y < 0 ||
          nextHead.y >= BOARD_SIZE

        const hitSelf = prevSnake.some(
          (part) => part.x === nextHead.x && part.y === nextHead.y
        )

        if (hitWall || hitSelf) {
          finishGame('Bạn đã va chạm. Thử lại ván mới nhé.')
          return prevSnake
        }

        const ateFood = nextHead.x === food.x && nextHead.y === food.y
        const nextSnake = [nextHead, ...prevSnake]

        if (ateFood) {
          const nextScore = scoreRef.current + 1
          setScore(nextScore)
          setFood(getRandomFood(nextSnake))
          return nextSnake
        }

        nextSnake.pop()
        return nextSnake
      })
    }, 180)

    return () => clearInterval(timer)
  }, [running, gameOver, food, gameResult])

  // Restart from a clean state and allow a new result to be recorded.
  const reset = () => {
    setSnake(INITIAL_SNAKE)
    setFood(getRandomFood(INITIAL_SNAKE))
    setDirection(INITIAL_DIRECTION)
    directionRef.current = INITIAL_DIRECTION
    setRunning(false)
    setGameOver(false)
    setScore(0)
    scoreRef.current = 0
    resultHandledRef.current = false
    setGameResult(null)
    setSoloSessionId(null)
    setTimerKey((value) => value + 1)
  }

  // Restore a previously saved snapshot from the backend.
  const handleLoad = async () => {
    const snapshot = await loadGameSnapshot({ gameSlug: 'snake', setSessionId: setSoloSessionId })
    if (!snapshot) return false
    setSnake(snapshot.snake || INITIAL_SNAKE)
    setFood(snapshot.food || getRandomFood(INITIAL_SNAKE))
    setDirection(snapshot.direction || INITIAL_DIRECTION)
    directionRef.current = snapshot.direction || INITIAL_DIRECTION
    setRunning(false)
    setGameOver(Boolean(snapshot.gameOver))
    setScore(snapshot.score || 0)
    scoreRef.current = snapshot.score || 0
    resultHandledRef.current = Boolean(snapshot.gameResult)
    setGameResult(snapshot.gameResult || null)
    setTimerKey((value) => value + 1)
    return true
  }

  // Timeout just ends the session with a loss message.
  const handleTimeout = () => {
    if (gameResult) return
    finishGame('Hết giờ! Bạn cần bắt đầu ván mới.')
  }

  // Convert snake + food positions into a flat grid for rendering.
  const cells = useMemo(() => {
    const snakeMap = new Set(snake.map((part) => `${part.x}-${part.y}`))

    return Array.from({ length: BOARD_SIZE * BOARD_SIZE }, (_, index) => {
      const x = index % BOARD_SIZE
      const y = Math.floor(index / BOARD_SIZE)
      const key = `${x}-${y}`

      let type = 'empty'
      if (food.x === x && food.y === y) type = 'food'
      if (snakeMap.has(key)) type = key === `${snake[0]?.x}-${snake[0]?.y}` ? 'head' : 'snake'

      return { key, type }
    })
  }, [snake, food])

  return (
    <div className="flex flex-col h-full">
      <GameToolbar
        gameSlug="snake"
        gameName="Rắn săn mồi"
        score={score}
        onReset={reset}
        onSave={() => saveGameSnapshot({
          sessionId: soloSessionId,
          setSessionId: setSoloSessionId,
          gameSlug: 'snake',
          boardSize: BOARD_SIZE,
          snapshot: {
          snake,
          food,
          direction: directionRef.current,
          score,
          gameOver,
          gameResult,
          },
        })}
        onLoad={handleLoad}
        timerKey={timerKey}
        paused={!running || !!gameResult}
        onTimeout={handleTimeout}
        help={help}
      />

      <div className="p-6 max-w-6xl mx-auto space-y-6 w-full">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">Rắn săn mồi</h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              Dùng phím mũi tên hoặc WASD để điều khiển. Enter để chạy hoặc tạm dừng.
            </p>
          </div>

          <div className="text-right">
            <div className="text-sm text-[var(--text-muted)]">Điểm</div>
            <div className="text-2xl font-bold">{score}</div>
          </div>
        </div>

        <div className="grid grid-cols-[1fr_280px] gap-6">
          <div className="card p-4">
            <div
              className="grid gap-1 aspect-square w-full max-w-[680px]"
              style={{ gridTemplateColumns: `repeat(${BOARD_SIZE}, minmax(0, 1fr))` }}
            >
              {cells.map((cell) => (
                <div
                  key={cell.key}
                  className={[
                    'aspect-square rounded-md border border-[var(--border)]',
                    cell.type === 'empty' && 'bg-[var(--bg-secondary)]',
                    cell.type === 'food' && 'bg-red-500',
                    cell.type === 'head' && 'bg-lime-400',
                    cell.type === 'snake' && 'bg-green-500',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                />
              ))}
            </div>
          </div>

          <div className="card p-4 h-fit space-y-4">
            <div>
              <h2 className="font-bold mb-2">Điều khiển</h2>
              <div className="text-sm text-[var(--text-muted)] space-y-1">
                <div>Mũi tên hoặc W A S D: di chuyển</div>
                <div>Enter: chạy hoặc tạm dừng</div>
                <div>Save/Load: lưu và tải lại ván đang chơi</div>
              </div>
            </div>

            <button
              onClick={() => setRunning((value) => !value)}
              className="btn-primary w-full"
              disabled={!!gameResult}
            >
              {running ? 'Tạm dừng' : 'Bắt đầu'}
            </button>

            <button
              onClick={reset}
              className="w-full px-4 py-2 rounded-xl border border-[var(--border)] hover:bg-[var(--bg-secondary)] transition"
            >
              Chơi lại
            </button>

            {gameOver ? (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
                Ván chơi đã kết thúc. Bạn có thể load lại snapshot đã lưu hoặc bắt đầu ván mới.
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {gameResult ? (
        <GameResult result={gameResult.kind} message={gameResult.message} score={score} onReplay={reset} gameSlug="snake" />
      ) : null}
    </div>
  )
}
