

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from 'react';
import PropTypes from 'prop-types';
import {
  connectJoyCon,
  connectedJoyCons,
  JoyConLeft,
  JoyConRight,
  GeneralController,
} from './index'; 
import './JoyConConnector.css';

// Import visualization components
import JoyConVisualization from '../JoyConVisuals/JoyConVisualization';
import ErrorMessage from '../JoyConVisuals/ErrorMessage';
import DebugPanel from '../JoyConVisuals/DebugPanel';
import DebugToggle from '../JoyConVisuals/DebugToggle';



// Call this function in a loop
/* setInterval(getJoyConData, 100); */



/**
 * JoyConConnector
 *
 * Connects to Joy-Con controllers, listens for input events, and extracts
 * accelerometer, gyroscope, and orientation data. This data is then passed
 * to parent components via callback functions.
 *
 * Props:
 * - onMotionDataLeft: Function to handle left Joy-Con motion data.
 * - onMotionDataRight: Function to handle right Joy-Con motion data.
 * - onJoystickDataLeft: Function to handle left Joy-Con joystick data.
 * - onJoystickDataRight: Function to handle right Joy-Con joystick data.
 */
const JoyConConnector = forwardRef(
  ({ 
    onMotionDataLeft, 
    onJoystickDataLeft, 
    onMotionDataRight, 
    onJoystickDataRight,
    onToggleControlModeLeft,
    onToggleControlModeRight,
  }, 
  ref) => {
    // State declarations
    const [error, setError] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [showDebug, setShowDebug] = useState(false);
    const [debugData, setDebugData] = useState({
      left: {
        packet: {},
        motionData: {},
        joystickData: {},
      },
      right: {
        packet: {},
        motionData: {},
        joystickData: {},
      },
    });
    const visualDataRef = useRef({
      left: null,
      right: null,
    });

    const THROTTLE_INTERVAL = 16; // ~60FPS
    const lastPacketTimeRef = useRef({
      left: 0,
      right: 0,
    });

    /**
     * Handle button interactions (LEDs, rumble, etc.)
     */
    const leftJoyConLeftStickPressedRef = useRef(false);
    const rightJoyConRightStickPressedRef = useRef(false);
    
    const handleButtonInteractions = useCallback((joyCon, buttons) => {
      // Check Joy-Con type
      const isLeftJoyCon = joyCon instanceof JoyConLeft;
      const isRightJoyCon = joyCon instanceof JoyConRight;
    
      // ---------------------------------------
      // If this is the LEFT Joy-Con, handle only its minus
      // ---------------------------------------
      if (isLeftJoyCon) {
        if (buttons.minus && !leftJoyConLeftStickPressedRef.current) {
          leftJoyConLeftStickPressedRef.current = true;
          // console.log("LEFT Joy-Con: YOU PRESSED LEFT MINUS!");
          joyCon.rumble(120, 10, 0.7);
            setTimeout(() => {
              joyCon.rumble(0, 0, 0); // Stop rumble after 100ms
          }, 400);
          onToggleControlModeLeft();
        } 
        else if (!buttons.minus && leftJoyConLeftStickPressedRef.current) {
          leftJoyConLeftStickPressedRef.current = false;
        }
      }
    
      // ----------------------------------------
      // If this is the RIGHT Joy-Con, handle only its plus
      // ----------------------------------------
      if (isRightJoyCon) {
        if (buttons.plus && !rightJoyConRightStickPressedRef.current) {
          rightJoyConRightStickPressedRef.current = true;
          // console.log("RIGHT Joy-Con: YOU PRESSED RIGHT PLUS!");
          joyCon.rumble(120, 10, 0.7);
            setTimeout(() => {
              joyCon.rumble(0, 0, 0); // Stop rumble after 100ms
          }, 400);
          onToggleControlModeRight();
        } 
        else if (!buttons.plus && rightJoyConRightStickPressedRef.current) {
          rightJoyConRightStickPressedRef.current = false;
        }
      }
      
      // ---------- OTHER BUTTONS ----------
      if (buttons.a || buttons.up) {
        joyCon.blinkLED(0);
      }
      if (buttons.b || buttons.down) {
        joyCon.setLED(0);
      }
      if (buttons.x || buttons.right) {
        joyCon.resetLED(0);
        // joyCon.rumble(400, 200, 0.1);
      }
      if (buttons.y || buttons.left) {
        // joyCon.rumble(150, 50, 0.5);
        //   setTimeout(() => {
        //     joyCon.rumble(30, 0, 0); // Stop rumble after 100ms
        // }, 1000);
      }
    }, [onToggleControlModeLeft, onToggleControlModeRight]);
    

    /**
     * Handle Debug Panel Toggle
     */
    const handleDebugToggle = () => {
      setShowDebug((prev) => {
        const newState = !prev;
        return newState;
      });
    };

    /**
     * Process incoming packets from Joy-Cons.
     *
     * @param {Object} joyCon - The Joy-Con instance.
     * @param {Object} packet - The data packet received from the Joy-Con.
     */
    /** THE JOY-CON API FETCH */

    const visualize = useCallback(
      (joyCon, packet) => {
        if (!packet) return;
    
        
        const joyConType =
          joyCon instanceof JoyConLeft
            ? 'left'
            : joyCon instanceof JoyConRight
            ? 'right'
            : 'general';

        const now = performance.now();

        // Throttle processing
        if (joyConType !== 'general') {
          const lastTime = lastPacketTimeRef.current[joyConType];
          if (now - lastTime < THROTTLE_INTERVAL) return;
          lastPacketTimeRef.current[joyConType] = now;
        }

    

    // Comprehensive logging for debugging
    //console.log('Received Packet:', packet);
    // Destructure necessary data from the packet
    const {
      actualAccelerometer: accelerometer = null,
      actualGyroscope: gyroscope = null,
      actualOrientation: orientation = null,
      analogStickLeft = {},
      analogStickRight = {},
      buttonStatus: buttons = {},
    } = packet;

     // Call the button handler
     handleButtonInteractions(joyCon, buttons);

    // Initialize objects to hold motion and joystick data
    let motionData = null;
    let joystickData = null;

    // ----- MOTION DATA -----
    if (accelerometer && gyroscope && orientation) {
      motionData = {
        accelX: parseFloat(accelerometer.x) || 0,
        accelY: parseFloat(accelerometer.y) || 0,
        accelZ: parseFloat(accelerometer.z) || 0,
        gyroDpsX: gyroscope.dps ? parseFloat(gyroscope.dps.x) || 0 : 0,
        gyroDpsY: gyroscope.dps ? parseFloat(gyroscope.dps.y) || 0 : 0,
        gyroDpsZ: gyroscope.dps ? parseFloat(gyroscope.dps.z) || 0 : 0,
        gyroRpsX: gyroscope.rps ? parseFloat(gyroscope.rps.x) || 0 : 0,
        gyroRpsY: gyroscope.rps ? parseFloat(gyroscope.rps.y) || 0 : 0,
        gyroRpsZ: gyroscope.rps ? parseFloat(gyroscope.rps.z) || 0 : 0,
        orientationAlpha: parseFloat(orientation.alpha) || 0,
        orientationBeta: parseFloat(orientation.beta) || 0,
        orientationGamma: parseFloat(orientation.gamma) || 0,
      };
      // Debugging: Log motion data
      //console.log('MOTIONDATA:', motionData);
    } else {
      /* console.warn('Incomplete Motion Data:', {
        accelerometer,
        gyroscope,
        orientation,
      }); */
    }

    // ----- JOYSTICK DATA -----
    if (analogStickLeft || analogStickRight) {
      joystickData = {
        leftHorizontal: Number(analogStickLeft?.horizontal) || 0,
        leftVertical: Number(analogStickLeft?.vertical) || 0,
        rightHorizontal: Number(analogStickRight?.horizontal) || 0,
        rightVertical: Number(analogStickRight?.vertical) || 0,
      };

      // Debugging: Log joystick data
      //console.log('JOYSTICKDATA:', joystickData);
    }

    // ----- BUTTON DATA -----
    if (buttons) {
      // Handle button interactions if necessary
      // Example: Trigger vibration or LED changes based on button presses
      // You can expand this section based on your game's requirements
      // For now, we'll just log the button status
      //console.log('BUTTONS:', buttons);
    }

    // Determine Joy-Con type
    // const joyConType =
    //   joyCon instanceof JoyConLeft
    //     ? 'left'
    //     : joyCon instanceof JoyConRight
    //     ? 'right'
    //     : 'general';

    // Update visualization and callbacks based on Joy-Con type
    if (joyConType === 'left') {
      visualDataRef.current.left = {
        buttons: buttons ?? {},
        analogStick: analogStickLeft,
      };
      if (motionData) onMotionDataLeft(motionData);
      if (joystickData) onJoystickDataLeft(joystickData);
      // if (showDebug) {
      //   setDebugData((prev) => ({
      //     ...prev,
      //     left: {
      //       packet: packet || {},
      //       motionData: motionData || {},
      //       joystickData: joystickData || {},
      //     },
      //   }));
      // }
    } else if (joyConType === 'right') {
      visualDataRef.current.right = {
        buttons: buttons ?? {},
        analogStick: analogStickRight,
      };
      if (motionData) onMotionDataRight(motionData);
      if (joystickData) onJoystickDataRight(joystickData);
      // if (showDebug) {
      //   setDebugData((prev) => ({
      //     ...prev,
      //     right: {
      //       packet: packet || {},
      //       motionData: motionData || {},
      //       joystickData: joystickData || {},
      //     },
      //   }));
      // }
    }
  },
  [
    onMotionDataLeft,
    onJoystickDataLeft,
    onMotionDataRight,
    onJoystickDataRight,
    handleButtonInteractions,
    showDebug,
    onToggleControlModeLeft,
    onToggleControlModeRight,
  ]
);


    /**
     * Creates an event listener for a specific Joy-Con.
     * Called every time the Joy-Con sends 'hidinput'.
     */
    const createHidInputHandler = useCallback(
      (joyCon) => (event) => {
        visualize(joyCon, event.detail);
      },
      [visualize]
    );

    /**
     * Initialize Joy-Cons, attach event listeners, enable vibration, etc.
     */
    const initializeJoyCons = useCallback(async () => {
      setError(null);
      try {
        await connectJoyCon(); // Prompts the user to select Joy-Cons
        //console.log('Joy-Con(s) connected successfully.');
        setIsConnected(true);

        connectedJoyCons.forEach(async (joyCon) => {
          if (!joyCon.eventListenerAttached) {
            joyCon.eventListenerAttached = true;
            await joyCon.enableVibration();

            // Create and store the event handler to ensure proper removal
            const handler = createHidInputHandler(joyCon);
            joyCon._hidInputHandler = handler;
            joyCon.addEventListener('hidinput', handler);

            // Example: handle special Ring-Con if needed
            if (joyCon instanceof GeneralController) {
              // Additional logic for Ring-Con or other controllers
            }
          }
        });

        return true; // Indicate successful connection
      } catch (err) {
        console.error('Failed to initialize Joy-Cons:', err);
        setError('Failed to initialize Joy-Cons.');
        return false; // Indicate failed connection
      }
    }, [createHidInputHandler]);

    /**
     * Connect button click
     */
    const handleConnectClick = () => {
      initializeJoyCons();
    };

    /**
     * Expose the connect function to parent via ref
     */
    useImperativeHandle(ref, () => ({
      connect: async () => {
        const success = await initializeJoyCons();
        return success;
      },
      isConnected,
    }));

    /**
     * Cleanup: remove event listeners and close Joy-Con devices on unmount
     */
    useEffect(() => {
      return () => {
        connectedJoyCons.forEach((joyCon) => {
          if (joyCon.eventListenerAttached && joyCon._hidInputHandler) {
            joyCon.removeEventListener('hidinput', joyCon._hidInputHandler);
            joyCon.eventListenerAttached = false;
            joyCon._hidInputHandler = null;
          }
          if (joyCon.opened) {
            joyCon.close();
          }
        });
      };
    }, []);

    return (
      <div className="joycon-connector">

      
        {/* Error Message */}
        {/* {error && <ErrorMessage message={error} onRetry={handleConnectClick} />} */}

        {/* Debug Toggle */}
       {/*  <DebugToggle isChecked={showDebug} onToggle={handleDebugToggle} /> */}

        {/* Debug Panel, optional */}
       {/*  {showDebug && <DebugPanel data={debugData} />} */}

        {/* Joy-Con Visualizations */}
        {/* <div className="joycon-visualizations">
          {visualData.left && (
            <JoyConVisualization joyConType="left" data={visualData.left} />
          )}
          {visualData.right && (
            <JoyConVisualization joyConType="right" data={visualData.right} />
          )}
            </div> */}
      </div>
    );
  }
);

/**
 * PropTypes definitions for clarity
 */
JoyConConnector.propTypes = {
  onMotionDataLeft: PropTypes.func.isRequired, // Callback for left Joy-Con accelerometer/gyroscope
  onJoystickDataLeft: PropTypes.func.isRequired, // Callback for left Joy-Con joystick data
  onMotionDataRight: PropTypes.func.isRequired, // Callback for right Joy-Con accelerometer/gyroscope
  onJoystickDataRight: PropTypes.func.isRequired, // Callback for right Joy-Con joystick data
};

export default JoyConConnector;



