import { mockAdmin } from '@/utils/mockApi'

const adminService = {
  getDashboard: async () => {
    const res = await mockAdmin.getDashboard()
    return res.data
  },

  getUsers: async (params = {}) => {
    const res = await mockAdmin.getUsers(params)
    return res.data
  },

  banUser: async (userId) => {
    const res = await mockAdmin.banUser(userId)
    return res.data
  },

  deleteUser: async (userId) => {
    const res = await mockAdmin.deleteUser(userId)
    return res.data
  },

  getGames: async () => {
    const res = await mockAdmin.getGames()
    return res.data
  },

  toggleGame: async (slug) => {
    const res = await mockAdmin.toggleGame(slug)
    return res.data
  },

  updateGame: async (slug, payload) => {
    const res = await mockAdmin.updateGame(slug, payload)
    return res.data
  },

  getStats: async () => {
    const res = await mockAdmin.getStats()
    return res.data
  },
}

export default adminService
