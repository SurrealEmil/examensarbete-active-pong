/* import React from 'react'; */
import PropTypes from 'prop-types';
import './ConnectButton.css'; 

/**
 * ConnectButton
 *
 * Button to connect Joy-Cons.
 */
const ConnectButton = ({ isConnected, onClick }) => (
  <button onClick={onClick} className="connect-button">
    {isConnected ? 'Joy-Con Connected' : 'Connect Joy-Con'}
  </button>
);

ConnectButton.propTypes = {
  isConnected: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default ConnectButton;
