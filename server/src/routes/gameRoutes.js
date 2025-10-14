const express = require('express');
const router = express.Router();
const { getGameState, getAllGames } = require('../services/socketService');
//const { GAME_PRESETS } = require('../../../shared/constants');
const { GAME_PRESETS } = require('../../shared/constants');


// Obtener presets disponibles
router.get('/presets', (req, res) => {
  res.json(GAME_PRESETS);
});

// Crear nuevo juego (ahora solo genera ID, config se envía via socket)
router.post('/create', (req, res) => {
  const gameId = `game-${Date.now()}`;
  res.json({ gameId });
});

// Obtener estado de juego
router.get('/:gameId', (req, res) => {
  const game = getGameState(req.params.gameId);
  
  if (!game) {
    return res.status(404).json({ error: 'Juego no encontrado' });
  }
  
  res.json(game);
});

// Listar todos los juegos activos (para admin)
router.get('/', (req, res) => {
  const games = getAllGames();
  res.json(games);
});

module.exports = router;