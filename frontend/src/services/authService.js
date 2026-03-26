import api from '@/utils/api'

const authService = {
  login: async ({ username, password }) => {
    // BE hỗ trợ cả email lẫn username trong field email
    const res = await api.post('/auth/login', { email: username, password })
    return res.data
  },

  register: async ({ username, display_name, email, password }) => {
    const res = await api.post('/auth/register', {
      email,
      username,
      password,
      full_name: display_name || username,
    })
    return res.data
  },

  me: async () => {
    const res = await api.get('/auth/me')
    return res.data
  },

  updateProfile: async ({ display_name, bio }) => {
    const res = await api.put('/users/profile', {
      full_name: display_name,
      bio,
    })
    return res.data
  },

  changePassword: async ({ oldPassword, newPassword }) => {
    const res = await api.post('/auth/change-password', { oldPassword, newPassword })
    return res.data
  },
}

export default authService