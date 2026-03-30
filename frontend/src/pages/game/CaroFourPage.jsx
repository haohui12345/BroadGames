import { useState, useCallback, useRef, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { io } from 'socket.io-client'
import GameBoard from '@/components/game/GameBoard'
import GameHeader from '@/components/game/GameSessionHeader'
import GameResult from '@/components/game/GameResult'
import MultiplayerLobby from '@/components/game/MultiplayerLobby'
import { useGameStore } from '@/store/gameStore'
import { useAuthStore } from '@/store/authStore'
import { checkWin, aiMove } from '@/utils/caroLogic'
import { getGameHelp } from '@/data/gameHelp'
import toast from 'react-hot-toast'

const ROWS = 12, COLS = 12, WIN = 4
const GAME_SLUG = 'caro4'

function initBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null))
}

export default function CaroFourPage() {
  const [searchParams] = useSearchParams()
  const { saveGame, loadGame, recordResult } = useGameStore()
  const { token, user } = useAuthStore()
  const help = getGameHelp('caro4')

  const [mode, setMode] = useState('select')
  const [session, setSession] = useState(null)
  const [mySymbol, setMySymbol] = useState('X')
  const [waitingOpponent, setWaitingOpponent] = useState(false)
  const socketRef = useRef(null)

  const initState = () => {
    if (searchParams.get('load') === 'true') {
      const saved = loadGame(GAME_SLUG)
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

  useEffect(() => {
    if (mode !== 'vs_player' || !session) return
    const socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000', { auth: { token } })
    socketRef.current = socket
    socket.emit('join_session', { sessionId: session.id })
    socket.on('opponent_moved', ({ board_state }) => {
      setState(prev => ({ ...prev, board: board_state, current: mySymbol }))
      setTimerKey(k => k + 1)
    })
    socket.on('session_finished', ({ winner_id }) => {
      setState(prev => ({ ...prev, winner: winner_id === user.id ? mySymbol : (mySymbol === 'X' ? 'O' : 'X') }))
    })
    socket.on('session_abandoned', ({ abandoned_by }) => {
      if (abandoned_by !== user.id) {
        toast.success('Đối thủ đã rời phòng. Bạn thắng!')
        setState(prev => ({ ...prev, winner: mySymbol }))
      }
    })
    socket.on('error', ({ message }) => toast.error(message))
    return () => socket.disconnect()
  }, [mode, session])

  useEffect(() => {
    if (!waitingOpponent || !session) return
    const interval = setInterval(async () => {
      try {
        const { default: gameService } = await import('@/services/gameService')
        const res = await gameService.getSession(session.id)
        if (res.data?.status === 'playing' && res.data?.guest_id) {
          setWaitingOpponent(false)
          setSession(res.data)
          setState({ board: initBoard(), current: 'X', winner: null, winLine: [], score: 0 })
          toast.success('Đối thủ đã vào phòng!')
          clearInterval(interval)
        }
      } catch {}
    }, 2000)
    return () => clearInterval(interval)
  }, [waitingOpponent, session])

  const place = useCallback((r, c) => {
    if (board[r][c] || winner) return
    if (mode === 'vs_player') {
      if (current !== mySymbol) return toast.error('Chưa đến lượt bạn!')
    }
    const nb = board.map(row => [...row])
    nb[r][c] = current
    const { won, line } = checkWin(nb, r, c, current, WIN)
    const next = current === 'X' ? 'O' : 'X'
    const newState = { board: nb, current: won ? current : next, winner: won ? current : null, winLine: line, score: score + (won ? 80 : 0) }
    setState(newState)
    setTimerKey(k => k + 1)
    setHintCell(null)

    if (mode === 'vs_player' && socketRef.current) {
      socketRef.current.emit('move', { sessionId: session.id, board_state: nb, move_history: [] })
      if (won) {
        socketRef.current.emit('finish_session', {
          sessionId: session.id, winner_id: user.id,
          score_host: current === 'X' ? score + 80 : 0,
          score_guest: current === 'O' ? score + 80 : 0,
        })
      }
    }

    if (won && !resultHandled.current) {
      resultHandled.current = true
      if (mode !== 'vs_player') recordResult(GAME_SLUG, current === 'X' ? 'win' : 'loss')
    }

    if (!won && next === 'O' && mode === 'vs_computer') {
      setTimeout(() => {
        setState(prev => {
          if (prev.winner) return prev
          const { row: ar, col: ac } = aiMove(prev.board, 'O', 'X', WIN)
          const nb2 = prev.board.map(r2 => [...r2])
          nb2[ar][ac] = 'O'
          const { won: aw, line: al } = checkWin(nb2, ar, ac, 'O', WIN)
          if (aw && !resultHandled.current) { resultHandled.current = true; recordResult(GAME_SLUG, 'loss') }
          return { ...prev, board: nb2, current: 'X', winner: aw ? 'O' : null, winLine: al }
        })
        setTimerKey(k => k + 1)
      }, 300)
    }
  }, [board, current, winner, score, mode, mySymbol, session])

  const handleEnter = (t) => { if (t?.row != null) { setCursor(t); place(t.row, t.col) } else place(cursor.row, cursor.col) }
  const move = (dr, dc) => setCursor(p => ({ row: Math.max(0, Math.min(ROWS - 1, p.row + dr)), col: Math.max(0, Math.min(COLS - 1, p.col + dc)) }))
  const reset = () => { setState({ board: initBoard(), current: 'X', winner: null, winLine: [], score: 0 }); setCursor({ row: 5, col: 5 }); setHintCell(null); resultHandled.current = false; setTimerKey(k => k + 1) }
  const handleTimeout = () => {
    setState(prev => {
      if (prev.winner || resultHandled.current) return prev
      const nextWinner = prev.current === 'X' ? 'O' : 'X'
      resultHandled.current = true
      setTimeout(() => recordResult(GAME_SLUG, nextWinner === 'X' ? 'win' : 'loss'), 0)
      return { ...prev, current: nextWinner, winner: nextWinner, winLine: [], score: nextWinner === 'X' ? prev.score + 80 : prev.score }
    })
  }
  const handleHint = () => { const { row, col } = aiMove(board, current, current === 'X' ? 'O' : 'X', WIN); setHintCell({ row, col }); setCursor({ row, col }) }
  const handleAbandon = () => {
    if (socketRef.current && session) socketRef.current.emit('abandon_session', { sessionId: session.id })
    setMode('select'); setSession(null); reset()
  }
  const handleJoinSession = (sessionData) => {
    setSession(sessionData); setMySymbol(sessionData.isHost ? 'X' : 'O')
    if (sessionData.isHost) setWaitingOpponent(true)
    setMode('vs_player'); reset()
  }

  const renderCell = (r, c) => {
    const val = board[r][c]
    const isWin = winLine.some(p => p.row === r && p.col === c)
    const isHint = hintCell?.row === r && hintCell?.col === c
    return { content: val, className: [val === 'X' ? 'cell-x' : val === 'O' ? 'cell-o' : '', isWin ? 'cell-win' : '', isHint ? 'ring-2 ring-yellow-400' : ''].join(' ') }
  }

  if (mode === 'select') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-6 p-6">
        <div className="text-center">
          <div className="text-4xl mb-2">🔷</div>
          <h1 className="text-2xl font-bold">Caro 4 trong 1 hàng</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Chọn chế độ chơi</p>
        </div>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button className="btn-primary py-3 text-base" onClick={() => setMode('vs_computer')}>🤖 Chơi vs Máy</button>
          <button className="btn-secondary py-3 text-base" onClick={() => setMode('vs_player_lobby')}>👥 Chơi vs Người</button>
        </div>
      </div>
    )
  }

  if (mode === 'vs_player_lobby') {
    return (
      <div className="flex-1 flex items-center justify-center">
        <MultiplayerLobby gameSlug={GAME_SLUG} boardSize={ROWS} onJoin={handleJoinSession} onBack={() => setMode('select')} />
      </div>
    )
  }

  const isMyTurn = mode === 'vs_computer' ? current === 'X' : current === mySymbol
  const turnLabel = mode === 'vs_player'
    ? (isMyTurn ? '🟢 Lượt của bạn' : '⏳ Chờ đối thủ...')
    : (current === 'X' ? '❌ Bạn' : '⭕ Máy')

  return (
    <div className="flex flex-col h-full">
      <GameHeader gameSlug={GAME_SLUG} gameName="Caro 4 trong 1 hàng" score={score}
        onReset={mode === 'vs_player' ? handleAbandon : reset}
        timerKey={timerKey} paused={!!winner || (mode === 'vs_player' && waitingOpponent)}
        onTimeout={handleTimeout} help={help}
        onSave={() => saveGame(GAME_SLUG, state)} onLoad={() => { const s = loadGame(GAME_SLUG); if (s) setState(s) }} />
      <div className="flex-1 flex flex-col items-center justify-center gap-4 p-4 overflow-auto">
        {waitingOpponent ? (
          <div className="text-center space-y-3">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-[var(--text-muted)]">Đang chờ đối thủ vào phòng...</p>
            <button className="btn-secondary text-xs" onClick={handleAbandon}>Hủy</button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 text-sm">
              <span className={`px-3 py-1 rounded-full font-bold ${isMyTurn ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-300' : 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-300'}`}>
                {turnLabel}
              </span>
              {mode === 'vs_player' && <span className="text-xs text-[var(--text-muted)]">Bạn là {mySymbol}</span>}
            </div>
            <GameBoard rows={ROWS} cols={COLS} cellSize={36} renderCell={renderCell}
              cursor={winner ? null : cursor}
              onLeft={() => move(0, -1)} onRight={() => move(0, 1)}
              onUp={() => move(-1, 0)} onDown={() => move(1, 0)}
              onEnter={handleEnter} onBack={reset} onHint={handleHint}
              disabled={!!winner || !isMyTurn} />
          </>
        )}
      </div>
      {winner && (
        <GameResult
          result={mode === 'vs_player' ? (winner === mySymbol ? 'win' : 'lose') : (winner === 'X' ? 'win' : 'lose')}
          message={mode === 'vs_player' ? (winner === mySymbol ? 'Bạn thắng! 🎉' : 'Bạn thua! 😢') : (winner === 'X' ? 'Bạn thắng! 🎉' : 'Máy thắng! 🤖')}
          score={score} onReplay={() => { reset(); if (mode === 'vs_player') handleAbandon() }} gameSlug={GAME_SLUG} />
      )}
    </div>
  )
}
