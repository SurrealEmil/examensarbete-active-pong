/* import React from 'react'; */
import PropTypes from 'prop-types';
import './ErrorMessage.css'; 

/**
 * ErrorMessage
 *
 * Displays an error message with a retry button.
 */
const ErrorMessage = ({ message, onRetry }) => (
  <div className="error-message">
    <p>{message}</p>
    <button onClick={onRetry}>Retry</button>
  </div>
);

ErrorMessage.propTypes = {
  message: PropTypes.string.isRequired,
  onRetry: PropTypes.func.isRequired,
};

export default ErrorMessage;
