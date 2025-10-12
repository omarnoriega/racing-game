const RECENT_GAMES_KEY = 'racing_game_recent';
const MAX_RECENT_GAMES = 5;

export function addRecentGame(gameId) {
  try {
    const recent = getRecentGames();
    
    // Evitar duplicados
    const filtered = recent.filter(g => g.id !== gameId);
    
    // Agregar al inicio
    filtered.unshift({
      id: gameId,
      timestamp: Date.now(),
    });
    
    // Mantener solo los últimos MAX_RECENT_GAMES
    const limited = filtered.slice(0, MAX_RECENT_GAMES);
    
    localStorage.setItem(RECENT_GAMES_KEY, JSON.stringify(limited));
  } catch (err) {
    console.error('Error guardando juego reciente:', err);
  }
}

export function getRecentGames() {
  try {
    const data = localStorage.getItem(RECENT_GAMES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    return [];
  }
}

export function clearRecentGames() {
  try {
    localStorage.removeItem(RECENT_GAMES_KEY);
  } catch (err) {
    console.error('Error limpiando historial:', err);
  }
}