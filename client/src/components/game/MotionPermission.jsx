import { useState } from 'react';
import './MotionPermission.css';

function MotionPermission({ onPermissionGranted }) {
  const [isRequesting, setIsRequesting] = useState(false);

  const requestPermission = async () => {
    setIsRequesting(true);
    
    try {
      if (typeof DeviceMotionEvent !== 'undefined' && 
          typeof DeviceMotionEvent.requestPermission === 'function') {
        // iOS 13+
        const permission = await DeviceMotionEvent.requestPermission();
        
        if (permission === 'granted') {
          onPermissionGranted(true);
        } else {
          alert('Se necesita permiso para usar los sensores de movimiento');
          onPermissionGranted(false);
        }
      } else {
        // Android u otros navegadores
        onPermissionGranted(true);
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
      alert('Error al solicitar permisos: ' + error.message);
      onPermissionGranted(false);
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <div className="motion-permission-overlay">
      <div className="motion-permission-modal">
        <div className="permission-icon">📱</div>
        <h2>Control por Movimiento</h2>
        <p className="permission-description">
          Esta partida usa los sensores de movimiento de tu dispositivo.
          <br />
          <strong>¡Sacude tu móvil para avanzar!</strong>
        </p>
        
        <div className="permission-features">
          <div className="feature">
            <span className="feature-icon">🏃</span>
            <span>Sacude para avanzar</span>
          </div>
          <div className="feature">
            <span className="feature-icon">📳</span>
            <span>Vibración como feedback</span>
          </div>
          <div className="feature">
            <span className="feature-icon">⚡</span>
            <span>Más intensidad = más velocidad</span>
          </div>
        </div>

        <button 
          className="btn-enable-motion"
          onClick={requestPermission}
          disabled={isRequesting}
        >
          {isRequesting ? 'Solicitando permiso...' : '🎮 Habilitar Sensores'}
        </button>

        <p className="permission-note">
          💡 Tip: Sacude con movimientos cortos y rápidos para mejor respuesta
        </p>
      </div>
    </div>
  );
}

export default MotionPermission;