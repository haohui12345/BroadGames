const db = require('../config/db');
const Game = require('../models/Game');
const { checkAndUnlock } = require('./achievementController');

// GET /api/games
// lấy ds game (client chỉ thấy game đang active)
const getAllGames = async (req, res, next) => {
    try {
        const isAdmin = req.user.role === 'admin';
        const games = await Game.findAll(!isAdmin);
        return res.json({ games });
    } catch(err) { 
        next(err); 
    }
};

// GET /api/games/:id
const getGameById = async (req, res, next) => {
    try {
        const game = await Game.findById(req.params.id)
        if (!game) return res.status(400).json({ message: 'Không tìm thấy game'});
        return res.json({ game });
    } catch(err) {
        next(err);
    }
};

// GET /api/games/:id/ratings
// lấy ds rating + cmt của game
const getGameRatings = async (req, res, next) => {
    try {
        const ratings = await db('game_ratings as r')
            .join('users as u', 'u.id', 'r.user_id')
            .where('r.game_id', req.params.id)
            .select('u.username', 'u.avatar_url', 'r.rating', 'r.comment', 'r.created_at')
            .orderBy('r.created_at', 'desc');

        return res.json({ ratings });
    } catch (err) {
        next(err);
    }
};

// POST /api/games/:id/ratings
// rating game (mỗi user chỉ rate 1 lần)
const rateGame = async (req, res, next) => {
    try {
        const { rating, comment } = req.body;
        const game_id = Number(req.params.id);
        const user_id = req.user.id;
        const ratingNum = Number(rating);

        if (!ratingNum || ratingNum < 1 || ratingNum > 5) {
            return res.status(400).json({ message: 'Rating phải từ 1 -> 5'});
        }

        const game = await Game.findById(game_id);
        if (!game) return res.status(400).json({ message: 'Không tìm thấy game'});

        // nếu đã rating thì update, chưa thì insert
        const existing = await db('game_ratings')
           .where({ user_id: req.user.id, game_id})
           .first();

        if (existing) {
            await db('game_ratings')
                .where({ user_id, game_id})
                .update({ 
                    rating: ratingNum,
                    comment, 
                    updated_at: new Date()});
            return res.json({ message: 'Cập nhật thành công' });
        }

        await db('game_ratings').insert({ 
            user_id: req.user.id, 
            game_id, 
            rating: ratingNum,
            comment 
        });

        // kiểm tra achievement
        await checkAndUnlock(user_id, 'reviewer');

        return res.status(201).json({ message: 'Đánh giá thành công'});
    } catch(err) {
        next(err);
    }
};

// ------ADMIN-------
// POST /api/games/:id
const createGame = async (req, res, next) => {
    try {
        const {
            name,
            description,
            code,
            rules,
            board_size,
            min_players,
            max_players,
        } = req.body;

        if (!code || !name) 
            return res.status(400).json({ message: 'Chưa nhập code và tên game' });
        
        const [game] = await Game.create({ 
            code,
            name,
            description,
            rules,
            board_size,
            min_players,
            max_players,
        });
        return res.status(201).json({ message: 'Tạo game thành công', game });
    } catch(err) {
        next(err);
    }
};

// PUT /api/games/:id
const updateGame = async (req, res, next) => {
    try {
        const { 
            code, 
            name, 
            description, 
            rules, 
            board_size, 
            min_players, 
            max_players,
            is_enabled
        } = req.body;

        await Game.update(
            req.params.id, {
                code,
                name, 
                description,
                rules,
                board_size,
                min_players,
                max_players,
                is_enabled
            }
        );
        const game = await Game.findById(req.params.id);
        return res.json({ message: 'Cập nhật thành công', game })
    } catch(err) {
        next(err);
    }
};

// PATCH /api/games/:id/toggle
// enable/disable game
const toggleGame = async (req, res, next) => {
    try {
        const game = await Game.findById(req.params.id);
        if (!game) return res.status(404).json({ message: 'Không tìm thấy game' });

        await Game.update(req.params.id, {
            is_enabled: !game.is_enabled
        });
        return res.json({
            message: `Game đã được ${!game.is_enabled ? 'bật' : 'tắt'}`,
            is_enabled: !game.is_enabled
        });
    } catch(err) {
        next(err);
    }
}


// DELETE /api/games/:id
const deleteGame = async (req, res, next) => {
    try {
        const game = await Game.findById(req.params.id)
        if (!game) return res.status(404).json({ message: 'Không tìm thấy game'});
    
    await Game.delete(req.params.id)
    return res.json({ message: 'Xóa game thành công'});
    } catch(err) {
        next(err);
    }
};

module.exports = {
    getAllGames,
    getGameById,
    createGame,
    updateGame,
    deleteGame,
    toggleGame,
    rateGame,
    getGameRatings
}