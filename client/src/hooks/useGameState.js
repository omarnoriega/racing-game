import { useState, useEffect, useCallback } from 'react';
import { socketService } from '../services/socketService';

export function useGameState(gameId, playerId, teamId) {
  const [gameState, setGameState] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = socketService.connect();

    socket.on('connect', () => {
      setIsConnected(true);
      socketService.joinGame(gameId, playerId, teamId);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socketService.onGameUpdate((newState) => {
      setGameState(newState);
    });

    return () => {
      socketService.disconnect();
    };
  }, [gameId, playerId, teamId]);

  const sendTap = useCallback(() => {
    socketService.sendTap(gameId, teamId);
  }, [gameId, teamId]);

  return { gameState, isConnected, sendTap };
}