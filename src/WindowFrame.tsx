import React from 'react';

interface WindowFrameProps {
  children: React.ReactNode;
}

export const WindowFrame: React.FC<WindowFrameProps> = ({ children }) => {
  return (
    <div style={{
      // Ширина вікна (наприклад, 800px або на весь доступний простір з невеликими відступами з боків)
      width: '90%',
      maxWidth: '1100px',
      // Висота екрана мінус відступ зверху (10 мм ≈ 38px) та знизу (20 мм ≈ 76px)
      height: 'calc(100vh - 114px)',
      maxHeight: '850px',
      // Центруємо вікно по горизонталі, а зверху залишаємо акуратний відступ
      margin: '38px auto 76px auto',
      backgroundColor: '#ffffff',
      border: '1px solid #d1d1d6',
      borderRadius: '12px',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      boxSizing: 'border-box',
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
