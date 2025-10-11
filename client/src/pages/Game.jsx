import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useGameState } from '../hooks/useGameState';
import { useTouchHandler } from '../hooks/useTouchHandler';
import { TEAM_COLORS, GAME_CONFIG } from '../constants/gameConstants';
import '../styles/game.css';

function Game() {
  const { gameId } = useParams();
  const [playerId] = useState(`player-${Date.now()}`);
  const [selectedTeam, setSelectedTeam] = useState(null);
  
  const { gameState, isConnected, sendTap } = useGameState(
    gameId, 
    playerId, 
    selectedTeam
  );

  const { handleTouch } = useTouchHandler(sendTap);

  if (!selectedTeam) {
    return (
      <div className="team-selection">
        <h2>Selecciona tu equipo</h2>
        <div className="teams">
          <button
            onClick={() => setSelectedTeam('teamA')}
            style={{ backgroundColor: TEAM_COLORS.teamA }}
          >
            Equipo Rojo
          </button>
          <button
            onClick={() => setSelectedTeam('teamB')}
            style={{ backgroundColor: TEAM_COLORS.teamB }}
          >
            Equipo Azul
          </button>
        </div>
      </div>
    );
  }

  if (!gameState) {
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
        <h3>Partida: {gameId}</h3>
        <div className={`status ${gameState.status}`}>
          {gameState.status === 'waiting' && '⏸️ Esperando inicio...'}
          {gameState.status === 'active' && '🏁 ¡CARRERA!'}
          {gameState.status === 'finished' && '🏆 Finalizada'}
        </div>
      </div>

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
        </div>
      )}

      {gameState.status === 'finished' && (
        <div className="game-over">
          <h2>
            {gameState.winner === selectedTeam 
              ? '🎉 ¡GANASTE!' 
              : '😔 Perdiste'}
          </h2>
          <p>
            Ganador: {gameState.teams[gameState.winner].name}
          </p>
        </div>
      )}
    </div>
  );
}

export default Game;