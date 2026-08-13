import React, { useState } from 'react';
import { Project } from '../App';

interface ProjectListProps {
  projects: Project[];
  onSelectProject: (id: string) => void;
  onUpdateProjects: (projects: Project[]) => void;
  isSuperAdmin?: boolean;
  onPermanentDelete?: (id: string) => void;
}

// Допоміжна функція для форматування дати у формат ДД.ММ
const formatDateShort = (dateStr?: string) => {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d}.${m}`;
};

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
    <div style={{ padding: '16px', maxWidth: '500px', margin: '0 auto', color: '#1c1c1e', fontFamily: "'SF Pro Condensed', -apple-system, sans-serif", fontSize: '11px', lineHeight: 1 }}>
      {/* Search Bar */}
      <input
        type="text"
        placeholder="Пошук..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          width: '100%',
          height: '36px',
          padding: '0 12px',
          backgroundColor: '#f2f2f7',
          border: '1px solid #d1d1d6',
          borderRadius: '10px',
          fontSize: '11px',
          fontStyle: 'italic',
          outline: 'none',
          marginBottom: '12px',
          boxSizing: 'border-box',
          color: '#1c1c1e',
          lineHeight: 1
        }}
      />

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button
          onClick={() => setFilter('active')}
          style={tabBtnStyle(filter === 'active')}
        >
          Активні ({projects.filter((p) => (p.status || 'active') === 'active').length})
        </button>
        <button
          onClick={() => setFilter('archived')}
          style={tabBtnStyle(filter === 'archived')}
        >
          Архів ({projects.filter((p) => p.status === 'archived').length})
        </button>
        <button
          onClick={() => setFilter('trash')}
          style={tabBtnStyle(filter === 'trash')}
        >
          Кошик ({projects.filter((p) => p.status === 'trash').length})
        </button>
      </div>

      {/* Projects List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filteredProjects.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#8e8e93', fontSize: '11px', fontStyle: 'italic', marginTop: '20px', lineHeight: 1 }}>
            Проєктів не знайдено.
          </div>
        ) : (
          filteredProjects.map((p, idx) => {
            const firstStage = p.stages && p.stages[0];
            const lastStage = p.stages && p.stages[p.stages.length - 1];
            const startDateStr = firstStage ? firstStage.startDate : '';
            const endDateStr = lastStage ? ((lastStage as any).reviewDate || lastStage.endDate) : '';

            return (
              <div
                key={p.id || idx}
                onClick={() => onSelectProject(p.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  backgroundColor: '#f2f2f7',
                  borderRadius: '10px',
                  border: '1px solid #e5e5ea',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '14px',
                      height: '14px',
                      borderRadius: '50%',
                      backgroundColor: p.color || '#007aff',
                      border: '1px solid #d1d1d6',
                      flexShrink: 0
                    }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '14px', fontStyle: 'italic', color: '#1c1c1e', lineHeight: 1 }}>{p.name || 'Без назви'}</div>
                    <div style={{ fontSize: '11px', fontStyle: 'italic', color: '#8e8e93', lineHeight: 1 }}>ID: {p.id || 'не вказано'}</div>
                    
                    {/* Виведення діапазону дат під ID проекту */}
                    {(startDateStr || endDateStr) && (
                      <div style={{ fontSize: '11px', fontStyle: 'italic', color: '#1c1c1e', fontWeight: 'bold', lineHeight: 1, marginTop: '2px' }}>
                        {formatDateShort(startDateStr)} {startDateStr && endDateStr ? '-' : ''} {formatDateShort(endDateStr)}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '6px' }} onClick={(e) => e.stopPropagation()}>
                  {filter === 'active' && (
                    <button
                      onClick={() => handleStatusChange(p.id, 'archived')}
                      style={actionBtnStyle}
                      title="Перенести в архів"
                    >
                      📦
                    </button>
                  )}
                  {filter === 'archived' && (
                    <button
                      onClick={() => handleStatusChange(p.id, 'active')}
                      style={actionBtnStyle}
                      title="Відновити в активні"
                    >
                      ↩️
                    </button>
                  )}
                  {filter !== 'trash' && (
                    <button
                      onClick={() => handleStatusChange(p.id, 'trash')}
                      style={actionBtnStyle}
                      title="Перенести в кошик"
                    >
                      🗑️
                    </button>
                  )}
                  {filter === 'trash' && (
                    <>
                      <button
                        onClick={() => handleStatusChange(p.id, 'active')}
                        style={actionBtnStyle}
                        title="Відновити"
                      >
                        ↩️
                      </button>
                      {onPermanentDelete && (
                        <button
                          onClick={() => onPermanentDelete(p.id)}
                          style={{ ...actionBtnStyle, color: '#ff3b30' }}
                          title="Видалити назавжди"
                        >
                          ❌
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

const tabBtnStyle = (active: boolean): React.CSSProperties => ({
  flex: 1,
  height: '32px',
  padding: '0 8px',
  backgroundColor: active ? '#007aff' : '#f2f2f7',
  color: active ? '#ffffff' : '#1c1c1e',
  border: '1px solid #d1d1d6',
  borderRadius: '8px',
  fontWeight: 'bold',
  fontStyle: 'italic',
  fontSize: '11px',
  cursor: 'pointer',
  lineHeight: 1
});

const actionBtnStyle: React.CSSProperties = {
  backgroundColor: '#ffffff',
  border: '1px solid #d1d1d6',
  borderRadius: '6px',
  width: '28px',
  height: '28px',
  fontSize: '12px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 0,
  lineHeight: 1
};

export default ProjectList;
