import { mockGame } from '@/utils/mockApi'

const gameService = {
  getGames: async () => {
    const res = await mockGame.getGames()
    return res.data
  },

  getGameBySlug: async (slug) => {
    const res = await mockGame.getGameBySlug(slug)
    return res.data
  },

  getCommentsByGame: async (slug) => {
    const res = await mockGame.getCommentsByGame(slug)
    return res.data
  },

  addComment: async (payload) => {
    const res = await mockGame.addComment(payload)
    return res.data
  },

  getSaveByGame: async (slug) => {
    const res = await mockGame.getSaveByGame(slug)
    return res.data
  },

  saveGame: async (payload) => {
    const res = await mockGame.saveGame(payload)
    return res.data
  },

  loadGame: async (slug) => {
    const res = await mockGame.loadGame(slug)
    return res.data
  },
}

export default gameService