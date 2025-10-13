import { useState, useCallback } from 'react';
import { useMotionDetection } from './useMotionDetection';
import { useTouchHandler } from './useTouchHandler';

export function useHybridInput(onInput, inputMode = 'motion') {
  const [mode, setMode] = useState(inputMode); // 'motion', 'tap', 'both'
  const [inputCount, setInputCount] = useState(0);

  const handleInput = useCallback(() => {
    setInputCount(prev => prev + 1);
    onInput?.();
  }, [onInput]);

  // Motion detection
  const { 
    isSupported, 
    permissionGranted, 
    requestPermission,
    intensity, 
    shakeCount 
  } = useMotionDetection(
    handleInput, 
    mode === 'motion' || mode === 'both'
  );

  // Touch handler
  const { handleTouch } = useTouchHandler(
    handleInput,
    100
  );

  return {
    mode,
    setMode,
    isSupported,
    permissionGranted,
    requestPermission,
    intensity,
    shakeCount,
    handleTouch: mode === 'tap' || mode === 'both' ? handleTouch : null,
    inputCount,
  };
}