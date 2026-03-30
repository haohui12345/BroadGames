import { useState, useCallback, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import GameBoard from '@/components/game/GameBoard'
import GameHeader from '@/components/game/GameSessionHeader'
import GameResult from '@/components/game/GameResult'
import { useGameStore } from '@/store/gameStore'
import { checkWin, aiMove } from '@/utils/caroLogic'
import { getGameHelp } from '@/data/gameHelp'

const ROWS = 12, COLS = 12, WIN = 4

function initBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null))
}

export default function CaroFourPage() {
  const [searchParams] = useSearchParams()
  const { saveGame, loadGame, recordResult } = useGameStore()
  const help = getGameHelp('caro4')

  const initState = () => {
    if (searchParams.get('load') === 'true') {
      const saved = loadGame('caro4')
      if (saved) return saved
    }
    return { board: initBoard(), current: 'X', winner: null, winLine: [], score: 0 }
  }

  const [state, setState] = useState(initState)
  const [cursor, setCursor] = useState({ row: 5, col: 5 })
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
    const newState = { board: nb, current: won ? current : next, winner: won ? current : null, winLine: line, score: score + (won ? 80 : 0) }
    setState(newState)
    setTimerKey(k => k + 1)
    setHintCell(null)
    if (won && !resultHandled.current) {
      resultHandled.current = true
      recordResult('caro4', current === 'X' ? 'win' : 'loss')
    }
    if (!won && next === 'O') {
      setTimeout(() => {
        setState(prev => {
          if (prev.winner) return prev
          const { row: ar, col: ac } = aiMove(prev.board, 'O', 'X', WIN)
          const nb2 = prev.board.map(r2 => [...r2])
          nb2[ar][ac] = 'O'
          const { won: aw, line: al } = checkWin(nb2, ar, ac, 'O', WIN)
          if (aw && !resultHandled.current) { resultHandled.current = true; recordResult('caro4', 'loss') }
          return { ...prev, board: nb2, current: 'X', winner: aw ? 'O' : null, winLine: al }
        })
        setTimerKey(k => k + 1)
      }, 300)
    }
  }, [board, current, winner, score])

  const handleEnter = (t) => { if (t?.row != null) { setCursor(t); place(t.row, t.col) } else place(cursor.row, cursor.col) }
  const move = (dr, dc) => setCursor(p => ({ row: Math.max(0, Math.min(ROWS-1, p.row+dr)), col: Math.max(0, Math.min(COLS-1, p.col+dc)) }))
  const reset = () => { setState({ board: initBoard(), current: 'X', winner: null, winLine: [], score: 0 }); setCursor({ row: 5, col: 5 }); setHintCell(null); resultHandled.current = false; setTimerKey(k => k+1) }
  const handleTimeout = () => {
    setState((prev) => {
      if (prev.winner || resultHandled.current) return prev
      const nextWinner = prev.current === 'X' ? 'O' : 'X'
      resultHandled.current = true
      setTimeout(() => recordResult('caro4', nextWinner === 'X' ? 'win' : 'loss'), 0)
      return {
        ...prev,
        current: nextWinner,
        winner: nextWinner,
        winLine: [],
        score: nextWinner === 'X' ? prev.score + 80 : prev.score,
      }
    })
  }
  const handleHint = () => { const { row, col } = aiMove(board, current, current === 'X' ? 'O' : 'X', WIN); setHintCell({ row, col }); setCursor({ row, col }) }

  const renderCell = (r, c) => {
    const val = board[r][c]
    const isWin = winLine.some(p => p.row === r && p.col === c)
    const isHint = hintCell?.row === r && hintCell?.col === c
    return { content: val, className: [val === 'X' ? 'cell-x' : val === 'O' ? 'cell-o' : '', isWin ? 'cell-win' : '', isHint ? 'ring-2 ring-yellow-400' : ''].join(' ') }
  }

  return (
    <div className="flex flex-col h-full">
      <GameHeader gameSlug="caro4" gameName="Caro 4 trong 1 hàng" score={score} onReset={reset} timerKey={timerKey} paused={!!winner}
        onTimeout={handleTimeout} help={help}
        onSave={() => saveGame('caro4', state)} onLoad={() => { const s = loadGame('caro4'); if (s) setState(s) }} />
      <div className="flex-1 flex flex-col items-center justify-center gap-4 p-4 overflow-auto">
        <div className="flex items-center gap-3 text-sm">
          <span className={`px-3 py-1 rounded-full font-bold ${current === 'X' ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600' : 'bg-rose-100 dark:bg-rose-900/30 text-rose-600'}`}>
            {current === 'X' ? '❌ Bạn' : '⭕ Máy'} đang đi
          </span>
        </div>
        <GameBoard rows={ROWS} cols={COLS} cellSize={36} renderCell={renderCell} cursor={winner ? null : cursor}
          onLeft={() => move(0,-1)} onRight={() => move(0,1)} onUp={() => move(-1,0)} onDown={() => move(1,0)}
          onEnter={handleEnter} onBack={reset} onHint={handleHint} disabled={!!winner || current === 'O'} />
      </div>
      {winner && <GameResult result={winner === 'X' ? 'win' : 'lose'} message={winner === 'X' ? 'Bạn thắng! 🎉' : 'Máy thắng! 🤖'} score={score} onReplay={reset} gameSlug="caro4" />}
    </div>
  )
}
