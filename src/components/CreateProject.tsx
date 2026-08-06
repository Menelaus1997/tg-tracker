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
  const [projectId, setProjectId] = useState(`PRJ-${Math.floor(1000 + Math.random() * 9000)}`);
  const [template, setTemplate] = useState('custom');
  const [colors, setColors] = useState<string[]>(DEFAULT_COLORS);
  const [selectedColor, setSelectedColor] = useState(DEFAULT_COLORS[0]);
  const [showTemplatesArchive, setShowTemplatesArchive] = useState(false);

  const colorInputRef = useRef<HTMLInputElement>(null);

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    if (newColor) {
      // Замінюємо останній колір у стекі з 9 кольорів
      const updatedColors = [...colors.slice(0, 8), newColor];
      setColors(updatedColors);
      setSelectedColor(newColor);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onCreateProject({
      id: projectId,
      name: name,
      template: template,
      color: selectedColor
    });
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#ffffff', color: '#1c1c1e', maxWidth: '500px', margin: '0 auto', minHeight: '100vh' }}>
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
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* 3. Шаблон */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ fontSize: '14px', fontWeight: 500, color: '#636366' }}>Шаблон</label>
            <button
              type="button"
              onClick={() => setShowTemplatesArchive(!showTemplatesArchive)}
              style={{ background: 'none', border: 'none', color: '#007aff', fontSize: '13px', cursor: 'pointer', padding: 0 }}
            >
              {showTemplatesArchive ? 'Сховати архів' : '📦 Архів шаблонів'}
            </button>
          </div>

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
              <option value="custom">Кастомізований проект (свій варіант)</option>
              <option value="interior_design">Дизайн інтер'єру (базовий)</option>
              <option value="measurement">Обміри та креслення</option>
              <option value="full_construction">Повний ремонт / Кошторис</option>
            </select>
            {/* Трикутна стрілочка списку */}
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

          {/* Відображення Архіву Шаблонів */}
          {showTemplatesArchive && (
            <div style={{ marginTop: '8px', padding: '12px', backgroundColor: '#f2f2f7', borderRadius: '10px', fontSize: '13px' }}>
              <div style={{ fontWeight: 600, marginBottom: '6px' }}>Передналаштовані шаблони:</div>
              <ul style={{ paddingLeft: '18px', margin: 0, color: '#3a3a3c', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <li><b>Дизайн інтер'єру:</b> Креслення, 3D візуалізація, специфікації матеріалів.</li>
                <li><b>Обміри та креслення:</b> План обмірів, експлікація приміщень, прив'язки інженерії.</li>
                <li><b>Повний ремонт:</b> Демонтаж, монтаж, оздоблення, підрахунок об'ємів BOQ.</li>
              </ul>
            </div>
          )}
        </div>

        {/* 4. Колір (9 кольорів + кнопка +) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '14px', fontWeight: 500, color: '#636366' }}>Колір</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'nowrap' }}>
            {colors.map((color) => {
              const isSelected = selectedColor === color;
              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
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

            {/* Кнопка + (10-та у рядку) */}
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

        {/* Кнопка Створити */}
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
