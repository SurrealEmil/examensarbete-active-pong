import React from 'react';
import PropTypes from 'prop-types';
import './JoyConVisualization.css'; 

/**
 * JoyConVisualization
 *
 * Displays a minimal visualization of a Joy-Con, including joystick position and button presses.
 */
const JoyConVisualization = ({ joyConType, data }) => {
  const joystickMultiplier = 10;
  const joystick = data.analogStick || { horizontal: 0, vertical: 0 };

  return (
    <div className={`joycon-visualization joycon-${joyConType}`}>
      <h3>{joyConType.charAt(0).toUpperCase() + joyConType.slice(1)} Joy-Con</h3>
      {/* Joystick visualization */}
      <div
        className="joystick"
        style={{
          transform: `translate(${joystick.horizontal * joystickMultiplier}px, ${
            joystick.vertical * joystickMultiplier
          }px)`,
        }}
      ></div>
      {/* Buttons highlight */}
      <div className="buttons">
        {Object.entries(data.buttons).map(([button, isPressed]) => (
          <span
            key={button}
            className={`button ${isPressed ? 'highlight' : ''}`}
          >
            {button.toUpperCase()}
          </span>
        ))}
      </div>
    </div>
  );
};

JoyConVisualization.propTypes = {
  joyConType: PropTypes.oneOf(['left', 'right']).isRequired,
  data: PropTypes.shape({
    buttons: PropTypes.object.isRequired,
    analogStick: PropTypes.shape({
      horizontal: PropTypes.number,
      vertical: PropTypes.number,
    }),
  }).isRequired,
};

export default JoyConVisualization;
