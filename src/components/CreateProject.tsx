import React, { useState } from 'react';
import { Project } from '../App';

interface CreateProjectProps {
  onCreateProject: (project: Project) => void;
  templates: any[];
}

const COLOR_OPTIONS = [
  '#34c759', '#00c7be', '#5856d6', '#007aff',
  '#ff3b30', '#5c3d2e', '#ff9500', '#af52de', '#3a5199'
];

export const CreateProject: React.FC<CreateProjectProps> = ({ onCreateProject, templates }) => {
  const [name, setName] = useState('');
  const [projectId, setProjectId] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !projectId.trim()) return;

    const matchedTemplate = templates.find(t => t.id === selectedTemplateId);

    const newProj: Project = {
      id: projectId.trim(),
      name: name.trim(),
      color: selectedColor,
      status: 'active',
      stages: matchedTemplate?.stages ? JSON.parse(JSON.stringify(matchedTemplate.stages)) : [],
      teamMembers: []
    };

    onCreateProject(newProj);
    setName('');
    setProjectId('');
    setSelectedTemplateId('');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto', color: '#1c1c1e' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '20px' }}>Створення проекту</h2>

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
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name || `Шаблон ${t.id}`}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={labelStyle}>Колір маркування</label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
            {COLOR_OPTIONS.map((c) => (
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
                  border: selectedColor === c ? '2px solid #007aff' : 'none'
                }}
              >
                {selectedColor === c && <span style={{ color: '#fff', fontSize: '12px' }}>✓</span>}
              </div>
            ))}
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
          Створити проект
        </button>
      </form>
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

export default CreateProject;
