import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import JoyConConnector from '../JoyCon/JoyConConnector';
import usePaddleControls from '../../hooks/usePaddleControls';
import TopBar from '../UI/TopBar';
//import ScoreDisplay from '../UI/ScoreDisplay';
import PongCanvas from '../PongGame/PongCanvas-Lobby';
import '../PongGame/PongStyles.css';
import '../Lobby/Lobby.css'
import LobbyCameraOverlay from './LobbyCameraOverlay'
import API_BASE_URL from '../../config/apiConfig'
import axios from 'axios'

const LEFT_JOYSTICK_DEAD_ZONE = 0.3;
const LEFT_JOYSTICK_CALIBRATION_OFFSET = 0.1;
const RIGHT_JOYSTICK_DEAD_ZONE = 0.4;
const RIGHT_JOYSTICK_CALIBRATION_OFFSET = 0.4;
const JOYSTICK_SWING_THRESHOLD = 20;
const ORIENTATION_SWING_THRESHOLD = 5;
const ORIENTATION_SCALE_UP = 1.5;
const ORIENTATION_SCALE_DOWN = 1.0;
const ORIENTATION_MIN_PITCH = -50;
const ORIENTATION_MAX_PITCH = 50;
const ACCEL_SMOOTHING_ALPHA = 0.1;
const PITCH_SMOOTHING_FACTOR = 0.1;
const JOYSTICK_BASE_SPEED = 7;
const JOYSTICK_MAX_ACCELERATION = 5;
const ORIENTATION_DEAD_ZONE = 0.1;
const ORIENTATION_BOOST = 50;



const Lobby = ({ onPlayer1NameChange, onPlayer2NameChange}) => {
  
  // States for QR scanning
  const [scannedPlayers, setScannedPlayers] = useState({ player1: null, player2: null})
  const [overlayVisible, setOverlayVisible] = useState(true)
 /*  const [scanLock, setScanLock] = useState(false)

  const [lastScanned, setLastScanned] = useState(null);

 */

  const scannedQrCodesRef = useRef(new Set())

  // Function to fetch user data from QR code
  const handleScanComplete = async (qrCodeIdentifier) => {
    const trimmedCode = qrCodeIdentifier.trim();
    if (!trimmedCode) {
      console.warn("Empty QR code identifier received.");
      return;
    }
  
    // Stop scanning if both players are set.
    if (scannedPlayers.player1 && scannedPlayers.player2) return;
  
    try {
      const response = await axios.get(`${API_BASE_URL}/user/qr/${trimmedCode}`);
      console.log("API response: ", response);
      const playerData = response.data; // e.g., { userId: 'fe56f90b-...', username: 'nixon', ... }
      console.log("Player data: ", playerData);
  
      setScannedPlayers((prevPlayers) => {
        // Check if player1 exists and if the new scanned player's userId matches player1's userId.
        if (prevPlayers.player1 && playerData.userId === prevPlayers.player1.userId) {
          console.warn("Scanned player matches player 1. Continuing scanning.");
          return prevPlayers;
        }
        
        // If player1 is not yet assigned, assign new scan to player1.
        if (!prevPlayers.player1) {
          onPlayer1NameChange && onPlayer1NameChange(playerData.username);
          return { ...prevPlayers, player1: playerData };
        }
        
        // Otherwise, if player2 is not assigned and the new scan is different from player1, assign to player2.
        if (!prevPlayers.player2) {
          onPlayer2NameChange && onPlayer2NameChange(playerData.username);
          return { ...prevPlayers, player2: playerData };
        }
        return prevPlayers;
      });
    } catch (error) {
      console.log("Error fetching player data:", error.response || error);
    }
  };
  // This effect hides the overlay once both players are scanned.
  useEffect(() => {
    if (scannedPlayers.player1 && scannedPlayers.player2) {
      console.log("Both players scanned. Hiding overlay in 500ms...");
      const timer = setTimeout(() => {
        setOverlayVisible(false);
        console.log("Overlay hidden");
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [scannedPlayers]);



 
      // If the same QR code is scanned repeatedly, ignore subsequent scans.
/*       if (qrCodeIdentifier === lastScanned) {
        console.log("Same QR code processed recently. Ignoring duplicate scan.");
        return;
      }
      setLastScanned(qrCodeIdentifier); */





  // JoyCon ready callbacks
  const handleLeftReady = () => {
    console.log("Left ready confirmed!")  
    setLeftReady(true);};

  const handleRightReady = () => {
    console.log("Right ready confirmed!") 
    setRightReady(true);};

  const handleToggleControlModeLeft = () => {handleLeftReady();};
  const handleToggleControlModeRight = () => {handleRightReady();};

  // States for JoyCon connection and game
  const [leftReady, setLeftReady] = useState(false);
  const [rightReady, setRightReady] = useState(false);
  const [leftConnected, setLeftConnected] = useState(false);
  const [rightConnected, setRightConnected] = useState(false);
  const [countdown, setCountdown] = useState(null);
  /* const [attemptCount, setAttemptCount] = useState(0) */

  const navigate = useNavigate();
  const joyConConnectorRef = useRef(null);

  const canvasWidth = window.innerWidth;
  const canvasHeight = window.innerHeight;
  const paddleWidth = 10;
  const paddleHeight = 100;
  const wallThickness = 20;

  // Paddle positions and control mode state
  const [leftPaddleY, setLeftPaddleY] = useState(canvasHeight / 2 - paddleHeight / 2);
  const [rightPaddleY, setRightPaddleY] = useState(canvasHeight / 2 - paddleHeight / 2);
  const [controlModeLeft, setControlModeLeft] = useState('joystick')
  const [controlModeRight, setControlModeRight] = useState('joystick')

  // States for motion and joystick data
  const [motionDataLeft, setMotionDataLeft] = useState({
    accelX: 0,
    accelY: 0,
    accelZ: 0,
    gyroDpsX: 0,
    gyroDpsY: 0,
    gyroDpsZ: 0,
    gyroRpsX: 0,
    gyroRpsY: 0,
    gyroRpsZ: 0,
    orientationAlpha: 0,
    orientationBeta: 0,
    orientationGamma: 0,
  });
  const [joystickDataLeft, setJoystickDataLeft] = useState({
    leftHorizontal: 0,
    leftVertical: 0,
    rightHorizontal: 0,
    rightVertical: 0,
  });
  const [motionDataRight, setMotionDataRight] = useState({
    accelX: 0,
    accelY: 0,
    accelZ: 0,
    gyroDpsX: 0,
    gyroDpsY: 0,
    gyroDpsZ: 0,
    gyroRpsX: 0,
    gyroRpsY: 0,
    gyroRpsZ: 0,
    orientationAlpha: 0,
    orientationBeta: 0,
    orientationGamma: 0,
  });
  const [joystickDataRight, setJoystickDataRight] = useState({
    leftHorizontal: 0,
    leftVertical: 0,
    rightHorizontal: 0,
    rightVertical: 0,
  });

  // Define INITIAL_GAME_STATE before using it in the hook and state initialization
  const INITIAL_GAME_STATE = {
    canvasWidth,
    canvasHeight,
    wallThickness,
    scores: { player1: 0, player2: 0 },
    ball: {
      x: -100,
      y: -100,
      width: 0,
      height: 0,
      dx: 0,
      dy: 0,
      resetting: false,
    },
    leftPaddle: {
      x: 25,
      y: leftPaddleY,
      width: paddleWidth,
      height: paddleHeight,
    },
    rightPaddle: {
      x: canvasWidth - (paddleWidth + 25),
      y: rightPaddleY,
      width: paddleWidth,
      height: paddleHeight,
    },
  };

 
  const {
  
  } = usePaddleControls({
    gameStarted: true,
    controlModeLeft: controlModeLeft,
    controlModeRight: controlModeRight,
    motionDataLeft,
    motionDataRight,
    joystickDataLeft,
    joystickDataRight,
    canvasHeight,
    WALL_THICKNESS: wallThickness,
    initialLeftPaddleY: INITIAL_GAME_STATE.leftPaddle.y,
    initialRightPaddleY: INITIAL_GAME_STATE.rightPaddle.y,
    leftPaddleHeight: INITIAL_GAME_STATE.leftPaddle.height,
    rightPaddleHeight: INITIAL_GAME_STATE.rightPaddle.height,
    leftJoystickDeadZone: LEFT_JOYSTICK_DEAD_ZONE,
    leftJoystickCalibrationOffset: LEFT_JOYSTICK_CALIBRATION_OFFSET,
    rightJoystickDeadZone: RIGHT_JOYSTICK_DEAD_ZONE,
    rightJoystickCalibrationOffset: RIGHT_JOYSTICK_CALIBRATION_OFFSET,
    joystickSwingThreshold: JOYSTICK_SWING_THRESHOLD,
    orientationSwingThreshold: ORIENTATION_SWING_THRESHOLD,
    orientationScaleUp: ORIENTATION_SCALE_UP,
    orientationScaleDown: ORIENTATION_SCALE_DOWN,
    orientationMinPitch: ORIENTATION_MIN_PITCH,
    orientationMaxPitch: ORIENTATION_MAX_PITCH,
    accelSmoothingAlpha: ACCEL_SMOOTHING_ALPHA,
    pitchSmoothingFactor: PITCH_SMOOTHING_FACTOR,
    joystickBaseSpeed: JOYSTICK_BASE_SPEED,
    joystickMaxAcceleration: JOYSTICK_MAX_ACCELERATION,
    orientationDeadZone: ORIENTATION_DEAD_ZONE,
    orientationBoost: ORIENTATION_BOOST,
  });

  // Initialize game state with INITIAL_GAME_STATE
  const [gameState, setGameState] = useState(INITIAL_GAME_STATE);
  const [gameStarted, setGameStarted] = useState(false);
  const [gamePaused, setGamePaused] = useState(false);


//////////////////////////////////////////////////////
//-----------LEFT PADDLE (accelerometer)-------------
/////////////////////////////////////////////////////

  useEffect(() => {
    if (controlModeLeft === 'accelerometer'){
    const topBeta = -100
    const centerBeta = -7
    const bottomBeta = 100
    const sensitivityFactor = 1

    const centerY = (canvasHeight - paddleHeight) / 2
    const bottomY = canvasHeight -paddleHeight
  
    const beta = motionDataLeft.orientationBeta;
    //console.log("Beta :" ,beta)

    let newY
    
    if (beta <= centerBeta) {
      const t = (beta - topBeta) / (centerBeta - topBeta)
      newY = t * centerY * sensitivityFactor
  
    } else {
      const t = (beta - centerBeta) / (bottomBeta - centerBeta)
      newY = centerY + t * (bottomY - centerY) * sensitivityFactor
    }

    newY = Math.max(1, Math.min(newY, canvasHeight - paddleHeight - 1))

    setLeftPaddleY(newY)
  }}, [motionDataLeft.orientationBeta, canvasHeight, paddleHeight]);


//////////////////////////////////////////////////////
//---------------LEFT PADDLE(joystick)---------------
/////////////////////////////////////////////////////

  const joystickValueRefLeft = useRef(joystickDataLeft.leftVertical)
  useEffect(() => {
    joystickValueRefLeft.current = joystickDataLeft.leftVertical
  }, [joystickDataLeft.leftVertical])



  useEffect(() => {
    if (controlModeLeft === 'joystick') {
    let animationFrameId
    const speed = 20

    const updatePaddle = () => {
    if(Math.abs(joystickValueRefLeft.current) > LEFT_JOYSTICK_DEAD_ZONE){
    setLeftPaddleY(prev => {
      const newY = prev + joystickValueRefLeft.current * speed
      //console.log(joystickValueRef)
      return Math.max(20, Math.min(newY, canvasHeight - paddleHeight - 20))
      
    })}
    console.log("Left vertical raw:", joystickValueRefLeft.current);
    animationFrameId = requestAnimationFrame(updatePaddle)
  }

  updatePaddle()
  

  return() => cancelAnimationFrame(animationFrameId)

  }}, [canvasHeight, paddleHeight, controlModeLeft])


//////////////////////////////////////////////////////
//---------RIGHT PADDLE (accelerometer)--------------
/////////////////////////////////////////////////////

  useEffect(() => {
    if (controlModeRight === 'accelerometer'){
    const topBeta = -100
    const centerBeta = -7
    const bottomBeta = 100
    const sensitivityFactor = 1

    const centerY = (canvasHeight - paddleHeight) / 2
    const bottomY = canvasHeight -paddleHeight
  
    const beta = motionDataRight.orientationBeta;
    //console.log("Beta :" ,beta)

    let newY
    
    if (beta <= centerBeta) {
      const t = (beta - topBeta) / (centerBeta - topBeta)
      newY = t * centerY * sensitivityFactor
  
    } else {
      const t = (beta - centerBeta) / (bottomBeta - centerBeta)
      newY = centerY + t * (bottomY - centerY) * sensitivityFactor
    }

    newY = Math.max(1, Math.min(newY, canvasHeight - paddleHeight - 1))

    setRightPaddleY(newY)
  }}, [motionDataRight.orientationBeta, canvasHeight, paddleHeight]);

//////////////////////////////////////////////////////
//---------RIGHT PADDLE (joystick)-------------------
/////////////////////////////////////////////////////

  const joystickValueRefRight = useRef(joystickDataRight.rightVertical)
  useEffect(() => {
    joystickValueRefRight.current = joystickDataRight.rightVertical
  }, [joystickDataRight.rightVertical])

  useEffect(() => {
    if(controlModeRight === 'joystick'){
      let animationFrameId
      const speed = 20

      const updatePaddle = () => {
      if(Math.abs(joystickValueRefRight.current) > RIGHT_JOYSTICK_DEAD_ZONE){
      setRightPaddleY(prev => {
        const newY = prev + joystickValueRefRight.current * speed
        return Math.max(20, Math.min(newY, canvasHeight - paddleHeight - 20))
      })}
      console.log("Right vertical raw:", joystickValueRefRight.current);
      animationFrameId = requestAnimationFrame(updatePaddle)
    }
    updatePaddle()

    return() => cancelAnimationFrame(animationFrameId)
    
  }}, [canvasHeight, paddleHeight, controlModeRight])
 
  
  useEffect(() => {
    setGameState(prevState => ({
      ...prevState,
      leftPaddle: {
        ...prevState.leftPaddle,
        y: leftPaddleY,
      },
      rightPaddle: {
        ...prevState.rightPaddle,
        y: rightPaddleY,
      }
    }));
  }, [leftPaddleY, rightPaddleY]);


//////////////////////////////////////////////////////
//---------------TOGGLE MODE CODE--------------------
/////////////////////////////////////////////////////


  const toggleControlModeLeft = () => {
    //console.log("Toggle left control mode");
    setControlModeLeft(prev =>
      prev === 'accelerometer' ? 'joystick' : 'accelerometer'
    )
  };

  const toggleControlModeRight = () => {
    //console.log("Toggle right control mode");
    setControlModeRight(prev =>
      prev === 'accelerometer' ? 'joystick' : 'accelerometer'
    )
  };

  // Function to check connected gamepads
  const checkGamepads = () => {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    for (const gp of gamepads) {
      if (gp && gp.id) {
        if (gp.id.includes("Joy-Con L+R")) {
          setLeftConnected(true);
          setRightConnected(true);
        } else {
          if (gp.id.includes("Joy-Con (L)")) setLeftConnected(true);
          if (gp.id.includes("Joy-Con (R)")) setRightConnected(true);
        }
      }
    }
  };

 /*  useEffect(() => {
    checkGamepads();
    const interval = setInterval(checkGamepads, 1000);
    return () => clearInterval(interval);
  }, []); */

  // Listen for custom JoyCon events
  useEffect(() => {
    const handleJoyConConnected = (event) => {
      const device = event.detail.device;
      if (device.productId === 0x2006) {
        setLeftConnected(true);
      } else if (device.productId === 0x2007) {
        setRightConnected(true);
      }
    };
    const handleJoyConDisconnected = (event) => {
      const device = event.detail.device;
      if (device.productId === 0x2006) {
        setLeftConnected(false);
      } else if (device.productId === 0x2007) {
        setRightConnected(false);
      }
    };

    document.addEventListener('joyconconnected', handleJoyConConnected);
    document.addEventListener('joycondisconnected', handleJoyConDisconnected);
    return () => {
      document.removeEventListener('joyconconnected', handleJoyConConnected);
      document.removeEventListener('joycondisconnected', handleJoyConDisconnected);
    };
  }, []);

  // Start countdown when both Joy-Cons are connected
  useEffect(() => {
    if (leftConnected && rightConnected && leftReady && rightReady && countdown === null) {
      setCountdown(3);
    }
  }, [leftConnected, rightConnected, leftReady, rightReady, countdown]);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown > 0) {
      const timer = setTimeout(()=> setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
    if (countdown === 0){
    const timer = setTimeout(() => navigate('/tournament', {
      state: {
        player1: scannedPlayers.player1,
        player2: scannedPlayers.player2,
      }
    }), 1100);
    return () => clearTimeout(timer);
}}, [countdown, navigate]);              


  // Connect JoyCons on mount (but we'll render the connector only after QR scanning)
 /*  useEffect(() => {
    if (joyConConnectorRef.current) {
      joyConConnectorRef.current.connect().then((connected) => {
        if (!connected) {
          console.warn("Could not connect JoyCons in lobby");
        }
      });
    }
  }, []);

  useEffect(() => {
    if(leftConnected && rightConnected){
      setAttemptCount(0)
      return
    }
  

  const interval = setInterval(() => {
    joyConConnectorRef.current?.connect().then((connected) => {
      if(!connected){
        console.warn("Re-connect attemp failed")
      }
    })


  setAttemptCount((prev) => {
    const newCount = prev + 1
    if (newCount >= 3 && (!leftConnected || !rightConnected)){
      console.warn("Still no JoyCons after multiple attemps. Reloading...")
        window.location.reload()
      }
      return newCount
  })
}, 500000)

return () => clearInterval(interval)
}, [leftConnected, rightConnected]) */

const handleConnectJoyCons = async () => {
  try {
    if (joyConConnectorRef.current) {
      const connected = await joyConConnectorRef.current.connect();
      if (!connected) {
        console.warn("Could not connect JoyCons. Make sure they're paired via Bluetooth and accessible.");
      } else {
        console.log("JoyCons connected successfully!");
      }
    }
  } catch (error) {
    console.error("Error connecting JoyCons:", error);
  }
};

// (4) Add a keydown listener that calls handleConnectJoyCons if the user hits space bar.
useEffect(() => {
  const onKeyDown = (e) => {
    if (e.code === 'Space') {
      console.log("Space bar pressed. Attempting JoyCon connection.");
      handleConnectJoyCons();
    }
  };

  window.addEventListener('keydown', onKeyDown);
  return () => window.removeEventListener('keydown', onKeyDown);
}, []);


const DelayedLobbyCameraOverlay = (props) => {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 500)
    return () => clearTimeout(timer)
    
  },[])

  return show ? <LobbyCameraOverlay {...props} /> : null;
}
  // A simple flag to check if both QR codes are scanned.
  const isQRScanned = scannedPlayers.player1 && scannedPlayers.player2

  
  return (
    <div className="pong-game-wrapper">
      {/* Always render the main UI */}
      <TopBar
        leftJoyConConnected={leftConnected}
        rightJoyConConnected={rightConnected}
        player1Name={scannedPlayers.player1?.username || 'Waiting for player 1'}
        player2Name={scannedPlayers.player2?.username || 'Waiting for player 2'}
      />
      <div className="pong-game-container">
        <div className="connection-status">
          <div className="player-1">
            <p className={!leftConnected ? "pulsate" : ""}>
              {leftConnected ? "Connected" : "Searching for JoyCon"}
            </p>
            {leftConnected && (
              <p className="ready-msg-1">
                {leftReady ? "Ready" : "Press button when ready"}
              </p>
            )}
          </div>
          <div className="player-2">
            <p className={!rightConnected ? "pulsate" : ""}>
              {rightConnected ? "Connected" : "Searching for JoyCon"}
            </p>
            {rightConnected && (
              <p className="ready-msg-2">
                {rightReady ? "Ready" : "Press button when ready"}
              </p>
            )}
          </div>
        </div>
        <PongCanvas
          gameState={gameState}
          canvasWidth={canvasWidth}
          canvasHeight={canvasHeight}
          wallThickness={wallThickness}
        />
      </div>
      {countdown !== null && (
        <div className="countdown">
          <h3>
            {countdown > 0 ? `Game starting in ${countdown}` : "GO!!!!!..."}
          </h3>
        </div>
      )}
      
  
      {/* Conditionally render the QR scanning overlay on top */}
      {overlayVisible && !(scannedPlayers.player1 && scannedPlayers.player2) && (
        <DelayedLobbyCameraOverlay
          key={`${scannedPlayers.player1}-${scannedPlayers.player2}`}
          onComplete={handleScanComplete}
          searchingText={
            !scannedPlayers.player1
              ? "Scanning QR code for player 1"
              : "Scanning QR code for player 2"
          }
        />
      )}
    {isQRScanned && (
      <JoyConConnector
        ref={joyConConnectorRef}
        onMotionDataLeft={(data) => setMotionDataLeft(data)}
        onJoystickDataLeft={(data) => setJoystickDataLeft(data)}
        onMotionDataRight={(data) => setMotionDataRight(data)}
        onJoystickDataRight={(data) => setJoystickDataRight(data)}
        onToggleControlModeLeft={handleToggleControlModeLeft}
        onToggleControlModeRight={handleToggleControlModeRight}
      />
    )}
    </div>
  );
  
};

export default Lobby;