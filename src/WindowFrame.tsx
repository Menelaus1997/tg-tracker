import React from 'react';

interface WindowFrameProps {
  children: React.ReactNode;
}

export const WindowFrame: React.FC<WindowFrameProps> = ({ children }) => {
  return (
    <div style={{
      width: '100%',
      // Використовуємо 100vh, але додаємо внутрішні відступи (padding), 
      // щоб на Windows залишався простір знизу для панелі завдань, а зверху — для кнопок Telegram
      height: '100vh',
      maxHeight: '100vh',
      borderRadius: 0,
      margin: 0,
      backgroundColor: '#ffffff',
      border: 'none',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      boxSizing: 'border-box',
      // Надійний відступ зверху, щоб мобільні кнопки (3 точки/хрестик) нічого не перекривали
      paddingTop: '75px',
      // Відступ знизу, щоб на Windows завжди залишалося місце для панелі завдань та нижнього меню
      paddingBottom: '50px',
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
