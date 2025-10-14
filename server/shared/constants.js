// Configuraciones por defecto del juego
const DEFAULT_GAME_CONFIG = {
  TRACK_LENGTH: 1000,           // Metros del circuito
  TAP_POWER: 1,                 // Metros por tap
  TAP_COOLDOWN_MS: 100,         // Milisegundos entre taps
  MIN_PLAYERS_TO_START: 1,      // Mínimo de jugadores
  GAME_DURATION_MS: null,       // null = sin límite de tiempo
};

// Presets de configuración
const GAME_PRESETS = {
  QUICK: {
    name: 'Carrera Rápida',
    TRACK_LENGTH: 500,
    TAP_POWER: 2,
    TAP_COOLDOWN_MS: 100,
    GAME_DURATION_MS: 60000, // 1 minuto
  },
  NORMAL: {
    name: 'Carrera Normal',
    TRACK_LENGTH: 1000,
    TAP_POWER: 1,
    TAP_COOLDOWN_MS: 100,
    GAME_DURATION_MS: 120000, // 2 minutos
  },
  MARATHON: {
    name: 'Maratón',
    TRACK_LENGTH: 2000,
    TAP_POWER: 1,
    TAP_COOLDOWN_MS: 80,
    GAME_DURATION_MS: 300000, // 5 minutos
  },
  CUSTOM: {
    name: 'Personalizada',
    // Valores por defecto, se sobreescribirán
    TRACK_LENGTH: 1000,
    TAP_POWER: 1,
    TAP_COOLDOWN_MS: 100,
    GAME_DURATION_MS: null,
  },
};

const TEAM_COLORS = {
  teamA: '#FF6B6B',
  teamB: '#4ECDC4',
};

const GAME_STATUS = {
  WAITING: 'waiting',
  ACTIVE: 'active',
  FINISHED: 'finished',
};

module.exports = {
  DEFAULT_GAME_CONFIG,
  GAME_PRESETS,
  TEAM_COLORS,
  GAME_STATUS,
}; 