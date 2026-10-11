import { useState, useCallback, useEffect, useRef } from 'react';

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
export type Position = { x: number; y: number };
export type Difficulty = 'easy' | 'medium' | 'hard';
export type GameState = 'idle' | 'playing' | 'paused' | 'gameover';

const GRID_SIZE = 20;

const SPEED_MAP: Record<Difficulty, number> = {
  easy: 150,
  medium: 100,
  hard: 60,
};

const INITIAL_SNAKE: Position[] = [
  { x: 10, y: 10 },
  { x: 9, y: 10 },
  { x: 8, y: 10 },
];

function getRandomFood(snake: Position[]): Position {
  let food: Position;
  do {
    food = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  } while (snake.some((seg) => seg.x === food.x && seg.y === food.y));
  return food;
}

function getHighScore(difficulty: Difficulty): number {
  try {
    return parseInt(localStorage.getItem(`snake-highscore-${difficulty}`) || '0', 10);
  } catch {
    return 0;
  }
}

function setHighScore(difficulty: Difficulty, score: number): void {
  try {
    localStorage.setItem(`snake-highscore-${difficulty}`, score.toString());
  } catch {
    // ignore
  }
}

export function useSnakeGame() {
  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Position>(() => getRandomFood(INITIAL_SNAKE));
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [gameState, setGameState] = useState<GameState>('idle');
  const [score, setScore] = useState(0);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [highScore, setHighScoreState] = useState(() => getHighScore('medium'));
  const [eatenAnimation, setEatenAnimation] = useState(false);

  const directionRef = useRef<Direction>('RIGHT');
  const gameStateRef = useRef<GameState>('idle');
  const snakeRef = useRef<Position[]>(INITIAL_SNAKE);
  const foodRef = useRef<Position>(food);
  const scoreRef = useRef(0);
  const gameLoopRef = useRef<number | null>(null);

  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    snakeRef.current = snake;
  }, [snake]);

  useEffect(() => {
    foodRef.current = food;
  }, [food]);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  const changeDirection = useCallback((newDir: Direction) => {
    const opposites: Record<Direction, Direction> = {
      UP: 'DOWN',
      DOWN: 'UP',
      LEFT: 'RIGHT',
      RIGHT: 'LEFT',
    };
    if (opposites[newDir] !== directionRef.current) {
      setDirection(newDir);
      directionRef.current = newDir;
    }
  }, []);

  const tick = useCallback(() => {
    if (gameStateRef.current !== 'playing') return;

    const currentSnake = [...snakeRef.current];
    const head = { ...currentSnake[0] };
    const dir = directionRef.current;

    switch (dir) {
      case 'UP':
        head.y -= 1;
        break;
      case 'DOWN':
        head.y += 1;
        break;
      case 'LEFT':
        head.x -= 1;
        break;
      case 'RIGHT':
        head.x += 1;
        break;
    }

    // Check wall collision
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
      setGameState('gameover');
      gameStateRef.current = 'gameover';
      const currentScore = scoreRef.current;
      const currentHigh = getHighScore(difficulty);
      if (currentScore > currentHigh) {
        setHighScore(difficulty, currentScore);
        setHighScoreState(currentScore);
      }
      return;
    }

    // Check self collision
    if (currentSnake.some((seg) => seg.x === head.x && seg.y === head.y)) {
      setGameState('gameover');
      gameStateRef.current = 'gameover';
      const currentScore = scoreRef.current;
      const currentHigh = getHighScore(difficulty);
      if (currentScore > currentHigh) {
        setHighScore(difficulty, currentScore);
        setHighScoreState(currentScore);
      }
      return;
    }

    const newSnake = [head, ...currentSnake];
    const currentFood = foodRef.current;

    if (head.x === currentFood.x && head.y === currentFood.y) {
      // Ate food
      const newScore = scoreRef.current + (difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3);
      setScore(newScore);
      scoreRef.current = newScore;
      const newFood = getRandomFood(newSnake);
      setFood(newFood);
      foodRef.current = newFood;
      setEatenAnimation(true);
      setTimeout(() => setEatenAnimation(false), 300);
    } else {
      newSnake.pop();
    }

    setSnake(newSnake);
    snakeRef.current = newSnake;
  }, [difficulty]);

  const startGame = useCallback(() => {
    const initialSnake = [...INITIAL_SNAKE];
    setSnake(initialSnake);
    snakeRef.current = initialSnake;
    setFood(getRandomFood(initialSnake));
    setDirection('RIGHT');
    directionRef.current = 'RIGHT';
    setScore(0);
    scoreRef.current = 0;
    setGameState('playing');
    gameStateRef.current = 'playing';
  }, []);

  const togglePause = useCallback(() => {
    if (gameStateRef.current === 'playing') {
      setGameState('paused');
      gameStateRef.current = 'paused';
    } else if (gameStateRef.current === 'paused') {
      setGameState('playing');
      gameStateRef.current = 'playing';
    }
  }, []);

  const restartGame = useCallback(() => {
    startGame();
  }, [startGame]);

  const changeDifficulty = useCallback((diff: Difficulty) => {
    setDifficulty(diff);
    setHighScoreState(getHighScore(diff));
  }, []);

  // Game loop
  useEffect(() => {
    if (gameState === 'playing') {
      const speed = SPEED_MAP[difficulty];
      gameLoopRef.current = window.setInterval(tick, speed);
    } else {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = null;
      }
    }
    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = null;
      }
    };
  }, [gameState, difficulty, tick]);

  return {
    snake,
    food,
    direction,
    gameState,
    score,
    difficulty,
    highScore,
    gridSize: GRID_SIZE,
    eatenAnimation,
    changeDirection,
    startGame,
    togglePause,
    restartGame,
    changeDifficulty,
  };
}
