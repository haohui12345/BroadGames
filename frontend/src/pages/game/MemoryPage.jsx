import { useState, useEffect, useRef } from 'react'
import GameHeader from '@/components/game/GameSessionHeader'
import GameResult from '@/components/game/GameResult'
import { useGameStore } from '@/store/gameStore'
import { ChevronLeft, ChevronRight, CornerDownLeft, Delete, Lightbulb } from 'lucide-react'
import clsx from 'clsx'
import { getGameHelp } from '@/data/gameHelp'

const EMOJIS = ['🐶','🐱','🦊','🐻','🐼','🦁','🐸','🦋','🌸','🍕','🎮','🚀']
const PAIRS = [...EMOJIS, ...EMOJIS]

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5) }
function initCards() { return shuffle(PAIRS).map((e,i) => ({ id:i, emoji:e, flipped:false, matched:false })) }

export default function MemoryPage() {
  const { saveGame, loadGame, recordResult } = useGameStore()
  const help = getGameHelp('memory')
  const [cards, setCards] = useState(initCards)
  const [flipped, setFlipped] = useState([]) // indices of currently revealed cards
  const [moves, setMoves] = useState(0)
  const [score, setScore] = useState(0)
  const [cursor, setCursor] = useState({ row:0, col:0 })
  const [timerKey, setTimerKey] = useState(0)
  const [done, setDone] = useState(false)
  const [gameResult, setGameResult] = useState(null)
  const [hintShown, setHintShown] = useState([])
  const lockRef = useRef(false)

  const COLS = 6, ROWS = 4

  const flip = (idx) => {
    if (gameResult) return
    if (lockRef.current) return
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
          if (prev[a].emoji === prev[b].emoji) {
            next[a] = {...next[a], matched:true}
            next[b] = {...next[b], matched:true}
            setScore(s => s + 20)
          } else {
            next[a] = {...next[a], flipped:false}
            next[b] = {...next[b], flipped:false}
          }
          const allDone = next.every(c=>c.matched)
          if (allDone) {
            setDone(true)
            recordResult('memory','win')
          }
          return next
        })
        setFlipped([])
        lockRef.current = false
      }, 800)
    }
  }

  const idxOf = (r,c) => r*COLS+c
  const handleEnter = () => flip(idxOf(cursor.row, cursor.col))
  const move = (dr,dc) => setCursor(p=>({ row:Math.max(0,Math.min(ROWS-1,p.row+dr)), col:Math.max(0,Math.min(COLS-1,p.col+dc)) }))
  const reset = () => { setCards(initCards()); setFlipped([]); setMoves(0); setScore(0); setDone(false); setGameResult(null); setHintShown([]); setCursor({row:0,col:0}); setTimerKey(k=>k+1); lockRef.current=false }
  const handleTimeout = () => {
    if (gameResult) return
    setGameResult({ kind: 'lose', message: 'Het gio! Thu lai van moi nhe.' })
    recordResult('memory', 'loss')
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

  return (
    <div className="flex flex-col h-full">
      <GameHeader gameSlug="memory" gameName="Cờ trí nhớ" score={score} onReset={reset} timerKey={timerKey} paused={done || !!gameResult}
        onTimeout={handleTimeout} help={help}
        onSave={()=>saveGame('memory',{cards,moves,score,gameResult})}
        onLoad={()=>{ const s=loadGame('memory'); if(s){setCards(s.cards);setFlipped([]);setMoves(s.moves);setScore(s.score);setGameResult(s.gameResult||null);setDone(false);setHintShown([]);setTimerKey(k=>k+1); lockRef.current=false} }} />

      <div className="flex-1 flex flex-col items-center justify-center gap-5 p-4">
        <div className="text-xs text-[var(--text-muted)]">Số lần lật: <strong>{moves}</strong> | Đã ghép: <strong>{cards.filter(c=>c.matched).length/2}/{EMOJIS.length}</strong></div>

        {/* Board */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-3">
          <div style={{ display:'grid', gridTemplateColumns:`repeat(${COLS},52px)`, gridTemplateRows:`repeat(${ROWS},52px)`, gap:6 }}>
            {Array.from({length:ROWS},(_, r)=>Array.from({length:COLS},(_,c)=>{
              const idx=idxOf(r,c)
              const card=cards[idx]
              const isCur=cursor.row===r&&cursor.col===c
              const isHint=hintShown.includes(card?.id)
              return (
                <div key={idx} onClick={()=>{setCursor({row:r,col:c});flip(idx)}}
                  className={clsx('flex items-center justify-center rounded-xl cursor-pointer text-2xl transition-all duration-300 select-none',
                    card?.matched ? 'opacity-30' : '',
                    isCur ? 'ring-2 ring-primary-400' : '',
                    isHint ? 'ring-2 ring-yellow-400' : '',
                    'hover:scale-105',
                  )}
                  style={{ width:52, height:52,
                    background: card?.flipped||card?.matched||isHint ? 'var(--bg-secondary)' : 'var(--accent)',
                    color: card?.flipped||card?.matched||isHint ? 'inherit' : 'transparent',
                    transition:'all 0.3s',
                  }}
                >
                  {card?.flipped||card?.matched||isHint ? card?.emoji : '?'}
                </div>
              )
            }))}
          </div>
        </div>

        {/* Controls */}
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
      </div>
      {gameResult ? <GameResult result={gameResult.kind} message={gameResult.message} score={score} onReplay={reset} gameSlug="memory" /> : null}
      {done && <GameResult result="win" message="Xuất sắc! 🧠 Hoàn thành!" score={score} onReplay={reset} gameSlug="memory" />}
    </div>
  )
}
