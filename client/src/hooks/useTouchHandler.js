import { useState, useCallback, useRef } from 'react';

export function useTouchHandler(onTap, cooldownMs = 100) {
  const [lastTapTime, setLastTapTime] = useState(0);
  const cooldownRef = useRef(cooldownMs);

  // Actualizar cooldown si cambia
  cooldownRef.current = cooldownMs;

  const handleTouch = useCallback((e) => {
    // Prevenir comportamiento por defecto
    if (e) {
      e.preventDefault();
    }

    const now = Date.now();
    const timeSinceLastTap = now - lastTapTime;

    // Verificar cooldown
    if (timeSinceLastTap < cooldownRef.current) {
      console.log('⏱️ Tap ignored (cooldown)');
      return;
    }

    setLastTapTime(now);
    
    // Ejecutar callback
    if (onTap) {
      onTap();
      console.log('👆 Tap registered at', new Date().toISOString());
    }
  }, [lastTapTime, onTap]);

  return { 
    handleTouch,
    lastTapTime 
  };
}