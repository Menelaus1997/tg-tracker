import React, { useState } from 'react';
import { Project, TeamMember } from '../App';

interface AnalyticsProps {
  projects: Project[];
  teamDatabase: TeamMember[];
}

export const Analytics: React.FC<AnalyticsProps> = ({ projects }) => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  
  // Нова логіка фільтрації: джерело ('data' або 'structure'), обраний елемент та рядок уточнення
  const [sourceType, setSourceType] = useState<'data' | 'structure'>('data');
  const [selectedItem, setSelectedItem] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 1. Збираємо унікальні поля з "Даних" (passportRows) по всіх проєктах
  const availableDataFields = Array.from(
    new Set(
      projects.flatMap(p => (p.passportRows || []).map(r => r.label).filter(Boolean))
    )
  );

  // 2. Збираємо унікальні назви етапів/стадій зі "Структури" по всіх проєктах
  const availableStructureStages = Array.from(
    new Set(
      projects.flatMap(p => (p.stages || []).map(s => s.title).filter(Boolean))
    )
  );

  // Поточний список для другого випадаючого меню в залежності від обраного джерела
  const currentOptions = sourceType === 'data' ? availableDataFields : availableStructureStages;

  // Динамічний підрахунок кількості на основі вибраних критеріїв
  const calculateTotal = () => {
    let count = 0;

    projects.forEach(p => {
      if (sourceType === 'data') {
        // Шукаємо в паспортних даних
        (p.passportRows || []).forEach(r => {
          const matchLabel = !selectedItem || (r.label || '').toLowerCase().includes(selectedItem.toLowerCase());
          const matchQuery = !searchQuery || (r.value || '').toLowerCase().includes(searchQuery.toLowerCase()) || (r.label || '').toLowerCase().includes(searchQuery.toLowerCase());
          if (matchLabel && matchQuery) {
            const num = parseFloat(r.value);
            count += !isNaN(num) ? num : 1;
          }
        });
      } else {
        // Шукаємо в структурі (стадіях)
        (p.stages || []).forEach(st => {
          const matchTitle = !selectedItem || st.title.toLowerCase().includes(selectedItem.toLowerCase());
          const matchQuery = !searchQuery || st.title.toLowerCase().includes(searchQuery.toLowerCase()) || (st.currentStatus || '').toLowerCase().includes(searchQuery.toLowerCase());
          
          if (matchTitle && matchQuery) {
            count += 1;
          }
        });
      }
    });

    return count;
  };

  const totalValue = calculateTotal();

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto', color: '#1c1c1e', paddingBottom: '80px' }}>
      
      {/* Вибір періоду */}
      <div style={{ display: 'flex', backgroundColor: '#e5e5ea', padding: '4px', borderRadius: '10px', marginBottom: '16px' }}>
        <button 
          onClick={() => setTimeRange('week')} 
          style={{ flex: 1, padding: '8px', border: 'none', borderRadius: '8px', background: timeRange === 'week' ? '#ffffff' : 'transparent', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}
        >
          Тиждень
        </button>
        <button 
          onClick={() => setTimeRange('month')} 
          style={{ flex: 1, padding: '8px', border: 'none', borderRadius: '8px', background: timeRange === 'month' ? '#ffffff' : 'transparent', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}
        >
          Місяць
        </button>
        <button 
          onClick={() => setTimeRange('year')} 
          style={{ flex: 1, padding: '8px', border: 'none', borderRadius: '8px', background: timeRange === 'year' ? '#ffffff' : 'transparent', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}
        >
          Рік
        </button>
      </div>

      {/* Універсальна панель вибору: Джерело -> Параметр -> Пошук/Уточнення */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', backgroundColor: '#f2f2f7', padding: '12px', borderRadius: '12px', marginBottom: '20px' }}>
        
        {/* Рядок випадаючих списків */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {/* 1. Вибір джерела: Дані чи Структура */}
          <select 
            value={sourceType} 
            onChange={(e) => {
              setSourceType(e.target.value as 'data' | 'structure');
              setSelectedItem('');
            }}
            style={inputStyle}
          >
            <option value="data">📊 Дані</option>
            <option value="structure">📑 Структура</option>
          </select>

          {/* 2. Вибір конкретного заголовка з Даних або Структури */}
          <select 
            value={selectedItem} 
            onChange={(e) => setSelectedItem(e.target.value)}
            style={inputStyle}
          >
            <option value="">Всі елементи ({sourceType === 'data' ? 'Паспорт' : 'Стадії'})</option>
            {currentOptions.map((opt, idx) => (
              <option key={idx} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        {/* 3. Рядок уточнення (пошук за статусом, значенням тощо) */}
        <input
          type="text"
          placeholder="Уточнення (напр., Завершено, Активно)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={inputStyle}
        />
      </div>

      {/* Візуалізація результату (Графік / Підсумок) */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', backgroundColor: '#f2f2f7', borderRadius: '16px', marginBottom: '20px' }}>
        <div style={{ width: '120px', height: '120px', borderRadius: '50%', border: '10px solid #007aff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
          <span style={{ fontSize: '24px', fontWeight: 800 }}>{totalValue}</span>
          <span style={{ fontSize: '11px', color: '#8e8e93' }}>Загалом</span>
        </div>
      </div>

      {/* Список проєктів для перевірки */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {projects.map((p) => (
          <div key={p.id} style={{ backgroundColor: '#f2f2f7', padding: '14px', borderRadius: '12px' }}>
            <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>{p.name} ({p.id})</div>
            <div style={{ fontSize: '12px', color: '#8e8e93' }}>Статус: {p.status}</div>
          </div>
        ))}
      </div>

    </div>
  );
};

const inputStyle: React.CSSProperties = {
  flex: 1,
  padding: '8px 10px',
  backgroundColor: '#ffffff',
  border: '1px solid #d1d1d6',
  borderRadius: '8px',
  fontSize: '12px',
  outline: 'none',
  boxSizing: 'border-box',
  color: '#1c1c1e',
  cursor: 'pointer'
};

export default Analytics;
