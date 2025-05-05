const GAME_CONFIG = {
    // ─────────────────────────────────────────────────────────────────────────
    // PONG GAMELOOP SETTINGS (useGameLoop.js)
    // ─────────────────────────────────────────────────────────────────────────
    NUM_BALLS: 2,
    BALL_SPEED: 9, // Initial ball speed when the game starts
    MAX_BALL_SPEED: 15, // Maximum speed the ball can reach
    SPEED_INCREMENT: 1, // How much the ball speed increases over time
    MIN_BALL_SPEED_THRESHOLD: 0.001, // Minimum speed before ball is considered stopped
    BALL_RANDOM_ANGLE_RANGE: Math.PI / 2, // Random variation in ball launch angles
    MAX_BOUNCE_ANGLE: Math.PI / 3, // Maximum angle at which the ball can bounce off paddles
    BALL_RESET_DELAY: 400, // Time (ms) before ball resets after scoring
    WINNING_SCORE: 1000000, // Score required to win the game
    RANDOM_SIDE_THRESHOLD: 0.5, // 50% chance of ball launching to the left or right
    
    // PERFORMANCE & DEBUG SETTINGS
    SPEED_ADJUST_THRESHOLD: 0.2, // Threshold for dynamic speed adjustments (to maintain smooth FPS)
    FPS_SMOOTHING_FACTOR: 0.05, // Factor for smoothing FPS fluctuations
    LAG_SPIKE_THRESHOLD: 30, // Threshold (ms) to detect a lag spike
    SHOW_FPS: false, // Display FPS counter in debug mode

    // ─────────────────────────────────────────────────────────────────────────
    // INITIALIZE MATTER SETTINGS (useInitializeMatter.js)
    // ─────────────────────────────────────────────────────────────────────────
    GRAVITY_X: 0, // Horizontal gravity (default: 0, no horizontal force)
    GRAVITY_Y: -0.1, // Vertical gravity (negative = upward pull, for slight floaty effect)
    BALL_DIAMETER: 20, // Diameter of the ball
    PADDLE_WIDTH: 20, // Width of the paddles
    PADDLE_HEIGHT: 200, // Height of the paddles
    WALL_THICKNESS: 10, // Thickness of the walls
    PADDLE_OFFSET_LEFT_X: 25, // X position offset for left paddle
    PADDLE_OFFSET_LEFT_Y: 200, // Y position offset for left paddle
    PADDLE_OFFSET_RIGHT_X: 25, // X position offset for right paddle
    PADDLE_OFFSET_RIGHT_Y: 0, // Y position offset for right paddle
    BALL_FRICTION: 0, // Ball surface friction (0 = no friction)
    BALL_FRICTION_AIR: 0, // Ball air resistance (0 = no drag)
    BALL_RESTITUTION: 1, // Bounciness (1 = perfectly elastic bounce)
    BALL_INERTIA: Infinity, // Prevents ball from rotating

    // ─────────────────────────────────────────────────────────────────────────
    // DEBUG OPTIONS
    // ─────────────────────────────────────────────────────────────────────────
    DEBUG: false, // Master toggle for all debug options
    BACKGROUND_COLOR: '#1e1e1e', // Background color of the game canvas
    WIRE_FRAMES: true, // Show wireframe mode instead of solid bodies
    SHOW_COLLISIONS: true, // Show collision outlines when objects collide
    SHOW_VELOCITY: true, // Display velocity vectors for moving bodies
    SHOW_ANGLE_INDICATOR: true, // Show rotational angles for objects
    SHOW_IDS: true, // Show Matter.js body IDs for debugging
    SHOW_POSITIONS: true, // Display center positions of bodies
    SHOW_BOUNDS: true, // Show AABB (bounding boxes) around objects
    SHOW_AXES: true, // Show X and Y axes for each body
    SHOW_SLEEPING: true, // Gray out bodies that are inactive (not moving)
    SHOW_SEPARATIONS: true, // Show collision separation vectors
    SHOW_CONSTRAINTS: true, // Show constraints (joints, ropes, etc.)
    SHOW_DEBUG: true, // Display internal Matter.js debug info
    SHOW_BROADPHASE: true, // Highlights active collision detection regions

    // ─────────────────────────────────────────────────────────────────────────
    // PADDLE CONTROL SETTINGS (usePaddleControls.js)
    // ─────────────────────────────────────────────────────────────────────────
    
    // Joystick Sensitivity & Dead Zones
    LEFT_JOYSTICK_DEAD_ZONE: 0.1, // Minimum joystick input required for movement (Left paddle)
    LEFT_JOYSTICK_CALIBRATION_OFFSET: 0.1, // Adjusts the center position of the joystick input (Left paddle)
    RIGHT_JOYSTICK_DEAD_ZONE: 0.1, // Minimum joystick input required for movement (Right paddle)
    RIGHT_JOYSTICK_CALIBRATION_OFFSET: 0.4, // Adjusts the center position of the joystick input (Right paddle)

    // Motion Sensor Sensitivity
    JOYSTICK_SWING_THRESHOLD: 20, // Gyroscope threshold for detecting a paddle swing
    ORIENTATION_SWING_THRESHOLD: 5, // Threshold for detecting quick motion swings

    // Orientation-based Movement Scaling
    ORIENTATION_SCALE_UP: 1.5, // Multiplier for upward movement
    ORIENTATION_SCALE_DOWN: 1.0, // Multiplier for downward movement

    // Orientation Clamping (Limits movement range)
    ORIENTATION_MIN_PITCH: -50, // Minimum tilt angle for movement
    ORIENTATION_MAX_PITCH: 50, // Maximum tilt angle for movement

    // Smoothing Factors
    ACCEL_SMOOTHING_ALPHA: 0.1, // Smoothing factor for acceleration values
    PITCH_SMOOTHING_FACTOR: 0.1, // Smoothing factor for tilt-based movement

    // Joystick Movement Tuning
    JOYSTICK_BASE_SPEED: 7, // Base movement speed for joystick control
    JOYSTICK_MAX_ACCELERATION: 9, // Max acceleration multiplier for joystick movement
    ORIENTATION_DEAD_ZONE: 0.1, // Dead zone for orientation-based movement (prevents jitter)
    ORIENTATION_BOOST: 50, // Additional boost applied when tilting quickly

    // ─────────────────────────────────────────────────────────────────────────
    // RUMBLE SETTINGS (Shared by useGameLoop, JoyCon, etc.)
    // ─────────────────────────────────────────────────────────────────────────
    RUMBLE_INTENSITY_HIGH: 120, // Maximum intensity for strong rumble feedback
    RUMBLE_INTENSITY_LOW: 10, // Minimum intensity for weak rumble feedback
    RUMBLE_STRENGTH: 0.7, // Overall rumble power (scales intensity)
    RUMBLE_DURATION: 800, // Duration (ms) of rumble effect
    RUMBLE_SECONDARY_INTENSITY_HIGH: 100, // Alternate rumble intensity (used for varied feedback)
    RUMBLE_SECONDARY_INTENSITY_LOW: 60, // Alternate weak rumble intensity
    RUMBLE_SECONDARY_STRENGTH: 0, // Alternate rumble strength (not currently used)
    RUMBLE_SECONDARY_DELAY: 500, // Delay before triggering secondary rumble effect
};

export default GAME_CONFIG;
