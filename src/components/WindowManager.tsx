import React from 'react';
import { WindowState, AppDefinition } from '../os/OSManager';
import Window from './Window';

interface WindowManagerProps {
  windows: WindowState[];
  apps: AppDefinition[];
  onClose: (windowId: string, appId: string) => void;
  onFocus: (windowId: string, appId: string) => void;
  onMinimize: (windowId: string) => void;
  onMaximize: (windowId: string) => void;
  onMove: (windowId: string, x: number, y: number) => void;
  onResize: (windowId: string, width: number, height: number) => void;
}

const WindowManager: React.FC<WindowManagerProps> = ({
  windows,
  apps,
  onClose,
  onFocus,
  onMinimize,
  onMaximize,
  onMove,
  onResize
}) => {
  const getAppById = (appId: string) => {
    return apps.find(app => app.id === appId);
  };

  return (
    <>
      {windows
        .filter(window => !window.isMinimized)
        .sort((a, b) => a.zIndex - b.zIndex)
        .map(window => {
          const app = getAppById(window.appId);
          if (!app) return null;

          return (
            <Window
              key={window.id}
              window={window}
              app={app}
              onClose={() => onClose(window.id, window.appId)}
              onFocus={() => onFocus(window.id, window.appId)}
              onMinimize={() => onMinimize(window.id)}
              onMaximize={() => onMaximize(window.id)}
              onMove={(x, y) => onMove(window.id, x, y)}
              onResize={(width, height) => onResize(window.id, width, height)}
            />
          );
        })}
    </>
  );
};

export default WindowManager;