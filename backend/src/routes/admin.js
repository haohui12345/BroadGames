const express = require('express');
const router = express.Router();
const { getAllUsers, getUserDetail, toggleUserActive, changeUserRole, getStats } = require('../controllers/adminController');
const { authenticateToken } = require('../middlewares/auth');
const { isAdmin } = require('../middlewares/isAdmin');

// Tất cả routes admin đều cần login + role admin
router.use(authenticateToken, isAdmin);

router.get('/stats', authenticateToken, getStats);         
router.get('/users', authenticateToken, getAllUsers);        
router.get('/users/:id', authenticateToken, getUserDetail);      
router.patch('/users/:id/toggle', authenticateToken, toggleUserActive);  
router.patch('/users/:id/role', authenticateToken, changeUserRole);     

module.exports = router;