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

export const Analytics: React.FC<AnalyticsProps> = ({ projects }) => {
  const [period, setPeriod] = useState<FilterPeriod>('month');
  const [metric, setMetric] = useState<MetricType>('count');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Додаткові стани для вибору конкретного місяця та року під кнопками
  const [selectedMonth, setSelectedMonth] = useState('08.2026');
  const [selectedYear, setSelectedYear] = useState('2026');
  
  const [collapsedProjects, setCollapsedProjects] = useState<{ [key: string]: boolean }>({});
  
  // Детальний час вшито в код назавжди (завжди true)
  const showWorkload = true;

  const toggleProject = (id: string) => {
    setCollapsedProjects(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 1. Фільтрація проєктів та підзадач за текстовим запитом
  const filteredProjects = projects.map(proj => {
    const stages = proj.stages || [];
    
    if (!searchTerm.trim()) return proj;

    const query = searchTerm.toLowerCase();
    const matchesProjectName = proj.name.toLowerCase().includes(query) || proj.id.toLowerCase().includes(query);
    
    if (matchesProjectName) return proj;

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
    const hasStages = (proj.stages || []).length > 0;
    return matchesProj || hasStages;
  });

  // 2. Формуємо дані для кругової діаграми
  const chartData = filteredProjects.map((proj, index) => {
    const stages = proj.stages || [];
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

    const hours = Number((totalSec / 3600).toFixed(1));
    const stagesCount = stages.length;

    return {
      name: proj.name,
      value: metric === 'time' ? hours : (stagesCount > 0 ? stagesCount : 1),
      color: proj.color || CHART_COLORS[index % CHART_COLORS.length]
    };
  });

  const totalCenterValue = chartData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto', color: '#1c1c1e', paddingBottom: '80px' }}>
      
      {/* ПАНЕЛЬ ФІЛЬТРІВ ТА ПЕРІОДУ */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px', backgroundColor: '#f9f9fb', padding: '12px', borderRadius: '12px', border: '1px solid #e5e5ea' }}>
        
        {/* Вибір періоду */}
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

        {/* Додатковий селектор конкретного місяця або року під кнопками (з'являється відповідно до вибраного періоду) */}
        {period === 'month' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              style={{ padding: '6px 8px', borderRadius: '8px', border: '1px solid #c7c7cc', fontSize: '12px', background: '#fff', fontWeight: 600 }}
            >
              <option value="01.2026">Січень 2026</option>
              <option value="02.2026">Лютий 2026</option>
              <option value="03.2026">Березень 2026</option>
              <option value="04.2026">Квітень 2026</option>
              <option value="05.2026">Травень 2026</option>
              <option value="06.2026">Червень 2026</option>
              <option value="07.2026">Липень 2026</option>
              <option value="08.2026">Серпень 2026</option>
              <option value="09.2026">Вересень 2026</option>
              <option value="10.2026">Жовтень 2026</option>
              <option value="11.2026">Листопад 2026</option>
              <option value="12.2026">Грудень 2026</option>
            </select>
          </div>
        )}

        {period === 'year' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              style={{ padding: '6px 8px', borderRadius: '8px', border: '1px solid #c7c7cc', fontSize: '12px', background: '#fff', fontWeight: 600 }}
            >
              <option value="2025">2025 рік</option>
              <option value="2026">2026 рік</option>
              <option value="2027">2027 рік</option>
            </select>
          </div>
        )}

        {/* Метрика та Текстовий пошук */}
        <div style={{ display: 'flex', gap: '8px' }}>
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
            placeholder="Пошук (напр., ХАЙТАК)..."
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
            {metric === 'time' ? `${totalCenterValue.toFixed(1)}h` : totalCenterValue}
            <div style={{ fontSize: '11px', color: '#8e8e93', fontWeight: 400 }}>Загалом</div>
          </div>
        </div>
      )}

      {/* СПИСОК ПРОЄКТІВ З ДЕТАЛЬНИМ ЧАСОМ */}
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
