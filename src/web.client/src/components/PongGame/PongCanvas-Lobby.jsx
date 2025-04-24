import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import './PongStyles.css';

/**
 * PongCanvas Component
 * Handles game rendering based on the game state received via props.
 */

const rootStyles = getComputedStyle(document.documentElement);
const paddleColor = rootStyles.getPropertyValue('--orange').trim();
const wallColor = rootStyles.getPropertyValue('--white').trim();

const PongCanvas = ({ gameState, canvasWidth, canvasHeight, wallThickness}) => {
    // References for the two canvases
    const staticCanvasRef = useRef(null);
    const dynamicCanvasRef = useRef(null);

    // Draw static objects: walls, net, background (only re-drawn when canvas size or wall thickness change)
    useEffect(() => {
      // console.log("Drawing static elements");
      const canvas = staticCanvasRef .current;
      const context = canvas.getContext('2d');
      const grid = 15;
      

      // Clear the canvas
      context.clearRect(0, 0, canvas.width, canvas.height);

      // Optionally fill a background (uncomment if needed)
      // context.fillStyle = 'black';
      // context.fillRect(0, 0, canvas.width, canvas.height);

      // Draw walls
      context.fillStyle = wallColor;
      // Top wall
      context.fillRect(0, 0, canvas.width, wallThickness);
      // Bottom wall
      context.fillRect(0, canvas.height - wallThickness, canvas.width, wallThickness);
      // // Left wall
      // context.fillRect(0, 0, wallThickness, canvas.height);
      // // Right wall
      // context.fillRect(canvas.width - wallThickness, 0, wallThickness, canvas.height);

      // Draw center net (dotted line)
      for (let i = grid; i < canvas.height - grid; i += grid * 2) {
        context.fillRect(canvas.width / 2 - grid / 2, i, grid, grid);
      }
    }, [canvasWidth, canvasHeight, wallThickness]);
    
    // Draw dynamic objects: ball and paddles (re-drawn each time gameState updates)
  useEffect(() => {
    //console.log("Drawing dynamic elements");
    const canvas = dynamicCanvasRef.current;
    const context = canvas.getContext('2d');

    // Clear the dynamic canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    const { ball, leftPaddle, rightPaddle } = gameState;

    // Draw paddles
    context.fillStyle = paddleColor;
    context.fillRect(leftPaddle.x, leftPaddle.y, leftPaddle.width, leftPaddle.height);
    context.fillRect(rightPaddle.x, rightPaddle.y, rightPaddle.width, rightPaddle.height);

    // Draw ball
    context.fillRect(ball.x, ball.y, ball.width, ball.height);
  }, [gameState]);

  return (
    <div className="pong-game-container">
      <canvas
        ref={staticCanvasRef}
        width={canvasWidth}
        height={canvasHeight}
        className="pong-canvas"
        style={{ zIndex: 0 }}
      />
      <canvas
        ref={dynamicCanvasRef}
        width={canvasWidth}
        height={canvasHeight}
        className="pong-canvas"
        style={{ zIndex: 1 }}
      />
    </div>
  );

};

PongCanvas.propTypes = {
  gameState: PropTypes.shape({
    ball: PropTypes.shape({
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired,
      width: PropTypes.number.isRequired,
      height: PropTypes.number.isRequired,
      dx: PropTypes.number.isRequired,
      dy: PropTypes.number.isRequired,
      resetting: PropTypes.bool.isRequired,
    }).isRequired,
    leftPaddle: PropTypes.shape({
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired,
      width: PropTypes.number.isRequired,
      height: PropTypes.number.isRequired,
    }).isRequired,
    rightPaddle: PropTypes.shape({
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired,
      width: PropTypes.number.isRequired,
      height: PropTypes.number.isRequired,
    }).isRequired,
    canvasWidth: PropTypes.number.isRequired,
    canvasHeight: PropTypes.number.isRequired,
    wallThickness: PropTypes.number,
    scores: PropTypes.shape({
      player1: PropTypes.number.isRequired, // Changed from 'player'
      player2: PropTypes.number.isRequired, // Changed from 'ai'
    }).isRequired,
  }).isRequired,
  canvasWidth: PropTypes.number.isRequired,
  canvasHeight: PropTypes.number.isRequired,
};


export default PongCanvas;