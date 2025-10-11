const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  gameId: {
    type: String,
    required: true,
    unique: true,
  },
  status: {
    type: String,
    enum: ['waiting', 'active', 'finished'],
    default: 'waiting',
  },
  config: {
    trackLength: { type: Number, default: 1000 },
    tapPower: { type: Number, default: 1 },
    tapCooldown: { type: Number, default: 100 },
    gameDuration: { type: Number, default: null },
  },
  teams: {
    teamA: {
      id: { type: String, default: 'teamA' },
      name: { type: String, default: 'Equipo Rojo' },
      color: { type: String, default: '#FF6B6B' },
      players: [String],
      totalTaps: { type: Number, default: 0 },
      position: { type: Number, default: 0 },
    },
    teamB: {
      id: { type: String, default: 'teamB' },
      name: { type: String, default: 'Equipo Azul' },
      color: { type: String, default: '#4ECDC4' },
      players: [String],
      totalTaps: { type: Number, default: 0 },
      position: { type: Number, default: 0 },
    },
  },
  startTime: Date,
  endTime: Date,
  winner: String,
  createdBy: String,
}, {
  timestamps: true,
});

module.exports = mongoose.model('Game', gameSchema);