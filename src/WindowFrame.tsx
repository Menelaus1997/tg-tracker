import React from 'react';

interface WindowFrameProps {
  children: React.ReactNode;
}

export const WindowFrame: React.FC<WindowFrameProps> = ({ children }) => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      margin: 0,
      padding: 0,
      backgroundColor: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      boxSizing: 'border-box',
    }}>
      <div style={{ 
        flex: 1, 
        minHeight: 0, // Обов'язково для коректного скролу у flex-контейнері
        overflowY: 'auto', 
        overflowX: 'hidden', 
        width: '100%', 
        boxSizing: 'border-box',
        position: 'relative'
      }}>
        {children}
      </div>
    </div>
  );
};

export default WindowFrame;
