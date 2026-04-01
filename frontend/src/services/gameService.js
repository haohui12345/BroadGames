// Game API wrapper with caching for the enabled game list.
import api from '@/utils/api'

// Cache game list để tránh gọi lại nhiều lần
let _gamesCache = null
let _gamesCacheExpiresAt = 0

function mapGame(game) {
  return {
    id: game.id,
    slug: game.code,
    name: game.name,
    description: game.description,
    enabled: game.is_enabled,
    board_size: game.board_size,
    emoji: getEmoji(game.code),
  }
}

const getGamesRaw = async ({ force = false } = {}) => {
  const now = Date.now()
  if (!force && _gamesCache && now < _gamesCacheExpiresAt) return _gamesCache
  const res = await api.get('/games')
  _gamesCache = res.data.games || []
  _gamesCacheExpiresAt = now + 30000
  return _gamesCache
}

const gameService = {
  clearGamesCache: () => {
    _gamesCache = null
    _gamesCacheExpiresAt = 0
  },

  getGames: async ({ onlyEnabled = false, force = false } = {}) => {
    const games = await getGamesRaw({ force })
    const mapped = games.map(mapGame)
    return { data: onlyEnabled ? mapped.filter((game) => game.enabled) : mapped }
  },

  getGameBySlug: async (slug, { force = false } = {}) => {
    const games = await getGamesRaw({ force })
    const game = games.find((item) => item.code === slug)
    return { data: game ? mapGame(game) : null }
  },

  getGameIdBySlug: async (slug) => {
    const games = await getGamesRaw()
    const game = games.find(g => g.code === slug)
    return game ? game.id : null
  },

  getCommentsByGame: async (gameId) => {
    const res = await api.get(`/games/${gameId}/ratings`)
    return { data: res.data.ratings || [] }
  },

  // rating + comment dùng game_id (số nguyên)
  rateGame: async (gameSlug, { rating, comment }) => {
    const games = await getGamesRaw()
    const game = games.find(g => g.code === gameSlug)
    if (!game) throw new Error('Không tìm thấy game')
    const res = await api.post(`/games/${game.id}/ratings`, { rating, comment })
    return { data: res.data }
  },

  // Tạo session khi bắt đầu game vs máy
  createSession: async ({ game_slug, vs_computer = true, board_size }) => {
    const games = await getGamesRaw()
    const game = games.find(g => g.code === game_slug)
    if (!game) return { data: null }
    const res = await api.post('/sessions', {
      game_id: game.id,
      vs_computer,
      board_size: board_size || game.board_size,
    })
    return { data: res.data.sessions }
  },

  // Kết thúc session → cập nhật ranking
  finishSession: async ({ session_id, winner_id, winner_side, score_host = 0, score_guest = 0 }) => {
    if (!session_id) return { data: null }
    try {
      const res = await api.post(`/sessions/${session_id}/finish`, {
        winner_id,
        winner_side,
        score_host,
        score_guest,
      })
      return { data: res.data }
    } catch {
      return { data: null }
    }
  },

  // Save game state vào BE
  saveGame: async ({ session_id, game_slug, state, move_history }) => {
    if (!session_id) return { data: null }
    try {
      const res = await api.post(`/sessions/${session_id}/save`, {
        save_name: `${game_slug} - ${new Date().toLocaleString('vi-VN')}`,
        board_state: state,
        move_history: move_history || state?.moveHistory || state?.move_history || [],
      })
      return { data: res.data }
    } catch {
      return { data: null }
    }
  },

  // Load save từ BE theo slug
  loadSavedGame: async (slug) => {
    try {
      const res = await api.get('/sessions/saves')
      const saves = res.data.saves || []
      const save = saves.find(s => s.game_code === slug) || null
      if (!save) return { data: null }
      return {
        data: {
          ...save,
          state: save.board_state || null,
        },
      }
    } catch {
      return { data: null }
    }
  },

  // Lấy danh sách phòng chờ (vs player)
  getWaitingRooms: async (gameSlug) => {
    const games = await getGamesRaw()
    const game = games.find(g => g.code === gameSlug)
    const params = game ? { game_id: game.id } : {}
    const res = await api.get('/sessions/waiting', { params })
    return { data: res.data.sessions || [] }
  },

  // Tạo phòng chờ (vs player)
  createRoom: async ({ game_slug, board_size }) => {
    const games = await getGamesRaw()
    const game = games.find(g => g.code === game_slug)
    if (!game) throw new Error('Không tìm thấy game')
    const res = await api.post('/sessions', {
      game_id: game.id,
      vs_computer: false,
      board_size: board_size || game.board_size,
    })
    return { data: res.data.sessions }
  },

  // Vào phòng chờ
  joinRoom: async (sessionId) => {
    const res = await api.post(`/sessions/${sessionId}/join`)
    return { data: res.data.session }
  },

  // Lấy thông tin session (polling)
  getSession: async (sessionId) => {
    const res = await api.get(`/sessions/${sessionId}`)
    return { data: res.data.session }
  },

  // Cập nhật board state (vs player)
  updateBoard: async ({ session_id, board_state, move_history }) => {
    if (!session_id) return { data: null }
    try {
      const res = await api.put(`/sessions/${session_id}/board`, {
        board_state, move_history,
      })
      return { data: res.data }
    } catch {
      return { data: null }
    }
  },

  // Bỏ cuộc
  abandonSession: async (sessionId) => {
    if (!sessionId) return
    try { await api.post(`/sessions/${sessionId}/abandon`) } catch {}
  },
}

function getEmoji(code) {
  const map = { caro5: '⬛', caro4: '🔷', tictactoe: '❌', snake: '🐍', match3: '💎', memory: '🧠', drawing: '🎨', draw: '🎨' }
  return map[code] || '🎮'
}

export default gameService
