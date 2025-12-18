import React, { useState, useEffect, useCallback, useRef } from 'react';

interface Position {
  x: number;
  y: number;
}

interface Ball {
  x: number;
  y: number;
  dx: number;
  dy: number;
}

interface Paddle {
  x: number;
  y: number;
  width: number;
  height: number;
}

const PongGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const keysRef = useRef<Set<string>>(new Set());
  
  const [ball, setBall] = useState<Ball>({ x: 200, y: 200, dx: 2, dy: 2 });
  const [leftPaddle, setLeftPaddle] = useState<Paddle>({ x: 10, y: 175, width: 10, height: 50 });
  const [rightPaddle, setRightPaddle] = useState<Paddle>({ x: 380, y: 175, width: 10, height: 50 });
  const [leftScore, setLeftScore] = useState(0);
  const [rightScore, setRightScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [winner, setWinner] = useState<string>('');
  const [gameMode, setGameMode] = useState<'single' | 'multi'>('single');

  const CANVAS_WIDTH = 400;
  const CANVAS_HEIGHT = 400;
  const BALL_SIZE = 8;
  const PADDLE_SPEED = 5;
  const WINNING_SCORE = 5;

  // Handle input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.key.toLowerCase());
      
      if (e.key === ' ') {
        e.preventDefault();
        if (!gameStarted) {
          setGameStarted(true);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key.toLowerCase());
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameStarted]);

  // AI paddle movement
  const moveAIPaddle = useCallback((paddle: Paddle, ballY: number): Paddle => {
    const paddleCenter = paddle.y + paddle.height / 2;
    const diff = ballY - paddleCenter;
    
    let newY = paddle.y;
    if (Math.abs(diff) > 5) {
      if (diff > 0) {
        newY += PADDLE_SPEED * 0.7; // AI is slightly slower
      } else {
        newY -= PADDLE_SPEED * 0.7;
      }
    }
    
    // Keep paddle on screen
    newY = Math.max(0, Math.min(CANVAS_HEIGHT - paddle.height, newY));
    
    return { ...paddle, y: newY };
  }, []);

  // Game loop
  const gameLoop = useCallback(() => {
    if (!gameStarted || gameOver) return;

    // Move paddles
    setLeftPaddle(prev => {
      let newY = prev.y;
      
      if (keysRef.current.has('w')) {
        newY -= PADDLE_SPEED;
      }
      if (keysRef.current.has('s')) {
        newY += PADDLE_SPEED;
      }
      
      // Keep paddle on screen
      newY = Math.max(0, Math.min(CANVAS_HEIGHT - prev.height, newY));
      
      return { ...prev, y: newY };
    });

    setRightPaddle(prev => {
      if (gameMode === 'single') {
        // AI controls right paddle
        return moveAIPaddle(prev, ball.y);
      } else {
        // Player 2 controls right paddle
        let newY = prev.y;
        
        if (keysRef.current.has('arrowup')) {
          newY -= PADDLE_SPEED;
        }
        if (keysRef.current.has('arrowdown')) {
          newY += PADDLE_SPEED;
        }
        
        // Keep paddle on screen
        newY = Math.max(0, Math.min(CANVAS_HEIGHT - prev.height, newY));
        
        return { ...prev, y: newY };
      }
    });

    // Move ball
    setBall(prev => {
      let newBall = { ...prev };
      
      newBall.x += newBall.dx;
      newBall.y += newBall.dy;
      
      // Top and bottom wall collisions
      if (newBall.y <= 0 || newBall.y >= CANVAS_HEIGHT - BALL_SIZE) {
        newBall.dy = -newBall.dy;
      }
      
      // Left paddle collision
      if (
        newBall.x <= leftPaddle.x + leftPaddle.width &&
        newBall.x >= leftPaddle.x &&
        newBall.y + BALL_SIZE >= leftPaddle.y &&
        newBall.y <= leftPaddle.y + leftPaddle.height
      ) {
        newBall.dx = Math.abs(newBall.dx);
        // Add some angle based on where ball hits paddle
        const hitPos = (newBall.y - leftPaddle.y) / leftPaddle.height;
        newBall.dy = (hitPos - 0.5) * 6;
      }
      
      // Right paddle collision
      if (
        newBall.x + BALL_SIZE >= rightPaddle.x &&
        newBall.x <= rightPaddle.x + rightPaddle.width &&
        newBall.y + BALL_SIZE >= rightPaddle.y &&
        newBall.y <= rightPaddle.y + rightPaddle.height
      ) {
        newBall.dx = -Math.abs(newBall.dx);
        // Add some angle based on where ball hits paddle
        const hitPos = (newBall.y - rightPaddle.y) / rightPaddle.height;
        newBall.dy = (hitPos - 0.5) * 6;
      }
      
      // Score points
      if (newBall.x < 0) {
        setRightScore(prev => {
          const newScore = prev + 1;
          if (newScore >= WINNING_SCORE) {
            setGameOver(true);
            setWinner(gameMode === 'single' ? 'Computer' : 'Player 2');
          }
          return newScore;
        });
        // Reset ball
        newBall = { x: 200, y: 200, dx: -2, dy: 2 };
      } else if (newBall.x > CANVAS_WIDTH) {
        setLeftScore(prev => {
          const newScore = prev + 1;
          if (newScore >= WINNING_SCORE) {
            setGameOver(true);
            setWinner('Player 1');
          }
          return newScore;
        });
        // Reset ball
        newBall = { x: 200, y: 200, dx: 2, dy: 2 };
      }
      
      return newBall;
    });

  }, [gameStarted, gameOver, leftPaddle, rightPaddle, ball, gameMode, moveAIPaddle]);

  // Animation loop
  useEffect(() => {
    const animate = () => {
      gameLoop();
      animationRef.current = requestAnimationFrame(animate);
    };

    if (gameStarted && !gameOver) {
      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameLoop, gameStarted, gameOver]);

  // Draw game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw center line
    ctx.strokeStyle = '#ffffff';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(CANVAS_WIDTH / 2, 0);
    ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw paddles
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(leftPaddle.x, leftPaddle.y, leftPaddle.width, leftPaddle.height);
    ctx.fillRect(rightPaddle.x, rightPaddle.y, rightPaddle.width, rightPaddle.height);

    // Draw ball
    ctx.fillRect(ball.x, ball.y, BALL_SIZE, BALL_SIZE);

    // Draw scores
    ctx.font = '24px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(leftScore.toString(), CANVAS_WIDTH / 4, 40);
    ctx.fillText(rightScore.toString(), (CANVAS_WIDTH * 3) / 4, 40);

  }, [ball, leftPaddle, rightPaddle, leftScore, rightScore]);

  const resetGame = () => {
    setBall({ x: 200, y: 200, dx: 2, dy: 2 });
    setLeftPaddle({ x: 10, y: 175, width: 10, height: 50 });
    setRightPaddle({ x: 380, y: 175, width: 10, height: 50 });
    setLeftScore(0);
    setRightScore(0);
    setGameOver(false);
    setGameStarted(false);
    setWinner('');
  };

  const toggleGameMode = () => {
    setGameMode(prev => prev === 'single' ? 'multi' : 'single');
    resetGame();
  };

  return (
    <div style={{ padding: '10px', backgroundColor: '#c0c0c0', textAlign: 'center' }}>
      <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>Mode: {gameMode === 'single' ? 'vs Computer' : '2 Players'}</div>
        <div>First to {WINNING_SCORE} wins!</div>
        <div style={{ display: 'flex', gap: '5px' }}>
          <button 
            className="win95-button" 
            onClick={toggleGameMode}
            style={{ fontSize: '10px', padding: '2px 8px' }}
          >
            {gameMode === 'single' ? '2P Mode' : '1P Mode'}
          </button>
          <button 
            className="win95-button" 
            onClick={resetGame}
            style={{ fontSize: '10px', padding: '2px 8px' }}
          >
            New Game
          </button>
        </div>
      </div>

      <div style={{ position: 'relative', display: 'inline-block' }}>
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          style={{ 
            border: '2px inset #c0c0c0',
            backgroundColor: '#000000'
          }}
        />

        {!gameStarted && !gameOver && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#ffffff',
            fontSize: '14px',
            fontWeight: 'bold',
            textAlign: 'center',
            backgroundColor: 'rgba(0,0,0,0.8)',
            padding: '10px',
            borderRadius: '5px'
          }}>
            Press SPACE to start<br />
            Player 1: W/S keys<br />
            {gameMode === 'multi' ? 'Player 2: ↑/↓ keys' : 'vs Computer AI'}
          </div>
        )}

        {gameOver && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: winner === 'Player 1' ? '#00ff00' : '#ff6600',
            color: winner === 'Player 1' ? '#000000' : '#ffffff',
            padding: '20px',
            border: '3px solid #ffffff',
            textAlign: 'center',
            fontSize: '16px',
            fontWeight: 'bold'
          }}>
            {winner} WINS!<br />
            Final Score: {leftScore} - {rightScore}
            <br />
            <button className="win95-button" onClick={resetGame} style={{ marginTop: '10px' }}>
              Play Again
            </button>
          </div>
        )}
      </div>

      <div style={{ marginTop: '10px', fontSize: '10px' }}>
        <div>Classic Pong! First to {WINNING_SCORE} points wins!</div>
        <div>Switch between single player and 2-player modes</div>
      </div>
    </div>
  );
};

export default PongGame;