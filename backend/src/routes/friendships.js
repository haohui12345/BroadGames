const express = require('express');
const router = express.Router();
const { getFriends, getPendingRequests, sendRequest, acceptRequest, declineRequest, removeFriend } = require('../controllers/friendshipsController'); // Import your controller functions
const { authenticateToken } = require('../middlewares/auth'); // Import your authentication middleware

router.use(authenticateToken); // Apply authentication middleware to all routes in this router

router.get('/', authenticateToken, getFriends);
router.get('/pending', authenticateToken, getPendingRequests);
router.post('/request/:id', authenticateToken, sendRequest);
router.put('/request/:id/accept', authenticateToken, acceptRequest);
router.put('/request/:id/decline', authenticateToken, declineRequest);
router.delete('/:id', authenticateToken, removeFriend); 

module.exports = router;


