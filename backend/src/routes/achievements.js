const express = require('express');
const router = express.Router();
const { getAllAchievements, getMyAchievements, checkAchievements, getUserAchievements } = require('../controllers/achievementController');
const { authenticateToken } = require('../middlewares/auth');

router.use(authenticateToken)

router.get('/', authenticateToken, getAllAchievements);
router.get('/me', authenticateToken, getMyAchievements);
router.post('/check', authenticateToken, checkAchievements); 
router.get('/users/:id', authenticateToken, getUserAchievements); 

module.exports = router;