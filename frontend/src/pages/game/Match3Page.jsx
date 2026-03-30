import { useState, useCallback } from 'react'
import GameHeader from '@/components/game/GameSessionHeader'
import GameResult from '@/components/game/GameResult'
import { useGameStore } from '@/store/gameStore'
import { ChevronLeft, ChevronRight, ChevronUp, CornerDownLeft, Delete } from 'lucide-react'
import clsx from 'clsx'
import { getGameHelp } from '@/data/gameHelp'

const ROWS = 8, COLS = 8, GEMS = ['💎','🔮','⭐','🔶','🟢','🔴']

function rndGem() { return GEMS[Math.floor(Math.random()*GEMS.length)] }
function initBoard() { return Array.from({length:ROWS}, () => Array.from({length:COLS}, rndGem)) }

function findMatches(board) {
  const matched = new Set()
  // Horizontal
  for (let r=0;r<ROWS;r++) for (let c=0;c<COLS-2;c++) {
    if (board[r][c] && board[r][c]===board[r][c+1] && board[r][c]===board[r][c+2]) {
      let e=c+2; while(e+1<COLS&&board[r][e+1]===board[r][c])e++
      for(let x=c;x<=e;x++) matched.add(`${r},${x}`)
    }
  }
  // Vertical
  for (let c=0;c<COLS;c++) for (let r=0;r<ROWS-2;r++) {
    if (board[r][c] && board[r][c]===board[r+1][c] && board[r][c]===board[r+2][c]) {
      let e=r+2; while(e+1<ROWS&&board[e+1][c]===board[r][c])e++
      for(let x=r;x<=e;x++) matched.add(`${x},${c}`)
    }
  }
  return matched
}

function applyGravity(board) {
  const nb = board.map(r=>[...r])
  for (let c=0;c<COLS;c++) {
    let empty=ROWS-1
    for (let r=ROWS-1;r>=0;r--) if (nb[r][c]) { nb[empty][c]=nb[r][c]; if(empty!==r)nb[r][c]=null; empty-- }
    while(empty>=0) { nb[empty][c]=rndGem(); empty-- }
  }
  return nb
}

export default function Match3Page() {
  const { saveGame, loadGame, recordResult } = useGameStore()
  const help = getGameHelp('match3')
  const [board, setBoard] = useState(initBoard)
  const [score, setScore] = useState(0)
  const [cursor, setCursor] = useState({ row:3, col:3 })
  const [selected, setSelected] = useState(null)
  const [timerKey, setTimerKey] = useState(0)
  const [animating, setAnimating] = useState(false)
  const [result, setResult] = useState(null)

  const processBoard = useCallback((b, addScore=0) => {
    const matches = findMatches(b)
    if (matches.size === 0) { setBoard(b); setScore(s=>s+addScore); return }
    const nb = b.map((row,r)=>row.map((g,c)=>matches.has(`${r},${c}`)?null:g))
    setAnimating(true)
    setTimeout(() => {
      const after = applyGravity(nb)
      setAnimating(false)
      processBoard(after, addScore + matches.size * 10)
    }, 300)
  }, [])

  const trySwap = (r1,c1,r2,c2) => {
    if (r2<0||r2>=ROWS||c2<0||c2>=COLS) return
    const nb = board.map(row=>[...row])
    ;[nb[r1][c1], nb[r2][c2]] = [nb[r2][c2], nb[r1][c1]]
    const matches = findMatches(nb)
    if (matches.size === 0) return // invalid swap
    setSelected(null)
    processBoard(nb)
    setTimerKey(k=>k+1)
  }

  const handleEnter = () => {
    if (!selected) { setSelected(cursor) }
    else {
      const dr = Math.abs(cursor.row - selected.row), dc = Math.abs(cursor.col - selected.col)
      if ((dr===1&&dc===0)||(dr===0&&dc===1)) trySwap(selected.row,selected.col,cursor.row,cursor.col)
      setSelected(null)
    }
  }

  const move = (dr,dc) => setCursor(p=>({ row:Math.max(0,Math.min(ROWS-1,p.row+dr)), col:Math.max(0,Math.min(COLS-1,p.col+dc)) }))
  const reset = () => { setBoard(initBoard()); setScore(0); setSelected(null); setResult(null); setTimerKey(k=>k+1) }
  const handleTimeout = () => {
    if (result) return
    setSelected(null)
    setResult({ kind: 'draw', message: 'Het gio! Diem cua ban da duoc ghi nhan.' })
    recordResult('match3', 'draw')
  }

  return (
    <div className="flex flex-col h-full">
      <GameHeader gameSlug="match3" gameName="Ghép hàng 3" score={score} onReset={reset} timerKey={timerKey} paused={animating || !!result}
        onTimeout={handleTimeout} help={help}
        onSave={() => saveGame('match3', { board, score })} onLoad={() => { const s=loadGame('match3'); if(s){setBoard(s.board);setScore(s.score);setSelected(null);setAnimating(false);setResult(null);setTimerKey(k=>k+1)} }} />
      <div className="flex-1 flex flex-col items-center justify-center gap-5 p-4">
        <div className="text-xs text-[var(--text-muted)]">
          {selected ? '✅ Đã chọn — di chuyển đến ô kề và nhấn ENTER để đổi' : 'Chọn một viên đá rồi đổi với ô kề'}
        </div>
        {/* Board */}
        <div className="rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--bg-card)] p-2">
          <div style={{ display:'grid', gridTemplateColumns:`repeat(${COLS},40px)`, gridTemplateRows:`repeat(${ROWS},40px)`, gap:3 }}>
            {board.map((row,r)=>row.map((gem,c)=>{
              const isCur = cursor.row===r&&cursor.col===c
              const isSel = selected?.row===r&&selected?.col===c
              return (
                <div key={`${r},${c}`}
                  onClick={()=>{ setCursor({row:r,col:c}); if(selected){ const dr=Math.abs(r-selected.row),dc=Math.abs(c-selected.col); if((dr===1&&dc===0)||(dr===0&&dc===1))trySwap(selected.row,selected.col,r,c); else setSelected({row:r,col:c}) } else setSelected({row:r,col:c}) }}
                  className={clsx('flex items-center justify-center rounded-lg cursor-pointer text-lg transition-all duration-150 select-none',
                    isSel ? 'ring-2 ring-primary-500 scale-110' : '',
                    isCur && !isSel ? 'ring-2 ring-yellow-400' : '',
                    'hover:scale-105',
                  )}
                  style={{ width:40, height:40, background:'var(--bg-secondary)', opacity: animating&&!gem ? 0 : 1 }}
                >
                  {gem}
                </div>
              )
            }))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          {[
            { label:'Left', icon:ChevronLeft, action:()=>move(0,-1), key:'←' },
            { label:'Right', icon:ChevronRight, action:()=>move(0,1), key:'→' },
            { label:'ENTER', icon:CornerDownLeft, action:handleEnter, key:'↵', accent:true },
            { label:'Back', icon:Delete, action:()=>setSelected(null), key:'Esc' },
            { label:'Up/Down', icon:ChevronUp, action:()=>move(-1,0), key:'↑↓' },
          ].map(({label,icon:Icon,action,key,accent})=>(
            <button key={label} onClick={action} disabled={animating}
              className={clsx('flex flex-col items-center gap-1 px-3 py-2 rounded-xl border text-xs font-medium transition-all active:scale-95',
                accent ? 'bg-primary-500 text-white border-primary-600 hover:bg-primary-600' : 'bg-[var(--bg-card)] border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]')}>
              <Icon size={15}/><span>{label}</span><span className="text-[10px] opacity-60">{key}</span>
            </button>
          ))}
        </div>
      </div>
      {result ? (
        <GameResult result={result.kind} message={result.message} score={score} onReplay={reset} gameSlug="match3" />
      ) : null}
    </div>
  )
}
