import react from 'react'
import PropTypes from 'prop-types';
import './TopBar.css';



const TopBar = ({ leftJoyConConnected, rightJoyConConnected, player1Name, player2Name }) => {
  
 
  return (
    <div className="top-bar">
      <h3 className="player-1-container">
        {leftJoyConConnected && (
          <img className="joycon-icon-left" src="./img/joy-con-red.png" alt="Left Joy-Con" />
        )}
        <span>{player1Name}</span>
      </h3>
      <h2>
        <a href="/lobby" style={{ textDecoration: 'none', color: 'inherit' }}>{/* PONG */}</a>
      </h2>
      <h3 className="player-2-container">
        <span>{player2Name}</span>
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
  player1Name: PropTypes.string,
  player2Name: PropTypes.string,
};

TopBar.defaultProps = {
  player1Name: "Player 1",
  player2Name: "Player 2",
}

export default TopBar;
