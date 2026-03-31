import api from '@/utils/api'

const userService = {
  search: async (q) => {
    const res = await api.get('/users/search', { params: { q } })
    return { data: (res.data.users || []).map(mapUser) }
  },

  getMyProfile: async () => {
    const res = await api.get('/users/profile')
    return { data: mapUser(res.data?.user || res.data) }
  },

  getProfile: async (id) => {
    const res = await api.get(`/users/${id}`)
    return { data: mapUser(res.data.user || null) }
  },

  getFriends: async () => {
    const res = await api.get('/friends')
    const friends = (res.data.friends || []).map(f => ({
      id: f.id,
      username: f.username,
      display_name: f.full_name || f.username,
      avatar_url: f.avatar_url,
      status: 'online',
    }))
    return { data: friends }
  },

  getFriendRequests: async () => {
    const res = await api.get('/friends/pending')
    const requests = (res.data.requests || []).map(r => ({
      id: r.id,
      from_user_id: r.id,
      from_name: r.full_name || r.username,
      from_username: r.username,
      avatar_url: r.avatar_url,
      status: 'pending',
    }))
    return { data: requests }
  },

  sendFriendRequest: async (userId) => {
    const res = await api.post(`/friends/request/${userId}`)
    return { data: res.data }
  },

  acceptFriendRequest: async (requesterId) => {
    const res = await api.put(`/friends/request/${requesterId}/accept`)
    return { data: res.data }
  },

  declineFriendRequest: async (requesterId) => {
    const res = await api.put(`/friends/request/${requesterId}/decline`)
    return { data: res.data }
  },

  removeFriend: async (userId) => {
    const res = await api.delete(`/friends/${userId}`)
    return { data: res.data }
  },

  getMessages: async (friendId) => {
    if (!friendId) {
      const res = await api.get('/messages')
      return { data: res.data.inbox || [] }
    }
    const res = await api.get(`/messages/${friendId}`)
    const messages = (res.data.messages || []).map(m => ({
      ...m,
      sender_id: m.sender_id,
      receiver_id: m.receiver_id,
    }))
    return { data: messages }
  },

  sendMessage: async ({ receiver_id, content }) => {
    const res = await api.post(`/messages/${receiver_id}`, { content })
    return { data: res.data.data }
  },

  getAchievements: async () => {
    try {
      const res = await api.get('/achievements/me')
      // BE trả về { achievements: [...] } với mỗi item có unlocked field
      return { data: res.data.achievements || [] }
    } catch {
      return { data: [] }
    }
  },

  // Ranking - hỗ trợ type: global | friends | personal
  getRanking: async ({ gameSlug, type, page = 1 } = {}) => {
    if (type === 'friends') {
      const res = await api.get('/users/rankings/friends', { params: { page, game_slug: gameSlug } })
      const rankings = (res.data.rankings || []).map(mapRanking)
      return { data: !gameSlug ? aggregateRankings(rankings) : rankings }
    }
    if (type === 'personal') {
      const res = await api.get('/users/rankings/me', { params: { page } })
      return { data: (res.data.rankings || []).map(mapRanking) }
    }
    // global
    const params = { page }
    if (gameSlug) params.game_slug = gameSlug
    const res = await api.get('/users/rankings', { params })
    const rankings = (res.data.rankings || []).map(mapRanking)
    return { data: !gameSlug ? aggregateRankings(rankings) : rankings }
  },
}

function mapUser(user) {
  if (!user) return null
  return {
    ...user,
    display_name: user.display_name || user.full_name || user.username,
  }
}

function mapRanking(r) {
  return {
    user_id: r.user_id,
    username: r.username,
    display_name: r.full_name || r.username,
    avatar_url: r.avatar_url,
    score: r.total_score,
    wins: r.wins,
    game_name: r.game_name,
    is_me: r.is_me,
  }
}

function aggregateRankings(rankings) {
  const byUser = new Map()

  for (const item of rankings) {
    if (!item.user_id) continue

    const existing = byUser.get(item.user_id)
    if (existing) {
      existing.score += Number(item.score || 0)
      existing.wins += Number(item.wins || 0)
      continue
    }

    byUser.set(item.user_id, {
      ...item,
      score: Number(item.score || 0),
      wins: Number(item.wins || 0),
      game_name: null,
    })
  }

  return [...byUser.values()]
    .sort((a, b) => (b.score - a.score) || (b.wins - a.wins) || a.display_name.localeCompare(b.display_name))
}

export default userService
