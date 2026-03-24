const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, searchUsers, getUserById, getRankings, getFriendRankings }= require('../controllers/userController');
const { authenticateToken } = require('../middlewares/auth');

//tất cả route đều cần login
router.use(authenticateToken)

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/search', searchUsers);
router.get('/rankings', getRankings);
router.get('/rankings/friends', getFriendRankings);
router.get('/:id', getUserById);

module.exports = router;