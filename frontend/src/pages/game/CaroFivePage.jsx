import { useState, useCallback, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import GameBoard from '@/components/game/GameBoard'
import GameHeader from '@/components/game/GameHeader'
import GameResult from '@/components/game/GameResult'
import { useGameStore } from '@/store/gameStore'
import { checkWin, aiMove } from '@/utils/caroLogic'

const ROWS = 15, COLS = 15, WIN = 5

function initBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null))
}

export default function CaroFivePage() {
  const [searchParams] = useSearchParams()
  const { saveGame, loadGame, recordResult } = useGameStore()

  const initState = () => {
    if (searchParams.get('load') === 'true') {
      const saved = loadGame('caro5')
      if (saved) return saved
    }
    return { board: initBoard(), current: 'X', winner: null, winLine: [], score: 0 }
  }

  const [state, setState] = useState(initState)
  const [cursor, setCursor] = useState({ row: 7, col: 7 })
  const [hintCell, setHintCell] = useState(null)
  const [timerKey, setTimerKey] = useState(0)
  const resultHandled = useRef(false)

  const { board, current, winner, winLine, score } = state

  const place = useCallback((r, c) => {
    if (board[r][c] || winner) return
    const nb = board.map(row => [...row])
    nb[r][c] = current
    const { won, line } = checkWin(nb, r, c, current, WIN)
    const next = current === 'X' ? 'O' : 'X'
    const newState = { board: nb, current: won ? current : next, winner: won ? current : null, winLine: line, score: score + (won ? 100 : 0) }
    setState(newState)
    setTimerKey(k => k + 1)
    setHintCell(null)
    if (won && !resultHandled.current) {
      resultHandled.current = true
      recordResult('caro5', current === 'X' ? 'win' : 'loss')
    }
    if (!won && next === 'O') {
      // AI move
      setTimeout(() => {
        setState(prev => {
          if (prev.winner) return prev
          const { row: ar, col: ac } = aiMove(prev.board, 'O', 'X', WIN)
          const nb2 = prev.board.map(r2 => [...r2])
          nb2[ar][ac] = 'O'
          const { won: aw, line: al } = checkWin(nb2, ar, ac, 'O', WIN)
          if (aw && !resultHandled.current) {
            resultHandled.current = true
            recordResult('caro5', 'loss')
          }
          return { ...prev, board: nb2, current: 'X', winner: aw ? 'O' : null, winLine: al }
        })
        setTimerKey(k => k + 1)
      }, 300)
    }
  }, [board, current, winner, score])

  const handleEnter = (clickTarget) => {
    if (clickTarget?.row != null) {
      setCursor(clickTarget)
      place(clickTarget.row, clickTarget.col)
    } else {
      place(cursor.row, cursor.col)
    }
  }

  const move = (dr, dc) => setCursor(p => ({
    row: Math.max(0, Math.min(ROWS - 1, p.row + dr)),
    col: Math.max(0, Math.min(COLS - 1, p.col + dc)),
  }))

  const reset = () => {
    setState({ board: initBoard(), current: 'X', winner: null, winLine: [], score: 0 })
    setCursor({ row: 7, col: 7 })
    setHintCell(null)
    resultHandled.current = false
    setTimerKey(k => k + 1)
  }

  const handleHint = () => {
    const { row, col } = aiMove(board, current, current === 'X' ? 'O' : 'X', WIN)
    setHintCell({ row, col })
    setCursor({ row, col })
  }

  const renderCell = (r, c) => {
    const val = board[r][c]
    const isWin = winLine.some(p => p.row === r && p.col === c)
    const isHint = hintCell?.row === r && hintCell?.col === c
    return {
      content: val,
      className: [
        val === 'X' ? 'cell-x' : val === 'O' ? 'cell-o' : '',
        isWin ? 'cell-win' : '',
        isHint ? 'ring-2 ring-yellow-400 bg-yellow-50 dark:bg-yellow-900/20' : '',
      ].join(' '),
    }
  }

  return (
    <div className="flex flex-col h-full">
      <GameHeader
        gameSlug="caro5" gameName="Caro 5 trong 1 hàng"
        score={score} onReset={reset} timerKey={timerKey} paused={!!winner}
        onSave={() => saveGame('caro5', state)}
        onLoad={() => { const s = loadGame('caro5'); if (s) setState(s) }}
      />

      <div className="flex-1 flex flex-col items-center justify-center gap-4 p-4 overflow-auto">
        {/* Turn indicator */}
        <div className="flex items-center gap-3 text-sm">
          <span className={`px-3 py-1 rounded-full font-bold ${current === 'X' ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-300' : 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-300'}`}>
            {current === 'X' ? '❌ Bạn' : '⭕ Máy'}
          </span>
          <span className="text-[var(--text-muted)]">đang đi</span>
        </div>

        <GameBoard
          rows={ROWS} cols={COLS} cellSize={32}
          renderCell={renderCell}
          cursor={winner ? null : cursor}
          onLeft={() => move(0, -1)} onRight={() => move(0, 1)}
          onUp={() => move(-1, 0)}  onDown={() => move(1, 0)}
          onEnter={handleEnter} onBack={reset} onHint={handleHint}
          disabled={!!winner || current === 'O'}
        />
      </div>

      {winner && (
        <GameResult
          result={winner === 'X' ? 'win' : 'lose'}
          message={winner === 'X' ? 'Bạn thắng! 🎉' : 'Máy thắng! 🤖'}
          score={score}
          onReplay={reset}
          gameSlug="caro5"
        />
      )}
    </div>
  )
}
