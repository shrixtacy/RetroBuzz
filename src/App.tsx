import React, { useState, useEffect, useCallback } from 'react';
import { AIBrain } from './ai/AIBrain';
import { OSManager, AppDefinition } from './os/OSManager';
import { SoundEffects } from './utils/soundEffects';
import Desktop from './components/Desktop';
import Taskbar from './components/Taskbar';
import WindowManager from './components/WindowManager';
import StartMenu from './components/StartMenu';
import AIDebugPanel from './components/AIDebugPanel';
import ClippyAssistant from './components/ClippyAssistant';
import AICommentary from './components/AICommentary';
import WelcomeDialog from './components/WelcomeDialog';
import SystemDialog from './components/SystemDialog';
import LoadingScreen from './components/LoadingScreen';

// App definitions with retro pixelated icons
const APPS: AppDefinition[] = [
  {
    id: 'notepad',
    name: 'Notepad',
    icon: '📋',
    executable: 'notepad.exe',
    defaultWidth: 500,
    defaultHeight: 400
  },
  {
    id: 'paint',
    name: 'Paint',
    icon: '🖌️',
    executable: 'mspaint.exe',
    defaultWidth: 600,
    defaultHeight: 450
  },
  {
    id: 'calculator',
    name: 'Calculator',
    icon: '🔢',
    executable: 'calc.exe',
    defaultWidth: 300,
    defaultHeight: 400
  },
  {
    id: 'mycomputer',
    name: 'My Computer',
    icon: '🖥️',
    executable: 'explorer.exe',
    defaultWidth: 600,
    defaultHeight: 400
  },
  {
    id: 'control',
    name: 'Control Panel',
    icon: '🔧',
    executable: 'control.exe',
    defaultWidth: 500,
    defaultHeight: 400
  },
  {
    id: 'solitaire',
    name: 'Solitaire',
    icon: '🂠',
    executable: 'sol.exe',
    defaultWidth: 600,
    defaultHeight: 500
  },
  {
    id: 'minesweeper',
    name: 'Minesweeper',
    icon: '💥',
    executable: 'winmine.exe',
    defaultWidth: 400,
    defaultHeight: 350
  },
  {
    id: 'wordpad',
    name: 'WordPad',
    icon: '📃',
    executable: 'wordpad.exe',
    defaultWidth: 650,
    defaultHeight: 500
  },
  {
    id: 'mediaplayer',
    name: 'Media Player',
    icon: '🎶',
    executable: 'mplayer.exe',
    defaultWidth: 400,
    defaultHeight: 300
  },
  {
    id: 'internetexplorer',
    name: 'Internet Explorer',
    icon: '🌍',
    executable: 'iexplore.exe',
    defaultWidth: 800,
    defaultHeight: 600
  },
  {
    id: 'winzip',
    name: 'WinZip',
    icon: '📁',
    executable: 'winzip.exe',
    defaultWidth: 500,
    defaultHeight: 400
  },
  {
    id: 'defrag',
    name: 'Disk Defragmenter',
    icon: '💿',
    executable: 'defrag.exe',
    defaultWidth: 450,
    defaultHeight: 350
  },
  {
    id: 'scandisk',
    name: 'ScanDisk',
    icon: '🔎',
    executable: 'scandisk.exe',
    defaultWidth: 400,
    defaultHeight: 300
  },
  {
    id: 'freecell',
    name: 'FreeCell',
    icon: '🃁',
    executable: 'freecell.exe',
    defaultWidth: 600,
    defaultHeight: 500
  },
  {
    id: 'hearts',
    name: 'Hearts',
    icon: '♠️',
    executable: 'hearts.exe',
    defaultWidth: 700,
    defaultHeight: 500
  },
  {
    id: 'pinball',
    name: '3D Pinball',
    icon: '🏀',
    executable: 'pinball.exe',
    defaultWidth: 600,
    defaultHeight: 700
  },
  {
    id: 'snake',
    name: 'Snake Game',
    icon: '🟢',
    executable: 'snake.exe',
    defaultWidth: 400,
    defaultHeight: 450
  },
  {
    id: 'tetris',
    name: 'Tetris',
    icon: '🟦',
    executable: 'tetris.exe',
    defaultWidth: 350,
    defaultHeight: 500
  },
  {
    id: 'tictactoe',
    name: 'Tic-Tac-Toe',
    icon: '❌',
    executable: 'tictactoe.exe',
    defaultWidth: 400,
    defaultHeight: 450
  }
];

function App() {
  const [aiBrain] = useState(() => new AIBrain());
  const [osManager] = useState(() => new OSManager());
  const [soundEffects] = useState(() => SoundEffects.getInstance());
  const [osState, setOSState] = useState(osManager.getState());
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [showClippy, setShowClippy] = useState(false);
  const [hesitationTimer, setHesitationTimer] = useState<number | null>(null);
  const [aiComment, setAiComment] = useState<string | null>(null);
  const [showWelcome, setShowWelcome] = useState(() => {
    return !localStorage.getItem('retroos_welcomed');
  });
  const [systemDialog, setSystemDialog] = useState<{
    type: 'info' | 'warning' | 'error' | 'ai_thinking';
    title: string;
    message: string;
  } | null>(null);
  const [showLoading, setShowLoading] = useState(() => {
    return !localStorage.getItem('retroos_booted');
  });
  const [currentUser, setCurrentUser] = useState(() => {
    return localStorage.getItem('retroos_user') || '';
  });
  const [userFunnyName, setUserFunnyName] = useState(() => {
    return localStorage.getItem('retroos_funny_name') || '';
  });

  // Subscribe to OS state changes
  useEffect(() => {
    const unsubscribe = osManager.subscribe(setOSState);
    return unsubscribe;
  }, [osManager]);

  // Play startup sound
  useEffect(() => {
    const timer = setTimeout(() => {
      soundEffects.playStartup();
    }, 1000);
    return () => clearTimeout(timer);
  }, [soundEffects]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + Alt + D = Toggle debug panel
      if (e.ctrlKey && e.altKey && e.key === 'd') {
        e.preventDefault();
        setShowDebugPanel(prev => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Hesitation detection
  useEffect(() => {
    const handleMouseMove = () => {
      if (hesitationTimer) {
        clearTimeout(hesitationTimer);
      }
      
      const timer = setTimeout(() => {
        aiBrain.recordAction({
          type: 'hesitation',
          appId: 'system',
          timestamp: Date.now()
        });
        
        if (aiBrain.shouldShowHelper()) {
          setShowClippy(true);
        }
      }, 3000);
      
      setHesitationTimer(timer);
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      if (hesitationTimer) {
        clearTimeout(hesitationTimer);
      }
    };
  }, [aiBrain, hesitationTimer]);

  const showAIComment = useCallback((action: any) => {
    const comment = aiBrain.generateComment(action, currentUser);
    setAiComment(comment);
    soundEffects.playAIComment();
    
    // Check if AI wants to show a system dialog
    const dialogInfo = aiBrain.shouldShowSystemDialog();
    if (dialogInfo) {
      setTimeout(() => {
        setSystemDialog(dialogInfo);
        soundEffects.playNotification();
      }, 2000); // Show after comment
    }
  }, [aiBrain, soundEffects, currentUser]);

  const handleAppOpen = useCallback((appId: string) => {
    const app = APPS.find(a => a.id === appId);
    if (!app) return;

    const startTime = Date.now();
    const action = {
      type: 'app_open' as const,
      appId,
      timestamp: startTime
    };

    aiBrain.recordAction(action);
    showAIComment(action);
    soundEffects.playWindowOpen();

    const windowId = osManager.openWindow(app);
    
    // Store start time for duration calculation
    const windowElement = document.querySelector(`[data-window-id="${windowId}"]`);
    if (windowElement) {
      (windowElement as any)._startTime = startTime;
    }
  }, [aiBrain, osManager, showAIComment]);

  const handleAppClose = useCallback((windowId: string, appId: string) => {
    const windowElement = document.querySelector(`[data-window-id="${windowId}"]`);
    const startTime = (windowElement as any)?._startTime || Date.now();
    const duration = Date.now() - startTime;

    aiBrain.recordAction({
      type: 'app_close',
      appId,
      timestamp: Date.now(),
      duration
    });

    soundEffects.playWindowClose();
    osManager.closeWindow(windowId);
  }, [aiBrain, osManager]);

  const handleAppFocus = useCallback((windowId: string, appId: string) => {
    aiBrain.recordAction({
      type: 'app_focus',
      appId,
      timestamp: Date.now()
    });

    osManager.focusWindow(windowId);
  }, [aiBrain, osManager]);

  const getSortedApps = useCallback(() => {
    return aiBrain.getSortedApps(APPS.map(app => app.id));
  }, [aiBrain]);

  const getPredictions = useCallback(() => {
    return aiBrain.getPredictions();
  }, [aiBrain]);

  const handleClippyDismiss = useCallback(() => {
    setShowClippy(false);
  }, []);

  const handleWelcomeClose = useCallback(() => {
    localStorage.setItem('retroos_welcomed', 'true');
    setShowWelcome(false);
  }, []);

  const handleLoadingComplete = useCallback((userName: string, funnyName: string) => {
    localStorage.setItem('retroos_booted', 'true');
    localStorage.setItem('retroos_user', userName);
    localStorage.setItem('retroos_funny_name', funnyName);
    setCurrentUser(userName);
    setUserFunnyName(funnyName);
    setShowLoading(false);
    
    // Play startup sound after loading
    setTimeout(() => {
      soundEffects.playStartup();
    }, 500);
  }, [soundEffects]);

  const handlePredictionRejection = useCallback((appId: string) => {
    aiBrain.recordRejection(appId);
  }, [aiBrain]);

  const handleDesktopClick = useCallback(() => {
    const action = {
      type: 'desktop_click' as const,
      appId: 'desktop',
      timestamp: Date.now()
    };
    soundEffects.playClick();
    aiBrain.recordAction(action);
    showAIComment(action);
  }, [aiBrain, showAIComment, soundEffects]);

  const handleStartMenuOpen = useCallback(() => {
    const action = {
      type: 'start_menu_open' as const,
      appId: 'start_menu',
      timestamp: Date.now()
    };
    aiBrain.recordAction(action);
    showAIComment(action);
    osManager.toggleStartMenu();
  }, [aiBrain, osManager, showAIComment]);

  const handleWindowDrag = useCallback((windowId: string, appId: string) => {
    const action = {
      type: 'window_drag' as const,
      appId,
      timestamp: Date.now(),
      metadata: { windowId }
    };
    aiBrain.recordAction(action);
    showAIComment(action);
  }, [aiBrain, showAIComment]);

  const handleWindowResize = useCallback((windowId: string, appId: string) => {
    const action = {
      type: 'window_resize' as const,
      appId,
      timestamp: Date.now(),
      metadata: { windowId }
    };
    aiBrain.recordAction(action);
    showAIComment(action);
  }, [aiBrain, showAIComment]);

  const handleDoubleClick = useCallback((appId: string) => {
    const action = {
      type: 'double_click' as const,
      appId,
      timestamp: Date.now()
    };
    soundEffects.playDoubleClick();
    aiBrain.recordAction(action);
    showAIComment(action);
  }, [aiBrain, showAIComment, soundEffects]);

  const handleRightClick = useCallback((appId: string) => {
    const action = {
      type: 'right_click' as const,
      appId,
      timestamp: Date.now()
    };
    aiBrain.recordAction(action);
    showAIComment(action);
  }, [aiBrain, showAIComment]);

  // Show loading screen first
  if (showLoading) {
    return <LoadingScreen onComplete={handleLoadingComplete} />;
  }

  return (
    <div className="monitor-frame">
      <div className="crt-screen">
        <div className="retroos-95">
          <div className="desktop-background" />
          <Desktop 
            apps={APPS}
            onAppOpen={handleAppOpen}
            onDesktopClick={handleDesktopClick}
            onDoubleClick={handleDoubleClick}
            onRightClick={handleRightClick}
          />
          
          {/* Monitor Details */}
          <div className="brand-label">RetroOS Monitor 95</div>
          <div className="power-led"></div>
          
          {/* Desk Items */}
          <div className="desk-keyboard"></div>
          <div className="desk-mouse"></div>
      
      <WindowManager
        windows={osState.windows}
        apps={APPS}
        onClose={handleAppClose}
        onFocus={handleAppFocus}
        onMinimize={osManager.minimizeWindow.bind(osManager)}
        onMaximize={osManager.maximizeWindow.bind(osManager)}
        onMove={(windowId, x, y) => {
          osManager.moveWindow(windowId, x, y);
          const window = osManager.getState().windows.find(w => w.id === windowId);
          if (window) handleWindowDrag(windowId, window.appId);
        }}
        onResize={(windowId, width, height) => {
          osManager.resizeWindow(windowId, width, height);
          const window = osManager.getState().windows.find(w => w.id === windowId);
          if (window) handleWindowResize(windowId, window.appId);
        }}
      />

      {osState.startMenuOpen && (
        <StartMenu
          apps={APPS}
          sortedAppIds={getSortedApps()}
          predictions={getPredictions()}
          onAppOpen={handleAppOpen}
          onClose={osManager.closeStartMenu.bind(osManager)}
          onPredictionReject={handlePredictionRejection}
        />
      )}

      <Taskbar
        windows={osState.windows}
        activeWindowId={osState.activeWindowId}
        startMenuOpen={osState.startMenuOpen}
        time={osState.time}
        onStartClick={handleStartMenuOpen}
        onWindowClick={handleAppFocus}
      />

      {showDebugPanel && (
        <AIDebugPanel
          debugInfo={aiBrain.getDebugInfo()}
          onClose={() => setShowDebugPanel(false)}
        />
      )}

      {showClippy && (
        <ClippyAssistant
          predictions={getPredictions()}
          onAppOpen={handleAppOpen}
          onDismiss={handleClippyDismiss}
        />
      )}

      {aiComment && (
        <AICommentary
          message={aiComment}
          onDismiss={() => setAiComment(null)}
        />
      )}

          {showWelcome && (
            <WelcomeDialog onClose={handleWelcomeClose} />
          )}

          {systemDialog && (
            <SystemDialog
              type={systemDialog.type}
              title={systemDialog.title}
              message={systemDialog.message}
              onClose={() => setSystemDialog(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;