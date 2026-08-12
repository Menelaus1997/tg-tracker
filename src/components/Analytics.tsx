import React, { useState } from 'react';
import { Project, TeamMember } from '../App';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface AnalyticsProps {
  projects: Project[];
  teamDatabase: TeamMember[];
}

type FilterPeriod = 'week' | 'month' | 'year';
type MetricType = 'count' | 'time';

const CHART_COLORS = ['#007aff', '#34c759', '#ff9500', '#af52de', '#ff2d55', '#5856d6'];

const MONTHS_LIST = [
  'Січень', 'Лютий', 'Березень', 'Квітень',
  'Травень', 'Червень', 'Липень', 'Серпень',
  'Вересень', 'Жовтень', 'Листопад', 'Грудень'
];

const YEARS_LIST = ['2025', '2026', '2027'];

interface WeekRange {
  label: string;
  startDate: Date;
  endDate: Date;
}

const getWeeksForMonth = (year: number, monthIndex: number): WeekRange[] => {
  const weeks: WeekRange[] = [];
  const firstDayOfMonth = new Date(year, monthIndex, 1);
  const lastDayOfMonth = new Date(year, monthIndex + 1, 0);

  let current = new Date(firstDayOfMonth);
  const dayOfWeek = current.getDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  current.setDate(current.getDate() + diffToMonday);

  while (current <= lastDayOfMonth || weeks.length === 0) {
    const start = new Date(current);
    const end = new Date(current);
    end.setDate(end.getDate() + 6);

    weeks.push({
      label: `${String(start.getDate()).padStart(2, '0')}.${String(start.getMonth() + 1).padStart(2, '0')} - ${String(end.getDate()).padStart(2, '0')}.${String(end.getMonth() + 1).padStart(2, '0')}`,
      startDate: start,
      endDate: end
    });

    current.setDate(current.getDate() + 7);
    if (weeks.length > 5) break;
  }

  return weeks;
};

export const Analytics: React.FC<AnalyticsProps> = ({ projects }) => {
  const [period, setPeriod] = useState<FilterPeriod>('month');
  const [metric, setMetric] = useState<MetricType>('count');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [yearIndex, setYearIndex] = useState(1);   // 2026
  const [monthIndex, setMonthIndex] = useState(7); // Серпень
  const [weekIndex, setWeekIndex] = useState(0);   
  
  const [collapsedProjects, setCollapsedProjects] = useState<{ [key: string]: boolean }>({});
  
  const showWorkload = true;

  const currentYear = Number(YEARS_LIST[yearIndex]);
  const currentWeeksList = getWeeksForMonth(currentYear, monthIndex);

  const toggleProject = (id: string) => {
    setCollapsedProjects(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const handlePrevYear = () => setYearIndex(prev => (prev > 0 ? prev - 1 : YEARS_LIST.length - 1));
  const handleNextYear = () => setYearIndex(prev => (prev < YEARS_LIST.length - 1 ? prev + 1 : 0));

  const handlePrevMonth = () => setMonthIndex(prev => {
    const next = prev > 0 ? prev - 1 : MONTHS_LIST.length - 1;
    setWeekIndex(0);
    return next;
  });
  const handleNextMonth = () => setMonthIndex(prev => {
    const next = prev < MONTHS_LIST.length - 1 ? prev + 1 : 0;
    setWeekIndex(0);
    return next;
  });

  const handlePrevWeek = () => setWeekIndex(prev => (prev > 0 ? prev - 1 : currentWeeksList.length - 1));
  const handleNextWeek = () => setWeekIndex(prev => (prev < currentWeeksList.length - 1 ? prev + 1 : 0));

  // 1. Фільтрація проєктів за текстовим запитом (включно з пошуком по полях "Дані", напр. "Загальна площа")
  const filteredProjects = projects.map(proj => {
    const stages = proj.stages || [];
    const passportRows = (proj as any).passportRows || [];
    
    if (!searchTerm.trim()) return proj;

    const query = searchTerm.toLowerCase();
    const matchesProjectName = proj.name.toLowerCase().includes(query) || proj.id.toLowerCase().includes(query);
    
    // Перевіряємо, чи є збіг у полях "Дані" (passportRows: назва або значення)
    const matchesPassport = passportRows.some((row: any) => 
      (row.label || '').toLowerCase().includes(query) || (row.value || '').toLowerCase().includes(query)
    );

    if (matchesProjectName || matchesPassport) return proj;

    const filteredStages = stages.filter(st => 
      st.title.toLowerCase().includes(query) ||
      (st.subStages || []).some((sub: any) => sub.title.toLowerCase().includes(query))
    );

    return {
      ...proj,
      stages: filteredStages
    };
  }).filter(proj => {
    if (!searchTerm.trim()) return true;
    const query = searchTerm.toLowerCase();
    const matchesProj = proj.name.toLowerCase().includes(query) || proj.id.toLowerCase().includes(query);
    const passportRows = (proj as any).passportRows || [];
    const matchesPassport = passportRows.some((row: any) => 
      (row.label || '').toLowerCase().includes(query) || (row.value || '').toLowerCase().includes(query)
    );
    const hasStages = (proj.stages || []).length > 0;
    return matchesProj || matchesPassport || hasStages;
  });

  // 2. Формуємо дані для кругової діаграми (з урахуванням уточнення в пошуку по числових значеннях "Даних")
  const chartData = filteredProjects.map((proj, index) => {
    const stages = proj.stages || [];
    const passportRows = (proj as any).passportRows || [];
    let numericValue = 0;

    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase();
      passportRows.forEach((row: any) => {
        const label = (row.label || '').toLowerCase();
        // Якщо назва рядка містить пошуковий запит (напр. "загальна площа"), беремо його числове значення
        if (label.includes(query)) {
          const parsed = parseFloat(row.value);
          if (!isNaN(parsed)) {
            numericValue += parsed;
          }
        }
      });
    }

    // Якщо за пошуком по даних нічого не знайшлось, падаємо на стандартний розрахунок (кількість етапів або час)
    if (numericValue === 0 && searchTerm.trim()) {
      numericValue = metric === 'time' ? 0 : stages.length > 0 ? stages.length : 1;
    } else if (!searchTerm.trim()) {
      if (metric === 'time') {
        let totalSec = 0;
        stages.forEach(st => {
          let stageCalendarDays = 0;
          if (st.startDate && st.endDate) {
            const [sY, sM, sD] = st.startDate.split('-').map(Number);
            const [eY, eM, eD] = st.endDate.split('-').map(Number);
            const startD = new Date(sY, sM - 1, sD);
            const endD = new Date(eY, eM - 1, eD);
            const diffTime = Math.abs(endD.getTime() - startD.getTime());
            stageCalendarDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
          }
          const calendarSec = stageCalendarDays * 8 * 3600;
          const loggedSec = st.loggedSeconds || 0;
          totalSec += Math.max(loggedSec, calendarSec);
        });
        numericValue = Number((totalSec / 3600).toFixed(1));
      } else {
        numericValue = stages.length > 0 ? stages.length : 1;
      }
    }

    return {
      name: proj.name,
      value: numericValue,
      color: proj.color || CHART_COLORS[index % CHART_COLORS.length]
    };
  });

  const totalCenterValue = chartData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto', color: '#1c1c1e', paddingBottom: '80px' }}>
      
      {/* ПАНЕЛЬ ФІЛЬТРІВ ТА ПЕРІОДУ */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px', backgroundColor: '#f9f9fb', padding: '12px', borderRadius: '12px', border: '1px solid #e5e5ea' }}>
        
        {/* Вибір періоду (Тиждень / Місяць / Рік) */}
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

        {/* Тільки для вкладки "Рік" */}
        {period === 'year' && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '2px 0' }}>
            <button onClick={handlePrevYear} style={{ background: 'none', border: 'none', fontSize: '14px', cursor: 'pointer', color: '#1c1c1e', fontWeight: 700 }}>◀</button>
            <div style={{ textAlign: 'center', fontSize: '14px', fontWeight: 700, color: '#1c1c1e', borderBottom: '2px solid #1c1c1e', paddingBottom: '2px', minWidth: '90px' }}>
              {YEARS_LIST[yearIndex]}
            </div>
            <button onClick={handleNextYear} style={{ background: 'none', border: 'none', fontSize: '14px', cursor: 'pointer', color: '#1c1c1e', fontWeight: 700 }}>▶</button>
          </div>
        )}

        {/* Тільки для вкладки "Місяць" */}
        {period === 'month' && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '2px 0' }}>
            <button onClick={handlePrevMonth} style={{ background: 'none', border: 'none', fontSize: '14px', cursor: 'pointer', color: '#1c1c1e', fontWeight: 700 }}>◀</button>
            <div style={{ textAlign: 'center', fontSize: '14px', fontWeight: 700, color: '#1c1c1e', borderBottom: '2px solid #1c1c1e', paddingBottom: '2px', minWidth: '110px' }}>
              {MONTHS_LIST[monthIndex]}
            </div>
            <button onClick={handleNextMonth} style={{ background: 'none', border: 'none', fontSize: '14px', cursor: 'pointer', color: '#1c1c1e', fontWeight: 700 }}>▶</button>
          </div>
        )}

        {/* Тільки для вкладки "Тиждень" */}
        {period === 'week' && currentWeeksList.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '2px 0' }}>
            <button onClick={handlePrevWeek} style={{ background: 'none', border: 'none', fontSize: '14px', cursor: 'pointer', color: '#1c1c1e', fontWeight: 700 }}>◀</button>
            <div style={{ textAlign: 'center', fontSize: '13px', fontWeight: 700, color: '#1c1c1e', borderBottom: '2px solid #1c1c1e', paddingBottom: '2px', minWidth: '130px' }}>
              {currentWeeksList[weekIndex]?.label}
            </div>
            <button onClick={handleNextWeek} style={{ background: 'none', border: 'none', fontSize: '14px', cursor: 'pointer', color: '#1c1c1e', fontWeight: 700 }}>▶</button>
          </div>
        )}

        {/* Метрика та Текстовий пошук (уточнення) */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
          <select
            value={metric}
            onChange={(e) => setMetric(e.target.value as MetricType)}
            style={{ padding: '8px', borderRadius: '8px', border: '1px solid #c7c7cc', fontSize: '12px', flex: 1, background: '#fff' }}
          >
            <option value="count">📊 Кількість (шт)</option>
            <option value="time">⏱️ Час (години)</option>
          </select>

          <input
            type="text"
            placeholder="Уточнення (напр., Загальна площа)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ padding: '8px', borderRadius: '8px', border: '1px solid #c7c7cc', fontSize: '12px', flex: 1, background: '#fff' }}
          />
        </div>
      </div>

      {/* КРУГОВА ДІАГРАМА З ЦЕНТРАЛЬНИМ ЧИСЛОМ */}
      {filteredProjects.length > 0 && (
        <div style={{ position: 'relative', height: '200px', marginBottom: '20px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={chartData} innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -55px)',
            textAlign: 'center',
            fontSize: '20px',
            fontWeight: 700,
            color: '#1c1c1e'
          }}>
            {metric === 'time' && !searchTerm.trim() ? `${totalCenterValue.toFixed(1)}h` : totalCenterValue}
            <div style={{ fontSize: '11px', color: '#8e8e93', fontWeight: 400 }}>Загалом</div>
          </div>
        </div>
      )}

      {/* СПИСОК ПРОЄКТІВ */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredProjects.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#8e8e93', fontSize: '13px', marginTop: '20px' }}>
            Нічого не знайдено за вашим запитом.
          </div>
        ) : (
          filteredProjects.map((proj) => {
            const isProjCollapsed = collapsedProjects[proj.id];
            const stages = proj.stages || [];
            
            const totalSubStages = stages.reduce((acc, st) => acc + (st.subStages?.length || 0), 0);
            const completedSubStages = stages.reduce((acc, st) => {
              return acc + (st.subStages?.filter((sub: any) => sub.completed)?.length || 0);
            }, 0);
            const projectProgress = totalSubStages > 0 ? Math.round((completedSubStages / totalSubStages) * 100) : 0;
            const projectColor = proj.color || '#007aff';

            let totalProjectSeconds = 0;
            stages.forEach(st => {
              let stageCalendarDays = 0;
              if (st.startDate && st.endDate) {
                const [sY, sM, sD] = st.startDate.split('-').map(Number);
                const [eY, eM, eD] = st.endDate.split('-').map(Number);
                const startD = new Date(sY, sM - 1, sD);
                const endD = new Date(eY, eM - 1, eD);
                const diffTime = Math.abs(endD.getTime() - startD.getTime());
                stageCalendarDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
              }
              const calendarSec = stageCalendarDays * 8 * 3600;
              const loggedSec = st.loggedSeconds || 0;
              totalProjectSeconds += Math.max(loggedSec, calendarSec);
            });

            const totalProjectHoursNum = totalProjectSeconds / 3600;
            const totalProjectDays = totalProjectHoursNum > 0 && totalProjectHoursNum <= 8 ? 1 : Math.ceil(totalProjectHoursNum / 8);

            return (
              <div key={proj.id} style={{ backgroundColor: '#f2f2f7', padding: '16px', borderRadius: '12px', border: '1px solid #e5e5ea' }}>
                <div 
                  onClick={() => toggleProject(proj.id)}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', marginBottom: showWorkload ? '4px' : '10px' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', color: '#8e8e93' }}>{isProjCollapsed ? '▼' : '▲'}</span>
                    <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>{proj.name} ({proj.id})</h3>
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: projectColor, marginRight: '10px' }}>
                    {projectProgress}%
                  </span>
                </div>

                {showWorkload && (
                  <div style={{ fontSize: '11px', color: '#636366', marginBottom: '8px', marginLeft: '20px', fontWeight: 500 }}>
                    Total time: {totalProjectHoursNum.toFixed(1)}h ({totalProjectDays} days)
                  </div>
                )}

                <div style={{ width: '100%', height: '6px', backgroundColor: '#e5e5ea', borderRadius: '3px', overflow: 'hidden', marginBottom: '12px' }}>
                  <div style={{ width: `${projectProgress}%`, height: '100%', backgroundColor: projectColor, transition: 'width 0.3s' }} />
                </div>

                {!isProjCollapsed && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                    {stages.map((st, index) => {
                      const subCount = st.subStages?.length || 0;
                      const compCount = st.subStages?.filter((sub: any) => sub.completed)?.length || 0;
                      const stageProgress = subCount > 0 ? Math.round((compCount / subCount) * 100) : (st.loggedSeconds ? 100 : 0);

                      const endDateStr = st.endDate;
                      let statusColor = '#636366';
                      let dateDisplayString = endDateStr || '';

                      if (endDateStr) {
                        const [year, month, day] = endDateStr.split('-').map(Number);
                        const deadlineDate = new Date(year, month - 1, day);
                        deadlineDate.setHours(0, 0, 0, 0);

                        if (stageProgress === 100) {
                          statusColor = '#34c759';
                        } else {
                          if (today > deadlineDate) {
                            statusColor = '#ff3b30';
                            const diffTime = today.getTime() - deadlineDate.getTime();
                            const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
                            dateDisplayString = `${endDateStr} (overdue by ${diffDays} days)`;
                          } else {
                            statusColor = '#34c759';
                          }
                        }
                      }

                      const stageContractors: string[] = (st as any).contractors || (st.contractor ? [st.contractor] : []);
                      const contractorsText = stageContractors.length > 0 ? stageContractors.join(', ') : 'No assignee';

                      let stageCalendarDays = 0;
                      if (st.startDate && st.endDate) {
                        const [sY, sM, sD] = st.startDate.split('-').map(Number);
                        const [eY, eM, eD] = st.endDate.split('-').map(Number);
                        const startD = new Date(sY, sM - 1, sD);
                        const endD = new Date(eY, eM - 1, eD);
                        const diffTime = Math.abs(endD.getTime() - startD.getTime());
                        stageCalendarDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                      }

                      const calendarSec = stageCalendarDays * 8 * 3600;
                      const loggedSec = st.loggedSeconds || 0;
                      const effectiveSec = Math.max(loggedSec, calendarSec);

                      const totalHoursNum = effectiveSec / 3600;
                      const finalDays = stageCalendarDays > 0 ? stageCalendarDays : (totalHoursNum > 0 && totalHoursNum <= 8 ? 1 : Math.ceil(totalHoursNum / 8));

                      return (
                        <div key={st.id || index} style={{ backgroundColor: '#ffffff', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e5e5ea' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <span style={{ fontSize: '13px', fontWeight: 600 }}>{index + 1}. {st.title}</span>
                            <span style={{ fontSize: '12px', fontWeight: 600, color: statusColor }}>{stageProgress}%</span>
                          </div>

                          <div style={{ fontSize: '11px', color: statusColor, marginBottom: '4px', fontWeight: 500 }}>
                            {contractorsText}
                          </div>

                          {dateDisplayString && (
                            <div style={{ fontSize: '11px', color: statusColor, marginBottom: '6px', fontWeight: 600 }}>
                              {dateDisplayString}
                            </div>
                          )}

                          <div style={{ width: '100%', height: '4px', backgroundColor: '#f2f2f7', borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{ width: `${stageProgress}%`, height: '100%', backgroundColor: statusColor }} />
                          </div>

                          {showWorkload && (
                            <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #f2f2f7', fontSize: '12px', color: '#3a3a3c', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <div><strong>Time spent:</strong> {totalHoursNum.toFixed(1)}h ({finalDays} days)</div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Analytics;
