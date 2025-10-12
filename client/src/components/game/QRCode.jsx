import { useEffect, useRef } from 'react';

function QRCode({ value, size = 200 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Usar una librería como qrcode o generar con API
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}`;
    
    const img = new Image();
    img.src = qrUrl;
    img.onload = () => {
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, size, size);
    };
  }, [value, size]);

  return (
    <div className="qr-code-container">
      <canvas ref={canvasRef} width={size} height={size} />
    </div>
  );
}

export default QRCode;