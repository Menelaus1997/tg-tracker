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
  const [weekOffset, setWeekOffset] = useState(0); // Тиждень (зміщення відносно поточного)
  
  const [sourceType, setSourceType] = useState<'data' | 'structure'>('structure');
  const [selectedItem, setSelectedItem] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const [showHelp, setShowHelp] = useState<boolean>(false);

  const handlePrevYear = () => setYearIndex(prev => (prev > 0 ? prev - 1 : YEARS_LIST.length - 1));
  const handleNextYear = () => setYearIndex(prev => (prev < YEARS_LIST.length - 1 ? prev + 1 : 0));

  const handlePrevMonth = () => setMonthIndex(prev => (prev > 0 ? prev - 1 : MONTHS_LIST.length - 1));
  const handleNextMonth = () => setMonthIndex(prev => (prev < MONTHS_LIST.length - 1 ? prev + 1 : 0));

  const handlePrevWeek = () => setWeekOffset(prev => prev - 1);
  const handleNextWeek = () => setWeekOffset(prev => prev + 1);

  // Формування назви поточного тижня для відображення
  const getWeekRangeLabel = (offset: number) => {
    const now = new Date();
    const firstDayOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 1 + offset * 7));
    const lastDayOfWeek = new Date(firstDayOfWeek);
    lastDayOfWeek.setDate(lastDayOfWeek.getDate() + 6);

    const format = (d: Date) => `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}`;
    return `${format(firstDayOfWeek)} — ${format(lastDayOfWeek)}`;
  };

  const currentYear = Number(YEARS_LIST[yearIndex]);
  const today = new Date();
  const currentRealYear = today.getFullYear();
  const currentRealMonth = today.getMonth();

  const isPastPeriod = currentYear < currentRealYear || (currentYear === currentRealYear && monthIndex < currentRealMonth);
  
  const safeProjects = projects || [];
  const targetProjects = safeProjects.filter(p => {
    const status = p.status || 'active';
    if (status === 'trash') return false;
    if (status === 'active') return true;
    if (status === 'archived') return isPastPeriod;
    return false;
  });

  // Автоматичне підтягування актуальних назв заголовків (синхронізовано з проєктами)
  const availableDataFields = Array.from(
    new Set(
      targetProjects.flatMap(p => (p.passportRows || []).map(r => r.label).filter(Boolean))
    )
  );

  const availableStructureStages = Array.from(
    new Set(
      targetProjects.flatMap(p => (p.stages || []).map(s => s.title).filter(Boolean))
    )
  );

  const currentOptions = sourceType === 'data' ? availableDataFields : availableStructureStages;

  // Аналіз команд із пошукового рядка
  const queryText = searchQuery.trim();
  const isTimeOp = queryText.includes('#') || queryText.toLowerCase().includes('⏱');
  const isHoursMode = queryText.includes('# 1') || queryText.includes('#1');
  const isPercentOp = queryText.includes('%');
  const isAverageOp = queryText.includes('&');
  
  const cleanQuery = queryText.replace(/[#%&@10]/g, '').trim().toLowerCase();

  const chartData = targetProjects.map((proj, index) => {
    let resultValue = 0;
    let matchCount = 0;

    if (sourceType === 'data') {
      (proj.passportRows || []).forEach(r => {
        const label = (r.label || '').toLowerCase();
        const valStr = r.value || '';
        const numVal = parseFloat(valStr) || 1;

        const matchItem = !selectedItem || label.includes(selectedItem.toLowerCase());
        const matchQuery = !cleanQuery || label.includes(cleanQuery) || valStr.toLowerCase().includes(cleanQuery);

        if (matchItem && matchQuery) {
          matchCount++;
          resultValue += numVal;
        }
      });
    } else {
      if (isPercentOp) {
        let totalSubs = 0;
        let completedSubs = 0;

        (proj.stages || []).forEach(st => {
          const title = (st.title || '').toLowerCase();
          const stageContractors: string[] = (st as any).contractors || (st.contractor ? [st.contractor] : []);
          const contractorsStr = stageContractors.join(' ').toLowerCase();

          const matchItem = !selectedItem || title.includes(selectedItem.toLowerCase());
          const matchQuery = !cleanQuery || title.includes(cleanQuery) || contractorsStr.includes(cleanQuery);

          if (matchItem && matchQuery) {
            const subStages = st.subStages || [];
            subStages.forEach((sub: any) => {
              totalSubs++;
              if (sub.completed) completedSubs++;

              const nested = sub.nestedItems || [];
              nested.forEach((item: any) => {
                totalSubs++;
                if (item.completed) completedSubs++;
              });
            });
          }
        });

        resultValue = totalSubs > 0 ? Math.round((completedSubs / totalSubs) * 100) : 0;
        matchCount = totalSubs > 0 ? 1 : 0;
      } else {
        (proj.stages || []).forEach(st => {
          const title = (st.title || '').toLowerCase();
          const currentStatus = (st.currentStatus || '').toLowerCase();
          const stageContractors: string[] = (st as any).contractors || (st.contractor ? [st.contractor] : []);
          const contractorsStr = stageContractors.join(' ').toLowerCase();

          const matchItem = !selectedItem || title.includes(selectedItem.toLowerCase());
          const matchQuery = !cleanQuery || 
            title.includes(cleanQuery) || 
            currentStatus.includes(cleanQuery) || 
            contractorsStr.includes(cleanQuery);

          if (matchItem && matchQuery) {
            matchCount++;
            if (isTimeOp) {
              if (isHoursMode) {
                const loggedSec = (st as any).loggedSeconds || 0;
                const hours = loggedSec > 0 ? loggedSec / 3600 : 8; 
                resultValue += hours;
              } else {
                let days = 0;
                if (st.startDate && st.endDate) {
                  const [sY, sM, sD] = st.startDate.split('-').map(Number);
                  const [eY, eM, eD] = st.endDate.split('-').map(Number);
                  const startD = new Date(sY, sM - 1, sD);
                  const endD = new Date(eY, eM - 1, eD);
                  days = Math.ceil(Math.abs(endD.getTime() - startD.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                }
                resultValue += days > 0 ? days : 1;
              }
            } else {
              resultValue += 1;
            }
          }
        });
      }
    }

    if (isAverageOp && matchCount > 0) {
      resultValue = Number((resultValue / matchCount).toFixed(1));
    }

    return {
      name: `${proj.name} (${proj.id || 'без ID'})`,
      shortName: proj.name,
      projectId: proj.id,
      value: isHoursMode ? Number(resultValue.toFixed(1)) : Math.round(resultValue),
      color: proj.color || CHART_COLORS[index % CHART_COLORS.length]
    };
  }).filter(item => item.value > 0 || isPercentOp);

  const totalCenterValue = isAverageOp && chartData.length > 0 
    ? Number((chartData.reduce((acc, curr) => acc + curr.value, 0) / chartData.length).toFixed(1))
    : chartData.reduce((acc, curr) => acc + curr.value, 0);

  let centerLabel = 'Загалом';
  if (isPercentOp) centerLabel = 'Виконання';
  else if (isTimeOp) centerLabel = isHoursMode ? 'Годин загалом' : 'Днів загалом';

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto', color: '#1c1c1e', paddingBottom: '80px', boxSizing: 'border-box' }}>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px', backgroundColor: '#f9f9fb', padding: '12px', borderRadius: '12px', border: '1px solid #e5e5ea', boxSizing: 'border-box' }}>
        
        {/* Перемикач періодів */}
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

        {/* Навігація для Тижня */}
        {period === 'week' && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '2px 0' }}>
            <button onClick={handlePrevWeek} style={arrowBtnStyle}>◀</button>
            <div style={selectorTextStyle}>{getWeekRangeLabel(weekOffset)}</div>
            <button onClick={handleNextWeek} style={arrowBtnStyle}>▶</button>
          </div>
        )}

        {/* Навігація для Року */}
        {period === 'year' && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '2px 0' }}>
            <button onClick={handlePrevYear} style={arrowBtnStyle}>◀</button>
            <div style={selectorTextStyle}>{YEARS_LIST[yearIndex]}</div>
            <button onClick={handleNextYear} style={arrowBtnStyle}>▶</button>
          </div>
        )}

        {/* Навігація для Місяця */}
        {period === 'month' && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '2px 0' }}>
            <button onClick={handlePrevMonth} style={arrowBtnStyle}>◀</button>
            <div style={selectorTextStyle}>{MONTHS_LIST[monthIndex]}</div>
            <button onClick={handleNextMonth} style={arrowBtnStyle}>▶</button>
          </div>
        )}

        {/* Фільтри та селекти з фіксованим обмеженням ширини */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px', width: '100%', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', gap: '8px', width: '100%', boxSizing: 'border-box' }}>
            <select
              value={sourceType}
              onChange={(e) => {
                setSourceType(e.target.value as 'data' | 'structure');
                setSelectedItem('');
              }}
              style={{ ...inputStyle, flex: 1, minWidth: 0 }}
            >
              <option value="data">📊 Дані (Паспорт)</option>
              <option value="structure">📑 Структура (Стадії)</option>
            </select>

            {/* Суворе обмеження ширини селекта, щоб не виходив за межі знаку ? */}
            <select
              value={selectedItem}
              onChange={(e) => setSelectedItem(e.target.value)}
              style={{ ...inputStyle, flex: 1, minWidth: 0, maxWidth: 'calc(50% - 4px)' }}
            >
              <option value="">Усі заголовки</option>
              {currentOptions.map((opt, idx) => (
                <option key={idx} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', width: '100%', boxSizing: 'border-box' }}>
            <input
              type="text"
              placeholder="Уточнення (# 0 — дні, # 1 — години)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ ...inputStyle, flex: 1, minWidth: 0 }}
            />
            <button
              onClick={() => setShowHelp(!showHelp)}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: showHelp ? '#007aff' : '#e5e5ea',
                color: showHelp ? '#ffffff' : '#1c1c1e',
                border: 'none',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
              title="Довідка по символах"
            >
              ?
            </button>
          </div>

          {showHelp && (
            <div style={{ backgroundColor: '#ffffff', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d1d6', fontSize: '11px', color: '#3a3a3c', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ fontWeight: 700, marginBottom: '2px', color: '#007aff' }}>Швидкі символи-команди:</div>
              <div><strong># 0</strong> (або #) — підрахунок у <strong>днях</strong></div>
              <div><strong># 1</strong> — підрахунок у <strong>годинах</strong></div>
              <div><strong>%</strong> — розрахунок відсотка виконання</div>
              <div><strong>&</strong> — середнє арифметичне значення</div>
              <div><strong>@Ім'я</strong> — фільтрація за виконавцем</div>
            </div>
          )}
        </div>
      </div>

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
              <Tooltip formatter={(value: any) => [isPercentOp ? `${value}%` : `${value} ${isTimeOp ? (isHoursMode ? 'год.' : 'дн.') : ''}`, 'Показник']} />
            </PieChart>
          </ResponsiveContainer>
          
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
            {totalCenterValue}{isPercentOp ? '%' : ''}
            <div style={{ fontSize: '11px', color: '#8e8e93', fontWeight: 400 }}>{centerLabel}</div>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', color: '#8e8e93', fontSize: '13px', padding: '40px 0', backgroundColor: '#f9f9fb', borderRadius: '12px', marginBottom: '20px' }}>
          Немає даних для відображення за вибраними критеріями.
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {chartData.map((item) => (
          <div key={item.projectId || item.name} style={{ backgroundColor: '#f2f2f7', padding: '12px 16px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e5e5ea', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: item.color }} />
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700 }}>{item.shortName}</div>
                <div style={{ fontSize: '11px', color: '#8e8e93' }}>ID: {item.projectId || 'не вказано'}</div>
              </div>
            </div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: item.color }}>
              {item.value}{isPercentOp ? '%' : isTimeOp ? (isHoursMode ? ' год.' : ' дн.') : ''}
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
