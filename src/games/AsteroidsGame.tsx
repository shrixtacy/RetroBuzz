import React, { useState, useEffect, useCallback, useRef } from 'react';

interface Vector2D {
  x: number;
  y: number;
}

interface Ship {
  position: Vector2D;
  velocity: Vector2D;
  rotation: number;
  thrust: boolean;
}

interface Bullet {
  position: Vector2D;
  velocity: Vector2D;
  life: number;
}

interface Asteroid {
  position: Vector2D;
  velocity: Vector2D;
  rotation: number;
  size: number;
  points: Vector2D[];
}

const AsteroidsGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const keysRef = useRef<Set<string>>(new Set());
  
  const [ship, setShip] = useState<Ship>({
    position: { x: 200, y: 200 },
    velocity: { x: 0, y: 0 },
    rotation: 0,
    thrust: false
  });
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [asteroids, setAsteroids] = useState<Asteroid[]>([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const CANVAS_WIDTH = 400;
  const CANVAS_HEIGHT = 400;
  const SHIP_SIZE = 8;
  const BULLET_SPEED = 5;
  const BULLET_LIFE = 60;

  // Generate random asteroid shape
  const generateAsteroidPoints = (size: number): Vector2D[] => {
    const points: Vector2D[] = [];
    const numPoints = 8;
    
    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * Math.PI * 2;
      const radius = size * (0.8 + Math.random() * 0.4);
      points.push({
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius
      });
    }
    
    return points;
  };

  // Initialize asteroids
  useEffect(() => {
    const newAsteroids: Asteroid[] = [];
    
    for (let i = 0; i < 5; i++) {
      const size = 30 + Math.random() * 20;
      newAsteroids.push({
        position: {
          x: Math.random() * CANVAS_WIDTH,
          y: Math.random() * CANVAS_HEIGHT
        },
        velocity: {
          x: (Math.random() - 0.5) * 2,
          y: (Math.random() - 0.5) * 2
        },
        rotation: Math.random() * Math.PI * 2,
        size,
        points: generateAsteroidPoints(size)
      });
    }
    
    setAsteroids(newAsteroids);
  }, []);

  // Handle input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.key.toLowerCase());
      
      if (e.key === ' ') {
        e.preventDefault();
        if (!gameStarted) {
          setGameStarted(true);
        } else if (!gameOver) {
          // Shoot bullet
          const bulletVel = {
            x: Math.cos(ship.rotation) * BULLET_SPEED,
            y: Math.sin(ship.rotation) * BULLET_SPEED
          };
          
          setBullets(prev => [
            ...prev,
            {
              position: { ...ship.position },
              velocity: bulletVel,
              life: BULLET_LIFE
            }
          ]);
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
  }, [gameStarted, gameOver, ship]);

  // Wrap position around screen edges
  const wrapPosition = (pos: Vector2D): Vector2D => ({
    x: ((pos.x % CANVAS_WIDTH) + CANVAS_WIDTH) % CANVAS_WIDTH,
    y: ((pos.y % CANVAS_HEIGHT) + CANVAS_HEIGHT) % CANVAS_HEIGHT
  });

  // Check collision between point and asteroid
  const checkCollision = (point: Vector2D, asteroid: Asteroid): boolean => {
    const dx = point.x - asteroid.position.x;
    const dy = point.y - asteroid.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < asteroid.size * 0.8; // Slightly smaller hitbox for better gameplay
  };

  // Game loop
  const gameLoop = useCallback(() => {
    if (!gameStarted || gameOver) return;

    // Update ship
    setShip(prev => {
      let newShip = { ...prev };
      
      // Rotation
      if (keysRef.current.has('arrowleft') || keysRef.current.has('a')) {
        newShip.rotation -= 0.1;
      }
      if (keysRef.current.has('arrowright') || keysRef.current.has('d')) {
        newShip.rotation += 0.1;
      }
      
      // Thrust
      if (keysRef.current.has('arrowup') || keysRef.current.has('w')) {
        newShip.thrust = true;
        const thrustPower = 0.2;
        newShip.velocity.x += Math.cos(newShip.rotation) * thrustPower;
        newShip.velocity.y += Math.sin(newShip.rotation) * thrustPower;
        
        // Limit max velocity
        const maxVel = 5;
        const currentVel = Math.sqrt(newShip.velocity.x * newShip.velocity.x + newShip.velocity.y * newShip.velocity.y);
        if (currentVel > maxVel) {
          newShip.velocity.x = (newShip.velocity.x / currentVel) * maxVel;
          newShip.velocity.y = (newShip.velocity.y / currentVel) * maxVel;
        }
      } else {
        newShip.thrust = false;
      }
      
      // Apply friction
      newShip.velocity.x *= 0.98;
      newShip.velocity.y *= 0.98;
      
      // Update position
      newShip.position.x += newShip.velocity.x;
      newShip.position.y += newShip.velocity.y;
      
      // Wrap around screen
      newShip.position = wrapPosition(newShip.position);
      
      return newShip;
    });

    // Update bullets
    setBullets(prev => 
      prev
        .map(bullet => ({
          ...bullet,
          position: {
            x: bullet.position.x + bullet.velocity.x,
            y: bullet.position.y + bullet.velocity.y
          },
          life: bullet.life - 1
        }))
        .map(bullet => ({
          ...bullet,
          position: wrapPosition(bullet.position)
        }))
        .filter(bullet => bullet.life > 0)
    );

    // Update asteroids
    setAsteroids(prev => 
      prev.map(asteroid => ({
        ...asteroid,
        position: wrapPosition({
          x: asteroid.position.x + asteroid.velocity.x,
          y: asteroid.position.y + asteroid.velocity.y
        }),
        rotation: asteroid.rotation + 0.02
      }))
    );

    // Check bullet-asteroid collisions
    setBullets(prevBullets => {
      const newBullets = [...prevBullets];
      const bulletsToRemove = new Set<number>();

      setAsteroids(prevAsteroids => {
        let newAsteroids = [...prevAsteroids];
        const asteroidsToRemove = new Set<number>();

        newBullets.forEach((bullet, bulletIndex) => {
          newAsteroids.forEach((asteroid, asteroidIndex) => {
            if (checkCollision(bullet.position, asteroid)) {
              bulletsToRemove.add(bulletIndex);
              asteroidsToRemove.add(asteroidIndex);
              
              // Add score based on asteroid size
              const points = asteroid.size > 40 ? 20 : asteroid.size > 20 ? 50 : 100;
              setScore(prev => prev + points);
              
              // Split asteroid if large enough
              if (asteroid.size > 15) {
                const newSize = asteroid.size / 2;
                for (let i = 0; i < 2; i++) {
                  newAsteroids.push({
                    position: { ...asteroid.position },
                    velocity: {
                      x: (Math.random() - 0.5) * 3,
                      y: (Math.random() - 0.5) * 3
                    },
                    rotation: Math.random() * Math.PI * 2,
                    size: newSize,
                    points: generateAsteroidPoints(newSize)
                  });
                }
              }
            }
          });
        });

        // Remove hit asteroids
        newAsteroids = newAsteroids.filter((_, index) => !asteroidsToRemove.has(index));
        
        // Check if all asteroids destroyed
        if (newAsteroids.length === 0) {
          // Spawn new wave
          for (let i = 0; i < 5; i++) {
            const size = 30 + Math.random() * 20;
            newAsteroids.push({
              position: {
                x: Math.random() * CANVAS_WIDTH,
                y: Math.random() * CANVAS_HEIGHT
              },
              velocity: {
                x: (Math.random() - 0.5) * 3,
                y: (Math.random() - 0.5) * 3
              },
              rotation: Math.random() * Math.PI * 2,
              size,
              points: generateAsteroidPoints(size)
            });
          }
        }

        return newAsteroids;
      });

      return newBullets.filter((_, index) => !bulletsToRemove.has(index));
    });

    // Check ship-asteroid collisions
    asteroids.forEach(asteroid => {
      if (checkCollision(ship.position, asteroid)) {
        setLives(prev => {
          const newLives = prev - 1;
          if (newLives <= 0) {
            setGameOver(true);
          }
          return newLives;
        });
        
        // Reset ship position
        setShip(prev => ({
          ...prev,
          position: { x: 200, y: 200 },
          velocity: { x: 0, y: 0 }
        }));
      }
    });

  }, [gameStarted, gameOver, ship, asteroids]);

  // Animation loop
  useEffect(() => {
    let lastTime = 0;
    const animate = (currentTime: number) => {
      if (currentTime - lastTime > 16) { // ~60fps
        gameLoop();
        lastTime = currentTime;
      }
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

    // Draw stars
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 100; i++) {
      const x = (i * 37) % CANVAS_WIDTH;
      const y = (i * 23) % CANVAS_HEIGHT;
      if (Math.random() > 0.7) {
        ctx.fillRect(x, y, 1, 1);
      }
    }

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;

    // Draw ship
    ctx.save();
    ctx.translate(ship.position.x, ship.position.y);
    ctx.rotate(ship.rotation);
    
    ctx.beginPath();
    ctx.moveTo(SHIP_SIZE, 0);
    ctx.lineTo(-SHIP_SIZE, -SHIP_SIZE / 2);
    ctx.lineTo(-SHIP_SIZE / 2, 0);
    ctx.lineTo(-SHIP_SIZE, SHIP_SIZE / 2);
    ctx.closePath();
    ctx.stroke();
    
    // Draw thrust
    if (ship.thrust) {
      ctx.strokeStyle = '#ff6600';
      ctx.beginPath();
      ctx.moveTo(-SHIP_SIZE, -2);
      ctx.lineTo(-SHIP_SIZE * 1.5, 0);
      ctx.lineTo(-SHIP_SIZE, 2);
      ctx.stroke();
      ctx.strokeStyle = '#ffffff';
    }
    
    ctx.restore();

    // Draw bullets
    ctx.fillStyle = '#ffffff';
    bullets.forEach(bullet => {
      ctx.fillRect(bullet.position.x - 1, bullet.position.y - 1, 2, 2);
    });

    // Draw asteroids
    asteroids.forEach(asteroid => {
      ctx.save();
      ctx.translate(asteroid.position.x, asteroid.position.y);
      ctx.rotate(asteroid.rotation);
      
      ctx.beginPath();
      asteroid.points.forEach((point, index) => {
        if (index === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      });
      ctx.closePath();
      ctx.stroke();
      
      ctx.restore();
    });

  }, [ship, bullets, asteroids]);

  const resetGame = () => {
    setShip({
      position: { x: 200, y: 200 },
      velocity: { x: 0, y: 0 },
      rotation: 0,
      thrust: false
    });
    setBullets([]);
    setScore(0);
    setLives(3);
    setGameOver(false);
    setGameStarted(false);
    
    // Reset asteroids
    const newAsteroids: Asteroid[] = [];
    for (let i = 0; i < 5; i++) {
      const size = 30 + Math.random() * 20;
      newAsteroids.push({
        position: {
          x: Math.random() * CANVAS_WIDTH,
          y: Math.random() * CANVAS_HEIGHT
        },
        velocity: {
          x: (Math.random() - 0.5) * 2,
          y: (Math.random() - 0.5) * 2
        },
        rotation: Math.random() * Math.PI * 2,
        size,
        points: generateAsteroidPoints(size)
      });
    }
    setAsteroids(newAsteroids);
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
            A/D or ←/→ to rotate<br />
            W or ↑ for thrust<br />
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
      </div>

      <div style={{ marginTop: '10px', fontSize: '10px' }}>
        <div>Destroy all asteroids!</div>
        <div>Large asteroids split into smaller ones</div>
      </div>
    </div>
  );
};

export default AsteroidsGame;