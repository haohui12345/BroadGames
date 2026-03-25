import {
  MOCK_USER,
  MOCK_ADMIN,
  MOCK_FRIENDS,
  MOCK_FRIEND_REQUESTS,
  MOCK_RANKING,
  MOCK_MESSAGES,
  MOCK_ACHIEVEMENTS,
  MOCK_STATS,
  MOCK_ADMIN_USERS,
  MOCK_GAMES_ADMIN,
  MOCK_GAMES,
  MOCK_USERS,
  MOCK_COMMENTS,
  MOCK_SAVES,
} from './mockData'

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms))

function ok(data, extra = {}) {
  return { data: { success: true, data, ...extra } }
}

export const mockAuth = {
  login: async ({ username, email, password }) => {
    await delay()

    const found =
      MOCK_USERS.find(
        (u) =>
          ((username && u.username === username) || (email && u.email === email)) &&
          u.password === password
      ) || null

    if (!found) {
      throw new Error('Sai tài khoản hoặc mật khẩu')
    }

    return ok(found, { token: 'mock-token-123', user: found })
  },

  register: async (form) => {
    await delay()

    const user = {
      ...MOCK_USER,
      id: `u${Date.now()}`,
      username: form.username,
      display_name: form.display_name || form.username,
      email: form.email,
      password: form.password,
      role: 'user',
    }

    MOCK_USERS.push(user)

    return ok(user, { token: 'mock-token-123', user })
  },

  logout: async () => {
    await delay(100)
    return ok({})
  },

  me: async () => {
    await delay(100)
    return ok(MOCK_USER)
  },

  updateProfile: async (data) => {
    await delay()
    Object.assign(MOCK_USER, data)
    return ok({ ...MOCK_USER })
  },

  changePassword: async ({ oldPassword, newPassword }) => {
    await delay()

    if (oldPassword && MOCK_USER.password && oldPassword !== MOCK_USER.password) {
      throw new Error('Mật khẩu cũ không đúng')
    }

    MOCK_USER.password = newPassword || MOCK_USER.password
    return ok({})
  },
}

export const mockUser = {
  search: async (q = '') => {
    await delay()

    const keyword = q.toLowerCase().trim()
    const friendIds = new Set(MOCK_FRIENDS.map((f) => f.id))

    const results = MOCK_USERS.filter((u) => {
      if (u.id === MOCK_USER.id) return false

      if (!keyword) return true

      return (
        u.display_name.toLowerCase().includes(keyword) ||
        u.username.toLowerCase().includes(keyword) ||
        u.email.toLowerCase().includes(keyword)
      )
    }).map((u) => ({
      ...u,
      is_friend: friendIds.has(u.id),
    }))

    return ok(results, { total: results.length })
  },

  getProfile: async (id) => {
    await delay()

    if (!id || id === MOCK_USER.id) {
      return ok(MOCK_USER)
    }

    const user = MOCK_USERS.find((u) => u.id === id)
    if (!user) throw new Error('Không tìm thấy người dùng')

    return ok(user)
  },

  getFriends: async () => {
    await delay()
    return ok(MOCK_FRIENDS, { total: MOCK_FRIENDS.length })
  },

  getFriendRequests: async () => {
    await delay()
    return ok(MOCK_FRIEND_REQUESTS, { total: MOCK_FRIEND_REQUESTS.length })
  },

  sendFriendRequest: async (userId) => {
    await delay()

    const target = MOCK_USERS.find((u) => u.id === userId)
    if (!target) throw new Error('Không tìm thấy người dùng')

    const alreadyFriend = MOCK_FRIENDS.some((f) => f.id === userId)
    if (alreadyFriend) {
      return ok({ message: 'Người dùng đã có trong danh sách bạn bè' })
    }

    const existedRequest = MOCK_FRIEND_REQUESTS.some(
      (r) => r.from_user_id === MOCK_USER.id && r.to_user_id === userId
    )

    if (!existedRequest) {
      MOCK_FRIEND_REQUESTS.push({
        id: `fr${Date.now()}`,
        from_user_id: MOCK_USER.id,
        to_user_id: userId,
        status: 'pending',
        created_at: new Date().toISOString(),
      })
    }

    MOCK_FRIENDS.push({
      id: target.id,
      username: target.username,
      display_name: target.display_name,
      email: target.email,
      avatar_url: target.avatar_url || '',
      status: 'online',
    })

    return ok({ message: 'Đã gửi lời mời kết bạn' })
  },

  acceptFriendRequest: async (requestId) => {
    await delay()

    const req = MOCK_FRIEND_REQUESTS.find((r) => r.id === requestId)
    if (!req) throw new Error('Không tìm thấy lời mời')

    req.status = 'accepted'

    const user = MOCK_USERS.find((u) => u.id === req.from_user_id)
    if (user && !MOCK_FRIENDS.some((f) => f.id === user.id)) {
      MOCK_FRIENDS.push({
        id: user.id,
        username: user.username,
        display_name: user.display_name,
        email: user.email,
        avatar_url: user.avatar_url || '',
        status: 'online',
      })
    }

    return ok({ message: 'Đã chấp nhận lời mời' })
  },

  removeFriend: async (userId) => {
    await delay()

    const index = MOCK_FRIENDS.findIndex((f) => f.id === userId)
    if (index !== -1) {
      MOCK_FRIENDS.splice(index, 1)
    }

    return ok({ message: 'Đã xóa bạn bè' })
  },

  getMessages: async (friendId) => {
    await delay()

    if (!friendId) {
      return ok(MOCK_MESSAGES, { total: MOCK_MESSAGES.length })
    }

    const messages = MOCK_MESSAGES.filter(
      (m) =>
        (m.sender_id === MOCK_USER.id && m.receiver_id === friendId) ||
        (m.sender_id === friendId && m.receiver_id === MOCK_USER.id) ||
        (m.from_user_id === MOCK_USER.id && m.to_user_id === friendId) ||
        (m.from_user_id === friendId && m.to_user_id === MOCK_USER.id)
    )

    return ok(messages, { total: messages.length })
  },

  sendMessage: async (payload) => {
    await delay()

    const receiverId = payload.receiver_id || payload.to_user_id
    const content = payload.content?.trim()

    if (!receiverId) throw new Error('Thiếu người nhận')
    if (!content) throw new Error('Tin nhắn không được để trống')

    const message = {
      id: `m${Date.now()}`,
      conversation_id: payload.conversation_id || `c-${receiverId}`,
      sender_id: MOCK_USER.id,
      receiver_id: receiverId,
      from_user_id: MOCK_USER.id,
      to_user_id: receiverId,
      sender_name: MOCK_USER.display_name,
      content,
      created_at: new Date().toISOString(),
    }

    MOCK_MESSAGES.push(message)

    return ok(message)
  },

  getAchievements: async () => {
    await delay()
    return ok(MOCK_ACHIEVEMENTS)
  },

  getRanking: async ({ gameSlug, type } = {}) => {
    await delay()

    let data = [...MOCK_RANKING]

    if (gameSlug) {
      data = data.filter((r) => r.game_slug === gameSlug)
    }

    if (type) {
      data = data.filter((r) => r.type === type)
    }

    return ok(data, { total: data.length })
  },
}

export const mockGame = {
  getGames: async () => {
    await delay()
    return ok(MOCK_GAMES.filter((g) => g.enabled))
  },

  getGameBySlug: async (slug) => {
    await delay()
    const game = MOCK_GAMES.find((g) => g.slug === slug)
    if (!game) throw new Error('Không tìm thấy game')
    return ok(game)
  },

  getCommentsByGame: async (slug) => {
    await delay()
    const data = MOCK_COMMENTS.filter((c) => c.game_slug === slug)
    return ok(data, { total: data.length })
  },

  addComment: async ({ game_slug, rating, content }) => {
    await delay()

    const comment = {
      id: `cm${Date.now()}`,
      game_slug,
      username: MOCK_USER.username,
      display_name: MOCK_USER.display_name,
      rating,
      content,
      created_at: new Date().toISOString(),
    }

    MOCK_COMMENTS.push(comment)
    return ok(comment)
  },

  getSaveByGame: async (slug) => {
    await delay()
    const save = MOCK_SAVES.find((s) => s.game_slug === slug) || null
    return ok(save)
  },

  saveGame: async ({ game_slug, state }) => {
    await delay()

    const oldIndex = MOCK_SAVES.findIndex((s) => s.game_slug === game_slug && s.user_id === MOCK_USER.id)

    const save = {
      id: `sv${Date.now()}`,
      user_id: MOCK_USER.id,
      game_slug,
      saved_at: new Date().toISOString(),
      state,
    }

    if (oldIndex !== -1) {
      MOCK_SAVES[oldIndex] = save
    } else {
      MOCK_SAVES.push(save)
    }

    return ok(save)
  },

  loadGame: async (slug) => {
    await delay()
    const save = MOCK_SAVES.find((s) => s.game_slug === slug && s.user_id === MOCK_USER.id) || null
    return ok(save)
  },
}

export const mockAdmin = {
  getDashboard: async () => {
    await delay()
    return ok(MOCK_STATS)
  },

  getUsers: async () => {
    await delay()
    return ok(MOCK_ADMIN_USERS, { total: MOCK_ADMIN_USERS.length })
  },

  updateUserStatus: async ({ userId, status }) => {
    await delay()
    return ok({ userId, status })
  },

  getGames: async () => {
    await delay()
    return ok(MOCK_GAMES_ADMIN, { total: MOCK_GAMES_ADMIN.length })
  },

  updateGame: async (payload) => {
    await delay()
    return ok(payload)
  },

  getStats: async () => {
    await delay()
    return ok(MOCK_STATS)
  },
}

// Admin extended handlers
mockAdmin.banUser = async (userId) => {
  await delay()
  const user = MOCK_ADMIN_USERS.find((u) => u.id === userId) || MOCK_USERS.find((u) => u.id === userId)
  if (!user) throw new Error('Không tìm thấy người dùng')
  user.is_banned = !user.is_banned
  return ok(user)
}

mockAdmin.deleteUser = async (userId) => {
  await delay()
  const idx = MOCK_ADMIN_USERS.findIndex((u) => u.id === userId)
  if (idx !== -1) MOCK_ADMIN_USERS.splice(idx, 1)
  const idx2 = MOCK_USERS.findIndex((u) => u.id === userId)
  if (idx2 !== -1) MOCK_USERS.splice(idx2, 1)
  return ok({ userId })
}

mockAdmin.toggleGame = async (slug) => {
  await delay()
  const game = MOCK_GAMES_ADMIN.find((g) => g.slug === slug) || MOCK_GAMES.find((g) => g.slug === slug)
  if (!game) throw new Error('Không tìm thấy game')
  game.enabled = !game.enabled
  return ok(game)
}

mockAdmin.updateGame = async (slug, payload) => {
  await delay()
  const all = [MOCK_GAMES_ADMIN, MOCK_GAMES]
  let game = null
  all.forEach(arr => {
    const found = arr.find((g) => g.slug === slug)
    if (found) game = found
  })
  if (!game) throw new Error('Không tìm thấy game')
  Object.assign(game, payload)
  return ok(game)
}

mockUser.acceptFriendRequest ??= async (requestId) => ok({ requestId })
mockUser.removeFriend ??= async (userId) => ok({ userId })
