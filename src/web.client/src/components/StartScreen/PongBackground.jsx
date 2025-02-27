import React, { useRef, useEffect } from 'react';

const PongBackground = () => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const ctx = canvas.getContext('2d');

    // Set the canvas size to match the container's dimensions
    const setCanvasSize = () => {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    };
    setCanvasSize();

    // Retrieve global CSS variables for colors.
    const rootStyle = getComputedStyle(document.documentElement);
    
    const paddleColor = rootStyle.getPropertyValue('--orange').trim()
    const ballColor = rootStyle.getPropertyValue('--orange').trim()

    // Game elements
    let ball = {
      x: canvas.width / 2,
      y: canvas.height / 2,
      radius: 10,
      dx: 5, // horizontal velocity
      dy: 5  // vertical velocity
    };

    let leftPaddle = {
      x: 10,
      y: canvas.height / 2 - 50,
      width: 10,
      height: 100,
      speed: 12,
      direction: 1 // 1 means moving down, -1 means moving up
    };

    let rightPaddle = {
      x: canvas.width - 20,
      y: canvas.height / 2 - 50,
      width: 10,
      height: 100,
      speed: 10,
      direction: 1 // 1 means moving down, -1 means moving up
    };

    // Define a threshold to avoid jitter when nearly aligned with the ball
    const threshold = 40;

    // This helper function decides whether a paddle should actively track the ball.
    // In this example:
    // - Left paddle tracks only when the ball is moving left and is in the left half.
    // - Right paddle tracks only when the ball is moving right and is in the right half.
    const shouldTrackBallForPaddle = (paddle, ball) => {
      if (paddle === leftPaddle) {
        return ball.dx < 0 && ball.x < canvas.width / 3;
      } else if (paddle === rightPaddle) {
        return ball.dx > 0 && ball.x > canvas.width / 3;
      }
      return false;
    };

    // Draw functions
    const drawBall = () => {
      ctx.fillStyle = ballColor;
      // Draw the ball as a square centered at (ball.x, ball.y)
      ctx.fillRect(
        ball.x - ball.radius,
        ball.y - ball.radius,
        ball.radius * 2,
        ball.radius * 2
      );
    };

    const drawPaddle = (paddle) => {
      ctx.fillStyle = paddleColor;
      ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    };

    let animationFrameId;

    // Update function to animate game elements
    const update = () => {
      // Clear the canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw game elements
      drawBall();
      drawPaddle(leftPaddle);
      drawPaddle(rightPaddle);

      // Update ball position
      ball.x += ball.dx;
      ball.y += ball.dy;

      // Bounce off the top and bottom
      if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
        ball.dy = -ball.dy;
      }

      // Random factor for paddle movement
      const randomFactor = () => (Math.random() - 0.0003) * 1;

      // ======= Left Paddle AI =======
      if (shouldTrackBallForPaddle(leftPaddle, ball)) {
        const leftCenter = leftPaddle.y + leftPaddle.height / 2;
        const delta = ball.y - leftCenter;
        if (Math.abs(delta) > threshold) {
          leftPaddle.y += (delta < 0 ? -leftPaddle.speed : leftPaddle.speed) + randomFactor();
        }
      } else {
        // Slightly randomize movement direction occasionally
        if (Math.random() < 0.01) leftPaddle.direction *= -1; // 2% chance to switch direction
    
        leftPaddle.y += (leftPaddle.speed + randomFactor()) * leftPaddle.direction;
      }
    
      // Keep the left paddle within bounds
      if (leftPaddle.y < 0) {
        leftPaddle.y = 0;
        leftPaddle.direction = 1;
      } else if (leftPaddle.y + leftPaddle.height > canvas.height) {
        leftPaddle.y = canvas.height - leftPaddle.height;
        leftPaddle.direction = -1;
      }

      // ======= Right Paddle AI =======
      if (shouldTrackBallForPaddle(rightPaddle, ball)) {
        const rightCenter = rightPaddle.y + rightPaddle.height / 2;
        const delta = ball.y - rightCenter;
        if (Math.abs(delta) > threshold) {
          rightPaddle.y += (delta < 0 ? -rightPaddle.speed : rightPaddle.speed) + randomFactor();
        }
      } else {
        if (Math.random() < 0.01) rightPaddle.direction *= -1; // 2% chance to switch direction
    
        rightPaddle.y += (rightPaddle.speed + randomFactor()) * rightPaddle.direction;
      }
    
      // Keep the right paddle within bounds
      if (rightPaddle.y < 0) {
        rightPaddle.y = 0;
        rightPaddle.direction = 1;
      } else if (rightPaddle.y + rightPaddle.height > canvas.height) {
        rightPaddle.y = canvas.height - rightPaddle.height;
        rightPaddle.direction = -1;
      }

      // ======= Collision Detection =======
      // Left paddle collision
      if (
        ball.x - ball.radius < leftPaddle.x + leftPaddle.width &&
        ball.y > leftPaddle.y &&
        ball.y < leftPaddle.y + leftPaddle.height
      ) {
        ball.dx = -ball.dx;
        ball.x = leftPaddle.x + leftPaddle.width + ball.radius;
      }

      // Right paddle collision
      if (
        ball.x + ball.radius > rightPaddle.x &&
        ball.y > rightPaddle.y &&
        ball.y < rightPaddle.y + rightPaddle.height
      ) {
        ball.dx = -ball.dx;
        ball.x = rightPaddle.x - ball.radius;
      }

      // Reset the ball if it goes off-screen horizontally
      if (ball.x - ball.radius < 0 || ball.x + ball.radius > canvas.width) {
        ball.x = canvas.width / 2;
        ball.y = canvas.height / 2;
        ball.dx = -ball.dx; // Reverse horizontal direction for variety
      }

      animationFrameId = requestAnimationFrame(update);
    };

    // Start the animation loop
    update();

    // Resize canvas if the window is resized
    const handleResize = () => {
      setCanvasSize();
    };
    window.addEventListener('resize', handleResize);

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        height: '100%'
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 0,
          border: 'none'
        }}
      />
    </div>
  );
};

export default PongBackground;
