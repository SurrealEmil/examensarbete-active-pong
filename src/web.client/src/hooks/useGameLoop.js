import { useState, useRef, useEffect, useCallback } from 'react';
import { connectedJoyCons, JoyConLeft, JoyConRight } from '../components/JoyCon/index';

import Matter from 'matter-js';

/**
 * Custom hook that manages the Pong game loop logic.
 *
 * @param {Object}   params
 * @param {boolean}  params.gameStarted
 * @param {boolean}  params.gamePaused
 * @param {Object}   params.gameState
 * @param {boolean}  params.gameOver
 * @param {Function} params.setGameState
 * @param {Ref}      params.engineRef
 * @param {Ref}      params.ballBodyRef
 * @param {Ref}      params.leftPaddleBodyRef
 * @param {Ref}      params.rightPaddleBodyRef
 * @param {Ref}      params.leftPaddleVelocityRef
 * @param {Ref}      params.leftPaddlePositionRef
 * @param {Ref}      params.rightPaddleVelocityRef
 * @param {Ref}      params.rightPaddlePositionRef
 * @param {number}   params.canvasWidth
 * @param {number}   params.canvasHeight
 * @param {number}   params.ballSpeed
 * @param {Function} params.playMissSound
 * @param {Function} params.playSideSound
 * @param {Function} params.playHitSound
 * @param {string}   params.controlModeLeft
 * @param {string}   params.controlModeRight
 * @param {boolean}  [params.enableFps=true]       - Toggle FPS tracking overlay
 *
 * // ──────────────────────────────────────────────────────────────────────────
 * // PERFORMANCE SETTINGS
 * // ──────────────────────────────────────────────────────────────────────────
 * @param {number} [params.lagSpikeThreshold=30]  - FPS threshold for detecting lag spikes
 * @param {number} [params.fpsSmoothingFactor=0.1] - Factor for exponential moving average of FPS
 *
 * // ──────────────────────────────────────────────────────────────────────────
 * // BALL MOVEMENT & BOUNCE SETTINGS
 * // ──────────────────────────────────────────────────────────────────────────
 * @param {number} [params.maxBallSpeed=20]       - The maximum speed the ball can reach
 * @param {number} [params.speedAdjustThreshold=0.1] - Minimum speed difference before adjustment
 * @param {number} [params.ballResetDelay=400]   - Delay before resetting the ball after scoring
 * @param {number} [params.speedIncrement=1]     - How much speed increases per paddle hit
 * @param {number} [params.minBallSpeedThreshold=0.001] - Min speed before re-randomizing movement
 * @param {number} [params.ballRandomAngleRange=2 * Math.PI] - Angle range for randomized ball direction
 * @param {number} [params.maxBounceAngle=Math.PI / 3]    - Maximum bounce angle for paddle hits (in degrees)
 *
 * // ──────────────────────────────────────────────────────────────────────────
 * // RUMBLE (JOY-CON FEEDBACK) SETTINGS
 * // ──────────────────────────────────────────────────────────────────────────
 * @param {number} [params.rumbleDuration=800]    - Duration of the Joy-Con rumble effect (ms)
 * @param {number} [params.rumbleIntensityHigh=120] - Primary high intensity of the Joy-Con rumble
 * @param {number} [params.rumbleIntensityLow=10] - Primary low intensity of the Joy-Con rumble
 * @param {number} [params.rumbleStrength=0.7]    - Strength of the primary Joy-Con rumble (0 to 1)
 * @param {number} [params.rumbleSecondaryIntensityHigh=100] - Secondary high intensity after delay
 * @param {number} [params.rumbleSecondaryIntensityLow=6] - Secondary low intensity after delay
 * @param {number} [params.rumbleSecondaryStrength=0] - Secondary strength (0 = off)
 * @param {number} [params.rumbleSecondaryDelay=500] - Delay before secondary rumble effect (ms)
 * 
 * @param {Number} [params.randomSideThreshold=0.5] - Threshold for random sign (direction) change
 */

export default function useGameLoop({
  gameStarted,
  gamePaused,
  gameState,
  gameOver,
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
  ballSpeed,
  playMissSound,
  playSideSound,
  playHitSound,
  controlModeLeft,
  controlModeRight,
  enableFps = true,

  // ──────────────────────────────────────────────────────────────────────────
  // PERFORMANCE SETTINGS
  // ──────────────────────────────────────────────────────────────────────────
  lagSpikeThreshold = 30,
  fpsSmoothingFactor = 0.05,

  // ──────────────────────────────────────────────────────────────────────────
  // BALL MOVEMENT & BOUNCE SETTINGS
  // ──────────────────────────────────────────────────────────────────────────
  maxBallSpeed = 20,
  speedAdjustThreshold = 0.1,
  ballResetDelay = 400,
  speedIncrement = 1,
  minBallSpeedThreshold = 0.001,
  ballRandomAngleRange = 2 * Math.PI,
  maxBounceAngle = Math.PI / 3,

  // ──────────────────────────────────────────────────────────────────────────
  // RUMBLE (JOY-CON FEEDBACK) SETTINGS
  // ──────────────────────────────────────────────────────────────────────────
  rumbleDuration = 800,
  rumbleIntensityHigh = 120,
  rumbleIntensityLow = 10,
  rumbleStrength = 0.7,
  rumbleSecondaryIntensityHigh = 100,
  rumbleSecondaryIntensityLow = 6,
  rumbleSecondaryStrength = 0,
  rumbleSecondaryDelay = 500,


  randomSideThreshold=0.5
}) {
  const gameLoopRef = useRef(null);


  // Keep a reference for the speed we *want* the ball to maintain
  const desiredBallSpeedRef = useRef(Math.min(ballSpeed, maxBallSpeed));

  // --- FPS Tracking with EMA (only if enabled) ---
  const [displayFPS, setDisplayFPS] = useState(0);
  const [isLagSpike, setIsLagSpike] = useState(false);
  const lastFrameTimeRef = useRef(performance.now());
  const averageFpsRef = useRef(0);
  const lastLogUpdateRef = useRef(performance.now());

   // MAIN GAME LOOP
  const gameLoop = useCallback(() => {
    if (!gameStarted || gamePaused) return;

    // --- FPS Measurement ---
    const now = performance.now();
    const delta = now - lastFrameTimeRef.current;
    lastFrameTimeRef.current = now;
    const currentFps = 1000 / delta;

    if (enableFps) {
        // Calculate the exponential moving average.
        averageFpsRef.current = averageFpsRef.current
          ? currentFps * fpsSmoothingFactor + averageFpsRef.current * (1 - fpsSmoothingFactor)
          : currentFps;
  
        // Update display and log warning every second.
        if (now - lastLogUpdateRef.current >= 1000) {
          // Update the visual FPS counter.
          setDisplayFPS(Number(averageFpsRef.current.toFixed(2)));
  
          // Determine if there's a lag spike.
          const lag = averageFpsRef.current < lagSpikeThreshold;
          setIsLagSpike(lag);
  
          // Log a warning if needed.
          if (lag) {
            console.warn(`Lag spike detected! Smoothed FPS: ${averageFpsRef.current.toFixed(2)}`);
          }
          lastLogUpdateRef.current = now;
        }
      }

    setGameState((prev) => {
      const { ball, leftPaddle, rightPaddle, WALL_THICKNESS, scores } = prev;

      // Left paddle Y
      let newLeftPaddleY =
        controlModeLeft === 'joystick'
          ? leftPaddle.y + leftPaddleVelocityRef.current
          : leftPaddlePositionRef.current;
      newLeftPaddleY = Math.max(
        WALL_THICKNESS,
        Math.min(newLeftPaddleY, canvasHeight - leftPaddle.height - WALL_THICKNESS)
      );

      // Right paddle Y
      let newRightPaddleY =
        controlModeRight === 'joystick'
          ? rightPaddle.y + rightPaddleVelocityRef.current
          : rightPaddlePositionRef.current;
      newRightPaddleY = Math.max(
        WALL_THICKNESS,
        Math.min(newRightPaddleY, canvasHeight - rightPaddle.height - WALL_THICKNESS)
      );

    // --- Update Ball Position from Matter.js ---
    const newBall = { ...ball };
    if (engineRef.current && ballBodyRef.current) {
      const { x, y } = ballBodyRef.current.position;
      newBall.x = x - newBall.width / 2;
      newBall.y = y - newBall.height / 2;
    }

      // Check for scoring
      const newScores = { ...scores };

      // Ball out left => player2 scores
      if (newBall.x < 0 && !newBall.resetting) {
        newScores.player2 += 1;
        newBall.resetting = true;
        if (playMissSound) playMissSound();

        // Rumble the left Joy-Con
        connectedJoyCons.forEach((joyCon) => {
          if (joyCon instanceof JoyConLeft) {
            joyCon.rumble(rumbleIntensityHigh, rumbleIntensityLow, rumbleStrength, rumbleDuration);
            setTimeout(() => {
              joyCon.rumble(
                rumbleSecondaryIntensityHigh,
                rumbleSecondaryIntensityLow,
                rumbleSecondaryStrength
              );
            }, rumbleSecondaryDelay);
          }
        });


        // Look into more, add config for all of rumble TODO
        
        
        // Reset logic
        setTimeout(() => {
          if (ballBodyRef.current) {
            Matter.Body.setPosition(ballBodyRef.current, { x: canvasWidth / 2, y: canvasHeight / 2 });
            const randomSide = () => (Math.random() > randomSideThreshold ? 1 : -1);
            // clamp to maxBallSpeed
            const clampedSpeed = Math.min(ballSpeed, maxBallSpeed);
            Matter.Body.setVelocity(ballBodyRef.current, {
              x: clampedSpeed * randomSide(),
              y: clampedSpeed * randomSide(),
            });
            desiredBallSpeedRef.current = clampedSpeed;
          }
          setGameState((s) => ({ 
            ...s,
            ball: { ...s.ball, resetting: false },
          }));
        }, ballResetDelay);
      } 
      // Ball out right => player1 scores
      else if (newBall.x > canvasWidth && !newBall.resetting) {
        newScores.player1 += 1;
        newBall.resetting = true;
        if (playMissSound) playMissSound();

        // Rumble the right Joy-Con
        connectedJoyCons.forEach((joyCon) => {
          if (joyCon instanceof JoyConRight) {
            joyCon.rumble(rumbleIntensityHigh, rumbleIntensityLow, rumbleStrength, rumbleDuration);
            setTimeout(() => {
              joyCon.rumble(
                rumbleSecondaryIntensityHigh,
                rumbleSecondaryIntensityLow,
                rumbleSecondaryStrength
              );
            }, rumbleSecondaryDelay);
          }
        });

        // Look into more, add config for all of rumble TODO

        // Reset logic
        setTimeout(() => {
          if (ballBodyRef.current) {
            Matter.Body.setPosition(ballBodyRef.current, { x: canvasWidth / 2, y: canvasHeight / 2 });
            const randomSide = () => (Math.random() > randomSideThreshold ? 1 : -1);
            // clamp to maxBallSpeed
            const clampedSpeed = Math.min(ballSpeed, maxBallSpeed);
            Matter.Body.setVelocity(ballBodyRef.current, {
              x: clampedSpeed * randomSide(),
              y: clampedSpeed * randomSide(),
            });
            desiredBallSpeedRef.current = clampedSpeed;
          }
          setGameState((s) => ({ 
            ...s,
            ball: { ...s.ball, resetting: false },
          }));
        }, ballResetDelay);
      }

      leftPaddlePositionRef.current = newLeftPaddleY;
      rightPaddlePositionRef.current = newRightPaddleY;

      // Return new state
      return {
        ...prev,
        ball: newBall,
        scores: newScores,
        leftPaddle: { ...leftPaddle, y: newLeftPaddleY },
        rightPaddle: { ...rightPaddle, y: newRightPaddleY },
      };
      });

    // Actually move paddles in Matter.js 
    if (leftPaddleBodyRef.current && rightPaddleBodyRef.current) {
      const leftCenterX = gameState.leftPaddle.x + (gameState.leftPaddle.width / 2);
      const leftCenterY = leftPaddlePositionRef.current + (gameState.leftPaddle.height / 2);
      Matter.Body.setPosition(leftPaddleBodyRef.current, { x: leftCenterX, y: leftCenterY });

      const rightCenterX = gameState.rightPaddle.x + (gameState.rightPaddle.width / 2);
      const rightCenterY = rightPaddlePositionRef.current + (gameState.rightPaddle.height / 2);
      Matter.Body.setPosition(rightPaddleBodyRef.current, { x: rightCenterX, y: rightCenterY });
    }

    // Request next frame
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [
    gameStarted,
    gamePaused,
    gameState,
    ballSpeed,
    maxBallSpeed,
    rumbleDuration,
    fpsSmoothingFactor,
    controlModeLeft,
    controlModeRight,
    leftPaddleVelocityRef,
    rightPaddleVelocityRef,
    leftPaddlePositionRef,
    rightPaddlePositionRef,
    canvasHeight,
    canvasWidth,
    enableFps,
    engineRef,
    ballBodyRef,
    playMissSound,
    playSideSound,
    playHitSound,
    setGameState,
  ]);

  // Set up collision events & run the loop
  useEffect(() => {
    if (!gameStarted) return;
    const engine = engineRef.current;
    if (!engine) return;

    // BOUNCE LOGIC (collisionStart)
    const handleCollision = (event) => {
      event.pairs.forEach((pair) => {
        const { bodyA, bodyB } = pair;
        let ballBody, otherBody;
        if (bodyA.label === 'ball') {
          ballBody = bodyA;
          otherBody = bodyB;
        } else if (bodyB.label === 'ball') {
          ballBody = bodyB;
          otherBody = bodyA;
        }

        if (ballBody && otherBody) {
          switch (otherBody.label) {
            case 'topWall':
            case 'bottomWall':
              if (playSideSound) playSideSound();
              break;
            case 'leftPaddle':
            case 'rightPaddle':
                  if (playHitSound) playHitSound();
                  // bounce logic
                  if (ballBodyRef.current) {
                    const ball = ballBodyRef.current;
                    const paddleBody = otherBody;
                    const paddleHeight =
                      paddleBody.label === 'leftPaddle'
                        ? gameState.leftPaddle.height
                        : gameState.rightPaddle.height;

                    // Calculate bounce angle
                    const paddleCenterY = paddleBody.position.y;
                    const ballY = ball.position.y;
                    let relativeIntersectY = ballY - paddleCenterY;
                    let normalizedRelativeY = relativeIntersectY / (paddleHeight / 2);
                    normalizedRelativeY = Math.max(-1, Math.min(1, normalizedRelativeY));
                    const bounceAngle = normalizedRelativeY * maxBounceAngle;

                    // Increase speed slightly, clamp to maxBallSpeed
                    const currentSpeed = Math.sqrt(ball.velocity.x ** 2 + ball.velocity.y ** 2);
                    let newSpeed = Math.min(currentSpeed + speedIncrement, maxBallSpeed);

                    let newVx, newVy;
                    if (paddleBody.label === 'leftPaddle') {
                      newVx = -newSpeed * Math.cos(bounceAngle);
                      newVy = newSpeed * Math.sin(bounceAngle);
                      // ensure negative X
                      newVx = -Math.abs(newVx);
                    } else {
                      newVx = -newSpeed * Math.cos(bounceAngle);
                      newVy = newSpeed * Math.sin(bounceAngle);
                      // ensure positive X
                      newVx = Math.abs(newVx);
                    }
                    Matter.Body.setVelocity(ball, { x: newVx, y: newVy });
                    desiredBallSpeedRef.current = newSpeed;

                    /*  console.log(
                      'Paddle Hit! New speed =',
                      newSpeed.toFixed(2),
                      'Bounce angle (deg)=',
                      (bounceAngle * (180 / Math.PI)).toFixed(2)
                    ); */

                  }
                  break;
                default:
                  break;
          }
        }
      });
    };

    // ──────────────────────────────────────────────────────────────────────────
    // BEFORE UPDATE => force ball’s speed to desiredBallSpeedRef
    // ──────────────────────────────────────────────────────────────────────────
    const handleBeforeUpdate = () => {
      if (!ballBodyRef.current) return;
      const ball = ballBodyRef.current;
      const actualSpeed = ball.speed;
      const targetSpeed = desiredBallSpeedRef.current;

      // If nearly stationary, pick a random direction
      if (actualSpeed < minBallSpeedThreshold) {
        const angle = Math.random() * ballRandomAngleRange;
        Matter.Body.setVelocity(ball, {
          x: targetSpeed * Math.cos(angle),
          y: targetSpeed * Math.sin(angle),
        });
        return;
      }
      
      // If off by more than speedAdjustThreshold, fix it
      if (Math.abs(actualSpeed - targetSpeed) > speedAdjustThreshold) {
        const scaleFactor = targetSpeed / actualSpeed;
        Matter.Body.setVelocity(ball, {
          x: ball.velocity.x * scaleFactor,
          y: ball.velocity.y * scaleFactor,
        });
      }
      
      // Lastly, clamp to maxBallSpeed
      if (ball.speed > maxBallSpeed) {
        const scaleClamp = maxBallSpeed / ball.speed;
        Matter.Body.setVelocity(ball, {
          x: ball.velocity.x * scaleClamp,
          y: ball.velocity.y * scaleClamp,
        });
      }
    };

    Matter.Events.on(engine, 'collisionStart', handleCollision);
    Matter.Events.on(engine, 'beforeUpdate', handleBeforeUpdate);

    if (!gamePaused) {
      // Start the animation loop
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }

    // Cleanup
    return () => {
      Matter.Events.off(engine, 'collisionStart', handleCollision);
      Matter.Events.off(engine, 'beforeUpdate', handleBeforeUpdate);
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [
    gameStarted,
    gamePaused,
    gameOver,
    maxBallSpeed,
    speedAdjustThreshold,
    gameLoop,
    engineRef,
    ballBodyRef,
    playSideSound,
    playHitSound,
    setGameState,
  ]);

  // 4) Return whatever you might need (or nothing)
  return { fps: enableFps ? displayFPS : null,
    isLagSpike: enableFps ? isLagSpike : false 
  };
}

