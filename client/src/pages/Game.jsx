import { useState, useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useGameState } from '../hooks/useGameState';
import { useMotionDetection } from '../hooks/useMotionDetection';
import { TEAM_COLORS, GAME_CONFIG } from '../constants/gameConstants';
import MotionPermission from '../components/game/MotionPermission';
import MotionIndicator from '../components/game/MotionIndicator';
import GameTimer from '../components/game/GameTimer';
import GameStats from '../components/game/GameStats';
import ShareGameModal from '../components/game/ShareGameModal';
import { formatGameId } from '../utils/helpers';
import '../styles/game.css';
import { socketService } from '../services/socketService';


function Game() {
  const { gameId } = useParams();
  const [playerId] = useState(`player-${Date.now()}`);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [motionEnabled, setMotionEnabled] = useState(false);
  const [gameConfig, setGameConfig] = useState(null);
  
  const { gameState, isConnected, sendTap } = useGameState(
    gameId, 
    playerId, 
    selectedTeam
  );

  // Handler para sacudidas
  const handleShake = useCallback((magnitude) => {
    if (gameState?.status === 'active') {
      sendTap();
      console.log('🎯 Shake registered, magnitude:', magnitude.toFixed(2));
    }
  }, [gameState, sendTap]);

  // Hook de detección de movimiento
  const {
    isSupported,
    permissionGranted,
    requestPermission,
    intensity,
    shakeCount,
  } = useMotionDetection(handleShake, motionEnabled && gameState?.status === 'active');

  // Handler de permiso
  const handlePermissionGranted = useCallback((granted) => {
    setMotionEnabled(granted);
    if (!granted) {
      alert('Sin acceso a los sensores de movimiento. Verifica los permisos del navegador.');
    }
  }, []);

  // Obtener configuración del juego
  useEffect(() => {
    const socket = socketService.connect();
    
    
    socket.emit('game:getConfig', { gameId });
    
    socket.on('game:config', ({ config }) => {
      setGameConfig(config);
    });

    return () => {
      socket.off('game:config');
    };
  }, [gameId]);

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

  // Mostrar modal de permiso si no está habilitado
  if (!motionEnabled && isSupported) {
    return (
      <MotionPermission 
        onPermissionGranted={handlePermissionGranted}
      />
    );
  }

  // Mensaje si no es soportado
  if (!isSupported) {
    return (
      <div className="not-supported-message">
        <h2>❌ Sensores no disponibles</h2>
        <p>Tu dispositivo no soporta sensores de movimiento o estás usando un navegador de escritorio.</p>
        <p>Por favor, abre esta app en un dispositivo móvil con Chrome o Safari.</p>
        <button onClick={() => window.location.href = '/'}>
          Volver al inicio
        </button>
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

  const myProgress = (myTeam.position / gameConfig.TRACK_LENGTH) * 100;
  const opponentProgress = (opponentTeam.position / gameConfig.TRACK_LENGTH) * 100;

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

        <div className="game-config-display">
          <span>🏁 {gameConfig.TRACK_LENGTH}m</span>
          <span>⚡ {gameConfig.TAP_POWER}m/shake</span>
        </div>
        
        <div className={`status ${gameState.status}`}>
          {gameState.status === 'waiting' && '⏸️ Esperando inicio...'}
          {gameState.status === 'active' && '🏁 ¡CARRERA!'}
          {gameState.status === 'finished' && '🏆 Finalizada'}
        </div>
      </div>

      {gameState.status === 'active' && gameConfig.GAME_DURATION_MS && (
        <GameTimer 
          startTime={gameState.startTime}
          duration={gameConfig.GAME_DURATION_MS}
        />
      )}

      {/* Indicador de movimiento */}
      {gameState.status === 'active' && (
        <MotionIndicator
          intensity={intensity}
          shakeCount={shakeCount}
          isActive={true}
        />
      )}

      <div className="race-tracks">
        {/* Tu equipo */}
        <div className="track">
          <div className="track-header" style={{ color: myTeam.color }}>
            <span>{myTeam.name} (TÚ)</span>
            <span>{myTeam.totalTaps} sacudidas</span>
          </div>
          <div className="track-line">
            <div 
              className="vehicle"
              style={{ 
                left: `${myProgress}%`,
                backgroundColor: TEAM_COLORS[selectedTeam]
              }}
            >
              🛩️
            </div>
          </div>
        </div>

        {/* Equipo oponente */}
        <div className="track">
          <div className="track-header" style={{ color: opponentTeam.color }}>
            <span>{opponentTeam.name}</span>
            <span>{opponentTeam.totalTaps} sacudidas</span>
          </div>
          <div className="track-line">
            <div 
              className="vehicle"
              style={{ 
                left: `${opponentProgress}%`,
                backgroundColor: TEAM_COLORS[selectedTeam === 'teamA' ? 'teamB' : 'teamA']
              }}
            >
              ✈️
            </div>
          </div>
        </div>
      </div>

      {gameState.status === 'waiting' && (
        <div className="waiting-message">
          <h3>⏳ Esperando que el administrador inicie la partida...</h3>
          <p>Prepara tu móvil para sacudirlo</p>
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