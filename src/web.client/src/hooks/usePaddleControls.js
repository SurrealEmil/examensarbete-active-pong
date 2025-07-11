import { useEffect, useRef } from 'react';

/**
 * Custom hook for handling paddle control logic (Joy-Con accelerometer/joystick).
 *
 * @param {Object}   params - Configuration and input data.
 * @param {boolean}  params.gameStarted
 * @param {string}   params.controlModeLeft       - 'accelerometer' | 'joystick'
 * @param {string}   params.controlModeRight      - 'accelerometer' | 'joystick'
 * @param {Object}   params.motionDataLeft        - e.g. { accelX, accelY, accelZ, gyroDpsX, orientationBeta, ... }
 * @param {Object}   params.motionDataRight
 * @param {Object}   params.joystickDataLeft      - e.g. { leftHorizontal, leftVertical, rightHorizontal, rightVertical }
 * @param {Object}   params.joystickDataRight
 * @param {number}   params.canvasHeight
 * @param {number}   params.WALL_THICKNESS
 * @param {number}   params.initialLeftPaddleY
 * @param {number}   params.initialRightPaddleY
 * @param {number}   params.leftPaddleHeight
 * @param {number}   params.rightPaddleHeight
 *
 * // Joystick & Orientation Config
 * @param {number}   [params.leftJoystickDeadZone=0.3]
 * @param {number}   [params.leftJoystickCalibrationOffset=0.1]
 * @param {number}   [params.rightJoystickDeadZone=0.3]
 * @param {number}   [params.rightJoystickCalibrationOffset=0.3]
 * @param {number}   [params.joystickSwingThreshold=20]  - Gyro threshold for "swing" detection
 * @param {number}   [params.orientationSwingThreshold=5] - Orientation threshold for "swing"
 * @param {number}   [params.orientationScaleUp=1.5]      - Amplify upward tilt
 * @param {number}   [params.orientationScaleDown=1.0]    - Downward tilt scale
 * @param {number}   [params.orientationMinPitch=-50]     - Minimum pitch clamp
 * @param {number}   [params.orientationMaxPitch=50]      - Maximum pitch clamp
 * @param {number}   [params.accelSmoothingAlpha=0.1]     - For accelerometer smoothing (if used)
 * @param {number}   [params.pitchSmoothingFactor=0.1]    - Smoothing factor for orientation pitch
 *
 * // Additional "magic" constants that we now parametrize
 * @param {number}   [params.joystickBaseSpeed=7]         - Base velocity multiplier for joystick
 * @param {number}   [params.joystickMaxAcceleration=9]   - Max acceleration multiplier for joystick
 * @param {number}   [params.orientationDeadZone=0.1]     - Dead zone for orientation angle
 * @param {number}   [params.orientationBoost=50]         - Extra Y offset added on orientation "swing"
 *
 * @returns {Object} - Refs for paddle velocity & position:
 *                    {
 *                      leftPaddleVelocityRef,
 *                      leftPaddlePositionRef,
 *                      rightPaddleVelocityRef,
 *                      rightPaddlePositionRef
 *                    }
 */
export default function usePaddleControls({
  // Core data
  gameStarted,
  controlModeLeft,
  controlModeRight,
  motionDataLeft,
  motionDataRight,
  joystickDataLeft,
  joystickDataRight,
  canvasHeight,
  WALL_THICKNESS,
  initialLeftPaddleY,
  initialRightPaddleY,
  leftPaddleHeight,
  rightPaddleHeight,

  // Joystick & Orientation Config
  leftJoystickDeadZone = 0.3,
  leftJoystickCalibrationOffset = 0.1,
  rightJoystickDeadZone = 0.3,
  rightJoystickCalibrationOffset = 0.3,
  joystickSwingThreshold = 20,
  orientationSwingThreshold = 5,
  orientationScaleUp = 1.5,
  orientationScaleDown = 1.0,
  orientationMinPitch = -50,
  orientationMaxPitch = 50,
  accelSmoothingAlpha = 0.1,
  pitchSmoothingFactor = 0.1,

  // Newly added "magic" constants as parameters
  joystickBaseSpeed = 20,
  joystickMaxAcceleration = 5,
  orientationDeadZone = 0.1,
  orientationBoost = 50,
}) {
  // Paddle velocities & positions
  const leftPaddleVelocityRef = useRef(0);
  const leftPaddlePositionRef = useRef(initialLeftPaddleY);
  const rightPaddleVelocityRef = useRef(0);
  const rightPaddlePositionRef = useRef(initialRightPaddleY);

  // If you need smoothed accelerometer data, here they are:
  const smoothedAccelRefLeft = useRef({ x: 0, y: 0, z: 0 });
  const smoothedAccelRefRight = useRef({ x: 0, y: 0, z: 0 });

  // Track acceleration ramp-up for joystick
  const joystickAccelerationRefLeft = useRef(1);
  const joystickAccelerationRefRight = useRef(1);

  // Exponential smoothing for orientation pitch
  const smoothedPitchRefLeft = useRef(0);
  const smoothedPitchRefRight = useRef(0);

  // Neutral baselines for orientationBeta (placeholder; real calibration might store these)
  const neutralBetaLeft = 0;
  const neutralBetaRight = 0;



  const joystickInertiaDecay = 0.10; // how fast swing slows down (0.9 = more swing, 0.99 = long glide)

  const accelerationStep = 0.05;
  const maxAcceleration = 2;
  const smoothingFactor = 0.9;

  // useEffect(() => {
  //   console.log('[usePaddleControls] Using joystick calibration offsets:');
  //   console.log('  LEFT:', leftJoystickCalibrationOffset.toFixed(2));
  //   console.log('  RIGHT:', rightJoystickCalibrationOffset.toFixed(2));
  // }, [leftJoystickCalibrationOffset, rightJoystickCalibrationOffset]);
  
  
  useEffect(() => {
    if (!gameStarted) {
      // Reset everything if game not started
      smoothedAccelRefLeft.current = { x: 0, y: 0, z: 0 };
      leftPaddleVelocityRef.current = 0;
      leftPaddlePositionRef.current = initialLeftPaddleY;

      smoothedAccelRefRight.current = { x: 0, y: 0, z: 0 };
      rightPaddleVelocityRef.current = 0;
      rightPaddlePositionRef.current = initialRightPaddleY;
      return;
    }

    // ─────────────────────────────────────────────────────────────────────
    // LEFT PADDLE
    // ─────────────────────────────────────────────────────────────────────
    if (controlModeLeft === 'joystick') {
      const rawInput = joystickDataLeft?.leftVertical ?? 0;
      const input = rawInput - leftJoystickCalibrationOffset;
      const withinDeadZone = Math.abs(input) < leftJoystickDeadZone;

      // console.log('Left Paddle Input:', input.toFixed(2), 'withinDeadZone:', withinDeadZone);
    
      if (withinDeadZone) {
        // Let paddle glide naturally when no input
        leftPaddleVelocityRef.current *= joystickInertiaDecay;
    
        // Clamp very small speeds to zero
        if (Math.abs(leftPaddleVelocityRef.current) < 0.01) {
          leftPaddleVelocityRef.current = 0;
        }
    
        joystickAccelerationRefLeft.current = 1;
      } else {
        const scaled = (Math.abs(input) - leftJoystickDeadZone) / (1 - leftJoystickDeadZone);
        const direction = Math.sign(input);
    
        const isFullTilt = Math.abs(input) >= 0.85;
    
        if (isFullTilt) {
          // Accelerate only at full stick
          if (Math.sign(leftPaddleVelocityRef.current) === direction) {
            joystickAccelerationRefLeft.current = Math.min(
              joystickAccelerationRefLeft.current + accelerationStep,
              maxAcceleration
            );
          } else {
            // Direction changed → reset
            joystickAccelerationRefLeft.current = 1;
          }
        } else {
          // Not at full tilt = constant speed, reset acceleration
          joystickAccelerationRefLeft.current = 1;
        }
    
        const velocity = joystickBaseSpeed * scaled * direction * joystickAccelerationRefLeft.current;
    
        // Smooth the velocity change for buttery motion
        const smoothedVelocity =
          leftPaddleVelocityRef.current * (1 - smoothingFactor) +
          velocity * smoothingFactor;
    
        leftPaddleVelocityRef.current = smoothedVelocity;
      }
    } else {
      // Left Paddle Orientation
      // Instead of immediately zeroing velocity, apply a glide (decay) factor
      const glideFactor = 0.009; // The lower this value, the slower the deceleration
      leftPaddleVelocityRef.current *= (1 - glideFactor);

      let rawPitchLeft = motionDataLeft.orientationBeta || 0;
      let adjustedPitchLeft = rawPitchLeft - neutralBetaLeft;

      // Exponential smoothing
      smoothedPitchRefLeft.current =
        smoothedPitchRefLeft.current * (1 - pitchSmoothingFactor) +
        adjustedPitchLeft * pitchSmoothingFactor;

      let effectivePitchLeft = smoothedPitchRefLeft.current;

      // scaleUp for positive pitch, scaleDown for negative
      if (effectivePitchLeft > 0) {
        effectivePitchLeft *= orientationScaleUp;
      } else {
        effectivePitchLeft *= orientationScaleDown;
      }

      // Orientation dead zone
      if (Math.abs(effectivePitchLeft) < orientationDeadZone) {
        effectivePitchLeft = 0;
      }

      // Clamp to [orientationMinPitch..orientationMaxPitch]
      const clampedLeft = Math.max(
        orientationMinPitch,
        Math.min(orientationMaxPitch, effectivePitchLeft)
      );

      // Convert pitch → ratio
      const ratioLeft =
        (clampedLeft - orientationMinPitch) /
        (orientationMaxPitch - orientationMinPitch);

      // Map ratio to the screen area
      let basePosLeft = (canvasHeight - leftPaddleHeight) * ratioLeft;
      basePosLeft = Math.max(
        WALL_THICKNESS,
        Math.min(
          canvasHeight - leftPaddleHeight - WALL_THICKNESS,
          basePosLeft
        )
      );

      // “Swing” detection for orientation
      if (
        Math.abs(motionDataLeft.gyroDpsX || 0) >
        orientationSwingThreshold
      ) {
        basePosLeft += orientationBoost;
      }

      leftPaddlePositionRef.current = basePosLeft;
    }

    // ─────────────────────────────────────────────────────────────────────
    // RIGHT PADDLE
    // ─────────────────────────────────────────────────────────────────────
    if (controlModeRight === 'joystick') {
      const rawInput = joystickDataRight?.rightVertical ?? 0;
      const input = rawInput - rightJoystickCalibrationOffset;
      const withinDeadZone = Math.abs(input) < rightJoystickDeadZone;

      // console.log('Right Paddle Input:', input.toFixed(2), 'withinDeadZone:', withinDeadZone);
    
      if (withinDeadZone) {
        // Let paddle glide naturally when no input
        rightPaddleVelocityRef.current *= joystickInertiaDecay;
    
        // Clamp very small speeds to zero
        if (Math.abs(rightPaddleVelocityRef.current) < 0.01) {
          rightPaddleVelocityRef.current = 0;
        }
    
        joystickAccelerationRefRight.current = 1;
      } else {
        const scaled = (Math.abs(input) - rightJoystickDeadZone) / (1 - rightJoystickDeadZone);
        const direction = Math.sign(input);
    
        const isFullTilt = Math.abs(input) >= 0.85;
    
        if (isFullTilt) {
          // Accelerate only at full stick
          if (Math.sign(rightPaddleVelocityRef.current) === direction) {
            joystickAccelerationRefRight.current = Math.min(
              joystickAccelerationRefRight.current + accelerationStep,
              maxAcceleration
            );
          } else {
            // Direction changed → reset
            joystickAccelerationRefRight.current = 1;
          }
        } else {
          // Not at full tilt = constant speed, reset acceleration
          joystickAccelerationRefRight.current = 1;
        }
    
        const velocity = joystickBaseSpeed * scaled * direction * joystickAccelerationRefRight.current;
    
        // Smooth the velocity change for buttery motion
        const smoothedVelocity =
          rightPaddleVelocityRef.current * (1 - smoothingFactor) +
          velocity * smoothingFactor;
    
        rightPaddleVelocityRef.current = smoothedVelocity;
      }    
    } else {
      // Right Paddle Orientation
      let rawPitchRight = motionDataRight.orientationBeta || 0;
      let adjustedPitchRight = rawPitchRight - neutralBetaRight;

      smoothedPitchRefRight.current =
        smoothedPitchRefRight.current * (1 - pitchSmoothingFactor) +
        adjustedPitchRight * pitchSmoothingFactor;

      let effectivePitchRight = smoothedPitchRefRight.current;

      if (effectivePitchRight > 0) {
        effectivePitchRight *= orientationScaleUp;
      } else {
        effectivePitchRight *= orientationScaleDown;
      }

      if (Math.abs(effectivePitchRight) < orientationDeadZone) {
        effectivePitchRight = 0;
      }

      const clampedRight = Math.max(
        orientationMinPitch,
        Math.min(orientationMaxPitch, effectivePitchRight)
      );

      const ratioRight =
        (clampedRight - orientationMinPitch) /
        (orientationMaxPitch - orientationMinPitch);

      let basePosRight = (canvasHeight - rightPaddleHeight) * ratioRight;
      basePosRight = Math.max(
        WALL_THICKNESS,
        Math.min(
          canvasHeight - rightPaddleHeight - WALL_THICKNESS,
          basePosRight
        )
      );

      if (
        Math.abs(motionDataRight.gyroDpsX || 0) >
        orientationSwingThreshold
      ) {
        basePosRight += orientationBoost;
      }
      rightPaddlePositionRef.current = basePosRight;
    }
  }, [
    // Core
    gameStarted,
    controlModeLeft,
    controlModeRight,
    motionDataLeft,
    motionDataRight,
    joystickDataLeft,
    joystickDataRight,
    canvasHeight,
    WALL_THICKNESS,
    initialLeftPaddleY,
    initialRightPaddleY,
    leftPaddleHeight,
    rightPaddleHeight,

    // Config
    leftJoystickDeadZone,
    leftJoystickCalibrationOffset,
    rightJoystickDeadZone,
    rightJoystickCalibrationOffset,
    joystickSwingThreshold,
    orientationSwingThreshold,
    orientationScaleUp,
    orientationScaleDown,
    orientationMinPitch,
    orientationMaxPitch,
    pitchSmoothingFactor,
    joystickBaseSpeed,
    joystickMaxAcceleration,
    orientationDeadZone,
    orientationBoost,
  ]);

  return {
    leftPaddleVelocityRef,
    leftPaddlePositionRef,
    rightPaddleVelocityRef,
    rightPaddlePositionRef,
  };
}
