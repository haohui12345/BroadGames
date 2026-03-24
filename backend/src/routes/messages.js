const express = require("express");
const router = express.Router();
const { getInbox, getConversation, sendMessage, getUnreadCount } = require("../controllers/messageController");
const { authenticateToken } = require("../middlewares/auth");

router.use(authenticateToken)

router.get('/', authenticateToken, getInbox);
router.get('/unread/count', authenticateToken, getUnreadCount);
router.get('/:id', authenticateToken, getConversation);
router.post('/:id', authenticateToken, sendMessage);

module.exports = router;