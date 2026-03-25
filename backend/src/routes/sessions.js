
const express = require('express');
const router = express.Router();
const { getWaitingSession, getSave, getHistory, createSession, getSession, joinSession, updateBoard, finishSession, saveSession, abandonSession } = require('../controllers/sessionController');
const {  authenticateToken } = require('../middlewares/auth')

router.use(authenticateToken)

router.get('/waiting', authenticateToken, getWaitingSession);
router.get('/saves', authenticateToken, getSave);
router.get('/history', authenticateToken, getHistory);

router.post('/', authenticateToken, createSession);
router.get('/:id', authenticateToken, getSession);
router.post('/:id/join', authenticateToken, joinSession);
router.put('/:id/board', authenticateToken, updateBoard);
router.post('/:id/finish', authenticateToken, finishSession);
router.post('/:id/save', authenticateToken, saveSession);
router.post('/:id/abandon', authenticateToken, abandonSession);

module.exports = router;
