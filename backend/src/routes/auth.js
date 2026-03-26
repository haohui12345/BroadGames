const express = require('express');
const router = express.Router();
const { register, login, getMe, changePassword } = require('../controllers/authController');
const { authenticateToken } = require('../middlewares/auth');

//public routes
router.post('/register', register);
router.post('/login', login);

//protected routes (cần token)
router.get('/me', getMe);
router.post('/change-password', changePassword);

module.exports = router;