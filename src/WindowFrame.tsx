import React from 'react';

interface WindowFrameProps {
  children: React.ReactNode;
}

export const WindowFrame: React.FC<WindowFrameProps> = ({ children }) => {
  return (
    <div style={{
      // Ширина вікна з відступами з боків
      width: 'calc(100vw - 40px)',
      maxWidth: '1300px',
      // Висота вікна з відступами зверху та знизу (близько 20 мм / 40-50px)
      height: 'calc(100vh - 45px)',
      maxHeight: '900px',
      // Центруємо вікно: відступи зверху, знизу та по боках
      margin: '22px auto',
      backgroundColor: '#ffffff',
      border: '1px solid #d1d1d6',
      borderRadius: '16px',
      boxShadow: '0 12px 36px rgba(0, 0, 0, 0.16)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      boxSizing: 'border-box',
    }}>
      {/* Внутрішній контент зі скролом */}
      <div style={{ 
        flex: 1, 
        overflowY: 'auto', 
        overflowX: 'hidden',
        position: 'relative', 
        width: '100%', 
        height: '100%',
        boxSizing: 'border-box',
        paddingTop: '10px',
      }}>
        {children}
      </div>
    </div>
  );
};

export default WindowFrame;
