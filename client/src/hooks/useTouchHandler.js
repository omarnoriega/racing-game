import { useState, useCallback } from 'react';
import { GAME_CONFIG } from '../constants/gameConstants';

export function useTouchHandler(onTap) {
  const [lastTapTime, setLastTapTime] = useState(0);

  const handleTouch = useCallback((e) => {
    e.preventDefault();

    const now = Date.now();
    if (now - lastTapTime < GAME_CONFIG.TAP_COOLDOWN_MS) {
      return;
    }

    setLastTapTime(now);
    onTap();
  }, [lastTapTime, onTap]);

  return { handleTouch };
}