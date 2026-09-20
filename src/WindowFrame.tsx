export const WindowFrame: React.FC<WindowFrameProps> = ({ children }) => {
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      margin: 0,
      backgroundColor: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden', // <-- ОБОВ'ЯЗКОВО має бути hidden, щоб вікно не скролилось вбік
      boxSizing: 'border-box',
    }}>
      <div style={{ 
        flex: 1, 
        overflowY: 'auto', 
        overflowX: 'hidden', // <-- ЗАБОРОНЯЄМО горизонтальний скрол для всього вмісту додатку
        width: '100%', 
        height: '100%',
        boxSizing: 'border-box'
      }}>
        {children}
      </div>
    </div>
  );
};
