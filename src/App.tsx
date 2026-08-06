import React, { useState } from 'react';
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
  id: string;
  name: string;
  template: string;
  color: string;
  status: 'active' | 'archived' | 'deleted';
  customFields: CustomField[];
  stages: Stage[];
}

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('create');
  const [projects, setProjects] = useState<Project[]>([]);
  const [isAdmin] = useState<boolean>(true); // Права адміна
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Модальні вікна підтвердження
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'archive' | 'delete' | null;
    projectId: string | null;
  }>({ isOpen: false, type: null, projectId: null });

  // Створення проекту
  const handleCreateProject = (newProj: { id: string; name: string; template: string; color: string }) => {
    const created: Project = {
      ...newProj,
      status: 'active',
      customFields: [{ id: '1', name: '', unit: '' }],
      stages: []
    };
    setProjects((prev) => [...prev, created]);
    setActiveTab('projects');
  };

  // Відкриття підтвердження
  const openConfirm = (type: 'archive' | 'delete', projectId: string) => {
    setConfirmModal({ isOpen: true, type, projectId });
  };

  // Підтвердження дії (Архів або Видалення)
  const handleConfirmAction = () => {
    const { type, projectId } = confirmModal;
    if (!projectId || !type) return;

    if (type === 'delete' && !isAdmin) {
      alert('Тільки адміністратор має права для видалення проектів!');
      setConfirmModal({ isOpen: false, type: null, projectId: null });
      return;
    }

    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId) {
          return { ...p, status: type === 'delete' ? 'deleted' : 'archived' };
        }
        return p;
      })
    );

    setConfirmModal({ isOpen: false, type: null, projectId: null });
  };

  // Відновлення з корзини/архіву
  const restoreProject = (id: string) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'active' } : p))
    );
  };

  const activeProjects = projects.filter((p) => p.status === 'active');
  const archivedProjects = projects.filter((p) => p.status === 'archived');
  const deletedProjects = projects.filter((p) => p.status === 'deleted');

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

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

      {/* Вкладка проектів */}
      {activeTab === 'projects' && (
        selectedProject ? (
          /* Якщо проект обрано — показуємо детальний перегляд із полями та стадіями */
          <ProjectDetail
            project={selectedProject}
            onUpdateProject={(updated) => {
              setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
            }}
            onBack={() => setSelectedProjectId(null)}
          />
        ) : (
          /* Якщо проект не обрано — показуємо загальний список */
          <div style={{ padding: '20px', color: '#1c1c1e', maxWidth: '500px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '16px' }}>Проекти</h2>

            {/* Список активних проектів */}
            {activeProjects.length === 0 ? (
              <p style={{ color: '#8e8e93' }}>Немає активних проектів.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {activeProjects.map((prj) => (
                  <div
                    key={prj.id}
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
                      onClick={() => setSelectedProjectId(prj.id)}
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
                      <button
                        onClick={() => setSelectedProjectId(prj.id)}
                        title="Редагувати вміст"
                        style={iconBtnStyle}
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => openConfirm('archive', prj.id)}
                        title="Архівувати проект"
                        style={iconBtnStyle}
                      >
                        📦
                      </button>
                      <button
                        onClick={() => openConfirm('delete', prj.id)}
                        title="Видалити проект"
                        style={iconBtnStyle}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Блок архівних проектів */}
            {archivedProjects.length > 0 && (
              <div style={{ marginTop: '30px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#8e8e93', marginBottom: '10px' }}>📦 Архів проектів (зафіксовані)</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {archivedProjects.map((prj) => (
                    <div key={prj.id} style={{ padding: '12px 16px', backgroundColor: '#f9f9f9', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.8 }}>
                      <div onClick={() => setSelectedProjectId(prj.id)} style={{ cursor: 'pointer' }}>
                        <span style={{ fontWeight: 600 }}>{prj.name}</span> <span style={{ fontSize: '12px', color: '#8e8e93' }}>({prj.id})</span>
                      </div>
                      <button onClick={() => restoreProject(prj.id)} style={smallBtnStyle}>Розархівувати</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Блок Корзини */}
            {deletedProjects.length > 0 && (
              <div style={{ marginTop: '30px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#ff3b30', marginBottom: '10px' }}>🗑️ Корзина (Видалені об’єкти)</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {deletedProjects.map((prj) => (
                    <div key={prj.id} style={{ padding: '12px 16px', backgroundColor: '#fff0f0', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontWeight: 600 }}>{prj.name}</span> <span style={{ fontSize: '12px', color: '#8e8e93' }}>({prj.id})</span>
                      </div>
                      <button onClick={() => restoreProject(prj.id)} style={{ ...smallBtnStyle, backgroundColor: '#34c759', color: '#fff' }}>Відновити</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      )}

      {/* Модальне вікно підтвердження */}
      {confirmModal.isOpen && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h3 style={{ marginTop: 0, fontSize: '18px' }}>
              {confirmModal.type === 'archive' ? 'Архівувати проект?' : 'Видалити проект в корзину?'}
            </h3>
            <p style={{ fontSize: '14px', color: '#636366' }}>
              {confirmModal.type === 'archive'
                ? 'Проект буде перенесено в архів. Всі дані зафіксуються без можливості редагування.'
                : 'Ви впевнені? Проект потрапить у корзину і його можна буде відновити лише адміністратором.'}
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button
                onClick={() => setConfirmModal({ isOpen: false, type: null, projectId: null })}
                style={{ ...modalBtnStyle, backgroundColor: '#e5e5ea', color: '#1c1c1e' }}
              >
                Скасувати
              </button>
              <button
                onClick={handleConfirmAction}
                style={{
                  ...modalBtnStyle,
                  backgroundColor: confirmModal.type === 'delete' ? '#ff3b30' : '#007aff',
                  color: '#ffffff'
                }}
              >
                Так, підтверджую
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

const iconBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontSize: '18px',
  padding: '4px'
};

const smallBtnStyle: React.CSSProperties = {
  padding: '4px 8px',
  borderRadius: '6px',
  border: 'none',
  backgroundColor: '#e5e5ea',
  fontSize: '12px',
  cursor: 'pointer'
};

const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.4)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 2000
};

const modalContentStyle: React.CSSProperties = {
  backgroundColor: '#ffffff',
  padding: '20px',
  borderRadius: '14px',
  maxWidth: '360px',
  width: '90%',
  boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
};

const modalBtnStyle: React.CSSProperties = {
  padding: '8px 14px',
  borderRadius: '8px',
  border: 'none',
  fontWeight: 600,
  fontSize: '14px',
  cursor: 'pointer'
};

export default App;
