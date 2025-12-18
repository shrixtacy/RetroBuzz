import React, { useState, useEffect, useCallback, useRef } from 'react';

interface Position {
  x: number;
  y: number;
}

interface Bullet {
  x: number;
  y: number;
  speed: number;
  isPlayerBullet: boolean;
}

interface Invader {
  x: number;
  y: number;
  type: number;
  alive: boolean;
}

const SpaceInvadersGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const gameLoopRef = useRef<number>();
  
  const [player, setPlayer] = useState<Position>({ x: 185, y: 350 });
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [invaders, setInvaders] = useState<Invader[]>([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [invaderDirection, setInvaderDirection] = useState(1);
  const [invaderSpeed, setInvaderSpeed] = useState(1);

  const CANVAS_WIDTH = 400;
  const CANVAS_HEIGHT = 400;
  const PLAYER_WIDTH = 30;
  const PLAYER_HEIGHT = 20;
  const INVADER_WIDTH = 20;
  const INVADER_HEIGHT = 15;
  const BULLET_WIDTH = 3;
  const BULLET_HEIGHT = 8;

  // Initialize invaders
  useEffect(() => {
    const newInvaders: Invader[] = [];
    
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 10; col++) {
        newInvaders.push({
          x: col * 35 + 20,
          y: row * 30 + 50,
          type: row < 2 ? 3 : row < 4 ? 2 : 1, // Different point values
          alive: true
        });
      }
    }
    setInvaders(newInvaders);
  }, []);

  // Handle player movement and shooting
  useEffect(() => {
    const keysPressed = new Set<string>();
    let canShoot = true;

    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.add(e.key.toLowerCase());
      
      if (e.key === ' ') {
        e.preventDefault();
        if (!gameStarted) {
          setGameStarted(true);
        } else if (!gameOver && !gameWon && canShoot) {
          // Shoot bullet with rate limiting
          setBullets(prev => [
            ...prev,
            {
              x: player.x + PLAYER_WIDTH / 2 - BULLET_WIDTH / 2,
              y: player.y,
              speed: -5,
              isPlayerBullet: true
            }
          ]);
          canShoot = false;
          setTimeout(() => { canShoot = true; }, 200); // Rate limit shooting
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.delete(e.key.toLowerCase());
    };

    const movePlayer = () => {
      if (!gameStarted || gameOver || gameWon) return;

      setPlayer(prev => {
        let newX = prev.x;
        
        if (keysPressed.has('arrowleft') || keysPressed.has('a')) {
          newX = Math.max(0, prev.x - 5);
        }
        if (keysPressed.has('arrowright') || keysPressed.has('d')) {
          newX = Math.min(CANVAS_WIDTH - PLAYER_WIDTH, prev.x + 5);
        }
        
        return { ...prev, x: newX };
      });
    };

    const interval = setInterval(movePlayer, 16); // ~60fps

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    return () => {
      clearInterval(interval);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameStarted, gameOver, gameWon, player.x]);

  // Game loop
  const gameLoop = useCallback(() => {
    if (!gameStarted || gameOver || gameWon) return;

    // Move bullets
    setBullets(prev => {
      const newBullets = prev
        .map(bullet => ({
          ...bullet,
          y: bullet.y + bullet.speed
        }))
        .filter(bullet => bullet.y > -10 && bullet.y < CANVAS_HEIGHT + 10);

      return newBullets;
    });

    // Move invaders
    setInvaders(prev => {
      const aliveInvaders = prev.filter(inv => inv.alive);
      if (aliveInvaders.length === 0) {
        setGameWon(true);
        return prev;
      }

      let shouldMoveDown = false;
      const rightmostX = Math.max(...aliveInvaders.map(inv => inv.x));
      const leftmostX = Math.min(...aliveInvaders.map(inv => inv.x));

      if (rightmostX >= CANVAS_WIDTH - INVADER_WIDTH - 10 && invaderDirection > 0) {
        shouldMoveDown = true;
        setInvaderDirection(-1);
      } else if (leftmostX <= 10 && invaderDirection < 0) {
        shouldMoveDown = true;
        setInvaderDirection(1);
      }

      return prev.map(invader => {
        if (!invader.alive) return invader;
        
        return {
          ...invader,
          x: invader.x + (shouldMoveDown ? 0 : invaderDirection * invaderSpeed),
          y: invader.y + (shouldMoveDown ? 20 : 0)
        };
      });
    });

    // Random invader shooting
    if (Math.random() < 0.02) {
      const aliveInvaders = invaders.filter(inv => inv.alive);
      if (aliveInvaders.length > 0) {
        const shooter = aliveInvaders[Math.floor(Math.random() * aliveInvaders.length)];
        setBullets(prev => [
          ...prev,
          {
            x: shooter.x + INVADER_WIDTH / 2,
            y: shooter.y + INVADER_HEIGHT,
            speed: 3,
            isPlayerBullet: false
          }
        ]);
      }
    }

    // Check collisions
    setBullets(prevBullets => {
      const newBullets = [...prevBullets];
      const bulletsToRemove = new Set<number>();

      setInvaders(prevInvaders => {
        const newInvaders = [...prevInvaders];

        newBullets.forEach((bullet, bulletIndex) => {
          if (bullet.isPlayerBullet) {
            // Player bullet hitting invaders
            newInvaders.forEach((invader, invaderIndex) => {
              if (
                invader.alive &&
                bullet.x >= invader.x &&
                bullet.x <= invader.x + INVADER_WIDTH &&
                bullet.y >= invader.y &&
                bullet.y <= invader.y + INVADER_HEIGHT
              ) {
                newInvaders[invaderIndex] = { ...invader, alive: false };
                bulletsToRemove.add(bulletIndex);
                setScore(prev => prev + invader.type * 10);
              }
            });
          } else {
            // Invader bullet hitting player
            if (
              bullet.x >= player.x &&
              bullet.x <= player.x + PLAYER_WIDTH &&
              bullet.y >= player.y &&
              bullet.y <= player.y + PLAYER_HEIGHT
            ) {
              bulletsToRemove.add(bulletIndex);
              setLives(prev => {
                const newLives = prev - 1;
                if (newLives <= 0) {
                  setGameOver(true);
                }
                return newLives;
              });
            }
          }
        });

        return newInvaders;
      });

      return newBullets.filter((_, index) => !bulletsToRemove.has(index));
    });

    // Check if invaders reached player
    const aliveInvaders = invaders.filter(inv => inv.alive);
    if (aliveInvaders.some(inv => inv.y + INVADER_HEIGHT >= player.y)) {
      setGameOver(true);
    }

  }, [gameStarted, gameOver, gameWon, invaders, invaderDirection, invaderSpeed, player]);

  // Animation loop
  useEffect(() => {
    if (gameStarted && !gameOver && !gameWon) {
      gameLoopRef.current = window.setInterval(gameLoop, 50); // 20fps
    }

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
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

    // Draw stars background
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 50; i++) {
      const x = (i * 37) % CANVAS_WIDTH;
      const y = (i * 23) % CANVAS_HEIGHT;
      ctx.fillRect(x, y, 1, 1);
    }

    // Draw invaders
    invaders.forEach(invader => {
      if (invader.alive) {
        ctx.fillStyle = invader.type === 3 ? '#ff0000' : invader.type === 2 ? '#00ff00' : '#ffff00';
        ctx.fillRect(invader.x, invader.y, INVADER_WIDTH, INVADER_HEIGHT);
        
        // Simple invader sprite
        ctx.fillStyle = '#000000';
        ctx.fillRect(invader.x + 2, invader.y + 2, 2, 2);
        ctx.fillRect(invader.x + INVADER_WIDTH - 4, invader.y + 2, 2, 2);
        ctx.fillRect(invader.x + 8, invader.y + 8, 4, 2);
      }
    });

    // Draw player
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(player.x, player.y, PLAYER_WIDTH, PLAYER_HEIGHT);
    
    // Player cannon
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(player.x + PLAYER_WIDTH / 2 - 2, player.y - 5, 4, 8);

    // Draw bullets
    bullets.forEach(bullet => {
      ctx.fillStyle = bullet.isPlayerBullet ? '#ffffff' : '#ff0000';
      ctx.fillRect(bullet.x, bullet.y, BULLET_WIDTH, BULLET_HEIGHT);
    });

  }, [player, bullets, invaders]);

  const resetGame = () => {
    setPlayer({ x: 185, y: 350 });
    setBullets([]);
    setScore(0);
    setLives(3);
    setGameOver(false);
    setGameWon(false);
    setGameStarted(false);
    setInvaderDirection(1);
    setInvaderSpeed(1);
    
    // Reset invaders
    const newInvaders: Invader[] = [];
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 10; col++) {
        newInvaders.push({
          x: col * 35 + 20,
          y: row * 30 + 50,
          type: row < 2 ? 3 : row < 4 ? 2 : 1,
          alive: true
        });
      }
    }
    setInvaders(newInvaders);
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
            Use arrow keys or A/D to move<br />
            SPACE to shoot
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
        <div>Destroy all invaders to win!</div>
        <div>Don't let them reach the bottom!</div>
      </div>
    </div>
  );
};

export default SpaceInvadersGame;