import React from 'react';

interface WindowFrameProps {
  children: React.ReactNode;
}

export const WindowFrame: React.FC<WindowFrameProps> = ({ children }) => {
  return (
    <div style={{
      width: '100%',
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
      // Збільшуємо відступ зверху ще на кілька пікселів для комфортного відступу від системних кнопок на телефоні
      paddingTop: '90px',
      // Відступ знизу, щоб залишався простір для панелі завдань та нижнього меню
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
