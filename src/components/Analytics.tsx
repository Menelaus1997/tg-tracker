import React, { useState } from 'react';
import { Project, TeamMember } from '../App';

interface AnalyticsProps {
  projects: Project[];
  teamDatabase: TeamMember[];
}

export const Analytics: React.FC<AnalyticsProps> = ({ projects }) => {
  const [collapsedProjects, setCollapsedProjects] = useState<{ [key: string]: boolean }>({});
  const [showWorkload, setShowWorkload] = useState(false);
  const [expandedStages, setExpandedStages] = useState<{ [key: string]: boolean }>({});

  const toggleProject = (id: string) => {
    setCollapsedProjects(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleStageDetails = (stageKey: string) => {
    setExpandedStages(prev => ({ ...prev, [stageKey]: !prev[stageKey] }));
  };

  const currentDate = new Date().toISOString().split('T')[0];

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto', color: '#1c1c1e' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>📊 Аналітика та прогрес</h2>
        
        {/* Повзунок Людино-години / Дні */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 600 }}>
          <span>Години / Дні</span>
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

            return (
              <div key={proj.id} style={{ backgroundColor: '#f2f2f7', padding: '16px', borderRadius: '12px', border: '1px solid #e5e5ea' }}>
                <div 
                  onClick={() => toggleProject(proj.id)}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', marginBottom: '10px' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', color: '#8e8e93' }}>{isProjCollapsed ? '▼' : '▲'}</span>
                    <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>{proj.name} ({proj.id})</h3>
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#007aff' }}>{projectProgress}%</span>
                </div>

                <div style={{ width: '100%', height: '6px', backgroundColor: '#e5e5ea', borderRadius: '3px', overflow: 'hidden', marginBottom: '12px' }}>
                  <div style={{ width: `${projectProgress}%`, height: '100%', backgroundColor: proj.color || '#007aff', transition: 'width 0.3s' }} />
                </div>

                {!isProjCollapsed && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                    {stages.map((st, index) => {
                      const stageKey = `${proj.id}-${st.id}`;
                      const isStageExpanded = expandedStages[stageKey];
                      
                      const subCount = st.subStages?.length || 0;
                      const compCount = st.subStages?.filter(sub => sub.completed)?.length || 0;
                      const stageProgress = subCount > 0 ? Math.round((compCount / subCount) * 100) : (st.loggedSeconds ? 100 : 0);

                      const endDate = st.endDate;
                      let deadlineColor = 'transparent';
                      let deadlineText = '';
                      if (endDate) {
                        if (stageProgress === 100) {
                          deadlineColor = '#34c759';
                          deadlineText = `Дедлайн: ${endDate} (Вчасно)`;
                        } else if (endDate < currentDate) {
                          deadlineColor = '#ff3b30';
                          deadlineText = `Дедлайн: ${endDate} (Прострочено)`;
                        } else {
                          deadlineText = `Дедлайн: ${endDate}`;
                        }
                      }

                      const totalHours = ((st.loggedSeconds || 0) / 3600).toFixed(1);
                      const totalDays = ((parseFloat(totalHours) / 8)).toFixed(1);

                      return (
                        <div key={st.id} style={{ backgroundColor: '#ffffff', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e5e5ea' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {showWorkload && (
                                <span 
                                  onClick={() => toggleStageDetails(stageKey)}
                                  style={{ cursor: 'pointer', fontSize: '11px', color: '#8e8e93' }}
                                >
                                  {isStageExpanded ? '▼' : '▲'}
                                </span>
                              )}
                              <span style={{ fontSize: '13px', fontWeight: 600 }}>{index + 1}. {st.title}</span>
                            </div>
                            <span style={{ fontSize: '12px', fontWeight: 600, color: '#636366' }}>{stageProgress}%</span>
                          </div>

                          {/* Відображення виконавця / підрядника під назвою стадії */}
                          <div style={{ fontSize: '11px', color: '#007aff', marginBottom: '4px', fontWeight: 500 }}>
                            Виконавець: {st.contractor || 'Не вказано'}
                          </div>

                          {deadlineText && (
                            <div style={{ fontSize: '11px', color: deadlineColor !== 'transparent' ? deadlineColor : '#8e8e93', marginBottom: '6px', fontWeight: 600 }}>
                              {deadlineText}
                            </div>
                          )}

                          <div style={{ width: '100%', height: '4px', backgroundColor: '#f2f2f7', borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{ width: `${stageProgress}%`, height: '100%', backgroundColor: stageProgress === 100 ? '#34c759' : '#007aff' }} />
                          </div>

                          {showWorkload && isStageExpanded && (
                            <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #f2f2f7', fontSize: '12px', color: '#3a3a3c', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <div><strong>Витрачено часу:</strong> {totalHours} год ({totalDays} дн.)</div>
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
