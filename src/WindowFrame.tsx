import React from 'react';

interface WindowFrameProps {
  children: React.ReactNode;
}

export const WindowFrame: React.FC<WindowFrameProps> = ({ children }) => {
  return (
    <div style={{
      width: '100%',
      // Використовуємо 100% замість 100vh, щоб вікно не закривало системну панель завдань Windows знизу
      height: '100%',
      maxHeight: '100vh',
      borderRadius: 0,
      margin: 0,
      backgroundColor: '#ffffff',
      border: 'none',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      boxSizing: 'border-box',
      // Невеликий відступ зверху, щоб мобільні кнопки Telegram (3 точки/хрестик) не налізали на контент
      paddingTop: '50px',
    }}>
      {/* Контейнер вмісту з вертикальним скролом */}
      <div style={{ 
        flex: 1, 
        overflowY: 'auto', 
        overflowX: 'hidden',
        position: 'relative', 
        width: '100%', 
        height: '100%',
        boxSizing: 'border-box'
      }}>
        {children}
      </div>
    </div>
  );
};

export default WindowFrame;
