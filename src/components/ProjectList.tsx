import React, { useState } from 'react';
import { Project } from '../App';

interface ProjectListProps {
  projects: Project[];
  onSelectProject: (id: string) => void;
  onUpdateProjects: (projects: Project[]) => void;
  isSuperAdmin?: boolean;
  onPermanentDelete?: (id: string) => void;
}

export const ProjectList: React.FC<ProjectListProps> = ({
  projects,
  onSelectProject,
  onUpdateProjects,
  isSuperAdmin = true,
  onPermanentDelete
}) => {
  const [filter, setFilter] = useState<'active' | 'archived' | 'trash'>('active');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProjects = projects.filter((p) => {
    const matchesFilter = (p.status || 'active') === filter;
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.id || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleStatusChange = (id: string, newStatus: 'active' | 'archived' | 'trash') => {
    onUpdateProjects(
      projects.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
    );
  };

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto', color: '#1c1c1e' }}>
      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: '#f2f2f7',
          border: 'none',
          borderRadius: '10px',
          fontSize: '14px',
          outline: 'none',
          marginBottom: '12px',
          boxSizing: 'border-box'
        }}
      />

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button
          onClick={() => setFilter('active')}
          style={tabBtnStyle(filter === 'active')}
        >
          Active ({projects.filter((p) => (p.status || 'active') === 'active').length})
        </button>
        <button
          onClick={() => setFilter('archived')}
          style={tabBtnStyle(filter === 'archived')}
        >
          Archive ({projects.filter((p) => p.status === 'archived').length})
        </button>
        <button
          onClick={() => setFilter('trash')}
          style={tabBtnStyle(filter === 'trash')}
        >
          Trash ({projects.filter((p) => p.status === 'trash').length})
        </button>
      </div>

      {/* Projects List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filteredProjects.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#8e8e93', fontSize: '13px', marginTop: '20px' }}>
            No projects found.
          </div>
        ) : (
          filteredProjects.map((p, idx) => (
            <div
              key={p.id || idx}
              onClick={() => onSelectProject(p.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                backgroundColor: '#f2f2f7',
                borderRadius: '12px',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    backgroundColor: p.color || '#007aff',
                    border: '1px solid #d1d1d6'
                  }}
                />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '15px' }}>{p.name || 'Без назви'}</div>
                  <div style={{ fontSize: '12px', color: '#8e8e93' }}>ID: {p.id || 'не вказано'}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }} onClick={(e) => e.stopPropagation()}>
                {filter === 'active' && (
                  <button
                    onClick={() => handleStatusChange(p.id, 'archived')}
                    style={actionBtnStyle}
                    title="Move to Archive"
                  >
                    📦
                  </button>
                )}
                {filter === 'archived' && (
                  <button
                    onClick={() => handleStatusChange(p.id, 'active')}
                    style={actionBtnStyle}
                    title="Restore to Active"
                  >
                    ↩️
                  </button>
                )}
                {filter !== 'trash' && (
                  <button
                    onClick={() => handleStatusChange(p.id, 'trash')}
                    style={actionBtnStyle}
                    title="Move to Trash"
                  >
                    🗑️
                  </button>
                )}
                {filter === 'trash' && (
                  <>
                    <button
                      onClick={() => handleStatusChange(p.id, 'active')}
                      style={actionBtnStyle}
                      title="Restore"
                    >
                      ↩️
                    </button>
                    {onPermanentDelete && (
                      <button
                        onClick={() => onPermanentDelete(p.id)}
                        style={{ ...actionBtnStyle, color: '#ff3b30' }}
                        title="Delete Permanently"
                      >
                        ❌
                      </button>
                    )}
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

const tabBtnStyle = (active: boolean): React.CSSProperties => ({
  flex: 1,
  padding: '10px',
  backgroundColor: active ? '#007aff' : '#f2f2f7',
  color: active ? '#ffffff' : '#1c1c1e',
  border: 'none',
  borderRadius: '10px',
  fontWeight: 600,
  fontSize: '12px',
  cursor: 'pointer'
});

const actionBtnStyle: React.CSSProperties = {
  background: '#ffffff',
  border: 'none',
  borderRadius: '8px',
  padding: '6px 8px',
  fontSize: '13px',
  cursor: 'pointer'
};

export default ProjectList;
