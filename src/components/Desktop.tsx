import React, { useState, useCallback } from 'react';
import { AppDefinition } from '../os/OSManager';
import ContextMenu from './ContextMenu';

interface DesktopProps {
  apps: AppDefinition[];
  onAppOpen: (appId: string) => void;
  onDesktopClick: () => void;
  onDoubleClick: (appId: string) => void;
  onRightClick: (appId: string) => void;
}

interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
}

const Desktop: React.FC<DesktopProps> = ({ apps, onAppOpen, onDesktopClick, onDoubleClick, onRightClick }) => {
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0
  });

  const desktopApps = apps.filter(app => 
    ['mycomputer', 'notepad', 'paint', 'control', 'solitaire', 'minesweeper', 'internetexplorer', 'snake', 'tetris', 'tictactoe', 'pacman', 'breakout', 'spaceinvaders', 'asteroids', 'pong', 'frogger'].includes(app.id)
  );

  const handleIconClick = useCallback((appId: string) => {
    setSelectedIcon(appId);
  }, []);

  const handleIconDoubleClick = useCallback((appId: string) => {
    onDoubleClick(appId);
    onAppOpen(appId);
    setSelectedIcon(null);
  }, [onAppOpen, onDoubleClick]);

  const handleDesktopClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onDesktopClick();
      setSelectedIcon(null);
      setContextMenu({ visible: false, x: 0, y: 0 });
    }
  }, [onDesktopClick]);

  const handleDesktopRightClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (e.target === e.currentTarget) {
      onRightClick('desktop');
      setContextMenu({
        visible: true,
        x: e.clientX,
        y: e.clientY
      });
      setSelectedIcon(null);
    }
  }, [onRightClick]);

  const handleContextMenuClose = useCallback(() => {
    setContextMenu({ visible: false, x: 0, y: 0 });
  }, []);

  const contextMenuItems = [
    { label: 'Arrange Icons', action: () => console.log('Arrange icons') },
    { label: 'Line up Icons', action: () => console.log('Line up icons') },
    { separator: true },
    { label: 'Paste', action: () => console.log('Paste'), disabled: true },
    { separator: true },
    { label: 'Properties', action: () => console.log('Properties') }
  ];

  return (
    <>
      <div 
        className="desktop"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 28,
          padding: '40px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '8px',
          zIndex: 1
        }}
        onClick={handleDesktopClick}
        onContextMenu={handleDesktopRightClick}
      >
        {desktopApps.map((app, index) => (
          <div
            key={app.id}
            className={`desktop-icon ${selectedIcon === app.id ? 'selected' : ''}`}
            style={{
              position: 'absolute',
              left: 50 + (index % 5) * 90,
              top: 50 + Math.floor(index / 5) * 100
            }}
            onClick={() => handleIconClick(app.id)}
            onDoubleClick={() => handleIconDoubleClick(app.id)}
            onContextMenu={(e) => {
              e.preventDefault();
              onRightClick(app.id);
            }}
          >
            <div className="desktop-icon-image">
              {app.icon}
            </div>
            <span>{app.name}</span>
          </div>
        ))}

        {/* Recycle Bin */}
        <div
          className={`desktop-icon ${selectedIcon === 'recycle' ? 'selected' : ''}`}
          style={{
            position: 'absolute',
            right: 50,
            top: 50
          }}
          onClick={() => handleIconClick('recycle')}
          onDoubleClick={() => console.log('Open Recycle Bin')}
        >
          <div className="desktop-icon-image">
            🗑️
          </div>
          <span>Recycle Bin</span>
        </div>
      </div>

      {contextMenu.visible && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={contextMenuItems}
          onClose={handleContextMenuClose}
        />
      )}
    </>
  );
};

export default Desktop;