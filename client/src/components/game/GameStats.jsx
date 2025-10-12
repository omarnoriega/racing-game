import './GameStats.css';
import { TEAM_COLORS, GAME_CONFIG } from '../../constants/gameConstants';
function GameStats({ gameState, myTeam }) {
  if (gameState.status !== 'finished') return null;

  const winner = gameState.teams[gameState.winner];
  const isWinner = gameState.winner === myTeam;
  
  const duration = gameState.endTime - gameState.startTime;
  const durationSeconds = Math.floor(duration / 1000);
  const minutes = Math.floor(durationSeconds / 60);
  const seconds = durationSeconds % 60;

  const teamAData = gameState.teams.teamA;
  const teamBData = gameState.teams.teamB;

  return (
    <div className="game-stats">
      <div className={`result-banner ${isWinner ? 'winner' : 'loser'}`}>
        {isWinner ? '🎉 ¡VICTORIA!' : '😔 Derrota'}
      </div>

      <h3>📊 Estadísticas Finales</h3>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">⏱️ Duración</span>
          <span className="stat-value">
            {minutes}:{seconds.toString().padStart(2, '0')}
          </span>
        </div>

        <div className="stat-card">
          <span className="stat-label">🏆 Ganador</span>
          <span className="stat-value">{winner.name}</span>
        </div>

        <div className="stat-card">
          <span className="stat-label">🏁 Distancia Final</span>
          <span className="stat-value">{winner.position}m</span>
        </div>

        <div className="stat-card">
          <span className="stat-label">📱 Total Taps</span>
          <span className="stat-value">
            {teamAData.totalTaps + teamBData.totalTaps}
          </span>
        </div>
      </div>

      <div className="teams-comparison">
        <div className="team-stats">
          <h4 style={{ color: TEAM_COLORS.teamA }}>
            {teamAData.name}
          </h4>
          <div className="team-stat-row">
            <span>Posición:</span>
            <span>{teamAData.position}m</span>
          </div>
          <div className="team-stat-row">
            <span>Taps:</span>
            <span>{teamAData.totalTaps}</span>
          </div>
          <div className="team-stat-row">
            <span>Jugadores:</span>
            <span>{teamAData.players.length}</span>
          </div>
          <div className="team-stat-row">
            <span>Taps/Jugador:</span>
            <span>
              {teamAData.players.length > 0 
                ? Math.round(teamAData.totalTaps / teamAData.players.length)
                : 0}
            </span>
          </div>
        </div>

        <div className="vs-separator">VS</div>

        <div className="team-stats">
          <h4 style={{ color: TEAM_COLORS.teamB }}>
            {teamBData.name}
          </h4>
          <div className="team-stat-row">
            <span>Posición:</span>
            <span>{teamBData.position}m</span>
          </div>
          <div className="team-stat-row">
            <span>Taps:</span>
            <span>{teamBData.totalTaps}</span>
          </div>
          <div className="team-stat-row">
            <span>Jugadores:</span>
            <span>{teamBData.players.length}</span>
          </div>
          <div className="team-stat-row">
            <span>Taps/Jugador:</span>
            <span>
              {teamBData.players.length > 0 
                ? Math.round(teamBData.totalTaps / teamBData.players.length)
                : 0}
            </span>
          </div>
        </div>
      </div>

      <button 
        className="btn-play-again"
        onClick={() => window.location.href = '/'}
      >
        🔄 Jugar de Nuevo
      </button>
    </div>
  );
}

export default GameStats;