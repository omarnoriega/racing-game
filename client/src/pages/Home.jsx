import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const [gameId, setGameId] = useState('');
  const navigate = useNavigate();

  const createGame = () => {
    const newGameId = `game-${Date.now()}`;
    navigate(`/game/${newGameId}`);
  };

  const joinGame = () => {
    if (gameId.trim()) {
      navigate(`/game/${gameId}`);
    }
  };

  return (
    <div className="home-container">
      <h1>🏁 Racing Game</h1>
      
      <div className="home-actions">
        <button onClick={createGame} className="btn-primary">
          Crear Nueva Partida
        </button>

        <div className="join-game">
          <input
            type="text"
            placeholder="ID de partida"
            value={gameId}
            onChange={(e) => setGameId(e.target.value)}
          />
          <button onClick={joinGame} className="btn-secondary">
            Unirse a Partida
          </button>
        </div>

        <button 
          onClick={() => navigate('/admin')} 
          className="btn-admin"
        >
          Panel de Administración
        </button>
      </div>
    </div>
  );
}

export default Home;