import React, { useState, useRef, useEffect } from 'react';

const InternetExplorerApp: React.FC = () => {
  const [url, setUrl] = useState('retro://home');
  const [currentUrl, setCurrentUrl] = useState('retro://home');
  const [isLoading, setIsLoading] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');

  const historyRef = useRef<string[]>(['retro://home']);
  const historyIndexRef = useRef(0);

  // Sites that work well in iframes or have CORS-friendly policies
  const workingSites = [
    { name: 'Archive.org', url: 'https://archive.org', description: 'Internet Archive - Wayback Machine' },
    { name: 'Example.com', url: 'https://example.com', description: 'Example Domain' },
    { name: 'HTTPBin', url: 'https://httpbin.org', description: 'HTTP Request & Response Service' },
    { name: 'JSONPlaceholder', url: 'https://jsonplaceholder.typicode.com', description: 'Fake Online REST API' },
    { name: 'Lorem Picsum', url: 'https://picsum.photos', description: 'Lorem Ipsum for Photos' }
  ];

  const retroPages = {
    home: {
      title: 'RetroOS 95 - Internet Start Page',
      content: `
        <div style="font-family: 'MS Sans Serif', sans-serif; background: #c0c0c0; padding: 20px; min-height: 100vh;">
          <center>
            <h1 style="color: #000080; font-size: 24px; margin-bottom: 20px;">
              🌐 Welcome to the World Wide Web! 🌐
            </h1>
            <p style="font-size: 12px; margin-bottom: 20px;">
              You are connected to the Information Superhighway at 56k modem speed!
            </p>
            
            <table border="1" cellpadding="10" cellspacing="0" style="background: white; margin: 20px auto;">
              <tr bgcolor="#000080">
                <td colspan="2" style="color: white; font-weight: bold; text-align: center;">
                  🔗 Popular Web Sites
                </td>
              </tr>
              <tr>
                <td><a href="retro://search" style="color: #0000ff;">🔍 Web Search</a></td>
                <td>Search the entire World Wide Web!</td>
              </tr>
              <tr>
                <td><a href="retro://news" style="color: #0000ff;">📰 News Center</a></td>
                <td>Latest news and information</td>
              </tr>
              <tr>
                <td><a href="retro://games" style="color: #0000ff;">🎮 Web Games</a></td>
                <td>Fun games to play online</td>
              </tr>
              <tr>
                <td><a href="retro://help" style="color: #0000ff;">❓ Internet Help</a></td>
                <td>Learn how to use the Internet</td>
              </tr>
            </table>

            <h3 style="color: #000080; margin-top: 30px;">🌍 External Sites (CORS-Friendly)</h3>
            <table border="1" cellpadding="8" cellspacing="0" style="background: white; margin: 10px auto;">
              ${workingSites.map(site => `
                <tr>
                  <td><a href="${site.url}" style="color: #0000ff;">${site.name}</a></td>
                  <td style="font-size: 10px;">${site.description}</td>
                </tr>
              `).join('')}
            </table>

            <hr style="margin: 30px 0;">
            <p style="font-size: 10px; color: #666;">
              <blink>✨ Best viewed with Internet Explorer 4.0 or higher ✨</blink><br>
              This page is optimized for 800x600 resolution<br>
              Last updated: ${new Date().toLocaleDateString()}
            </p>
          </center>
        </div>
      `
    },
    search: {
      title: 'RetroOS Web Search',
      content: `
        <div style="font-family: 'MS Sans Serif', sans-serif; background: #c0c0c0; padding: 20px; min-height: 100vh;">
          <center>
            <h1 style="color: #000080;">🔍 RetroOS Web Search</h1>
            <p>Search the World Wide Web!</p>
            
            <form style="margin: 20px 0;">
              <input type="text" placeholder="Enter search terms..." style="width: 300px; padding: 4px; border: 2px inset #c0c0c0;">
              <input type="submit" value="Search!" style="padding: 4px 12px; margin-left: 10px;">
            </form>

            <div style="background: white; border: 2px inset #c0c0c0; padding: 20px; margin: 20px auto; max-width: 500px;">
              <h3>🔥 Popular Search Terms:</h3>
              <ul style="text-align: left;">
                <li><a href="#" style="color: #0000ff;">Windows 95 tips</a></li>
                <li><a href="#" style="color: #0000ff;">Y2K bug information</a></li>
                <li><a href="#" style="color: #0000ff;">Dial-up internet speed</a></li>
                <li><a href="#" style="color: #0000ff;">CD-ROM games</a></li>
                <li><a href="#" style="color: #0000ff;">Floppy disk storage</a></li>
              </ul>
            </div>

            <p><a href="retro://home" style="color: #0000ff;">🏠 Back to Home Page</a></p>
          </center>
        </div>
      `
    },
    news: {
      title: 'RetroOS News Center',
      content: `
        <div style="font-family: 'MS Sans Serif', sans-serif; background: #c0c0c0; padding: 20px; min-height: 100vh;">
          <center>
            <h1 style="color: #000080;">📰 RetroOS News Center</h1>
            <p style="font-size: 12px;">Your source for the latest information!</p>
          </center>

          <table border="1" cellpadding="10" cellspacing="0" style="background: white; margin: 20px auto; width: 90%;">
            <tr bgcolor="#000080">
              <td style="color: white; font-weight: bold;">🔥 Breaking News</td>
            </tr>
            <tr>
              <td>
                <h3>🖥️ Windows 95 Revolutionizes Personal Computing</h3>
                <p style="font-size: 11px;">Microsoft's new operating system brings the Start button and taskbar to millions of users worldwide...</p>
                <hr>
                <h3>🌐 World Wide Web Grows Exponentially</h3>
                <p style="font-size: 11px;">Internet usage continues to surge as more households get connected via dial-up modems...</p>
                <hr>
                <h3>💿 CD-ROM Technology Becomes Standard</h3>
                <p style="font-size: 11px;">Multimedia applications and games now commonly distributed on compact discs...</p>
              </td>
            </tr>
          </table>

          <center>
            <p><a href="retro://home" style="color: #0000ff;">🏠 Back to Home Page</a></p>
          </center>
        </div>
      `
    },
    games: {
      title: 'RetroOS Web Games',
      content: `
        <div style="font-family: 'MS Sans Serif', sans-serif; background: #c0c0c0; padding: 20px; min-height: 100vh;">
          <center>
            <h1 style="color: #000080;">🎮 RetroOS Web Games</h1>
            <p>Fun games to play in your browser!</p>

            <table border="1" cellpadding="15" cellspacing="0" style="background: white; margin: 20px auto;">
              <tr bgcolor="#000080">
                <td colspan="2" style="color: white; font-weight: bold; text-align: center;">Available Games</td>
              </tr>
              <tr>
                <td style="text-align: center;">
                  <h3>🐍 Snake</h3>
                  <p style="font-size: 10px;">Classic snake game<br>Already installed!</p>
                </td>
                <td style="text-align: center;">
                  <h3>🧱 Tetris</h3>
                  <p style="font-size: 10px;">Block puzzle game<br>Already installed!</p>
                </td>
              </tr>
              <tr>
                <td style="text-align: center;">
                  <h3>🟡 Pac-Man</h3>
                  <p style="font-size: 10px;">Maze arcade game<br>Already installed!</p>
                </td>
                <td style="text-align: center;">
                  <h3>👾 Space Invaders</h3>
                  <p style="font-size: 10px;">Alien shooter<br>Already installed!</p>
                </td>
              </tr>
            </table>

            <div style="background: #ffff99; border: 2px solid #000; padding: 10px; margin: 20px auto; max-width: 400px;">
              <p style="font-size: 11px; margin: 0;">
                💡 <strong>Tip:</strong> Close this window and check your desktop for installed games!
              </p>
            </div>

            <p><a href="retro://home" style="color: #0000ff;">🏠 Back to Home Page</a></p>
          </center>
        </div>
      `
    },
    help: {
      title: 'Internet Help - RetroOS 95',
      content: `
        <div style="font-family: 'MS Sans Serif', sans-serif; background: #c0c0c0; padding: 20px; min-height: 100vh;">
          <center>
            <h1 style="color: #000080;">❓ Internet Help</h1>
            <p>Learn how to navigate the Information Superhighway!</p>
          </center>

          <div style="background: white; border: 2px inset #c0c0c0; padding: 20px; margin: 20px auto; max-width: 600px; text-align: left;">
            <h3 style="color: #000080;">🌐 What is the Internet?</h3>
            <p style="font-size: 11px;">The Internet is a global network of computers that allows you to access information, communicate with others, and explore the World Wide Web!</p>

            <h3 style="color: #000080;">🔗 How to Navigate</h3>
            <ul style="font-size: 11px;">
              <li><strong>Address Bar:</strong> Type web addresses (URLs) to visit sites</li>
              <li><strong>Links:</strong> Click blue underlined text to jump to other pages</li>
              <li><strong>Back Button:</strong> Return to the previous page</li>
              <li><strong>Home Button:</strong> Go back to your start page</li>
            </ul>

            <h3 style="color: #000080;">💡 Internet Tips</h3>
            <ul style="font-size: 11px;">
              <li>Web pages may take time to load on dial-up connections</li>
              <li>Not all sites allow embedding - some may show errors</li>
              <li>Bookmark your favorite sites for quick access</li>
              <li>Be patient - the Internet is still growing!</li>
            </ul>

            <h3 style="color: #000080;">🔧 Troubleshooting</h3>
            <p style="font-size: 11px;">If a website won't load, try:</p>
            <ul style="font-size: 11px;">
              <li>Checking your phone line connection</li>
              <li>Refreshing the page</li>
              <li>Trying a different website</li>
              <li>Restarting your modem</li>
            </ul>
          </div>

          <center>
            <p><a href="retro://home" style="color: #0000ff;">🏠 Back to Home Page</a></p>
          </center>
        </div>
      `
    }
  };

  const navigateTo = (newUrl: string) => {
    setIsLoading(true);
    
    // Handle retro:// URLs
    if (newUrl.startsWith('retro://')) {
      const page = newUrl.replace('retro://', '');
      setCurrentPage(page);
      setCurrentUrl(newUrl);
      setUrl(newUrl);
      setTimeout(() => setIsLoading(false), 500); // Simulate loading
    } else {
      // Handle external URLs
      if (!newUrl.startsWith('http://') && !newUrl.startsWith('https://')) {
        newUrl = 'https://' + newUrl;
      }
      setCurrentPage('external');
      setCurrentUrl(newUrl);
      setUrl(newUrl);
    }
    
    // Add to history
    const newHistory = historyRef.current.slice(0, historyIndexRef.current + 1);
    newHistory.push(newUrl);
    historyRef.current = newHistory;
    historyIndexRef.current = newHistory.length - 1;
    
    updateNavigationButtons();
  };

  const updateNavigationButtons = () => {
    setCanGoBack(historyIndexRef.current > 0);
    setCanGoForward(historyIndexRef.current < historyRef.current.length - 1);
  };

  const goBack = () => {
    if (canGoBack) {
      historyIndexRef.current--;
      const prevUrl = historyRef.current[historyIndexRef.current];
      navigateTo(prevUrl);
      updateNavigationButtons();
    }
  };

  const goForward = () => {
    if (canGoForward) {
      historyIndexRef.current++;
      const nextUrl = historyRef.current[historyIndexRef.current];
      navigateTo(nextUrl);
      updateNavigationButtons();
    }
  };

  const refresh = () => {
    setIsLoading(true);
    
    if (currentPage !== 'external') {
      // For retro pages, simulate loading
      setTimeout(() => setIsLoading(false), 500);
    } else {
      // For external pages, reload iframe
      if (iframeRef.current) {
        iframeRef.current.src = currentUrl + '?reload=' + Date.now();
      }
    }
  };

  const goHome = () => {
    navigateTo('retro://home');
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigateTo(url);
  };

  const handleIframeLoad = () => {
    if (currentPage === 'external') {
      setIsLoading(false);
    }
  };

  const handleIframeError = () => {
    if (currentPage === 'external') {
      setIsLoading(false);
    }
  };

  const handleLinkClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'A') {
      e.preventDefault();
      const href = target.getAttribute('href');
      if (href) {
        navigateTo(href);
      }
    }
  };

  useEffect(() => {
    updateNavigationButtons();
    // Initialize with home page
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 500);
  }, []);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#c0c0c0' }}>
      {/* Toolbar */}
      <div style={{ 
        background: '#c0c0c0', 
        padding: '4px', 
        borderBottom: '1px solid #808080',
        display: 'flex',
        gap: '4px',
        alignItems: 'center'
      }}>
        <button 
          className="win95-button" 
          onClick={goBack}
          disabled={!canGoBack}
          style={{ 
            fontSize: '10px', 
            padding: '2px 6px',
            opacity: canGoBack ? 1 : 0.5
          }}
          title="Back"
        >
          ◀ Back
        </button>
        <button 
          className="win95-button" 
          onClick={goForward}
          disabled={!canGoForward}
          style={{ 
            fontSize: '10px', 
            padding: '2px 6px',
            opacity: canGoForward ? 1 : 0.5
          }}
          title="Forward"
        >
          Forward ▶
        </button>
        <button 
          className="win95-button" 
          onClick={refresh}
          style={{ fontSize: '10px', padding: '2px 6px' }}
          title="Refresh"
        >
          🔄 Refresh
        </button>
        <button 
          className="win95-button" 
          onClick={goHome}
          style={{ fontSize: '10px', padding: '2px 6px' }}
          title="Home"
        >
          🏠 Home
        </button>
        <div style={{ width: '2px', height: '20px', background: '#808080', margin: '0 4px' }} />
        <button 
          className="win95-button" 
          onClick={() => navigateTo('https://www.google.com')}
          style={{ fontSize: '10px', padding: '2px 6px' }}
          title="Search"
        >
          🔍 Search
        </button>
      </div>

      {/* Address Bar */}
      <div style={{ 
        background: '#c0c0c0', 
        padding: '4px', 
        borderBottom: '1px solid #808080',
        display: 'flex',
        alignItems: 'center',
        gap: '4px'
      }}>
        <span style={{ fontSize: '10px', minWidth: '50px' }}>Address:</span>
        <form onSubmit={handleUrlSubmit} style={{ flex: 1, display: 'flex' }}>
          <input 
            type="text" 
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            style={{ 
              flex: 1,
              padding: '2px 4px',
              border: '1px inset #c0c0c0',
              fontSize: '11px',
              fontFamily: 'MS Sans Serif, sans-serif'
            }}
            placeholder="Enter web address..."
          />
          <button 
            type="submit"
            className="win95-button" 
            style={{ fontSize: '10px', padding: '2px 8px', marginLeft: '4px' }}
          >
            Go
          </button>
        </form>
      </div>

      {/* Quick Links */}
      <div style={{ 
        background: '#c0c0c0', 
        padding: '2px 4px', 
        borderBottom: '1px solid #808080',
        display: 'flex',
        gap: '4px',
        flexWrap: 'wrap'
      }}>
        <span style={{ fontSize: '9px', color: '#666', marginRight: '8px' }}>Quick Links:</span>
        <button
          className="win95-button"
          onClick={() => navigateTo('retro://home')}
          style={{ fontSize: '9px', padding: '1px 4px', height: '18px' }}
        >
          🏠 Home
        </button>
        <button
          className="win95-button"
          onClick={() => navigateTo('retro://search')}
          style={{ fontSize: '9px', padding: '1px 4px', height: '18px' }}
        >
          🔍 Search
        </button>
        <button
          className="win95-button"
          onClick={() => navigateTo('retro://news')}
          style={{ fontSize: '9px', padding: '1px 4px', height: '18px' }}
        >
          📰 News
        </button>
        {workingSites.slice(0, 3).map(site => (
          <button
            key={site.name}
            className="win95-button"
            onClick={() => {
              setUrl(site.url);
              navigateTo(site.url);
            }}
            style={{ 
              fontSize: '9px', 
              padding: '1px 4px',
              height: '18px'
            }}
            title={site.url}
          >
            {site.name}
          </button>
        ))}
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div style={{ 
          background: '#c0c0c0', 
          padding: '2px 8px', 
          borderBottom: '1px solid #808080',
          fontSize: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <div style={{ 
            width: '12px', 
            height: '12px', 
            border: '2px solid #0000ff',
            borderTop: '2px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          Loading {currentUrl}...
        </div>
      )}

      {/* Web Content */}
      <div style={{ 
        flex: 1, 
        background: 'white',
        border: '2px inset #c0c0c0',
        margin: '4px',
        position: 'relative',
        overflow: 'auto'
      }}>
        {currentPage !== 'external' ? (
          // Render retro pages
          <div 
            onClick={handleLinkClick}
            dangerouslySetInnerHTML={{ 
              __html: retroPages[currentPage as keyof typeof retroPages]?.content || retroPages.home.content 
            }}
          />
        ) : (
          // Render external sites in iframe
          <>
            <iframe
              ref={iframeRef}
              src={currentUrl}
              style={{ 
                width: '100%', 
                height: '100%', 
                border: 'none',
                background: 'white'
              }}
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              title="Internet Explorer Content"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
            />
            
            {/* CORS Error Fallback */}
            {!isLoading && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                background: '#ffcccc',
                border: '2px solid #ff0000',
                padding: '20px',
                textAlign: 'center',
                fontSize: '12px',
                display: 'none'
              }} id="cors-error">
                <h3>⚠️ Cannot Load Website</h3>
                <p>This website cannot be displayed due to security restrictions.</p>
                <p>Try one of our retro pages instead!</p>
                <button className="win95-button" onClick={() => navigateTo('retro://home')}>
                  Go to Home Page
                </button>
              </div>
            )}
          </>
        )}
        
        {/* Retro Loading Overlay */}
        {isLoading && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            fontSize: '12px',
            color: '#666'
          }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              border: '4px solid #c0c0c0',
              borderTop: '4px solid #0000ff',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              marginBottom: '16px'
            }} />
            <div>Loading web page...</div>
            <div style={{ fontSize: '10px', marginTop: '4px' }}>
              Connecting at 56k modem speed
            </div>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div style={{ 
        background: '#c0c0c0', 
        padding: '2px 8px', 
        borderTop: '1px solid #808080',
        fontSize: '10px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span>{isLoading ? 'Loading...' : 'Done'}</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <span>🔒 {currentUrl.startsWith('https://') ? 'Secure' : 'Not Secure'}</span>
          <span>Internet Zone</span>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default InternetExplorerApp;