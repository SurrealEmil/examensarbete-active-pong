import React from 'react';
import PropTypes from 'prop-types';
import './TopBar.css';

const TopBar = ({ leftJoyConConnected, rightJoyConConnected }) => {
  return (
    <div className="top-bar">
      <h3 className="player-1-container">
        {leftJoyConConnected && (
          <img className="joycon-icon-left" src="./img/joy-con-red.png" alt="Left Joy-Con" />
        )}
        Player 1
      </h3>
      <h2>PONG</h2>
      <h3 className="player-2-container">
        Player 2
        {rightJoyConConnected && (
          <img className="joycon-icon-right" src="./img/joy-con-blue.png" alt="Right Joy-Con" />
        )}
      </h3>
    </div>
  );
};

TopBar.propTypes = {
  leftJoyConConnected: PropTypes.bool.isRequired,
  rightJoyConConnected: PropTypes.bool.isRequired,
};

export default TopBar;
