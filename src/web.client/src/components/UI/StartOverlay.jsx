import React from 'react';
import PropTypes from 'prop-types';
import './StartOverlay.css';

const StartOverlay = ({ onStart }) => {
  return (
    <div className="start-overlay" onClick={onStart}>
      <h1>Active Pong</h1>
      <p>Click to start</p>
    </div>
  );
};

StartOverlay.propTypes = {
  onStart: PropTypes.func.isRequired,
};

export default StartOverlay;