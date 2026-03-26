const express = require('express');
const router = express.Router();
const { getFriends, getPendingRequests, sendRequest, acceptRequest, declineRequest, removeFriend } = require('../controllers/friendshipsController'); // Import your controller functions
const { authenticateToken } = require('../middlewares/auth'); 

router.use(authenticateToken); 

router.get('/', getFriends);
router.get('/pending', getPendingRequests);
router.post('/request/:id', sendRequest);
router.put('/request/:id/accept', acceptRequest);
router.put('/request/:id/decline', declineRequest);
router.delete('/:id', removeFriend); 

module.exports = router;


