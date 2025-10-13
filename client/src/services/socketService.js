import io from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  connect() {
    if (this.socket?.connected) {
      console.log('✅ Socket already connected');
      return this.socket;
    }

    const wsUrl = process.env.REACT_APP_WS_URL || 'http://localhost:3001';
    
    console.log('🔌 Connecting to WebSocket:', wsUrl);

     this.socket = io(wsUrl, {
      transports: ['websocket', 'polling'], // Intentar WebSocket primero, luego polling
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts,
      timeout: 20000,
      autoConnect: true,
      forceNew: false,
      withCredentials: true, // Importante para CORS
    });  

      this.socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error.message);
      console.error('🔍 Details:', {
        url: wsUrl,
        transport: this.socket?.io?.engine?.transport?.name,
        error: error
      });
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('❌ Max reconnection attempts reached');
      }
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket.id);
      console.log('📡 Transport:', this.socket.io.engine.transport.name);
      this.reconnectAttempts = 0;
    });

    /*this.socket = io(process.env.REACT_APP_WS_URL, {
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
*/

 this.socket.on('disconnect', (reason) => {
      console.log('⚠️  Socket disconnected:', reason);
      
      if (reason === 'io server disconnect') {
        // El servidor desconectó, reconectar manualmente
        console.log('🔄 Reconnecting...');
        this.socket.connect();
      }
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Socket reconnected after', attemptNumber, 'attempts');
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log('🔄 Reconnection attempt', attemptNumber);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('❌ Reconnection failed');
    });

    this.socket.io.engine.on('upgrade', (transport) => {
      console.log('⬆️  Transport upgraded to:', transport.name);
    });

    return this.socket;
  }

  joinGame(gameId, playerId, teamId) {
    if (!this.socket) {
      console.error('❌ Socket not initialized');
      return;
    }
    console.log('🎮 Joining game:', { gameId, playerId, teamId });
    this.socket.emit('game:join', { gameId, playerId, teamId });
  }

  sendTap(gameId, teamId) {
    if (!this.socket || !this.socket.connected) {
      console.error('❌ Socket not connected');
      return;
    }
    this.socket.emit('player:tap', { gameId, teamId });
  }

  startGame(gameId) {
    if (!this.socket) return;
    console.log('▶️  Starting game:', gameId);
    this.socket.emit('admin:start', { gameId });
  }

  endGame(gameId) {
    if (!this.socket) return;
    console.log('⏹️  Ending game:', gameId);
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

  onError(callback) {
    if (!this.socket) return;
    this.socket.on('error', callback);
  }

  disconnect() {
    if (this.socket) {
      console.log('🔌 Disconnecting socket...');
      this.socket.disconnect();
      this.socket = null;
    }
  }

  isConnected() {
    return this.socket?.connected || false;
  }

  sendTapWithIntensity(gameId, teamId, intensity) {
    if (!this.socket || !this.socket.connected) {
      console.error('❌ Socket not connected');
      return;
    }
    this.socket.emit('player:tap', { gameId, teamId, intensity });
  }

}

export const socketService = new SocketService();