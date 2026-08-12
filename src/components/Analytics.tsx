import React, { useState } from 'react';
import { Project, TeamMember } from '../App';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface AnalyticsProps {
  projects: Project[];
  teamDatabase: TeamMember[];
}

type FilterPeriod = 'week' | 'month' | 'year';

const CHART_COLORS = ['#007aff', '#34c759', '#ff9500', '#af52de', '#ff2d55', '#5856d6', '#00c7be', '#ffcc00'];

const MONTHS_LIST = [
  'Січень', 'Лютий', 'Березень', 'Квітень',
  'Травень', 'Червень', 'Липень', 'Серпень',
  'Вересень', 'Жовтень', 'Листопад', 'Грудень'
];

const YEARS_LIST = ['2025', '2026', '2027'];

export const Analytics: React.FC<AnalyticsProps> = ({ projects }) => {
  const [period, setPeriod] = useState<FilterPeriod>('month');
  
  const [yearIndex, setYearIndex] = useState(1);   // 2026
  const [monthIndex, setMonthIndex] = useState(7); // Серпень
  
  // Узгоджені фільтри: Джерело (Дані / Структура), конкретний елемент та рядок уточнення (виконавець, статус тощо)
  const [sourceType, setSourceType] = useState<'data' | 'structure'>('structure');
  const [selectedItem, setSelectedItem] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handlePrevYear = () => setYearIndex(prev => (prev > 0 ? prev - 1 : YEARS_LIST.length - 1));
  const handleNextYear = () => setYearIndex(prev => (prev < YEARS_LIST.length - 1 ? prev + 1 : 0));

  const handlePrevMonth = () => setMonthIndex(prev => (prev > 0 ? prev - 1 : MONTHS_LIST.length - 1));
  const handleNextMonth = () => setMonthIndex(prev => (prev < MONTHS_LIST.length - 1 ? prev + 1 : 0));

  // 1. ПРАВИЛО: Беремо ВИКЛЮЧНО активні проєкти (ігноруємо архів та кошик)
  const activeProjects = projects.filter(p => (p.status || 'active') === 'active');

  // 2. Збираємо списки для другого випадаючого меню з активних проєктів
  const availableDataFields = Array.from(
    new Set(
      activeProjects.flatMap(p => (p.passportRows || []).map(r => r.label).filter(Boolean))
    )
  );

  const availableStructureStages = Array.from(
    new Set(
      activeProjects.flatMap(p => (p.stages || []).map(s => s.title).filter(Boolean))
    )
  );

  const currentOptions = sourceType === 'data' ? availableDataFields : availableStructureStages;

  // 3. Розрахунок даних для діаграми та списку відповідно до фільтрів
  const chartData = activeProjects.map((proj, index) => {
    let count = 0;
    const query = searchQuery.toLowerCase().trim();

    if (sourceType === 'data') {
      (proj.passportRows || []).forEach(r => {
        const label = (r.label || '').toLowerCase();
        const val = (r.value || '').toLowerCase();
        
        const matchItem = !selectedItem || label.includes(selectedItem.toLowerCase());
        const matchQuery = !query || label.includes(query) || val.includes(query);

        if (matchItem && matchQuery) {
          const num = parseFloat(r.value);
          count += !isNaN(num) ? num : 1;
        }
      });
    } else {
      // Структура (стадії)
      (proj.stages || []).forEach(st => {
        const title = (st.title || '').toLowerCase();
        const currentStatus = (st.currentStatus || '').toLowerCase();
        
        // Збираємо всіх виконавців стадії
        const stageContractors: string[] = (st as any).contractors || (st.contractor ? [st.contractor] : []);
        const contractorsStr = stageContractors.join(' ').toLowerCase();

        const matchItem = !selectedItem || title.includes(selectedItem.toLowerCase());
        
        // Перевіряємо уточнення (пошук по виконавцю, статусу чи назві)
        const matchQuery = !query || 
          title.includes(query) || 
          currentStatus.includes(query) || 
          contractorsStr.includes(query);

        if (matchItem && matchQuery) {
          count += 1;
        }
      });
    }

    return {
      name: `${proj.name} (${proj.id || 'без ID'})`,
      shortName: proj.name,
      projectId: proj.id,
      value: count,
      color: proj.color || CHART_COLORS[index % CHART_COLORS.length]
    };
  }).filter(item => item.value > 0); // Відображаємо тільки ті активні проєкти, де є збіги за критерієм

  const totalCenterValue = chartData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto', color: '#1c1c1e', paddingBottom: '80px' }}>
      
      {/* ПАНЕЛЬ ПЕРІОДУ */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px', backgroundColor: '#f9f9fb', padding: '12px', borderRadius: '12px', border: '1px solid #e5e5ea' }}>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
          {(['week', 'month', 'year'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              style={{
                flex: 1,
                padding: '6px 0',
                borderRadius: '6px',
                border: 'none',
                background: period === p ? '#007aff' : '#e5e5ea',
                color: period === p ? '#fff' : '#3a3a3c',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '12px'
              }}
            >
              {p === 'week' ? 'Тиждень' : p === 'month' ? 'Місяць' : 'Рік'}
            </button>
          ))}
        </div>

        {/* Вибір року */}
        {period === 'year' && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '2px 0' }}>
            <button onClick={handlePrevYear} style={arrowBtnStyle}>◀</button>
            <div style={selectorTextStyle}>{YEARS_LIST[yearIndex]}</div>
            <button onClick={handleNextYear} style={arrowBtnStyle}>▶</button>
          </div>
        )}

        {/* Вибір місяця */}
        {period === 'month' && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '2px 0' }}>
            <button onClick={handlePrevMonth} style={arrowBtnStyle}>◀</button>
            <div style={selectorTextStyle}>{MONTHS_LIST[monthIndex]}</div>
            <button onClick={handleNextMonth} style={arrowBtnStyle}>▶</button>
          </div>
        )}

        {/* УНІВЕРСАЛЬНА ПАНЕЛЬ ФІЛЬТРАЦІЇ (Джерело -> Заголовок -> Уточнення) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            {/* 1. Вибір стовпчика: ДАНІ чи СТРУКТУРА */}
            <select
              value={sourceType}
              onChange={(e) => {
                setSourceType(e.target.value as 'data' | 'structure');
                setSelectedItem('');
              }}
              style={inputStyle}
            >
              <option value="data">📊 Дані (Паспорт)</option>
              <option value="structure">📑 Структура (Стадії)</option>
            </select>

            {/* 2. Вибір конкретного заголовка */}
            <select
              value={selectedItem}
              onChange={(e) => setSelectedItem(e.target.value)}
              style={inputStyle}
            >
              <option value="">Усі заголовки</option>
              {currentOptions.map((opt, idx) => (
                <option key={idx} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* 3. Рядок уточнення (Тег, Виконавець, Статус тощо) */}
          <input
            type="text"
            placeholder="Уточнення (напр., Іван Драго, Завершено)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={inputStyle}
          />
        </div>
      </div>

      {/* РАДІАЛЬНА (КРУГОВА) ДІАГРАМА З ПРОЄКТАМИ ТА ID НА ВИНОСКАХ */}
      {chartData.length > 0 ? (
        <div style={{ position: 'relative', height: '240px', marginBottom: '20px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie 
                data={chartData} 
                innerRadius={60} 
                outerRadius={85} 
                paddingAngle={4} 
                dataKey="value"
                label={({ shortName, projectId }) => `${shortName} (${projectId || 'ід відсутній'})`}
                labelLine={true}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any) => [value, 'Кількість']} />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Центр кола з загальним підсумком */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -60px)',
            textAlign: 'center',
            fontSize: '22px',
            fontWeight: 800,
            color: '#1c1c1e',
            pointerEvents: 'none'
          }}>
            {totalCenterValue}
            <div style={{ fontSize: '11px', color: '#8e8e93', fontWeight: 400 }}>Загалом</div>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', color: '#8e8e93', fontSize: '13px', padding: '40px 0', backgroundColor: '#f9f9fb', borderRadius: '12px', marginBottom: '20px' }}>
          Немає даних для відображення за вибраними критеріями в активних проєктах.
        </div>
      )}

      {/* СПИСОК АКТИВНИХ ПРОЄКТІВ ЗА РЕЗУЛЬТАТАМИ ПОШУКУ */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {chartData.map((item) => (
          <div key={item.projectId || item.name} style={{ backgroundColor: '#f2f2f7', padding: '12px 16px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e5e5ea' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: item.color }} />
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700 }}>{item.shortName}</div>
                <div style={{ fontSize: '11px', color: '#8e8e93' }}>ID: {item.projectId || 'не вказано'}</div>
              </div>
            </div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: item.color }}>
              {item.value}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

const arrowBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  fontSize: '14px',
  cursor: 'pointer',
  color: '#1c1c1e',
  fontWeight: 700
};

const selectorTextStyle: React.CSSProperties = {
  textAlign: 'center',
  fontSize: '14px',
  fontWeight: 700,
  color: '#1c1c1e',
  borderBottom: '2px solid #1c1c1e',
  paddingBottom: '2px',
  minWidth: '100px'
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
