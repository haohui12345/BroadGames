const express = require('express');
const router = express.Router();
const { getAllAchievements, getMyAchievements, checkAchievements, getUserAchievements } = require('../controllers/achievementController');
const { authenticateToken } = require('../middlewares/auth');

router.use(authenticateToken)

router.get('/', getAllAchievements);
router.get('/me', getMyAchievements);
router.post('/check', checkAchievements); 
router.get('/users/:id', getUserAchievements); 

module.exports = router;