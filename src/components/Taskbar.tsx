import React from 'react';
import { WindowState } from '../os/OSManager';

interface TaskbarProps {
  windows: WindowState[];
  activeWindowId: string | null;
  startMenuOpen: boolean;
  time: string;
  onStartClick: () => void;
  onWindowClick: (windowId: string, appId: string) => void;
}

const Taskbar: React.FC<TaskbarProps> = ({
  windows,
  activeWindowId,
  startMenuOpen,
  time,
  onStartClick,
  onWindowClick
}) => {
  return (
    <div className="taskbar">
      <button
        className={`start-button ${startMenuOpen ? 'active' : ''}`}
        onClick={onStartClick}
      >
        Start
      </button>

      <div className="taskbar-separator" />

      <div className="taskbar-buttons">
        {windows.map(window => (
          <button
            key={window.id}
            className={`taskbar-button ${window.isFocused ? 'active' : ''}`}
            onClick={() => onWindowClick(window.id, window.appId)}
            title={window.title}
          >
            {window.title}
          </button>
        ))}
      </div>

      <div className="taskbar-clock">
        {time}
      </div>
    </div>
  );
};

export default Taskbar;