const express = require('express');
const router = express.Router();
const { register, login, getMe, changePassword } = require('../controllers/authController');
const { authenticateToken } = require('../middlewares/auth');

//public routes
router.post('/register', register);
router.post('/login', login);

//protected routes (cần token)
router.get('/me',authenticateToken, getMe);
router.post('/change-password',authenticateToken, changePassword);

module.exports = router;