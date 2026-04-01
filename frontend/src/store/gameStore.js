// Game state: tracks scores, saves, and shared timer preferences across all games.
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import gameService from '@/services/gameService'
import api from '@/utils/api'
import toast from 'react-hot-toast'

export const useGameStore = create(
  persist(
    (set, get) => ({
      scores: {},
      savedGames: {},
      timerDuration: 30,

      saveGame: (gameSlug, snapshot) =>
        set((s) => ({ savedGames: { ...s.savedGames, [gameSlug]: snapshot } })),

      loadGame: (gameSlug) => get().savedGames[gameSlug] || null,

      deleteSave: (gameSlug) =>
        set((s) => {
          const next = { ...s.savedGames }
          delete next[gameSlug]
          return { savedGames: next }
        }),

      recordResult: async (gameSlug, result, sessionId, userId) => {
        // Allow callers to pass either a raw sessionId or an options object.
        const options = typeof sessionId === 'object' && sessionId !== null
          ? sessionId
          : { sessionId, userId }

        set((s) => {
          const prev = s.scores[gameSlug] || { wins: 0, losses: 0, draws: 0 }
          return {
            scores: {
              ...s.scores,
              [gameSlug]: {
                wins:   prev.wins   + (result === 'win'  ? 1 : 0),
                losses: prev.losses + (result === 'loss' ? 1 : 0),
                draws:  prev.draws  + (result === 'draw' ? 1 : 0),
              },
            },
          }
        })

        if (options.sessionId) {
          const scoreHost = options.scoreHost ?? (result === 'win' ? 100 : 0)
          const scoreGuest = options.scoreGuest ?? 0
          const winnerSide = options.winnerSide
            || (result === 'win' ? 'host' : result === 'loss' ? 'guest' : 'draw')

          await gameService.finishSession({
            session_id: options.sessionId,
            winner_id: options.winnerId ?? (result === 'win' ? options.userId : null),
            winner_side: winnerSide,
            score_host: scoreHost,
            score_guest: scoreGuest,
          })
        }

        // Tự động check và unlock thành tựu sau mỗi kết quả
        try {
          const res = await api.post('/achievements/check')
          const newly = res.data?.newly_unlocked || []
          newly.forEach(a => {
            toast.success(`🏆 Mở khóa thành tựu: ${a.name}!`, { duration: 4000 })
          })
        } catch {}
      },

      setTimerDuration: (seconds) => {
        const nextSeconds = Number(seconds)
        set({ timerDuration: Number.isFinite(nextSeconds) && nextSeconds >= 5 ? nextSeconds : 30 })
      },
    }),
    { name: 'game-storage' }
  )
)
