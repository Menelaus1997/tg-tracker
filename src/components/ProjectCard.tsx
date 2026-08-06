import React, { useState } from 'react';
import { Project, ProjectLink, ProjectStage } from '../types';

interface ProjectCardProps {
  project: Project;
  onUpdateProject: (updatedProject: Project) => void;
}

const STAGE_LABELS: Record<ProjectStage, string> = {
  started: 'Старт / Договір',
  measurements: 'Обміри',
  planning: 'Планування',
  visualization: 'Візуалізація',
  specification: 'Креслення та спеки',
  completed: 'Завершено',
};

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onUpdateProject }) => {
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [showAddLink, setShowAddLink] = useState(false);

  // Перемикання тумблерів відображення блоків
  const toggleBlock = (blockName: keyof typeof project.visibleBlocks) => {
    onUpdateProject({
      ...project,
      visibleBlocks: {
        ...project.visibleBlocks,
        [blockName]: !project.visibleBlocks[blockName],
      },
    });
  };

  // Оновлення текстових приміток
  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdateProject({
      ...project,
      comments: e.target.value,
    });
  };

  // Оновлення етапу проекту
  const handleStageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdateProject({
      ...project,
      currentStage: e.target.value as ProjectStage,
    });
  };

  // Додавання нового посилання
  const handleAddLink = () => {
    if (newLinkTitle.trim() && newLinkUrl.trim()) {
      const newLink: ProjectLink = {
        id: Date.now().toString(),
        title: newLinkTitle.trim(),
        url: newLinkUrl.trim().startsWith('http') ? newLinkUrl.trim() : `https://${newLinkUrl.trim()}`,
      };
      onUpdateProject({
        ...project,
        links: [...project.links, newLink],
      });
      setNewLinkTitle('');
      setNewLinkUrl('');
      setShowAddLink(false);
    }
  };

  // Видалення посилання
  const handleDeleteLink = (linkId: string) => {
    onUpdateProject({
      ...project,
      links: project.links.filter((l) => l.id !== linkId),
    });
  };

  return (
    <div
      style={{
        backgroundColor: '#fff',
        borderRadius: '10px',
        borderLeft: `6px solid ${project.colorMarker}`,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        padding: '16px',
        marginBottom: '16px',
        fontFamily: 'sans-serif',
      }}
    >
      {/* Шапка картки */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div>
          <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', letterSpacing: '0.5px' }}>
            {project.id}
          </span>
          <h3 style={{ margin: '2px 0 6px 0', fontSize: '18px', color: '#0f172a' }}>{project.title}</h3>
          
          {/* Список тегів проекту */}
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {project.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  backgroundColor: '#f1f5f9',
                  color: '#475569',
                  fontSize: '10px',
                  fontWeight: '600',
                  padding: '2px 6px',
                  borderRadius: '4px',
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Панель тумблерів UI (Toggle Switches) */}
        <div style={{ display: 'flex', gap: '6px', backgroundColor: '#f8fafc', padding: '4px', borderRadius: '6px' }}>
          <button
            onClick={() => toggleBlock('passport')}
            title="Паспорт проекту"
            style={{
              border: 'none',
              background: project.visibleBlocks.passport ? '#e2e8f0' : 'transparent',
              cursor: 'pointer',
              borderRadius: '4px',
              padding: '2px 6px',
              fontSize: '12px',
            }}
          >
            📋
          </button>
          <button
            onClick={() => toggleBlock('links')}
            title="Посилання"
            style={{
              border: 'none',
              background: project.visibleBlocks.links ? '#e2e8f0' : 'transparent',
              cursor: 'pointer',
              borderRadius: '4px',
              padding: '2px 6px',
              fontSize: '12px',
            }}
          >
            🔗
          </button>
          <button
            onClick={() => toggleBlock('comments')}
            title="Примітки"
            style={{
              border: 'none',
              background: project.visibleBlocks.comments ? '#e2e8f0' : 'transparent',
              cursor: 'pointer',
              borderRadius: '4px',
              padding: '2px 6px',
              fontSize: '12px',
            }}
          >
            💬
          </button>
        </div>
      </div>

      {/* Блок 1: Паспорт проекту та прогрес */}
      {project.visibleBlocks.passport && (
        <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>Етап виконання:</label>
            <select
              value={project.currentStage}
              onChange={handleStageChange}
              style={{
                padding: '4px 8px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '12px',
                backgroundColor: '#fff',
              }}
            >
              {Object.entries(STAGE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Прогрес-бар */}
          <div style={{ marginTop: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginBottom: '2px' }}>
              <span>Прогрес</span>
              <span>{project.completionPercentage}%</span>
            </div>
            <div style={{ width: '100%', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${project.completionPercentage}%`,
                  height: '100%',
                  backgroundColor: project.colorMarker,
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>

          {/* Дедлайн */}
          <div style={{ marginTop: '8px', fontSize: '12px', color: '#475569', display: 'flex', justifyContent: 'space-between' }}>
            <span>Дедлайн: <strong>{project.deadlineDate}</strong></span>
            <span>Залишилось: <strong>{project.deadlineDays} дн.</strong></span>
          </div>
        </div>
      )}

      {/* Блок 2: Посилання */}
      {project.visibleBlocks.links && (
        <div style={{ marginBottom: '12px', borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>📌 Посилання та документи:</span>
            <button
              onClick={() => setShowAddLink(!showAddLink)}
              style={{ border: 'none', background: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '12px' }}
            >
              + Додати
            </button>
          </div>

          {showAddLink && (
            <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
              <input
                type="text"
                placeholder="Назва (напр. Дизайн)"
                value={newLinkTitle}
                onChange={(e) => setNewLinkTitle(e.target.value)}
                style={{ flex: 1, padding: '4px 8px', fontSize: '12px', borderRadius: '4px', border: '1px solid #ccc' }}
              />
              <input
                type="text"
                placeholder="URL адреса"
                value={newLinkUrl}
                onChange={(e) => setNewLinkUrl(e.target.value)}
                style={{ flex: 1.5, padding: '4px 8px', fontSize: '12px', borderRadius: '4px', border: '1px solid #ccc' }}
              />
              <button
                onClick={handleAddLink}
                style={{ padding: '4px 8px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}
              >
                ОК
              </button>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {project.links.map((link) => (
              <div key={link.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', backgroundColor: '#f8fafc', padding: '4px 8px', borderRadius: '4px' }}>
                <a href={link.url} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  🔗 {link.title}
                </a>
                <button
                  onClick={() => handleDeleteLink(link.id)}
                  style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '10px' }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Блок 3: Примітки / Коментарі */}
      {project.visibleBlocks.comments && (
        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '4px' }}>
            💬 Примітки та зауваження:
          </label>
          <textarea
            rows={2}
            maxLength={4096}
            value={project.comments}
            onChange={handleCommentChange}
            placeholder="Введіть коментарі до проекту..."
            style={{
              width: '100%',
              padding: '6px 8px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              fontSize: '12px',
              boxSizing: 'border-box',
              resize: 'vertical',
            }}
          />
        </div>
      )}
    </div>
  );
};
