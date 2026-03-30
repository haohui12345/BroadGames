import { useEffect, useMemo, useRef, useState } from 'react'
import { useGameStore } from '@/store/gameStore'
import GameHeader from '@/components/game/GameHeader'
import GameResult from '@/components/game/GameResult'

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

export default function SnakePage() {
  const { saveGame, loadGame, recordResult } = useGameStore()

  const [snake, setSnake] = useState(INITIAL_SNAKE)
  const [food, setFood] = useState(() => getRandomFood(INITIAL_SNAKE))
  const [direction, setDirection] = useState(INITIAL_DIRECTION)
  const [running, setRunning] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [timerKey, setTimerKey] = useState(0)

  const directionRef = useRef(INITIAL_DIRECTION)
  const scoreRef = useRef(0)

  useEffect(() => {
    directionRef.current = direction
  }, [direction])

  useEffect(() => {
    scoreRef.current = score
  }, [score])

  useEffect(() => {
    setTimerKey((k) => k + 1)
  }, [score])

  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase()

      if (key === 'enter') {
        setRunning((prev) => !prev)
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
  }, [])

  useEffect(() => {
    if (!running || gameOver) return

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
          setRunning(false)
          setGameOver(true)
          if (scoreRef.current > 0) recordResult('snake', 'loss')
          return prevSnake
        }

        const ateFood = nextHead.x === food.x && nextHead.y === food.y
        const newSnake = [nextHead, ...prevSnake]

        if (ateFood) {
          const nextScore = scoreRef.current + 1
          setScore(nextScore)
          setFood(getRandomFood(newSnake))
          return newSnake
        }

        newSnake.pop()
        return newSnake
      })
      setTimerKey((k) => k + 1)
    }, 180)

    return () => clearInterval(timer)
  }, [running, gameOver, food, saveScore])

  const handleRestart = () => {
    setSnake(INITIAL_SNAKE)
    setFood(getRandomFood(INITIAL_SNAKE))
    setDirection(INITIAL_DIRECTION)
    directionRef.current = INITIAL_DIRECTION
    setRunning(false)
    setGameOver(false)
    setScore(0)
    scoreRef.current = 0
    setTimerKey((k) => k + 1)
  }

  const handleSave = () => {
    saveGame('snake', {
      snake,
      food,
      direction,
      running,
      gameOver,
      score,
    })
  }

  const handleLoad = () => {
    const s = loadGame('snake')
    if (!s) return
    setSnake(s.snake || INITIAL_SNAKE)
    setFood(s.food || getRandomFood(s.snake || INITIAL_SNAKE))
    setDirection(s.direction || INITIAL_DIRECTION)
    directionRef.current = s.direction || INITIAL_DIRECTION
    setRunning(!!s.running)
    setGameOver(!!s.gameOver)
    setScore(s.score || 0)
    scoreRef.current = s.score || 0
    setTimerKey((k) => k + 1)
  }

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
      <GameHeader
        gameSlug="snake"
        gameName="Rắn săn mồi"
        score={score}
        onReset={handleRestart}
        onSave={handleSave}
        onLoad={handleLoad}
        timerKey={timerKey}
        paused={!running || gameOver}
      />

      <div className="flex-1 p-6 max-w-6xl mx-auto space-y-6 w-full overflow-auto">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">Rắn săn mồi</h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              Dùng phím mũi tên hoặc WASD để điều khiển. Enter để chạy/tạm dừng.
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
              <div>↑ ↓ ← → hoặc W A S D: di chuyển</div>
              <div>Enter: chạy / tạm dừng</div>
            </div>
          </div>

          <button onClick={() => setRunning((prev) => !prev)} className="btn-primary w-full">
            {running ? 'Tạm dừng' : 'Bắt đầu'}
          </button>

          <button
            onClick={handleRestart}
            className="w-full px-4 py-2 rounded-xl border border-[var(--border)] hover:bg-[var(--bg-secondary)] transition"
          >
            Chơi lại
          </button>

          {gameOver && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
              Game over. Nhấn “Chơi lại” để bắt đầu lại.
            </div>
          )}
          </div>
        </div>
      </div>

      {gameOver && (
        <GameResult
          result="lose"
          message="Game over! 😵"
          score={score}
          onReplay={handleRestart}
          gameSlug="snake"
        />
      )}
    </div>
  )
}