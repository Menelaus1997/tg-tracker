import React, { useState } from 'react';
import { Project } from '../App';

interface ProjectDetailProps {
  project: Project;
  onUpdateProject: (project: Project) => void;
  onSaveAsTemplate: () => void;
  onBack: () => void;
  availableRoles?: string[];
}

const DEFAULT_COLORS = [
  '#34c759', '#00c7be', '#5856d6', '#007aff',
  '#ff3b30', '#5c3d2e', '#ff9500', '#af52de'
];

export const ProjectDetail: React.FC<ProjectDetailProps> = ({
  project,
  onUpdateProject,
  onSaveAsTemplate,
  onBack,
  availableRoles = []
}) => {
  const [name, setName] = useState(project.name);
  const [color, setColor] = useState(project.color || DEFAULT_COLORS[0]);

  const isCustomColor = !DEFAULT_COLORS.includes(color);

  const handleColorChange = (newColor: string) => {
    setColor(newColor);
    onUpdateProject({ ...project, color: newColor });
  };

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto', color: '#1c1c1e' }}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', fontSize: '14px', color: '#007aff', cursor: 'pointer', marginBottom: '16px' }}>
        ← Назад до проектів
      </button>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ fontSize: '12px', color: '#636366' }}>Назва проекту</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => onUpdateProject({ ...project, name })}
          style={{ width: '100%', padding: '10px', backgroundColor: '#f2f2f7', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 600, marginTop: '4px', boxSizing: 'border-box' }}
        />
      </div>

      {/* Палітра з галочкою ✓ для існуючого проекту */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ fontSize: '12px', color: '#636366' }}>Колір маркування</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', flexWrap: 'nowrap', overflowX: 'auto' }}>
          {DEFAULT_COLORS.map((c) => {
            const isSelected = color === c;
            return (
              <div
                key={c}
                onClick={() => handleColorChange(c)}
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

          <label
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: isCustomColor ? color : '#e5e5ea',
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
          >
            {isCustomColor ? '✓' : '+'}
            <input
              type="color"
              value={color}
              onChange={(e) => handleColorChange(e.target.value)}
              style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }}
            />
          </label>
        </div>
      </div>

      <button
        onClick={onSaveAsTemplate}
        style={{ width: '100%', padding: '12px', backgroundColor: '#34c759', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}
      >
        Зберегти як шаблон
      </button>
    </div>
  );
};

export default ProjectDetail;
