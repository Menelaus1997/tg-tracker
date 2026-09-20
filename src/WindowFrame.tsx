import React from 'react';

interface WindowFrameProps {
  children: React.ReactNode;
}

export const WindowFrame: React.FC<WindowFrameProps> = ({ children }) => {
  return (
    <div style={{
      width: '100%',
      // Використовуємо висоту вікна мінус невеликий запас знизу, щоб на Windows завжди залишалася видима панель завдань
      height: 'calc(100vh - 40px)',
      maxHeight: 'calc(100vh - 40px)',
      borderRadius: 0,
      margin: 0,
      backgroundColor: '#ffffff',
      border: 'none',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      boxSizing: 'border-box',
      // Збільшуємо відступ зверху, щоб інтерфейс не налізав на кнопки "Закрити / Стрілочка" в Telegram на телефоні
      paddingTop: '60px',
      paddingBottom: '10px',
    }}>
      {/* Вміст програми */}
      <div style={{ flex: 1, overflowY: 'auto', position: 'relative', width: '100%', height: '100%' }}>
        {children}
      </div>
    </div>
  );
};

export default WindowFrame;
