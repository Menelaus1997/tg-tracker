import React from 'react';

interface WindowFrameProps {
  children: React.ReactNode;
}

export const WindowFrame: React.FC<WindowFrameProps> = ({ children }) => {
  return (
    <div style={{
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
      boxSizing: 'border-box'
    }}>
      {/* Вміст програми на весь екран без зайвих панелей */}
      <div style={{ flex: 1, overflowY: 'auto', position: 'relative', width: '100%', height: '100%' }}>
        {children}
      </div>
    </div>
  );
};

export default WindowFrame;
