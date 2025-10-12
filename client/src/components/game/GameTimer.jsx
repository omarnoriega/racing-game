import { useState, useEffect } from 'react';
import './GameTimer.css';

function GameTimer({ startTime, duration, onTimeout }) {
  const [timeRemaining, setTimeRemaining] = useState(duration);

  useEffect(() => {
    if (!startTime || !duration) return;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, duration - elapsed);
      
      setTimeRemaining(remaining);

      if (remaining === 0) {
        clearInterval(interval);
        onTimeout && onTimeout();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [startTime, duration, onTimeout]);

  if (!duration) return null;

  const seconds = Math.ceil(timeRemaining / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  const percentage = (timeRemaining / duration) * 100;
  const isUrgent = percentage < 20;

  return (
    <div className={`game-timer ${isUrgent ? 'urgent' : ''}`}>
      <div className="timer-bar">
        <div 
          className="timer-fill"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="timer-text">
        ⏱️ {minutes}:{remainingSeconds.toString().padStart(2, '0')}
      </div>
    </div>
  );
}

export default GameTimer;