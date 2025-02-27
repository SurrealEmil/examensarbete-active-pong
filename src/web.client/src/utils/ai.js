

export const updateAiPaddle = (rightPaddle, ball, canvasHeight, aiSettings) => {
  const { AI_DELAY_FRAMES, AI_INACCURACY, AI_SPEED, aiDelayCounterRef } = aiSettings;

  aiDelayCounterRef.current += 1;
  if (aiDelayCounterRef.current < AI_DELAY_FRAMES) {
    return; // AI updates every AI_DELAY_FRAMES frames
  }
  aiDelayCounterRef.current = 0;

  const ballCenter = ball.y + ball.height / 2;
  // Add or reduce random offset to make AI more or less accurate
  const offset = (Math.random() - 0.5) * 2 * AI_INACCURACY;
  const targetY = ballCenter + offset;

  const paddleCenter = rightPaddle.y + (rightPaddle.height / 2);
  const diff = targetY - paddleCenter;

  /*
   * 1) Lower the threshold so AI moves more aggressively even if diff is small
   * 2) Increase AI_SPEED so it moves farther each update
   */
  if (Math.abs(diff) > 2) {
    // Use AI_SPEED to move the paddle up/down
    rightPaddle.y += diff > 0 ? AI_SPEED : -AI_SPEED;
  } else {
    // If diff is small, just move partially to "fine-tune" the position
    rightPaddle.y += diff;
  }

  // Clamp within boundaries
  rightPaddle.y = Math.max(0, Math.min(rightPaddle.y, canvasHeight - rightPaddle.height));
};
