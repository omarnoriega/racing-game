export const GAME_CONFIG = {
  TRACK_LENGTH: 1000,
  TAP_POWER: 1,
  TAP_COOLDOWN_MS: 100,
  MIN_PLAYERS_TO_START: 1,
};

// Importar desde shared si es posible, o duplicar
export const DEFAULT_GAME_CONFIG = {
  TRACK_LENGTH: 1000,
  TAP_POWER: 1,
  TAP_COOLDOWN_MS: 100,
  MIN_PLAYERS_TO_START: 1,
  GAME_DURATION_MS: null,
};

export const GAME_PRESETS = {
  QUICK: {
    name: 'Carrera Rápida ⚡',
    TRACK_LENGTH: 500,
    TAP_POWER: 2,
    TAP_COOLDOWN_MS: 100,
    GAME_DURATION_MS: 60000,
  },
  NORMAL: {
    name: 'Carrera Normal 🏁',
    TRACK_LENGTH: 1000,
    TAP_POWER: 1,
    TAP_COOLDOWN_MS: 100,
    GAME_DURATION_MS: 120000,
  },
  MARATHON: {
    name: 'Maratón 🎯',
    TRACK_LENGTH: 2000,
    TAP_POWER: 1,
    TAP_COOLDOWN_MS: 80,
    GAME_DURATION_MS: 300000,
  },
  ENDURANCE: {
    name: 'Resistencia 💪',
    TRACK_LENGTH: 3000,
    TAP_POWER: 1,
    TAP_COOLDOWN_MS: 100,
    GAME_DURATION_MS: null,
  },
  CUSTOM: {
    name: 'Personalizada ⚙️',
    TRACK_LENGTH: 1000,
    TAP_POWER: 1,
    TAP_COOLDOWN_MS: 100,
    GAME_DURATION_MS: null,
  },
};

export const TEAM_COLORS = {
  teamA: '#FF6B6B',
  teamB: '#4ECDC4',
};

export const GAME_STATUS = {
  WAITING: 'waiting',
  ACTIVE: 'active',
  FINISHED: 'finished',
};