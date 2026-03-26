const db = require('../config/db');
const { checkAndUnlock } = require('./achievementController');

// POST /api/friends/request/:id
// gửi lời mời kết bạn
const sendRequest = async (req, res, next) => {
    try {
        const receiverId = req.params.id;

        if (receiverId == req.user.id) {
            return res.status(400).json({ message: 'Bạn không thể kết bạn với chính mình' });
        };

        // check đã tồn tại friendship chưa
        const existing = await db('friendships')
            .where(function() {
                this.where({ requester_id: req.user.id, receiver_id: receiverId })
                .orWhere({ requester_id: receiverId, receiver_id: req.user.id })
            })
            .first();

        if (existing) {
            const mag = {
                pending: 'Lời mời kết bạn đã được gửi trước đó',
                accepted: 'Hai bạn đã là bạn bè',
                blocked: 'Không thể thực hiện hành động này'
            };
            return res.status(400).json({ message: mag[existing.status] });
        }

        await db('friendships')
            .insert({
                requester_id: req.user.id,
                receiver_id: receiverId,
            });
        return res.status(201).json({ message: 'Lời mời kết bạn đã được gửi' });
    } catch(err) {
        next(err);
    }
};

// PUT /api/friends/request/:id/accept
// chấp nhận lời mời
const acceptRequest = async (req, res, next) => {
    try {
        const requesterId = req.params.id;

        const friendship = await db('friendships')
            .where({ requester_id: requesterId, receiver_id: req.user.id, status: 'pending' })
            .first();

        if (!friendship) {
            return res.status(404).json({ message: 'Không tìm thấy lời mời kết bạn' });
        };

        await db('friendships')
            .where({ id: friendship.id })
            .update({ status: 'accepted', updated_at: db.fn.now() });

        // kiểm tra achievement
        await checkAndUnlock(req.user.id, 'social_butterfly');
        await checkAndUnlock(requesterId, 'social_butterfly');

        return res.json({ message: 'Đã chấp nhận lời mời kết bạn'})
    } catch(err) {
        next(err);
    }
};

// PUT /api/friends/request/:id/decline
// từ chối lời mời
const declineRequest = async (req, res, next) => {
    try {
        const requesterId = req.params.id;

        const deleted = await db('friendships')
            .where({ requester_id: requesterId, receiver_id: req.user.id, status :'pending' })
            .del();
            
        if (!deleted) {
            return res.status(404).json({ message: 'Không tìm thấy lời mời kết bạn' });
        };

        return res.status(200).json({ message: 'Lời mời kết bạn đã bị từ chối' });
    } catch(err) {
        next(err);
    }
};

// DELETE /api/friends/:id
// hủy kết bạn
const removeFriend = async (req, res, next) => {
    try {
        const friendId = req.params.id;

        const deleted = await db('friendships')
            .where(function() {
                this.where({ requester_id: req.user.id, receiver_id: friendId })
                .orWhere({ requester_id: friendId, receiver_id: req.user.id })
            })
            .andWhere('status', 'accepted')
            .del();
           
        if (!deleted) {
            return res.status(404).json({ message: 'Không tìm thấy bạn bè' });
        }
        
        return res.status(200).json({ message: 'Đã hủy kết bạn' });
    } catch(err) {
        next(err);
    }
};

// GET /api/friends
// danh sách bạn bè
const getFriends = async (req, res, next) => {
    try {
        const friends = await db('friendships as f')
            .join('users as u', function() {
                this.on(db.raw(
                    `CASE
                        WHEN f.requester_id = ?
                        THEN f.receiver_id
                        ELSE f.requester_id
                    END = u.id`,
                    [req.user.id]))
            })
            .where(function() {
                this.where('f.requester_id', req.user.id)
                .orWhere('f.receiver_id', req.user.id)
            })
            .andWhere('f.status', 'accepted')
            .select(    
                'u.id', 
                'u.username', 
                'u.full_name', 
                'u.avatar_url', 
                'f.created_at as friend_since'
            )
            
        return res.status(200).json({ friends });
    } catch(err) {
        next(err);
    }
};

// GET /api/friends/pending
// danh sách lời mời kết bạn đang chờ
const getPendingRequests = async (req, res, next) => {
    try {
        const requests = await db('friendships as f')
            .join('users as u', 'u.id', 'f.requester_id')
            .where({
                'f.receiver_id': req.user.id, 
                'f.status': 'pending '})
            .select(
                'u.id', 
                'u.username', 
                'u.full_name', 
                'u.avatar_url', 
                'f.created_at'
            );

        return res.status(200).json({ requests });
    } catch(err) {
        next(err);
    }
};

module.exports = {
    sendRequest,
    acceptRequest,
    declineRequest,
    removeFriend,
    getFriends,
    getPendingRequests
}
