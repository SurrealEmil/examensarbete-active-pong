/* import React from 'react'; */
import PropTypes from 'prop-types';
import './DebugToggle.css'; 

/**
 * DebugToggle
 *
 * Checkbox to toggle the debug panel.
 */
const DebugToggle = ({ isChecked, onToggle }) => (
  <div className="debug-toggle">
    <label>
      <input type="checkbox" onChange={onToggle} checked={isChecked} />
      Show Debug
    </label>
  </div>
);

DebugToggle.propTypes = {
  isChecked: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
};

export default DebugToggle;
