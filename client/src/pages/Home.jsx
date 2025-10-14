import { useState, useEffect  } from 'react';
import { useNavigate } from 'react-router-dom';
import GameConfigModal from '../components/game/GameConfigModal';
import { socketService } from '../services/socketService';
import { cleanGameId, isValidGameId, formatGameId } from '../utils/helpers';
import RecentGames from '../components/game/RecentGames';
import { getRecentGames, clearRecentGames, addRecentGame } from '../utils/localStorage';


function Home() {
  const [gameId, setGameId] = useState('');
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [error, setError] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const navigate = useNavigate();
  const [recentGames, setRecentGames] = useState([]);
  
  useEffect(() => {
    setRecentGames(getRecentGames());
  }, []);

    const handleClearRecent = () => {
    clearRecentGames();
    setRecentGames([]);
  };

  const createGame = (config) => {
    const socket = socketService.connect();
    
    socket.emit('game:create', { config });
    
    socket.once('game:created', ({ gameId }) => {
      navigate(`/game/${gameId}`);
    });
    
    setShowConfigModal(false);
  };

  /*
  const joinGame = () => {
    if (gameId.trim()) {
      navigate(`/game/${gameId}`);
    }
  };
  */

const joinGame = () => {
    const cleanId = cleanGameId(gameId);
    
    if (!cleanId) {
      setError('Por favor ingresa un código de partida');
      return;
    }
    
    if (!isValidGameId(cleanId)) {
      setError('Código inválido. Debe tener 6 caracteres (letras y números)');
      return;
    }
    
    setError('');
    navigate(`/game/${cleanId}`);
  };

  /*
  const handleInputChange = (e) => {
    const value = e.target.value;
    setGameId(value);
    setError('');
  };
*/

  const handleInputChange = (e) => {
    let value = e.target.value.toUpperCase();
    
    // Auto-formatear mientras escribe
    if (value.length > 3 && !value.includes('-')) {
      value = value.slice(0, 3) + '-' + value.slice(3);
    }
    
    setGameId(value);
    setError('');
  };


const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      joinGame();
    }
  };

const handlePaste = (e) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const cleanId = cleanGameId(pastedText);
    setGameId(formatGameId(cleanId));
  };

  const cleanedId = cleanGameId(gameId);
  const isValid = isValidGameId(cleanedId);

 return (
    <div className="home-container">
      <div className="home-header">
        <h1>🏁 Racing Game</h1>
        <p className="subtitle">Compite en carreras multijugador</p>
        🚀 From Tuta with love
      </div>
      
      
      <div className="home-actions">
        <button 
          onClick={() => setShowConfigModal(true)} 
          className="btn-primary btn-large"
        >
          <span className="btn-icon">🎮</span>
          <span>Crear Nueva Partida</span>
        </button>

        <div className="separator">
          <span>o</span>
        </div>

        <div className="join-section">
          <div className="join-game">
            <div className="input-wrapper">
              <input
                type="text"
                placeholder="ABC-123"
                value={gameId}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                onPaste={handlePaste}
                maxLength="7"
                className={`game-id-input ${error ? 'error' : ''} ${isValid ? 'valid' : ''}`}
                autoCapitalize="characters"
              />
              {isValid && (
                <span className="valid-icon">✓</span>
              )}
            </div>
            <button 
              onClick={joinGame} 
              className="btn-secondary"
              disabled={!isValid || isValidating}
            >
              {isValidating ? '...' : 'Unirse'}
            </button>
          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}    

          {gameId && !error && isValid && (
            <div className="id-preview">
              <span className="check-icon">✓</span>
              Listo para unirse a: <strong>{formatGameId(cleanedId)}</strong>
            </div>
          )}

          <div className="join-hint">
            💡 Pide el código a quien creó la partida
          </div>

        </div>

        <div className="separator">
          <span>administrador</span>
        </div>

        <button 
          onClick={() => navigate('/admin')} 
          className="btn-admin"
        >
          <span className="btn-icon">🎛️</span>
          <span>Panel de Administración</span>
        </button>
       </div>

      {showConfigModal && (
        <GameConfigModal
          onConfirm={createGame}
          onCancel={() => setShowConfigModal(false)}
        />
      )}
      <RecentGames 
        games={recentGames} 
        onClear={handleClearRecent}
      />
    </div>
  );
}

export default Home;