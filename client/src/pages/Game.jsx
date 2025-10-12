import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useGameState } from '../hooks/useGameState';
import { useTouchHandler } from '../hooks/useTouchHandler';
import { TEAM_COLORS, GAME_CONFIG } from '../constants/gameConstants';
import ShareGameModal from '../components/game/ShareGameModal';
import { formatGameId } from '../utils/helpers';
import '../styles/game.css';
import GameTimer from '../components/game/GameTimer';
import GameStats from '../components/game/GameStats';
import { socketService } from '../services/socketService';
import { addRecentGame } from '../utils/localStorage';


function Game() {
  const { gameId } = useParams();
  const [playerId] = useState(`player-${Date.now()}`);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [gameConfig, setGameConfig] = useState(null);
  

  const { gameState, isConnected, sendTap } = useGameState(
    gameId, 
    playerId, 
    selectedTeam
  );

  useEffect(() => {
    const socket = socketService.connect();
    
    // Obtener configuración del juego
    socket.emit('game:getConfig', { gameId });
    
    socket.on('game:config', ({ config }) => {
      setGameConfig(config);
    });

     if (gameId) {
    addRecentGame(gameId);
    };

    return () => {
      socket.off('game:config');
    };
  }, [gameId]);

  const { handleTouch } = useTouchHandler(sendTap);

  if (!selectedTeam) {
    return (
      <div className="team-selection">
        <div className="game-id-banner">
          <span className="label">Código de partida:</span>
          <span className="id">{formatGameId(gameId)}</span>
          <button 
            className="share-btn-mini"
            onClick={() => setShowShareModal(true)}
          >
            📤 Compartir
          </button>
        </div>

        <h2>Selecciona tu equipo</h2>
        <div className="teams">
          <button
            onClick={() => setSelectedTeam('teamA')}
            style={{ backgroundColor: TEAM_COLORS.teamA }}
          >
            🔴 Equipo Rojo
          </button>
          <button
            onClick={() => setSelectedTeam('teamB')}
            style={{ backgroundColor: TEAM_COLORS.teamB }}
          >
            🔵 Equipo Azul
          </button>
        </div>

      {showShareModal && (
          <ShareGameModal
            gameId={gameId}
            onClose={() => setShowShareModal(false)}
          />
        )}

      </div>
    );
  }

  if (!gameState || !gameConfig) {
    return <div className="loading">Cargando juego...</div>;
  }

  const myTeam = gameState.teams[selectedTeam];
  const opponentTeam = selectedTeam === 'teamA' 
    ? gameState.teams.teamB 
    : gameState.teams.teamA;

  const myProgress = (myTeam.position / GAME_CONFIG.TRACK_LENGTH) * 100;
  const opponentProgress = (opponentTeam.position / GAME_CONFIG.TRACK_LENGTH) * 100;

  return (
    <div className="game-screen">
      <div className="game-header">
        <div className="game-id-display-mini">
          <span>{formatGameId(gameId)}</span>
          <button 
            className="share-icon-btn"
            onClick={() => setShowShareModal(true)}
            title="Compartir partida"
          >
            📤
          </button>
        </div>
        <h3>Partida: {gameId}</h3>
        <div className="game-config-display">
          <span>🏁 {gameConfig.TRACK_LENGTH}m</span>
          <span>⚡ {gameConfig.TAP_POWER}m/tap</span>
        </div>
        <div className={`status ${gameState.status}`}>
          {gameState.status === 'waiting' && '⏸️ Esperando inicio...'}
          {gameState.status === 'active' && '🏁 ¡CARRERA!'}
          {gameState.status === 'finished' && '🏆 Finalizada'}
        </div>
      </div>

          {/* Timer si hay duración configurada */}
          {gameState.status === 'active' && gameConfig.GAME_DURATION_MS && (
            <GameTimer 
              startTime={gameState.startTime}
              duration={gameConfig.GAME_DURATION_MS}
            />
          )}

      <div className="race-tracks">
        {/* Tu equipo */}
        <div className="track">
          <div className="track-header" style={{ color: myTeam.color }}>
            <span>{myTeam.name} (TÚ)</span>
            <span>{myTeam.totalTaps} taps</span>
          </div>
          <div className="track-line">
            <div 
              className="vehicle"
              style={{ 
                left: `${myProgress}%`,
                backgroundColor: TEAM_COLORS[selectedTeam]
              }}
            >
              🏎️
            </div>
          </div>
        </div>

        {/* Equipo oponente */}
        <div className="track">
          <div className="track-header" style={{ color: opponentTeam.color }}>
            <span>{opponentTeam.name}</span>
            <span>{opponentTeam.totalTaps} taps</span>
          </div>
          <div className="track-line">
            <div 
              className="vehicle"
              style={{ 
                left: `${opponentProgress}%`,
                backgroundColor: TEAM_COLORS[selectedTeam === 'teamA' ? 'teamB' : 'teamA']
              }}
            >
              🏎️
            </div>
          </div>
        </div>
      </div>

      {gameState.status === 'active' && (
        <div 
          className="tap-area"
          onTouchStart={handleTouch}
          onClick={handleTouch}
        >
          <h1>¡TAP AQUÍ!</h1>
          <p>Impulsa a tu equipo</p>
          <p>+{gameConfig.TAP_POWER}m por tap</p>
        </div>
      )}

      {gameState.status === 'finished' && (
      <GameStats gameState={gameState} myTeam={selectedTeam} />
      )}

       {showShareModal && (
        <ShareGameModal
          gameId={gameId}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
}

export default Game;