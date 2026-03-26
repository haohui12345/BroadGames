import api from '@/utils/api'

const adminService = {
  getStats: async () => {
    const res = await api.get('/admin/stats')
    const { stats, top_games } = res.data
    return {
      data: {
        total_users: stats.total_users,
        total_games: stats.total_games,
        total_matches: stats.total_sessions,
        online_users: stats.active_users,
        total_admins: 1,
        banned_users: stats.total_users - stats.active_users,
        hot_games: (top_games || []).map(g => ({
          slug: g.id, name: g.name, play_count: Number(g.total_played)
        })),
        recent_users: [],
      }
    }
  },

  getUsers: async ({ page = 1, q } = {}) => {
    const res = await api.get('/admin/users', { params: { page, q } })
    const users = (res.data.users || []).map(u => ({
      id: u.id,
      username: u.username,
      display_name: u.full_name || u.username,
      email: u.email,
      role: u.role === 'admin' ? 'admin' : 'user',
      status: u.is_active ? 'active' : 'banned',
      is_banned: !u.is_active,
    }))
    return { data: users, total: res.data.total }
  },

  toggleUserActive: async (userId) => {
    const res = await api.patch(`/admin/users/${userId}/toggle`)
    return { data: res.data }
  },

  deleteUser: async (userId) => {
    const res = await api.patch(`/admin/users/${userId}/toggle`)
    return { data: res.data }
  },

  getGames: async () => {
    const res = await api.get('/games')
    const games = (res.data.games || []).map(g => ({
      id: g.id,
      slug: g.code,
      name: g.name,
      emoji: getEmoji(g.code),
      board_size: g.board_size,
      enabled: g.is_enabled,
      total_plays: 0,
    }))
    return { data: games }
  },

  // Dùng game.id (số nguyên), không dùng slug
  toggleGame: async (gameId) => {
    const res = await api.patch(`/games/${gameId}/toggle`)
    return { data: res.data }
  },

  updateGame: async (gameId, payload) => {
    const res = await api.put(`/games/${gameId}`, {
      board_size: payload.board_size,
      is_enabled: payload.enabled,
    })
    return { data: res.data }
  },
}

function getEmoji(code) {
  const map = { caro5: '⬛', caro4: '🔷', tictactoe: '❌', snake: '🐍', match3: '💎', memory: '🧠', drawing: '🎨', draw: '🎨' }
  return map[code] || '🎮'
}

export default adminService