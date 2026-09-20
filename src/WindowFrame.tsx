import React, { useState } from 'react';

interface WindowFrameProps {
  children: React.ReactNode;
}

export const WindowFrame: React.FC<WindowFrameProps> = ({ children }) => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Стилі для вікна залежно від режиму (на весь екран чи середнє вікно по центру)
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
    maxWidth: '900px', // Зручна ширина для ПК
    height: '85vh',
    margin: '40px auto',
    borderRadius: '12px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
  };

  if (isMinimized) {
    return (
      <div style={{
        position: 'fixed',
        bottom: 0,
        right: '20px',
        width: '200px',
        backgroundColor: '#f2f2f7',
        border: '1px solid #d1d1d6',
        borderRadius: '8px 8px 0 0',
        padding: '8px 12px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 9999,
        cursor: 'pointer'
      }} onClick={() => setIsMinimized(false)}>
        <span style={{ fontSize: '12px', fontStyle: 'italic', fontWeight: 'bold' }}>Design Tracker Bot</span>
        <button onClick={(e) => { e.stopPropagation(); setIsMinimized(false); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>□</button>
      </div>
    );
  }

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
      {/* Верхня панель вікна у стилі Windows */}
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

        {/* Кнопки керування: Згорнути, На весь екран, Закрити */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={() => setIsMinimized(true)}
            title="Згорнути"
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#3a3a3c', padding: '2px 6px' }}
          >
            —
          </button>
          <button
            onClick={() => setIsMaximized(!isMaximized)}
            title={isMaximized ? "Згорнути у вікно" : "На весь екран"}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: '#3a3a3c', padding: '2px 6px' }}
          >
            {isMaximized ? '❐' : '□'}
          </button>
          <button
            onClick={() => {
              if (window.confirm('Закрити додаток?')) {
                window.close();
              }
            }}
            title="Закрити"
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#ff3b30', padding: '2px 6px' }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Вміст програми всередині вікна */}
      <div style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
        {children}
      </div>
    </div>
  );
};
