const db = require('../config/db');
const bcrypt = require('bcryptjs'); // Import bcrypt for password hashing
const User = require('../models/User'); // Import the User model

const santizie = (user) => {
    const { password, ...rest } = user;
    return rest;
}

// GET /api/users/profile
// get my profile
const getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id)
        if(!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }
        return res.status(200).json(santizie(user));
    } catch (error) {
        next(error);    
    }
};

// PUT /api/users/profile
const updateProfile = async (req, res, next) => {
    try {
        const { full_name, avatar_url, bio, username } = req.body;
        await User.update(req.user.id, { full_name, avatar_url, bio, username });
        const updated = await User.findById(req.user.id);
        return res.json({ message: 'Cập nhật thông tin thành công', user: santizie(updated) });
    } catch(err) {
        next(err);
    }
};

// GET /api/users/search?q=keyword
// tìm kiếm theo username
const searchUsers = async (req, res, next) => {
    try {
        const { q } = req.query;
        if (!q) return res.status(400).json({ message: 'Thiếu từ khóa tìm kiếm' });
        
        const users = await db('users')
            .where(builder => {
                builder
                    .where('username', 'ilike', `%${q}%`)
                    .orWhere('full_name', 'ilike', `%${q}%`)
            })
            .andWhere('is_active', true)
            .andWhereNot('id', req.user.id)
            .select('id', 'username', 'full_name', 'avatar_url')
            .limit(20);

        return res.json({ users });
    } catch(err) {
        next(err);
    }
}

// GET /api/users/:id 
// xem profile người khác
const getUserById = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if(!user || !user.is_active) {
            return res.status(400).json({ message: 'Không tìm thấy người dùng'});
        }
        return res.json({ user: santizie(user) });    
    } catch(err){
        next(err);
    }
};

// GET /api/users/rankings
// xem ranking toàn hệ thống or theo game
const getRankings = async (req, res, next) => {
    try {
        const { game_id, limit = 20 } = req.query;

        let query = db('rankings as r')
            .join('users as u', 'r.user_id', 'u.id')
            .join('games as g', 'r.game_id', 'g.id')
            .where('u.is_active', true)
            .select(
                'u.id as user_id', 'u.username', 'u.avatar_url',
                'g.id as game_id', 'g.name as game_name',
                'r.wins', 'r.losses', 'r.draws', 'r.total_score'
            )
            .orderBy('r.total_score', 'desc')
            .limit(Number(limit));

        if (game_id) query = query.where('r.game_id', Number(game_id));

        const rankings = await query;
        return res.json({ rankings });
    } catch(err) {
        next(err);
    }
};

// GET /api/users/rankings/friends
// xem ranking chỉ bạn bè
const getFriendRankings = async (req, res, next) => {
  try {
    const { game_id, page = 1, page_size = 20 } = req.query;

    const limit = Math.min(Number(page_size), 50);
    const offset = (Number(page) - 1) * limit;

    // 1. Lấy danh sách bạn bè
    const friendIds = await db('friendships')
      .where(function () {
        this.where('requester_id', req.user.id)
            .orWhere('receiver_id', req.user.id);
      })
      .andWhere('status', 'accepted')
      .select(
        db.raw(`
          CASE 
            WHEN requester_id = ? THEN receiver_id 
            ELSE requester_id 
          END as friend_id
        `, [req.user.id])
      );

    const ids = [req.user.id, ...friendIds.map(f => f.friend_id)];

    // 2. Query ranking
    let query = db('rankings as r')
      .join('users as u', 'r.user_id', 'u.id')
      .join('games as g', 'r.game_id', 'g.id')
      .whereIn('r.user_id', ids)
      .where('u.is_active', true)
      .select(
        'u.id as user_id',
        'u.username',
        'u.avatar_url',
        'g.id as game_id',
        'g.name as game_name',
        'r.wins',
        'r.losses',
        'r.draws',
        'r.total_score',

        // rank
        db.raw(`ROW_NUMBER() OVER (ORDER BY r.total_score DESC) as rank`),

        // highlight
        db.raw(`CASE WHEN u.id = ? THEN true ELSE false END as is_me`, [req.user.id])
      )
      .orderBy('r.total_score', 'desc')
      .limit(limit)
      .offset(offset);

    if (game_id) {
      query = query.where('r.game_id', Number(game_id));
    }

    const rankings = await query;

    // 3. count tổng
    const [{ count }] = await db('rankings as r')
      .whereIn('r.user_id', ids)
      .count('* as count');

    return res.json({
      rankings,
      pagination: {
        page: Number(page),
        page_size: limit,
        total: Number(count)
      }
    });

  } catch (err) {
    next(err);
  }
};

module.exports = {
    getProfile,
    updateProfile,
    searchUsers,
    getUserById,
    getRankings,
    getFriendRankings
};
