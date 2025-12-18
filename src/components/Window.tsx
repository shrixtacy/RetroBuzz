import React, { useState, useRef, useCallback, useEffect } from 'react';
import { WindowState, AppDefinition } from '../os/OSManager';
import SnakeGame from '../games/SnakeGame';
import TetrisGame from '../games/TetrisGame';
import TicTacToeGame from '../games/TicTacToeGame';
import PacManGame from '../games/PacManGame';
import BreakoutGame from '../games/BreakoutGame';
import SpaceInvadersGame from '../games/SpaceInvadersGame';
import AsteroidsGame from '../games/AsteroidsGame';
import PongGame from '../games/PongGame';
import FroggerGame from '../games/FroggerGame';
import PaintApp from './PaintApp';
import InternetExplorerApp from './InternetExplorerApp';

interface WindowProps {
  window: WindowState;
  app: AppDefinition;
  onClose: () => void;
  onFocus: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onMove: (x: number, y: number) => void;
  onResize: (width: number, height: number) => void;
}

const Window: React.FC<WindowProps> = ({
  window,
  app,
  onClose,
  onFocus,
  onMinimize,
  onMaximize,
  onMove,
  onResize
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const windowRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('win95-window-titlebar')) {
      e.preventDefault();
      onFocus();
      setIsDragging(true);
      setDragStart({
        x: e.clientX - window.x,
        y: e.clientY - window.y
      });
    }
  }, [window.x, window.y, onFocus]);

  const handleResizeMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: window.width,
      height: window.height
    });
  }, [window.width, window.height]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && !window.isMaximized) {
        const newX = e.clientX - dragStart.x;
        const newY = e.clientY - dragStart.y;
        onMove(newX, newY);
      } else if (isResizing && !window.isMaximized) {
        const deltaX = e.clientX - resizeStart.x;
        const deltaY = e.clientY - resizeStart.y;
        const newWidth = Math.max(200, resizeStart.width + deltaX);
        const newHeight = Math.max(150, resizeStart.height + deltaY);
        onResize(newWidth, newHeight);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = isDragging ? 'move' : 'nw-resize';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'default';
    };
  }, [isDragging, isResizing, dragStart, resizeStart, onMove, onResize, window.isMaximized]);

  const windowStyle: React.CSSProperties = {
    left: window.isMaximized ? 0 : window.x,
    top: window.isMaximized ? 0 : window.y,
    width: window.isMaximized ? '100vw' : window.width,
    height: window.isMaximized ? 'calc(100vh - 28px)' : window.height,
    zIndex: window.zIndex
  };

  const renderAppContent = () => {
    switch (app.id) {
      case 'notepad':
        return (
          <div style={{ padding: '8px', height: '100%' }}>
            <textarea
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                outline: 'none',
                fontFamily: 'Courier New, monospace',
                fontSize: '12px',
                resize: 'none',
                background: 'white'
              }}
              placeholder="Type your text here..."
            />
          </div>
        );
      
      case 'paint':
        return <PaintApp />;
      
      case 'calculator':
        return (
          <div style={{ padding: '8px' }}>
            <div style={{ 
              background: 'black',
              color: 'lime',
              padding: '8px',
              textAlign: 'right',
              fontFamily: 'monospace',
              fontSize: '16px',
              marginBottom: '8px'
            }}>
              0
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2px' }}>
              {['C', '±', '%', '÷', '7', '8', '9', '×', '4', '5', '6', '-', '1', '2', '3', '+', '0', '.', '='].map(btn => (
                <button key={btn} className="win95-button" style={{ padding: '8px' }}>
                  {btn}
                </button>
              ))}
            </div>
          </div>
        );
      
      case 'mycomputer':
        return (
          <div style={{ padding: '8px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '24px' }}>💾</span>
                <span>3½ Floppy (A:)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '24px' }}>💿</span>
                <span>CD-ROM (D:)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '24px' }}>🖥️</span>
                <span>Hard Disk (C:)</span>
              </div>
            </div>
          </div>
        );
      
      case 'control':
        return (
          <div style={{ padding: '8px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              {[
                { icon: '🖥️', name: 'Display' },
                { icon: '🔊', name: 'Sounds' },
                { icon: '🖱️', name: 'Mouse' },
                { icon: '⌨️', name: 'Keyboard' },
                { icon: '🌐', name: 'Network' },
                { icon: '🔒', name: 'Security' }
              ].map(item => (
                <div key={item.name} style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  padding: '8px',
                  cursor: 'pointer'
                }}>
                  <div style={{ fontSize: '32px', marginBottom: '4px' }}>{item.icon}</div>
                  <span style={{ fontSize: '10px', textAlign: 'center' }}>{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'solitaire':
        return (
          <div style={{ 
            padding: '8px', 
            background: 'green',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            color: 'white'
          }}>
            🃏 Solitaire Game
          </div>
        );

      case 'minesweeper':
        return (
          <div style={{ padding: '8px', background: '#c0c0c0' }}>
            <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ background: 'black', color: 'red', padding: '4px 8px', fontFamily: 'monospace' }}>
                💣 010
              </div>
              <button className="win95-button" style={{ padding: '4px 8px' }}>
                😊
              </button>
              <div style={{ background: 'black', color: 'red', padding: '4px 8px', fontFamily: 'monospace' }}>
                ⏱️ 000
              </div>
            </div>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(9, 1fr)', 
              gap: '1px',
              background: '#808080',
              padding: '2px'
            }}>
              {Array.from({ length: 81 }, (_, i) => (
                <button
                  key={i}
                  className="win95-button"
                  style={{ 
                    width: '20px', 
                    height: '20px', 
                    padding: 0,
                    fontSize: '10px',
                    minWidth: 'unset'
                  }}
                >
                  {Math.random() > 0.8 ? (Math.random() > 0.5 ? '💣' : Math.floor(Math.random() * 8) + 1) : ''}
                </button>
              ))}
            </div>
          </div>
        );

      case 'wordpad':
        return (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ 
              background: '#c0c0c0', 
              padding: '4px', 
              borderBottom: '1px solid #808080',
              display: 'flex',
              gap: '4px'
            }}>
              {['New', 'Open', 'Save', 'Print', 'Cut', 'Copy', 'Paste'].map(btn => (
                <button key={btn} className="win95-button" style={{ fontSize: '10px', padding: '2px 6px' }}>
                  {btn}
                </button>
              ))}
            </div>
            <div style={{ flex: 1, padding: '8px' }}>
              <textarea
                style={{
                  width: '100%',
                  height: '100%',
                  border: '1px inset #c0c0c0',
                  padding: '8px',
                  fontFamily: 'Times New Roman, serif',
                  fontSize: '12px',
                  resize: 'none'
                }}
                placeholder="WordPad - Rich Text Editor"
              />
            </div>
          </div>
        );

      case 'mediaplayer':
        return (
          <div style={{ padding: '8px', background: '#000', color: '#00ff00', height: '100%' }}>
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>🎵 Windows Media Player</div>
              <div style={{ background: '#333', padding: '8px', marginBottom: '8px' }}>
                ♪ No media loaded ♪
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
              {['⏮️', '⏸️', '▶️', '⏭️', '🔊'].map(btn => (
                <button key={btn} className="win95-button" style={{ fontSize: '16px', padding: '4px 8px' }}>
                  {btn}
                </button>
              ))}
            </div>
          </div>
        );

      case 'internetexplorer':
        return <InternetExplorerApp />;

      case 'winzip':
        return (
          <div style={{ padding: '8px' }}>
            <div style={{ marginBottom: '8px', display: 'flex', gap: '4px' }}>
              {['New', 'Open', 'Extract', 'Add', 'Delete'].map(btn => (
                <button key={btn} className="win95-button" style={{ fontSize: '10px', padding: '2px 6px' }}>
                  {btn}
                </button>
              ))}
            </div>
            <div style={{ 
              border: '1px inset #c0c0c0',
              height: '200px',
              background: 'white',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>📦</div>
              <p>No archive loaded</p>
              <p style={{ fontSize: '10px', color: '#666' }}>Drag and drop files to create a new archive</p>
            </div>
          </div>
        );

      case 'defrag':
        return (
          <div style={{ padding: '8px' }}>
            <h3 style={{ marginBottom: '8px' }}>Disk Defragmenter</h3>
            <div style={{ marginBottom: '8px' }}>
              <label>Drive: </label>
              <select style={{ marginLeft: '4px' }}>
                <option>C: (Hard Disk)</option>
                <option>A: (Floppy)</option>
              </select>
            </div>
            <div style={{ 
              border: '1px inset #c0c0c0',
              height: '100px',
              background: 'white',
              padding: '4px',
              display: 'flex',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', height: '20px', width: '100%' }}>
                {Array.from({ length: 50 }, (_, i) => (
                  <div
                    key={i}
                    style={{
                      width: '2%',
                      height: '100%',
                      background: Math.random() > 0.7 ? '#ff0000' : Math.random() > 0.5 ? '#0000ff' : '#00ff00',
                      border: '1px solid #ccc'
                    }}
                  />
                ))}
              </div>
            </div>
            <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
              <button className="win95-button">Analyze</button>
              <button className="win95-button">Defragment</button>
            </div>
          </div>
        );

      case 'scandisk':
        return (
          <div style={{ padding: '8px' }}>
            <h3 style={{ marginBottom: '8px' }}>ScanDisk</h3>
            <div style={{ marginBottom: '8px' }}>
              <input type="radio" id="standard" name="scantype" defaultChecked />
              <label htmlFor="standard" style={{ marginLeft: '4px' }}>Standard</label>
              <br />
              <input type="radio" id="thorough" name="scantype" />
              <label htmlFor="thorough" style={{ marginLeft: '4px' }}>Thorough</label>
            </div>
            <div style={{ 
              border: '1px inset #c0c0c0',
              height: '80px',
              background: 'white',
              padding: '8px'
            }}>
              <p style={{ fontSize: '10px' }}>Ready to scan drive C:</p>
              <p style={{ fontSize: '10px', color: '#666' }}>Click Start to begin disk scan</p>
            </div>
            <div style={{ marginTop: '8px' }}>
              <button className="win95-button">Start</button>
            </div>
          </div>
        );

      case 'freecell':
        return (
          <div style={{ 
            padding: '8px', 
            background: 'green',
            height: '100%'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', gap: '4px' }}>
                {['🂠', '🂠', '🂠', '🂠'].map((card, i) => (
                  <div key={i} style={{ 
                    width: '40px', 
                    height: '60px', 
                    background: 'white',
                    border: '1px solid #000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {card}
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                {['♠️', '♥️', '♣️', '♦️'].map((suit, i) => (
                  <div key={i} style={{ 
                    width: '40px', 
                    height: '60px', 
                    background: 'white',
                    border: '1px solid #000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {suit}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ textAlign: 'center', color: 'white', fontSize: '18px' }}>
              🂡 FreeCell Solitaire 🂡
            </div>
          </div>
        );

      case 'hearts':
        return (
          <div style={{ 
            padding: '8px', 
            background: 'green',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '16px' }}>♥️ Hearts ♥️</div>
            <div style={{ color: 'white', textAlign: 'center' }}>
              <p>Waiting for other players...</p>
              <p style={{ fontSize: '12px' }}>Network game not available in this demo</p>
            </div>
          </div>
        );

      case 'pinball':
        return (
          <div style={{ 
            padding: '8px', 
            background: 'linear-gradient(45deg, #000080, #000040)',
            height: '100%',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '16px' }}>🎯 3D Pinball</div>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚀</div>
            <div style={{ textAlign: 'center' }}>
              <p>Space Cadet Table</p>
              <p style={{ fontSize: '12px' }}>Press spacebar to launch ball</p>
              <p style={{ fontSize: '10px', marginTop: '8px' }}>Score: 0</p>
            </div>
          </div>
        );

      case 'snake':
        return (
          <SnakeGame 
            onGameOver={(score) => {
              console.log(`Snake game over! Score: ${score}`);
            }}
          />
        );

      case 'tetris':
        return (
          <TetrisGame 
            onGameOver={(score) => {
              console.log(`Tetris game over! Score: ${score}`);
            }}
          />
        );

      case 'tictactoe':
        return (
          <TicTacToeGame 
            onGameEnd={(winner, difficulty) => {
              console.log(`Tic-Tac-Toe game ended! Winner: ${winner || 'Tie'}, Difficulty: ${difficulty}`);
            }}
          />
        );

      case 'pacman':
        return (
          <PacManGame />
        );

      case 'breakout':
        return (
          <BreakoutGame />
        );

      case 'spaceinvaders':
        return (
          <SpaceInvadersGame />
        );

      case 'asteroids':
        return (
          <AsteroidsGame />
        );

      case 'pong':
        return (
          <PongGame />
        );

      case 'frogger':
        return (
          <FroggerGame />
        );
      
      default:
        return (
          <div style={{ padding: '8px' }}>
            <p>Application: {app.name}</p>
            <p>This is a placeholder for the {app.name} application.</p>
          </div>
        );
    }
  };

  return (
    <div
      ref={windowRef}
      className="win95-window"
      style={windowStyle}
      data-window-id={window.id}
      onClick={onFocus}
    >
      <div
        className={`win95-window-titlebar ${window.isFocused ? '' : 'inactive'}`}
        onMouseDown={handleMouseDown}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ marginRight: '8px' }}>{app.icon}</span>
          <span>{window.title}</span>
        </div>
        <div style={{ display: 'flex', gap: '2px' }}>
          <button
            className="win95-button"
            style={{ width: '16px', height: '14px', padding: 0, fontSize: '8px' }}
            onClick={(e) => { e.stopPropagation(); onMinimize(); }}
          >
            _
          </button>
          <button
            className="win95-button"
            style={{ width: '16px', height: '14px', padding: 0, fontSize: '8px' }}
            onClick={(e) => { e.stopPropagation(); onMaximize(); }}
          >
            {window.isMaximized ? '❐' : '□'}
          </button>
          <button
            className="win95-button"
            style={{ width: '16px', height: '14px', padding: 0, fontSize: '8px' }}
            onClick={(e) => { e.stopPropagation(); onClose(); }}
          >
            ×
          </button>
        </div>
      </div>
      
      <div className="win95-window-content">
        {renderAppContent()}
      </div>

      {!window.isMaximized && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: '12px',
            height: '12px',
            cursor: 'nw-resize',
            background: 'linear-gradient(-45deg, transparent 40%, #808080 40%, #808080 60%, transparent 60%)'
          }}
          onMouseDown={handleResizeMouseDown}
        />
      )}
    </div>
  );
};

export default Window;