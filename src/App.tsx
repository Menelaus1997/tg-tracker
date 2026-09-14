import React, { useState } from 'react';
import ProjectList from './components/ProjectList';
import ProjectDetail from './components/ProjectDetail';

export interface Stage {
  id: string;
  title: string;
  subStages: { id: string; title: string; completed: boolean }[];
  startDate?: string;
  endDate?: string;
  reviewDate?: string;
  correctionDate?: string;
  contractors?: string[];
  currentStatus?: string;
}

export interface Project {
  id: string;
  name: string;
  color?: string;
  status?: 'active' | 'archived' | 'trash';
  stages: Stage[];
  passportRows?: any[];
  customStatuses?: any[];
  [key: string]: any;
}

export interface TeamMember {
  id: string;
  fullName: string;
}

export const App: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([
    {
      id: 'DES-26.05-01',
      name: 'ЖК Паркові озера',
      color: '#34c759',
      status: 'active',
      stages: [
        {
          id: 's1',
          title: 'Концепція',
          startDate: '2026-05-10',
          endDate: '2026-06-30',
          subStages: [
            { id: 'sub1', title: 'Збір референсів', completed: true },
            { id: 'sub2', title: 'Первинне планування', completed: false }
          ],
          contractors: ['Олександр (Дизайнер)']
        }
      ]
    }
  ]);

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'create' | 'projects' | 'team' | 'settings'>('create');
  
  // Стани для створення нового проєкту
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectId, setNewProjectId] = useState('');
  const [newProjectColor, setNewProjectColor] = useState('#34c759');

  const teamDatabase: TeamMember[] = [
    { id: '1', fullName: 'Олександр' },
    { id: '2', fullName: 'Марія' }
  ];
  const availableRoles = ['Дизайнер', 'Архітектор', 'Керівник'];

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  const handleUpdateProject = (updated: Project) => {
    setProjects(projects.map(p => p.id === updated.id ? updated : p));
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    const createdProject: Project = {
      id: newProjectId.trim() || `DES-${Date.now().toString().slice(-6)}`,
      name: newProjectName.trim(),
      color: newProjectColor,
      status: 'active',
      stages: [
        {
          id: Date.now().toString(),
          title: 'Етап 1',
          subStages: [{ id: 'sub-1', title: 'Головна задача', completed: false }],
          contractors: []
        }
      ]
    };

    setProjects([createdProject, ...projects]);
    setNewProjectName('');
    setNewProjectId('');
    setSelectedProjectId(createdProject.id);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', paddingBottom: '70px', boxSizing: 'border-box', fontFamily: "'SF Pro Condensed', -apple-system, sans-serif" }}>
      {/* Header */}
      <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e5ea' }}>
        <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', fontStyle: 'italic', color: '#1c1c1e' }}>
          Design Tracker Bot
        </h2>
      </div>

      {/* Content */}
      <div style={{ paddingBottom: '20px' }}>
        {selectedProjectId && selectedProject ? (
          <ProjectDetail
            project={selectedProject}
            onUpdateProject={handleUpdateProject}
            onSaveAsTemplate={() => {}}
            onBack={() => setSelectedProjectId(null)}
            teamDatabase={teamDatabase}
            availableRoles={availableRoles}
          />
        ) : activeTab === 'create' ? (
          <div style={{ padding: '16px', maxWidth: '400px', margin: '0 auto' }}>
            <form onSubmit={handleCreateProject} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', color: '#636366', marginBottom: '2px', display: 'block', fontStyle: 'italic' }}>
                  Назва проекту
                </label>
                <input
                  type="text"
                  placeholder="Введіть назву проекту"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  style={{ width: '100%', padding: '8px', backgroundColor: '#e5e5ea', border: '1px solid #d1d1d6', borderRadius: '6px', fontSize: '12px', fontStyle: 'italic', boxSizing: 'border-box', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', color: '#636366', marginBottom: '2px', display: 'block', fontStyle: 'italic' }}>
                  ID проекту
                </label>
                <input
                  type="text"
                  placeholder="Введіть ID проекту"
                  value={newProjectId}
                  onChange={(e) => setNewProjectId(e.target.value)}
                  style={{ width: '100%', padding: '8px', backgroundColor: '#e5e5ea', border: '1px solid #d1d1d6', borderRadius: '6px', fontSize: '12px', fontStyle: 'italic', boxSizing: 'border-box', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', color: '#636366', marginBottom: '2px', display: 'block', fontStyle: 'italic' }}>
                  Шаблон
                </label>
                <select
                  style={{ width: '100%', padding: '8px', backgroundColor: '#e5e5ea', border: '1px solid #d1d1d6', borderRadius: '6px', fontSize: '12px', fontStyle: 'italic', boxSizing: 'border-box', outline: 'none', cursor: 'pointer' }}
                >
                  <option value="general">Загальний шаблон (кастомний)</option>
                </select>
              </div>

              <button
                type="submit"
                style={{ width: '100%', padding: '10px', backgroundColor: '#007aff', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontStyle: 'italic', fontSize: '12px', cursor: 'pointer', marginTop: '8px' }}
              >
                Додати проект
              </button>

              <div style={{ textAlign: 'center', marginTop: '4px' }}>
                <span style={{ fontSize: '11px', color: '#007aff', cursor: 'pointer', fontStyle: 'italic', textDecoration: 'underline' }}>
                  Архів шаблонів
                </span>
              </div>
            </form>
          </div>
        ) : activeTab === 'projects' ? (
          <div style={{ padding: '16px', maxWidth: '500px', margin: '0 auto' }}>
            <ProjectList
              projects={projects}
              onSelectProject={(id) => setSelectedProjectId(id)}
              onUpdateProjects={(updatedList) => setProjects(updatedList)}
              onPermanentDelete={(id) => setProjects(projects.filter(p => p.id !== id))}
            />
          </div>
        ) : (
          <div style={{ padding: '20px', textAlign: 'center', color: '#8e8e93', fontStyle: 'italic' }}>
            Розділ в розробці...
          </div>
        )}
      </div>

      {/* Нижній навігаційний бар (як на скріншоті) */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: '60px', backgroundColor: '#ffffff', borderTop: '1px solid #e5e5ea', display: 'flex', justifyContent: 'space-around', alignItems: 'center', zIndex: 1000 }}>
        <button onClick={() => setActiveTab('create')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: activeTab === 'create' ? '#007aff' : '#8e8e93' }}>➕</button>
        <button onClick={() => setActiveTab('projects')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: activeTab === 'projects' ? '#007aff' : '#8e8e93' }}>📁</button>
        <button onClick={() => setActiveTab('team')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#8e8e93' }}>👥</button>
        <button onClick={() => setActiveTab('settings')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#8e8e93' }}>⚙️</button>
      </div>
    </div>
  );
};

export default App;
