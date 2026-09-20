import React from 'react';

interface WindowFrameProps {
  children: React.ReactNode;
}

export const WindowFrame: React.FC<WindowFrameProps> = ({ children }) => {
  return (
    <div style={{
      // Робимо вікно на весь доступний простір робочої площини (номер 1)
      width: '100vw',
      height: '100vh',
      maxWidth: 'none',
      maxHeight: 'none',
      borderRadius: 0,
      margin: 0,
      backgroundColor: '#ffffff',
      border: 'none',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      boxSizing: 'border-box',
    }}>
      {/* Вміст додатку тепер розтягується на всю площину (номер 2 дорівнює номеру 1) */}
      <div style={{ 
        flex: 1, 
        overflowY: 'auto', 
        overflowX: 'hidden',
        position: 'relative', 
        width: '100%', 
        height: '100%',
        boxSizing: 'border-box',
        padding: 0,
      }}>
        {children}
      </div>
    </div>
  );
};

export default WindowFrame;
