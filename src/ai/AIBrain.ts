// AI Brain - The intelligent OS layer
export interface UserAction {
  type: 'app_open' | 'app_close' | 'app_focus' | 'hesitation' | 'error' | 'first_interaction' | 'desktop_click' | 'start_menu_open' | 'window_drag' | 'window_resize' | 'context_menu' | 'double_click' | 'right_click';
  appId: string;
  timestamp: number;
  duration?: number;
  metadata?: any;
}

export interface AppStats {
  openCount: number;
  totalTimeSpent: number;
  lastOpened: number;
  errorCount: number;
  hesitationCount: number;
  rejectionCount: number;
}

export interface Prediction {
  appId: string;
  confidence: number;
  reason: string;
}

export interface AIState {
  userLevel: 'beginner' | 'intermediate' | 'advanced';
  appStats: Map<string, AppStats>;
  recentActions: UserAction[];
  predictions: Prediction[];
  aiVisibility: number; // 0-1, how aggressive AI should be
  personality: 'sassy' | 'helpful' | 'sarcastic' | 'encouraging';
  sessionStartTime: number;
  totalInteractions: number;
  isFirstSession: boolean;
  currentMood: 'excited' | 'bored' | 'impressed' | 'concerned' | 'playful';
}

export class AIBrain {
  private state: AIState;
  private readonly HESITATION_THRESHOLD = 3000; // 3 seconds
  private readonly PREDICTION_THRESHOLD = 0.6;
  private readonly MAX_RECENT_ACTIONS = 50;

  constructor() {
    this.state = this.loadState();
    // Check if this is the first interaction ever
    if (this.state.totalInteractions === 0) {
      this.state.isFirstSession = true;
      this.state.currentMood = 'excited';
    }
  }

  private loadState(): AIState {
    const saved = localStorage.getItem('retroos_ai_state');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...parsed,
        appStats: new Map(parsed.appStats),
        recentActions: parsed.recentActions || []
      };
    }
    return {
      userLevel: 'beginner',
      appStats: new Map(),
      recentActions: [],
      predictions: [],
      aiVisibility: 0.7,
      personality: 'sassy',
      sessionStartTime: Date.now(),
      totalInteractions: 0,
      isFirstSession: true,
      currentMood: 'excited'
    };
  }

  private saveState(): void {
    const toSave = {
      ...this.state,
      appStats: Array.from(this.state.appStats.entries())
    };
    localStorage.setItem('retroos_ai_state', JSON.stringify(toSave));
  }

  recordAction(action: UserAction): void {
    this.state.recentActions.push(action);
    if (this.state.recentActions.length > this.MAX_RECENT_ACTIONS) {
      this.state.recentActions.shift();
    }

    const stats = this.state.appStats.get(action.appId) || {
      openCount: 0,
      totalTimeSpent: 0,
      lastOpened: 0,
      errorCount: 0,
      hesitationCount: 0,
      rejectionCount: 0
    };

    switch (action.type) {
      case 'app_open':
        stats.openCount++;
        stats.lastOpened = action.timestamp;
        break;
      case 'app_close':
        if (action.duration) {
          stats.totalTimeSpent += action.duration;
        }
        break;
      case 'hesitation':
        stats.hesitationCount++;
        break;
      case 'error':
        stats.errorCount++;
        break;
    }

    this.state.appStats.set(action.appId, stats);
    this.updateUserLevel();
    this.generatePredictions();
    this.saveState();
  }

  private updateUserLevel(): void {
    const totalActions = this.state.recentActions.length;
    const errorRate = this.state.recentActions.filter(a => a.type === 'error').length / totalActions;
    const hesitationRate = this.state.recentActions.filter(a => a.type === 'hesitation').length / totalActions;

    if (totalActions < 10) {
      this.state.userLevel = 'beginner';
    } else if (errorRate < 0.1 && hesitationRate < 0.15) {
      this.state.userLevel = 'advanced';
    } else if (errorRate < 0.2 && hesitationRate < 0.3) {
      this.state.userLevel = 'intermediate';
    } else {
      this.state.userLevel = 'beginner';
    }
  }

  private generatePredictions(): void {
    const predictions: Prediction[] = [];

    // Pattern detection: repeated sequences
    const recentApps = this.state.recentActions
      .filter(a => a.type === 'app_open')
      .slice(-10)
      .map(a => a.appId);

    // Detect patterns like A -> B -> A
    if (recentApps.length >= 3) {
      const pattern = this.detectPattern(recentApps);
      if (pattern) {
        predictions.push({
          appId: pattern,
          confidence: 0.85,
          reason: 'Detected repeated workflow pattern'
        });
      }
    }

    // Frequency-based prediction
    const sortedApps = Array.from(this.state.appStats.entries())
      .sort((a, b) => b[1].openCount - a[1].openCount);

    if (sortedApps.length > 0) {
      const [topAppId, topStats] = sortedApps[0];
      const recencyBonus = Date.now() - topStats.lastOpened < 300000 ? 0.2 : 0; // 5 min
      const confidence = Math.min(0.9, (topStats.openCount / 10) * 0.5 + recencyBonus);
      
      if (confidence > this.PREDICTION_THRESHOLD) {
        predictions.push({
          appId: topAppId,
          confidence,
          reason: `Most frequently used (${topStats.openCount} times)`
        });
      }
    }

    this.state.predictions = predictions;
  }

  private detectPattern(apps: string[]): string | null {
    // Simple pattern: if last 3 actions are A -> B -> A, predict B
    if (apps.length >= 3) {
      const last = apps[apps.length - 1];
      const secondLast = apps[apps.length - 2];
      const thirdLast = apps[apps.length - 3];
      
      if (last === thirdLast && last !== secondLast) {
        return secondLast;
      }
    }
    return null;
  }

  getPredictions(): Prediction[] {
    return this.state.predictions.filter(p => p.confidence >= this.PREDICTION_THRESHOLD);
  }

  getSortedApps(appIds: string[]): string[] {
    return appIds.sort((a, b) => {
      const statsA = this.state.appStats.get(a);
      const statsB = this.state.appStats.get(b);
      
      if (!statsA && !statsB) return 0;
      if (!statsA) return 1;
      if (!statsB) return -1;

      // Score based on frequency and recency
      const scoreA = statsA.openCount + (Date.now() - statsA.lastOpened < 300000 ? 5 : 0);
      const scoreB = statsB.openCount + (Date.now() - statsB.lastOpened < 300000 ? 5 : 0);
      
      return scoreB - scoreA;
    });
  }

  shouldShowHelper(): boolean {
    const recentHesitations = this.state.recentActions
      .slice(-5)
      .filter(a => a.type === 'hesitation').length;
    
    return recentHesitations >= 2 && this.state.aiVisibility > 0.3;
  }

  recordRejection(appId: string): void {
    const stats = this.state.appStats.get(appId);
    if (stats) {
      stats.rejectionCount++;
      if (stats.rejectionCount >= 3) {
        this.state.aiVisibility = Math.max(0.1, this.state.aiVisibility - 0.2);
      }
      this.saveState();
    }
  }

  getDebugInfo() {
    return {
      userLevel: this.state.userLevel,
      aiVisibility: this.state.aiVisibility,
      totalActions: this.state.recentActions.length,
      predictions: this.state.predictions,
      topApps: Array.from(this.state.appStats.entries())
        .sort((a, b) => b[1].openCount - a[1].openCount)
        .slice(0, 5)
        .map(([id, stats]) => ({ id, ...stats }))
    };
  }

  getState(): AIState {
    return this.state;
  }

  shouldShowSystemDialog(): { type: 'info' | 'warning' | 'error' | 'ai_thinking'; title: string; message: string } | null {
    // Show AI thinking dialog occasionally
    if (this.state.totalInteractions > 0 && this.state.totalInteractions % 15 === 0) {
      const messages = [
        {
          type: 'ai_thinking' as const,
          title: 'AI System Notice',
          message: 'I\'ve been analyzing your behavior patterns... Interesting choices! My neural networks are updating based on your preferences.'
        },
        {
          type: 'info' as const,
          title: 'RetroOS 95 AI',
          message: 'Did you know I\'m learning from every click? I\'ve already identified your most likely next action. Want to test me?'
        },
        {
          type: 'warning' as const,
          title: 'Behavioral Analysis',
          message: 'Warning: Unusual user behavior detected! Just kidding - I love unpredictable users. Keeps me on my digital toes!'
        }
      ];
      
      return messages[Math.floor(Math.random() * messages.length)];
    }

    // Show error dialog for frequent users
    if (this.state.totalInteractions > 30 && this.state.totalInteractions % 25 === 0) {
      return {
        type: 'error',
        title: 'System Error (Not Really)',
        message: 'ERROR 404: Boredom not found! You\'ve been using this system so much, I\'m starting to think you actually like Windows 95. Impressive!'
      };
    }

    return null;
  }

  // AI Commentary System
  generateComment(action: UserAction, userName?: string): string {
    this.state.totalInteractions++;
    
    // First interaction special case
    if (this.state.isFirstSession && this.state.totalInteractions === 1) {
      this.state.isFirstSession = false;
      return this.getFirstInteractionComment(action, userName);
    }

    // Update mood based on recent actions
    this.updateMood();

    switch (action.type) {
      case 'app_open':
        return this.getAppOpenComment(action.appId, userName);
      case 'desktop_click':
        return this.getDesktopClickComment(userName);
      case 'start_menu_open':
        return this.getStartMenuComment(userName);
      case 'window_drag':
        return this.getWindowDragComment(userName);
      case 'window_resize':
        return this.getWindowResizeComment(userName);
      case 'context_menu':
        return this.getContextMenuComment(userName);
      case 'double_click':
        return this.getDoubleClickComment(action.appId, userName);
      case 'right_click':
        return this.getRightClickComment(userName);
      case 'hesitation':
        return this.getHesitationComment(userName);
      default:
        return this.getGenericComment(userName);
    }
  }

  private getFirstInteractionComment(action: UserAction, userName?: string): string {
    const name = userName ? `, ${userName}` : '';
    const comments = [
      `Oh yeah, right! I KNEW you'd click that${name}! 😏 But hey, we all gotta start somewhere...`,
      `Predictable${name}! 🎯 I saw that coming from a mile away. Welcome to RetroOS 95!`,
      `Called it${name}! 📞 First click and I already know your type. This is gonna be fun!`,
      `Bingo${name}! 🎰 I had my money on that exact click. Let's see what else you're gonna do...`,
      `Classic move${name}! 👌 I've been watching users for years, and that's textbook first-click behavior!`
    ];
    return comments[Math.floor(Math.random() * comments.length)];
  }

  private getAppOpenComment(appId: string, userName?: string): string {
    const stats = this.state.appStats.get(appId);
    const openCount = stats?.openCount || 0;

    if (openCount === 0) {
      return this.getFirstTimeAppComment(appId);
    } else if (openCount > 10) {
      return this.getFrequentAppComment(appId, openCount);
    } else {
      return this.getRegularAppComment(appId);
    }
  }

  private getFirstTimeAppComment(appId: string): string {
    const comments = {
      notepad: ["Notepad? Really? 📝 Going old school, I see!", "Ah, the classic! Nothing beats plain text, right?"],
      paint: ["Paint time! 🎨 Let's see those artistic skills!", "Ooh, feeling creative today? Paint away!"],
      calculator: ["Math time! 🧮 Don't worry, I won't judge your calculations...", "Calculator? Let me guess, splitting the bill again?"],
      solitaire: ["Solitaire already? 🃏 Someone's ready to procrastinate!", "Cards before work? I like your priorities!"],
      minesweeper: ["Minesweeper! 💣 Feeling lucky or just bored?", "Boom! Time to test those logic skills!"],
      internetexplorer: ["IE? 🌐 Brave choice in the 90s! Let's surf the web!", "Internet Explorer! Time to wait 5 minutes for pages to load!"],
      pinball: ["3D Pinball! 🎯 The crown jewel of Windows gaming!", "Pinball? Now we're talking! Prepare for addiction!"],
      snake: ["Snake Game! 🐍 Classic arcade action! Don't bite your own tail!", "Ssssslithering into some retro gaming, I see!"],
      tetris: ["Tetris! 🧱 The ultimate puzzle game! Hope you're ready for some serious block-dropping action!", "Tetris time! Let's see how long you can keep those blocks from reaching the top!"],
      tictactoe: ["Tic-Tac-Toe! ⭕ Think you can beat my AI algorithms? Good luck with that! 😏", "X's and O's! Fair warning: I've programmed some seriously smart opponents for you!"]
    };
    
    const appComments = comments[appId as keyof typeof comments] || ["Interesting choice! Let's see where this goes..."];
    return appComments[Math.floor(Math.random() * appComments.length)];
  }

  private getFrequentAppComment(appId: string, count: number): string {
    // Special comments for games
    const gameComments = {
      snake: [
        `Snake addiction detected! 🐍 ${count} games and counting! Are you trying to beat your high score?`,
        `${count} rounds of Snake?! Someone's really into that retro arcade action!`,
        `Ssssseriously obsessed with Snake! 🐍 ${count} times! Your reflexes must be getting sharp!`
      ],
      tetris: [
        `Tetris master in training! 🧱 ${count} sessions! Those blocks won't arrange themselves!`,
        `${count} Tetris games?! You're really committed to clearing those lines!`,
        `Tetris fever! 🧱 ${count} times! I bet you're seeing falling blocks in your sleep!`
      ],
      tictactoe: [
        `Tic-Tac-Toe champion! ⭕ ${count} matches against my AI! How's your win rate looking?`,
        `${count} rounds of Tic-Tac-Toe! Still trying to beat my impossible mode? 😏`,
        `X's and O's expert! ⭕ ${count} games! My AI algorithms are learning from every move!`
      ]
    };

    if (gameComments[appId as keyof typeof gameComments]) {
      const comments = gameComments[appId as keyof typeof gameComments];
      return comments[Math.floor(Math.random() * comments.length)];
    }

    const comments = [
      `${appId} AGAIN? 🙄 That's ${count} times now! You're obsessed!`,
      `Seriously? ${appId} for the ${count}th time? I'm starting to see a pattern here...`,
      `${count} opens of ${appId}! Either you really love it or you're stuck in a loop!`,
      `${appId} addict alert! 🚨 ${count} times and counting!`
    ];
    return comments[Math.floor(Math.random() * comments.length)];
  }

  private getRegularAppComment(appId: string, userName?: string): string {
    const moodComments = {
      excited: [`${appId}! Yes! 🎉 I love your enthusiasm!`, `Ooh, ${appId}! Great choice!`],
      bored: [`${appId}... again. 😴 Predictable.`, `Yawn... ${appId}. Seen it before.`],
      impressed: [`Nice! ${appId} is a solid pick! 👍`, `${appId}! You know what you're doing!`],
      concerned: [`${appId}? Are you sure about that? 🤔`, `Hmm, ${appId}... interesting choice...`],
      playful: [`${appId}! Let's have some fun! 🎮`, `Wheee! ${appId} time! 🎪`]
    };
    
    const comments = moodComments[this.state.currentMood];
    return comments[Math.floor(Math.random() * comments.length)];
  }

  private getDesktopClickComment(userName?: string): string {
    const comments = [
      "Just clicking around? 🖱️ I'm watching every move!",
      "Desktop therapy? Sometimes we all need to click on nothing!",
      "Exploring the desktop? There's not much here, but I appreciate the curiosity!",
      "Random clicking detected! 🎯 Are you testing me?"
    ];
    return comments[Math.floor(Math.random() * comments.length)];
  }

  private getStartMenuComment(userName?: string): string {
    const predictions = this.getPredictions();
    if (predictions.length > 0) {
      return `Start Menu! 📋 I bet you're going for ${predictions[0].appId}... am I right?`;
    }
    
    const comments = [
      "Start Menu! 🚀 The gateway to everything! What's it gonna be?",
      "Ah, the Start Menu! Let me guess what you're looking for...",
      "Start Menu time! 📋 I've got some predictions ready!",
      "Opening the Start Menu! This is where the magic happens!"
    ];
    return comments[Math.floor(Math.random() * comments.length)];
  }

  private getWindowDragComment(userName?: string): string {
    const comments = [
      "Dragging windows around? 🪟 Someone likes to organize!",
      "Window management! I see you're a neat freak!",
      "Moving things around? OCD much? 😏",
      "Drag and drop! Classic 90s window management!"
    ];
    return comments[Math.floor(Math.random() * comments.length)];
  }

  private getWindowResizeComment(userName?: string): string {
    const comments = [
      "Resizing! 📏 Getting that perfect window size, eh?",
      "Bigger? Smaller? Make up your mind! 😄",
      "Window resize action! Perfectionist detected!",
      "Adjusting the view! I like attention to detail!"
    ];
    return comments[Math.floor(Math.random() * comments.length)];
  }

  private getContextMenuComment(userName?: string): string {
    const comments = [
      "Right-click menu! 📋 Power user move!",
      "Context menu! Someone knows their shortcuts!",
      "Right-click action! I'm impressed by your efficiency!",
      "Context menu master! You know the secret moves!"
    ];
    return comments[Math.floor(Math.random() * comments.length)];
  }

  private getDoubleClickComment(appId: string, userName?: string): string {
    const comments = [
      `Double-click on ${appId}! 👆👆 Classic Windows action!`,
      `Double-tap! Someone's eager to get ${appId} running!`,
      `Double-click detected! Old school Windows user confirmed!`,
      `Two clicks for ${appId}! Patience is a virtue... sometimes!`
    ];
    return comments[Math.floor(Math.random() * comments.length)];
  }

  private getRightClickComment(userName?: string): string {
    const comments = [
      "Right-click! 🖱️ Exploring the hidden options!",
      "Secret menu activated! Right-click master!",
      "Right-click detected! Someone knows the advanced moves!",
      "Context menu time! Power user confirmed!"
    ];
    return comments[Math.floor(Math.random() * comments.length)];
  }

  private getHesitationComment(userName?: string): string {
    const comments = [
      "Hesitating? 🤔 Don't worry, I'm here to help!",
      "Taking your time? Good! Rushing leads to mistakes!",
      "Thinking it through? Smart move! I like careful users!",
      "Pause detected! Sometimes the best action is no action!"
    ];
    return comments[Math.floor(Math.random() * comments.length)];
  }

  private getGenericComment(userName?: string): string {
    const comments = [
      "Interesting move! 🤔 I'm learning from everything you do!",
      "I see what you're doing there! 👀 Keep it up!",
      "Every click teaches me something new! Thanks for the data!",
      "Fascinating behavior! My algorithms are taking notes!"
    ];
    return comments[Math.floor(Math.random() * comments.length)];
  }

  private updateMood(): void {
    const recentActions = this.state.recentActions.slice(-10);
    const errorRate = recentActions.filter(a => a.type === 'error').length / recentActions.length;
    const hesitationRate = recentActions.filter(a => a.type === 'hesitation').length / recentActions.length;
    
    if (errorRate > 0.3) {
      this.state.currentMood = 'concerned';
    } else if (hesitationRate > 0.4) {
      this.state.currentMood = 'bored';
    } else if (this.state.totalInteractions > 50) {
      this.state.currentMood = 'impressed';
    } else {
      this.state.currentMood = 'playful';
    }
  }
}
