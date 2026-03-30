import { useState, useEffect, useRef, useCallback } from 'react'
import { io } from 'socket.io-client'
import GameHeader from '@/components/game/GameSessionHeader'
import GameResult from '@/components/game/GameResult'
import MultiplayerLobby from '@/components/game/MultiplayerLobby'
import { useGameStore } from '@/store/gameStore'
import { useAuthStore } from '@/store/authStore'
import { ChevronLeft, ChevronRight, CornerDownLeft, Delete, Lightbulb } from 'lucide-react'
import clsx from 'clsx'
import { getGameHelp } from '@/data/gameHelp'
import toast from 'react-hot-toast'

const GAME_SLUG = 'memory'
const EMOJIS = ['🐶','🐱','🦊','🐻','🐼','🦁','🐸','🦋','🌸','🍕','🎮','🚀']
const PAIRS = [...EMOJIS, ...EMOJIS]
const COLS = 6, ROWS = 4

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5) }
function initCards() { return shuffle(PAIRS).map((e,i) => ({ id:i, emoji:e, flipped:false, matched:false })) }

export default function MemoryPage() {
  const { saveGame, loadGame, recordResult } = useGameStore()
  const { token, user } = useAuthStore()
  const help = getGameHelp('memory')

  const [mode, setMode] = useState('select')
  const [session, setSession] = useState(null)
  const [waitingOpponent, setWaitingOpponent] = useState(false)
  const [myTurn, setMyTurn] = useState(true) // host đi trước
  const [isHost, setIsHost] = useState(true)
  const [myScore, setMyScore] = useState(0)
  const [oppScore, setOppScore] = useState(0)
  const socketRef = useRef(null)

  const [cards, setCards] = useState(initCards)
  const [flipped, setFlipped] = useState([])
  const [moves, setMoves] = useState(0)
  const [score, setScore] = useState(0)
  const [cursor, setCursor] = useState({ row:0, col:0 })
  const [timerKey, setTimerKey] = useState(0)
  const [done, setDone] = useState(false)
  const [gameResult, setGameResult] = useState(null)
  const [hintShown, setHintShown] = useState([])
  const lockRef = useRef(false)

  useEffect(() => {
    if (mode !== 'vs_player' || !session) return
    const socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000', { auth: { token } })
    socketRef.current = socket
    socket.emit('join_session', { sessionId: session.id })

    socket.on('opponent_moved', ({ board_state }) => {
      // board_state = { cards, flipped_pair, matched, oppScore }
      if (board_state?.cards) setCards(board_state.cards)
      if (board_state?.oppScore != null) setOppScore(board_state.oppScore)
      setMyTurn(true)
      setTimerKey(k => k + 1)
    })
    socket.on('session_finished', ({ winner_id }) => {
      const iWin = winner_id === user.id
      setGameResult({ kind: iWin ? 'win' : winner_id ? 'lose' : 'draw', message: iWin ? 'Bạn thắng! 🎉' : winner_id ? 'Bạn thua! 😢' : 'Hòa! 🤝' })
    })
    socket.on('session_abandoned', ({ abandoned_by }) => {
      if (abandoned_by !== user.id) {
        toast.success('Đối thủ đã rời phòng. Bạn thắng!')
        setGameResult({ kind: 'win', message: 'Bạn thắng! 🎉' })
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
          setWaitingOpponent(false); setSession(res.data)
          setCards(initCards()); setFlipped([]); setMoves(0); setScore(0); setMyScore(0); setOppScore(0); setDone(false); setGameResult(null)
          toast.success('Đối thủ đã vào phòng!'); clearInterval(interval)
        }
      } catch {}
    }, 2000)
    return () => clearInterval(interval)
  }, [waitingOpponent, session])

  const flip = useCallback((idx) => {
    if (gameResult || done) return
    if (lockRef.current) return
    if (mode === 'vs_player' && !myTurn) return toast.error('Chưa đến lượt bạn!')
    const card = cards[idx]
    if (card.flipped || card.matched) return

    const newFlipped = [...flipped, idx]
    setCards(prev => prev.map((c,i) => i===idx ? {...c, flipped:true} : c))
    setFlipped(newFlipped)

    if (newFlipped.length === 2) {
      setMoves(m => m+1)
      lockRef.current = true
      const [a,b] = newFlipped
      setTimeout(() => {
        setCards(prev => {
          const next = [...prev]
          const matched = prev[a].emoji === prev[b].emoji
          if (matched) {
            next[a] = {...next[a], matched:true}
            next[b] = {...next[b], matched:true}
            setScore(s => s + 20)
            if (mode === 'vs_player') setMyScore(s => s + 20)
          } else {
            next[a] = {...next[a], flipped:false}
            next[b] = {...next[b], flipped:false}
          }
          const allDone = next.every(c=>c.matched)

          if (mode === 'vs_player' && socketRef.current) {
            const newMyScore = matched ? myScore + 20 : myScore
            socketRef.current.emit('move', {
              sessionId: session.id,
              board_state: { cards: next, oppScore: newMyScore },
              move_history: [],
            })
            if (allDone) {
              const winnerId = newMyScore > oppScore ? user.id : newMyScore < oppScore ? null : null
              socketRef.current.emit('finish_session', {
                sessionId: session.id,
                winner_id: newMyScore > oppScore ? user.id : newMyScore < oppScore ? 'opponent' : null,
                score_host: isHost ? newMyScore : oppScore,
                score_guest: isHost ? oppScore : newMyScore,
              })
            }
            if (!matched) setMyTurn(false)
          }

          if (allDone && mode !== 'vs_player') {
            setDone(true); recordResult(GAME_SLUG, 'win')
          }
          return next
        })
        setFlipped([])
        lockRef.current = false
      }, 800)
    }
  }, [cards, flipped, gameResult, done, mode, myTurn, session, myScore, oppScore, isHost])

  const idxOf = (r,c) => r*COLS+c
  const handleEnter = () => flip(idxOf(cursor.row, cursor.col))
  const move = (dr,dc) => setCursor(p=>({ row:Math.max(0,Math.min(ROWS-1,p.row+dr)), col:Math.max(0,Math.min(COLS-1,p.col+dc)) }))
  const reset = () => { setCards(initCards()); setFlipped([]); setMoves(0); setScore(0); setMyScore(0); setOppScore(0); setDone(false); setGameResult(null); setHintShown([]); setCursor({row:0,col:0}); setTimerKey(k=>k+1); lockRef.current=false }
  const handleTimeout = () => {
    if (gameResult) return
    setGameResult({ kind: 'lose', message: 'Hết giờ! Thử lại ván mới nhé.' })
    recordResult(GAME_SLUG, 'loss')
  }
  const handleHint = () => {
    const unmatched = cards.filter(c=>!c.matched&&!c.flipped)
    if (unmatched.length<2) return
    const target = unmatched[0]
    const pair = unmatched.find(c=>c.emoji===target.emoji&&c.id!==target.id)
    if (!pair) return
    setHintShown([target.id, pair.id])
    setTimeout(()=>setHintShown([]),2000)
  }
  const handleAbandon = () => {
    if (socketRef.current && session) socketRef.current.emit('abandon_session', { sessionId: session.id })
    setMode('select'); setSession(null); reset()
  }
  const handleJoinSession = (sessionData) => {
    setSession(sessionData); setIsHost(sessionData.isHost); setMyTurn(sessionData.isHost)
    if (sessionData.isHost) setWaitingOpponent(true)
    setMode('vs_player'); reset()
  }

  if (mode === 'select') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-6 p-6">
        <div className="text-center">
          <div className="text-4xl mb-2">🧠</div>
          <h1 className="text-2xl font-bold">Cờ trí nhớ</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Chọn chế độ chơi</p>
        </div>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button className="btn-primary py-3 text-base" onClick={() => setMode('solo')}>🧩 Chơi một mình</button>
          <button className="btn-secondary py-3 text-base" onClick={() => setMode('vs_player_lobby')}>👥 Chơi vs Người</button>
        </div>
      </div>
    )
  }

  if (mode === 'vs_player_lobby') {
    return (
      <div className="flex-1 flex items-center justify-center">
        <MultiplayerLobby gameSlug={GAME_SLUG} boardSize={4} onJoin={handleJoinSession} onBack={() => setMode('select')} />
      </div>
    )
  }

  const turnLabel = mode === 'vs_player'
    ? (myTurn ? '🟢 Lượt của bạn' : '⏳ Chờ đối thủ...')
    : null

  return (
    <div className="flex flex-col h-full">
      <GameHeader gameSlug={GAME_SLUG} gameName="Cờ trí nhớ" score={mode === 'vs_player' ? myScore : score}
        onReset={mode === 'vs_player' ? handleAbandon : reset}
        timerKey={timerKey} paused={done || !!gameResult}
        onTimeout={handleTimeout} help={help}
        onSave={()=>saveGame(GAME_SLUG,{cards,moves,score,gameResult})}
        onLoad={()=>{ const s=loadGame(GAME_SLUG); if(s){setCards(s.cards);setFlipped([]);setMoves(s.moves);setScore(s.score);setGameResult(s.gameResult||null);setDone(false);setHintShown([]);setTimerKey(k=>k+1);lockRef.current=false} }} />

      <div className="flex-1 flex flex-col items-center justify-center gap-5 p-4">
        {waitingOpponent ? (
          <div className="text-center space-y-3">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-[var(--text-muted)]">Đang chờ đối thủ vào phòng...</p>
            <button className="btn-secondary text-xs" onClick={handleAbandon}>Hủy</button>
          </div>
        ) : (
          <>
            <div className="text-xs text-[var(--text-muted)] flex gap-4">
              <span>Số lần lật: <strong>{moves}</strong></span>
              <span>Đã ghép: <strong>{cards.filter(c=>c.matched).length/2}/{EMOJIS.length}</strong></span>
              {mode === 'vs_player' && <span>Đối thủ: <strong>{oppScore}</strong> điểm</span>}
            </div>
            {turnLabel && (
              <span className={`px-3 py-1 rounded-full text-sm font-bold ${myTurn ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600' : 'bg-rose-100 dark:bg-rose-900/30 text-rose-600'}`}>
                {turnLabel}
              </span>
            )}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-3">
              <div style={{ display:'grid', gridTemplateColumns:`repeat(${COLS},52px)`, gridTemplateRows:`repeat(${ROWS},52px)`, gap:6 }}>
                {Array.from({length:ROWS},(_,r)=>Array.from({length:COLS},(_,c)=>{
                  const idx=idxOf(r,c); const card=cards[idx]
                  const isCur=cursor.row===r&&cursor.col===c
                  const isHint=hintShown.includes(card?.id)
                  return (
                    <div key={idx} onClick={()=>{setCursor({row:r,col:c});flip(idx)}}
                      className={clsx('flex items-center justify-center rounded-xl cursor-pointer text-2xl transition-all duration-300 select-none',
                        card?.matched?'opacity-30':'', isCur?'ring-2 ring-primary-400':'', isHint?'ring-2 ring-yellow-400':'', 'hover:scale-105')}
                      style={{ width:52, height:52,
                        background: card?.flipped||card?.matched||isHint?'var(--bg-secondary)':'var(--accent)',
                        color: card?.flipped||card?.matched||isHint?'inherit':'transparent', transition:'all 0.3s' }}>
                      {card?.flipped||card?.matched||isHint?card?.emoji:'?'}
                    </div>
                  )
                }))}
              </div>
            </div>
            <div className="flex gap-2">
              {[
                {label:'Left',icon:ChevronLeft,action:()=>move(0,-1),key:'←'},
                {label:'Right',icon:ChevronRight,action:()=>move(0,1),key:'→'},
                {label:'ENTER',icon:CornerDownLeft,action:handleEnter,key:'↵',accent:true},
                {label:'Back',icon:Delete,action:reset,key:'Esc'},
                {label:'Hint',icon:Lightbulb,action:handleHint,key:'H'},
              ].map(({label,icon:Icon,action,key,accent})=>(
                <button key={label} onClick={action}
                  className={clsx('flex flex-col items-center gap-1 px-3 py-2 rounded-xl border text-xs font-medium transition-all active:scale-95',
                    accent?'bg-primary-500 text-white border-primary-600':'bg-[var(--bg-card)] border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]')}>
                  <Icon size={15}/><span>{label}</span><span className="text-[10px] opacity-60">{key}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
      {gameResult && <GameResult result={gameResult.kind} message={gameResult.message} score={mode==='vs_player'?myScore:score} onReplay={()=>{reset();if(mode==='vs_player')handleAbandon()}} gameSlug={GAME_SLUG} />}
      {done && !gameResult && <GameResult result="win" message="Xuất sắc! 🧠 Hoàn thành!" score={score} onReplay={reset} gameSlug={GAME_SLUG} />}
    </div>
  )
}
