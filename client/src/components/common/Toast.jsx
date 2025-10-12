import { useEffect } from 'react';
import './Toast.css';

function Toast({ message, onClose, duration = 2000 }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className="toast">
      <span className="toast-icon">✓</span>
      <span className="toast-message">{message}</span>
    </div>
  );
}

export default Toast;