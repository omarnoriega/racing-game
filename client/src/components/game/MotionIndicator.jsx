import './MotionIndicator.css';

function MotionIndicator({ intensity, shakeCount, isActive }) {
  const getIntensityLevel = () => {
    if (intensity < 20) return 'low';
    if (intensity < 50) return 'medium';
    if (intensity < 80) return 'high';
    return 'extreme';
  };

  const intensityLevel = getIntensityLevel();

  return (
    <div className={`motion-indicator ${isActive ? 'active' : ''}`}>
      <div className="motion-header">
        <span className="motion-icon">📱</span>
        <span className="motion-label">Sacude para avanzar</span>
      </div>

      <div className="intensity-bar-container">
        <div 
          className={`intensity-bar ${intensityLevel}`}
          style={{ width: `${intensity}%` }}
        >
          <span className="intensity-value">{Math.round(intensity)}%</span>
        </div>
      </div>

      <div className="motion-stats">
        <div className="stat">
          <span className="stat-icon">🎯</span>
          <span className="stat-value">{shakeCount}</span>
          <span className="stat-label">Sacudidas</span>
        </div>
        <div className="stat">
          <span className="stat-icon">
            {intensityLevel === 'extreme' && '🔥'}
            {intensityLevel === 'high' && '⚡'}
            {intensityLevel === 'medium' && '💪'}
            {intensityLevel === 'low' && '😴'}
          </span>
          <span className="stat-label">
            {intensityLevel === 'extreme' && '¡Extremo!'}
            {intensityLevel === 'high' && 'Alta'}
            {intensityLevel === 'medium' && 'Media'}
            {intensityLevel === 'low' && 'Suave'}
          </span>
        </div>
      </div>

      <div className="motion-hint">
        <span className="hint-icon">💡</span>
        <span>Sacude más fuerte para ir más rápido</span>
      </div>
    </div>
  );
}

export default MotionIndicator;