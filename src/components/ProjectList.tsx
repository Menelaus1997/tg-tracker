import React, { useState } from 'react';
import { Project } from '../App';

interface ProjectListProps {
  projects: Project[];
  onSelectProject: (id: string) => void;
  onUpdateProjects: (projects: Project[]) => void;
  isSuperAdmin: boolean;
  onPermanentDelete: (id: string) => void;
}

export const ProjectList: React.FC<ProjectListProps> = ({
  projects,
  onSelectProject,
  onUpdateProjects,
  isSuperAdmin,
  onPermanentDelete
}) => {
  const [filterStatus, setFilterStatus] = useState<'active' | 'archived' | 'trash'>('active');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProjects = projects.filter((p) => {
    const statusMatch = filterStatus === 'active' ? (p.status === 'active' || !p.status) : p.status === filterStatus;
    const query = searchQuery.toLowerCase().trim();
    const nameMatch = p.name.toLowerCase().includes(query);
    const idMatch = p.id.toLowerCase().includes(query);

    return statusMatch && (nameMatch || idMatch);
  });

  const handleSetStatus = (e: React.MouseEvent, projectId: string, status: 'active' | 'archived' | 'trash') => {
    e.stopPropagation();
    onUpdateProjects(
      projects.map((p) => (p.id === projectId ? { ...p, status } : p))
    );
  };

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto', color: '#1c1c1e' }}>
      
      {/* Строка пошуку без символу лупи */}
      <div style={{ marginBottom: '12px' }}>
        <input
          type="text"
          placeholder="Пошук"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 12px',
            backgroundColor: '#f2f2f7',
            border: 'none',
            borderRadius: '10px',
            fontSize: '14px',
            outline: 'none',
            boxSizing: 'border-box'
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button
          onClick={() => setFilterStatus('active')}
          style={filterBtnStyle(filterStatus === 'active')}
        >
          Активні ({projects.filter((p) => p.status === 'active' || !p.status).length})
        </button>
        <button
          onClick={() => setFilterStatus('archived')}
          style={filterBtnStyle(filterStatus === 'archived')}
        >
          Архів ({projects.filter((p) => p.status === 'archived').length})
        </button>
        {isSuperAdmin && (
          <button
            onClick={() => setFilterStatus('trash')}
            style={filterBtnStyle(filterStatus === 'trash')}
          >
            Кошик ({projects.filter((p) => p.status === 'trash').length})
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filteredProjects.length === 0 ? (
          <div style={{ fontSize: '14px', color: '#8e8e93', textAlign: 'center', marginTop: '20px' }}>
            Нічого не знайдено.
          </div>
        ) : (
          filteredProjects.map((p) => (
            <div
              key={p.id}
              onClick={() => onSelectProject(p.id)}
              style={{
                padding: '12px 14px',
                borderRadius: '12px',
                backgroundColor: '#f2f2f7',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: p.color || '#007aff',
                    flexShrink: 0
                  }}
                />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '15px' }}>{p.name}</div>
                  <div style={{ fontSize: '12px', color: '#8e8e93' }}>ID: {p.id}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                {filterStatus === 'active' && (
                  <button
                    onClick={(e) => handleSetStatus(e, p.id, 'archived')}
                    style={actionBtnStyle}
                    title="В архів"
                  >
                    📦
                  </button>
                )}
                {filterStatus !== 'trash' && (
                  <button
                    onClick={(e) => handleSetStatus(e, p.id, 'trash')}
                    style={{ ...actionBtnStyle, color: '#ff3b30' }}
                    title="У кошик"
                  >
                    🗑️
                  </button>
                )}
                {filterStatus === 'trash' && isSuperAdmin && (
                  <>
                    <button
                      onClick={(e) => handleSetStatus(e, p.id, 'active')}
                      style={actionBtnStyle}
                      title="Відновити"
                    >
                      ↩️
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Видалити проект назавжди разом із гілкою у Telegram?')) {
                          onPermanentDelete(p.id);
                        }
                      }}
                      style={{ ...actionBtnStyle, backgroundColor: '#ff3b30', color: '#fff' }}
                      title="Видалити остаточно"
                    >
                      ✕
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const filterBtnStyle = (active: boolean): React.CSSProperties => ({
  flex: 1,
  padding: '8px',
  borderRadius: '8px',
  border: 'none',
  backgroundColor: active ? '#007aff' : '#f2f2f7',
  color: active ? '#ffffff' : '#1c1c1e',
  fontWeight: 600,
  fontSize: '12px',
  cursor: 'pointer'
});

const actionBtnStyle: React.CSSProperties = {
  background: '#ffffff',
  border: 'none',
  borderRadius: '6px',
  padding: '4px 8px',
  fontSize: '12px',
  cursor: 'pointer'
};

export default ProjectList;
