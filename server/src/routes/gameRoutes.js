const express = require('express');
const router = express.Router();
const { getGameState } = require('../services/socketService');

// Crear nuevo juego
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

module.exports = router;