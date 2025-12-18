import React, { useState, useEffect } from 'react';
import { SoundEffects } from '../utils/soundEffects';

interface LoadingScreenProps {
  onComplete: (userName: string, funnyName: string) => void;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loadingText, setLoadingText] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);
  const [userName, setUserName] = useState('');
  const [showWelcome, setShowWelcome] = useState(false);
  const [funnyName, setFunnyName] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [soundEffects] = useState(() => SoundEffects.getInstance());

  const funnyPrefixes = [
    'Princess', 'Captain', 'Master', 'Lord', 'Lady', 'Sir', 'Doctor', 'Professor',
    'Admiral', 'Commander', 'Wizard', 'Ninja', 'Pirate', 'Knight', 'Baron',
    'Duchess', 'Count', 'Supreme', 'Mighty', 'Epic'
  ];

  const loadingSteps = [
    'Initializing RetroOS 95...',
    'Loading system drivers...',
    'Checking memory allocation...',
    'Starting AI brain modules...',
    'Calibrating CRT monitor...',
    'Loading pixelated graphics...',
    'Initializing sound blaster...',
    'Connecting to the information superhighway...',
    'Loading Windows 95 compatibility layer...',
    'Preparing sassy AI commentary system...',
    'Booting up retro games collection...',
    'Finalizing system startup...',
    'System ready! Please identify yourself...'
  ];

  const typeText = (text: string, callback?: () => void) => {
    setIsTyping(true);
    setLoadingText('');
    let index = 0;
    
    const typeInterval = setInterval(() => {
      if (index < text.length) {
        setLoadingText(prev => prev + text[index]);
        index++;
      } else {
        clearInterval(typeInterval);
        setIsTyping(false);
        if (callback) {
          setTimeout(callback, 500);
        }
      }
    }, 50 + Math.random() * 50); // Variable typing speed for realism
  };

  useEffect(() => {
    if (currentStep < loadingSteps.length - 1) {
      const timer = setTimeout(() => {
        typeText(loadingSteps[currentStep], () => {
          setCurrentStep(prev => prev + 1);
        });
      }, currentStep === 0 ? 1000 : 1500 + Math.random() * 1000);
      
      return () => clearTimeout(timer);
    } else if (currentStep === loadingSteps.length - 1) {
      typeText(loadingSteps[currentStep], () => {
        setTimeout(() => {
          setShowNameInput(true);
        }, 1000);
      });
    }
  }, [currentStep]);

  const generateFunnyName = (name: string): string => {
    const prefix = funnyPrefixes[Math.floor(Math.random() * funnyPrefixes.length)];
    const shortName = name.length > 6 ? name.substring(0, 6) : name;
    return `${prefix} ${shortName}`;
  };

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userName.trim()) {
      soundEffects.playClick();
      const funny = generateFunnyName(userName.trim());
      setFunnyName(funny);
      setShowNameInput(false);
      setShowWelcome(true);
      
      // Type out the welcome message
      setTimeout(() => {
        soundEffects.playNotification();
        typeText(`Welcome, ${funny}!`, () => {
          setTimeout(() => {
            onComplete(userName.trim(), funny);
          }, 2000);
        });
      }, 500);
    }
  };

  const getRandomLoadingChar = () => {
    const chars = ['|', '/', '-', '\\'];
    return chars[Math.floor(Math.random() * chars.length)];
  };

  return (
    <div className="loading-screen">
      <div className="terminal-container">
        <div className="terminal-header">
          <div className="terminal-title">RetroOS 95 Boot Sequence</div>
          <div className="terminal-version">Version 1.0.95 - AI Enhanced</div>
        </div>
        
        <div className="terminal-content">
          <div className="boot-logo">
            <pre>{`
    ██████╗ ███████╗████████╗██████╗  ██████╗  ██████╗ ███████╗
    ██╔══██╗██╔════╝╚══██╔══╝██╔══██╗██╔═══██╗██╔═══██╗██╔════╝
    ██████╔╝█████╗     ██║   ██████╔╝██║   ██║██║   ██║███████╗
    ██╔══██╗██╔══╝     ██║   ██╔══██╗██║   ██║██║   ██║╚════██║
    ██║  ██║███████╗   ██║   ██║  ██║╚██████╔╝╚██████╔╝███████║
    ╚═╝  ╚═╝╚══════╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝  ╚═════╝ ╚══════╝
                              ██╗ █████╗ ██╗
                              ██║██╔══██╗██║
                              ██║╚██████║██║
                              ██║ ╚═══██║██║
                              ██║ █████╔╝██║
                              ╚═╝ ╚════╝ ╚═╝
            `}</pre>
          </div>

          <div className="loading-output">
            {loadingSteps.slice(0, currentStep).map((step, index) => (
              <div key={index} className="loading-line completed">
                <span className="prompt">C:\&gt;</span>
                <span className="command">{step}</span>
                <span className="status">[OK]</span>
              </div>
            ))}
            
            {currentStep < loadingSteps.length && (
              <div className="loading-line current">
                <span className="prompt">C:\&gt;</span>
                <span className="command">{loadingText}</span>
                {isTyping && <span className="cursor">_</span>}
                {!isTyping && currentStep < loadingSteps.length - 1 && (
                  <span className="loading-spinner">{getRandomLoadingChar()}</span>
                )}
              </div>
            )}
          </div>

          {showNameInput && (
            <div className="name-input-section">
              <div className="input-prompt">
                <span className="prompt">C:\&gt;</span>
                <span>Please enter your name to continue:</span>
              </div>
              <form onSubmit={handleNameSubmit} className="name-form">
                <span className="prompt">Name:</span>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="terminal-input"
                  placeholder="Enter your name..."
                  autoFocus
                  maxLength={20}
                />
                <button type="submit" className="terminal-button">
                  [ENTER]
                </button>
              </form>
            </div>
          )}

          {showWelcome && (
            <div className="welcome-section">
              <div className="welcome-message">
                <span className="prompt">C:\&gt;</span>
                <span className="welcome-text">{loadingText}</span>
                {isTyping && <span className="cursor">_</span>}
              </div>
              <div className="loading-final">
                <div className="progress-bar">
                  <div className="progress-fill"></div>
                </div>
                <div className="final-message">Loading your personalized RetroOS experience...</div>
              </div>
            </div>
          )}
        </div>

        <div className="terminal-footer">
          <div className="system-info">
            Memory: 640KB | CPU: 486DX2-66MHz | Graphics: VGA | Sound: SoundBlaster 16
          </div>
          {/* Hidden reset button for development */}
          <button 
            onClick={() => {
              localStorage.removeItem('retroos_booted');
              localStorage.removeItem('retroos_user');
              localStorage.removeItem('retroos_funny_name');
              window.location.reload();
            }}
            style={{
              position: 'absolute',
              bottom: '5px',
              right: '5px',
              background: 'transparent',
              border: 'none',
              color: '#003300',
              fontSize: '8px',
              cursor: 'pointer',
              opacity: 0.3
            }}
            title="Reset (Dev)"
          >
            RST
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;