const { DEFAULT_GAME_CONFIG } = require('../../../shared/constants');
const { generateShortId, isValidGameId } = require('../../../shared/utils');

let io;
const games = new Map();
const gameTimers = new Map(); // Para manejar timeouts

function initializeSocketService(socketIo) {
  io = socketIo;

  io.on('connection', (socket) => {
    console.log('🔌 Cliente conectado:', socket.id);

    // Crear juego con configuración personalizada
    socket.on('game:create', ({ config = {}, createdBy = 'anonymous' }) => {
      //const gameId = `game-${Date.now()}`;
      let gameId;
      let attempts = 0;
      
      do {
        gameId = generateShortId();
        attempts++;
      } while (games.has(gameId) && attempts < 10);
      
      if (attempts >= 10) {
        socket.emit('error', { message: 'No se pudo generar un ID único' });
        return;
      }
      
      
      // Merge configuración personalizada con defaults
      const gameConfig = {
        ...DEFAULT_GAME_CONFIG,
        ...config,
      };

      const newGame = {
        id: gameId,
        status: 'waiting',
        config: gameConfig,
        teams: {
          teamA: { 
            id: 'teamA', 
            name: 'Equipo Rojo', 
            color: '#FF6B6B',
            players: [], 
            totalTaps: 0, 
            position: 0 
          },
          teamB: { 
            id: 'teamB', 
            name: 'Equipo Azul', 
            color: '#4ECDC4',
            players: [], 
            totalTaps: 0, 
            position: 0 
          },
        },
        startTime: null,
        endTime: null,
        winner: null,
        createdBy,
      };

      games.set(gameId, newGame);
      socket.emit('game:created', { gameId, game: newGame });
      
      console.log(`🎮 Juego ${gameId} creado con config:`, gameConfig);
    });

    // Unirse a un juego
    socket.on('game:join', async ({ gameId, playerId, teamId }) => {
      try {

        gameId = gameId.toUpperCase().replace(/[^A-Z0-9]/g, ''); 
        if (!isValidGameId(gameId)) {
          socket.emit('error', { message: 'ID de juego inválido' });
          return;
        }
           
        socket.join(gameId);
        
        const game = games.get(gameId);
        
        if (!game) {
          socket.emit('error', { message: 'Juego no encontrado' });
          return;
        }

        if (!game.teams[teamId].players.includes(playerId)) {
          game.teams[teamId].players.push(playerId);
        }

        io.to(gameId).emit('game:update', game);
        
        console.log(`👤 Jugador ${playerId} se unió al ${teamId} en juego ${gameId}`);
      } catch (error) {
        socket.emit('error', { message: 'Error al unirse al juego' });
      }
    });

    // Manejar tap del jugador
    socket.on('player:tap', ({ gameId, teamId }) => {
      const game = games.get(gameId);
      
      if (!game || game.status !== 'active') {
        return;
      }

      const tapPower = game.config.TAP_POWER || 1;

      // Incrementar taps y posición
      game.teams[teamId].totalTaps += 1;
      game.teams[teamId].position += tapPower;

      // Verificar si hay ganador por distancia
      const trackLength = game.config.TRACK_LENGTH || 1000;
      if (game.teams[teamId].position >= trackLength) {
        endGame(gameId, teamId, 'distance');
        return;
      }

      // Broadcast actualización
      io.to(gameId).emit('game:update', game);
    });

    // Admin: Iniciar juego
    socket.on('admin:start', ({ gameId }) => {
      const game = games.get(gameId);
      
      if (!game) {
        socket.emit('error', { message: 'Juego no encontrado' });
        return;
      }

      if (game.status !== 'waiting') {
        socket.emit('error', { message: 'El juego ya ha iniciado' });
        return;
      }

      game.status = 'active';
      game.startTime = Date.now();
      
      // Si hay duración configurada, iniciar timer
      if (game.config.GAME_DURATION_MS) {
        const timer = setTimeout(() => {
          endGameByTime(gameId);
        }, game.config.GAME_DURATION_MS);
        
        gameTimers.set(gameId, timer);
      }
      
      io.to(gameId).emit('game:update', game);
      io.to(gameId).emit('game:started');
      
      console.log(`🏁 Juego ${gameId} iniciado`);
    });

    // Admin: Finalizar juego manualmente
    socket.on('admin:end', ({ gameId }) => {
      endGame(gameId, null, 'manual');
    });

    // Obtener configuración del juego
    socket.on('game:getConfig', ({ gameId }) => {
      const game = games.get(gameId);
      
      if (!game) {
        socket.emit('error', { message: 'Juego no encontrado' });
        return;
      }
      
      socket.emit('game:config', { 
        gameId, 
        config: game.config 
      });
    });

    socket.on('disconnect', () => {
      console.log('🔌 Cliente desconectado:', socket.id);
    });
  });
}

function endGame(gameId, winnerTeamId = null, reason = 'unknown') {
  const game = games.get(gameId);
  
  if (!game) return;

  // Limpiar timer si existe
  if (gameTimers.has(gameId)) {
    clearTimeout(gameTimers.get(gameId));
    gameTimers.delete(gameId);
  }

  game.status = 'finished';
  game.endTime = Date.now();
  
  // Determinar ganador
  if (!winnerTeamId) {
    winnerTeamId = game.teams.teamA.position > game.teams.teamB.position 
      ? 'teamA' 
      : 'teamB';
  }
  
  game.winner = winnerTeamId;
  
  io.to(gameId).emit('game:update', game);
  io.to(gameId).emit('game:ended', { 
    winner: winnerTeamId,
    reason,
    finalStats: {
      teamA: {
        position: game.teams.teamA.position,
        taps: game.teams.teamA.totalTaps,
        players: game.teams.teamA.players.length,
      },
      teamB: {
        position: game.teams.teamB.position,
        taps: game.teams.teamB.totalTaps,
        players: game.teams.teamB.players.length,
      },
    },
  });
  
  console.log(`🏁 Juego ${gameId} finalizado. Razón: ${reason}. Ganador: ${game.teams[winnerTeamId].name}`);
}

function endGameByTime(gameId) {
  endGame(gameId, null, 'timeout');
}

function getGameState(gameId) {
  return games.get(gameId);
}

function getAllGames() {
  return Array.from(games.values());
}

module.exports = {
  initializeSocketService,
  getGameState,
  getAllGames,
};