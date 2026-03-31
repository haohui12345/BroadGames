import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import GameBoard from '@/components/game/GameBoard'
import GameHelpModal from '@/components/game/GameHelpModal'
import { getGameHelp } from '@/data/gameHelp'
import gameService from '@/services/gameService'

const GAMES = [
  { slug:'caro5',    name:'Caro 5',        emoji:'⬛', desc:'5 trong 1 hàng, board 15×15' },
  { slug:'caro4',    name:'Caro 4',        emoji:'🔷', desc:'4 trong 1 hàng, board 12×12' },
  { slug:'tictactoe',name:'Tic-tac-toe',   emoji:'❌', desc:'3×3 kinh điển' },
  { slug:'snake',    name:'Rắn săn mồi',   emoji:'🐍', desc:'Ăn mồi, tránh va chạm' },
  { slug:'match3',   name:'Ghép hàng 3',   emoji:'💎', desc:'Hoán đổi viên đá quý' },
  { slug:'memory',   name:'Cờ trí nhớ',    emoji:'🧠', desc:'Lật bài tìm cặp' },
  { slug:'draw',     name:'Bảng vẽ',       emoji:'🎨', desc:'Sáng tạo không giới hạn' },
]

// 7 games displayed in a 4x2 grid on the "board"
const ROWS = 2, COLS = 4

export default function GameSelectPage() {
  const navigate = useNavigate()
  const [cursor, setCursor] = useState({ row: 0, col: 0 })
  const [showHelp, setShowHelp] = useState(false)
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const help = getGameHelp('select')

  useEffect(() => {
    let mounted = true

    gameService
      .getGames({ onlyEnabled: true, force: true })
      .then((response) => {
        if (!mounted) return
        setGames(response.data || [])
      })
      .catch(() => {
        if (!mounted) return
        setGames([])
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [])

  const rows = useMemo(() => Math.max(1, Math.ceil(games.length / COLS)), [games])
  const selectedIdx = cursor.row * COLS + cursor.col
  const selectedGame = games[selectedIdx]

  const move = (dr, dc) => setCursor(p => ({
    row: Math.max(0, Math.min(rows-1, p.row+dr)),
    col: Math.max(0, Math.min(COLS-1, p.col+dc)),
  }))

  const handleEnter = (t) => {
    if (t?.row != null) {
      const idx = t.row * COLS + t.col
      if (games[idx]) navigate(`/play/${games[idx].slug}`)
    } else {
      if (selectedGame) navigate(`/play/${selectedGame.slug}`)
    }
  }

  const renderCell = (r, c) => {
    const idx = r * COLS + c
    const game = games[idx]
    if (!game) return { content: null, className: 'opacity-20 cursor-not-allowed' }
    return { content: <span className="text-xl">{game.emoji}</span>, className: 'cell-filled' }
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-6 p-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-1">Chọn trò chơi</h1>
        <p className="text-sm text-[var(--text-muted)]">Dùng phím mũi tên và ENTER, hoặc click trực tiếp</p>
      </div>

      {loading ? (
        <div className="card px-6 py-4 text-sm text-[var(--text-muted)]">Đang tải danh sách game...</div>
      ) : null}

      {!loading && games.length === 0 ? (
        <div className="card px-6 py-4 text-sm text-[var(--text-muted)]">Hiện không có game nào đang được bật.</div>
      ) : null}

      {/* Info card for selected game */}
      {!loading && selectedGame && (
        <div className="card px-6 py-3 text-center animate-fade-in min-w-[200px]">
          <div className="text-2xl mb-1">{selectedGame.emoji}</div>
          <div className="font-bold text-sm">{selectedGame.name}</div>
          <div className="text-xs text-[var(--text-muted)] mt-0.5">{selectedGame.description || selectedGame.desc || 'Sẵn sàng cho một ván mới.'}</div>
        </div>
      )}

      {!loading && games.length > 0 ? (
        <GameBoard
          rows={rows} cols={COLS} cellSize={72}
          renderCell={renderCell}
          cursor={cursor}
          onLeft={() => move(0,-1)} onRight={() => move(0,1)}
          onUp={() => move(-1,0)}   onDown={() => move(1,0)}
          onEnter={handleEnter}
          onBack={() => navigate('/games')}
          onHint={() => setShowHelp(true)}
        />
      ) : null}

      <GameHelpModal open={showHelp} onClose={() => setShowHelp(false)} help={help} />
    </div>
  )
}
