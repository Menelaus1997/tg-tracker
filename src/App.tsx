import React, { useState } from 'react';
import { BottomNavigation } from './components/BottomNavigation';
import { CreateProject } from './components/CreateProject';
import { TabType } from './types';

interface Project {
  id: string;
  name: string;
  template: string;
  color: string;
}

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('create');
  const [projects, setProjects] = useState<Project[]>([]);

  const handleCreateProject = (newProject: Project) => {
    setProjects((prev) => [...prev, newProject]);
    setActiveTab('projects'); // Автоматичний перехід до списку проектів
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#ffffff',
      paddingBottom: '80px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {activeTab === 'create' && (
        <CreateProject onCreateProject={handleCreateProject} />
      )}

      {activeTab === 'projects' && (
        <div style={{ padding: '20px', color: '#1c1c1e', maxWidth: '500px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '16px' }}>Проекти</h2>
          {projects.length === 0 ? (
            <p style={{ color: '#8e8e93' }}>Немає створених проектів. Створіть перший на вкладці (+).</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {projects.map((prj) => (
                <div
                  key={prj.id}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    backgroundColor: '#f2f2f7',
                    borderLeft: `6px solid ${prj.color}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '16px' }}>{prj.name}</div>
                    <div style={{ fontSize: '12px', color: '#8e8e93', marginTop: '2px' }}>ID: {prj.id}</div>
                  </div>
                  <span style={{ fontSize: '12px', backgroundColor: '#e5e5ea', padding: '4px 8px', borderRadius: '6px' }}>
                    {prj.template}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'boq' && <div style={{ padding: '20px', color: '#1c1c1e' }}>Розділ Об’єми</div>}
      {activeTab === 'analytics' && <div style={{ padding: '20px', color: '#1c1c1e' }}>Розділ Аналітика</div>}
      {activeTab === 'settings' && <div style={{ padding: '20px', color: '#1c1c1e' }}>Розділ Налаштування</div>}

      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default App;
