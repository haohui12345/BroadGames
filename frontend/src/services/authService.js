import { mockAuth } from '@/utils/mockApi'

const authService = {
  login: async (payload) => {
    const res = await mockAuth.login(payload)
    return res.data
  },

  register: async (payload) => {
    const res = await mockAuth.register(payload)
    return res.data
  },

  logout: async () => {
    const res = await mockAuth.logout()
    return res.data
  },

  me: async () => {
    const res = await mockAuth.me()
    return res.data
  },

  updateProfile: async (payload) => {
    const res = await mockAuth.updateProfile(payload)
    return res.data
  },

  changePassword: async (payload) => {
    const res = await mockAuth.changePassword(payload)
    return res.data
  },
}

export default authService