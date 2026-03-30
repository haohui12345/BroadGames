const jwt = require('jsonwebtoken');
const db = require('./config/db');

/**
 * Mỗi session có 1 room riêng: `session:<session_id>`
 * Events:
 *   Client → Server:
 *     join_session   { sessionId }          – vào room
 *     move           { sessionId, board_state, move_history }  – đi nước
 *     finish_session { sessionId, winner_id, score_host, score_guest }
 *     abandon_session{ sessionId }
 *
 *   Server → Client:
 *     opponent_moved { board_state, move_history, moved_by }
 *     session_finished { winner_id, score_host, score_guest }
 *     session_abandoned { abandoned_by }
 *     error          { message }
 */

module.exports = (io) => {
  // Xác thực JWT khi connect
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Chưa xác thực'));
    try {
      socket.user = jwt.verify(token, process.env.JWT_SECRET);
      next();
    } catch {
      next(new Error('Token không hợp lệ'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user.id;

    // Vào room của session
    socket.on('join_session', async ({ sessionId }) => {
      try {
        const session = await db('game_sessions').where({ id: sessionId }).first();
        if (!session) return socket.emit('error', { message: 'Không tìm thấy phòng' });
        if (session.host_id !== userId && session.guest_id !== userId)
          return socket.emit('error', { message: 'Bạn không thuộc phòng này' });

        socket.join(`session:${sessionId}`);
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // Đi nước – lưu DB rồi broadcast cho người còn lại
    socket.on('move', async ({ sessionId, board_state, move_history }) => {
      try {
        const session = await db('game_sessions').where({ id: sessionId }).first();
        if (!session || session.status !== 'playing')
          return socket.emit('error', { message: 'Phòng không hợp lệ' });
        if (session.host_id !== userId && session.guest_id !== userId)
          return socket.emit('error', { message: 'Bạn không thuộc phòng này' });

        await db('game_sessions').where({ id: sessionId }).update({
          board_state: JSON.stringify(board_state),
          move_history: JSON.stringify(move_history),
        });

        // Gửi cho người còn lại trong room (không gửi lại cho người vừa đi)
        socket.to(`session:${sessionId}`).emit('opponent_moved', {
          board_state,
          move_history,
          moved_by: userId,
        });
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // Kết thúc trận
    socket.on('finish_session', async ({ sessionId, winner_id, score_host = 0, score_guest = 0 }) => {
      try {
        const session = await db('game_sessions').where({ id: sessionId }).first();
        if (!session || session.status !== 'playing')
          return socket.emit('error', { message: 'Phòng không hợp lệ' });
        if (session.host_id !== userId && session.guest_id !== userId)
          return socket.emit('error', { message: 'Bạn không thuộc phòng này' });

        await db('game_sessions').where({ id: sessionId }).update({
          status: 'finished',
          winner_id: winner_id || null,
          score_host,
          score_guest,
          finished_at: db.fn.now(),
        });

        // Cập nhật ranking
        const updateRanking = async (uid, isWinner, isDraw) => {
          const points = isWinner ? 100 : isDraw ? 20 : 0;
          const existing = await db('rankings').where({ user_id: uid, game_id: session.game_id }).first();
          if (existing) {
            await db('rankings').where({ user_id: uid, game_id: session.game_id }).update({
              wins:        existing.wins        + (isWinner ? 1 : 0),
              losses:      existing.losses      + (!isWinner && !isDraw ? 1 : 0),
              draws:       existing.draws       + (isDraw ? 1 : 0),
              total_score: existing.total_score + points,
              updated_at:  db.fn.now(),
            });
          } else {
            await db('rankings').insert({
              user_id: uid, game_id: session.game_id,
              wins:    isWinner ? 1 : 0,
              losses:  !isWinner && !isDraw ? 1 : 0,
              draws:   isDraw ? 1 : 0,
              total_score: points,
            });
          }
        };

        const isDraw = !winner_id;
        await updateRanking(session.host_id, winner_id === session.host_id, isDraw);
        if (session.guest_id) await updateRanking(session.guest_id, winner_id === session.guest_id, isDraw);

        io.to(`session:${sessionId}`).emit('session_finished', { winner_id, score_host, score_guest });
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // Rời phòng
    socket.on('abandon_session', async ({ sessionId }) => {
      try {
        const session = await db('game_sessions').where({ id: sessionId }).first();
        if (!session) return socket.emit('error', { message: 'Không tìm thấy phòng' });
        if (session.host_id !== userId && session.guest_id !== userId)
          return socket.emit('error', { message: 'Bạn không thuộc phòng này' });

        await db('game_sessions').where({ id: sessionId }).update({
          status: 'abandoned',
          finished_at: db.fn.now(),
        });

        io.to(`session:${sessionId}`).emit('session_abandoned', { abandoned_by: userId });
        socket.leave(`session:${sessionId}`);
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });
  });
};
