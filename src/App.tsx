import React, { useState, useEffect } from 'react';
import { BottomNavigation } from './components/BottomNavigation';
import { CreateProject } from './components/CreateProject';
import { ProjectDetail } from './components/ProjectDetail';
import { TabType } from './types';

export interface CustomField {
  id: string;
  name: string;
  unit: string;
}

export interface SubStage {
  id: string;
  title: string;
  completed: boolean;
}

export interface Stage {
  id: string;
  title: string;
  subStages: SubStage[];
}

export interface Project {
  uid: string;
  id: string;
  name: string;
  template: string;
  color: string;
  status: 'active' | 'archived' | 'deleted';
  generalInfoList?: string[];
  customFields: CustomField[];
  stages: Stage[];
}

export interface SavedTemplate {
  id: string;
  name: string;
  stages: Stage[];
  customFields: CustomField[];
}

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('create');
  
  // Автоматична коригувальна завантаження зі зняттям блокувань
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const saved = localStorage.getItem('app_projects');
      if (!saved) return [];
      const parsed: any[] = JSON.parse(saved);

      // Примусово створюємо унікальний uid для кожного об'єкта
      return parsed.map((p, idx) => ({
        ...p,
        uid: p.uid || `${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 5)}`
      }));
    } catch (e) {
      return [];
    }
  });

  const [templates, setTemplates] = useState<SavedTemplate[]>(() => {
    try {
      const saved = localStorage.getItem('app_templates');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [selectedProjectUid, setSelectedProjectUid] = useState<string | null>(null);
  const [showTemplatesArchive, setShowTemplatesArchive] = useState<boolean>(false);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'archive' | 'delete' | 'permanent_delete' | null;
    projectUid: string | null;
  }>({ isOpen: false, type: null, projectUid: null });

  useEffect(() => {
    localStorage.setItem('app_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('app_templates', JSON.stringify(templates));
  }, [templates]);

  const handleCreateProject = (newProj: { id: string; name: string; template: string; color: string }) => {
    const selectedTemplateObj = templates.find(t => t.id === newProj.template);
    
    const created: Project = {
      ...newProj,
      uid: `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      status: 'active',
      generalInfoList: [],
      customFields: selectedTemplateObj ? JSON.parse(JSON.stringify(selectedTemplateObj.customFields)) : [],
      stages: selectedTemplateObj ? JSON.parse(JSON.stringify(selectedTemplateObj.stages)) : []
    };
    setProjects((prev) => [...prev, created]);
    setActiveTab('projects');
  };

  const handleSaveAsTemplate = (name: string, stages: Stage[], customFields: CustomField[]) => {
    const newTemplate: SavedTemplate = {
      id: Date.now().toString(),
      name,
      stages: JSON.parse(JSON.stringify(stages)),
      customFields: JSON.parse(JSON.stringify(customFields))
    };
    setTemplates((prev) => [...prev, newTemplate]);
  };

  const handleDeleteTemplate = (templateId: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== templateId));
  };

  const openConfirm = (type: 'archive' | 'delete' | 'permanent_delete', projectUid: string) => {
    setConfirmModal({ isOpen: true, type, projectUid });
  };

  // Виправлена функція видалення (без заблокованих перевірок)
  const handleConfirmAction = () => {
    const { type, projectUid } = confirmModal;
    if (!projectUid || !type) return;

    if (type === 'permanent_delete') {
      setProjects((prev) => prev.filter((p) => p.uid !== projectUid));
    } else {
      setProjects((prev) =>
        prev.map((p) => (p.uid === projectUid ? { ...p, status: type === 'delete' ? 'deleted' : 'archived' } : p))
      );
    }

    setConfirmModal({ isOpen: false, type: null, projectUid: null });
  };

  const restoreProject = (uid: string) => {
    setProjects((prev) =>
      prev.map((p) => (p.uid === uid ? { ...p, status: 'active' } : p))
    );
  };

  // Функція ручного примусового очищення кешу проектів
  const handleClearProjectsCache = () => {
    if (window.confirm('Ви дійсно бажаєте повністю очистити кеш проектів?')) {
      setProjects([]);
      localStorage.removeItem('app_projects');
    }
  };

  const activeProjects = projects.filter((p) => p.status === 'active');
  const archivedProjects = projects.filter((p) => p.status === 'archived');
  const deletedProjects = projects.filter((p) => p.status === 'deleted');

  const selectedProject = projects.find((p) => p.uid === selectedProjectUid);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#ffffff',
      paddingBottom: '80px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {activeTab === 'create' && (
        <CreateProject 
          onCreateProject={handleCreateProject} 
          availableTemplates={templates}
        />
      )}

      {activeTab === 'projects' && (
        selectedProject ? (
          <ProjectDetail
            project={selectedProject}
            onUpdateProject={(updated) => {
              setProjects((prev) => prev.map((p) => (p.uid === updated.uid ? updated : p)));
            }}
            onSaveAsTemplate={handleSaveAsTemplate}
            onBack={() => setSelectedProjectUid(null)}
          />
        ) : (
          <div style={{ padding: '20px', color: '#1c1c1e', maxWidth: '500px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '16px' }}>Проекти</h2>

            {/* Активні проекти */}
            {activeProjects.length === 0 ? (
              <p style={{ color: '#8e8e93' }}>Немає активних проектів.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {activeProjects.map((prj) => (
                  <div
                    key={prj.uid}
                    style={{
                      padding: '16px',
                      borderRadius: '12px',
                      backgroundColor: '#f2f2f7',
                      display: 'flex',
                      justify: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div 
                      onClick={() => setSelectedProjectUid(prj.uid)}
                      style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', flex: 1 }}
                    >
                      <span style={{
                        width: '20px',
                        height: '20px',
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

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <button onClick={() => openConfirm('archive', prj.uid)} style={iconBtnStyle} title="Архівувати">📦</button>
                      <button onClick={() => openConfirm('delete', prj.uid)} style={iconBtnStyle} title="У корзину">🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Архів проектів */}
            {archivedProjects.length > 0 && (
              <div style={{ marginTop: '30px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#8e8e93', marginBottom: '10px' }}>📦 Архів проектів</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {archivedProjects.map((prj) => (
                    <div key={prj.uid} style={{ padding: '12px 16px', backgroundColor: '#f9f9f9', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.8 }}>
                      <div onClick={() => setSelectedProjectUid(prj.uid)} style={{ cursor: 'pointer' }}>
                        <span style={{ fontWeight: 600 }}>{prj.name}</span> <span style={{ fontSize: '12px', color: '#8e8e93' }}>({prj.id})</span>
                      </div>
                      <button onClick={() => restoreProject(prj.uid)} style={smallBtnStyle}>Розархівувати</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Корзина */}
            {deletedProjects.length > 0 && (
              <div style={{ marginTop: '30px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#ff3b30', marginBottom: '10px' }}>🗑️ Корзина</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {deletedProjects.map((prj) => (
                    <div key={prj.uid} style={{ padding: '12px 16px', backgroundColor: '#fff0f0', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontWeight: 600 }}>{prj.name}</span> <span style={{ fontSize: '12px', color: '#8e8e93' }}>({prj.id})</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button onClick={() => restoreProject(prj.uid)} style={{ ...smallBtnStyle, backgroundColor: '#34c759', color: '#fff' }}>Відновити</button>
                        <button onClick={() => openConfirm('permanent_delete', prj.uid)} style={iconBtnStyle} title="Видалити остаточно">🗑️</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Архів шаблонів */}
            <div style={{ marginTop: '30px', borderTop: '1px solid #e5e5ea', paddingTop: '16px' }}>
              <button
                onClick={() => setShowTemplatesArchive(!showTemplatesArchive)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#007aff',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>{showTemplatesArchive ? '▼' : '►'}</span>
                <span>📁 Архів шаблонів ({templates.length})</span>
              </button>

              {showTemplatesArchive && (
                <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {templates.length === 0 ? (
                    <div style={{ fontSize: '13px', color: '#8e8e93', paddingLeft: '16px' }}>Немає збережених шаблонів</div>
                  ) : (
                    templates.map((tmpl) => (
                      <div
                        key={tmpl.id}
                        style={{
                          padding: '10px 14px',
                          backgroundColor: '#f2f2f7',
                          borderRadius: '8px',
                          display: 'flex',
                          justify: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <span style={{ fontSize: '14px', fontWeight: 500 }}>{tmpl.name}</span>
                        <button
                          onClick={() => handleDeleteTemplate(tmpl.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}
                          title="Видалити шаблон"
                        >
                          🗑️
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Кнопка екстреного скидання кешу проектів */}
            <div style={{ marginTop: '24px', textAlign: 'center' }}>
              <button
                onClick={handleClearProjectsCache}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#8e8e93',
                  fontSize: '12px',
                  textDecoration: 'underline',
                  cursor: 'pointer'
                }}
              >
                Очистити всі завислі проекти (Скинути кеш)
              </button>
            </div>

          </div>
        )
      )}

      {/* Модальне вікно підтвердження */}
      {confirmModal.isOpen && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h3 style={{ marginTop: 0, fontSize: '18px' }}>
              {confirmModal.type === 'archive' && 'Архівувати проект?'}
              {confirmModal.type === 'delete' && 'Перемістити проект в корзину?'}
              {confirmModal.type === 'permanent_delete' && 'Видалити проект безповоротно?'}
            </h3>
            
            <p style={{ fontSize: '14px', color: '#636366' }}>
              {confirmModal.type === 'archive' && 'Проект буде перенесено в архів.'}
              {confirmModal.type === 'delete' && 'Проект потрапить у корзину.'}
              {confirmModal.type === 'permanent_delete' && 'Проект буде повністю видалено з пам’яті.'}
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => setConfirmModal({ isOpen: false, type: null, projectUid: null })} style={{ ...modalBtnStyle, backgroundColor: '#e5e5ea', color: '#1c1c1e' }}>Скасувати</button>
              <button 
                onClick={handleConfirmAction} 
                style={{ 
                  ...modalBtnStyle, 
                  backgroundColor: confirmModal.type === 'permanent_delete' || confirmModal.type === 'delete' ? '#ff3b30' : '#007aff', 
                  color: '#ffffff',
                  cursor: 'pointer'
                }}
              >
                Підтвердити
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'boq' && <div style={{ padding: '20px', color: '#1c1c1e' }}>Розділ Об’єми</div>}
      {activeTab === 'analytics' && <div style={{ padding: '20px', color: '#1c1c1e' }}>Розділ Аналітика</div>}
      {activeTab === 'settings' && <div style={{ padding: '20px', color: '#1c1c1e' }}>Розділ Налаштування</div>}

      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

const iconBtnStyle: React.CSSProperties = { background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', padding: '4px' };
const smallBtnStyle: React.CSSProperties = { padding: '4px 8px', borderRadius: '6px', border: 'none', backgroundColor: '#e5e5ea', fontSize: '12px', cursor: 'pointer' };
const modalOverlayStyle: React.CSSProperties = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 };
const modalContentStyle: React.CSSProperties = { backgroundColor: '#ffffff', padding: '20px', borderRadius: '14px', maxWidth: '360px', width: '90%', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' };
const modalBtnStyle: React.CSSProperties = { padding: '8px 14px', borderRadius: '8px', border: 'none', fontWeight: 600, fontSize: '14px' };

export default App;
