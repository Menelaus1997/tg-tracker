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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editProjectId, setEditProjectId] = useState('');

  const handleCreateProject = (newProject: Project) => {
    setProjects((prev) => [...prev, newProject]);
    setActiveTab('projects');
  };

  const startEditing = (prj: Project) => {
    setEditingId(prj.id);
    setEditName(prj.name);
    setEditProjectId(prj.id);
  };

  const saveEditing = (originalId: string) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === originalId ? { ...p, name: editName, id: editProjectId } : p
      )
    );
    setEditingId(null);
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
              {projects.map((prj) => {
                const isEditing = editingId === prj.id;
                return (
                  <div
                    key={prj.id}
                    style={{
                      padding: '16px',
                      borderRadius: '12px',
                      backgroundColor: '#f2f2f7',
                      borderLeft: `6px solid ${prj.color}`,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                  >
                    {isEditing ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          placeholder="Назва проекта"
                          style={editInputStyle}
                        />
                        <input
                          type="text"
                          value={editProjectId}
                          onChange={(e) => setEditProjectId(e.target.value)}
                          placeholder="ID"
                          style={editInputStyle}
                        />
                        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                          <button
                            onClick={() => saveEditing(prj.id)}
                            style={{ ...btnStyle, backgroundColor: '#34c759', color: '#fff' }}
                          >
                            Зберегти
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            style={{ ...btnStyle, backgroundColor: '#e5e5ea', color: '#1c1c1e' }}
                          >
                            Скасувати
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {/* Кольорова точка */}
                          <span style={{
                            width: '14px',
                            height: '14px',
                            borderRadius: '50%',
                            backgroundColor: prj.color,
                            display: 'inline-block',
                            flexShrink: 0
                          }} />
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '16px', color: '#1c1c1e' }}>{prj.name}</div>
                            <div style={{ fontSize: '13px', color: '#8e8e93', marginTop: '2px' }}>{prj.id}</div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '12px', backgroundColor: '#e5e5ea', padding: '4px 8px', borderRadius: '6px', color: '#3a3a3c' }}>
                            {prj.template}
                          </span>
                          <button
                            onClick={() => startEditing(prj)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', padding: '4px' }}
                          >
                            ✏️
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
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

const editInputStyle: React.CSSProperties = {
  padding: '8px 10px',
  borderRadius: '8px',
  border: '1px solid #d1d1d6',
  backgroundColor: '#ffffff',
  fontSize: '14px'
};

const btnStyle: React.CSSProperties = {
  padding: '6px 12px',
  borderRadius: '8px',
  border: 'none',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer'
};

export default App;
