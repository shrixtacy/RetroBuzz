import React, { useState, useEffect, useCallback, useRef } from 'react';

interface Position {
  x: number;
  y: number;
}

interface Vehicle {
  x: number;
  y: number;
  width: number;
  speed: number;
  type: 'car' | 'truck' | 'log';
  emoji: string;
}

const FroggerGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  
  const [frog, setFrog] = useState<Position>({ x: 185, y: 350 });
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [level, setLevel] = useState(1);

  const CANVAS_WIDTH = 400;
  const CANVAS_HEIGHT = 400;
  const FROG_SIZE = 20;
  const LANE_HEIGHT = 40;
  const SAFE_ZONES = [0, 200, 400]; // Y positions of safe zones

  // Initialize vehicles
  useEffect(() => {
    const newVehicles: Vehicle[] = [];
    
    // Road vehicles (cars and trucks)
    const roadLanes = [80, 120, 160, 240, 280, 320];
    roadLanes.forEach((y, index) => {
      const isLeftToRight = index % 2 === 0;
      const speed = (0.8 + Math.random() * 0.8) * (isLeftToRight ? 1 : -1);
      const vehicleType = Math.random() > 0.7 ? 'truck' : 'car';
      
      for (let i = 0; i < 3; i++) {
        newVehicles.push({
          x: isLeftToRight ? -100 - i * 180 : CANVAS_WIDTH + 100 + i * 180,
          y: y - 15,
          width: vehicleType === 'truck' ? 60 : 40,
          speed,
          type: vehicleType,
          emoji: vehicleType === 'truck' ? '🚛' : '🚗'
        });
      }
    });
    
    setVehicles(newVehicles);
  }, [level]);

  // Handle frog movement
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameStarted || gameOver || gameWon) {
        if (e.key === ' ') {
          e.preventDefault();
          if (!gameStarted) {
            setGameStarted(true);
          }
        }
        return;
      }

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          setFrog(prev => {
            const newY = Math.max(0, prev.y - LANE_HEIGHT);
            if (newY === 0) {
              // Reached the top!
              setScore(prevScore => prevScore + 100);
              setGameWon(true);
            }
            return { ...prev, y: newY };
          });
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          setFrog(prev => ({ 
            ...prev, 
            y: Math.min(CANVAS_HEIGHT - FROG_SIZE, prev.y + LANE_HEIGHT) 
          }));
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          setFrog(prev => ({ 
            ...prev, 
            x: Math.max(0, prev.x - LANE_HEIGHT) 
          }));
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          setFrog(prev => ({ 
            ...prev, 
            x: Math.min(CANVAS_WIDTH - FROG_SIZE, prev.x + LANE_HEIGHT) 
          }));
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [gameStarted, gameOver, gameWon]);

  // Game loop
  const gameLoop = useCallback(() => {
    if (!gameStarted || gameOver || gameWon) return;

    // Move vehicles
    setVehicles(prev => 
      prev.map(vehicle => {
        let newX = vehicle.x + vehicle.speed;
        
        // Wrap around screen
        if (vehicle.speed > 0 && newX > CANVAS_WIDTH + 100) {
          newX = -vehicle.width - 100;
        } else if (vehicle.speed < 0 && newX < -vehicle.width - 100) {
          newX = CANVAS_WIDTH + 100;
        }
        
        return { ...vehicle, x: newX };
      })
    );

    // Check collisions
    vehicles.forEach(vehicle => {
      if (
        frog.x < vehicle.x + vehicle.width &&
        frog.x + FROG_SIZE > vehicle.x &&
        frog.y < vehicle.y + 30 &&
        frog.y + FROG_SIZE > vehicle.y
      ) {
        // Collision detected
        setLives(prev => {
          const newLives = prev - 1;
          if (newLives <= 0) {
            setGameOver(true);
          } else {
            // Reset frog position
            setFrog({ x: 185, y: 350 });
          }
          return newLives;
        });
      }
    });

  }, [gameStarted, gameOver, gameWon, frog, vehicles]);

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
    ctx.fillStyle = '#228B22';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw road
    ctx.fillStyle = '#404040';
    ctx.fillRect(0, 60, CANVAS_WIDTH, 160);
    ctx.fillRect(0, 220, CANVAS_WIDTH, 160);

    // Draw lane dividers
    ctx.strokeStyle = '#FFFF00';
    ctx.setLineDash([10, 10]);
    ctx.lineWidth = 2;
    
    for (let y = 100; y < 220; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_WIDTH, y);
      ctx.stroke();
    }
    
    for (let y = 260; y < 380; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_WIDTH, y);
      ctx.stroke();
    }
    
    ctx.setLineDash([]);

    // Draw safe zones
    ctx.fillStyle = '#90EE90';
    SAFE_ZONES.forEach(y => {
      if (y < CANVAS_HEIGHT) {
        ctx.fillRect(0, y, CANVAS_WIDTH, 40);
      }
    });

    // Draw goal zone
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(0, 0, CANVAS_WIDTH, 40);
    ctx.fillStyle = '#000000';
    ctx.font = '16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('🏁 GOAL 🏁', CANVAS_WIDTH / 2, 25);

    // Draw vehicles
    ctx.font = '24px monospace';
    ctx.textAlign = 'center';
    vehicles.forEach(vehicle => {
      ctx.fillText(vehicle.emoji, vehicle.x + vehicle.width / 2, vehicle.y + 20);
    });

    // Draw frog
    ctx.font = '20px monospace';
    ctx.fillText('🐸', frog.x + FROG_SIZE / 2, frog.y + 15);

  }, [frog, vehicles]);

  const resetGame = () => {
    setFrog({ x: 185, y: 350 });
    setScore(0);
    setLives(3);
    setGameOver(false);
    setGameWon(false);
    setGameStarted(false);
    setLevel(1);
    
    // Reset vehicles
    const newVehicles: Vehicle[] = [];
    const roadLanes = [80, 120, 160, 240, 280, 320];
    roadLanes.forEach((y, index) => {
      const isLeftToRight = index % 2 === 0;
      const speed = (2 + Math.random() * 2) * (isLeftToRight ? 1 : -1);
      const vehicleType = Math.random() > 0.7 ? 'truck' : 'car';
      
      for (let i = 0; i < 3; i++) {
        newVehicles.push({
          x: isLeftToRight ? -100 - i * 150 : CANVAS_WIDTH + 100 + i * 150,
          y: y - 15,
          width: vehicleType === 'truck' ? 60 : 40,
          speed,
          type: vehicleType,
          emoji: vehicleType === 'truck' ? '🚛' : '🚗'
        });
      }
    });
    setVehicles(newVehicles);
  };

  const nextLevel = () => {
    setLevel(prev => prev + 1);
    setFrog({ x: 185, y: 350 });
    setGameWon(false);
    setGameStarted(false);
    
    // Increase difficulty by adding more/faster vehicles
    const newVehicles: Vehicle[] = [];
    const roadLanes = [80, 120, 160, 240, 280, 320];
    roadLanes.forEach((y, index) => {
      const isLeftToRight = index % 2 === 0;
      const speed = (0.8 + Math.random() * 0.8 + level * 0.2) * (isLeftToRight ? 1 : -1);
      const vehicleType = Math.random() > 0.6 ? 'truck' : 'car';
      
      for (let i = 0; i < 3 + Math.floor(level / 3); i++) {
        newVehicles.push({
          x: isLeftToRight ? -100 - i * (150 - level * 3) : CANVAS_WIDTH + 100 + i * (150 - level * 3),
          y: y - 15,
          width: vehicleType === 'truck' ? 60 : 40,
          speed,
          type: vehicleType,
          emoji: vehicleType === 'truck' ? '🚛' : '🚗'
        });
      }
    });
    setVehicles(newVehicles);
  };

  return (
    <div style={{ padding: '10px', backgroundColor: '#c0c0c0', textAlign: 'center' }}>
      <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>Score: {score}</div>
        <div>Lives: {lives}</div>
        <div>Level: {level}</div>
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
            backgroundColor: '#228B22'
          }}
        />

        {!gameStarted && !gameOver && !gameWon && (
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
            Use arrow keys or WASD to move<br />
            Reach the goal without getting hit!
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
            Final Score: {score}<br />
            Level Reached: {level}
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
            LEVEL {level} COMPLETE!<br />
            Score: {score}
            <br />
            <div style={{ marginTop: '10px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button className="win95-button" onClick={nextLevel}>
                Next Level
              </button>
              <button className="win95-button" onClick={resetGame}>
                New Game
              </button>
            </div>
          </div>
        )}
      </div>

      <div style={{ marginTop: '10px', fontSize: '10px' }}>
        <div>Help the frog cross the road safely!</div>
        <div>Avoid cars and trucks - reach the golden goal zone!</div>
      </div>
    </div>
  );
};

export default FroggerGame;