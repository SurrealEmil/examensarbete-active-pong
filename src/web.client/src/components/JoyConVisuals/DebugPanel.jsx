import React from 'react';
import PropTypes from 'prop-types';
import './DebugPanel.css'; 

/**
 * DebugPanel
 *
 * Displays raw packet data for debugging purposes.
 */
const DebugPanel = ({ data }) => (
  
  <div className="debug-panel">
    <pre>{JSON.stringify(data, null, 2)}</pre>
    
  </div>
);

DebugPanel.propTypes = {
  data: PropTypes.object.isRequired,
};

export default DebugPanel;
