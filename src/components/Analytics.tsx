import React, { useState } from 'react';
import { Project, TeamMember } from '../App';

interface AnalyticsProps {
  projects: Project[];
  teamDatabase: TeamMember[];
}

export const Analytics: React.FC<AnalyticsProps> = ({ projects }) => {
  const [collapsedProjects, setCollapsedProjects] = useState<{ [key: string]: boolean }>({});
  const [showWorkload, setShowWorkload] = useState(false);

  const toggleProject = (id: string) => {
    setCollapsedProjects(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto', color: '#1c1c1e' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>📊 Аналітика та прогрес</h2>
        
        {/* Тумблер Години / Дні (без текстової назви) */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div
            onClick={() => setShowWorkload(!showWorkload)}
            style={{
              width: '34px',
              height: '20px',
              borderRadius: '10px',
              backgroundColor: showWorkload ? '#34c759' : '#e5e5ea',
              position: 'relative',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            <div
              style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                backgroundColor: '#fff',
                position: 'absolute',
                top: '2px',
                left: showWorkload ? '16px' : '2px',
                transition: 'left 0.2s'
              }}
            />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {projects.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#8e8e93', fontSize: '13px', marginTop: '20px' }}>
            No projects available for analytics.
          </div>
        ) : (
          projects.map((proj) => {
            const isProjCollapsed = collapsedProjects[proj.id];
            const stages = proj.stages || [];
            
            const totalSubStages = stages.reduce((acc, st) => acc + (st.subStages?.length || 0), 0);
            const completedSubStages = stages.reduce((acc, st) => {
              return acc + (st.subStages?.filter(sub => sub.completed)?.length || 0);
            }, 0);
            const projectProgress = totalSubStages > 0 ? Math.round((completedSubStages / totalSubStages) * 100) : 0;
            const projectColor = proj.color || '#007aff';

            // Підрахунок загального часу та днів по всьому проєкту
            const totalProjectSeconds = stages.reduce((acc, st) => acc + (st.loggedSeconds || 0), 0);
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
                  {/* Жирний відсоток проєкту, вирівняний вліво до рівня відсотків стадій */}
                  <span style={{ fontSize: '13px', fontWeight: 700, color: projectColor, marginRight: '22px' }}>
                    {projectProgress}%
                  </span>
                </div>

                {/* Загальний час та дні по проєкту (з'являється при увімкненому тумблері) */}
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
                      const compCount = st.subStages?.filter(sub => sub.completed)?.length || 0;
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

                      const loggedSec = st.loggedSeconds || 0;
                      let stageDays = 0;
                      if (st.startDate && st.endDate) {
                        const [sY, sM, sD] = st.startDate.split('-').map(Number);
                        const [eY, eM, eD] = st.endDate.split('-').map(Number);
                        const startD = new Date(sY, sM - 1, sD);
                        const endD = new Date(eY, eM - 1, eD);
                        const diffTime = Math.abs(endD.getTime() - startD.getTime());
                        stageDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                      }
                      
                      const totalHoursNum = loggedSec / 3600;
                      const calculatedDays = totalHoursNum > 0 && totalHoursNum <= 8 ? 1 : Math.ceil(totalHoursNum / 8);
                      const finalDays = stageDays > 0 ? stageDays : calculatedDays;

                      return (
                        <div key={st.id} style={{ backgroundColor: '#ffffff', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e5e5ea' }}>
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
