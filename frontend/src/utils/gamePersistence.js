// Helpers that create, save, and restore solo game snapshots via the backend.
import gameService from '@/services/gameService'

export async function ensureSoloSession({ sessionId, setSessionId, gameSlug, boardSize }) {
  if (sessionId) return sessionId

  const response = await gameService.createSession({
    game_slug: gameSlug,
    vs_computer: true,
    board_size: boardSize,
  })

  const nextSessionId = response.data?.id || null
  if (nextSessionId) setSessionId?.(nextSessionId)
  return nextSessionId
}

export async function saveGameSnapshot({
  sessionId,
  setSessionId,
  gameSlug,
  boardSize,
  snapshot,
  moveHistory,
}) {
  const activeSessionId = await ensureSoloSession({
    sessionId,
    setSessionId,
    gameSlug,
    boardSize,
  })

  if (!activeSessionId) return false

  await gameService.saveGame({
    session_id: activeSessionId,
    game_slug: gameSlug,
    state: snapshot,
    move_history: moveHistory,
  })

  return true
}

export async function loadGameSnapshot({ gameSlug, setSessionId }) {
  const response = await gameService.loadSavedGame(gameSlug)
  const save = response.data

  if (!save?.state) return null

  setSessionId?.(save.session_id || null)
  return save.state
}

export async function recordSoloGameResult({
  ensureSession,
  setSessionId,
  recordResult,
  gameSlug,
  userId,
  result,
  winnerSide,
  scoreHost = 0,
  scoreGuest = 0,
  winnerId,
}) {
  const sessionId = await ensureSession?.()
  if (!sessionId) return false

  await recordResult(gameSlug, result, {
    sessionId,
    userId,
    winnerId,
    winnerSide,
    scoreHost,
    scoreGuest,
  })

  setSessionId?.(null)
  return true
}
