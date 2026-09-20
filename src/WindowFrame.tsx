import React from 'react';

interface WindowFrameProps {
  children: React.ReactNode;
}

export const WindowFrame: React.FC<WindowFrameProps> = ({ children }) => {
  return (
    <div style={{
      width: '100%',
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
      // Робимо відступ зверху, щоб системні кнопки Telegram (3 точки та хрестик) нічого не перекривали
      paddingTop: '44px', 
    }}>
      {/* Вміст програми з відступом під системні кнопки */}
      <div style={{ flex: 1, overflowY: 'auto', position: 'relative', width: '100%', height: '100%' }}>
        {children}
      </div>
    </div>
  );
};

export default WindowFrame;
