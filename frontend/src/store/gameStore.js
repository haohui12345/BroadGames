import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import gameService from '@/services/gameService'

export const useGameStore = create(
  persist(
    (set, get) => ({
      scores: {},       // { [gameSlug]: { wins, losses, draws } }
      savedGames: {},   // { [gameSlug]: savedSnapshot }
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

      // Ghi nhận kết quả local + gọi API finishSession nếu có session_id
      recordResult: async (gameSlug, result, sessionId, userId) => {
        // Cập nhật local
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

        // Gọi API cập nhật ranking nếu có session
        if (sessionId) {
          const score = result === 'win' ? 100 : result === 'draw' ? 20 : 0
          await gameService.finishSession({
            session_id: sessionId,
            winner_id: result === 'win' ? userId : null,
            score_host: score,
            score_guest: 0,
          })
        }
      },

      setTimerDuration: (seconds) => set({ timerDuration: seconds }),
    }),
    { name: 'game-storage' }
  )
)