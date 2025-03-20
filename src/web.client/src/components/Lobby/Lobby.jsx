import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import JoyConConnector from '../JoyCon/JoyConConnector';
import usePaddleControls from '../../hooks/usePaddleControls';
import TopBar from '../UI/TopBar';
//import ScoreDisplay from '../UI/ScoreDisplay';
import PongCanvas from '../PongGame/PongCanvas';
import '../PongGame/PongStyles.css';
import '../Lobby/Lobby.css'
import LobbyCameraOverlay from './LobbyCameraOverlay'
import API_BASE_URL from '../../config/apiConfig'
import axios from 'axios'

const LEFT_JOYSTICK_DEAD_ZONE = 0.3;
const LEFT_JOYSTICK_CALIBRATION_OFFSET = 0.1;
const RIGHT_JOYSTICK_DEAD_ZONE = 0.3;
const RIGHT_JOYSTICK_CALIBRATION_OFFSET = 0.3;
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



const Lobby = () => {
  
  const [leftReady, setLeftReady] = useState(false);
  const [rightReady, setRightReady] = useState(false);
  const [scannedPlayers, setScannedPlayers] = useState({ player1: '', player2: ''})

  const [overlayVisible, setOverlayVisible] = useState(true)

  useEffect(() => {
    if (scannedPlayers.player1 && scannedPlayers.player2) {
      console.log("Both players scanned. Hiding overlay in 500ms....");
      const timer = setTimeout(() => {
        setOverlayVisible(false);
        console.log("Overlay hidden");
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [scannedPlayers]);
  

  const handleScanComplete = async (qrCodeIdentifier) => {
    if(!qrCodeIdentifier || qrCodeIdentifier.trim() === ""){
      console.warn("Empty QR code identifier recieved.")
      return
    }
    try{
      const response = await axios.get(`${API_BASE_URL}/user/qr/${qrCodeIdentifier}`
        /* {withCredentials: true,} */
      )
      console.log("API response: ", response)
      const playerData = response.data
      setScannedPlayers((prevPlayers) => {
        if (!prevPlayers.player1) {
          return {...prevPlayers, player1: playerData.username}
        }
        if (!prevPlayers.player2){
          return {...prevPlayers, player2: playerData.username}
        }
        return prevPlayers
       })
    } catch (error){
      console.log("Error fetching player data:", error.response || error)
    }
  };

 // Define the "ready" callbacks. These will be triggered when JoyConConnector
  // detects the left/right stick press.
  const handleLeftReady = () => {
    //console.log("Left ready!");
    setLeftReady(true);
  };

  const handleRightReady = () => {
    //console.log("Right ready!");
    setRightReady(true);
  };

  // For example, you may already have a function to toggle control mode.
  // Instead, you can combine both behaviors if desired:
  const handleToggleControlModeLeft = () => {
    // If you want to do more than just mark as ready, you could do that here.
    handleLeftReady();
    // ... plus any additional logic if needed.
  };

  const handleToggleControlModeRight = () => {
    handleRightReady();
    // ... additional logic if necessary.
  };
  

 
 

  const navigate = useNavigate();
  const joyConConnectorRef = useRef(null);

  const [attemptCount, setAttemptCount] = useState(0)

  const [leftConnected, setLeftConnected] = useState(false);
  const [rightConnected, setRightConnected] = useState(false);
  const [countdown, setCountdown] = useState(null);

  const canvasWidth = window.innerWidth;
  const canvasHeight = window.innerHeight;

  // Constants for paddle dimensions
  const paddleWidth = 10;
  const paddleHeight = 100;
  const wallThickness = 20;

  

  // State variables for paddle Y positions
  const [leftPaddleY, setLeftPaddleY] = useState(canvasHeight / 2 - paddleHeight / 2);
  const [rightPaddleY, setRightPaddleY] = useState(canvasHeight / 2 - paddleHeight / 2);

  const [controlModeLeft, setControlModeLeft] = useState('accelerometer')
  const [controlModeRight, setControlModeRight] = useState('accelerometer')

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

 /*  useEffect(() => {
    //console.log("Updated motionDataLeft:", motionDataLeft);
  }, [motionDataLeft]); */

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

  useEffect(() => {
    checkGamepads();
    const interval = setInterval(checkGamepads, 1000);
    return () => clearInterval(interval);
  }, []);

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
    if (leftConnected && 
      rightConnected && 
      leftReady && 
      rightReady && 
      countdown === null) {
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
    const timer = setTimeout(() => navigate('/pong'), 1100);
    return () => clearTimeout(timer);
}}, [countdown, navigate]);


  // Connect JoyCons on mount
  useEffect(() => {
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
}, [leftConnected, rightConnected])

const DelayedLobbyCameraOverlay = (props) => {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 500)
    return () => clearTimeout(timer)
    
  },[])

  return show ? <LobbyCameraOverlay {...props} /> : null;
}
  

  
  return (
    <div className="pong-game-wrapper">
      
      <TopBar
        
     
//----------------------------------------------
//-----------CONNECTION ICONS-------------------
//----------------------------------------------
        leftJoyConConnected={leftConnected}
        rightJoyConConnected={rightConnected}
        player1Name={scannedPlayers.player1 || 'Waiting for player 1'}
        player2Name={scannedPlayers.player2 || 'Waiting for player 2'}

      />
      {overlayVisible && (
        <DelayedLobbyCameraOverlay 
        key={`${scannedPlayers.player1}-${scannedPlayers.player2}`}
        onComplete={handleScanComplete}
        searchingText={
          !scannedPlayers.player1
            ?"Searching for player 1"
            :"Searching for player 2"
        }
        />
      )}
      
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
          {rightConnected &&(
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
            {countdown > 0
              ? `Game starting in ${countdown}`
              : "GO!!!!!..."}
          </h3>
        </div>
      )}
      {/* Paddle testing controls */}
      <div className="paddle-controls">
      
        
      </div>
      {/* JoyConConnector for JoyCon input */}
      <JoyConConnector
        ref={joyConConnectorRef}
        onMotionDataLeft={(data) => setMotionDataLeft(data)}
        onJoystickDataLeft={(data) => setJoystickDataLeft(data)}
        onMotionDataRight={(data) => setMotionDataRight(data)}
        onJoystickDataRight={(data) => setJoystickDataRight(data)}
        onToggleControlModeLeft={handleToggleControlModeLeft}
        onToggleControlModeRight={handleToggleControlModeRight}
      />
    </div>
  );
};

export default Lobby;
