import React from 'react';

interface DebugInfo {
  userLevel: 'beginner' | 'intermediate' | 'advanced';
  aiVisibility: number;
  totalActions: number;
  predictions: Array<{
    appId: string;
    confidence: number;
    reason: string;
  }>;
  topApps: Array<{
    id: string;
    openCount: number;
    totalTimeSpent: number;
    lastOpened: number;
    errorCount: number;
    hesitationCount: number;
    rejectionCount: number;
  }>;
}

interface AIDebugPanelProps {
  debugInfo: DebugInfo;
  onClose: () => void;
}

const AIDebugPanel: React.FC<AIDebugPanelProps> = ({ debugInfo, onClose }) => {
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="ai-debug-panel fade-in">
      <div className="ai-debug-header">
        <span>🧠 AI Debug Panel</span>
        <button
          className="win95-button"
          style={{ width: '16px', height: '14px', padding: 0, fontSize: '8px' }}
          onClick={onClose}
        >
          ×
        </button>
      </div>
      
      <div className="ai-debug-content">
        <div className="ai-debug-section">
          <h4>User Profile</h4>
          <ul>
            <li>Level: <strong>{debugInfo.userLevel}</strong></li>
            <li>AI Visibility: <strong>{Math.round(debugInfo.aiVisibility * 100)}%</strong></li>
            <li>Total Actions: <strong>{debugInfo.totalActions}</strong></li>
          </ul>
        </div>

        <div className="ai-debug-section">
          <h4>Current Predictions</h4>
          {debugInfo.predictions.length > 0 ? (
            <ul>
              {debugInfo.predictions.map((pred, index) => (
                <li key={index}>
                  <strong>{pred.appId}</strong> ({Math.round(pred.confidence * 100)}%)
                  <br />
                  <small style={{ color: '#666' }}>{pred.reason}</small>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: '#666', fontStyle: 'italic' }}>No predictions</p>
          )}
        </div>

        <div className="ai-debug-section">
          <h4>Top Applications</h4>
          {debugInfo.topApps.length > 0 ? (
            <ul>
              {debugInfo.topApps.map((app, index) => (
                <li key={index}>
                  <strong>{app.id}</strong>
                  <br />
                  <small>
                    Opens: {app.openCount} | 
                    Time: {formatTime(app.totalTimeSpent)} | 
                    Last: {formatDate(app.lastOpened)}
                    <br />
                    Errors: {app.errorCount} | 
                    Hesitations: {app.hesitationCount} | 
                    Rejections: {app.rejectionCount}
                  </small>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: '#666', fontStyle: 'italic' }}>No usage data</p>
          )}
        </div>

        <div className="ai-debug-section">
          <h4>AI Behavior</h4>
          <ul>
            <li>Prediction Threshold: <strong>60%</strong></li>
            <li>Hesitation Timeout: <strong>3s</strong></li>
            <li>Max Recent Actions: <strong>50</strong></li>
            <li>Rejection Penalty: <strong>-20% visibility</strong></li>
          </ul>
        </div>

        <div style={{ 
          marginTop: '12px', 
          padding: '8px', 
          background: '#ffffcc',
          border: '1px solid #cccc00',
          fontSize: '9px'
        }}>
          <strong>💡 How AI Works:</strong>
          <br />
          • Tracks app usage patterns
          <br />
          • Predicts next likely actions
          <br />
          • Adapts to user skill level
          <br />
          • Reduces interference on rejections
          <br />
          • Shows contextual help on hesitation
        </div>
      </div>
    </div>
  );
};

export default AIDebugPanel;