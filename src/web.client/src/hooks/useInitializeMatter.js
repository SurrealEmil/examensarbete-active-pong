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
  // BALL SETTINGS
  // ──────────────────────────────────────────────────────────────────────────
  ballDiameter = 20,         // Default diameter of ball
  ballSpeed = 10,            // Default initial speed
  ballFriction = 0,          // No friction
  ballFrictionAir = 0,       // No air resistance
  ballRestitution = 1,       // Fully bouncy
  ballInertia = Infinity,    // No rotational inertia

  // ──────────────────────────────────────────────────────────────────────────
  // PADDLE SETTINGS
  // ──────────────────────────────────────────────────────────────────────────
  paddleWidth = 20,          // Default paddle width
  paddleHeight = 200,        // Default paddle height
  paddleOffsetLeftX = 25,    // Default X offset for left paddle
  paddleOffsetLeftY = 200,   // Default Y offset for left paddle
  paddleOffsetRightX = 25,   // Default X offset for right paddle
  paddleOffsetRightY = 0,    // Default Y offset for right paddle

  // ──────────────────────────────────────────────────────────────────────────
  // WALL & ARENA SETTINGS
  // ──────────────────────────────────────────────────────────────────────────
  wallThickness = 10,        // Default thickness for walls

  // ──────────────────────────────────────────────────────────────────────────
  // GRAVITY SETTINGS
  // ──────────────────────────────────────────────────────────────────────────
  gravityX = 0,              // Horizontal gravity force (default: 0)
  gravityY = 0,              // Vertical gravity force (default: 0)

  // ──────────────────────────────────────────────────────────────────────────
  // DEBUG & VISUAL SETTINGS
  // ──────────────────────────────────────────────────────────────────────────
  debug = true,              // Enable debug rendering by default
  backgroundColor = '#1e1e1e', // Default background color
  wireFrames = true,
  showCollisions = true,
  showVelocity = true,
  showAngleIndicator = true,
  showIds = true,
  showPositions = true,       // Show body center positions
  showBounds = true,          // Show AABB bounding boxes
  showAxes = true,            // Show axes for each body
  showSleeping = true,        // Gray out sleeping bodies
  showSeparations = true,     // Show collision separation vectors
  showConstraints = true,     // Show constraints (joints, ropes, etc.)
  showDebug = true,           // Show internal debug info
  showBroadphase = true,      // Show broadphase collision detection

  // ──────────────────────────────────────────────────────────────────────────
  // ENGINE VERSION (Triggers re-initialization)
  // ──────────────────────────────────────────────────────────────────────────
  version = 0,
}) {
  // 1) Create refs
  const engineRef = useRef(null);
  const runnerRef = useRef(null);
  const ballBodyRef = useRef([]);
  const leftPaddleBodyRef = useRef(null);
  const rightPaddleBodyRef = useRef(null);
  const renderRef = useRef(null);

  const wallsRef = useRef(null); // Add a ref for walls


  useEffect(() => {
    if (!engineRef.current) {
      // ✅ Request Motion Permissions
     /*  if (typeof DeviceMotionEvent?.requestPermission === "function") {
        DeviceMotionEvent.requestPermission()
            .then(permissionState => {
                if (permissionState === "granted") {
                    console.log("✅ Motion access granted.");
                } else {
                    console.warn("⚠️ Motion access denied.");
                }
            })
            .catch(error => console.error("❌ Motion permission request failed:", error));
    } else {
        console.log("ℹ️ DeviceMotionEvent.requestPermission is not required on this browser.");
    } */
      
      // 2) Create engine & runner
      const engine = Matter.Engine.create();
      const runner = Matter.Runner.create();
      
      // 3) Optionally set up debug rendering
      if (debug) {
        const render = Matter.Render.create({
          /* element: document.body, */
          element: document.querySelector('.pong-game-container'),
          engine,
          options: {
            width: canvasWidth,
            height: canvasHeight,
            wireframes: wireFrames,
            background: backgroundColor,
            showCollisions: showCollisions,
            showVelocity: showVelocity,
            showAngleIndicator: showAngleIndicator,
            showIds: showIds,
            showPositions: showPositions,
            showBounds: showBounds,
            showAxes: showAxes,
            showSleeping: showSleeping,
            showSeparations: showSeparations,
            showConstraints: showConstraints,
            showDebug: showDebug,
            showBroadphase: showBroadphase,
          },
        });
        renderRef.current = render;
        Matter.Render.run(render);
      }

        // 4) Create a composite for walls
        const walls = Matter.Composite.create();
        Matter.Composite.add(walls, [
            Matter.Bodies.rectangle(
                canvasWidth / 2, wallThickness / 2, canvasWidth, wallThickness, 
                { 
                  isStatic: true, 
                  label: 'topWall' }
              ),
              Matter.Bodies.rectangle(
                canvasWidth / 2, canvasHeight - wallThickness / 2, canvasWidth, wallThickness, 
                { 
                  isStatic: true, 
                  label: 'bottomWall' }
              ),
        //   Matter.Bodies.rectangle(0, canvasHeight / 2, wallThickness, canvasHeight, { isStatic: true, label: 'leftWall' }),
        //   Matter.Bodies.rectangle(canvasWidth, canvasHeight / 2, wallThickness, canvasHeight, { isStatic: true, label: 'rightWall' }),
        ]);

        wallsRef.current = walls; // Save to ref

      // 5) Create ball & paddles
    /*   const ballBody = Matter.Bodies.circle(
        canvasWidth / 2,
        canvasHeight / 2,
        ballDiameter / 2,
        {
          restitution: ballRestitution,
          friction: ballFriction,
          frictionAir: ballFrictionAir,
          inertia: ballInertia,
          label: 'ball',
        }
      ); */
      const ballBodies = [];

      // b. build two identical Ball objects
      for (let i = 0; i < 2; i++) {
        const ball = Matter.Bodies.circle(
        canvasWidth / 2,
        canvasHeight / 2,
        ballDiameter / 2,
      {
        restitution: ballRestitution,
        friction:    ballFriction,
        frictionAir: ballFrictionAir,
        inertia:     ballInertia,
        label: 'ball',          // all balls share the same label
      }
    );
      ballBodies.push(ball);
}

      const leftPaddleBody = Matter.Bodies.rectangle(
        paddleOffsetLeftX + paddleWidth / 2, 
        paddleOffsetLeftY + paddleHeight / 2,
        paddleWidth,
        paddleHeight,
        { 
          isStatic: true, 
          label: 'leftPaddle',
          // chamfer: { radius: paddleWidth / 4 }
        }
      );
      
      const rightPaddleBody = Matter.Bodies.rectangle(
        canvasWidth - (paddleWidth + paddleOffsetRightX) + paddleWidth / 2,
        canvasHeight / 2,
        paddleWidth,
        paddleHeight,
        { 
          isStatic: true,
          label: 'rightPaddle',
          // chamfer: { radius: paddleWidth / 4 }
        }
      );

      // 6) Save references
      engineRef.current = engine;
      runnerRef.current = runner;
      /* ballBodyRef.current = ballBody; */
      ballBodyRef.current = ballBodies;
      leftPaddleBodyRef.current = leftPaddleBody;
      rightPaddleBodyRef.current = rightPaddleBody;

      // Apply gravity settings
      engine.world.gravity.x = gravityX;  // Horizontal gravity
      engine.world.gravity.y = gravityY;  // Vertical gravity

      // Add dynamic objects (ball and paddles)
      /* Matter.World.add(engine.world, [ballBody, leftPaddleBody, rightPaddleBody]); */
      Matter.World.add(engine.world, [...ballBodies, leftPaddleBody, rightPaddleBody]);
      // Add static walls separately
      Matter.World.add(engine.world, wallsRef.current); // Add walls to the world

      ballBodies.forEach(body => {
        Matter.Body.setPosition(body, { x: canvasWidth / 2, y: canvasHeight / 2 });
          Matter.Body.setVelocity(body, { x: 0, y: 0 });
        });
    }
// Cleanup on unmount or version change:
return () => {
  if (renderRef.current) {
    Matter.Render.stop(renderRef.current);
    renderRef.current.canvas.remove();
    renderRef.current.textures = {};
  }

  if (runnerRef.current) {
    Matter.Runner.stop(runnerRef.current);
  }

  if (engineRef.current) {
    if (wallsRef.current) {
      Matter.World.remove(engineRef.current.world, wallsRef.current);
    }
    Matter.Engine.clear(engineRef.current);
  }

  engineRef.current = null;
  runnerRef.current = null;
  renderRef.current = null;
};
// Notice we add 'version' to the dependency list
}, [
canvasWidth,
canvasHeight,
ballDiameter,
wallThickness,
paddleWidth,
paddleHeight,
debug,
version // <-- IMPORTANT: triggers re-init
]);

return {
engineRef,
runnerRef,
ballBodyRef,
leftPaddleBodyRef,
rightPaddleBodyRef,
renderRef,
};
}