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
  
      // 👇 Automatically connect JoyCons 3 times over 5 seconds
      const tryConnectInterval = setInterval(() => {
        console.log("Auto-connecting JoyCons...");
        handleConnectJoyCons();
      }, 400); // 5 attempts in 2 seconds
  
      // Stop after 5 attempts (400ms × 5 = 2000ms)
      const stopTimer = setTimeout(() => {
        clearInterval(tryConnectInterval);
      }, 2000);
  
      return () => {
        clearTimeout(timer);
        clearTimeout(stopTimer);
        clearInterval(tryConnectInterval);
      };
    }
  }, [scannedPlayers]);

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

  // Initialize game state with INITIAL_GAME_STATE
  const [gameState, setGameState] = useState(INITIAL_GAME_STATE);
  const [gameStarted, setGameStarted] = useState(false);
  const [gamePaused, setGamePaused] = useState(false);
  const [leftCurrentlyNeutral, setLeftCurrentlyNeutral] = useState(false);
  const [rightCurrentlyNeutral, setRightCurrentlyNeutral] = useState(false);

  // Final neutral values safely stored for later use
  const [finalCapturedNeutral, setFinalCapturedNeutral] = useState({
    left: 0.1,
    right: 0.1
  });

//////////////////////////////////////////////////////
//---------------LEFT PADDLE (joystick)---------------
/////////////////////////////////////////////////////

const joystickValueRefLeft = useRef(joystickDataLeft.leftVertical);
const neutralRefLeft = useRef(null); // To store neutral baseline

useEffect(() => {
  joystickValueRefLeft.current = joystickDataLeft.leftVertical;
}, [joystickDataLeft.leftVertical]);

useEffect(() => {
  if (controlModeLeft === 'joystick') {
    let animationFrameId;
    const speed = 20;

    // Listen for Spacebar to recalibrate neutral
    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        neutralRefLeft.current = joystickValueRefLeft.current;
        console.log("Neutral baseline manually captured (LEFT):", neutralRefLeft.current.toFixed(2));
        setFinalCapturedNeutral(prev => ({ ...prev, left: neutralRefLeft.current }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    const updatePaddle = (timestamp) => {
      const raw = joystickValueRefLeft.current;
    
      const adjusted = raw - neutralRefLeft.current;
      const clamped = Math.max(-1, Math.min(1, adjusted));
      const deadZone = 0.1;
      const final = Math.abs(clamped) > deadZone ? clamped : 0;
    
      // ADD THIS LINE:
      setLeftCurrentlyNeutral(final === 0);
    
      if (final !== 0) {
        setLeftPaddleY(prev => {
          const newY = prev + final * speed;
          return Math.max(20, Math.min(newY, canvasHeight - paddleHeight - 20));
        });
      }
    
      animationFrameId = requestAnimationFrame(updatePaddle);
    };

    animationFrameId = requestAnimationFrame(updatePaddle);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('keydown', handleKeyDown);
      neutralRefLeft.current = null; // Reset when unmounting or changing mode
    };
  }
}, [canvasHeight, paddleHeight, controlModeLeft]);

//////////////////////////////////////////////////////
//---------RIGHT PADDLE (joystick)-------------------
/////////////////////////////////////////////////////

const joystickValueRefRight = useRef(joystickDataRight.rightVertical);
const neutralRefRight = useRef(null); // To store neutral baseline

useEffect(() => {
  joystickValueRefRight.current = joystickDataRight.rightVertical;
}, [joystickDataRight.rightVertical]);

useEffect(() => {
  if (controlModeRight === 'joystick') {
    let animationFrameId;
    const speed = 20;

    // Listen for Spacebar to recalibrate neutral
    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        neutralRefRight.current = joystickValueRefRight.current;
        console.log("Neutral baseline manually captured (RIGHT):", neutralRefRight.current.toFixed(2));
        setFinalCapturedNeutral(prev => ({ ...prev, right: neutralRefRight.current }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    const updatePaddle = (timestamp) => {
      const raw = joystickValueRefRight.current;
    
      if (neutralRefRight.current === null) {
        animationFrameId = requestAnimationFrame(updatePaddle);
        return;
      }
    
      const adjusted = raw - neutralRefRight.current;
      const clamped = Math.max(-1, Math.min(1, adjusted));
    
      const deadZone = 0.1;
      const final = Math.abs(clamped) > deadZone ? clamped : 0;
    
      // ADD THIS:
      setRightCurrentlyNeutral(final === 0);
    
      if (final !== 0) {
        setRightPaddleY(prev => {
          const newY = prev + final * speed;
          return Math.max(20, Math.min(newY, canvasHeight - paddleHeight - 20));
        });
      }
    
      animationFrameId = requestAnimationFrame(updatePaddle);
    };    

    animationFrameId = requestAnimationFrame(updatePaddle);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('keydown', handleKeyDown);
      neutralRefRight.current = null; // Reset when unmounting or changing mode
    };
  }
}, [canvasHeight, paddleHeight, controlModeRight]);

 
//////////////////////////////////////////////////////
//---------PADDLE (joystick-auro-correction)-------------------
/////////////////////////////////////////////////////
  
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

  useEffect(() => {
    if (
      scannedPlayers.player1 &&
      scannedPlayers.player2 &&
      leftConnected &&
      rightConnected
    ) {
      console.log("✅ Both players scanned and Joy-Cons connected. Starting auto-neutral baseline capture...");
  
      let attempts = 0;
      const interval = setInterval(() => {
        if (attempts >= 5) {
          clearInterval(interval);
          return;
        }
        attempts++;
  
        neutralRefLeft.current = joystickValueRefLeft.current;
        neutralRefRight.current = joystickValueRefRight.current;

        setFinalCapturedNeutral({
          left: joystickValueRefLeft.current,
          right: joystickValueRefRight.current
        });
  
        console.log(`🎯 Auto neutral capture ${attempts}`);
        console.log("Neutral baseline manually captured (LEFT):", neutralRefLeft.current.toFixed(2));
        console.log("Neutral baseline manually captured (RIGHT):", neutralRefRight.current.toFixed(2));
      }, 400); // 5 times over 2 seconds
  
      return () => clearInterval(interval);
    }
  }, [scannedPlayers, leftConnected, rightConnected]);
  
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
        leftJoystickOffset: finalCapturedNeutral.left,
        rightJoystickOffset: finalCapturedNeutral.right
      }
    }), 1100);
    return () => clearTimeout(timer);
}}, [countdown, navigate]);              

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
      // 🔒 Only allow spacebar if both players are scanned in
      if (scannedPlayers.player1 && scannedPlayers.player2) {
        console.log("Space bar pressed. Attempting JoyCon connection.");
        handleConnectJoyCons();
      } else {
        console.log("Both players need to scan before JoyCons can connect.");
      }
    }
  };

  window.addEventListener('keydown', onKeyDown);
  return () => window.removeEventListener('keydown', onKeyDown);
}, [scannedPlayers]);


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
              <>
                <p className="ready-msg-1">
                  {leftReady ? "Ready" : "Press MINUS button when ready"}
                </p>

                {/* NEW! Show paddle neutral state */}
                {neutralRefLeft.current !== null && (
                  <p
                    className="neutralized-msg"
                    style={{
                      color: leftCurrentlyNeutral ? 'orange' : 'gray',
                    }}
                  >
                    Paddle {leftCurrentlyNeutral ? 'Zeroed!' : 'Moving...'}
                  </p>
                )}
              </>
            )}
          </div>
          <div className="player-2">
            <p className={!rightConnected ? "pulsate" : ""}>
              {rightConnected ? "Connected" : "Searching for JoyCon"}
            </p>

            {rightConnected && (
              <>
                <p className="ready-msg-2">
                  {rightReady ? "Ready" : "Press PLUS button when ready"}
                </p>

                {/* NEW! Show paddle neutral state */}
                {neutralRefRight.current !== null && (
                  <p
                    className="neutralized-msg"
                    style={{
                      color: rightCurrentlyNeutral ? 'orange' : 'gray',
                    }}
                  >
                    Paddle {rightCurrentlyNeutral ? 'Zeroed!' : 'Moving...'}
                  </p>
                )}
              </>
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