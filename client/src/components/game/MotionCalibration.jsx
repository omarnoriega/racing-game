import { useState } from 'react';
import { useMotionDetection } from '../../hooks/useMotionDetection';
import './MotionCalibration.css';

function MotionCalibration({ onComplete }) {
  const [calibrationData, setCalibrationData] = useState([]);
  const [isCalibrating, setIsCalibrating] = useState(false);

  const handleShake = (magnitude) => {
    setCalibrationData(prev => [...prev, magnitude]);
  };

  const { intensity, shakeCount } = useMotionDetection(handleShake, isCalibrating);

  const startCalibration = () => {
    setIsCalibrating(true);
    setCalibrationData([]);
    
    setTimeout(() => {
      setIsCalibrating(false);
      analyzeCalibration();
    }, 10000); // 10 segundos de calibración
  };

  const analyzeCalibration = () => {
    if (calibrationData.length === 0) {
      alert('No se detectaron sacudidas. Intenta sacudir más fuerte.');
      return;
    }

    const avg = calibrationData.reduce((a, b) => a + b, 0) / calibrationData.length;
    const max = Math.max(...calibrationData);
    const min = Math.min(...calibrationData);

    console.log('📊 Calibration results:', { avg, max, min, count: calibrationData.length });
    
    // Sugerir threshold
    const suggestedThreshold = avg * 0.8;
    
    alert(`
      Calibración completa!
      
      Sacudidas detectadas: ${calibrationData.length}
      Promedio: ${avg.toFixed(2)}
      Máximo: ${max.toFixed(2)}
      Mínimo: ${min.toFixed(2)}
      
      Threshold sugerido: ${suggestedThreshold.toFixed(2)}
    `);

    onComplete?.(suggestedThreshold);
  };

  return (
    <div className="calibration-panel">
      <h3>🎯 Calibración de Sensores</h3>
      <p>Ayúdanos a ajustar la sensibilidad según tu dispositivo</p>

      {!isCalibrating ? (
        <button className="btn-calibrate" onClick={startCalibration}>
          Iniciar Calibración (10s)
        </button>
      ) : (
        <div className="calibrating">
          <div className="calibration-timer">
            <span className="pulse-icon">📱</span>
            <h4>¡Sacude tu móvil ahora!</h4>
            <p>Detectadas: {shakeCount} sacudidas</p>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${intensity}%` }} />
            </div>
          </div>
        </div>
      )}

      {calibrationData.length > 0 && !isCalibrating && (
        <div className="calibration-results">
          <p>✅ Último test: {calibrationData.length} sacudidas detectadas</p>
        </div>
      )}
    </div>
  );
}

export default MotionCalibration;