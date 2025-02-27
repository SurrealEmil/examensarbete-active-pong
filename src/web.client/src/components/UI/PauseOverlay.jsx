import React from 'react';
import PropTypes from 'prop-types';
import './PauseOverlay.css';

const PauseOverlay = ({ onResume, onQuit }) => {
  return (
    <div className="pause-overlay">
      <div className="pause-menu">
        <h2>Game Paused</h2>
        <button onClick={onResume}>Resume</button>
        <button onClick={onQuit}>Quit</button>
      </div>
    </div>
  );
};

PauseOverlay.propTypes = {
  onResume: PropTypes.func.isRequired,
  onQuit: PropTypes.func.isRequired,
};

export default PauseOverlay;