const express = require("express");
const router = express.Router();
const { getInbox, getConversation, sendMessage, getUnreadCount } = require("../controllers/messageController");
const { authenticateToken } = require("../middlewares/auth");

router.use(authenticateToken)

router.get('/', getInbox);
router.get('/unread/count', getUnreadCount);
router.get('/:id', getConversation);
router.post('/:id', sendMessage);

module.exports = router;