import React from 'react';

interface SystemDialogProps {
  type: 'info' | 'warning' | 'error' | 'ai_thinking';
  title: string;
  message: string;
  onClose: () => void;
}

const SystemDialog: React.FC<SystemDialogProps> = ({ type, title, message, onClose }) => {
  const getIcon = () => {
    switch (type) {
      case 'info': return 'ℹ️';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'ai_thinking': return '🤔';
      default: return 'ℹ️';
    }
  };

  const getColor = () => {
    switch (type) {
      case 'error': return '#ff0000';
      case 'warning': return '#ff8800';
      case 'ai_thinking': return '#0080ff';
      default: return '#000080';
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2500
    }}>
      <div 
        className="win95-window"
        style={{
          width: '350px',
          minHeight: '150px',
          position: 'relative'
        }}
      >
        <div className="win95-window-titlebar">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ marginRight: '8px' }}>{getIcon()}</span>
            <span>{title}</span>
          </div>
          <div style={{ display: 'flex', gap: '2px' }}>
            <button
              className="win95-button"
              style={{ width: '16px', height: '14px', padding: 0, fontSize: '8px' }}
              onClick={onClose}
            >
              ×
            </button>
          </div>
        </div>
        
        <div className="win95-window-content" style={{ 
          padding: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{ 
            fontSize: '32px',
            color: getColor()
          }}>
            {getIcon()}
          </div>
          
          <div style={{ flex: 1 }}>
            <p style={{ 
              lineHeight: '1.4',
              fontSize: '11px',
              margin: 0
            }}>
              {message}
            </p>
          </div>
        </div>
        
        <div style={{
          padding: '8px 20px 20px',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <button 
            className="win95-button"
            onClick={onClose}
            style={{ padding: '4px 16px', minWidth: '60px' }}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default SystemDialog;