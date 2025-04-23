import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import './PongStyles.css';

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
      context.clearRect(0, 0, canvas.width, canvas.height)
      // Draw walls
      context.fillStyle = wallColor;
      // Top wall
      context.fillRect(0, 0, canvas.width, wallThickness);
      // Bottom wall
      context.fillRect(0, canvas.height - wallThickness, canvas.width, wallThickness);
      //center net
      for (let i = grid; i < canvas.height - grid; i += grid * 2) {
        context.fillRect(canvas.width / 2 - grid / 2, i, grid, grid);
      }
    }, [canvasWidth, canvasHeight, wallThickness]);
    
    // Draw dynamic objects: balls and paddles (re-drawn each time gameState updates)
    useEffect(() => {
      const canvas = dynamicCanvasRef.current;
      const context = canvas.getContext('2d');

      // Clear the dynamic canvas
      context.clearRect(0, 0, canvas.width, canvas.height);

      const { balls, leftPaddle, rightPaddle } = gameState;

    // Draw paddles
    context.fillStyle = paddleColor;
    context.fillRect(leftPaddle.x, leftPaddle.y, leftPaddle.width, leftPaddle.height);
    context.fillRect(rightPaddle.x, rightPaddle.y, rightPaddle.width, rightPaddle.height);

    // Draw balls
    context.fillStyle = wallColor;
    balls.forEach(({ x, y, width, height }) => {
      context.fillRect(x, y, width, height)
    })
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
  // the “model” of the world
  gameState: PropTypes.shape({
    balls: PropTypes.arrayOf(
      PropTypes.shape({
        x: PropTypes.number.isRequired,
        y: PropTypes.number.isRequired,
        width: PropTypes.number.isRequired,
        height: PropTypes.number.isRequired,
        dx: PropTypes.number,
        dy: PropTypes.number,
        resetting: PropTypes.bool,
      })
    ).isRequired,
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
    scores: PropTypes.shape({
      player1: PropTypes.number.isRequired,
      player2: PropTypes.number.isRequired,
    }).isRequired,
  }).isRequired,

  // props for canvas sizing and wall thickness
  canvasWidth:  PropTypes.number.isRequired,
  canvasHeight: PropTypes.number.isRequired,
  wallThickness: PropTypes.number.isRequired,
};

export default PongCanvas;