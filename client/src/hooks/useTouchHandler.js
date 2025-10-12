import { useState, useCallback } from 'react';

export function useTouchHandler(onTap, cooldownMs = 100) {
  const [lastTapTime, setLastTapTime] = useState(0);

  const handleTouch = useCallback((e) => {
    e.preventDefault();

    const now = Date.now();
    if (now - lastTapTime < cooldownMs) {
      return;
    }

    setLastTapTime(now);
    onTap();
  }, [lastTapTime, cooldownMs, onTap]);

  return { handleTouch };
}