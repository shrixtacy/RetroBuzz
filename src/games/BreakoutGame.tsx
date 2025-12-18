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

interface Brick {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  destroyed: boolean;
}

const BreakoutGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  
  const [paddle, setPaddle] = useState<Position>({ x: 175, y: 350 });
  const [ball, setBall] = useState<Ball>({ x: 200, y: 300, dx: 3, dy: -3 });
  const [bricks, setBricks] = useState<Brick[]>([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const CANVAS_WIDTH = 400;
  const CANVAS_HEIGHT = 400;
  const PADDLE_WIDTH = 50;
  const PADDLE_HEIGHT = 10;
  const BALL_SIZE = 8;
  const BRICK_WIDTH = 38;
  const BRICK_HEIGHT = 15;

  // Initialize bricks
  useEffect(() => {
    const newBricks: Brick[] = [];
    const colors = ['#ff0000', '#ff8800', '#ffff00', '#00ff00', '#0088ff', '#8800ff'];
    
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 10; col++) {
        newBricks.push({
          x: col * (BRICK_WIDTH + 2) + 5,
          y: row * (BRICK_HEIGHT + 2) + 30,
          width: BRICK_WIDTH,
          height: BRICK_HEIGHT,
          color: colors[row],
          destroyed: false
        });
      }
    }
    setBricks(newBricks);
  }, []);

  // Handle paddle movement
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameStarted || gameOver || gameWon) return;

      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          setPaddle(prev => ({ 
            ...prev, 
            x: Math.max(0, prev.x - 15) 
          }));
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          setPaddle(prev => ({ 
            ...prev, 
            x: Math.min(CANVAS_WIDTH - PADDLE_WIDTH, prev.x + 15) 
          }));
          break;
        case ' ':
          e.preventDefault();
          if (!gameStarted) {
            setGameStarted(true);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [gameStarted, gameOver, gameWon]);

  // Game loop
  const gameLoop = useCallback(() => {
    if (!gameStarted || gameOver || gameWon) return;

    setBall(prevBall => {
      let newBall = { ...prevBall };
      
      // Move ball
      newBall.x += newBall.dx;
      newBall.y += newBall.dy;

      // Wall collisions
      if (newBall.x <= 0 || newBall.x >= CANVAS_WIDTH - BALL_SIZE) {
        newBall.dx = -newBall.dx;
      }
      if (newBall.y <= 0) {
        newBall.dy = -newBall.dy;
      }

      // Paddle collision
      if (
        newBall.y + BALL_SIZE >= paddle.y &&
        newBall.y <= paddle.y + PADDLE_HEIGHT &&
        newBall.x + BALL_SIZE >= paddle.x &&
        newBall.x <= paddle.x + PADDLE_WIDTH
      ) {
        newBall.dy = -Math.abs(newBall.dy);
        // Add some angle based on where ball hits paddle
        const hitPos = (newBall.x - paddle.x) / PADDLE_WIDTH;
        newBall.dx = (hitPos - 0.5) * 6;
      }

      // Brick collisions
      setBricks(prevBricks => {
        const newBricks = [...prevBricks];
        let hitBrick = false;

        for (let i = 0; i < newBricks.length; i++) {
          const brick = newBricks[i];
          if (brick.destroyed) continue;

          if (
            newBall.x + BALL_SIZE >= brick.x &&
            newBall.x <= brick.x + brick.width &&
            newBall.y + BALL_SIZE >= brick.y &&
            newBall.y <= brick.y + brick.height
          ) {
            newBricks[i] = { ...brick, destroyed: true };
            newBall.dy = -newBall.dy;
            setScore(prev => prev + 10);
            hitBrick = true;
            break;
          }
        }

        return newBricks;
      });

      // Ball out of bounds
      if (newBall.y > CANVAS_HEIGHT) {
        setLives(prev => {
          const newLives = prev - 1;
          if (newLives <= 0) {
            setGameOver(true);
          } else {
            // Reset ball position
            newBall = { x: 200, y: 300, dx: 3, dy: -3 };
            setGameStarted(false);
          }
          return newLives;
        });
      }

      return newBall;
    });

    // Check win condition
    setBricks(prevBricks => {
      const activeBricks = prevBricks.filter(brick => !brick.destroyed);
      if (activeBricks.length === 0) {
        setGameWon(true);
      }
      return prevBricks;
    });
  }, [gameStarted, gameOver, gameWon, paddle]);

  // Animation loop
  useEffect(() => {
    const animate = () => {
      gameLoop();
      animationRef.current = requestAnimationFrame(animate);
    };

    if (gameStarted && !gameOver && !gameWon) {
      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameLoop, gameStarted, gameOver, gameWon]);

  // Draw game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw bricks
    bricks.forEach(brick => {
      if (!brick.destroyed) {
        ctx.fillStyle = brick.color;
        ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
        ctx.strokeStyle = '#ffffff';
        ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);
      }
    });

    // Draw paddle
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(paddle.x, paddle.y, PADDLE_WIDTH, PADDLE_HEIGHT);

    // Draw ball
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(ball.x, ball.y, BALL_SIZE, BALL_SIZE);

  }, [paddle, ball, bricks]);

  const resetGame = () => {
    setPaddle({ x: 175, y: 350 });
    setBall({ x: 200, y: 300, dx: 3, dy: -3 });
    setScore(0);
    setLives(3);
    setGameOver(false);
    setGameWon(false);
    setGameStarted(false);
    
    // Reset bricks
    const newBricks: Brick[] = [];
    const colors = ['#ff0000', '#ff8800', '#ffff00', '#00ff00', '#0088ff', '#8800ff'];
    
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 10; col++) {
        newBricks.push({
          x: col * (BRICK_WIDTH + 2) + 5,
          y: row * (BRICK_HEIGHT + 2) + 30,
          width: BRICK_WIDTH,
          height: BRICK_HEIGHT,
          color: colors[row],
          destroyed: false
        });
      }
    }
    setBricks(newBricks);
  };

  return (
    <div style={{ padding: '10px', backgroundColor: '#c0c0c0', textAlign: 'center' }}>
      <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>Score: {score}</div>
        <div>Lives: {lives}</div>
        <button 
          className="win95-button" 
          onClick={resetGame}
          style={{ fontSize: '10px', padding: '2px 8px' }}
        >
          New Game
        </button>
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

        {!gameStarted && !gameOver && !gameWon && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#ffffff',
            fontSize: '16px',
            fontWeight: 'bold',
            textAlign: 'center',
            backgroundColor: 'rgba(0,0,0,0.8)',
            padding: '10px',
            borderRadius: '5px'
          }}>
            Press SPACE to start<br />
            Use arrow keys or A/D to move
          </div>
        )}

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

      <div style={{ marginTop: '10px', fontSize: '10px' }}>
        <div>Break all the bricks to win!</div>
        <div>Don't let the ball fall off the bottom!</div>
      </div>
    </div>
  );
};

export default BreakoutGame;