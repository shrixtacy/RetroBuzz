import React, { useState, useEffect } from 'react';
import { Prediction } from '../ai/AIBrain';

interface ClippyAssistantProps {
  predictions: Prediction[];
  onAppOpen: (appId: string) => void;
  onDismiss: () => void;
}

const ClippyAssistant: React.FC<ClippyAssistantProps> = ({
  predictions,
  onAppOpen,
  onDismiss
}) => {
  const [currentMessage, setCurrentMessage] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const messages = [
    "I see you're taking your time! Need some help?",
    "Based on your usage, you might want to try one of these apps:",
    "I've noticed some patterns in how you work. Want suggestions?",
    "Looks like you might be looking for something specific..."
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentMessage(prev => (prev + 1) % messages.length);
    }, 3000);

    return () => clearInterval(timer);
  }, [messages.length]);

  const handleAppSuggestion = (appId: string) => {
    onAppOpen(appId);
    onDismiss();
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(onDismiss, 300);
  };

  if (!isVisible) return null;

  return (
    <div className="clippy-assistant slide-up">
      <div className="clippy-header">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ fontSize: '16px', marginRight: '8px' }}>📎</span>
          <span>Clippy 2.0</span>
        </div>
        <button
          className="win95-button"
          style={{ width: '16px', height: '14px', padding: 0, fontSize: '8px' }}
          onClick={handleDismiss}
        >
          ×
        </button>
      </div>
      
      <div className="clippy-content">
        <p style={{ marginBottom: '8px', fontSize: '10px' }}>
          {messages[currentMessage]}
        </p>
        
        {predictions.length > 0 && (
          <div>
            <p style={{ fontSize: '9px', color: '#666', marginBottom: '4px' }}>
              AI Suggestions:
            </p>
            {predictions.slice(0, 2).map((prediction, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '4px',
                  padding: '2px 4px',
                  background: '#f0f0f0',
                  border: '1px solid #ccc'
                }}
              >
                <span style={{ fontSize: '9px' }}>
                  {prediction.appId} ({Math.round(prediction.confidence * 100)}%)
                </span>
                <button
                  className="win95-button"
                  style={{ fontSize: '8px', padding: '1px 4px' }}
                  onClick={() => handleAppSuggestion(prediction.appId)}
                >
                  Open
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="clippy-actions">
        <button
          className="win95-button"
          style={{ fontSize: '9px', padding: '2px 6px' }}
          onClick={handleDismiss}
        >
          No thanks
        </button>
        <button
          className="win95-button"
          style={{ fontSize: '9px', padding: '2px 6px' }}
          onClick={() => {
            // Show more help or tips
            console.log('Show more help');
          }}
        >
          More help
        </button>
      </div>
      
      <div style={{
        position: 'absolute',
        bottom: '-10px',
        left: '20px',
        width: 0,
        height: 0,
        borderLeft: '10px solid transparent',
        borderRight: '10px solid transparent',
        borderTop: '10px solid #ffffcc'
      }} />
    </div>
  );
};

export default ClippyAssistant;