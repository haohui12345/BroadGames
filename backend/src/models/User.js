const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, searchUsers, getUserById, getRankings, getFriendRankings, getPersonalRankings } = require('../controllers/userController');
const { authenticateToken } = require('../middlewares/auth');

router.use(authenticateToken)

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/search', searchUsers);
router.get('/rankings', getRankings);
router.get('/rankings/friends', getFriendRankings);
router.get('/rankings/personal', getPersonalRankings);
router.get('/:id', getUserById);

module.exports = router;