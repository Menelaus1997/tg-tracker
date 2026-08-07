import React, { useState } from 'react';
import { Project } from '../App';

interface CreateProjectProps {
  onCreateProject: (project: Project) => void;
  templates: any[];
  onUpdateTemplates?: (templates: any[]) => void;
}

const DEFAULT_COLORS = [
  '#34c759', '#00c7be', '#5856d6', '#007aff',
  '#ff3b30', '#5c3d2e', '#ff9500', '#af52de'
];

export const CreateProject: React.FC<CreateProjectProps> = ({
  onCreateProject,
  templates = [],
  onUpdateTemplates
}) => {
  const [name, setName] = useState('');
  const [projectId, setProjectId] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [selectedColor, setSelectedColor] = useState(DEFAULT_COLORS[0]);

  const [isTemplateManagerOpen, setIsTemplateManagerOpen] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [editingTemplateName, setEditingTemplateName] = useState('');

  const validTemplates = templates.filter((t) => t && t.id && t.name && t.name !== 'undefined');

  // Перевірка, чи колір є серед стандартних
  const isCustomColor = !DEFAULT_COLORS.includes(selectedColor);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !projectId.trim()) return;

    const matchedTemplate = validTemplates.find((t) => t.id === selectedTemplateId);

    const cleanStages = matchedTemplate?.stages
      ? matchedTemplate.stages.map((st: any) => ({
          id: Date.now().toString() + Math.random().toString(36).substr(2, 4),
          title: st.title,
          subStages: (st.subStages || []).map((sub: any) => ({
            id: Date.now().toString() + Math.random().toString(36).substr(2, 4),
            title: sub.title,
            completed: false
          })),
          loggedSeconds: 0,
          isTimerRunning: false
        }))
      : [];

    const newProj: Project = {
      id: projectId.trim(),
      name: name.trim(),
      color: selectedColor,
      status: 'active',
      stages: cleanStages,
      teamMembers: []
    };

    onCreateProject(newProj);
    setName('');
    setProjectId('');
    setSelectedTemplateId('');
  };

  const handleDeleteTemplate = (id: string) => {
    if (!onUpdateTemplates) return;
    if (confirm('Видалити цей шаблон?')) {
      const updated = templates.filter((t) => t.id !== id);
      onUpdateTemplates(updated);
      if (selectedTemplateId === id) setSelectedTemplateId('');
    }
  };

  const handleSaveTemplateName = (id: string) => {
    if (!onUpdateTemplates || !editingTemplateName.trim()) return;
    const updated = templates.map((t) =>
      t.id === id ? { ...t, name: editingTemplateName.trim() } : t
    );
    onUpdateTemplates(updated);
    setEditingTemplateId(null);
    setEditingTemplateName('');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto', color: '#1c1c1e' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={labelStyle}>Найменування проекта</label>
          <input
            type="text"
            placeholder="ЖК Варшавський"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>ID проекту</label>
          <input
            type="text"
            placeholder="#V1"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            required
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Шаблон</label>
          <select
            value={selectedTemplateId}
            onChange={(e) => setSelectedTemplateId(e.target.value)}
            style={inputStyle}
          >
            <option value="">Загальний шаблон (свій варіант)</option>
            {validTemplates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        {/* Палітра кольорів з безаварійною галочкою ✓ */}
        <div>
          <label style={labelStyle}>Колір маркування</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', flexWrap: 'nowrap', overflowX: 'auto' }}>
            {DEFAULT_COLORS.map((c) => {
              const isSelected = selectedColor === c;
              return (
                <div
                  key={c}
                  onClick={() => setSelectedColor(c)}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: c,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  {isSelected && <span style={{ color: '#fff', fontSize: '12px', fontWeight: 700 }}>✓</span>}
                </div>
              );
            })}

            {/* 9-та кнопка піпетки / кастомного кольору */}
            <label
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: isCustomColor ? selectedColor : '#e5e5ea',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontSize: isCustomColor ? '12px' : '16px',
                fontWeight: 700,
                color: isCustomColor ? '#ffffff' : '#007aff',
                position: 'relative'
              }}
              title="Обрати кастомний колір"
            >
              {isCustomColor ? '✓' : '+'}
              <input
                type="color"
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }}
              />
            </label>
          </div>
        </div>

        <button
          type="submit"
          style={{
            padding: '14px',
            backgroundColor: '#007aff',
            color: '#ffffff',
            border: 'none',
            borderRadius: '12px',
            fontWeight: 700,
            fontSize: '15px',
            cursor: 'pointer',
            marginTop: '10px'
          }}
        >
          Додати проект
        </button>
      </form>

      {/* Архів шаблонів */}
      <div style={{ textAlign: 'center', marginTop: '16px' }}>
        <button
          type="button"
          onClick={() => setIsTemplateManagerOpen(!isTemplateManagerOpen)}
          style={{
            background: 'none',
            border: 'none',
            color: '#8e8e93',
            fontSize: '13px',
            cursor: 'pointer',
            textDecoration: 'underline'
          }}
        >
          {isTemplateManagerOpen ? 'Сховати архів шаблонів' : 'Архів шаблонів'}
        </button>
      </div>

      {isTemplateManagerOpen && (
        <div style={{ marginTop: '16px', padding: '14px', backgroundColor: '#f2f2f7', borderRadius: '12px' }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#1c1c1e' }}>
            Архів шаблонів ({validTemplates.length})
          </h4>

          {validTemplates.length === 0 ? (
            <div style={{ fontSize: '12px', color: '#8e8e93' }}>Збережених шаблонів немає.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {validTemplates.map((t) => (
                <div
                  key={t.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    fontSize: '13px'
                  }}
                >
                  {editingTemplateId === t.id ? (
                    <div style={{ display: 'flex', gap: '6px', flex: 1, marginRight: '8px' }}>
                      <input
                        type="text"
                        value={editingTemplateName}
                        onChange={(e) => setEditingTemplateName(e.target.value)}
                        style={{ ...inputStyle, padding: '4px 8px', fontSize: '12px' }}
                      />
                      <button
                        onClick={() => handleSaveTemplateName(t.id)}
                        style={{ padding: '4px 8px', backgroundColor: '#34c759', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                      >
                        ✓
                      </button>
                    </div>
                  ) : (
                    <span style={{ fontWeight: 500 }}>{t.name}</span>
                  )}

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => {
                        setEditingTemplateId(t.id);
                        setEditingTemplateName(t.name);
                      }}
                      style={iconBtnStyle}
                      title="Перейменувати"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteTemplate(t.id)}
                      style={{ ...iconBtnStyle, color: '#ff3b30' }}
                      title="Видалити"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px',
  backgroundColor: '#f2f2f7',
  border: 'none',
  borderRadius: '10px',
  fontSize: '14px',
  outline: 'none',
  boxSizing: 'border-box'
};

const labelStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#636366',
  marginBottom: '4px',
  display: 'block'
};

const iconBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontSize: '13px',
  padding: '2px 4px'
};

export default CreateProject;
