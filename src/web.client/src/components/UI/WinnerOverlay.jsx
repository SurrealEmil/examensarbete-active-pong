import React from 'react';
import PropTypes from 'prop-types';
import './WinnerOverlay.css';

const WinnerOverlay = ({ winner, onRestart, onQuit }) => {
  return (
    <div className="winner-overlay">
      <div className="winner-content">
        <h2>{winner} Wins</h2>
        <div className="winner-buttons">
          <button onClick={onRestart}>Restart Game</button>
          <button onClick={onQuit}>Quit Game</button>
        </div>
      </div>
    </div>
  );
};

WinnerOverlay.propTypes = {
  winner: PropTypes.string.isRequired,
  onRestart: PropTypes.func.isRequired,
  onQuit: PropTypes.func.isRequired,
};

export default WinnerOverlay;
