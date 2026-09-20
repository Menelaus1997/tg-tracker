import React, { useState } from 'react';

interface WindowFrameProps {
  children: React.ReactNode;
}

export const WindowFrame: React.FC<WindowFrameProps> = ({ children }) => {
  const [isMaximized, setIsMaximized] = useState(false);

  // Коли isMaximized true — розтягуємо на 100% ширини і висоти. Коли false — робимо зручним вікном.
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
      boxSizing: 'border-box',
      transition: 'all 0.2s ease-in-out'
    }}>
      {/* Верхня панель з кнопкою перемикання екрана */}
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

      {/* Вміст програми тепер розтягуватиметься на всю площу */}
      <div style={{ flex: 1, overflowY: 'auto', position: 'relative', width: '100%', height: '100%' }}>
        {children}
      </div>
    </div>
  );
};
