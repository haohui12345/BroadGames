
const express = require('express');
const router = express.Router();
const { getAllGames, getGameById, createGame, updateGame, deleteGame, toggleGame, getGameRatings, rateGame } = require('../controllers/gameController');
const { authenticateToken } = require('../middlewares/auth');
const { isAdmin } = require('../middlewares/isAdmin');

//public routes (login)
router.use(authenticateToken);

router.get('/', getAllGames);
router.get('/:id', getGameById);
router.get('/:id/ratings', getGameRatings);
router.post('/:id/ratings', rateGame);

//admin only
router.post('/', isAdmin, createGame);
router.put('/:id', isAdmin, updateGame);
router.patch('/:id/toggle', isAdmin, toggleGame);
router.delete('/:id', isAdmin, deleteGame);


module.exports = router;
