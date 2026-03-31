const db = require('../config/db')

// GET /api/achievements
const getAllAchievements = async (req, res, next) => {
    try {
        const achievements = await db('achievements as a')
            .leftJoin('games as g', 'g.id', 'a.game_id')
            .select('a.id', 'a.code', 'a.name', 'a.description', 'a.icon_url', 'g.id as game_id', 'g.name as game_name')
            .orderBy('a.id')
        return res.json({ achievements })
    } catch(err) { next(err) }
}

// GET /api/achievements/me
const getMyAchievements = async (req, res, next) => {
    try {
        const all = await db('achievements as a')
            .leftJoin('games as g', 'g.id', 'a.game_id')
            .leftJoin('user_achievements as ua', function() {
                this.on('ua.achievement_id', 'a.id')
                    .andOn('ua.user_id', db.raw('?', [req.user.id]))
            })
            .select(
                'a.id', 'a.code', 'a.name', 'a.description', 'a.icon_url',
                'g.id as game_id', 'g.name as game_name',
                'ua.unlocked_at',
                db.raw('(ua.id IS NOT NULL) as is_unlocked')
            )
            .orderBy('a.id')

        // Ép kiểu boolean rõ ràng
        const result = all.map(a => ({ ...a, is_unlocked: Boolean(a.is_unlocked) }))
        return res.json({ achievements: result })
    } catch(err) { next(err) }
}

// GET /api/achievements/users/:id
const getUserAchievements = async (req, res, next) => {
    try {
        const unlocked = await db('user_achievements as ua')
            .join('achievements as a', 'a.id', 'ua.achievement_id')
            .leftJoin('games as g', 'g.id', 'a.game_id')
            .where('ua.user_id', req.params.id)
            .select('a.id', 'a.code', 'a.name', 'a.description', 'a.icon_url', 'g.id as game_id', 'g.name as game_name', 'ua.unlocked_at')
            .orderBy('ua.unlocked_at', 'desc')
        return res.json({ achievements: unlocked })
    } catch(err) { next(err) }
}

// Helper: kiểm tra và mở khóa thành tựu
const checkAndUnlock = async (userId, code) => {
    try {
        const achievement = await db('achievements').where({ code }).first()
        if (!achievement) return

        const existing = await db('user_achievements')
            .where({ user_id: userId, achievement_id: achievement.id })
            .first()
        if (existing) return

        let qualified = false

        switch (code) {
            case 'first_win': {
                const [{ count }] = await db('game_sessions').where('winner_id', userId).count('* as count')
                qualified = Number(count) >= 1
                break
            }
            case 'win_10': {
                const [{ total }] = await db('rankings').where('user_id', userId).sum('wins as total')
                qualified = Number(total) >= 10
                break
            }
            case 'win_50': {
                const [{ total }] = await db('rankings').where('user_id', userId).sum('wins as total')
                qualified = Number(total) >= 50
                break
            }
            case 'caro5_master': {
                const game = await db('games').where({ code: 'caro5' }).first()
                if (!game) break
                const ranking = await db('rankings').where({ user_id: userId, game_id: game.id }).first()
                qualified = ranking && ranking.wins >= 20
                break
            }
            case 'tictactoe_pro': {
                const game = await db('games').where({ code: 'tictactoe' }).first()
                if (!game) break
                const ranking = await db('rankings').where({ user_id: userId, game_id: game.id }).first()
                qualified = ranking && ranking.wins >= 10
                break
            }
            case 'social_butterfly': {
                const [{ count }] = await db('friendships')
                    .where(function() {
                        this.where('requester_id', userId).orWhere('receiver_id', userId)
                    })
                    .andWhere('status', 'accepted')
                    .count('* as count')
                qualified = Number(count) >= 5
                break
            }
            case 'reviewer': {
                const [{ count }] = await db('game_ratings').where('user_id', userId).count('* as count')
                qualified = Number(count) >= 3
                break
            }
            default: break
        }

        if (qualified) {
            await db('user_achievements').insert({ user_id: userId, achievement_id: achievement.id })
            return achievement
        }
    } catch(err) {
        console.error('checkAndUnlock error:', err.message)
    }
}

// POST /api/achievements/check
const checkAchievements = async (req, res, next) => {
    try {
        const codes = ['first_win', 'win_10', 'win_50', 'caro5_master', 'tictactoe_pro', 'social_butterfly', 'reviewer']
        const newlyUnlocked = []
        for (const code of codes) {
            const result = await checkAndUnlock(req.user.id, code)
            if (result) newlyUnlocked.push(result)
        }
        return res.json({
            message: newlyUnlocked.length > 0 ? 'Mở khóa thành tựu mới!' : 'Không có thành tựu mới',
            newly_unlocked: newlyUnlocked,
        })
    } catch(err) { next(err) }
}

module.exports = { getAllAchievements, getMyAchievements, getUserAchievements, checkAchievements, checkAndUnlock }
