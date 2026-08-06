import React, { useState, useRef } from 'react';

const PRESET_COLORS = [
  '#00a84f', // зелений
  '#009688', // бірюзовий
  '#7c4dff', // фіолетовий
  '#2196f3', // синій
  '#e53935', // червоний
  '#3e2723', // темний
  '#d84315', // помаранчевий
];

export const CreateProject: React.FC = () => {
  const [name, setName] = useState('');
  const [projectId, setProjectId] = useState(`PRJ-${Math.floor(1000 + Math.random() * 9000)}`);
  const [template, setTemplate] = useState('custom');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [customColors, setCustomColors] = useState<string[]>([]);
  
  const colorInputRef = useRef<HTMLInputElement>(null);

  const handleAddCustomColor = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    if (newColor && !PRESET_COLORS.includes(newColor) && !customColors.includes(newColor)) {
      setCustomColors([...customColors, newColor]);
    }
    setSelectedColor(newColor);
  };

  const allColors = [...PRESET_COLORS, ...customColors];

  return (
    <div style={{ padding: '20px', color: '#ffffff', maxWidth: '500px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '24px', fontSize: '20px', fontWeight: 600 }}>Створення проекту</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {/* 1. Найменування проекту */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '14px', color: '#a1a1a6' }}>Найменування проекта</label>
          <input
            type="text"
            placeholder="Введіть назву..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* 2. ID проекту */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '14px', color: '#a1a1a6' }}>ID проекту</label>
          <input
            type="text"
            placeholder="PRJ-1001"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* 3. Шаблон проекту */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '14px', color: '#a1a1a6' }}>Шаблон проекту</label>
          <select
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}
          >
            <option value="custom" style={optionStyle}>Кастомізований проект (свій вариант)</option>
            <option value="interior_design" style={optionStyle}>Дизайн інтер'єру (базовий)</option>
            <option value="measurement" style={optionStyle}>Обміри та креслення</option>
            <option value="full_construction" style={optionStyle}>Повний ремонт / Кошторис</option>
          </select>
        </div>

        {/* 4. Вибір кольору відображення */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
          <label style={{ fontSize: '14px', color: '#a1a1a6' }}>Колір</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {allColors.map((color) => {
              const isSelected = selectedColor === color;
              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: color,
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: '16px',
                    outline: isSelected ? '2px solid #fff' : 'none',
                    outlineOffset: '2px',
                    transition: 'transform 0.15s ease'
                  }}
                >
                  {isSelected && '✓'}
                </button>
              );
            })}

            {/* Кнопка + для свійського кастомного кольору */}
            <button
              type="button"
              onClick={() => colorInputRef.current?.click()}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: '#3a3a3c',
                border: '1px stroke #555',
                color: '#aaa',
                fontSize: '20px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              +
            </button>
            <input
              ref={colorInputRef}
              type="color"
              onChange={handleAddCustomColor}
              style={{ display: 'none' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  backgroundColor: '#2c2c2e',
  border: '1px solid #3a3a3c',
  borderRadius: '10px',
  color: '#ffffff',
  fontSize: '15px',
  outline: 'none',
  boxSizing: 'border-box'
};

const optionStyle: React.CSSProperties = {
  backgroundColor: '#2c2c2e',
  color: '#ffffff'
};
