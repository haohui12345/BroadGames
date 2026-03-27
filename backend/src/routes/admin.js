const express = require('express');
const router = express.Router();
const { toggleGame, getAllUsers, getUserDetail, toggleUserActive, changeUserRole, getStats } = require('../controllers/adminController');
const { authenticateToken } = require('../middlewares/auth');
const { isAdmin } = require('../middlewares/isAdmin');

// Tất cả routes admin đều cần login + role admin
router.use(authenticateToken, isAdmin);
router.get('/stats', getStats);         
router.get('/users', getAllUsers);        
router.get('/users/:id', getUserDetail);      
router.patch('/users/:id/toggle', toggleUserActive);  
router.patch('/users/:id/role', changeUserRole);     

module.exports = router;