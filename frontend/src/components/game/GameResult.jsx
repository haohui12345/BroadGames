// End-of-game overlay with replay and optional rating submission.
import { useState } from 'react'
import { RefreshCw, Home, Star, MessageSquare } from 'lucide-react'
import { Link } from 'react-router-dom'
import gameService from '@/services/gameService'
import toast from 'react-hot-toast'
import clsx from 'clsx'

export default function GameResult({ result, message, score, onReplay, gameSlug }) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const submitFeedback = async () => {
    if (!rating) return toast.error('Vui lòng chọn số sao')
    setSubmitting(true)
    try {
      await gameService.rateGame(gameSlug, { rating, comment: comment.trim() || undefined })
      setSubmitted(true)
      toast.success('Cảm ơn đánh giá của bạn!')
    } catch {
      toast.error('Không thể gửi đánh giá')
    } finally {
      setSubmitting(false)
    }
  }

  const BG = {
    win: 'from-green-500/20 to-emerald-500/10',
    lose: 'from-red-500/20 to-rose-500/10',
    draw: 'from-yellow-500/20 to-amber-500/10',
  }
  const ICON = { win: '🏆', lose: '😔', draw: '🤝' }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className={clsx('card w-full max-w-sm p-6 bg-gradient-to-b', BG[result], 'animate-bounce-in')}>
        <div className="text-center mb-5">
          <div className="text-5xl mb-3">{ICON[result]}</div>
          <h2 className="text-xl font-bold">{message}</h2>
          {score > 0 && (
            <p className="text-sm text-[var(--text-muted)] mt-1">
              Điểm: <strong className="text-primary-500">{score}</strong>
            </p>
          )}
        </div>

        {!submitted ? (
          <div className="mb-4">
            <p className="text-xs text-[var(--text-muted)] mb-2 flex items-center gap-1">
              <Star size={12} /> Đánh giá game này
            </p>
            <div className="flex gap-1 mb-2">
              {[1, 2, 3, 4, 5].map(s => (
                <button key={s} onClick={() => setRating(s)}
                  className={`text-xl transition-transform hover:scale-125 ${s <= rating ? 'text-yellow-500' : 'text-gray-300 dark:text-gray-600'}`}>
                  ★
                </button>
              ))}
            </div>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              className="input text-xs h-16 resize-none"
              placeholder="Nhận xét (tùy chọn)..."
            />
            <button
              onClick={submitFeedback}
              disabled={submitting}
              className="btn-secondary w-full text-xs mt-2 flex items-center justify-center gap-1"
            >
              <MessageSquare size={12} /> Gửi đánh giá
            </button>
          </div>
        ) : (
          <p className="text-xs text-emerald-500 text-center mb-4">✓ Đã ghi nhận đánh giá!</p>
        )}

        <div className="flex gap-2">
          <button onClick={onReplay} className="btn-primary flex-1 flex items-center justify-center gap-1.5">
            <RefreshCw size={14} /> Chơi lại
          </button>
          <Link to="/games" className="btn-secondary flex-1 justify-center inline-flex items-center gap-1.5">
            <Home size={14} /> Thoát
          </Link>
        </div>
      </div>
    </div>
  )
}
