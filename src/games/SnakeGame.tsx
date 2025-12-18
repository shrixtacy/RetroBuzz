import React, { useState, useEffect, useCallback } from 'react';
import { SoundEffects } from '../utils/soundEffects';

interface Position {
  x: number;
  y: number;
}

interface SnakeGameProps {
  onGameOver: (score: number) => void;
}

const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_FOOD = { x: 15, y: 15 };
const INITIAL_DIRECTION = { x: 0, y: -1 };

const SnakeGame: React.FC<SnakeGameProps> = ({ onGameOver }) => {
  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Position>(INITIAL_FOOD);
  const [direction, setDirection] = useState<Position>(INITIAL_DIRECTION);
  const [gameRunning, setGameRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [speed, setSpeed] = useState(200);
  const [soundEffects] = useState(() => SoundEffects.getInstance());

  const generateFood = useCallback((snakeBody: Position[]): Position => {
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
    } while (snakeBody.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
  }, []);

  const moveSnake = useCallback(() => {
    if (!gameRunning || gameOver) return;

    setSnake(currentSnake => {
      const newSnake = [...currentSnake];
      const head = { ...newSnake[0] };
      
      head.x += direction.x;
      head.y += direction.y;

      // Check wall collision
      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        soundEffects.playGameOver();
        setGameOver(true);
        setGameRunning(false);
        onGameOver(score);
        return currentSnake;
      }

      // Check self collision
      if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
        soundEffects.playGameOver();
        setGameOver(true);
        setGameRunning(false);
        onGameOver(score);
        return currentSnake;
      }

      newSnake.unshift(head);

      // Check food collision
      if (head.x === food.x && head.y === food.y) {
        soundEffects.playSnakeEat();
        setScore(prev => prev + 10);
        setFood(generateFood(newSnake));
        // Increase speed slightly
        setSpeed(prev => Math.max(100, prev - 2));
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, food, gameRunning, gameOver, score, onGameOver, generateFood]);

  useEffect(() => {
    const gameInterval = setInterval(moveSnake, speed);
    return () => clearInterval(gameInterval);
  }, [moveSnake, speed]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!gameRunning && !gameOver) return;

      switch (e.key) {
        case 'ArrowUp':
          if (direction.y !== 1) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
          if (direction.y !== -1) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
          if (direction.x !== 1) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
          if (direction.x !== -1) setDirection({ x: 1, y: 0 });
          break;
        case ' ':
          e.preventDefault();
          if (gameOver) {
            resetGame();
          } else {
            setGameRunning(prev => !prev);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [direction, gameRunning, gameOver]);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setFood(INITIAL_FOOD);
    setDirection(INITIAL_DIRECTION);
    setScore(0);
    setGameOver(false);
    setGameRunning(false);
    setSpeed(200);
  };

  const startGame = () => {
    if (gameOver) {
      resetGame();
    }
    soundEffects.playGameStart();
    setGameRunning(true);
  };

  return (
    <div style={{ padding: '8px', textAlign: 'center' }}>
      <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '12px', fontWeight: 'bold' }}>
          Score: {score}
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button 
            className="win95-button" 
            onClick={startGame}
            style={{ fontSize: '10px', padding: '2px 8px' }}
          >
            {gameOver ? 'New Game' : gameRunning ? 'Running' : 'Start'}
          </button>
          <button 
            className="win95-button" 
            onClick={() => setGameRunning(prev => !prev)}
            disabled={gameOver}
            style={{ fontSize: '10px', padding: '2px 8px' }}
          >
            {gameRunning ? 'Pause' : 'Resume'}
          </button>
        </div>
      </div>

      <div 
        style={{
          width: `${GRID_SIZE * 15}px`,
          height: `${GRID_SIZE * 15}px`,
          border: '2px inset #c0c0c0',
          backgroundColor: '#000',
          position: 'relative',
          margin: '0 auto'
        }}
      >
        {/* Snake */}
        {snake.map((segment, index) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              left: `${segment.x * 15}px`,
              top: `${segment.y * 15}px`,
              width: '15px',
              height: '15px',
              backgroundColor: index === 0 ? '#00ff00' : '#008000',
              border: '1px solid #004000'
            }}
          />
        ))}

        {/* Food */}
        <div
          style={{
            position: 'absolute',
            left: `${food.x * 15}px`,
            top: `${food.y * 15}px`,
            width: '15px',
            height: '15px',
            backgroundColor: '#ff0000',
            borderRadius: '50%'
          }}
        />
      </div>

      <div style={{ marginTop: '8px', fontSize: '10px', color: '#666' }}>
        {gameOver ? (
          <div>
            <div style={{ color: '#ff0000', fontWeight: 'bold' }}>Game Over!</div>
            <div>Press Space or New Game to restart</div>
          </div>
        ) : (
          <div>
            <div>Use arrow keys to move</div>
            <div>Space to pause/resume</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SnakeGame;