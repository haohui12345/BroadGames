                                                                                const db = require('../config/db');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const santizie = (user) => {
    const { password, ...rest } = user;
    return rest;
}

// GET /api/users/profile
const getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id)
        if (!user) {
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
const getUserById = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user || !user.is_active) {
            return res.status(400).json({ message: 'Không tìm thấy người dùng'});
        }
        return res.json({ user: santizie(user) });    
    } catch(err){
        next(err);
    }
};

// GET /api/users/rankings?game_slug=caro5
const getRankings = async (req, res, next) => {
    try {
        const { game_slug, limit = 20, page = 1 } = req.query;
        const numLimit = Math.min(Number(limit), 50);
        const offset = (Number(page) - 1) * numLimit;

        let query = db('rankings as r')
            .join('users as u', 'r.user_id', 'u.id')
            .join('games as g', 'r.game_id', 'g.id')
            .where('u.is_active', true)
            .select(
                'u.id as user_id', 'u.username', 'u.full_name', 'u.avatar_url',
                'g.id as game_id', 'g.name as game_name', 'g.code as game_code',
                'r.wins', 'r.losses', 'r.draws', 'r.total_score',
                db.raw(`ROW_NUMBER() OVER (ORDER BY r.total_score DESC) as rank`),
                db.raw(`CASE WHEN u.id = ? THEN true ELSE false END as is_me`, [req.user.id])
            )
            .orderBy('r.total_score', 'desc')
            .limit(numLimit)
            .offset(offset);

        if (game_slug) {
            query = query.where('g.code', game_slug);
        }

        const rankings = await query;
        return res.json({ rankings });
    } catch(err) {
        next(err);
    }
};

// GET /api/users/rankings/friends
const getFriendRankings = async (req, res, next) => {
  try {
    const { game_slug, page = 1, page_size = 20 } = req.query;
    const limit = Math.min(Number(page_size), 50);
    const offset = (Number(page) - 1) * limit;

    const friendIds = await db('friendships')
      .where(function () {
        this.where('requester_id', req.user.id).orWhere('receiver_id', req.user.id);
      })
      .andWhere('status', 'accepted')
      .select(
        db.raw(`CASE WHEN requester_id = ? THEN receiver_id ELSE requester_id END as friend_id`, [req.user.id])
      );

    const ids = [req.user.id, ...friendIds.map(f => f.friend_id)];

    let query = db('rankings as r')
      .join('users as u', 'r.user_id', 'u.id')
      .join('games as g', 'r.game_id', 'g.id')
      .whereIn('r.user_id', ids)
      .where('u.is_active', true)
      .select(
        'u.id as user_id', 'u.username', 'u.full_name', 'u.avatar_url',
        'g.id as game_id', 'g.name as game_name', 'g.code as game_code',
        'r.wins', 'r.losses', 'r.draws', 'r.total_score',
        db.raw(`ROW_NUMBER() OVER (ORDER BY r.total_score DESC) as rank`),
        db.raw(`CASE WHEN u.id = ? THEN true ELSE false END as is_me`, [req.user.id])
      )
      .orderBy('r.total_score', 'desc')
      .limit(limit)
      .offset(offset);

    if (game_slug) query = query.where('g.code', game_slug);

    const rankings = await query;
    const [{ count }] = await db('rankings as r').whereIn('r.user_id', ids).count('* as count');

    return res.json({ rankings, pagination: { page: Number(page), page_size: limit, total: Number(count) } });
  } catch (err) {
    next(err);
  }
};

// GET /api/users/rankings/personal
const getMyRankings = async (req, res, next) => {
  try {
    const { page = 1 } = req.query;
    const limit = 20;
    const offset = (Number(page) - 1) * limit;

    const rankings = await db('rankings as r')
      .join('games as g', 'r.game_id', 'g.id')
      .where('r.user_id', req.user.id)
      .select(
        db.raw(`? as user_id`, [req.user.id]),
        'g.id as game_id', 'g.name as game_name', 'g.code as game_code',
        'r.wins', 'r.losses', 'r.draws', 'r.total_score',
        db.raw(`true as is_me`)
      )
      .orderBy('r.total_score', 'desc')
      .limit(limit)
      .offset(offset);

    const user = await db('users').where({ id: req.user.id }).select('username', 'full_name', 'avatar_url').first();
    const result = rankings.map(r => ({ ...r, username: user.username, full_name: user.full_name, avatar_url: user.avatar_url }));

    return res.json({ rankings: result });
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
    getFriendRankings,
    getMyRankings,
};
