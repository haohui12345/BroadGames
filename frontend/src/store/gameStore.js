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

        if (sessionId) {
          const score = result === 'win' ? 100 : result === 'draw' ? 20 : 0
          await gameService.finishSession({
            session_id: sessionId,
            winner_id: result === 'win' ? userId : null,
            score_host: score,
            score_guest: 0,
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

      setTimerDuration: (seconds) => set({ timerDuration: seconds }),
    }),
    { name: 'game-storage' }
  )
)
