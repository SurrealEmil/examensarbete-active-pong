import React from 'react';
import PropTypes from 'prop-types';
import './FpsOverlay.css'; // Import CSS file

const FpsOverlay = ({ fps, isLagSpike }) => {
  if (fps === null) return null;

  return (
    <div className="fps-overlay">
      FPS: {fps} <span className={isLagSpike ? 'lag-spike' : ''}>{isLagSpike ? '(Lag spike!)' : '(Good)'}</span>
    </div>
  );
};

FpsOverlay.propTypes = {
  fps: PropTypes.number,
  isLagSpike: PropTypes.bool,
};

export default FpsOverlay;