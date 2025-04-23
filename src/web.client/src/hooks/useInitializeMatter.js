import { useRef, useEffect } from 'react';
import Matter from 'matter-js';

/**
 * Custom hook for setting up Matter.js in Pong.
 *
 * @param {Object} params - Configuration options for initializing Matter.js
 *
 * // ──────────────────────────────────────────────────────────────────────────
 * // SCREEN SETTINGS
 * // ──────────────────────────────────────────────────────────────────────────
 * @param {number} params.canvasWidth - The width of the canvas
 * @param {number} params.canvasHeight - The height of the canvas
 *
 * // ──────────────────────────────────────────────────────────────────────────
 * // BALL SETTINGS
 * // ──────────────────────────────────────────────────────────────────────────
 * @param {number} [params.ballDiameter=20] - Diameter of the ball
 * @param {number} [params.ballSpeed=10] - Initial speed of the ball
 * @param {number} [params.ballFriction=0] - Ball friction (0 for no friction)
 * @param {number} [params.ballFrictionAir=0] - Ball air resistance (0 for no drag)
 * @param {number} [params.ballRestitution=1] - Ball bounciness (1 = perfectly bouncy)
 * @param {number} [params.ballInertia=Infinity] - Ball rotational inertia (Infinity = no rotation)
 *
 * // ──────────────────────────────────────────────────────────────────────────
 * // PADDLE SETTINGS
 * // ──────────────────────────────────────────────────────────────────────────
 * @param {number} [params.paddleWidth=20] - Width of the paddles
 * @param {number} [params.paddleHeight=200] - Height of the paddles
 * @param {number} [params.paddleOffsetLeftX=25] - X offset for left paddle placement
 * @param {number} [params.paddleOffsetLeftY=200] - Y offset for left paddle placement
 * @param {number} [params.paddleOffsetRightX=25] - X offset for right paddle placement
 * @param {number} [params.paddleOffsetRightY=0] - Y offset for right paddle placement
 *
 * // ──────────────────────────────────────────────────────────────────────────
 * // WALL & ARENA SETTINGS
 * // ──────────────────────────────────────────────────────────────────────────
 * @param {number} [params.wallThickness=10] - Thickness of the top and bottom walls
 *
 * // ──────────────────────────────────────────────────────────────────────────
 * // GRAVITY SETTINGS
 * // ──────────────────────────────────────────────────────────────────────────
 * @param {number} [params.gravityX=0] - Horizontal gravity force (default: 0)
 * @param {number} [params.gravityY=0] - Vertical gravity force (default: 0)
 *
 * // ──────────────────────────────────────────────────────────────────────────
 * // DEBUG & VISUAL SETTINGS
 * // ──────────────────────────────────────────────────────────────────────────
 * @param {boolean} [params.debug=true] - Enable debug mode for Matter.js rendering
 * @param {string} [params.backgroundColor="#1e1e1e"] - Background color of the game canvas
 * 
 * // The following are only relevant if `debug` is true:
 * @param {boolean} [params.showWireframes=true] - If true, render bodies in wireframe mode
 * @param {boolean} [params.showCollisions=true] - If true, highlight collision overlays
 * @param {boolean} [params.showVelocity=true] - If true, display velocity vectors for all bodies
 * @param {boolean} [params.showAngleIndicator=true] - If true, show angle indicators on bodies
 * @param {boolean} [params.showIds=true] - If true, render each body's ID
 * @param {boolean} [params.showPositions=true] - If true, show center positions of bodies
 * @param {boolean} [params.showBounds=true] - If true, show bounding boxes (AABB)
 * @param {boolean} [params.showAxes=true] - If true, display X/Y axes on bodies
 * @param {boolean} [params.showSleeping=true] - If true, gray out sleeping (inactive) bodies
 * @param {boolean} [params.showSeparations=true] - If true, show collision separation vectors
 * @param {boolean} [params.showConstraints=true] - If true, show constraints (joints, ropes, etc.)
 * @param {boolean} [params.showDebug=true] - If true, show Matter.js internal debug info
 * @param {boolean} [params.showBroadphase=true] - If true, highlight active collision detection regions
 *
 * // ──────────────────────────────────────────────────────────────────────────
 * // ENGINE VERSION (Triggers re-initialization)
 * // ──────────────────────────────────────────────────────────────────────────
 * @param {number} [params.version=0] - Version key to trigger re-initialization
 *
 * @returns {Object} An object containing refs to:
 *  { engineRef, runnerRef, ballBodyRef, leftPaddleBodyRef, rightPaddleBodyRef }
 */


export default function useInitializeMatter({
  canvasWidth,
  canvasHeight,

  // ──────────────────────────────────────────────────────────────────────────
  // Number of balls to spawn (default: 1)
  // ──────────────────────────────────────────────────────────────────────────
  ballCount = 1,

  // ──────────────────────────────────────────────────────────────────────────
  // BALL SETTINGS
  // ──────────────────────────────────────────────────────────────────────────
  ballDiameter    = 20,
  ballFriction    = 0,
  ballFrictionAir = 0,
  ballRestitution = 1,
  ballInertia     = Infinity,

  // ──────────────────────────────────────────────────────────────────────────
  // PADDLE SETTINGS
  // ──────────────────────────────────────────────────────────────────────────
  paddleWidth        = 20,
  paddleHeight       = 200,
  paddleOffsetLeftX  = 25,
  paddleOffsetLeftY  = 200,
  paddleOffsetRightX = 25,
  paddleOffsetRightY = 0,

  // ──────────────────────────────────────────────────────────────────────────
  // WALL SETTINGS
  // ──────────────────────────────────────────────────────────────────────────
  wallThickness = 10,

  // ──────────────────────────────────────────────────────────────────────────
  // GRAVITY
  // ──────────────────────────────────────────────────────────────────────────
  gravityX = 0,
  gravityY = 0,

  // ──────────────────────────────────────────────────────────────────────────
  // DEBUG & RENDER OPTIONS
  // ──────────────────────────────────────────────────────────────────────────
  debug           = true,
  backgroundColor = '#1e1e1e',
  wireFrames      = true,
  showCollisions    = true,
  showVelocity      = true,
  showAngleIndicator = true,
  showIds            = true,
  showPositions      = true,
  showBounds         = true,
  showAxes           = true,
  showSleeping       = true,
  showSeparations    = true,
  showConstraints    = true,
  showDebug          = true,
  showBroadphase     = true,

  // ──────────────────────────────────────────────────────────────────────────
  // Bump this to force a full teardown & rebuild
  // ──────────────────────────────────────────────────────────────────────────
  version = 0,
}) {
  // ──────────────────────────────────────────────────────────────────────────
  // Refs for Matter.js engine, runner, renderer, composites & bodies
  // ──────────────────────────────────────────────────────────────────────────
  const engineRef          = useRef(null);
  const runnerRef          = useRef(null);
  const renderRef          = useRef(null);
  const wallsRef           = useRef(null);
  const ballBodyRefs       = useRef([]);     // ← array of Matter.Body
  const leftPaddleBodyRef  = useRef(null);
  const rightPaddleBodyRef = useRef(null);

  useEffect(() => {
    // ————————————————————————————————————————————————————————————————————
    // 1) TEARDOWN existing world if any
    // ————————————————————————————————————————————————————————————————————
    if (engineRef.current) {
      // stop renderer
      if (renderRef.current) {
        Matter.Render.stop(renderRef.current);
        renderRef.current.canvas.remove();
        renderRef.current.textures = {};
      }
      // stop runner
      if (runnerRef.current) {
        Matter.Runner.stop(runnerRef.current);
      }
      const world = engineRef.current.world;
      // remove walls & balls & paddles
      Matter.Composite.remove(world, wallsRef.current);
      ballBodyRefs.current.forEach(b => Matter.World.remove(world, b));
      Matter.World.remove(world, leftPaddleBodyRef.current);
      Matter.World.remove(world, rightPaddleBodyRef.current);
      // clear engine
      Matter.Engine.clear(engineRef.current);
      // reset refs
      engineRef.current = null;
      ballBodyRefs.current = [];
    }

    // ————————————————————————————————————————————————————————————————————
    // 2) CREATE new engine & runner
    // ————————————————————————————————————————————————————————————————————
    const engine = Matter.Engine.create();
    const runner = Matter.Runner.create();
    engine.world.gravity.x = gravityX;
    engine.world.gravity.y = gravityY;

    engineRef.current = engine;
    runnerRef.current = runner;

    // ————————————————————————————————————————————————————————————————————
    // 3) OPTIONAL DEBUG RENDERER
    // ————————————————————————————————————————————————————————————————————
    if (debug) {
      const render = Matter.Render.create({
        element: document.querySelector('.pong-game-container'),
        engine,
        options: {
          width: canvasWidth,
          height: canvasHeight,
          wireframes,
          background: backgroundColor,
          showCollisions,
          showVelocity,
          showAngleIndicator,
          showIds,
          showPositions,
          showBounds,
          showAxes,
          showSleeping,
          showSeparations,
          showConstraints,
          showDebug,
          showBroadphase,
        },
      });
      renderRef.current = render;
      Matter.Render.run(render);
    }

    // ————————————————————————————————————————————————————————————————————
    // 4) CREATE WALLS
    // ————————————————————————————————————————————————————————————————————
    const walls = Matter.Composite.create();
    Matter.Composite.add(walls, [
      Matter.Bodies.rectangle(
        canvasWidth/2, wallThickness/2,
        canvasWidth, wallThickness,
        { isStatic: true, label: 'topWall' }
      ),
      Matter.Bodies.rectangle(
        canvasWidth/2, canvasHeight - wallThickness/2,
        canvasWidth, wallThickness,
        { isStatic: true, label: 'bottomWall' }
      ),
    ]);
    wallsRef.current = walls;
    Matter.World.add(engine.world, walls);

    // ————————————————————————————————————————————————————————————————————
    // 5) CREATE PADDLES
    // ————————————————————————————————————————————————————————————————————
    const leftPaddle = Matter.Bodies.rectangle(
      paddleOffsetLeftX + paddleWidth/2,
      paddleOffsetLeftY + paddleHeight/2,
      paddleWidth, paddleHeight,
      { isStatic: true, label: 'leftPaddle' }
    );
    const rightPaddle = Matter.Bodies.rectangle(
      canvasWidth - (paddleWidth + paddleOffsetRightX) + paddleWidth/2,
      canvasHeight/2,
      paddleWidth, paddleHeight,
      { isStatic: true, label: 'rightPaddle' }
    );
    leftPaddleBodyRef.current  = leftPaddle;
    rightPaddleBodyRef.current = rightPaddle;
    Matter.World.add(engine.world, [leftPaddle, rightPaddle]);

    // ————————————————————————————————————————————————————————————————————
    // 6) CREATE BALLS
    // ————————————————————————————————————————————————————————————————————
    for (let i = 0; i < ballCount; i++) {
      const ball = Matter.Bodies.circle(
        canvasWidth/2,
        canvasHeight/2,
        ballDiameter/2,
        {
          restitution: ballRestitution,
          friction:    ballFriction,
          frictionAir: ballFrictionAir,
          inertia:     ballInertia,
          label:       'ball',
        }
      );
      ballBodyRefs.current.push(ball);
      Matter.World.add(engine.world, ball);
    }

    // — (Optionally start the runner here or in your component) —
    // Matter.Runner.run(runner, engine);

  }, [
    canvasWidth,
    canvasHeight,
    ballCount,        // ← rebuild world when this changes
    ballDiameter,
    ballFriction,
    ballFrictionAir,
    ballRestitution,
    ballInertia,
    paddleWidth,
    paddleHeight,
    paddleOffsetLeftX,
    paddleOffsetLeftY,
    paddleOffsetRightX,
    paddleOffsetRightY,
    wallThickness,
    gravityX,
    gravityY,
    debug,
    backgroundColor,
    wireFrames,
    showCollisions,
    showVelocity,
    showAngleIndicator,
    showIds,
    showPositions,
    showBounds,
    showAxes,
    showSleeping,
    showSeparations,
    showConstraints,
    showDebug,
    showBroadphase,
    version,          // ← bump to force full teardown & rebuild
  ]);

  return {
    engineRef,
    runnerRef,
    renderRef,
    ballBodyRefs,
    leftPaddleBodyRef,
    rightPaddleBodyRef,
  };
}
