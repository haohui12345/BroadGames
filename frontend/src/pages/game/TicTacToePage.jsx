// Tic-tac-toe page: uses minimax for solo play and socket sync for multiplayer.
import { useState, useRef, useEffect, useCallback } from 'react'
import { io } from 'socket.io-client'
import GameBoard from '@/components/game/GameBoard'
import GameToolbar from '@/components/game/GameToolbar'
import GameResult from '@/components/game/GameResult'
import MultiplayerLobby from '@/components/game/MultiplayerLobby'
import { useGameStore } from '@/store/gameStore'
import { useAuthStore } from '@/store/authStore'
import { getGameHelp } from '@/data/gameHelp'
import { ensureSoloSession, loadGameSnapshot, recordSoloGameResult, saveGameSnapshot } from '@/utils/gamePersistence'
import toast from 'react-hot-toast'

const GAME_SLUG = 'tictactoe'
const WINS = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]]

function initBoard() { return Array(9).fill(null) }

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
    for (let i = 0; i < 9; i++) { if (!b[i]) { b[i]='O'; best=Math.max(best,minimax(b,false)); b[i]=null } }
    return best
  } else {
    let best = Infinity
    for (let i = 0; i < 9; i++) { if (!b[i]) { b[i]='X'; best=Math.min(best,minimax(b,true)); b[i]=null } }
    return best
  }
}

function bestMove(b) {
  let best = -Infinity, move = -1
  for (let i = 0; i < 9; i++) { if (!b[i]) { b[i]='O'; const s=minimax(b,false); b[i]=null; if(s>best){best=s;move=i} } }
  return move
}

export default function TicTacToePage() {
  const { recordResult } = useGameStore()
  const { token, user } = useAuthStore()
  const help = getGameHelp('tictactoe')

  const [mode, setMode] = useState('select')
  const [session, setSession] = useState(null)
  const [mySymbol, setMySymbol] = useState('X')
  const [waitingOpponent, setWaitingOpponent] = useState(false)
  const socketRef = useRef(null)

  const [board, setBoard] = useState(initBoard)
  const [current, setCurrent] = useState('X')
  const [result, setResult] = useState(null)
  const [score, setScore] = useState(0)
  const [cursor, setCursor] = useState({ row: 1, col: 1 })
  const [timerKey, setTimerKey] = useState(0)
  const [soloSessionId, setSoloSessionId] = useState(null)
  const resultHandled = useRef(false)

  // Create or reuse a backend session so scores and saves have an id.
  const ensureCurrentSoloSession = useCallback(
    () => ensureSoloSession({
      sessionId: soloSessionId,
      setSessionId: setSoloSessionId,
      gameSlug: GAME_SLUG,
      boardSize: 3,
    }),
    [soloSessionId]
  )

  const recordSoloResult = useCallback(
    async (resultKind, options = {}) => {
      await recordSoloGameResult({
        ensureSession: ensureCurrentSoloSession,
        setSessionId: setSoloSessionId,
        recordResult,
        gameSlug: GAME_SLUG,
        userId: user?.id,
        result: resultKind,
        winnerSide: options.winnerSide,
        scoreHost: options.scoreHost,
        scoreGuest: options.scoreGuest,
        winnerId: options.winnerId,
      })
    },
    [ensureCurrentSoloSession, recordResult, user?.id]
  )

  // Multiplayer socket listeners keep both players in sync.
  useEffect(() => {
    if (mode !== 'vs_player' || !session) return
    const socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000', { auth: { token } })
    socketRef.current = socket
    socket.emit('join_session', { sessionId: session.id })
    socket.on('opponent_moved', ({ board_state }) => {
      const nb = board_state.flat ? board_state : Object.values(board_state)
      setBoard(nb)
      setCurrent(mySymbol)
      setTimerKey((k) => k + 1)
    })
    socket.on('session_finished', ({ winner_id, winner_side }) => {
      if (winner_side === 'draw' || !winner_id) {
        setResult({ winner: 'draw', line: [] })
        return
      }
      const w = winner_id === user.id ? mySymbol : (mySymbol === 'X' ? 'O' : 'X')
      setResult({ winner: w, line: [] })
    })
    socket.on('session_abandoned', ({ abandoned_by }) => {
      if (abandoned_by !== user.id) {
        toast.success('Đối thủ đã rời phòng. Bạn thắng!')
        setResult({ winner: mySymbol, line: [] })
      }
    })
    socket.on('error', ({ message }) => toast.error(message))
    return () => socket.disconnect()
  }, [mode, session])

  // Host-side polling checks when the guest finally joins the room.
  useEffect(() => {
    if (!waitingOpponent || !session) return
    const interval = setInterval(async () => {
      try {
        const { default: gameService } = await import('@/services/gameService')
        const res = await gameService.getSession(session.id)
        if (res.data?.status === 'playing' && res.data?.guest_id) {
          setWaitingOpponent(false); setSession(res.data)
          setBoard(initBoard()); setCurrent('X'); setResult(null); setTimerKey((k) => k + 1)
          toast.success('Đối thủ đã vào phòng!'); clearInterval(interval)
        }
      } catch {}
    }, 2000)
    return () => clearInterval(interval)
  }, [waitingOpponent, session])

  // Place one mark, resolve the result, then hand over the turn.
  const place = useCallback((idx) => {
    if (board[idx] || result?.winner) return
    if (mode === 'vs_player' && current !== mySymbol) return toast.error('Chưa đến lượt bạn!')

    const nb = [...board]; nb[idx] = current
    const res = checkWinner(nb)
    setBoard(nb)
    if (mode === 'vs_player') setTimerKey((k) => k + 1)

    if (mode === 'vs_player' && socketRef.current) {
      socketRef.current.emit('move', { sessionId: session.id, board_state: nb, move_history: [] })
      if (res.winner) {
        socketRef.current.emit('finish_session', {
          sessionId: session.id,
          winner_id: res.winner === 'draw' ? null : (current === 'X' ? (session?.host_id ?? user.id) : (session?.guest_id ?? user.id)),
          winner_side: res.winner === 'draw' ? 'draw' : current === 'X' ? 'host' : 'guest',
          score_host: current === 'X' ? score + 50 : 0,
          score_guest: current === 'O' ? score + 50 : 0,
        })
      }
    }

    if (res.winner) {
      setResult(res)
      if (!resultHandled.current) {
        resultHandled.current = true
        if (mode !== 'vs_player') {
          if (res.winner === 'X') {
            setScore(s => s + 50)
            void recordSoloResult('win', { winnerSide: 'host', scoreHost: score + 50, winnerId: user?.id })
          } else if (res.winner === 'draw') {
            void recordSoloResult('draw', { winnerSide: 'draw', scoreHost: score })
          } else {
            void recordSoloResult('loss', { winnerSide: 'guest', scoreHost: score, scoreGuest: 50 })
          }
        }
      }
      return
    }

    if (mode === 'vs_computer') {
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
            if (res2.winner === 'draw') {
              void recordSoloResult('draw', { winnerSide: 'draw', scoreHost: score })
            } else {
              void recordSoloResult('loss', { winnerSide: 'guest', scoreHost: score, scoreGuest: 50 })
            }
          } else { setCurrent('X') }
          return nb2
        })
      }, 400)
    } else {
      setCurrent(current === 'X' ? 'O' : 'X')
    }
  }, [board, current, result, score, mode, mySymbol, session, recordSoloResult, user?.id])

  // Convert grid coordinates to a flat board index.
  const idxOf = (r, c) => r * 3 + c
  const handleEnter = (t) => { if (t?.row != null) { setCursor(t); place(idxOf(t.row, t.col)) } else place(idxOf(cursor.row, cursor.col)) }
  // Keep the cursor inside the 3x3 board.
  const move = (dr, dc) => setCursor(p => ({ row: Math.max(0, Math.min(2, p.row+dr)), col: Math.max(0, Math.min(2, p.col+dc)) }))
  // Reset all state for a fresh round.
  const reset = () => { setBoard(initBoard()); setCurrent('X'); setResult(null); setScore(0); setCursor({ row:1, col:1 }); resultHandled.current = false; setTimerKey(k => k+1); setSoloSessionId(null) }
  // Timeout means the current player loses immediately.
  const handleTimeout = () => {
    if (result?.winner || resultHandled.current) return
    const nextWinner = current === 'X' ? 'O' : 'X'
    setResult({ winner: nextWinner, line: [] })
    resultHandled.current = true
    if (mode === 'vs_player' && socketRef.current && session) {
      socketRef.current.emit('finish_session', {
        sessionId: session.id,
        winner_id: nextWinner === 'X' ? session?.host_id : session?.guest_id,
        winner_side: nextWinner === 'X' ? 'host' : 'guest',
        score_host: nextWinner === 'X' ? 50 : 0,
        score_guest: nextWinner === 'O' ? 50 : 0,
      })
      return
    }
    if (nextWinner === 'X') {
      setScore(v => v + 50)
      void recordSoloResult('win', { winnerSide: 'host', scoreHost: score + 50, winnerId: user?.id })
    } else {
      void recordSoloResult('loss', { winnerSide: 'guest', scoreHost: score, scoreGuest: 50 })
    }
  }
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
    const idx = idxOf(r, c); const val = board[idx]; const isWin = result?.line?.includes(idx)
    return { content: val, className: [val==='X'?'cell-x text-2xl':val==='O'?'cell-o text-2xl':'', isWin?'cell-win':''].join(' ') }
  }

  if (mode === 'select') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-6 p-6">
        <div className="text-center">
          <div className="text-4xl mb-2">❌</div>
          <h1 className="text-2xl font-bold">Tic-tac-toe</h1>
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
        <MultiplayerLobby gameSlug={GAME_SLUG} boardSize={3} onJoin={handleJoinSession} onBack={() => setMode('select')} />
      </div>
    )
  }

  const isMyTurn = mode === 'vs_computer' ? current === 'X' : current === mySymbol
  const turnLabel = mode === 'vs_player'
    ? (isMyTurn ? '🟢 Lượt của bạn' : '⏳ Chờ đối thủ...')
    : (current === 'X' ? '❌ Bạn' : '⭕ Máy')

  return (
    <div className="flex flex-col h-full">
      <GameToolbar gameSlug={GAME_SLUG} gameName="Tic-tac-toe" score={score}
        onReset={mode === 'vs_player' ? handleAbandon : reset}
        timerKey={timerKey} paused={!!result || (mode === 'vs_player' && (waitingOpponent || !isMyTurn))}
        onTimeout={handleTimeout} help={help}
        onSave={() => saveGameSnapshot({
          sessionId: soloSessionId,
          setSessionId: setSoloSessionId,
          gameSlug: GAME_SLUG,
          boardSize: 3,
          snapshot: { board, current, result, score },
        })}
        onLoad={async () => {
          const snapshot = await loadGameSnapshot({ gameSlug: GAME_SLUG, setSessionId: setSoloSessionId })
          if (!snapshot) return false
          setBoard(snapshot.board || initBoard())
          setCurrent(snapshot.current || 'X')
          setResult(snapshot.result || null)
          setScore(snapshot.score || 0)
          resultHandled.current = Boolean(snapshot.result?.winner)
          setTimerKey(k => k + 1)
          return true
        }} />
      <div className="flex-1 flex flex-col items-center justify-center gap-6 p-4">
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
                {result?.winner ? '' : turnLabel}
              </span>
              {mode === 'vs_player' && !result && <span className="text-xs text-[var(--text-muted)]">Bạn là {mySymbol}</span>}
            </div>
            <GameBoard rows={3} cols={3} cellSize={80} renderCell={renderCell}
              cursor={result ? null : cursor}
              onLeft={() => move(0,-1)} onRight={() => move(0,1)} onUp={() => move(-1,0)} onDown={() => move(1,0)}
              onEnter={handleEnter} onBack={reset}
              onHint={() => { const m = bestMove([...board]); if (m >= 0) setCursor({ row: Math.floor(m/3), col: m%3 }) }}
              disabled={!!result || !isMyTurn} />
          </>
        )}
      </div>
      {result?.winner && (
        <GameResult
          result={mode === 'vs_player'
            ? (result.winner === mySymbol ? 'win' : result.winner === 'draw' ? 'draw' : 'lose')
            : (result.winner === 'X' ? 'win' : result.winner === 'draw' ? 'draw' : 'lose')}
          message={mode === 'vs_player'
            ? (result.winner === mySymbol ? 'Bạn thắng! 🎉' : result.winner === 'draw' ? 'Hòa! 🤝' : 'Bạn thua! 😢')
            : (result.winner === 'X' ? 'Bạn thắng! 🎉' : result.winner === 'draw' ? 'Hòa! 🤝' : 'Máy thắng! 🤖')}
          score={score} onReplay={() => { reset(); if (mode === 'vs_player') handleAbandon() }} gameSlug={GAME_SLUG} />
      )}
    </div>
  )
}
