import { useState, useEffect } from 'react';
import { useMotionControl } from '../../hooks/useMotionControl';
import './MotionControl.css';

function MotionControl({ gameId, teamId, onMotion, gameStatus, config }) {
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [isCalibrating, setIsCalibrating] = useState(false);

  const {
    isSupported,
    isActive,
    permission,
    motionCount,
    acceleration,
    startMotionDetection,
    stopMotionDetection,
    requestPermission
  } = useMotionControl(onMotion, config);

  // Iniciar/detener según el estado del juego
  useEffect(() => {
    if (gameStatus === 'active' && isSupported) {
      if (permission === 'unknown') {
        setShowPermissionModal(true);
      } else if (permission === 'granted') {
        startMotionDetection();
      }
    } else {
      stopMotionDetection();
    }

    return () => {
      stopMotionDetection();
    };
  }, [gameStatus, isSupported, permission, startMotionDetection, stopMotionDetection]);

  const handleRequestPermission = async () => {
    const granted = await requestPermission();
    setShowPermissionModal(false);
    
    if (granted) {
      startMotionDetection();
      // Mostrar breve tutorial
      setIsCalibrating(true);
      setTimeout(() => setIsCalibrating(false), 3000);
    }
  };

  if (!isSupported) {
    return (
      <div className="motion-control motion-not-supported">
        <div className="icon">⚠️</div>
        <h3>Sensores no disponibles</h3>
        <p>Tu dispositivo no soporta detección de movimiento.</p>
        <p className="hint">Intenta en un móvil moderno</p>
      </div>
    );
  }

  if (showPermissionModal) {
    return (
      <div className="motion-control permission-modal">
        <div className="modal-content">
          <div className="icon">📱</div>
          <h3>Permiso de Sensores</h3>
          <p>Para jugar necesitamos acceso a los sensores de movimiento de tu dispositivo.</p>
          <div className="permission-info">
            <div className="info-item">
              <span className="emoji">🎮</span>
              <span>Mueve tu celular para acelerar</span>
            </div>
            <div className="info-item">
              <span className="emoji">📳</span>
              <span>Recibirás vibración como feedback</span>
            </div>
          </div>
          <button 
            className="btn-permission"
            onClick={handleRequestPermission}
          >
            Activar Sensores
          </button>
          <p className="privacy-note">
            Los datos nunca salen de tu dispositivo
          </p>
        </div>
      </div>
    );
  }

  if (isCalibrating) {
    return (
      <div className="motion-control calibrating">
        <div className="calibration-content">
          <div className="icon pulse">📱</div>
          <h3>¡Listo!</h3>
          <p className="instruction">Sacude o inclina tu celular para acelerar</p>
          <div className="demo-animation">
            <div className="phone-icon">📱</div>
            <div className="motion-arrows">
              <span>↔️</span>
              <span>↕️</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (gameStatus === 'waiting') {
    return (
      <div className="motion-control waiting">
        <div className="icon">⏳</div>
        <h3>Esperando inicio...</h3>
        <p>Sensores listos</p>
        {isActive && (
          <div className="ready-indicator">
            <span className="pulse-dot"></span>
            <span>Preparado</span>
          </div>
        )}
      </div>
    );
  }

  if (gameStatus === 'active') {
    return (
      <div className="motion-control active">
        <div className="motion-display">
          <div className="motion-icon">
            <span className="shake-animation">📱</span>
          </div>
          
          <div className="motion-instructions">
            <h2>¡Sacude tu celular!</h2>
            <p>Muévelo para acelerar tu vehículo</p>
          </div>

          <div className="motion-counter">
            <div className="counter-value">{motionCount}</div>
            <div className="counter-label">Movimientos</div>
          </div>

          {/* Debug info (solo en desarrollo) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="motion-debug">
              <div className="debug-title">Aceleración:</div>
              <div className="debug-values">
                <span>X: {acceleration.x}</span>
                <span>Y: {acceleration.y}</span>
                <span>Z: {acceleration.z}</span>
              </div>
              <div className="debug-status">
                {isActive ? '✅ Activo' : '❌ Inactivo'}
              </div>
            </div>
          )}
        </div>

        <div className="motion-hints">
          <div className="hint-item">
            <span className="hint-icon">💪</span>
            <span>Sacude con fuerza</span>
          </div>
          <div className="hint-item">
            <span className="hint-icon">⚡</span>
            <span>Sentirás vibración</span>
          </div>
        </div>
      </div>
    );
  }

  if (gameStatus === 'finished') {
    return (
      <div className="motion-control finished">
        <div className="icon">🏁</div>
        <h3>¡Juego Terminado!</h3>
        <div className="final-stats">
          <p>Movimientos totales:</p>
          <div className="stat-value">{motionCount}</div>
        </div>
      </div>
    );
  }

  return null;
}

export default MotionControl;