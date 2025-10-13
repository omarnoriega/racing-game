import './InputModeSelector.css';

function InputModeSelector({ onSelect }) {
  return (
    <div className="input-mode-overlay">
      <div className="input-mode-modal">
        <h2>🎮 Modo de Control</h2>
        <p>Selecciona cómo quieres jugar</p>

        <div className="mode-options">
          <button 
            className="mode-option motion"
            onClick={() => onSelect('motion')}
          >
            <span className="mode-icon">📱</span>
            <h3>Movimiento</h3>
            <p>Sacude tu móvil</p>
            <span className="recommended">⭐ Recomendado</span>
          </button>

          <button 
            className="mode-option tap"
            onClick={() => onSelect('tap')}
          >
            <span className="mode-icon">👆</span>
            <h3>Taps</h3>
            <p>Toca la pantalla</p>
          </button>

          <button 
            className="mode-option hybrid"
            onClick={() => onSelect('both')}
          >
            <span className="mode-icon">🎯</span>
            <h3>Híbrido</h3>
            <p>Ambos modos</p>
          </button>
        </div>
      </div>
    </div>
  );
}

export default InputModeSelector;