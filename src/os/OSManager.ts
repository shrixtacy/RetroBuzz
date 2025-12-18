// OS Manager - Core operating system logic
export interface WindowState {
  id: string;
  appId: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isMinimized: boolean;
  isMaximized: boolean;
  isFocused: boolean;
  zIndex: number;
}

export interface AppDefinition {
  id: string;
  name: string;
  icon: string;
  executable: string;
  defaultWidth: number;
  defaultHeight: number;
}

export interface OSState {
  windows: WindowState[];
  activeWindowId: string | null;
  startMenuOpen: boolean;
  nextZIndex: number;
  time: string;
}

export class OSManager {
  private state: OSState;
  private timeInterval: NodeJS.Timeout | null = null;
  private listeners: ((state: OSState) => void)[] = [];

  constructor() {
    this.state = {
      windows: [],
      activeWindowId: null,
      startMenuOpen: false,
      nextZIndex: 100,
      time: this.getCurrentTime()
    };
    this.startClock();
  }

  private getCurrentTime(): string {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { 
      hour12: true, 
      hour: 'numeric', 
      minute: '2-digit' 
    });
  }

  private startClock(): void {
    this.timeInterval = setInterval(() => {
      this.state.time = this.getCurrentTime();
      this.notifyListeners();
    }, 1000);
  }

  subscribe(listener: (state: OSState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener({ ...this.state }));
  }

  openWindow(app: AppDefinition): string {
    const windowId = `window_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Calculate position (cascade windows)
    const offset = this.state.windows.length * 30;
    const x = 100 + offset;
    const y = 100 + offset;

    const window: WindowState = {
      id: windowId,
      appId: app.id,
      title: app.name,
      x,
      y,
      width: app.defaultWidth,
      height: app.defaultHeight,
      isMinimized: false,
      isMaximized: false,
      isFocused: true,
      zIndex: this.state.nextZIndex++
    };

    // Unfocus other windows
    this.state.windows.forEach(w => w.isFocused = false);
    
    this.state.windows.push(window);
    this.state.activeWindowId = windowId;
    
    this.notifyListeners();
    return windowId;
  }

  closeWindow(windowId: string): void {
    this.state.windows = this.state.windows.filter(w => w.id !== windowId);
    
    if (this.state.activeWindowId === windowId) {
      // Focus the topmost remaining window
      const topWindow = this.state.windows
        .filter(w => !w.isMinimized)
        .sort((a, b) => b.zIndex - a.zIndex)[0];
      
      this.state.activeWindowId = topWindow?.id || null;
      if (topWindow) {
        topWindow.isFocused = true;
      }
    }
    
    this.notifyListeners();
  }

  focusWindow(windowId: string): void {
    const window = this.state.windows.find(w => w.id === windowId);
    if (!window) return;

    // Unfocus all windows
    this.state.windows.forEach(w => w.isFocused = false);
    
    // Focus target window
    window.isFocused = true;
    window.zIndex = this.state.nextZIndex++;
    this.state.activeWindowId = windowId;

    // Restore if minimized
    if (window.isMinimized) {
      window.isMinimized = false;
    }
    
    this.notifyListeners();
  }

  minimizeWindow(windowId: string): void {
    const window = this.state.windows.find(w => w.id === windowId);
    if (!window) return;

    window.isMinimized = true;
    window.isFocused = false;

    // Focus next available window
    const nextWindow = this.state.windows
      .filter(w => !w.isMinimized && w.id !== windowId)
      .sort((a, b) => b.zIndex - a.zIndex)[0];

    if (nextWindow) {
      nextWindow.isFocused = true;
      this.state.activeWindowId = nextWindow.id;
    } else {
      this.state.activeWindowId = null;
    }
    
    this.notifyListeners();
  }

  maximizeWindow(windowId: string): void {
    const window = this.state.windows.find(w => w.id === windowId);
    if (!window) return;

    if (window.isMaximized) {
      // Restore
      window.isMaximized = false;
      window.x = 100;
      window.y = 100;
      window.width = 600;
      window.height = 400;
    } else {
      // Maximize
      window.isMaximized = true;
      window.x = 0;
      window.y = 0;
      window.width = window.width; // Will be handled by CSS
      window.height = window.height;
    }
    
    this.notifyListeners();
  }

  moveWindow(windowId: string, x: number, y: number): void {
    const window = this.state.windows.find(w => w.id === windowId);
    if (!window || window.isMaximized) return;

    window.x = Math.max(0, x);
    window.y = Math.max(0, y);
    
    this.notifyListeners();
  }

  resizeWindow(windowId: string, width: number, height: number): void {
    const window = this.state.windows.find(w => w.id === windowId);
    if (!window || window.isMaximized) return;

    window.width = Math.max(200, width);
    window.height = Math.max(150, height);
    
    this.notifyListeners();
  }

  toggleStartMenu(): void {
    this.state.startMenuOpen = !this.state.startMenuOpen;
    this.notifyListeners();
  }

  closeStartMenu(): void {
    if (this.state.startMenuOpen) {
      this.state.startMenuOpen = false;
      this.notifyListeners();
    }
  }

  getState(): OSState {
    return { ...this.state };
  }

  getVisibleWindows(): WindowState[] {
    return this.state.windows.filter(w => !w.isMinimized);
  }

  getTaskbarWindows(): WindowState[] {
    return this.state.windows;
  }

  cleanup(): void {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
  }
}