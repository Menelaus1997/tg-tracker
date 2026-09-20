import React, { useState, useEffect } from 'react';
import { WindowFrame } from './WindowFrame';
import { Project, TeamMember } from './types';
// Тут імпортуйте решту ваших компонентів (наприклад, Analytics, Projects тощо)

export const App: React.FC = () => {
  // Ініціалізація Telegram WebApp у віконному режимі (без примусового розгортання)
  useEffect(() => {
    if (window.Telegram && window.Telegram.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
    }
  }, []);

  const [activeTab, setActiveTab] = useState<number>(2);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [currentRoleName, setCurrentRoleName] = useState<string>('Керівник');
  
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => {
    const saved = localStorage.getItem('app_team');
    return saved ? JSON.parse(saved) : [];
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('app_projects');
    return saved ? JSON.parse(saved) : [];
  });

  return (
    <WindowFrame>
      {/* Тут знаходиться весь інтерфейс вашого додатку та ваші вкладки */}
      <div style={{ padding: '16px', maxWidth: '100%', boxSizing: 'border-box' }}>
        
        {/* Ваш поточний інтерфейс перемикання вкладок / компонентів */}
        {activeTab === 2 && (
          <div>
            {/* Вміст вашої поточної вкладки */}
            <h1>Менеджмент проєктів</h1>
          </div>
        )}

      </div>
    </WindowFrame>
  );
};

export default App;
