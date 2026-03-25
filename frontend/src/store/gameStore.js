import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useGameStore = create(
  persist(
    (set, get) => ({
      // current game session
      currentGame: null,     // game type slug
      boardState: null,      // serializable board snapshot
      scores: {},            // { [gameSlug]: { wins, losses, draws } }
      savedGames: {},        // { [gameSlug]: savedSnapshot }
      timerDuration: 30,     // seconds per turn (configurable)

      startGame: (gameSlug) => set({ currentGame: gameSlug, boardState: null }),

      saveGame: (gameSlug, snapshot) =>
        set((s) => ({ savedGames: { ...s.savedGames, [gameSlug]: snapshot } })),

      loadGame: (gameSlug) => {
        const snap = get().savedGames[gameSlug]
        return snap || null
      },

      deleteSave: (gameSlug) =>
        set((s) => {
          const next = { ...s.savedGames }
          delete next[gameSlug]
          return { savedGames: next }
        }),

      recordResult: (gameSlug, result) =>
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
        }),

      setTimerDuration: (seconds) => set({ timerDuration: seconds }),
    }),
    { name: 'game-storage' }
  )
)
