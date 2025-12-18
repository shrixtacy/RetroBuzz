import React, { useEffect } from 'react';

interface WelcomeSplashProps {
  funnyName: string;
  onComplete: () => void;
}

const WelcomeSplash: React.FC<WelcomeSplashProps> = ({ funnyName, onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2000); // Show for 2 seconds

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(135deg, #000080 0%, #000040 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      fontFamily: 'MS Sans Serif, sans-serif'
    }}>
      <div style={{
        textAlign: 'center',
        padding: '40px'
      }}>
        {/* Pixelated Welcome Text */}
        <div style={{
          fontSize: '48px',
          fontWeight: 'bold',
          color: '#ffff00',
          textShadow: `
            2px 2px 0px #000000,
            4px 4px 0px #666600,
            6px 6px 10px rgba(0,0,0,0.5)
          `,
          marginBottom: '20px',
          imageRendering: 'pixelated',
          fontFamily: 'monospace',
          letterSpacing: '4px',
          animation: 'glow 2s ease-in-out infinite alternate'
        }}>
          WELCOME
        </div>

        {/* Funny Name */}
        <div style={{
          fontSize: '32px',
          fontWeight: 'bold',
          color: '#ffffff',
          textShadow: `
            2px 2px 0px #000000,
            4px 4px 0px #333333,
            6px 6px 10px rgba(0,0,0,0.7)
          `,
          marginBottom: '30px',
          imageRendering: 'pixelated',
          fontFamily: 'monospace',
          letterSpacing: '2px',
          animation: 'slideIn 1s ease-out'
        }}>
          {funnyName}!
        </div>

        {/* Retro Loading Dots */}
        <div style={{
          fontSize: '24px',
          color: '#00ff00',
          fontFamily: 'monospace',
          letterSpacing: '8px'
        }}>
          <span style={{ animation: 'blink 1s infinite 0s' }}>●</span>
          <span style={{ animation: 'blink 1s infinite 0.3s' }}>●</span>
          <span style={{ animation: 'blink 1s infinite 0.6s' }}>●</span>
        </div>

        {/* Loading Text */}
        <div style={{
          fontSize: '14px',
          color: '#c0c0c0',
          marginTop: '20px',
          fontFamily: 'monospace',
          opacity: 0.8
        }}>
          Loading RetroOS 95...
        </div>
      </div>

      <style jsx>{`
        @keyframes glow {
          from {
            text-shadow: 
              2px 2px 0px #000000,
              4px 4px 0px #666600,
              6px 6px 10px rgba(255,255,0,0.3);
          }
          to {
            text-shadow: 
              2px 2px 0px #000000,
              4px 4px 0px #666600,
              6px 6px 10px rgba(255,255,0,0.3),
              0 0 20px #ffff00,
              0 0 30px #ffff00;
          }
        }

        @keyframes slideIn {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
};

export default WelcomeSplash;