import { useState, useRef } from 'react'
import GameBoard from '@/components/game/GameBoard'
import GameHeader from '@/components/game/GameHeader'
import GameResult from '@/components/game/GameResult'
import { useGameStore } from '@/store/gameStore'

function initBoard() { return Array(9).fill(null) }

const WINS = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]]

function checkWinner(b) {
  for (const [a,x,c] of WINS) {
    if (b[a] && b[a] === b[x] && b[a] === b[c]) return { winner: b[a], line: [a,x,c] }
  }
  if (b.every(Boolean)) return { winner: 'draw', line: [] }
  return { winner: null, line: [] }
}

function minimax(b, isMax) {
  const { winner } = checkWinner(b)
  if (winner === 'O') return 10
  if (winner === 'X') return -10
  if (winner === 'draw') return 0
  if (isMax) {
    let best = -Infinity
    for (let i = 0; i < 9; i++) {
      if (!b[i]) { b[i] = 'O'; best = Math.max(best, minimax(b, false)); b[i] = null }
    }
    return best
  } else {
    let best = Infinity
    for (let i = 0; i < 9; i++) {
      if (!b[i]) { b[i] = 'X'; best = Math.min(best, minimax(b, true)); b[i] = null }
    }
    return best
  }
}

function bestMove(b) {
  let best = -Infinity, move = -1
  for (let i = 0; i < 9; i++) {
    if (!b[i]) { b[i] = 'O'; const s = minimax(b, false); b[i] = null; if (s > best) { best = s; move = i } }
  }
  return move
}

export default function TicTacToePage() {
  const { saveGame, loadGame, recordResult } = useGameStore()
  const [board, setBoard] = useState(initBoard)
  const [current, setCurrent] = useState('X')
  const [result, setResult] = useState(null) // { winner, line }
  const [score, setScore] = useState(0)
  const [cursor, setCursor] = useState({ row: 1, col: 1 })
  const [timerKey, setTimerKey] = useState(0)
  const resultHandled = useRef(false)

  const place = (idx) => {
    if (board[idx] || result?.winner) return
    const nb = [...board]; nb[idx] = current
    const res = checkWinner(nb)
    setBoard(nb)
    setTimerKey(k => k + 1)
    if (res.winner) {
      setResult(res)
      if (!resultHandled.current) {
        resultHandled.current = true
        if (res.winner === 'X') { setScore(s => s + 50); recordResult('tictactoe', 'win') }
        else if (res.winner === 'draw') recordResult('tictactoe', 'draw')
        else recordResult('tictactoe', 'loss')
      }
      return
    }
    setCurrent('O')
    setTimeout(() => {
      setBoard(prev => {
        const nb2 = [...prev]
        const move = bestMove(nb2)
        if (move === -1) return prev
        nb2[move] = 'O'
        const res2 = checkWinner(nb2)
        if (res2.winner && !resultHandled.current) {
          resultHandled.current = true
          setResult(res2)
          if (res2.winner === 'draw') recordResult('tictactoe', 'draw')
          else recordResult('tictactoe', 'loss')
        } else {
          setCurrent('X')
        }
        return nb2
      })
      setTimerKey(k => k + 1)
    }, 400)
  }

  const idxOf = (r, c) => r * 3 + c
  const handleEnter = (t) => {
    if (t?.row != null) { setCursor(t); place(idxOf(t.row, t.col)) }
    else place(idxOf(cursor.row, cursor.col))
  }
  const move = (dr, dc) => setCursor(p => ({ row: Math.max(0, Math.min(2, p.row+dr)), col: Math.max(0, Math.min(2, p.col+dc)) }))
  const reset = () => { setBoard(initBoard()); setCurrent('X'); setResult(null); setCursor({ row:1, col:1 }); resultHandled.current = false; setTimerKey(k => k+1) }

  const renderCell = (r, c) => {
    const idx = idxOf(r, c)
    const val = board[idx]
    const isWin = result?.line?.includes(idx)
    return { content: val, className: [val === 'X' ? 'cell-x text-2xl' : val === 'O' ? 'cell-o text-2xl' : '', isWin ? 'cell-win' : ''].join(' ') }
  }

  return (
    <div className="flex flex-col h-full">
      <GameHeader gameSlug="tictactoe" gameName="Tic-tac-toe" score={score} onReset={reset} timerKey={timerKey} paused={!!result}
        onSave={() => saveGame('tictactoe', { board, current, result, score })}
        onLoad={() => { const s = loadGame('tictactoe'); if (s) { setBoard(s.board); setCurrent(s.current); setResult(s.result); setScore(s.score) } }} />
      <div className="flex-1 flex flex-col items-center justify-center gap-6 p-4">
        <div className="text-sm font-medium text-[var(--text-muted)]">
          {result?.winner ? '' : `${current === 'X' ? '❌ Bạn' : '⭕ Máy'} đang đi`}
        </div>
        <GameBoard rows={3} cols={3} cellSize={80} renderCell={renderCell} cursor={result ? null : cursor}
          onLeft={() => move(0,-1)} onRight={() => move(0,1)} onUp={() => move(-1,0)} onDown={() => move(1,0)}
          onEnter={handleEnter} onBack={reset} onHint={() => {
            const m = bestMove([...board].map((v,i) => v === 'O' ? 'X' : v === 'X' ? 'O' : null))
            setCursor({ row: Math.floor(m/3), col: m%3 })
          }}
          disabled={!!result || current === 'O'} />
      </div>
      {result?.winner && <GameResult
        result={result.winner === 'X' ? 'win' : result.winner === 'draw' ? 'draw' : 'lose'}
        message={result.winner === 'X' ? 'Bạn thắng! 🎉' : result.winner === 'draw' ? 'Hòa! 🤝' : 'Máy thắng! 🤖'}
        score={score} onReplay={reset} gameSlug="tictactoe" />}
    </div>
  )
}
