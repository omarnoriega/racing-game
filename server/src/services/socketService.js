const gameService = require('./gameService');

let io;
const games = new Map(); // Almacén temporal de partidas activas

function initializeSocketService(socketIo) {
  io = socketIo;

  io.on('connection', (socket) => {
    console.log('🔌 Cliente conectado:', socket.id);

    // Unirse a un juego
    socket.on('game:join', async ({ gameId, playerId, teamId }) => {
      try {
        socket.join(gameId);
        
        // Inicializar juego si no existe
        if (!games.has(gameId)) {
          games.set(gameId, {
            id: gameId,
            status: 'waiting',
            teams: {
              teamA: { id: 'teamA', name: 'Equipo Rojo', players: [], totalTaps: 0, position: 0 },
              teamB: { id: 'teamB', name: 'Equipo Azul', players: [], totalTaps: 0, position: 0 }
            },
            startTime: null,
            winner: null
          });
        }

        const game = games.get(gameId);
        if (!game.teams[teamId].players.includes(playerId)) {
          game.teams[teamId].players.push(playerId);
        }

        // Enviar estado actual
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

      // Incrementar taps y posición
      game.teams[teamId].totalTaps += 1;
      game.teams[teamId].position += 1; // 1 metro por tap

      // Verificar si hay ganador
      const FINISH_LINE = 1000;
      if (game.teams[teamId].position >= FINISH_LINE) {
        game.status = 'finished';
        game.winner = teamId;
        console.log(`🏆 ${game.teams[teamId].name} ganó el juego ${gameId}`);
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

      game.status = 'active';
      game.startTime = Date.now();
      
      io.to(gameId).emit('game:update', game);
      io.to(gameId).emit('game:started');
      
      console.log(`🏁 Juego ${gameId} iniciado`);
    });

    // Admin: Finalizar juego
    socket.on('admin:end', ({ gameId }) => {
      const game = games.get(gameId);
      
      if (!game) {
        socket.emit('error', { message: 'Juego no encontrado' });
        return;
      }

      game.status = 'finished';
      
      // Determinar ganador por posición
      if (!game.winner) {
        game.winner = game.teams.teamA.position > game.teams.teamB.position 
          ? 'teamA' 
          : 'teamB';
      }
      
      io.to(gameId).emit('game:update', game);
      io.to(gameId).emit('game:ended', { winner: game.winner });
      
      console.log(`🏁 Juego ${gameId} finalizado`);
    });

    socket.on('disconnect', () => {
      console.log('🔌 Cliente desconectado:', socket.id);
    });
  });
}

function getGameState(gameId) {
  return games.get(gameId);
}

module.exports = {
  initializeSocketService,
  getGameState
};