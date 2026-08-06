import React, { useState, useRef } from 'react';

interface CreateProjectProps {
  onCreateProject: (project: { id: string; name: string; template: string; color: string }) => void;
}

const DEFAULT_COLORS = [
  '#00a84f', '#009688', '#7c4dff', 
  '#2196f3', '#e53935', '#3e2723', 
  '#d84315', '#8e24aa', '#3f51b5'
];

export const CreateProject: React.FC<CreateProjectProps> = ({ onCreateProject }) => {
  const [name, setName] = useState('');
  const [projectId, setProjectId] = useState('#V1');
  const [template, setTemplate] = useState('Загальний');
  const [colors, setColors] = useState<string[]>(DEFAULT_COLORS);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

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
        {/* 1. Найменування проекту */}
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

        {/* 2. ID проекту */}
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

        {/* 3. Шаблон */}
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
              <option value="Загальний">Загальний шаблон</option>
            </select>
            <div style={{
              position: 'absolute',
              right: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
              width: 0,
              height: 0,
              borderLeft: '5px solid transparent',
              borderRight: '5px solid transparent',
              borderTop: '6px solid #1c1c1e'
            }} />
          </div>
        </div>

        {/* 4. Колір (9 кольорів + кнопка +) */}
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
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: color,
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    fontSize: '14px',
                    boxShadow: isSelected ? '0 0 0 2px #ffffff, 0 0 0 4px #007aff' : 'none',
                    transition: 'all 0.15s ease',
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
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#e5e5ea',
                border: 'none',
                color: '#636366',
                fontSize: '18px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
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
            marginTop: '16px',
            padding: '14px',
            backgroundColor: '#007aff',
            color: '#ffffff',
            border: 'none',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: 600,
            cursor: 'pointer',
            textAlign: 'center'
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
  padding: '12px 14px',
  backgroundColor: '#f2f2f7',
  border: '1px solid #e5e5ea',
  borderRadius: '10px',
  color: '#1c1c1e',
  fontSize: '15px',
  outline: 'none',
  boxSizing: 'border-box'
};
