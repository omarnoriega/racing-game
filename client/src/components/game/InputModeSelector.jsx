import { useEffect, useState } from 'react';
import './InputModeSelector.css';

function InputModeSelector({ onSelect, autoDetect = true }) {
  const [detectedMode, setDetectedMode] = useState(null);
  const [isLoading, setIsLoading] = useState(autoDetect);

  useEffect(() => {
    if (!autoDetect) return;

    // Auto-detectar basado en variable de entorno
    const envMode = process.env.REACT_APP_INPUT_MODE;
    
    if (envMode) {
      console.log('🎯 Mode from environment:', envMode);
      setDetectedMode(envMode);
      setIsLoading(false);
      
      // Auto-seleccionar después de 2 segundos
      setTimeout(() => {
        onSelect(envMode);
      }, 2000);
      return;
    }

    // Detectar capacidades del dispositivo
    const hasMotionSensors = 'DeviceMotionEvent' in window;
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    let suggestedMode = 'tap'; // Default
    
    if (hasMotionSensors && isMobile) {
      suggestedMode = 'motion';
    }
    
    console.log('🎯 Auto-detected mode:', suggestedMode);
    setDetectedMode(suggestedMode);
    setIsLoading(false);
    
    // Auto-seleccionar después de 2 segundos
    setTimeout(() => {
      onSelect(suggestedMode);
    }, 2000);
  }, [autoDetect, onSelect]);

  if (isLoading) {
    return (
      <div className="input-mode-overlay">
        <div className="input-mode-modal">
          <div className="loading-spinner">⏳</div>
          <h2>Detectando mejor modo de juego...</h2>
          <p>Versión: {process.env.REACT_APP_VERSION || 'unknown'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="input-mode-overlay">
      <div className="input-mode-modal">
        <h2>🎮 Modo de Control</h2>
        <p>Estás en la versión: <strong>{process.env.REACT_APP_VERSION || 'default'}</strong></p>
        
        {detectedMode && (
          <div className="detected-mode">
            <span className="badge">Recomendado para ti</span>
            <div className="mode-preview">
              {detectedMode === 'motion' ? '📱 Movimiento' : '👆 Taps'}
            </div>
          </div>
        )}

        <div className="mode-options">
          <button 
            className={`mode-option motion ${detectedMode === 'motion' ? 'recommended' : ''}`}
            onClick={() => onSelect('motion')}
          >
            <span className="mode-icon">📱</span>
            <h3>Movimiento</h3>
            <p>Sacude tu móvil</p>
            {detectedMode === 'motion' && (
              <span className="badge-small">⭐ Recomendado</span>
            )}
          </button>

          <button 
            className={`mode-option tap ${detectedMode === 'tap' ? 'recommended' : ''}`}
            onClick={() => onSelect('tap')}
          >
            <span className="mode-icon">👆</span>
            <h3>Taps</h3>
            <p>Toca la pantalla</p>
            {detectedMode === 'tap' && (
              <span className="badge-small">⭐ Recomendado</span>
            )}
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

        <div className="version-info">
          <small>Build: {process.env.REACT_APP_VERSION}</small>
        </div>
      </div>
    </div>
  );
}

export default InputModeSelector;