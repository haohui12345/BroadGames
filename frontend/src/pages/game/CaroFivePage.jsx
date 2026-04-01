// Caro 5 page: supports solo vs AI and multiplayer via socket sessions.
import { useState, useCallback, useRef, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { io } from 'socket.io-client'
import GameBoard from '@/components/game/GameBoard'
import GameToolbar from '@/components/game/GameToolbar'
import GameResult from '@/components/game/GameResult'
import MultiplayerLobby from '@/components/game/MultiplayerLobby'
import { useGameStore } from '@/store/gameStore'
import { useAuthStore } from '@/store/authStore'
import { checkWin, aiMove } from '@/utils/caroLogic'
import { ensureSoloSession, loadGameSnapshot, recordSoloGameResult, saveGameSnapshot } from '@/utils/gamePersistence'
import { getSocketUrl } from '@/utils/network'
import toast from 'react-hot-toast'

const ROWS = 15, COLS = 15, WIN = 5
const GAME_SLUG = 'caro5'

function initBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null))
}

export default function CaroFivePage() {
  const [searchParams] = useSearchParams()
  const { recordResult } = useGameStore()
  const { token, user } = useAuthStore()

  // 'select' | 'vs_computer' | 'vs_player_lobby' | 'vs_player'
  const [mode, setMode] = useState('select')
  const [session, setSession] = useState(null)   // session info khi vs player
  const [mySymbol, setMySymbol] = useState('X')  // X = host, O = guest
  const [waitingOpponent, setWaitingOpponent] = useState(false)

  const socketRef = useRef(null)

  // Reset the board back to an empty starting state.
  const initState = () => ({ board: initBoard(), current: 'X', winner: null, winLine: [], score: 0 })

  const [state, setState] = useState(initState)
  const [cursor, setCursor] = useState({ row: 7, col: 7 })
  const [hintCell, setHintCell] = useState(null)
  const [timerKey, setTimerKey] = useState(0)
  const [soloSessionId, setSoloSessionId] = useState(null)
  const resultHandled = useRef(false)

  const { board, current, winner, winLine, score } = state

  // Reuse a backend session so saves and results are tied to one record.
  const ensureCurrentSoloSession = useCallback(
    () => ensureSoloSession({
      sessionId: soloSessionId,
      setSessionId: setSoloSessionId,
      gameSlug: GAME_SLUG,
      boardSize: ROWS,
    }),
    [soloSessionId]
  )

  // Wrap result submission so solo play and multiplayer share one flow.
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

  // ── Socket setup khi vào phòng vs player ──────────────────────
  useEffect(() => {
    if (mode !== 'vs_player' || !session) return

    const socketUrl = getSocketUrl()
    const socket = socketUrl ? io(socketUrl, { auth: { token } }) : io({ auth: { token } })
    socketRef.current = socket

    socket.emit('join_session', { sessionId: session.id })

    // Nhận nước đối thủ
    socket.on('opponent_moved', ({ board_state, move_history }) => {
      setState(prev => ({
        ...prev,
        board: board_state,
        current: mySymbol,   // đến lượt mình
      }))
      setTimerKey((k) => k + 1)
    })

    socket.on('session_finished', ({ winner_id, winner_side }) => {
      const result = winner_id === user.id ? 'win' : winner_id ? 'loss' : 'draw'
      const nextWinner = winner_side === 'draw' ? null : result === 'win' ? mySymbol : (mySymbol === 'X' ? 'O' : 'X')
      setState(prev => ({ ...prev, winner: nextWinner }))
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

  // Chờ guest vào phòng (polling đơn giản khi là host)
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
          setTimerKey((k) => k + 1)
          toast.success('Đối thủ đã vào phòng!')
          clearInterval(interval)
        }
      } catch {}
    }, 2000)
    return () => clearInterval(interval)
  }, [waitingOpponent, session])

  // ── Logic đặt quân ────────────────────────────────────────────
  const place = useCallback((r, c) => {
    if (board[r][c] || winner) return

    // vs player: chỉ đi khi đến lượt mình
    if (mode === 'vs_player') {
      if (current !== mySymbol) return toast.error('Chưa đến lượt bạn!')
    }

    const nb = board.map(row => [...row])
    nb[r][c] = current
    const { won, line } = checkWin(nb, r, c, current, WIN)
    const next = current === 'X' ? 'O' : 'X'
    const newState = { board: nb, current: won ? current : next, winner: won ? current : null, winLine: line, score: score + (won ? 100 : 0) }
    setState(newState)
    setHintCell(null)
    if (mode === 'vs_player') setTimerKey((k) => k + 1)

    if (mode === 'vs_player' && socketRef.current) {
      // Gửi nước đi qua socket
      socketRef.current.emit('move', {
        sessionId: session.id,
        board_state: nb,
        move_history: [],
      })
      if (won) {
        socketRef.current.emit('finish_session', {
          sessionId: session.id,
          winner_id: current === 'X' ? (session?.host_id ?? user.id) : (session?.guest_id ?? user.id),
          winner_side: current === 'X' ? 'host' : 'guest',
          score_host: current === 'X' ? score + 100 : 0,
          score_guest: current === 'O' ? score + 100 : 0,
        })
      }
    }

    if (won && !resultHandled.current) {
      resultHandled.current = true
      if (mode !== 'vs_player') {
        setTimeout(() => {
          void recordSoloResult(current === 'X' ? 'win' : 'loss', {
            winnerSide: current === 'X' ? 'host' : 'guest',
            scoreHost: current === 'X' ? score + 100 : score,
            scoreGuest: current === 'O' ? 100 : 0,
            winnerId: current === 'X' ? user?.id : null,
          })
        }, 0)
      }
    }

    // AI đi nếu vs máy
    if (!won && next === 'O' && mode === 'vs_computer') {
      setTimeout(() => {
        setState(prev => {
          if (prev.winner) return prev
          const { row: ar, col: ac } = aiMove(prev.board, 'O', 'X', WIN)
          const nb2 = prev.board.map(r2 => [...r2])
          nb2[ar][ac] = 'O'
          const { won: aw, line: al } = checkWin(nb2, ar, ac, 'O', WIN)
          if (aw && !resultHandled.current) {
            resultHandled.current = true
            setTimeout(() => {
              void recordSoloResult('loss', {
                winnerSide: 'guest',
                scoreHost: score,
                scoreGuest: 100,
              })
            }, 0)
          }
          return { ...prev, board: nb2, current: 'X', winner: aw ? 'O' : null, winLine: al }
        })
      }, 300)
    }
  }, [board, current, winner, score, mode, mySymbol, session, recordSoloResult, user?.id])

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
    setSoloSessionId(null)
    setTimerKey((k) => k + 1)
  }

  const handleTimeout = () => {
    setState((prev) => {
      if (prev.winner || resultHandled.current) return prev

      const nextWinner = prev.current === 'X' ? 'O' : 'X'
      resultHandled.current = true
      setTimeout(() => {
        if (mode === 'vs_player' && socketRef.current && session) {
          socketRef.current.emit('finish_session', {
            sessionId: session.id,
            winner_id: nextWinner === 'X' ? session?.host_id : session?.guest_id,
            winner_side: nextWinner === 'X' ? 'host' : 'guest',
            score_host: nextWinner === 'X' ? prev.score + 100 : prev.score,
            score_guest: nextWinner === 'O' ? 100 : 0,
          })
          return
        }

        void recordSoloResult(nextWinner === 'X' ? 'win' : 'loss', {
          winnerSide: nextWinner === 'X' ? 'host' : 'guest',
          scoreHost: nextWinner === 'X' ? prev.score + 100 : prev.score,
          scoreGuest: nextWinner === 'O' ? 100 : 0,
          winnerId: nextWinner === 'X' ? user?.id : null,
        })
      }, 0)

      return {
        ...prev,
        current: nextWinner,
        winner: nextWinner,
        winLine: [],
        score: nextWinner === 'X' ? prev.score + 100 : prev.score,
      }
    })
  }

  const handleHint = () => {
    const { row, col } = aiMove(board, current, current === 'X' ? 'O' : 'X', WIN)
    setHintCell({ row, col })
    setCursor({ row, col })
  }

  const handleAbandon = () => {
    if (socketRef.current && session) {
      socketRef.current.emit('abandon_session', { sessionId: session.id })
    }
    setMode('select')
    setSession(null)
    reset()
  }

  // Khi join phòng thành công từ lobby
  const handleJoinSession = (sessionData) => {
    setSession(sessionData)
    setMySymbol(sessionData.isHost ? 'X' : 'O')
    if (sessionData.isHost) {
      setWaitingOpponent(true)
    }
    setMode('vs_player')
    reset()
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

  // ── Màn hình chọn chế độ ──────────────────────────────────────
  if (mode === 'select') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-6 p-6">
        <div className="text-center">
          <div className="text-4xl mb-2">⬛</div>
          <h1 className="text-2xl font-bold">Caro 5 trong 1 hàng</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Chọn chế độ chơi</p>
        </div>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button className="btn-primary py-3 text-base" onClick={() => setMode('vs_computer')}>
            🤖 Chơi vs Máy
          </button>
          <button className="btn-secondary py-3 text-base" onClick={() => setMode('vs_player_lobby')}>
            👥 Chơi vs Người
          </button>
        </div>
      </div>
    )
  }

  // ── Lobby phòng chờ ───────────────────────────────────────────
  if (mode === 'vs_player_lobby') {
    return (
      <div className="flex-1 flex items-center justify-center">
        <MultiplayerLobby
          gameSlug={GAME_SLUG}
          boardSize={ROWS}
          onJoin={handleJoinSession}
          onBack={() => setMode('select')}
        />
      </div>
    )
  }

  // ── Game board ────────────────────────────────────────────────
  const isMyTurn = mode === 'vs_computer' ? current === 'X' : current === mySymbol
  const turnLabel = mode === 'vs_player'
    ? (isMyTurn ? '🟢 Lượt của bạn' : '⏳ Chờ đối thủ...')
    : (current === 'X' ? '❌ Bạn' : '⭕ Máy')

  return (
    <div className="flex flex-col h-full">
      <GameToolbar
        gameSlug={GAME_SLUG} gameName="Caro 5 trong 1 hàng"
        score={score} onReset={mode === 'vs_player' ? handleAbandon : reset}
        timerKey={timerKey}
        paused={!!winner || (mode === 'vs_player' && waitingOpponent)}
        timeoutEnabled={mode !== 'vs_player' || isMyTurn}
        onTimeout={handleTimeout}
        onSave={() => saveGameSnapshot({
          sessionId: soloSessionId,
          setSessionId: setSoloSessionId,
          gameSlug: GAME_SLUG,
          boardSize: ROWS,
          snapshot: state,
        })}
        onLoad={async () => {
          const snapshot = await loadGameSnapshot({ gameSlug: GAME_SLUG, setSessionId: setSoloSessionId })
          if (!snapshot) return false
          setState(snapshot)
          setHintCell(null)
          resultHandled.current = Boolean(snapshot?.winner)
          setTimerKey((k) => k + 1)
          return true
        }}
      />

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
              {mode === 'vs_player' && (
                <span className="text-xs text-[var(--text-muted)]">Bạn là {mySymbol}</span>
              )}
            </div>

            <GameBoard
              rows={ROWS} cols={COLS} cellSize={32}
              renderCell={renderCell}
              cursor={winner ? null : cursor}
              onLeft={() => move(0, -1)} onRight={() => move(0, 1)}
              onUp={() => move(-1, 0)}  onDown={() => move(1, 0)}
              onEnter={handleEnter} onBack={reset} onHint={handleHint}
              disabled={!!winner || !isMyTurn}
            />
          </>
        )}
      </div>

      {winner && (
        <GameResult
          result={mode === 'vs_player'
            ? (winner === mySymbol ? 'win' : 'lose')
            : (winner === 'X' ? 'win' : 'lose')}
          message={mode === 'vs_player'
            ? (winner === mySymbol ? 'Bạn thắng! 🎉' : 'Bạn thua! 😢')
            : (winner === 'X' ? 'Bạn thắng! 🎉' : 'Máy thắng! 🤖')}
          score={score}
          onReplay={() => { reset(); if (mode === 'vs_player') handleAbandon() }}
          gameSlug={GAME_SLUG}
        />
      )}
    </div>
  )
}
