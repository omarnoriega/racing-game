import { useState } from 'react';
import { formatGameId } from '../../utils/helpers';
import Toast from '../common/Toast';
import './ShareGameModal.css';
import QRCode from './QRCode';

function ShareGameModal({ gameId, onClose }) {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const gameUrl = `${window.location.origin}/game/${gameId}`;
  const formattedId = formatGameId(gameId);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (text, message) => {
  
    try {
      await navigator.clipboard.writeText(text);
      setToastMessage(message);
      setShowToast(true);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback para navegadores antiguos
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setToastMessage(message);
      setShowToast(true);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareViaWhatsApp = () => {
    const message = encodeURIComponent(
      `¡Únete a mi carrera! 🏁\n\nCódigo: ${formattedId}\n\nO entra directamente: ${gameUrl}`
    );
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const shareViaTelegram = () => {
    const message = encodeURIComponent(
      `¡Únete a mi carrera! 🏁\n\nCódigo: ${formattedId}\n\n${gameUrl}`
    );
    window.open(`https://t.me/share/url?url=${gameUrl}&text=${message}`, '_blank');
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent('¡Únete a mi carrera!');
    const body = encodeURIComponent(
      `Hola,\n\nÚnete a mi carrera de Racing Game!\n\nCódigo: ${formattedId}\n\nO entra directamente: ${gameUrl}\n\n¡Nos vemos en la pista! 🏁`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Racing Game',
          text: `¡Únete a mi carrera! Código: ${formattedId}`,
          url: gameUrl,
        });
      } catch (err) {
        console.log('Error compartiendo:', err);
      }
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="share-modal" onClick={(e) => e.stopPropagation()}>

        <button className="close-btn" onClick={onClose}>✕</button>
        
        <h2>🎮 Compartir Partida</h2>
        
        <div className="game-id-display">
          <div className="id-label">Código de Partida</div>
          <div className="id-value">{formattedId}</div>
          <button 
            className="copy-btn"
            onClick={() => copyToClipboard(gameId)}
          >
            {copied ? '✓ Copiado!' : '📋 Copiar Código'}
          </button>
        </div>

        <div className="divider">
          <span>o comparte el enlace</span>
        </div>

        <div className="url-display">
          <input 
            type="text" 
            value={gameUrl} 
            readOnly 
            onClick={(e) => e.target.select()}
          />
          <button 
            className="copy-btn-small"
            onClick={() => copyToClipboard(gameUrl)}
          >
            {copied ? '✓' : '📋'}
          </button>
        </div>

        <div className="qr-code-wrapper">
        <QRCode value={gameUrl} size={180} />
        <p className="qr-label">Escanea para unirte</p>
        </div>
        <div className="qr-section">
          <p className="qr-hint">
            💡 Los jugadores pueden escanear el código QR o ingresar el código manualmente
          </p>
        </div>
      </div>

       {showToast && (
        <Toast 
          message={toastMessage} 
          onClose={() => setShowToast(false)} 
        />
      )}
    </div>
  );
}

export default ShareGameModal;