import { useState, useEffect, useCallback, useRef } from 'react';

const SHAKE_THRESHOLD = 15; // Fuerza mínima para detectar sacudida
const SHAKE_COOLDOWN = 200; // Milisegundos entre sacudidas
const VIBRATION_DURATION = 50; // Duración de la vibración en ms

export function useMotionDetection(onShake, enabled = true) {
  const [isSupported, setIsSupported] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [intensity, setIntensity] = useState(0);
  const [shakeCount, setShakeCount] = useState(0);
  
  const lastShakeTime = useRef(0);
  const lastX = useRef(0);
  const lastY = useRef(0);
  const lastZ = useRef(0);

  // Verificar soporte del navegador
  useEffect(() => {
    const supported = 'DeviceMotionEvent' in window || 'DeviceOrientationEvent' in window;;
    setIsSupported(supported);
    
    console.log('📱 Motion sensors:', supported ? 'supported' : 'not supported');
    console.log('📳 Vibration:', 'vibrate' in navigator ? 'supported' : 'not supported');
  }, []);

  // Solicitar permisos (iOS 13+)
  const requestPermission = useCallback(async () => {
    if (typeof DeviceMotionEvent !== 'undefined' && 
        typeof DeviceMotionEvent.requestPermission === 'function') {
      try {
        const permission = await DeviceMotionEvent.requestPermission();
        const granted = permission === 'granted';
        setPermissionGranted(granted);
        console.log('📱 Motion permission:', permission);
        return granted;
      } catch (error) {
        console.error('Error requesting motion permission:', error);
        return false;
      }
    } else {
      // Android o navegadores que no requieren permiso explícito
      setPermissionGranted(true);
      return true;
    }
  }, []);

  // Función para vibrar
  const vibrate = useCallback(() => {
    if ('vibrate' in navigator) {
      navigator.vibrate(VIBRATION_DURATION);
    }
  }, []);

  // Calcular magnitud del movimiento
  const calculateMagnitude = useCallback((x, y, z) => {
    return Math.sqrt(x * x + y * y + z * z);
  }, []);

  // Handler del evento de movimiento
  const handleMotion = useCallback((event) => {
    if (!enabled || !permissionGranted) return;

    const { acceleration, accelerationIncludingGravity } = event;
    
    // Usar acceleration si está disponible, sino usar accelerationIncludingGravity
    const acc = acceleration || accelerationIncludingGravity;
    
    if (!acc || acc.x === null) return;

    const currentX = acc.x;
    const currentY = acc.y;
    const currentZ = acc.z;

    // Calcular diferencia con la última lectura
    const deltaX = Math.abs(currentX - lastX.current);
    const deltaY = Math.abs(currentY - lastY.current);
    const deltaZ = Math.abs(currentZ - lastZ.current);

    // Calcular magnitud del cambio
    const magnitude = calculateMagnitude(deltaX, deltaY, deltaZ);
    
    // Actualizar intensidad (normalizada 0-100)
    const normalizedIntensity = Math.min(100, (magnitude / SHAKE_THRESHOLD) * 100);
    setIntensity(normalizedIntensity);

    // Detectar sacudida
    const now = Date.now();
    const timeSinceLastShake = now - lastShakeTime.current;

    if (magnitude > SHAKE_THRESHOLD && timeSinceLastShake > SHAKE_COOLDOWN) {
      lastShakeTime.current = now;
      setShakeCount(prev => prev + 1);
      
      // Vibrar como feedback
      vibrate();
      
      // Callback
      if (onShake) {
        onShake(magnitude);
      }

      console.log('🎯 Shake detected! Magnitude:', magnitude.toFixed(2));
    }

    // Guardar valores actuales para la próxima iteración
    lastX.current = currentX;
    lastY.current = currentY;
    lastZ.current = currentZ;
  }, [enabled, permissionGranted, onShake, calculateMagnitude, vibrate]);

  // Agregar/remover listener
  useEffect(() => {
    if (!isSupported || !permissionGranted || !enabled) return;

    window.addEventListener('devicemotion', handleMotion);

    return () => {
      window.removeEventListener('devicemotion', handleMotion);
    };
  }, [isSupported, permissionGranted, enabled, handleMotion]);

  return {
    isSupported,
    permissionGranted,
    requestPermission,
    intensity,
    shakeCount,
  };
}