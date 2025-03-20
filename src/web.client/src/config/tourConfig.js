// src/config/tournamentConfig.js
import BASE_CONFIG from './gameConfig'; // or directly copy from your old config

const TOURNAMENT_CONFIG = {
  ...BASE_CONFIG,  // copy all original values

  // Override old logic
  WINNING_SCORE: null, // not used in tournament
  TIMER_DURATION_MS: 90000, // 90 seconds

  // Possibly you want slower ball or something different:
  BALL_SPEED: 12,
  MAX_BALL_SPEED: 20,

  // or any other differences...
};

export default TOURNAMENT_CONFIG;