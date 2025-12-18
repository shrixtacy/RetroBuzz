import React, { useState, useEffect, useCallback } from 'react';
import { SoundEffects } from '../utils/soundEffects';

interface TetrisGameProps {
  onGameOver: (score: number) => void;
}

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const EMPTY_CELL = 0;

// Tetris pieces (tetrominoes)
const PIECES = [
  // I-piece
  [
    [1, 1, 1, 1]
  ],
  // O-piece
  [
    [2, 2],
    [2, 2]
  ],
  // T-piece
  [
    [0, 3, 0],
    [3, 3, 3]
  ],
  // S-piece
  [
    [0, 4, 4],
    [4, 4, 0]
  ],
  // Z-piece
  [
    [5, 5, 0],
    [0, 5, 5]
  ],
  // J-piece
  [
    [6, 0, 0],
    [6, 6, 6]
  ],
  // L-piece
  [
    [0, 0, 7],
    [7, 7, 7]
  ]
];

const COLORS = [
  '#000000', // Empty
  '#00ffff', // I-piece (cyan)
  '#ffff00', // O-piece (yellow)
  '#800080', // T-piece (purple)
  '#00ff00', // S-piece (green)
  '#ff0000', // Z-piece (red)
  '#0000ff', // J-piece (blue)
  '#ffa500'  // L-piece (orange)
];

interface Position {
  x: number;
  y: number;
}

interface Piece {
  shape: number[][];
  position: Position;
  color: number;
}

const TetrisGame: React.FC<TetrisGameProps> = ({ onGameOver }) => {
  const [board, setBoard] = useState<number[][]>(() => 
    Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(EMPTY_CELL))
  );
  const [currentPiece, setCurrentPiece] = useState<Piece | null>(null);
  const [nextPiece, setNextPiece] = useState<Piece | null>(null);
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameRunning, setGameRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [dropTime, setDropTime] = useState(1000);
  const [soundEffects] = useState(() => SoundEffects.getInstance());

  const createPiece = useCallback((): Piece => {
    const pieceIndex = Math.floor(Math.random() * PIECES.length);
    return {
      shape: PIECES[pieceIndex],
      position: { x: Math.floor(BOARD_WIDTH / 2) - 1, y: 0 },
      color: pieceIndex + 1
    };
  }, []);

  const rotatePiece = (piece: number[][]): number[][] => {
    const rotated = piece[0].map((_, index) =>
      piece.map(row => row[index]).reverse()
    );
    return rotated;
  };

  const isValidMove = useCallback((piece: Piece, newPosition: Position, newShape?: number[][]): boolean => {
    const shape = newShape || piece.shape;
    
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x] !== 0) {
          const newX = newPosition.x + x;
          const newY = newPosition.y + y;
          
          if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
            return false;
          }
          
          if (newY >= 0 && board[newY][newX] !== EMPTY_CELL) {
            return false;
          }
        }
      }
    }
    return true;
  }, [board]);

  const placePiece = useCallback((piece: Piece): number[][] => {
    const newBoard = board.map(row => [...row]);
    
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x] !== 0) {
          const boardY = piece.position.y + y;
          const boardX = piece.position.x + x;
          if (boardY >= 0) {
            newBoard[boardY][boardX] = piece.color;
          }
        }
      }
    }
    
    return newBoard;
  }, [board]);

  const clearLines = useCallback((board: number[][]): { newBoard: number[][]; linesCleared: number } => {
    const newBoard = board.filter(row => row.some(cell => cell === EMPTY_CELL));
    const linesCleared = BOARD_HEIGHT - newBoard.length;
    
    while (newBoard.length < BOARD_HEIGHT) {
      newBoard.unshift(Array(BOARD_WIDTH).fill(EMPTY_CELL));
    }
    
    return { newBoard, linesCleared };
  }, []);

  const dropPiece = useCallback(() => {
    if (!currentPiece || !gameRunning || gameOver) return;

    const newPosition = { ...currentPiece.position, y: currentPiece.position.y + 1 };
    
    if (isValidMove(currentPiece, newPosition)) {
      setCurrentPiece({ ...currentPiece, position: newPosition });
    } else {
      // Place the piece
      const newBoard = placePiece(currentPiece);
      const { newBoard: clearedBoard, linesCleared } = clearLines(newBoard);
      
      setBoard(clearedBoard);
      setLines(prev => prev + linesCleared);
      setScore(prev => prev + (linesCleared * 100 * level) + 10);
      
      if (linesCleared > 0) {
        soundEffects.playTetrisLine();
      }
      
      // Check for game over
      if (currentPiece.position.y <= 1) {
        soundEffects.playGameOver();
        setGameOver(true);
        setGameRunning(false);
        onGameOver(score);
        return;
      }
      
      // Spawn next piece
      setCurrentPiece(nextPiece);
      setNextPiece(createPiece());
    }
  }, [currentPiece, gameRunning, gameOver, isValidMove, placePiece, clearLines, level, score, nextPiece, createPiece, onGameOver]);

  const movePiece = useCallback((direction: 'left' | 'right' | 'down') => {
    if (!currentPiece || !gameRunning || gameOver) return;

    let newPosition = { ...currentPiece.position };
    
    switch (direction) {
      case 'left':
        newPosition.x -= 1;
        break;
      case 'right':
        newPosition.x += 1;
        break;
      case 'down':
        newPosition.y += 1;
        break;
    }
    
    if (isValidMove(currentPiece, newPosition)) {
      setCurrentPiece({ ...currentPiece, position: newPosition });
    }
  }, [currentPiece, gameRunning, gameOver, isValidMove]);

  const rotatePieceHandler = useCallback(() => {
    if (!currentPiece || !gameRunning || gameOver) return;

    const rotatedShape = rotatePiece(currentPiece.shape);
    
    if (isValidMove(currentPiece, currentPiece.position, rotatedShape)) {
      setCurrentPiece({ ...currentPiece, shape: rotatedShape });
    }
  }, [currentPiece, gameRunning, gameOver, isValidMove]);

  const hardDrop = useCallback(() => {
    if (!currentPiece || !gameRunning || gameOver) return;

    let newPosition = { ...currentPiece.position };
    
    while (isValidMove(currentPiece, { ...newPosition, y: newPosition.y + 1 })) {
      newPosition.y += 1;
    }
    
    setCurrentPiece({ ...currentPiece, position: newPosition });
    dropPiece();
  }, [currentPiece, gameRunning, gameOver, isValidMove, dropPiece]);

  useEffect(() => {
    const interval = setInterval(() => {
      dropPiece();
    }, dropTime);

    return () => clearInterval(interval);
  }, [dropPiece, dropTime]);

  useEffect(() => {
    // Increase speed based on level
    const newLevel = Math.floor(lines / 10) + 1;
    if (newLevel !== level) {
      setLevel(newLevel);
      setDropTime(Math.max(100, 1000 - (newLevel - 1) * 100));
    }
  }, [lines, level]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!gameRunning || gameOver) return;

      switch (e.key) {
        case 'ArrowLeft':
          movePiece('left');
          break;
        case 'ArrowRight':
          movePiece('right');
          break;
        case 'ArrowDown':
          movePiece('down');
          break;
        case 'ArrowUp':
          rotatePieceHandler();
          break;
        case ' ':
          e.preventDefault();
          hardDrop();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [gameRunning, gameOver, movePiece, rotatePieceHandler, hardDrop]);

  const startGame = () => {
    const newBoard = Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(EMPTY_CELL));
    setBoard(newBoard);
    setCurrentPiece(createPiece());
    setNextPiece(createPiece());
    setScore(0);
    setLines(0);
    setLevel(1);
    setDropTime(1000);
    setGameOver(false);
    setGameRunning(true);
    soundEffects.playGameStart();
  };

  const renderBoard = () => {
    const displayBoard = board.map(row => [...row]);
    
    // Add current piece to display board
    if (currentPiece) {
      for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
          if (currentPiece.shape[y][x] !== 0) {
            const boardY = currentPiece.position.y + y;
            const boardX = currentPiece.position.x + x;
            if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
              displayBoard[boardY][boardX] = currentPiece.color;
            }
          }
        }
      }
    }
    
    return displayBoard;
  };

  return (
    <div style={{ padding: '8px', display: 'flex', gap: '16px' }}>
      <div>
        <div style={{ marginBottom: '8px' }}>
          <button 
            className="win95-button" 
            onClick={startGame}
            style={{ fontSize: '10px', padding: '4px 12px' }}
          >
            {gameOver ? 'New Game' : 'Start'}
          </button>
        </div>
        
        <div 
          style={{
            width: `${BOARD_WIDTH * 20}px`,
            height: `${BOARD_HEIGHT * 20}px`,
            border: '2px inset #c0c0c0',
            backgroundColor: '#000',
            display: 'grid',
            gridTemplateColumns: `repeat(${BOARD_WIDTH}, 1fr)`,
            gridTemplateRows: `repeat(${BOARD_HEIGHT}, 1fr)`
          }}
        >
          {renderBoard().flat().map((cell, index) => (
            <div
              key={index}
              style={{
                backgroundColor: COLORS[cell],
                border: cell !== 0 ? '1px solid #333' : 'none'
              }}
            />
          ))}
        </div>
      </div>
      
      <div style={{ minWidth: '100px' }}>
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '4px' }}>Score</div>
          <div style={{ fontSize: '14px' }}>{score}</div>
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '4px' }}>Lines</div>
          <div style={{ fontSize: '14px' }}>{lines}</div>
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '4px' }}>Level</div>
          <div style={{ fontSize: '14px' }}>{level}</div>
        </div>
        
        {nextPiece && (
          <div>
            <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '4px' }}>Next</div>
            <div 
              style={{
                width: '60px',
                height: '60px',
                border: '1px inset #c0c0c0',
                backgroundColor: '#000',
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gridTemplateRows: 'repeat(4, 1fr)',
                padding: '4px'
              }}
            >
              {Array(16).fill(0).map((_, index) => {
                const x = index % 4;
                const y = Math.floor(index / 4);
                const cell = (y < nextPiece.shape.length && x < nextPiece.shape[y].length) 
                  ? nextPiece.shape[y][x] 
                  : 0;
                
                return (
                  <div
                    key={index}
                    style={{
                      backgroundColor: COLORS[cell],
                      border: cell !== 0 ? '1px solid #333' : 'none'
                    }}
                  />
                );
              })}
            </div>
          </div>
        )}
        
        <div style={{ marginTop: '16px', fontSize: '9px', color: '#666' }}>
          {gameOver ? (
            <div style={{ color: '#ff0000', fontWeight: 'bold' }}>Game Over!</div>
          ) : (
            <div>
              <div>← → Move</div>
              <div>↓ Soft drop</div>
              <div>↑ Rotate</div>
              <div>Space Hard drop</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TetrisGame;