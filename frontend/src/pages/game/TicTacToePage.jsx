import { useEffect, useMemo, useRef, useState } from 'react'
import GameBoard from '@/components/game/GameBoard'
import GameHeader from '@/components/game/GameHeader'
import GameResult from '@/components/game/GameResult'
import { useGameStore } from '@/store/gameStore'
import MultiplayerLobby from '@/components/game/MultiplayerLobby'
import gameService from '@/services/gameService'
import { useAuthStore } from '@/store/authStore'

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
  const { user } = useAuthStore()

  const parseJson = (v, fallback) => {
    try {
      if (v == null) return fallback
      if (typeof v === 'string') return JSON.parse(v)
      return v
    } catch {
      return fallback
    }
  }

  // ------------------------------
  // Mode: computer (existing)
  // Mode: user (multiplayer)
  // ------------------------------
  const [mode, setMode] = useState('computer') // 'computer' | 'user'
  const [showLobby, setShowLobby] = useState(false)
  const [session, setSession] = useState(null) // BE game_sessions row
  const [mpBoard, setMpBoard] = useState(initBoard)
  const [mpMoveHistory, setMpMoveHistory] = useState([])
  const [mpResult, setMpResult] = useState(null) // checkWinner result
  const [mpGameOver, setMpGameOver] = useState(false)
  const [mpScore, setMpScore] = useState(0)

  const [board, setBoard] = useState(initBoard)
  const [current, setCurrent] = useState('X')
  const [result, setResult] = useState(null) // { winner, line }
  const [score, setScore] = useState(0)
  const [cursor, setCursor] = useState({ row: 1, col: 1 })
  const [timerKey, setTimerKey] = useState(0)
  const resultHandled = useRef(false)

  const mySymbol = useMemo(() => {
    if (mode !== 'user' || !session?.host_id || !user?.id) return null
    return session.host_id === user.id ? 'X' : 'O'
  }, [mode, session?.host_id, user?.id])

  const mpTurnSymbol = useMemo(() => {
    // Host always starts as 'X', guest is 'O'
    return mpMoveHistory.length % 2 === 0 ? 'X' : 'O'
  }, [mpMoveHistory.length])

  const canPlayNow = mode === 'user' && !!mySymbol && !mpGameOver && mpTurnSymbol === mySymbol

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

  // ------------------------------
  // Multiplayer logic (TicTacToe)
  // ------------------------------
  const mpRenderCell = (r, c) => {
    const idx = idxOf(r, c)
    const val = mpBoard[idx]
    const isWin = mpResult?.line?.includes(idx)
    return {
      content: val,
      className: [
        val === 'X' ? 'cell-x text-2xl' : val === 'O' ? 'cell-o text-2xl' : '',
        isWin ? 'cell-win' : '',
      ].join(' '),
    }
  }

  const mpHandleEnter = (t) => {
    if (!canPlayNow || !session) return
    const idx =
      t?.row != null
        ? idxOf(t.row, t.col)
        : idxOf(cursor.row, cursor.col)
    if (idx == null) return
    if (mpBoard[idx] || mpGameOver) return

    const nb = [...mpBoard]
    nb[idx] = mySymbol
    const nextMoveHistory = [...mpMoveHistory, idx]
    const res = checkWinner(nb)

    setMpBoard(nb)
    setMpMoveHistory(nextMoveHistory)
    setTimerKey((k) => k + 1) // reuse timerKey for GameHeader refresh

    if (res.winner) {
      setMpResult(res)
      setMpGameOver(true)

      const winner_id =
        res.winner === 'draw'
          ? null
          : res.winner === 'X'
            ? session.host_id
            : session.guest_id

      const score_host = res.winner === 'draw' ? 20 : res.winner === 'X' ? 100 : 0
      const score_guest = res.winner === 'draw' ? 20 : res.winner === 'O' ? 100 : 0
      gameService.finishSession({ session_id: session.id, winner_id, score_host, score_guest })

      const scoreForMe =
        res.winner === 'draw' ? 20 : res.winner === mySymbol ? 100 : 0
      setMpScore(scoreForMe)
      return
    }

    // Not finished -> sync board to opponent
    gameService.updateBoard({
      session_id: session.id,
      board_state: nb,
      move_history: nextMoveHistory,
    })
  }

  useEffect(() => {
    if (mode !== 'user' || !session?.id) return

    let alive = true
    let intervalId = null

    const poll = async () => {
      try {
        const res = await gameService.getSession(session.id)
        if (!alive) return
        const s = res.data
        if (!s) return

        const parsedBoard = parseJson(s.board_state, initBoard())
        const parsedHistory = parseJson(s.move_history, [])

        setMpBoard(Array.isArray(parsedBoard) ? parsedBoard : initBoard())
        setMpMoveHistory(Array.isArray(parsedHistory) ? parsedHistory : [])

        // Determine result from board
        const res2 = checkWinner(Array.isArray(parsedBoard) ? parsedBoard : initBoard())
        const finishedByServer = s.status === 'finished' || s.status === 'abandoned'
        if (!mpGameOver && (finishedByServer || !!res2.winner)) {
          setMpResult(res2)
          setMpGameOver(true)
          const symbol = user?.id && s.host_id === user.id ? 'X' : 'O'
          const myScore = res2.winner === 'draw' ? 20 : res2.winner === symbol ? 100 : 0
          setMpScore(myScore)
          if (intervalId) clearInterval(intervalId)
        }
      } catch {
        // silent
      }
    }

    // first poll
    poll()
    intervalId = setInterval(poll, 900)

    return () => {
      alive = false
      if (intervalId) clearInterval(intervalId)
    }
  }, [mode, session?.id, user?.id, mpGameOver])

  const handleJoin = (joinedSession) => {
    setSession(joinedSession)
    setMpGameOver(false)
    setMpResult(null)
    setMpScore(0)

    setMpBoard(parseJson(joinedSession.board_state, initBoard()))
    setMpMoveHistory(parseJson(joinedSession.move_history, []))
    setShowLobby(false)
  }

  const handleExitUser = () => {
    setMode('computer')
    setShowLobby(false)
    setSession(null)
    setMpBoard(initBoard())
    setMpMoveHistory([])
    setMpResult(null)
    setMpGameOver(false)
    setMpScore(0)
  }

  const mpReplay = () => {
    setShowLobby(true)
    setSession(null)
    setMpBoard(initBoard())
    setMpMoveHistory([])
    setMpResult(null)
    setMpGameOver(false)
    setMpScore(0)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 flex items-center justify-end gap-2">
        {mode === 'computer' ? (
          <button
            className="btn-secondary text-xs"
            onClick={() => {
              setMode('user')
              setShowLobby(true)
            }}
          >
            Chơi vs người
          </button>
        ) : (
          <button
            className="btn-secondary text-xs"
            onClick={handleExitUser}
          >
            Quay lại vs máy
          </button>
        )}
      </div>

      {mode === 'computer' ? (
        <>
          <GameHeader
            gameSlug="tictactoe"
            gameName="Tic-tac-toe"
            score={score}
            onReset={reset}
            timerKey={timerKey}
            paused={!!result}
            onSave={() => saveGame('tictactoe', { board, current, result, score })}
            onLoad={() => {
              const s = loadGame('tictactoe')
              if (s) {
                setBoard(s.board)
                setCurrent(s.current)
                setResult(s.result)
                setScore(s.score)
              }
            }}
          />

          <div className="flex-1 flex flex-col items-center justify-center gap-6 p-4">
            <div className="text-sm font-medium text-[var(--text-muted)]">
              {result?.winner ? '' : `${current === 'X' ? '❌ Bạn' : '⭕ Máy'} đang đi`}
            </div>
            <GameBoard
              rows={3}
              cols={3}
              cellSize={80}
              renderCell={renderCell}
              cursor={result ? null : cursor}
              onLeft={() => move(0, -1)}
              onRight={() => move(0, 1)}
              onUp={() => move(-1, 0)}
              onDown={() => move(1, 0)}
              onEnter={handleEnter}
              onBack={reset}
              onHint={() => {
                const m = bestMove([...board].map((v) => (v === 'O' ? 'X' : v === 'X' ? 'O' : null)))
                setCursor({ row: Math.floor(m / 3), col: m % 3 })
              }}
              disabled={!!result || current === 'O'}
            />
          </div>
          {result?.winner && (
            <GameResult
              result={result.winner === 'X' ? 'win' : result.winner === 'draw' ? 'draw' : 'lose'}
              message={result.winner === 'X' ? 'Bạn thắng! 🎉' : result.winner === 'draw' ? 'Hòa! 🤝' : 'Máy thắng! 🤖'}
              score={score}
              onReplay={reset}
              gameSlug="tictactoe"
            />
          )}
        </>
      ) : (
        <>
          {/* Lobby overlay */}
          {showLobby && (
            <MultiplayerLobby
              gameSlug="tictactoe"
              boardSize={3}
              onJoin={(s) => {
                setMode('user')
                handleJoin(s)
              }}
              onBack={handleExitUser}
            />
          )}

          <GameHeader
            gameSlug="tictactoe"
            gameName="Tic-tac-toe"
            score={mpScore}
            onReset={mpReplay}
            timerKey={timerKey}
            paused={mpGameOver}
          />

          <div className="flex-1 flex flex-col items-center justify-center gap-6 p-4">
            <div className="text-sm font-medium text-[var(--text-muted)]">
              {mpGameOver ? '' : canPlayNow ? 'Lượt của bạn (❌ hoặc ⭕)' : 'Đang chờ đối thủ...'}
            </div>
            <GameBoard
              rows={3}
              cols={3}
              cellSize={80}
              renderCell={mpRenderCell}
              cursor={mpGameOver ? null : cursor}
              onLeft={() => move(0, -1)}
              onRight={() => move(0, 1)}
              onUp={() => move(-1, 0)}
              onDown={() => move(1, 0)}
              onEnter={(t) => {
                // Reuse cursor movement UI, but disable input when it's not your turn.
                mpHandleEnter(t)
              }}
              onBack={mpReplay}
              onHint={() => {}}
              disabled={mpGameOver || !canPlayNow}
            />
          </div>

          {mpResult?.winner && (
            <GameResult
              result={
                mpResult.winner === 'draw' ? 'draw' : mpResult.winner === mySymbol ? 'win' : 'lose'
              }
              message={
                mpResult.winner === 'draw'
                  ? 'Hòa! 🤝'
                  : mpResult.winner === mySymbol
                    ? 'Bạn thắng! 🎉'
                    : 'Bạn thua! 😵'
              }
              score={mpScore}
              onReplay={mpReplay}
              gameSlug="tictactoe"
            />
          )}
        </>
      )}
    </div>
  )
}
