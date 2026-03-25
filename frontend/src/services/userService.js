import { mockUser } from '@/utils/mockApi'

const userService = {
  search: async (q) => {
    const res = await mockUser.search(q)
    return res.data
  },

  getFriends: async () => {
    const res = await mockUser.getFriends()
    return res.data
  },

  sendFriendRequest: async (userId) => {
    const res = await mockUser.sendFriendRequest(userId)
    return res.data
  },

  getFriendRequests: async () => {
    const res = await mockUser.getFriendRequests()
    return res.data
  },

  acceptFriendRequest: async (requestId) => {
    const res = await mockUser.acceptFriendRequest(requestId)
    return res.data
  },

  removeFriend: async (userId) => {
    const res = await mockUser.removeFriend(userId)
    return res.data
  },

  getMessages: async (friendId) => {
    const res = await mockUser.getMessages(friendId)
    return res.data
  },

  sendMessage: async (payload) => {
    const res = await mockUser.sendMessage(payload)
    return res.data
  },

  getProfile: async (id) => {
    const res = await mockUser.getProfile(id)
    return res.data
  },

  getAchievements: async () => {
    const res = await mockUser.getAchievements()
    return res.data
  },

  getRanking: async (params) => {
    const res = await mockUser.getRanking(params)
    return res.data
  },
}

export default userService
