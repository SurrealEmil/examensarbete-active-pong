import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Matter from 'matter-js';
import audioManager from '../../utils/audioManager';
import PongCanvas from './PongCanvas';
import JoyConConnector from '../JoyCon/JoyConConnector';
import usePaddleControls from '../../hooks/usePaddleControls';
import useInitializeMatter from '../../hooks/useInitializeMatter';
import useGameLoop from '../../hooks/useGameLoop';
import WinnerOverlay from '../UI/WinnerOverlay';
import PauseOverlay from '../UI/PauseOverlay';
import StartOverlay from '../UI/StartOverlay';
import FpsOverlay from '../UI/FpsOverlay';
import TopBar from '../UI/TopBar';
import ScoreDisplay from '../UI/ScoreDisplay';
import GAME_CONFIG from '../../config/gameConfig';

const {
  // ──────────────────────────────────────────────────────────────────────────
  // PONG GAMELOOP SETTINGS (useGameLoop.js)
  // ──────────────────────────────────────────────────────────────────────────
  BALL_SPEED,
  MAX_BALL_SPEED,
  SPEED_INCREMENT,
  MIN_BALL_SPEED_THRESHOLD,
  BALL_RANDOM_ANGLE_RANGE,
  MAX_BOUNCE_ANGLE,
  BALL_RESET_DELAY,
  WINNING_SCORE,
  RANDOM_SIDE_THRESHOLD,

  // ──────────────────────────────────────────────────────────────────────────
  // PERFORMANCE
  // ──────────────────────────────────────────────────────────────────────────
  SPEED_ADJUST_THRESHOLD,
  FPS_SMOOTHING_FACTOR,
  LAG_SPIKE_THRESHOLD,
  SHOW_FPS,

  // ──────────────────────────────────────────────────────────────────────────
  // INITIALIZE MATTER SETTINGS (useInitializeMatter.js)
  // ──────────────────────────────────────────────────────────────────────────
  BALL_DIAMETER,
  PADDLE_WIDTH,
  PADDLE_HEIGHT,
  WALL_THICKNESS,
  PADDLE_OFFSET_LEFT_X,
  PADDLE_OFFSET_LEFT_Y,
  PADDLE_OFFSET_RIGHT_X,
  PADDLE_OFFSET_RIGHT_Y,
  BALL_FRICTION,
  BALL_FRICTION_AIR,
  BALL_RESTITUTION,
  BALL_INERTIA,

  // GRAVITY SETTINGS (useInitializeMatter.js)
  GRAVITY_X,  // Horizontal gravity force (default: 0)
  GRAVITY_Y,  // Vertical gravity force (default: 0)
  
  // Debug settings
  DEBUG,
  BACKGROUND_COLOR,
  WIRE_FRAMES,
  SHOW_COLLISIONS,
  SHOW_VELOCITY,
  SHOW_ANGLE_INDICATOR,
  SHOW_IDS,
  SHOW_POSITIONS,
  SHOW_BOUNDS,
  SHOW_AXES,
  SHOW_SLEEPING,
  SHOW_SEPARATIONS,
  SHOW_CONSTRAINTS,
  SHOW_DEBUG,
  SHOW_BROADPHASE,

  // ──────────────────────────────────────────────────────────────────────────
  // PADDLE CONTROL SETTINGS (usePaddleControls.js)
  // ──────────────────────────────────────────────────────────────────────────
  LEFT_JOYSTICK_DEAD_ZONE,
  LEFT_JOYSTICK_CALIBRATION_OFFSET,
  RIGHT_JOYSTICK_DEAD_ZONE,
  RIGHT_JOYSTICK_CALIBRATION_OFFSET,

  JOYSTICK_SWING_THRESHOLD,
  ORIENTATION_SWING_THRESHOLD,

  ORIENTATION_SCALE_UP,
  ORIENTATION_SCALE_DOWN,

  ORIENTATION_MIN_PITCH,
  ORIENTATION_MAX_PITCH,

  ACCEL_SMOOTHING_ALPHA,
  PITCH_SMOOTHING_FACTOR,

  JOYSTICK_BASE_SPEED,
  JOYSTICK_MAX_ACCELERATION,
  ORIENTATION_DEAD_ZONE,
  ORIENTATION_BOOST,

  // ──────────────────────────────────────────────────────────────────────────
  // RUMBLE SETTINGS (Shared by useGameLoop, JoyCon, etc.)
  // ──────────────────────────────────────────────────────────────────────────
  RUMBLE_INTENSITY_HIGH,
  RUMBLE_INTENSITY_LOW,
  RUMBLE_STRENGTH,
  RUMBLE_DURATION,
  RUMBLE_SECONDARY_INTENSITY_HIGH,
  RUMBLE_SECONDARY_INTENSITY_LOW,
  RUMBLE_SECONDARY_STRENGTH,
  RUMBLE_SECONDARY_DELAY,

} = GAME_CONFIG;



const PongGame = () => {
  const navigate = useNavigate();

  // 2) For dynamic screen sizing
  const canvasWidth = window.innerWidth;
  const canvasHeight = window.innerHeight;

  const [leftJoyConConnected, setLeftJoyConConnected] = useState(false);
  const [rightJoyConConnected, setRightJoyConConnected] = useState(false);

  // ──────────────────────────────────────────────────────────────────────────
  // INITIAL GAME STATE
  // ──────────────────────────────────────────────────────────────────────────
  const INITIAL_GAME_STATE = {
    ball: {
      x: canvasWidth / 2 - BALL_DIAMETER / 2,
      y: canvasHeight / 2 - BALL_DIAMETER / 2,
      width: BALL_DIAMETER,
      height: BALL_DIAMETER,
      dx: 0,
      dy: 0,
      resetting: false,
    },
    leftPaddle: {
      x: 25,
      y: canvasHeight / 2 - PADDLE_HEIGHT / 2,
      width: PADDLE_WIDTH,
      height: PADDLE_HEIGHT,
    },
    rightPaddle: {
      x: canvasWidth - (PADDLE_WIDTH + 25),
      y: canvasHeight / 2 - PADDLE_HEIGHT / 2,
      width: PADDLE_WIDTH,
      height: PADDLE_HEIGHT,
    },
    WALL_THICKNESS,
    canvasWidth,
    canvasHeight,
    scores: { player1: 0, player2: 0 },
  };

  // ──────────────────────────────────────────────────────────────────────────
  // REACT STATE
  // ──────────────────────────────────────────────────────────────────────────
  const [gameState, setGameState] = useState(INITIAL_GAME_STATE);
  const [gameStarted, setGameStarted] = useState(false);
  const [gamePaused, setGamePaused] = useState(false);

  // Control modes for each Joy-Con
  const [controlModeLeft, setControlModeLeft] = useState('accelerometer');
  const [controlModeRight, setControlModeRight] = useState('accelerometer');

  // ──────────────────────────────────────────────────────────────────────────
  // JOY-CON DATA
  // ──────────────────────────────────────────────────────────────────────────
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

  // ──────────────────────────────────────────────────────────────────────────
  // AUDIO
  // ──────────────────────────────────────────────────────────────────────────
  const {
    audioEnabled,
    setAudioEnabled,
    playHitSound,
    playSideSound,
    playMissSound,
    playMusicSound,
    stopMusicSound,
  } = audioManager();

  // ──────────────────────────────────────────────────────────────────────────
  // JOY-CON CONNECTION LISTENERS
  // ──────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const handleJoyConConnected = (event) => {
      const device = event.detail.device;
      if (device.productId === 0x2006) {
        setLeftJoyConConnected(true);
      } else if (device.productId === 0x2007) {
        setRightJoyConConnected(true);
      }
    };

    const handleJoyConDisconnected = (event) => {
      const device = event.detail.device;
      if (device.productId === 0x2006) {
        setLeftJoyConConnected(false);
      } else if (device.productId === 0x2007) {
        setRightJoyConConnected(false);
      }
    };

    document.addEventListener("joyconconnected", handleJoyConConnected);
    document.addEventListener("joycondisconnected", handleJoyConDisconnected);

    return () => {
      document.removeEventListener("joyconconnected", handleJoyConConnected);
      document.removeEventListener("joycondisconnected", handleJoyConDisconnected);
    };
  }, []);

  // ──────────────────────────────────────────────────────────────────────────
  // ESC KEY LISTENER FOR PAUSE
  // ──────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key !== "Escape") return; // Ignore all other keys
  
      // Prevent toggling pause if a winner has been determined.
      if (gameState.scores.player1 >= 5 || gameState.scores.player2 >= 5) {
        return;
      }
      
      setGamePaused((prev) => !prev);
    };
  
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState.scores]);

// ──────────────────────────────────────────────────────────────────────────
// MATTER.JS SETUP (No Runner started automatically)
// ──────────────────────────────────────────────────────────────────────────
const [engineVersion, setEngineVersion] = useState(0);

const {
  engineRef,
  runnerRef,
  renderRef,
  ballBodyRef,
  leftPaddleBodyRef,
  rightPaddleBodyRef,
} = useInitializeMatter({
  // ──────────────────────────────────────────────────────────────────────────
  // SCREEN DIMENSIONS
  // ──────────────────────────────────────────────────────────────────────────
  canvasWidth: canvasWidth,
  canvasHeight: canvasHeight,

  // ──────────────────────────────────────────────────────────────────────────
  // BALL SETTINGS
  // ──────────────────────────────────────────────────────────────────────────
  ballDiameter: BALL_DIAMETER,
  ballSpeed: BALL_SPEED, // Initial speed setting

  // ──────────────────────────────────────────────────────────────────────────
  // PADDLE SETTINGS
  // ──────────────────────────────────────────────────────────────────────────
  paddleWidth: PADDLE_WIDTH,
  paddleHeight: PADDLE_HEIGHT,
  paddleOffsetLeftX: PADDLE_OFFSET_LEFT_X,
  paddleOffsetLeftY: PADDLE_OFFSET_LEFT_Y,
  paddleOffsetRightX: PADDLE_OFFSET_RIGHT_X,
  paddleOffsetRightY: PADDLE_OFFSET_RIGHT_Y,

  // ──────────────────────────────────────────────────────────────────────────
  // WALL & ARENA SETTINGS
  // ──────────────────────────────────────────────────────────────────────────
  wallThickness: WALL_THICKNESS,
  
  // ──────────────────────────────────────────────────────────────────────────
  // BALL PHYSICS SETTINGS
  // ──────────────────────────────────────────────────────────────────────────
  ballFriction: BALL_FRICTION,
  ballFrictionAir: BALL_FRICTION_AIR,
  ballRestitution: BALL_RESTITUTION,
  ballInertia: BALL_INERTIA,

  // ──────────────────────────────────────────────────────────────────────────
  // GRAVITY SETTINGS
  // ──────────────────────────────────────────────────────────────────────────
  gravityX: GRAVITY_X, // Controls horizontal gravity force
  gravityY: GRAVITY_Y, // Controls vertical gravity force

  // ──────────────────────────────────────────────────────────────────────────
  // DEBUG & VISUAL SETTINGS
  // ──────────────────────────────────────────────────────────────────────────
  debug: DEBUG,
  backgroundColor: BACKGROUND_COLOR,
  wireFrames: WIRE_FRAMES,
  showCollisions: SHOW_COLLISIONS,
  showVelocity: SHOW_VELOCITY,
  showAngleIndicator: SHOW_ANGLE_INDICATOR,
  showIds: SHOW_IDS,
  showPositions: SHOW_POSITIONS,
  showBounds: SHOW_BOUNDS,
  showAxes: SHOW_AXES,
  showSleeping: SHOW_SLEEPING,
  showSeparations: SHOW_SEPARATIONS,
  showConstraints: SHOW_CONSTRAINTS,
  showDebug: SHOW_DEBUG,
  showBroadphase: SHOW_BROADPHASE,
  
  // ──────────────────────────────────────────────────────────────────────────
  // ENGINE VERSION (Triggers re-initialization)
  // ──────────────────────────────────────────────────────────────────────────
  version: engineVersion,
});

// ──────────────────────────────────────────────────────────────────────────
// PADDLE CONTROL HOOK
// ──────────────────────────────────────────────────────────────────────────
const {
  leftPaddleVelocityRef,
  leftPaddlePositionRef,
  rightPaddleVelocityRef,
  rightPaddlePositionRef,
} = usePaddleControls({
  gameStarted,
  controlModeLeft,
  controlModeRight,
  motionDataLeft,
  motionDataRight,
  joystickDataLeft,
  joystickDataRight,
  canvasHeight,
  WALL_THICKNESS,
  initialLeftPaddleY: gameState.leftPaddle.y,
  initialRightPaddleY: gameState.rightPaddle.y,
  leftPaddleHeight: gameState.leftPaddle.height,
  rightPaddleHeight: gameState.rightPaddle.height,

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

// ──────────────────────────────────────────────────────────────────────────
// FIXED TIMESTEP GAME LOOP (Custom)
// ──────────────────────────────────────────────────────────────────────────
const { fps, isLagSpike } = useGameLoop({
  gameStarted,
  gamePaused,
  gameState,
  setGameState,
  engineRef,
  ballBodyRef,
  leftPaddleBodyRef,
  rightPaddleBodyRef,
  leftPaddleVelocityRef,
  leftPaddlePositionRef,
  rightPaddleVelocityRef,
  rightPaddlePositionRef,
  canvasWidth,
  canvasHeight,
  WALL_THICKNESS: gameState.WALL_THICKNESS,
  playMissSound,
  playSideSound,
  playHitSound,
  playMusicSound,
  controlModeLeft,
  controlModeRight,
  enableFps: SHOW_FPS,

  // ──────────────────────────────────────────────────────────────────────────
  // PERFORMANCE SETTINGS
  // ──────────────────────────────────────────────────────────────────────────
  lagSpikeThreshold: LAG_SPIKE_THRESHOLD,
  speedAdjustThreshold: SPEED_ADJUST_THRESHOLD,
  fpsSmoothingFactor: FPS_SMOOTHING_FACTOR,

  // ──────────────────────────────────────────────────────────────────────────
  // BALL MOVEMENT & BOUNCE SETTINGS
  // ──────────────────────────────────────────────────────────────────────────
  ballSpeed: BALL_SPEED,
  maxBallSpeed: MAX_BALL_SPEED,
  ballResetDelay: BALL_RESET_DELAY,
  speedIncrement: SPEED_INCREMENT,
  minBallSpeedThreshold: MIN_BALL_SPEED_THRESHOLD,
  ballRandomAngleRange: BALL_RANDOM_ANGLE_RANGE,
  maxBounceAngle: MAX_BOUNCE_ANGLE,

  // ──────────────────────────────────────────────────────────────────────────
  // RUMBLE (JOY-CON FEEDBACK) SETTINGS
  // ──────────────────────────────────────────────────────────────────────────
  rumbleDuration: RUMBLE_DURATION,
  rumbleIntensityHigh: RUMBLE_INTENSITY_HIGH,
  rumbleIntensityLow: RUMBLE_INTENSITY_LOW,
  rumbleStrength: RUMBLE_STRENGTH,
  rumbleSecondaryIntensityHigh: RUMBLE_SECONDARY_INTENSITY_HIGH,
  rumbleSecondaryIntensityLow: RUMBLE_SECONDARY_INTENSITY_LOW,
  rumbleSecondaryStrength: RUMBLE_SECONDARY_STRENGTH,
  rumbleSecondaryDelay: RUMBLE_SECONDARY_DELAY,


  randomSideThreshold: RANDOM_SIDE_THRESHOLD,
});

  // ──────────────────────────────────────────────────────────────────────────
  // PAUSE/RESUME Debug Renderer (Optional)
  // ──────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!engineRef.current) return;
    if (!gameStarted || gamePaused) {
      if (renderRef.current) {
        Matter.Render.stop(renderRef.current);
      }
    } else {
      if (renderRef.current) {
        Matter.Render.run(renderRef.current);
      }
    }
  }, [gameStarted, gamePaused, renderRef]);

  // ──────────────────────────────────────────────────────────────────────────
  // PAUSE/RESUME Matter.js Runner
  // ──────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!engineRef.current) return;
    if (gamePaused) {
      engineRef.current.timing.timeScale = 0;
    } else {
      engineRef.current.timing.timeScale = 1;
    }
  }, [gamePaused, engineRef]);


  // ──────────────────────────────────────────────────────────────────────────
  // HANDLE START / PAUSE / QUIT / RESTART
  // ──────────────────────────────────────────────────────────────────────────
  const handleResume = () => {
    if (engineRef.current) {
      engineRef.current.timing.timeScale = 1;
    }
    setGamePaused(false);
  };

  const handleQuit = () => {
    setGameStarted(false);
    setGamePaused(false);
    stopMusicSound()
    navigate('/');
  };

  const handleRestart = () => {
  // Increase version so useInitializeMatter tears down & recreates
  setEngineVersion((prev) => prev + 1);

  // 3) Reset your React states
    setGameState(INITIAL_GAME_STATE);
    setGameStarted(false);
    setGamePaused(false);
  };

  // NEW: Pause the game when a player wins (first to 5)
  useEffect(() => {
    if (gameState.scores.player1 >= WINNING_SCORE || gameState.scores.player2 >= WINNING_SCORE) {
      setGamePaused(true);
    }
  }, [gameState.scores]);

  // Compute gameOver to control overlay rendering
  const gameOver = 
  gameState.scores.player1 >= WINNING_SCORE || 
  gameState.scores.player2 >= WINNING_SCORE;

  const joyConConnectorRef = useRef(null);

  const handleStartGame = async () => {
    // Attempt Joy-Con connection
    if (joyConConnectorRef.current) {
      const connected = await joyConConnectorRef.current.connect();
      if (!connected) {
        alert('Cannot start game without Joy-Cons.');
        return;
      }
    }
    // Start game and musique!
    setGameStarted(true);
    setAudioEnabled(true);
    setGamePaused(false);

    // Start Matter.js simulation by running the runner
    if (runnerRef.current && engineRef.current) {
      Matter.Runner.run(runnerRef.current, engineRef.current);
    }

    // Start ball movement
    const randomSign = () => (Math.random() > 0.5 ? 1 : -1);
    Matter.Body.setVelocity(ballBodyRef.current, {
      x: BALL_SPEED * randomSign(),
      y: BALL_SPEED * randomSign(),
    });

    try {
      await playMusicSound()
      //console.log('Music started successfully!')
    } catch (error) {
      //console.log('Failed to start the music', error)
    }
  };

  useEffect(() => {
    if (gamePaused) {
      stopMusicSound()
    } else if (gameStarted) {
      playMusicSound()
    }
  }, [gamePaused, gameStarted])

  // ──────────────────────────────────────────────────────────────────────────
  // OPTIONAL: Toggle control modes
  // ──────────────────────────────────────────────────────────────────────────
  const toggleControlModeLeft = () => {
    setControlModeLeft((prev) => {
      const newMode = prev === 'accelerometer' ? 'joystick' : 'accelerometer';
      //console.log('Switched Left Joy-Con mode to:', newMode);
      leftPaddleVelocityRef.current = 0; // reset
      return newMode;
    });
  };

  const toggleControlModeRight = () => {
    setControlModeRight((prev) => {
      const newMode =
        prev === 'accelerometer' ? 'joystick' : 'accelerometer';
      //console.log('Switched Right Joy-Con mode to:', newMode);
      rightPaddleVelocityRef.current = 0; // reset
      return newMode;
    });
  };

  // ──────────────────────────────────────────────────────────────────────────
  // RENDER
  // ──────────────────────────────────────────────────────────────────────────
  return (
    <div className="pong-game-wrapper">
      {/* Top Bar */}
     <TopBar leftJoyConConnected={leftJoyConConnected} rightJoyConConnected={rightJoyConConnected}/>

      {/* Winner Overlay (if a player reaches 5) */}
      {gameOver && (
        <WinnerOverlay
          winner={gameState.scores.player1 >= WINNING_SCORE ? 'Player 1' : 'Player 2'}
          onRestart={handleRestart}
          onQuit={handleQuit}
        />
      )}

      <div className="pong-game-container">
          {/* SCORES */}
          <ScoreDisplay
            player1Score={gameState.scores.player1}
            player2Score={gameState.scores.player2}
          />
           {/* CANVAS */}
          <PongCanvas
          gameState={gameState}
          canvasWidth={canvasWidth}
          canvasHeight={canvasHeight}
          wallThickness={WALL_THICKNESS}
        />
        </div>
        {/* START OVERLAY */}
        {!gameStarted && <StartOverlay onStart={handleStartGame}/>}

      {/* PAUSE OVERLAY (only shows if game is paused and not game over) */}
      {gamePaused && gameStarted && !gameOver && (
        <PauseOverlay 
        onResume={handleResume}
        onQuit={handleQuit}
      />

      
      )}

      {/* <div className="pong-game-container"> */}

       

       
      

    {/* FPS Display Overlay */}
    <FpsOverlay fps={fps} isLagSpike={isLagSpike} />

    {/* Joy-Con Controls
    <div className="controls-container">
      <div className="control-toggle">
        <button onClick={toggleControlModeLeft}>
          {controlModeLeft === 'accelerometer' ? 'Joystick' : 'Accelerometer'}
        </button>
        <button onClick={toggleControlModeRight}>
          {controlModeRight === 'accelerometer' ? 'Joystick' : 'Accelerometer'}
        </button>
      </div>
      <div className="control-mode-indicator">
        <p>
          Control Mode:{' '}{controlModeLeft.charAt(0).toUpperCase() + controlModeLeft.slice(1)}
        </p>
        <p>
          Control Mode:{' '}{controlModeRight.charAt(0).toUpperCase() + controlModeRight.slice(1)}
        </p>
      </div>
    </div> */}

    {/* Joy-Con Connector */}
    <JoyConConnector
      ref={joyConConnectorRef}
      onMotionDataLeft={(data) => setMotionDataLeft(data)}
      onJoystickDataLeft={(data) => setJoystickDataLeft(data)}
      onMotionDataRight={(data) => setMotionDataRight(data)}
      onJoystickDataRight={(data) => setJoystickDataRight(data)}
      onToggleControlModeLeft={toggleControlModeLeft}
      onToggleControlModeRight={toggleControlModeRight}
    />
    </div>
  );
};

PongGame.propTypes = {};

export default PongGame;
