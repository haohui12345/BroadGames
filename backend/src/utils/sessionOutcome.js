const ACHIEVEMENT_CODES = ['first_win', 'win_10', 'win_50', 'caro5_master', 'tictacto_pro']

function normalizeWinnerSide(session, payload = {}) {
  const winnerSide = payload.winner_side
  if (winnerSide === 'host' || winnerSide === 'guest' || winnerSide === 'draw') {
    return winnerSide
  }

  if (payload.winner_id && payload.winner_id === session.host_id) {
    return 'host'
  }

  if (payload.winner_id && session.guest_id && payload.winner_id === session.guest_id) {
    return 'guest'
  }

  return 'draw'
}

function buildOutcome(session, payload = {}) {
  const winnerSide = normalizeWinnerSide(session, payload)

  return {
    winnerSide,
    winnerId:
      winnerSide === 'host'
        ? session.host_id
        : winnerSide === 'guest'
          ? session.guest_id || null
          : null,
    scoreHost: Number(payload.score_host || 0),
    scoreGuest: Number(payload.score_guest || 0),
    isDraw: winnerSide === 'draw',
  }
}

async function updateRankingEntry(db, { userId, gameId, isWinner, isDraw }) {
  if (!userId) return

  const existing = await db('rankings')
    .where({ user_id: userId, game_id: gameId })
    .first()

  const points = isWinner ? 100 : isDraw ? 20 : 0

  if (existing) {
    await db('rankings')
      .where({ user_id: userId, game_id: gameId })
      .update({
        wins: existing.wins + (isWinner ? 1 : 0),
        losses: existing.losses + (!isWinner && !isDraw ? 1 : 0),
        draws: existing.draws + (isDraw ? 1 : 0),
        total_score: Number(existing.total_score || 0) + points,
        updated_at: db.fn.now(),
      })
    return
  }

  await db('rankings').insert({
    user_id: userId,
    game_id: gameId,
    wins: isWinner ? 1 : 0,
    losses: !isWinner && !isDraw ? 1 : 0,
    draws: isDraw ? 1 : 0,
    total_score: points,
  })
}

async function unlockAchievements(session, onUnlock) {
  if (typeof onUnlock !== 'function') return

  for (const code of ACHIEVEMENT_CODES) {
    await onUnlock(session.host_id, code)
    if (session.guest_id && !session.vs_computer) {
      await onUnlock(session.guest_id, code)
    }
  }
}

async function applySessionOutcome({ db, session, payload, onUnlock }) {
  const outcome = buildOutcome(session, payload)

  await db('game_sessions')
    .where({ id: session.id })
    .update({
      status: 'finished',
      winner_id: outcome.winnerId,
      score_host: outcome.scoreHost,
      score_guest: outcome.scoreGuest,
      finished_at: db.fn.now(),
    })

  await updateRankingEntry(db, {
    userId: session.host_id,
    gameId: session.game_id,
    isWinner: outcome.winnerSide === 'host',
    isDraw: outcome.isDraw,
  })

  if (session.guest_id && !session.vs_computer) {
    await updateRankingEntry(db, {
      userId: session.guest_id,
      gameId: session.game_id,
      isWinner: outcome.winnerSide === 'guest',
      isDraw: outcome.isDraw,
    })
  }

  await unlockAchievements(session, onUnlock)

  return outcome
}

module.exports = {
  applySessionOutcome,
  buildOutcome,
}
