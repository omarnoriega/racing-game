import { useState, useEffect } from 'react';
import { socketService } from '../services/socketService';
import { cleanGameId, formatGameId } from '../utils/helpers';
import '../styles/backoffice.css';

function Backoffice() {
  const [gameId, setGameId] = useState('');
  const [displayId, setDisplayId] = useState('');
  const [gameState, setGameState] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = socketService.connect();

    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socketService.onGameUpdate((newState) => {
      setGameState(newState);
    });

    return () => {
      socketService.disconnect();
    };
  }, []);
/*
  const loadGame = () => {
    if (gameId.trim()) {
      socketService.joinGame(gameId, 'admin', 'teamA');
    }
  };
*/

  const loadGame = () => {
    const cleanId = cleanGameId(gameId);
    if (cleanId.trim()) {
      socketService.joinGame(cleanId, 'admin', 'teamA');
      setDisplayId(formatGameId(cleanId));
    }
  };

  const startGame = () => {
    if (gameId) {
      socketService.startGame(gameId);
    }
  };

  const endGame = () => {
    if (gameId) {
      socketService.endGame(gameId);
    }
  };

  return (
    <div className="backoffice-container">
      <header className="backoffice-header">
        <h1>🎮 Panel de Administración</h1>
        <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
          {isConnected ? '🟢 Conectado' : '🔴 Desconectado'}
        </div>
      </header>

      <div className="backoffice-content">
        <div className="control-panel">
          <h2>Control de Partida</h2>
          
          <div className="input-group">
            <input
              type="text"
              placeholder="Ej: ABC-123 o ABC123"
              value={gameId}
              onChange={(e) => setGameId(e.target.value)}
              maxLength="7"
            />
            <button onClick={loadGame} className="btn-load">
              Cargar Partida
            </button>
          </div>

          {displayId && (
              <div className="loaded-game-id">
                Partida cargada: <strong>{displayId}</strong>
              </div>
            )}

          {gameState && (
            <>
              <div className="game-info">

                {gameState && gameState.config && (
                <div className="config-info">
                  <h3>⚙️ Configuración de la Partida</h3>
                  <div className="config-grid">
                    <div className="config-item">
                      <span>🏁 Circuito:</span>
                      <span>{gameState.config.TRACK_LENGTH}m</span>
                    </div>
                    <div className="config-item">
                      <span>⚡ Potencia:</span>
                      <span>{gameState.config.TAP_POWER}m/tap</span>
                    </div>
                    <div className="config-item">
                      <span>⏱️ Cooldown:</span>
                      <span>{gameState.config.TAP_COOLDOWN_MS}ms</span>
                    </div>
                    <div className="config-item">
                      <span>⏳ Duración:</span>
                      <span>
                        {gameState.config.GAME_DURATION_MS 
                          ? `${gameState.config.GAME_DURATION_MS / 1000}s`
                          : 'Sin límite'}
                      </span>
                    </div>
                  </div>
                </div>
              )}


                <div className="info-card">
                  <h3>Estado</h3>
                  <p className={`status-badge ${gameState.status}`}>
                    {gameState.status}
                  </p>
                </div>
                <div className="info-card">
                  <h3>Jugadores Totales</h3>
                  <p className="stat">
                    {gameState.teams.teamA.players.length + 
                     gameState.teams.teamB.players.length}
                  </p>
                </div>
              </div>

              <div className="control-buttons">
                <button 
                  onClick={startGame}
                  disabled={gameState.status === 'active' || gameState.status === 'finished'}
                  className="btn-start"
                >
                  ▶️ Iniciar Partida
                </button>
                <button 
                  onClick={endGame}
                  disabled={gameState.status !== 'active'}
                  className="btn-end"
                >
                  ⏹️ Finalizar Partida
                </button>
              </div>

              <div className="live-scoreboard">
                <h2>Marcador en Vivo</h2>
                
                <div className="teams-comparison">
                  <div className="team-card" style={{ borderColor: '#FF6B6B' }}>
                    <h3>🔴 {gameState.teams.teamA.name}</h3>
                    <div className="team-stats">
                      <div className="stat-item">
                        <span className="label">Jugadores</span>
                        <span className="value">
                          {gameState.teams.teamA.players.length}
                        </span>
                      </div>
                      <div className="stat-item">
                        <span className="label">Taps</span>
                        <span className="value">
                          {gameState.teams.teamA.totalTaps}
                        </span>
                      </div>
                      <div className="stat-item">
                        <span className="label">Distancia</span>
                        <span className="value">
                          {gameState.teams.teamA.position}m
                        </span>
                      </div>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ 
                          width: `${(gameState.teams.teamA.position / 1000) * 100}%`,
                          backgroundColor: '#FF6B6B'
                        }}
                      />
                    </div>
                  </div>

                  <div className="vs-divider">VS</div>

                  <div className="team-card" style={{ borderColor: '#4ECDC4' }}>
                    <h3>🔵 {gameState.teams.teamB.name}</h3>
                    <div className="team-stats">
                      <div className="stat-item">
                        <span className="label">Jugadores</span>
                        <span className="value">
                          {gameState.teams.teamB.players.length}
                        </span>
                      </div>
                      <div className="stat-item">
                        <span className="label">Taps</span>
                        <span className="value">
                          {gameState.teams.teamB.totalTaps}
                        </span>
                      </div>
                      <div className="stat-item">
                        <span className="label">Distancia</span>
                        <span className="value">
                          {gameState.teams.teamB.position}m
                        </span>
                      </div>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ 
                          width: `${(gameState.teams.teamB.position / 1000) * 100}%`,
                          backgroundColor: '#4ECDC4'
                        }}
                      />
                    </div>
                  </div>
                </div>

                {gameState.winner && (
                  <div className="winner-announcement">
                    🏆 Ganador: {gameState.teams[gameState.winner].name}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Backoffice;