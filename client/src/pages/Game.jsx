import { useState, useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useGameState } from '../hooks/useGameState';
import { useMotionDetection } from '../hooks/useMotionDetection';
import { useTouchHandler } from '../hooks/useTouchHandler';
import { socketService } from '../services/socketService';
import { TEAM_COLORS } from '../constants/gameConstants';
import InputModeSelector from '../components/game/InputModeSelector';
import MotionPermission from '../components/game/MotionPermission';
import MotionIndicator from '../components/game/MotionIndicator';
import GameTimer from '../components/game/GameTimer';
import GameStats from '../components/game/GameStats';
import ShareGameModal from '../components/game/ShareGameModal';
import { formatGameId } from '../utils/helpers';
import '../styles/game.css';

function Game() {
  const { gameId } = useParams();
  const [playerId] = useState(`player-${Date.now()}`);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [gameConfig, setGameConfig] = useState(null);
  
  // Estados para el modo de input
  const [inputMode, setInputMode] = useState(null); // null, 'tap', 'motion', 'both'
  const [motionEnabled, setMotionEnabled] = useState(false);
  
  const { gameState, isConnected, sendTap } = useGameState(
    gameId, 
    playerId, 
    selectedTeam
  );

  // Handler para sacudidas (MOTION)
  const handleShake = useCallback((magnitude) => {
    if (gameState?.status === 'active') {
      sendTap();
      console.log('🎯 Shake registered, magnitude:', magnitude.toFixed(2));
    }
  }, [gameState, sendTap]);

  // Handler para taps (TAP)
  const handleTap = useCallback(() => {
    if (gameState?.status === 'active') {
      sendTap();
      console.log('👆 Tap registered');
    }
  }, [gameState, sendTap]);

  // Hook de detección de movimiento (solo si mode es 'motion' o 'both')
  const {
    isSupported,
    permissionGranted,
    requestPermission,
    intensity,
    shakeCount,
  } = useMotionDetection(
    handleShake, 
    motionEnabled && 
    (inputMode === 'motion' || inputMode === 'both') && 
    gameState?.status === 'active'
  );

  // Hook para tap (solo si mode es 'tap' o 'both')
  const { handleTouch } = useTouchHandler(
    handleTap,
    200 // cooldown
  );

  // Handler cuando se selecciona el modo
  const handleModeSelected = useCallback((mode) => {
    console.log('🎮 Input mode selected:', mode);
    setInputMode(mode);
    
    // Si selecciona motion o both, necesita habilitar sensores
    if (mode === 'motion' || mode === 'both') {
      // Se mostrará el MotionPermission
    } else if (mode === 'tap') {
      // No necesita permisos especiales
      setMotionEnabled(false);
    }
  }, []);

  // Handler de permiso de motion
  const handlePermissionGranted = useCallback((granted) => {
    setMotionEnabled(granted);
    if (!granted) {
      alert('Sin acceso a los sensores de movimiento. Cambiando a modo TAP.');
      setInputMode('tap');
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

  // ========================================
  // RENDER: Selección de Equipo
  // ========================================
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

  // ========================================
  // RENDER: Selección de Modo de Input
  // ========================================
  if (!inputMode) {
    return (
      <InputModeSelector 
        onSelect={handleModeSelected}
        autoDetect={true} // Auto-detecta según REACT_APP_INPUT_MODE
      />
    );
  }

  // ========================================
  // RENDER: Permiso de Motion (si es necesario)
  // ========================================
  if ((inputMode === 'motion' || inputMode === 'both') && !motionEnabled && isSupported) {
    return (
      <MotionPermission 
        onPermissionGranted={handlePermissionGranted}
      />
    );
  }

  // ========================================
  // RENDER: Mensaje si motion no soportado
  // ========================================
  if (inputMode === 'motion' && !isSupported) {
    return (
      <div className="not-supported-message">
        <h2>❌ Sensores no disponibles</h2>
        <p>Tu dispositivo no soporta sensores de movimiento.</p>
        <button onClick={() => setInputMode('tap')}>
          Cambiar a modo TAP
        </button>
        <button onClick={() => window.location.href = '/'}>
          Volver al inicio
        </button>
      </div>
    );
  }

  // ========================================
  // RENDER: Loading
  // ========================================
  if (!gameState || !gameConfig) {
    return <div className="loading">Cargando juego...</div>;
  }

  // ========================================
  // RENDER: Juego Principal
  // ========================================
  const myTeam = gameState.teams[selectedTeam];
  const opponentTeam = selectedTeam === 'teamA' 
    ? gameState.teams.teamB 
    : gameState.teams.teamA;

  const myProgress = (myTeam.position / gameConfig.TRACK_LENGTH) * 100;
  const opponentProgress = (opponentTeam.position / gameConfig.TRACK_LENGTH) * 100;

  // Determinar label según modo
  const getActionLabel = () => {
    if (inputMode === 'tap') return 'taps';
    if (inputMode === 'motion') return 'sacudidas';
    return 'acciones';
  };

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
          <span>⚡ {gameConfig.TAP_POWER}m/{getActionLabel()}</span>
          <span className="input-mode-badge">
            {inputMode === 'tap' && '👆 TAP'}
            {inputMode === 'motion' && '📱 MOTION'}
            {inputMode === 'both' && '🎯 HYBRID'}
          </span>
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

      {/* Indicador de movimiento (solo si motion está activo) */}
      {gameState.status === 'active' && (inputMode === 'motion' || inputMode === 'both') && (
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
            <span>{myTeam.totalTaps} {getActionLabel()}</span>
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
            <span>{opponentTeam.totalTaps} {getActionLabel()}</span>
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

      {/* Área de TAP (solo si tap está activo) */}
      {gameState.status === 'active' && (inputMode === 'tap' || inputMode === 'both') && (
        <div 
          className="tap-area"
          onTouchStart={handleTouch}
          onClick={handleTouch}
        >
          <h1>¡TAP AQUÍ!</h1>
          <p>Toca para avanzar</p>
          {inputMode === 'both' && (
            <p className="hint">O sacude tu móvil</p>
          )}
        </div>
      )}

      {gameState.status === 'waiting' && (
        <div className="waiting-message">
          <h3>⏳ Esperando que el administrador inicie la partida...</h3>
          <p>
            {inputMode === 'tap' && 'Prepara tu dedo para tocar'}
            {inputMode === 'motion' && 'Prepara tu móvil para sacudirlo'}
            {inputMode === 'both' && 'Puedes tocar o sacudir tu móvil'}
          </p>
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