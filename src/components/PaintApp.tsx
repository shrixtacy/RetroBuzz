import React, { useRef, useState, useEffect, useCallback } from 'react';

interface Point {
  x: number;
  y: number;
}

const PaintApp: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState<'brush' | 'eraser' | 'line' | 'rectangle' | 'circle'>('brush');
  const [currentColor, setCurrentColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(2);
  const [startPoint, setStartPoint] = useState<Point | null>(null);

  const colors = [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00',
    '#FF00FF', '#00FFFF', '#800000', '#008000', '#000080', '#808000',
    '#800080', '#008080', '#C0C0C0', '#808080'
  ];

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  useEffect(() => {
    clearCanvas();
  }, [clearCanvas]);

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);
    setIsDrawing(true);
    setStartPoint(pos);
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = brushSize;
    
    if (currentTool === 'brush') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = currentColor;
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    } else if (currentTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const pos = getMousePos(e);
    
    if (currentTool === 'brush' || currentTool === 'eraser') {
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }
  };

  const stopDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPoint) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const endPoint = getMousePos(e);
    
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = brushSize;
    
    if (currentTool === 'line') {
      ctx.beginPath();
      ctx.moveTo(startPoint.x, startPoint.y);
      ctx.lineTo(endPoint.x, endPoint.y);
      ctx.stroke();
    } else if (currentTool === 'rectangle') {
      const width = endPoint.x - startPoint.x;
      const height = endPoint.y - startPoint.y;
      ctx.strokeRect(startPoint.x, startPoint.y, width, height);
    } else if (currentTool === 'circle') {
      const radius = Math.sqrt(
        Math.pow(endPoint.x - startPoint.x, 2) + Math.pow(endPoint.y - startPoint.y, 2)
      );
      ctx.beginPath();
      ctx.arc(startPoint.x, startPoint.y, radius, 0, 2 * Math.PI);
      ctx.stroke();
    }
    
    setIsDrawing(false);
    setStartPoint(null);
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#c0c0c0' }}>
      {/* Toolbar */}
      <div style={{ 
        background: '#c0c0c0', 
        padding: '4px', 
        borderBottom: '1px solid #808080',
        display: 'flex',
        gap: '4px',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        {/* Tools */}
        <div style={{ display: 'flex', gap: '2px', marginRight: '8px' }}>
          {[
            { tool: 'brush', icon: '🖌️', name: 'Brush' },
            { tool: 'eraser', icon: '🧽', name: 'Eraser' },
            { tool: 'line', icon: '📏', name: 'Line' },
            { tool: 'rectangle', icon: '⬜', name: 'Rectangle' },
            { tool: 'circle', icon: '⭕', name: 'Circle' }
          ].map(({ tool, icon, name }) => (
            <button
              key={tool}
              className="win95-button"
              style={{
                padding: '4px 6px',
                fontSize: '12px',
                background: currentTool === tool ? '#0000ff' : undefined,
                color: currentTool === tool ? 'white' : undefined
              }}
              onClick={() => setCurrentTool(tool as any)}
              title={name}
            >
              {icon}
            </button>
          ))}
        </div>

        {/* Brush Size */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginRight: '8px' }}>
          <span style={{ fontSize: '10px' }}>Size:</span>
          <input
            type="range"
            min="1"
            max="20"
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            style={{ width: '60px' }}
          />
          <span style={{ fontSize: '10px', minWidth: '20px' }}>{brushSize}</span>
        </div>

        {/* Clear Button */}
        <button
          className="win95-button"
          style={{ padding: '2px 8px', fontSize: '10px' }}
          onClick={clearCanvas}
        >
          Clear
        </button>
      </div>

      {/* Color Palette */}
      <div style={{ 
        background: '#c0c0c0', 
        padding: '4px', 
        borderBottom: '1px solid #808080',
        display: 'flex',
        gap: '2px',
        flexWrap: 'wrap'
      }}>
        {colors.map(color => (
          <div
            key={color}
            style={{
              width: '20px',
              height: '20px',
              backgroundColor: color,
              border: currentColor === color ? '2px solid #000' : '1px solid #808080',
              cursor: 'pointer',
              boxSizing: 'border-box'
            }}
            onClick={() => setCurrentColor(color)}
            title={color}
          />
        ))}
        <input
          type="color"
          value={currentColor}
          onChange={(e) => setCurrentColor(e.target.value)}
          style={{
            width: '20px',
            height: '20px',
            border: '1px solid #808080',
            cursor: 'pointer',
            padding: 0
          }}
          title="Custom Color"
        />
      </div>

      {/* Canvas */}
      <div style={{ 
        flex: 1, 
        padding: '8px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#c0c0c0'
      }}>
        <div style={{ border: '2px inset #c0c0c0', background: 'white' }}>
          <canvas
            ref={canvasRef}
            width={400}
            height={300}
            style={{ 
              display: 'block',
              cursor: currentTool === 'eraser' ? 'crosshair' : 
                     currentTool === 'brush' ? 'crosshair' : 'crosshair'
            }}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
          />
        </div>
      </div>

      {/* Status Bar */}
      <div style={{ 
        background: '#c0c0c0', 
        padding: '2px 8px', 
        borderTop: '1px solid #808080',
        fontSize: '10px',
        display: 'flex',
        justifyContent: 'space-between'
      }}>
        <span>Tool: {currentTool.charAt(0).toUpperCase() + currentTool.slice(1)}</span>
        <span>Size: {brushSize}px</span>
        <span>Color: {currentColor}</span>
      </div>
    </div>
  );
};

export default PaintApp;