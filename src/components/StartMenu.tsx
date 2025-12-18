import React, { useEffect, useRef } from 'react';
import { AppDefinition } from '../os/OSManager';
import { Prediction } from '../ai/AIBrain';

interface StartMenuProps {
  apps: AppDefinition[];
  sortedAppIds: string[];
  predictions: Prediction[];
  onAppOpen: (appId: string) => void;
  onClose: () => void;
  onPredictionReject: (appId: string) => void;
}

const StartMenu: React.FC<StartMenuProps> = ({
  apps,
  sortedAppIds,
  predictions,
  onAppOpen,
  onClose,
  onPredictionReject
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleAppClick = (appId: string) => {
    onAppOpen(appId);
    onClose();
  };

  const isPredicted = (appId: string) => {
    return predictions.some(p => p.appId === appId);
  };

  const getPredictionReason = (appId: string) => {
    const prediction = predictions.find(p => p.appId === appId);
    return prediction ? prediction.reason : '';
  };

  // Sort apps based on AI predictions and usage
  const sortedApps = apps
    .slice()
    .sort((a, b) => {
      const aIndex = sortedAppIds.indexOf(a.id);
      const bIndex = sortedAppIds.indexOf(b.id);
      
      // Predicted apps go first
      const aPredicted = isPredicted(a.id);
      const bPredicted = isPredicted(b.id);
      
      if (aPredicted && !bPredicted) return -1;
      if (!aPredicted && bPredicted) return 1;
      
      // Then by usage frequency
      if (aIndex === -1 && bIndex === -1) return a.name.localeCompare(b.name);
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      
      return aIndex - bIndex;
    });

  return (
    <div ref={menuRef} className="start-menu slide-up">
      <div style={{ 
        background: 'linear-gradient(90deg, #000080 0%, #0000ff 100%)',
        color: 'white',
        padding: '8px',
        fontWeight: 'bold',
        fontSize: '12px'
      }}>
        RetroOS 95
      </div>
      
      <div style={{ padding: '4px 0' }}>
        <div className="start-menu-item" onClick={() => handleAppClick('programs')}>
          <span style={{ marginRight: '8px' }}>📁</span>
          Programs
          <span style={{ marginLeft: 'auto' }}>▶</span>
        </div>
        
        <div style={{ height: '1px', background: '#808080', margin: '2px 8px' }} />
        
        {sortedApps.map(app => (
          <div
            key={app.id}
            className={`start-menu-item ${isPredicted(app.id) ? 'predicted' : ''}`}
            onClick={() => handleAppClick(app.id)}
            title={isPredicted(app.id) ? `AI Suggestion: ${getPredictionReason(app.id)}` : ''}
            onContextMenu={(e) => {
              if (isPredicted(app.id)) {
                e.preventDefault();
                onPredictionReject(app.id);
              }
            }}
          >
            <span style={{ marginRight: '8px' }}>{app.icon}</span>
            {app.name}
            {isPredicted(app.id) && (
              <span style={{ 
                marginLeft: 'auto', 
                fontSize: '8px',
                background: '#ffff00',
                color: '#000000',
                padding: '1px 3px',
                borderRadius: '2px'
              }}>
                AI
              </span>
            )}
          </div>
        ))}
        
        <div style={{ height: '1px', background: '#808080', margin: '2px 8px' }} />
        
        <div className="start-menu-item" onClick={() => console.log('Settings')}>
          <span style={{ marginRight: '8px' }}>⚙️</span>
          Settings
        </div>
        
        <div className="start-menu-item" onClick={() => console.log('Help')}>
          <span style={{ marginRight: '8px' }}>❓</span>
          Help
        </div>
        
        <div className="start-menu-item" onClick={() => console.log('Run')}>
          <span style={{ marginRight: '8px' }}>🏃</span>
          Run...
        </div>
        
        <div style={{ height: '1px', background: '#808080', margin: '2px 8px' }} />
        
        <div className="start-menu-item" onClick={() => console.log('Shut Down')}>
          <span style={{ marginRight: '8px' }}>🔌</span>
          Shut Down...
        </div>
      </div>
    </div>
  );
};

export default StartMenu;