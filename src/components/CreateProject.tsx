import React, { useState, useRef } from 'react';
import { SavedTemplate } from '../App';

interface CreateProjectProps {
  onCreateProject: (project: { id: string; name: string; template: string; color: string }) => void;
  availableTemplates?: SavedTemplate[];
  onDeleteTemplate?: (templateId: string) => void;
}

const DEFAULT_COLORS = [
  '#00a84f', '#009688', '#7c4dff', 
  '#2196f3', '#e53935', '#3e2723', 
  '#d84315', '#8e24aa', '#3f51b5'
];

export const CreateProject: React.FC<CreateProjectProps> = ({ 
  onCreateProject, 
  availableTemplates = [],
  onDeleteTemplate 
}) => {
  const [name, setName] = useState('');
  const [projectId, setProjectId] = useState('#V1');
  const [template, setTemplate] = useState('general');
  const [colors, setColors] = useState<string[]>(DEFAULT_COLORS);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [showTemplatesArchive, setShowTemplatesArchive] = useState<boolean>(false);

  const colorInputRef = useRef<HTMLInputElement>(null);

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    if (newColor) {
      setColors((prevColors) => {
        const updated = [...prevColors];
        updated[selectedIndex] = newColor;
        return updated;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onCreateProject({
      id: projectId,
      name: name,
      template: template,
      color: colors[selectedIndex]
    });
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#ffffff', color: '#1c1c1e', maxWidth: '500px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '20px', fontSize: '22px', fontWeight: 700, color: '#1c1c1e' }}>
        Створення проекту
      </h2>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '14px', fontWeight: 500, color: '#636366' }}>Найменування проекта</label>
          <input
            type="text"
            placeholder="ЖК Варшавський"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={inputStyle}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '14px', fontWeight: 500, color: '#636366' }}>ID проекту</label>
          <input
            type="text"
            placeholder="#V1"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '14px', fontWeight: 500, color: '#636366' }}>Шаблон</label>
          <div style={{ position: 'relative' }}>
            <select
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              style={{
                ...inputStyle,
                appearance: 'none',
                WebkitAppearance: 'none',
                paddingRight: '36px',
                cursor: 'pointer'
              }}
            >
              <option value="general">Загальний шаблон (свій варіант)</option>
              {availableTemplates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            <div style={{
              position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
              pointerEvents: 'none', width: 0, height: 0,
              borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '6px solid #1c1c1e'
            }} />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '14px', fontWeight: 500, color: '#636366' }}>Колір</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'nowrap' }}>
            {colors.map((color, index) => {
              const isSelected = selectedIndex === index;
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => setSelectedIndex(index)}
                  style={{
                    width: '32px', height: '32px', borderRadius: '50%', backgroundColor: color, border: 'none',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#ffffff', fontSize: '14px',
                    boxShadow: isSelected ? '0 0 0 2px #ffffff, 0 0 0 4px #007aff' : 'none',
                    flexShrink: 0
                  }}
                >
                  {isSelected && '✓'}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => colorInputRef.current?.click()}
              style={{
                width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#e5e5ea',
                border: 'none', color: '#636366', fontSize: '18px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}
            >
              +
            </button>
            <input
              ref={colorInputRef}
              type="color"
              onChange={handleCustomColorChange}
              style={{ display: 'none' }}
            />
          </div>
        </div>

        <button
          type="submit"
          style={{
            marginTop: '16px', padding: '14px', backgroundColor: '#007aff', color: '#ffffff',
            border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 600, cursor: 'pointer'
          }}
        >
          Створити проект
        </button>
      </form>

      {/* Сірий підкреслений напис "Архів шаблонів" під кнопкою */}
      <div style={{ marginTop: '16px', textAlign: 'center' }}>
        <button
          type="button"
          onClick={() => setShowTemplatesArchive(!showTemplatesArchive)}
          style={{
            background: 'none',
            border: 'none',
            color: '#8e8e93',
            fontSize: '13px',
            textDecoration: 'underline',
            cursor: 'pointer',
            padding: '4px'
          }}
        >
          Архів шаблонів ({availableTemplates.length})
        </button>

        {showTemplatesArchive && (
          <div style={{ marginTop: '12px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {availableTemplates.length === 0 ? (
              <div style={{ fontSize: '13px', color: '#8e8e93', textAlign: 'center' }}>Немає збережених шаблонів</div>
            ) : (
              availableTemplates.map((tmpl) => (
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
                  <span style={{ fontSize: '14px', fontWeight: 500, color: '#1c1c1e' }}>{tmpl.name}</span>
                  {onDeleteTemplate && (
                    <button
                      type="button"
                      onClick={() => onDeleteTemplate(tmpl.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}
                      title="Видалити шаблон"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 14px', backgroundColor: '#f2f2f7',
  border: '1px solid #e5e5ea', borderRadius: '10px', color: '#1c1c1e', fontSize: '15px', outline: 'none', boxSizing: 'border-box'
};
