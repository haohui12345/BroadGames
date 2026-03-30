const db = require('../config/db');

// POST /api/message/:id
// gửi tin nhắn đến người dùng có id là :id
const sendMessage = async (req, res, next) => {
    try {
        const receiverId = req.params.id;
        const { content } = req.body

        if (!content || !content.trim()) {
            return res.status(400).json({ message: 'Nội dung tin nhắn không được để trống' });
        };

        if (receiverId === req.user.id) {
            return res.status(400).json({ message: 'Bạn không thể gửi tin nhắn cho chính mình' });
        };

        const [message] = await db('messages') 
            .insert({ 
                sender_id: req.user.id,
                receiver_id: receiverId,
                content: content.trim() 
            })
            .returning('*');

        return res.status(201).json({ message: 'Đã gửi tin nhắn', data: message });
    } catch(err) {
        next(err);
    }
};

// GET /api/message
// Inbox: lấy ds cuộc trò chuyện gần nhất
const getInbox = async (req, res, next) => {
    try {
        const inbox = await db.raw(`
            SELECT DISTINCT ON (partner_id)
             partner_id,
             u.username,
             u.full_name,
             u.avatar_url,
             m.content as last_message,
             m.created_at,
             m.is_read,
             m.sender_id
            FROM (
             SELECT
              CASE
               WHEN sender_id = :userId
               THEN receiver_id
               ELSE sender_id
              END as partner_id, id, content, created_at, is_read, sender_id
              FROM messages
              WHERE sender_id = :userId 
              OR receiver_id = :userId
            ) m
            JOIN users u 
            ON u.id = m.partner_id
            ORDER BY partner_id, m.created_at
            DESC
        `, { userId: req.user.id });

        return res.json({ inbox: inbox.rows })
    } catch(err) {
        next(err);
    }
};

// GET /api/messages/:id
// lấy toàn bộ tin nhắn với 1 user
const getConversation = async (req, res, next) => {
    try {
        const partnerId = req.params.id;
        const { page = 1, limit = 10 } = req.query;
        const offset = (Number(page) - 1) * Number(limit);

        const messages = await db('messages')
            .where(function() {
                this.where({ sender_id: req.user.id, receiver_id: partnerId })
                .orWhere({ sender_id: partnerId, receiver_id: req.user.id })
            })
            .orderBy('created_at', 'desc')
            .limit(limit)
            .offset(offset)
            .select('*');
        
       //đánh dấu là đã đọc
       await db('messages')
            .where({ receiver_id: req.user.id, sender_id: partnerId, is_read: false })
            .update({ is_read: true });

        return res.json({ messages});
    } catch(err) {
        next(err);
    }
};

// GET /api/messages/unread/count
// đếm số tin nhắn chưa đọc
const getUnreadCount = async (req, res, next) => {
    try {
        const [{ count }] = await db('messages')
            .where({ receiver_id: req.user.id, is_read: false })
            .count('* as count');

        return res.json({ unread: Number(count) });
    } catch(err) {
        next(err);
    }
};

module.exports = {
    getInbox,
    getConversation,
    getUnreadCount,
    sendMessage
};
