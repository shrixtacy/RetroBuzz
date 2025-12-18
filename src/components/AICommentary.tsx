import React, { useState, useEffect } from 'react';

interface AICommentaryProps {
  message: string;
  onDismiss: () => void;
}

const AICommentary: React.FC<AICommentaryProps> = ({ message, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [currentMessage, setCurrentMessage] = useState(message);

  useEffect(() => {
    setCurrentMessage(message);
    setIsVisible(true);
    
    // Auto-dismiss after 4 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onDismiss, 300);
    }, 4000);

    return () => clearTimeout(timer);
  }, [message, onDismiss]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(onDismiss, 300);
  };

  if (!isVisible && currentMessage === message) return null;

  return (
    <div 
      className={`ai-commentary ${isVisible ? 'slide-up' : 'fade-out'}`}
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        width: '320px',
        background: 'linear-gradient(135deg, #ff6b6b, #ff8e8e)',
        border: '2px outset #c0c0c0',
        borderRadius: '0',
        zIndex: 2000,
        fontFamily: 'MS Sans Serif, sans-serif',
        fontSize: '11px',
        boxShadow: '4px 4px 8px rgba(0,0,0,0.3)'
      }}
    >
      <div 
        style={{
          background: 'linear-gradient(90deg, #ff4757 0%, #ff6b6b 100%)',
          color: 'white',
          padding: '3px 8px',
          fontWeight: 'bold',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '10px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', marginRight: '6px' }}>🤖</span>
          <span>AI Commentary</span>
        </div>
        <button
          className="win95-button"
          style={{ 
            width: '16px', 
            height: '14px', 
            padding: 0, 
            fontSize: '8px',
            background: '#ff4757',
            border: '1px outset #ff6b6b',
            color: 'white'
          }}
          onClick={handleDismiss}
        >
          ×
        </button>
      </div>
      
      <div style={{ 
        padding: '12px',
        background: 'rgba(255, 255, 255, 0.95)',
        color: '#333',
        lineHeight: '1.4'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'flex-start',
          gap: '8px'
        }}>
          <div style={{ 
            fontSize: '24px',
            flexShrink: 0,
            animation: 'bounce 2s infinite'
          }}>
            🧠
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontWeight: 'bold', color: '#ff4757' }}>
              {currentMessage}
            </p>
          </div>
        </div>
      </div>

      {/* Speech bubble tail */}
      <div style={{
        position: 'absolute',
        top: '50%',
        right: '-10px',
        width: 0,
        height: 0,
        borderTop: '10px solid transparent',
        borderBottom: '10px solid transparent',
        borderLeft: '10px solid rgba(255, 255, 255, 0.95)',
        transform: 'translateY(-50%)'
      }} />
    </div>
  );
};

export default AICommentary;