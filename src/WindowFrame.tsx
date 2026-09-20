import React, { useState } from 'react';

interface WindowFrameProps {
  children: React.ReactNode;
}

export const WindowFrame: React.FC<WindowFrameProps> = ({ children }) => {
  const [isMaximized, setIsMaximized] = useState(false);

  // Стилі для перемикання між компактним вікном та повноекранним режимом на ПК
  const windowStyle: React.CSSProperties = isMaximized ? {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    borderRadius: 0,
    boxShadow: 'none',
  } : {
    position: 'relative',
    width: '100%',
    maxWidth: '900px',
    height: '88vh',
    margin: '20px auto',
    borderRadius: '12px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
  };

  return (
    <div style={{
      ...windowStyle,
      backgroundColor: '#ffffff',
      border: '1px solid #d1d1d6',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      zIndex: 9999,
      transition: 'all 0.2s ease-in-out'
    }}>
      {/* Верхня панель із назвою та однією кнопкою розгортання */}
      <div style={{
        height: '36px',
        backgroundColor: '#f2f2f7',
        borderBottom: '1px solid #e5e5ea',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 12px',
        userSelect: 'none',
        flexShrink: 0
      }}>
        <div style={{ fontSize: '12px', fontStyle: 'italic', color: '#3a3a3c', fontWeight: 'bold' }}>
          Design Tracker App
        </div>

        {/* Лише кнопка розгортання на весь екран / згортання у вікно */}
        <div>
          <button
            onClick={() => setIsMaximized(!isMaximized)}
            title={isMaximized ? "Згорнути у вікно" : "На весь екран"}
            style={{
              background: 'none',
              border: '1px solid #d1d1d6',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              color: '#3a3a3c',
              padding: '2px 8px',
              backgroundColor: '#ffffff'
            }}
          >
            {isMaximized ? '❐ Згорнути' : '□ На весь екран'}
          </button>
        </div>
      </div>

      {/* Вміст програми */}
      <div style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
        {children}
      </div>
    </div>
  );
};
