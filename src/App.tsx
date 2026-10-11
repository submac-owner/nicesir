import React, { useEffect, useCallback } from 'react';
import { useSnakeGame, Direction, Difficulty } from './hooks/useSnakeGame';
import { GameBoard } from './components/GameBoard';
import { TouchControls } from './components/TouchControls';

const difficultyLabels: Record<Difficulty, string> = {
  easy: '🟢 Easy',
  medium: '🟡 Medium',
  hard: '🔴 Hard',
};

function App() {
  const {
    snake,
    food,
    gameState,
    score,
    difficulty,
    highScore,
    gridSize,
    eatenAnimation,
    changeDirection,
    startGame,
    togglePause,
    restartGame,
    changeDifficulty,
  } = useSnakeGame();

  // Keyboard controls
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const keyMap: Record<string, Direction> = {
        ArrowUp: 'UP',
        ArrowDown: 'DOWN',
        ArrowLeft: 'LEFT',
        ArrowRight: 'RIGHT',
        w: 'UP',
        s: 'DOWN',
        a: 'LEFT',
        d: 'RIGHT',
        W: 'UP',
        S: 'DOWN',
        A: 'LEFT',
        D: 'RIGHT',
      };

      if (keyMap[e.key]) {
        e.preventDefault();
        if (gameState === 'playing') {
          changeDirection(keyMap[e.key]);
        }
      }

      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (gameState === 'idle' || gameState === 'gameover') {
          startGame();
        } else {
          togglePause();
        }
      }

      if (e.key === 'p' || e.key === 'P') {
        if (gameState === 'playing' || gameState === 'paused') {
          togglePause();
        }
      }

      if (e.key === 'r' || e.key === 'R') {
        if (gameState !== 'idle') {
          restartGame();
        }
      }
    },
    [gameState, changeDirection, startGame, togglePause, restartGame]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Swipe controls
  useEffect(() => {
    let touchStartX = 0;
    let touchStartY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (gameState !== 'playing') return;

      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const dx = touchEndX - touchStartX;
      const dy = touchEndY - touchStartY;
      const minSwipe = 30;

      if (Math.abs(dx) < minSwipe && Math.abs(dy) < minSwipe) return;

      if (Math.abs(dx) > Math.abs(dy)) {
        changeDirection(dx > 0 ? 'RIGHT' : 'LEFT');
      } else {
        changeDirection(dy > 0 ? 'DOWN' : 'UP');
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [gameState, changeDirection]);

  const handleAction = () => {
    if (gameState === 'idle' || gameState === 'gameover') {
      startGame();
    } else {
      togglePause();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col items-center justify-center p-4 overflow-hidden">
      {/* Header */}
      <div className="w-full max-w-lg mb-4">
        <h1 className="text-3xl md:text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400 mb-4">
          🐍 Snake
        </h1>

        {/* Score Panel */}
        <div className="flex justify-between items-center bg-gray-800/60 backdrop-blur-sm rounded-xl px-4 py-3 border border-gray-700/50">
          <div className="text-center">
            <div className="text-xs text-gray-400 uppercase tracking-wider">Score</div>
            <div className={`text-2xl font-bold text-cyan-400 transition-transform ${eatenAnimation ? 'scale-125' : 'scale-100'}`}>
              {score}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-400 uppercase tracking-wider">High Score</div>
            <div className="text-2xl font-bold text-amber-400">
              {highScore}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-400 uppercase tracking-wider">Length</div>
            <div className="text-2xl font-bold text-emerald-400">
              {snake.length}
            </div>
          </div>
        </div>
      </div>

      {/* Game Board */}
      <GameBoard
        snake={snake}
        food={food}
        gridSize={gridSize}
        gameState={gameState}
        eatenAnimation={eatenAnimation}
      />

      {/* Touch Controls */}
      <TouchControls
        onDirection={changeDirection}
        disabled={gameState !== 'playing'}
      />

      {/* Controls Panel */}
      <div className="w-full max-w-lg mt-4 space-y-3">
        {/* Difficulty Selector */}
        <div className="flex justify-center gap-2">
          {(Object.keys(difficultyLabels) as Difficulty[]).map((diff) => (
            <button
              key={diff}
              onClick={() => changeDifficulty(diff)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                difficulty === diff
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'
                  : 'bg-gray-700/60 text-gray-300 hover:bg-gray-600/60'
              }`}
            >
              {difficultyLabels[diff]}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-3">
          <button
            onClick={handleAction}
            className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-400/30 active:scale-95"
          >
            {gameState === 'idle' && '▶ Start'}
            {gameState === 'playing' && '⏸ Pause'}
            {gameState === 'paused' && '▶ Resume'}
            {gameState === 'gameover' && '▶ Play Again'}
          </button>
          {gameState !== 'idle' && (
            <button
              onClick={restartGame}
              className="px-6 py-2.5 bg-gray-700/60 hover:bg-gray-600/60 text-gray-200 font-semibold rounded-xl transition-all duration-200 border border-gray-600/30 active:scale-95"
            >
              🔄 Restart
            </button>
          )}
        </div>

        {/* Keyboard hints (desktop only) */}
        <div className="hidden md:flex justify-center gap-4 text-xs text-gray-500">
          <span>
            <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-gray-300">↑↓←→</kbd> or{' '}
            <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-gray-300">WASD</kbd> Move
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-gray-300">Space</kbd> Start/Pause
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-gray-300">R</kbd> Restart
          </span>
        </div>
      </div>
    </div>
  );
}

export default App;
