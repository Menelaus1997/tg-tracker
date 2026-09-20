import React, { useState, useEffect } from 'react';
import { WindowFrame } from './WindowFrame';
import { Project, TeamMember } from './types';
// За потреби імпортуйте ваші інші компоненти:
// import { Analytics } from './components/Analytics';

export const App: React.FC = () => {
  // Ініціалізація Telegram WebApp у стандартному режимі
  useEffect(() => {
    if (window.Telegram && window.Telegram.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
    }
  }, []);

  const [activeTab, setActiveTab] = useState<number>(2); // 2 — вкладка Аналітика / Проєкти
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

  // Збереження проєктів у localStorage
  const handleUpdateProject = (updatedProject: Project) => {
    const updatedList = projects.map(p => p.id === updatedProject.id ? updatedProject : p);
    setProjects(updatedList);
    localStorage.setItem('app_projects', JSON.stringify(updatedList));
  };

  return (
    <WindowFrame>
      <div style={{ padding: '16px', maxWidth: '100%', boxSizing: 'border-box' }}>
        
        {/* Верхня панель / Заголовок додатку */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>Менеджмент проєктів</h2>
          <span style={{ fontSize: '12px', color: '#8e8e93', fontStyle: 'italic' }}>Роль: {currentRoleName}</span>
        </div>

        {/* Перемикач вкладок або рендеринг активного контенту */}
        {activeTab === 2 ? (
          <div>
            {projects.length > 0 ? (
              <div>
                {/* Тут виводяться ваші компоненти аналітики або список проєктів */}
                <p style={{ color: '#636366', fontStyle: 'italic' }}>Активний проєкт обрано. Перегляньте вкладку аналітики для деталей таймлайну.</p>
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: '#8e8e93', padding: '40px 0', fontStyle: 'italic' }}>
                Немає доступних проєктів. Створіть новий проєкт у відповідній вкладці.
              </div>
            )}
          </div>
        ) : (
          <div>
            <p>Вміст вкладки #{activeTab}</p>
          </div>
        )}

      </div>
    </WindowFrame>
  );
};

export default App;
