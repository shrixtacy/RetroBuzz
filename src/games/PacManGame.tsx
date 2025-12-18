import React, { useState, useEffect, useCallback, useRef } from 'react';

interface Position {
  x: number;
  y: number;
}

interface Ghost {
  x: number;
  y: number;
  direction: string;
  color: string;
}

const MAZE = [
  "######################",
  "#..........##........#",
  "#.##.#####.##.#####.##",
  "#o##.......##.......##",
  "#.##.#####.##.#####.##",
  "#....................#",
  "####.##.########.##.##",
  "   #.##....##....##.# ",
  "####.#####.##.#####.##",
  "#..........##........#",
  "#.##.#####.##.#####.##",
  "#o##.......##.......##",
  "#.##.#####.##.#####.##",
  "#....................#",
  "######################"
];

const PacManGame: React.FC = () => {
  const [pacman, setPacman] = useState<Position>({ x: 1, y: 1 });
  const [ghosts, setGhosts] = useState<Ghost[]>([
    { x: 10, y: 7, direction: 'up', color: '#ff0000' },
    { x: 11, y: 7, direction: 'down', color: '#ffb8ff' },
    { x: 12, y: 7, direction: 'left', color: '#00ffff' },
    { x: 13, y: 7, direction: 'right', color: '#ffb852' }
  ]);
  const [maze, setMaze] = useState(MAZE.map(row => row.split('')));
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [direction, setDirection] = useState<string>('');
  const gameLoopRef = useRef<number>();

  const isValidMove = (x: number, y: number) => {
    if (y < 0 || y >= maze.length || x < 0 || x >= maze[0].length) return false;
    return maze[y][x] !== '#';
  };

  const movePacman = useCallback((newDirection: string) => {
    if (gameOver || gameWon) return;

    setPacman(prev => {
      let newX = prev.x;
      let newY = prev.y;

      switch (newDirection) {
        case 'up': newY--; break;
        case 'down': newY++; break;
        case 'left': newX--; break;
        case 'right': newX++; break;
      }

      if (isValidMove(newX, newY)) {
        // Check for dots
        if (maze[newY][newX] === '.') {
          setMaze(prevMaze => {
            const newMaze = [...prevMaze];
            newMaze[newY] = [...newMaze[newY]];
            newMaze[newY][newX] = ' ';
            return newMaze;
          });
          setScore(prev => prev + 10);
        }

        // Check for power pellets
        if (maze[newY][newX] === 'o') {
          setMaze(prevMaze => {
            const newMaze = [...prevMaze];
            newMaze[newY] = [...newMaze[newY]];
            newMaze[newY][newX] = ' ';
            return newMaze;
          });
          setScore(prev => prev + 50);
        }

        return { x: newX, y: newY };
      }
      return prev;
    });
  }, [maze, gameOver, gameWon]);

  const moveGhosts = useCallback(() => {
    setGhosts(prevGhosts => 
      prevGhosts.map(ghost => {
        const directions = ['up', 'down', 'left', 'right'];
        let newX = ghost.x;
        let newY = ghost.y;
        let newDirection = ghost.direction;

        // Try to continue in current direction
        switch (ghost.direction) {
          case 'up': newY--; break;
          case 'down': newY++; break;
          case 'left': newX--; break;
          case 'right': newX++; break;
        }

        // If can't continue, pick random valid direction
        if (!isValidMove(newX, newY)) {
          const validDirections = directions.filter(dir => {
            let testX = ghost.x;
            let testY = ghost.y;
            switch (dir) {
              case 'up': testY--; break;
              case 'down': testY++; break;
              case 'left': testX--; break;
              case 'right': testX++; break;
            }
            return isValidMove(testX, testY);
          });

          if (validDirections.length > 0) {
            newDirection = validDirections[Math.floor(Math.random() * validDirections.length)];
            newX = ghost.x;
            newY = ghost.y;
            switch (newDirection) {
              case 'up': newY--; break;
              case 'down': newY++; break;
              case 'left': newX--; break;
              case 'right': newX++; break;
            }
          } else {
            newX = ghost.x;
            newY = ghost.y;
          }
        }

        return { ...ghost, x: newX, y: newY, direction: newDirection };
      })
    );
  }, []);

  const checkCollisions = useCallback(() => {
    ghosts.forEach(ghost => {
      if (ghost.x === pacman.x && ghost.y === pacman.y) {
        setGameOver(true);
      }
    });
  }, [ghosts, pacman]);

  const checkWin = useCallback(() => {
    const dotsLeft = maze.some(row => row.some(cell => cell === '.' || cell === 'o'));
    if (!dotsLeft) {
      setGameWon(true);
    }
  }, [maze]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          setDirection('up');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          setDirection('down');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          setDirection('left');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          setDirection('right');
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

  useEffect(() => {
    if (direction) {
      movePacman(direction);
    }
  }, [direction, movePacman]);

  useEffect(() => {
    if (!gameOver && !gameWon) {
      gameLoopRef.current = window.setInterval(() => {
        moveGhosts();
        checkCollisions();
        checkWin();
      }, 200);
    }

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [gameOver, gameWon, moveGhosts, checkCollisions, checkWin]);

  const resetGame = () => {
    setPacman({ x: 1, y: 1 });
    setGhosts([
      { x: 10, y: 7, direction: 'up', color: '#ff0000' },
      { x: 11, y: 7, direction: 'down', color: '#ffb8ff' },
      { x: 12, y: 7, direction: 'left', color: '#00ffff' },
      { x: 13, y: 7, direction: 'right', color: '#ffb852' }
    ]);
    setMaze(MAZE.map(row => row.split('')));
    setScore(0);
    setGameOver(false);
    setGameWon(false);
    setDirection('');
  };

  const renderCell = (cell: string, x: number, y: number) => {
    const isPacman = pacman.x === x && pacman.y === y;
    const ghost = ghosts.find(g => g.x === x && g.y === y);

    let content = '';
    let backgroundColor = 'transparent';
    let color = '#ffff00';

    if (cell === '#') {
      backgroundColor = '#0000ff';
      content = '';
    } else if (cell === '.') {
      content = '·';
      color = '#ffff00';
    } else if (cell === 'o') {
      content = '●';
      color = '#ffff00';
    }

    if (isPacman) {
      content = '●';
      color = '#ffff00';
    } else if (ghost) {
      content = '👻';
      color = ghost.color;
    }

    return (
      <div
        key={`${x}-${y}`}
        style={{
          width: '20px',
          height: '20px',
          backgroundColor,
          color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '16px',
          fontWeight: 'bold',
          border: cell === '#' ? '1px solid #4444ff' : 'none'
        }}
      >
        {content}
      </div>
    );
  };

  return (
    <div style={{ padding: '10px', backgroundColor: '#000000', color: '#ffff00', fontFamily: 'monospace' }}>
      <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>Score: {score}</div>
        <button 
          className="win95-button" 
          onClick={resetGame}
          style={{ fontSize: '10px', padding: '2px 8px' }}
        >
          New Game
        </button>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: `repeat(${maze[0].length}, 20px)`,
        gap: '0px',
        border: '2px solid #ffff00',
        backgroundColor: '#000000',
        padding: '5px'
      }}>
        {maze.map((row, y) =>
          row.map((cell, x) => renderCell(cell, x, y))
        )}
      </div>

      <div style={{ marginTop: '10px', fontSize: '10px' }}>
        <div>Use arrow keys or WASD to move</div>
        <div>Eat all dots to win! Avoid the ghosts!</div>
      </div>

      {gameOver && (
        <div style={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          backgroundColor: '#ff0000',
          color: '#ffffff',
          padding: '20px',
          border: '3px solid #ffffff',
          textAlign: 'center',
          fontSize: '16px',
          fontWeight: 'bold'
        }}>
          GAME OVER!<br />
          Final Score: {score}
          <br />
          <button className="win95-button" onClick={resetGame} style={{ marginTop: '10px' }}>
            Play Again
          </button>
        </div>
      )}

      {gameWon && (
        <div style={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          backgroundColor: '#00ff00',
          color: '#000000',
          padding: '20px',
          border: '3px solid #000000',
          textAlign: 'center',
          fontSize: '16px',
          fontWeight: 'bold'
        }}>
          YOU WIN!<br />
          Final Score: {score}
          <br />
          <button className="win95-button" onClick={resetGame} style={{ marginTop: '10px' }}>
            Play Again
          </button>
        </div>
      )}
    </div>
  );
};

export default PacManGame;