import io from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect() {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(process.env.REACT_APP_WS_URL, {
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('✅ Conectado al servidor');
    });

    this.socket.on('disconnect', () => {
      console.log('⚠️ Desconectado del servidor');
    });

    return this.socket;
  }

  joinGame(gameId, playerId, teamId) {
    if (!this.socket) return;
    this.socket.emit('game:join', { gameId, playerId, teamId });
  }

  sendTap(gameId, teamId) {
    if (!this.socket) return;
    this.socket.emit('player:tap', { gameId, teamId });
  }

  startGame(gameId) {
    if (!this.socket) return;
    this.socket.emit('admin:start', { gameId });
  }

  endGame(gameId) {
    if (!this.socket) return;
    this.socket.emit('admin:end', { gameId });
  }

  onGameUpdate(callback) {
    if (!this.socket) return;
    this.socket.on('game:update', callback);
  }

  onGameStarted(callback) {
    if (!this.socket) return;
    this.socket.on('game:started', callback);
  }

  onGameEnded(callback) {
    if (!this.socket) return;
    this.socket.on('game:ended', callback);
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const socketService = new SocketService();