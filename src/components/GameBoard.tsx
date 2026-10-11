import React, { useRef, useEffect, useCallback } from 'react';
import { Position, GameState } from '../hooks/useSnakeGame';

interface GameBoardProps {
  snake: Position[];
  food: Position;
  gridSize: number;
  gameState: GameState;
  eatenAnimation: boolean;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  snake,
  food,
  gridSize,
  gameState,
  eatenAnimation,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cellSize = canvas.width / gridSize;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid background
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw subtle grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= gridSize; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, canvas.height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(canvas.width, i * cellSize);
      ctx.stroke();
    }

    // Draw food with glow effect
    const foodX = food.x * cellSize + cellSize / 2;
    const foodY = food.y * cellSize + cellSize / 2;
    const foodRadius = cellSize * 0.4;

    // Food glow
    const glowGradient = ctx.createRadialGradient(
      foodX, foodY, 0,
      foodX, foodY, cellSize * 0.8
    );
    glowGradient.addColorStop(0, 'rgba(255, 82, 82, 0.4)');
    glowGradient.addColorStop(1, 'rgba(255, 82, 82, 0)');
    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(foodX, foodY, cellSize * 0.8, 0, Math.PI * 2);
    ctx.fill();

    // Food body
    const foodGradient = ctx.createRadialGradient(
      foodX - foodRadius * 0.3, foodY - foodRadius * 0.3, 0,
      foodX, foodY, foodRadius
    );
    foodGradient.addColorStop(0, '#ff6b6b');
    foodGradient.addColorStop(1, '#ee5a24');
    ctx.fillStyle = foodGradient;
    ctx.beginPath();
    ctx.arc(foodX, foodY, foodRadius, 0, Math.PI * 2);
    ctx.fill();

    // Draw snake
    snake.forEach((segment, index) => {
      const x = segment.x * cellSize;
      const y = segment.y * cellSize;
      const padding = 1;

      if (index === 0) {
        // Head with gradient
        const headGradient = ctx.createLinearGradient(x, y, x + cellSize, y + cellSize);
        headGradient.addColorStop(0, '#00d2d3');
        headGradient.addColorStop(1, '#01a3a4');
        ctx.fillStyle = headGradient;
        ctx.beginPath();
        ctx.roundRect(x + padding, y + padding, cellSize - padding * 2, cellSize - padding * 2, 5);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#fff';
        const eyeSize = cellSize * 0.15;
        const eyeOffset = cellSize * 0.25;
        ctx.beginPath();
        ctx.arc(x + cellSize / 2 - eyeOffset, y + cellSize / 2 - eyeOffset * 0.5, eyeSize, 0, Math.PI * 2);
        ctx.arc(x + cellSize / 2 + eyeOffset, y + cellSize / 2 - eyeOffset * 0.5, eyeSize, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Body segments with gradient based on position
        const progress = index / snake.length;
        const r = Math.round(0 + progress * 10);
        const g = Math.round(210 - progress * 80);
        const b = Math.round(211 - progress * 80);
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        
        ctx.beginPath();
        ctx.roundRect(x + padding, y + padding, cellSize - padding * 2, cellSize - padding * 2, 3);
        ctx.fill();
      }
    });

    // Eaten animation (pulse effect)
    if (eatenAnimation) {
      ctx.fillStyle = 'rgba(0, 210, 211, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, [snake, food, gridSize, eatenAnimation]);

  // Resize canvas
  useEffect(() => {
    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const size = Math.min(container.clientWidth, container.clientHeight);
      canvas.width = size;
      canvas.height = size;
      draw();
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [draw]);

  // Redraw on state change
  useEffect(() => {
    draw();
  }, [draw]);

  return (
    <div ref={containerRef} className="relative w-full aspect-square max-w-[min(80vh,500px)] mx-auto">
      <canvas
        ref={canvasRef}
        className="w-full h-full rounded-xl shadow-2xl border border-gray-700/50"
      />
      {/* Overlay for game states */}
      {gameState === 'idle' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-xl backdrop-blur-sm">
          <div className="text-center">
            <div className="text-5xl mb-4">🐍</div>
            <h2 className="text-2xl font-bold text-white mb-2">Snake Game</h2>
            <p className="text-gray-300 text-sm">Press Start or Space to begin</p>
          </div>
        </div>
      )}
      {gameState === 'paused' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-xl backdrop-blur-sm">
          <div className="text-center">
            <div className="text-4xl mb-3">⏸️</div>
            <h2 className="text-2xl font-bold text-white mb-2">Paused</h2>
            <p className="text-gray-300 text-sm">Press Space or P to resume</p>
          </div>
        </div>
      )}
      {gameState === 'gameover' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-xl backdrop-blur-sm">
          <div className="text-center">
            <div className="text-4xl mb-3">💀</div>
            <h2 className="text-2xl font-bold text-red-400 mb-2">Game Over</h2>
            <p className="text-gray-300 text-sm">Press Restart or Space to play again</p>
          </div>
        </div>
      )}
    </div>
  );
};
