import React, { useState } from 'react';

interface WindowFrameProps {
  children: React.ReactNode;
}

export const WindowFrame: React.FC<WindowFrameProps> = ({ children }) => {
  const [isMaximized, setIsMaximized] = useState(false);

  const windowStyle: React.CSSProperties = isMaximized ? {
    width: '100%',
    height: '100%',
    maxWidth: 'none',
    maxHeight: 'none',
    borderRadius: 0,
    margin: 0,
  } : {
    width: '100%',
    maxWidth: '900px',
    height: '88vh',
    margin: '20px auto',
    borderRadius: '12px',
  };

  return (
    <div style={{
      ...windowStyle,
      backgroundColor: '#ffffff',
      border: isMaximized ? 'none' : '1px solid #d1d1d6',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      boxSizing: 'box-border',
      transition: 'all 0.2s ease-in-out'
    }}>
      {/* Верхня панель з білим фоном і лише іконкою квадратика */}
      <div style={{
        height: '36px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #f2f2f7',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '0 12px',
        userSelect: 'none',
        flexShrink: 0
      }}>
        <button
          onClick={() => setIsMaximized(!isMaximized)}
          title={isMaximized ? "Згорнути у вікно" : "На весь екран"}
          style={{
            background: 'none',
            border: '1px solid #d1d1d6',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            color: '#3a3a3c',
            width: '26px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#ffffff'
          }}
        >
          {isMaximized ? '❐' : '□'}
        </button>
      </div>

      {/* Вміст програми */}
      <div style={{ flex: 1, overflowY: 'auto', position: 'relative', width: '100%', height: '100%' }}>
        {children}
      </div>
    </div>
  );
};
