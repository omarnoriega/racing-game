import { useState, useEffect, useCallback, useRef } from 'react';

export function useMotionControl(onMotion, config = {}) {
  const {
    threshold = 15, // Umbral de aceleración para detectar movimiento
    cooldown = 150, // Milisegundos entre movimientos válidos
    vibrate = true, // Vibración háptica
    motionType = 'shake' // 'shake' o 'tilt'
  } = config;

  const [isSupported, setIsSupported] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [permission, setPermission] = useState('unknown'); // 'granted', 'denied', 'unknown'
  const [motionCount, setMotionCount] = useState(0);
  const [acceleration, setAcceleration] = useState({ x: 0, y: 0, z: 0 });

  const lastMotionTime = useRef(0);
  const motionTimeoutRef = useRef(null);

  // Detectar si el dispositivo soporta motion
  useEffect(() => {
    const hasMotion = 'DeviceMotionEvent' in window;
    const hasOrientation = 'DeviceOrientationEvent' in window;
    setIsSupported(hasMotion && hasOrientation);

    if (!hasMotion) {
      console.warn('⚠️  DeviceMotion no soportado en este dispositivo');
    }
  }, []);

  // Función para vibrar
  const vibrateDevice = useCallback(() => {
    if (vibrate && 'vibrate' in navigator) {
      navigator.vibrate(50); // Vibración corta de 50ms
    }
  }, [vibrate]);

  // Manejar evento de movimiento
  const handleMotion = useCallback((event) => {
    const now = Date.now();
    
    // Aplicar cooldown
    if (now - lastMotionTime.current < cooldown) {
      return;
    }

    const acc = event.accelerationIncludingGravity || event.acceleration;
    
    if (!acc) return;

    const { x = 0, y = 0, z = 0 } = acc;

    // Actualizar estado de aceleración (para debug)
    setAcceleration({ x: x.toFixed(2), y: y.toFixed(2), z: z.toFixed(2) });

    if (motionType === 'shake') {
      // Detectar sacudida (movimiento brusco en cualquier eje)
      const totalAcceleration = Math.abs(x) + Math.abs(y) + Math.abs(z);
      
      if (totalAcceleration > threshold) {
        lastMotionTime.current = now;
        setMotionCount(prev => prev + 1);
        vibrateDevice();
        onMotion();
        
        console.log('🎯 Sacudida detectada!', {
          x: x.toFixed(2),
          y: y.toFixed(2),
          z: z.toFixed(2),
          total: totalAcceleration.toFixed(2)
        });
      }
    } else if (motionType === 'tilt') {
      // Detectar inclinación hacia adelante (sacudir hacia adelante)
      // En la mayoría de dispositivos, Y positivo = inclinación hacia adelante
      if (Math.abs(y) > threshold) {
        lastMotionTime.current = now;
        setMotionCount(prev => prev + 1);
        vibrateDevice();
        onMotion();
        
        console.log('🎯 Inclinación detectada!', { y: y.toFixed(2) });
      }
    }
  }, [cooldown, threshold, motionType, onMotion, vibrateDevice]);

  // Solicitar permiso (iOS 13+)
  const requestPermission = useCallback(async () => {
    // iOS 13+ requiere permiso explícito
    if (typeof DeviceMotionEvent !== 'undefined' && 
        typeof DeviceMotionEvent.requestPermission === 'function') {
      try {
        const permissionState = await DeviceMotionEvent.requestPermission();
        setPermission(permissionState);
        
        if (permissionState === 'granted') {
          console.log('✅ Permiso de motion concedido');
          return true;
        } else {
          console.warn('❌ Permiso de motion denegado');
          return false;
        }
      } catch (error) {
        console.error('Error solicitando permiso:', error);
        setPermission('denied');
        return false;
      }
    } else {
      // Android o iOS < 13 no requieren permiso
      setPermission('granted');
      return true;
    }
  }, []);

  // Iniciar detección de movimiento
  const startMotionDetection = useCallback(async () => {
    if (!isSupported) {
      console.error('❌ Motion no soportado');
      return false;
    }

    // Solicitar permiso si es necesario
    const hasPermission = await requestPermission();
    
    if (!hasPermission && permission !== 'granted') {
      return false;
    }

    // Agregar event listener
    window.addEventListener('devicemotion', handleMotion);
    setIsActive(true);
    console.log('✅ Detección de movimiento iniciada');
    
    return true;
  }, [isSupported, handleMotion, requestPermission, permission]);

  // Detener detección de movimiento
  const stopMotionDetection = useCallback(() => {
    window.removeEventListener('devicemotion', handleMotion);
    setIsActive(false);
    console.log('⏹️  Detección de movimiento detenida');
  }, [handleMotion]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (motionTimeoutRef.current) {
        clearTimeout(motionTimeoutRef.current);
      }
      stopMotionDetection();
    };
  }, [stopMotionDetection]);

  return {
    isSupported,
    isActive,
    permission,
    motionCount,
    acceleration,
    startMotionDetection,
    stopMotionDetection,
    requestPermission
  };
}