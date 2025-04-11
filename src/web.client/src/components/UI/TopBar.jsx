import React from 'react'
import PropTypes from 'prop-types';
import './TopBar.css';



const TopBar = ({ 
  leftJoyConConnected, 
  rightJoyConConnected, 
  player1Name, 
  player2Name,
  player1Score,
  player2Score,
  timer,

}) => {

 
  return (
    <div className="top-bar">
      <div className="topbar-name-wrapper-left">
      {leftJoyConConnected && (
          <img className="joycon-icon-left" src="./img/joy-con-red.png" alt="Left Joy-Con" />
        )}
      <h3 className="player-1-container">
       
        <span className="player1-name">{player1Name}</span>
        <span className="player1-score">{player1Score}</span>
      </h3>
      </div>
      <h2>
        <a href="/lobby" style={{ textDecoration: 'none', color: 'inherit' }}>{/* PONG */}</a>
          <div className="timer-display">
            <h3>{timer} </h3>
          </div>
      </h2>
      <div className="topbar-name-wrapper-right">
        {rightJoyConConnected && (
          <img className="joycon-icon-right" src="./img/joy-con-blue.png" alt="Right Joy-Con" />
        )}
      <h3 className="player-2-container">
        <span className="player2-name">{player2Name}</span>
        <span className="player2-score">{player2Score}</span>
        
      </h3>
    </div>
    </div>
  );
};

TopBar.propTypes = {
  leftJoyConConnected: PropTypes.bool.isRequired,
  rightJoyConConnected: PropTypes.bool.isRequired,
  player1Name: PropTypes.string,
  player2Name: PropTypes.string,
  player1Score: PropTypes.number.isRequired,
  player2Score: PropTypes.number.isRequired,
};

TopBar.defaultProps = {
  player1Name: "Player 1",
  player2Name: "Player 2",
}

export default TopBar;