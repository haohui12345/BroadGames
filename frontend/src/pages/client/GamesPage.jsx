import { Link } from 'react-router-dom'
import { useGameStore } from '@/store/gameStore'

const GAMES = [
  { slug: 'caro5', name: 'Caro hàng 5', desc: 'Đặt 5 quân liên tiếp để thắng.', emoji: '⬛' },
  { slug: 'caro4', name: 'Caro hàng 4', desc: 'Biến thể nhanh hơn của caro.', emoji: '🔷' },
  { slug: 'tictactoe', name: 'Tic-tac-toe', desc: 'Game 3x3 cổ điển.', emoji: '❌' },
  { slug: 'snake', name: 'Rắn săn mồi', desc: 'Điều khiển rắn ăn mồi.', emoji: '🐍' },
  { slug: 'match3', name: 'Ghép hàng 3', desc: 'Ghép 3 biểu tượng cùng loại.', emoji: '💎' },
  { slug: 'memory', name: 'Cờ trí nhớ', desc: 'Lật thẻ và tìm cặp giống nhau.', emoji: '🧠' },
  { slug: 'draw', name: 'Bảng vẽ tự do', desc: 'Vẽ tự do trên bàn game.', emoji: '🎨' },
]

export default function GamesPage() {
  const { scores } = useGameStore()

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Danh sách trò chơi</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">Chọn một trò chơi để bắt đầu.</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {GAMES.map((g) => (
          <Link key={g.slug} to={`/play/${g.slug}`} className="card p-5 hover:scale-[1.02] transition-transform">
            <div className="text-3xl mb-3">{g.emoji}</div>
            <div className="font-bold">{g.name}</div>
            <div className="text-sm text-[var(--text-muted)] mt-1">{g.desc}</div>
            <div className="text-xs text-[var(--text-muted)] mt-3">
              {scores?.[g.slug] ? `${scores[g.slug].wins} thắng / ${scores[g.slug].losses} thua` : 'Chưa có dữ liệu'}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}