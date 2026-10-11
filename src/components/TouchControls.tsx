import React from 'react';
import { Direction } from '../hooks/useSnakeGame';

interface TouchControlsProps {
  onDirection: (dir: Direction) => void;
  disabled: boolean;
}

export const TouchControls: React.FC<TouchControlsProps> = ({ onDirection, disabled }) => {
  const handleTouch = (dir: Direction) => (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    if (!disabled) {
      onDirection(dir);
    }
  };

  return (
    <div className="grid grid-cols-3 grid-rows-3 gap-2 w-48 h-48 mx-auto mt-4 select-none md:hidden">
      <div />
      <button
        onTouchStart={handleTouch('UP')}
        onMouseDown={handleTouch('UP')}
        className="bg-gray-800/80 hover:bg-gray-700 active:bg-cyan-600 rounded-xl flex items-center justify-center text-white text-2xl transition-all duration-100 active:scale-90 border border-gray-600/30 shadow-lg"
        aria-label="Move Up"
      >
        ↑
      </button>
      <div />
      <button
        onTouchStart={handleTouch('LEFT')}
        onMouseDown={handleTouch('LEFT')}
        className="bg-gray-800/80 hover:bg-gray-700 active:bg-cyan-600 rounded-xl flex items-center justify-center text-white text-2xl transition-all duration-100 active:scale-90 border border-gray-600/30 shadow-lg"
        aria-label="Move Left"
      >
        ←
      </button>
      <div className="bg-gray-900/40 rounded-xl flex items-center justify-center">
        <div className="w-3 h-3 rounded-full bg-gray-600" />
      </div>
      <button
        onTouchStart={handleTouch('RIGHT')}
        onMouseDown={handleTouch('RIGHT')}
        className="bg-gray-800/80 hover:bg-gray-700 active:bg-cyan-600 rounded-xl flex items-center justify-center text-white text-2xl transition-all duration-100 active:scale-90 border border-gray-600/30 shadow-lg"
        aria-label="Move Right"
      >
        →
      </button>
      <div />
      <button
        onTouchStart={handleTouch('DOWN')}
        onMouseDown={handleTouch('DOWN')}
        className="bg-gray-800/80 hover:bg-gray-700 active:bg-cyan-600 rounded-xl flex items-center justify-center text-white text-2xl transition-all duration-100 active:scale-90 border border-gray-600/30 shadow-lg"
        aria-label="Move Down"
      >
        ↓
      </button>
      <div />
    </div>
  );
};
