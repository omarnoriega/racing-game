import { useNavigate } from 'react-router-dom';
import { formatGameId } from '../../utils/helpers';
import './RecentGames.css';

function RecentGames({ games, onClear }) {
  const navigate = useNavigate();

  if (!games || games.length === 0) {
    return null;
  }

  const getTimeAgo = (timestamp) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    if (seconds < 60) return 'Hace un momento';
    if (seconds < 3600) return `Hace ${Math.floor(seconds / 60)} min`;
    if (seconds < 86400) return `Hace ${Math.floor(seconds / 3600)} hrs`;
    return `Hace ${Math.floor(seconds / 86400)} días`;
  };

  return (
    <div className="recent-games">
      <div className="recent-header">
        <h4>🕐 Partidas Recientes</h4>
        <button onClick={onClear} className="clear-btn">
          Limpiar
        </button>
      </div>
      <div className="recent-list">
        {games.map((game) => (
          <button
            key={game.id}
            className="recent-item"
            onClick={() => navigate(`/game/${game.id}`)}
          >
            <span className="recent-id">{formatGameId(game.id)}</span>
            <span className="recent-time">{getTimeAgo(game.timestamp)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default RecentGames;