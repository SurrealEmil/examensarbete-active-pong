import React from 'react';
import PropTypes from 'prop-types';
import './ScoreDisplay.css';

const ScoreDisplay = ({ player1Score, player2Score }) => {
  return (
    <div className="scores">
      <p>{player1Score}</p>
      <p>{player2Score}</p>
    </div>
  );
};

ScoreDisplay.propTypes = {
  player1Score: PropTypes.number.isRequired,
  player2Score: PropTypes.number.isRequired,
};

export default ScoreDisplay;