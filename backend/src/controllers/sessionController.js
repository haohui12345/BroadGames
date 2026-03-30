const db = require('../config/db')
const { checkAndUnlock } = require('./achievementController');

// POST /api/sessions
// tạo phòng
const createSession = async (req, res, next) => {
    try {
        const { game_id, vs_computer = false, board_size } = req.body;

        if (!game_id || !board_size) 
            return res.status(400).json({ message: 'Bắt buộc nhập game ID và kích thước bàn cờ' });

        const game = await db('games')
            .where({ id: game_id })
            .first();
        if (!game) return res.status(400).json({ message: 'Không tìm thấy game' });

        const [sessions] = await db('game_sessions')
            .insert({
                game_id,
                host_id: req.user.id,
                vs_computer,
                board_size: board_size || game.board_size,
                status: vs_computer ? 'playing' : 'waiting',
                board_state: JSON.stringify([]),
                move_history: JSON.stringify([])
            })
            .returning('*');
        
            return res.status(200).json({ message: 'Tạo phòng thành công', sessions });
    } catch(err) {
        next(err);
    }
};


// POST /api/sessions/:id/join
// vào phòng chờ
const joinSession = async (req, res, next) => {
    try {
        const session = await db('game_sessions')
            .where({ id: req.params.id })
            .first()
        
        if (!session) 
            return res.status(404).json({ message: 'Không tìm thấy phòng' });
        if (session.status !== 'waiting')
            return res.status(400).json({ message: 'Phòng đã bắt đầu' });
        if (session.host_id === req.user.id)
            return res.status(400).json({ message: 'Bạn đang là chủ phòng' });

        await db('game_sessions') 
            .where({ id: req.params.id })
            .update({
                guest_id: req.user.id,
                status: 'playing',
                started_at: db.fn.now()
            });

        const updated = await db('game_sessions') 
            .where({ id: req.params.id })
            .first();
        return res.status(200).json({ message: 'Bạn đã vào phòng thành công', session: updated});
    } catch(err) {
        next(err);
    }
};

// GET /api/sessions/waiting
// danh sách phòng chờ
const getWaitingSession = async (req, res, next) => {
    try {
        const { game_id } = req.query;

        let query = db('game_sessions as s')
            .join('users as u', 'u.id', 's.host_id')
            .join('games as g', 'g.id', 's.game_id')
            .where('s.status', 'waiting')
            .where('s.vs_computer', false)
            .select(
                's.id', 's.board_size', 's.created_at',
                'u.id as host_id', 'u.username as host_username', 'u.avatar_url as host_avatar',
                'g.id as game_id', 'g.name as game_name' 
            )
            .orderBy('s.created_at', 'desc');

        if (game_id) query = query.where('s.game_id', game_id);
        
        const sessions = await query;
        return res.json({ sessions })
    } catch(err) {
        next(err);
    }
};

// GET /api/sessions/:id
// chi tiết phòng
const getSession = async (req, res, next) => {
    try {
        const session = await db('game_sessions as s')
            .join('games as g', 'g.id', 's.game_id')
            .leftJoin('users as host', 'host.id', 's.host_id')
            .leftJoin('users as guest', 'guest.id', 's.guest_id')
            .where('s.id', req.params.id)
            .select(
                's.*',
                'g.name as game_name',
                'g.code as game_code',
                'host.username as host_name',
                'host.avatar_url as host_avatar',
                'guest.username as guest_name',
                'guest.avatar_url as guest_avatar'
            )
            .first();

        if (!session) return res.status(404).json({ message: 'Phòng không tồn tại' });

        return res.json({ session });
    } catch(err) { 
        next(err) 
    }
};

// PUT /api/sessions/:id/board
// cập nhật bàn cờ
const updateBoard = async (req, res, next) => {
    try {
        const { board_state, move_history } = req.body;
        const session = await db('game_sessions') 
            .where({ id: req.params.id })
            .first();
        
        if (!session) return res.status(404).json({ message: 'Phòng không tồn tại' });
        if (session.status !== 'playing') return res.status(400).json({ message: 'Phòng không ở trạng thái chơi' })
        if (session.host_id !== req.user.id && session.guest_id !== req.user.id) { 
            return res.status(403).json({ message: 'Bạn không có quyền cập nhật bàn cờ' })
        };
        
        await db('game_sessions') 
            .where({ id: req.params.id })
            .update({ 
                board_state: JSON.stringify(board_state),
                move_history: JSON.stringify(move_history)
            });
        
        return res.status(200).json({ message: 'Cập nhật bàn cờ thành công' })
    } catch(err) {
        next(err);
    }
};

// POST /api/sessions/:id/finish
// end game and update ranking
const finishSession = async (req, res, next) => {
    try {
        const { winner_id, score_host = 0, score_guest = 0 } = req.body;
        const session = await db('game_sessions')
            .where({ id: req.params.id })
            .first();

        if (!session) 
            return res.status(404).json({ message: 'Phòng không tồn tại' });
        if (session.status !== 'playing')
            return res.status(400).json({ message: 'Phòng không ở trạng thái chơi' })
        if (session.host_id !== req.user.id && session.guest_id !== req.user.id) {
            return res.status(403).json({ message: 'Bạn không có quyền kết thúc phòng' })
        }
        
        await db('game_sessions')
            .where({ id: req.params.id })
            .update({
                status: 'finished',
                winner_id: winner_id || null,
                score_host,
                score_guest,
                finished_at: db.fn.now(),
            });

        // update ranking
        const updateRanking = async (userId, isWinner, isDraw) => {
            const existing = await db('rankings')
                .where({ user_id: userId, game_id: session.game_id })
                .first();

            const points = isWinner ? 100 : isDraw ? 20 : 0;

            if (existing) {
                await db('rankings')
                    .update({
                       wins: existing.wins + (isWinner ? 1 : 0),
                       losses: existing.losses + (!isWinner && !isDraw ? 1 : 0),
                       draws: existing.draws + (isDraw ? 1 : 0),
                       total_score: existing.total_score + points,
                       updated_at: db.fn.now(),
                    });
            } else {
                await db('rankings')
                    .insert({
                        user_id: userId,
                        game_id: session.game_id,
                        wins: isWinner ? 1 : 0,
                        losses: !isWinner && !isDraw ? 1 : 0,
                        draws: isDraw ? 1 : 0,
                        total_score: points,
                });
            }
        };

        const isDraw = !winner_id;
        await updateRanking(session.host_id, winner_id === session.host_id, isDraw);
        if (session.guest_id && !session.vs_computer) {
            await updateRanking(session.guest_id, winner_id === session.guest_id, isDraw);
        };

        const achievementCodes = ['first_win', 'win_10', 'win_50', 'caro5_master', 'tictacto_pro'];
        for (const code of achievementCodes) {
            await checkAndUnlock(session.host_id, code);
            if (session.guest_id && !session.vs_computer) {
                await checkAndUnlock(session.guest_id, code);
            }
        };

        return res.json({ message: 'Game đã kết thúc!' });
    } catch(err) {
        next(err);
    }
};

// POST /api/sessions/:id/save
// save game
const saveSession = async (req, res, next) => {
    try {
        const { save_name, board_state, move_history } = req.body;
        const session = await db('game_sessions')
            .where({ id: req.params.id })
            .first();

        if (!session) 
            return res.status(404).json({ message: 'Không tìm thấy phòng chơi'});
        if (session.host_id !== req.user.id && session.guest_id !== req.user.id) {
            return res.status(403).json({ message: 'Bạn không có quyền lưu game này' });
        }

        const [save] = await db('game_saves')
            .insert({
                session_id: req.params.id,
                user_id: req.user.id,
                save_name: save_name || `Save ${new Date().toLocaleString('vi-VN')}`,
                board_state: JSON.stringify(board_state),
                move_history: JSON.stringify(move_history)
            })
            .returning('*');
        
        return res.status(201).json({ message: 'Lưu game thành công!'});
    } catch(err) {
        next(err);
    }
};

// GET /api/sessions/:id/saves
// list of saved games by the user
const getSave = async (req, res, next) => {
    try {
        const saves = await db('game_saves as gs')
            .join('game_sessions as s', 's.id', 'gs.session_id' )
            .join('games as g', 'g.id', 's.game_id')
            .where('gs.user_id', req.user.id)
            .select(
                'gs.id', 'gs.save_name', 'gs.board_state', 'gs.move_history', 'gs.saved_at',
                'g.id as game_id', 'g.name as game_name', 'g.code as game_code',
                's.id as session_id', 's.board_size'
            )
            .orderBy('gs.saved_at', 'desc');
        
        return res.json({ saves });
    } catch(err) {
        next(err);
    }
};

// POST /api/sessions/:id/abandon
// leave
const abandonSession = async (req, res, next) => {
    try {
        const session = await db('game_sessions')
            .where({ id: req.params.id })
            .first();
        
        if (!session)
            return res.status(404).json({ message: 'Không tìm thấy phòng chơi'});

        if (session.host_id !== req.user.id && session.guest_id !== req.user.id) {
            return res.status(403).json({ message: 'Bạn không có quyền rời phòng chơi này' });
        }

        await db('game_sessions')
            .where({ id: req.params.id })
            .update({
                status: 'abandoned',
                finished_at: db.fn.now(),
            });

        return res.json({ message: 'Rời phòng chơi thành công' });
    } catch(err) {
        next(err);
    }
};

// GET /api/sessions/history
// list of game sessions by the user
const getHistory = async (req, res, next) => {
  try {
    const { game_id, limit = 20 } = req.query;
 
    let query = db('game_sessions as s')
      .join('games as g', 'g.id', 's.game_id')
      .leftJoin('users as host', 'host.id', 's.host_id')
      .leftJoin('users as guest', 'guest.id', 's.guest_id')
      .where(function () {
        this.where('s.host_id', req.user.id)
            .orWhere('s.guest_id', req.user.id);
      })
      .whereIn('s.status', ['finished', 'abandoned'])
      .select(
        's.id', 's.status', 's.score_host', 's.score_guest',
        's.started_at', 's.finished_at', 's.vs_computer',
        'g.name as game_name', 'g.code as game_code',
        'host.username as host_username',
        'guest.username as guest_username',
        db.raw(`CASE WHEN s.winner_id = ? THEN true ELSE false END as is_winner`, [req.user.id])
      )
      .orderBy('s.finished_at', 'desc')
      .limit(Number(limit));
 
    if (game_id) query = query.where('s.game_id', game_id);
 
    const history = await query;
    return res.json({ history });
  } catch (err) { next(err); }
};

// GET /api/sessions/:id/scores
// xem số điểm của 1 session - guest or host mới xem được
const getSessionScores = async (req, res, next) => {
    try {
        const session = await db('game_sessions as s')
            .join('games as g', 'g.id', 's.game_id')
            .leftJoin('users as host', 'host.id', 's.host_id')
            .leftJoin('users as guest', 'guest.id', 's.guest_id')
            .where('s.id', req.params.id)
            .select(
                's.id as session_id',
                's.status',
                's.vs_computer',
                's.winner_id',
                's.score_host',
                's.score_guest',
                's.started_at',
                's.finished_at',
                'g.id as game_id',
                'g.name as game_name',
                'host_id as host_id',
                'host.username as host_username',
                'host.avatar_url as host_avatar_url',
                'guest_id as guest_id',
                'guest.username as guest_username',
                'guest.avatar_url as guest_avatar_url'
            )
            .first();

        if (!session) {
            return res.status(404).json({ message: 'Không tìm thấy trận đấu' });
        };

        if (session.host_id != req.user.id && session.guest_id != req.user.id) {
            return res.status(403).json({ message: 'Bạn không có quyền xem điểm của trận đấu này' })
        };

        return res.json({ 
            session_id: session.session_id,
            game: { id: session.game_id, name: session.game_name },
            status: session.status,
            winner_id: session.winner_id,
            started_at: session.started_at,
            finished_at: session.finished_at,
            players: {
                host: {
                    id: session.host_id,
                    username: session.host_username,
                    avatar_url: session.host_avatar_url,
                    score: session.score_host
                },
                guest: session.vs_computer
                    ? { id: null, username: 'Computer', avatar_url: null, score: session.score_guest }
                    : {
                        id: session.guest_id,
                        username: session.guest_username,
                        avatar_url: session.guest_avatar_url,
                        score: session.score_guest
                    },
            },
        });
    } catch(err) {
        next(err);
    }
};
 
module.exports = {
  createSession, joinSession, getWaitingSession, getSession, getSessionScores,
  updateBoard, finishSession, saveSession, getSave, abandonSession, getHistory,
};
