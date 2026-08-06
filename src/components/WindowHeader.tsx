import React, { useState } from 'react';

interface WindowHeaderProps {
  title?: string;
}

export const WindowHeader: React.FC<WindowHeaderProps> = ({ title = 'TG Tracker' }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Взаємодія з Telegram Web App SDK
  const tg = (window as any).Telegram?.WebApp;

  const handleMinimize = () => {
    // Згортання додатка у Telegram
    if (tg?.close) {
      tg.close();
    }
  };

  const handleToggleFullscreen = () => {
    if (tg) {
      if (!isFullscreen) {
        tg.expand();
        setIsFullscreen(true);
      } else {
        // Якщо розгорнуто, повертаємо стандартний розмір за наявності API
        setIsFullscreen(false);
      }
    } else {
      setIsFullscreen(!isFullscreen);
    }
  };

  const handleClose = () => {
    if (tg?.close) {
      tg.close();
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: '#e5e5e5',
      padding: '6px 12px',
      borderBottom: '1px solid #ccc',
      fontFamily: 'sans-serif',
      userSelect: 'none'
    }}>
      <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#333' }}>
        {title}
      </div>

      {/* Кнопки керування вікном у стилі Windows */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        {/* Згортання */}
        <button
          onClick={handleMinimize}
          title="Згорнути"
          style={{
            width: '24px',
            height: '24px',
            border: '1px solid #aaa',
            backgroundColor: '#fff',
            cursor: 'pointer',
            borderRadius: '3px',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          &#9472;
        </button>

        {/* Розгортання на весь екран */}
        <button
          onClick={handleToggleFullscreen}
          title={isFullscreen ? "Зменшити вікно" : "Розгорнути на весь екран"}
          style={{
            width: '24px',
            height: '24px',
            border: '1px solid #aaa',
            backgroundColor: '#fff',
            cursor: 'pointer',
            borderRadius: '3px',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          &#9633;
        </button>

        {/* Закриття */}
        <button
          onClick={handleClose}
          title="Закрити"
          style={{
            width: '24px',
            height: '24px',
            border: '1px solid #aaa',
            backgroundColor: '#fff',
            cursor: 'pointer',
            borderRadius: '3px',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#d32f2f'
          }}
        >
          &#9587;
        </button>
      </div>
    </div>
  );
};
