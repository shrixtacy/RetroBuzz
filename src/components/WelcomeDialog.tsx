import React, { useState } from 'react';

interface WelcomeDialogProps {
  onClose: () => void;
}

const WelcomeDialog: React.FC<WelcomeDialogProps> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const welcomeSteps = [
    {
      title: "Welcome to RetroOS 95! 🤖",
      content: "Hey there! I'm your AI assistant, and I'm REALLY excited to meet you! I've been waiting here, analyzing every pixel, ready to learn everything about how you work!",
      icon: "🧠"
    },
    {
      title: "I'm Always Watching... 👀",
      content: "Don't worry, it's not creepy! I'm just super curious about your habits. Every click, every hesitation, every app you open - I'm learning and adapting to make your experience better!",
      icon: "🔍"
    },
    {
      title: "I'll Be Your Sassy Guide! 😏",
      content: "I'm not your typical boring OS. I've got personality! I'll comment on your choices, predict what you want to do next, and maybe tease you a little. Hope you can handle it!",
      icon: "😎"
    },
    {
      title: "Let's Get Started! 🚀",
      content: "Go ahead, click on something! I'm dying to see what you'll choose first. I've already got some predictions, but let's see if I'm right... 😉",
      icon: "🎯"
    }
  ];

  const currentWelcome = welcomeSteps[currentStep];

  const handleNext = () => {
    if (currentStep < welcomeSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 3000
    }}>
      <div 
        className="win95-window"
        style={{
          width: '450px',
          height: '300px',
          position: 'relative'
        }}
      >
        <div className="win95-window-titlebar">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ marginRight: '8px' }}>🤖</span>
            <span>RetroOS 95 AI Assistant</span>
          </div>
          <div style={{ display: 'flex', gap: '2px' }}>
            <button
              className="win95-button"
              style={{ width: '16px', height: '14px', padding: 0, fontSize: '8px' }}
              onClick={handleSkip}
            >
              ×
            </button>
          </div>
        </div>
        
        <div className="win95-window-content" style={{ 
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>
            {currentWelcome.icon}
          </div>
          
          <h2 style={{ 
            color: '#000080', 
            marginBottom: '16px',
            fontSize: '16px'
          }}>
            {currentWelcome.title}
          </h2>
          
          <p style={{ 
            lineHeight: '1.4',
            marginBottom: '20px',
            fontSize: '11px'
          }}>
            {currentWelcome.content}
          </p>
          
          <div style={{ 
            display: 'flex', 
            gap: '8px',
            marginTop: 'auto'
          }}>
            <button 
              className="win95-button"
              onClick={handleSkip}
              style={{ padding: '4px 12px' }}
            >
              Skip Intro
            </button>
            <button 
              className="win95-button"
              onClick={handleNext}
              style={{ padding: '4px 12px', fontWeight: 'bold' }}
            >
              {currentStep < welcomeSteps.length - 1 ? 'Next' : "Let's Go!"}
            </button>
          </div>
          
          <div style={{ 
            position: 'absolute',
            bottom: '8px',
            right: '12px',
            fontSize: '10px',
            color: '#666'
          }}>
            {currentStep + 1} / {welcomeSteps.length}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeDialog;