const db = require('../config/db');

// GET /api/admin/users 
// Danh sách tất cả users
const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, q } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = db('users')
      .select('id', 'email', 'username', 'full_name', 'avatar_url', 'role', 'is_active', 'created_at')
      .orderBy('created_at', 'desc')
      .limit(Number(limit))
      .offset(offset);

    if (q) query = query.where('username', 'ilike', `%${q}%`).orWhere('email', 'ilike', `%${q}%`);

    const users = await query;
    const [{ count }] = await db('users').count('* as count');

    return res.json({ users, total: Number(count), page: Number(page) });
  } catch (err) { next(err); }
};

// GET /api/admin/users/:id 
// Chi tiết 1 user
const getUserDetail = async (req, res, next) => {
  try {
    const user = await db('users')
      .where({ id: req.params.id })
      .select('id', 'email', 'username', 'full_name', 'avatar_url', 'role', 'is_active', 'created_at')
      .first();

    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });

    // Thống kê của user đó
    const [{ total_wins }] = await db('rankings')
      .where({ user_id: req.params.id })
      .sum('wins as total_wins');

    const [{ total_games }] = await db('game_sessions')
      .where(function () {
        this.where('host_id', req.params.id).orWhere('guest_id', req.params.id);
      })
      .count('* as total_games');

    return res.json({ user, stats: { total_wins: Number(total_wins) || 0, total_games: Number(total_games) } });
  } catch (err) { next(err); }
};

// PATCH /api/admin/users/:id/toggle 
// Khoá / mở khoá tài khoản
const toggleUserActive = async (req, res, next) => {
  try {
    const user = await db('users').where({ id: req.params.id }).first();
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });

    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Không thể khoá tài khoản admin' });
    }

    await db('users')
      .where({ id: req.params.id })
      .update({ is_active: !user.is_active, updated_at: db.fn.now() });

    return res.json({
      message: `Tài khoản đã được ${!user.is_active ? 'mở khoá' : 'khoá'}`,
      is_active: !user.is_active,
    });
  } catch (err) { next(err); }
};

// PATCH /api/admin/users/:id/role 
// Đổi role user
const changeUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['client', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Role không hợp lệ' });
    }

    const user = await db('users')
      .where({ id: req.params.id })
      .first();
    if (!user) 
      res.status(404).json({ message: 'Không tìm thấy người dùng' });

    await db('users')
      .where({ id: req.params.id })
      .update({ role, updated_at: db.fn.now() });
    return res.json({ message: `Đã đổi role thành ${role}` });
  } catch (err) { 
    next(err); 
  }
};

// GET /api/admin/stats
// Thống kê tổng quan hệ thống
const getStats = async (req, res, next) => {
  try {
    const [[{ total_users }], [{ total_games }], [{ total_sessions }], [{ active_users }]] =
      await Promise.all([
        db('users').count('* as total_users'),
        db('games').count('* as total_games'),
        db('game_sessions').count('* as total_sessions'),
        db('users').where({ is_active: true }).count('* as active_users'),
      ]);

    // Top 5 game được chơi nhiều nhất
    const topGames = await db('game_sessions as s')
      .join('games as g', 'g.id', 's.game_id')
      .groupBy('g.id', 'g.name')
      .select('g.id', 'g.name')
      .count('s.id as total_played')
      .orderBy('total_played', 'desc')
      .limit(5);

    return res.json({
      stats: {
        total_users:    Number(total_users),
        active_users:   Number(active_users),
        total_games:    Number(total_games),
        total_sessions: Number(total_sessions),
      },
      top_games: topGames,
    });
  } catch (err) { next(err); }
};

module.exports = { getAllUsers, getUserDetail, toggleUserActive, changeUserRole, getStats };