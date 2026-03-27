
const express = require('express');
const router = express.Router();
const { getSessionScores, getWaitingSession, getSave, getHistory, createSession, getSession, joinSession, updateBoard, finishSession, saveSession, abandonSession } = require('../controllers/sessionController');
const {  authenticateToken } = require('../middlewares/auth')

router.use(authenticateToken)

router.get('/waiting', getWaitingSession);
router.get('/saves', getSave);
router.get('/history', getHistory);

router.post('/', createSession);
router.get('/:id', getSession);
router.post('/:id/join', joinSession);
router.put('/:id/board', updateBoard);
router.post('/:id/finish', finishSession);
router.post('/:id/save', saveSession);
router.post('/:id/abandon', abandonSession);
router.get('/:id/scores', getSessionScores);

module.exports = router;
