import React, { useState } from 'react';
import { Project, TeamMember } from '../App';

interface AnalyticsProps {
  projects: Project[];
  teamDatabase: TeamMember[];
}

export const Analytics: React.FC<AnalyticsProps> = ({ projects }) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');

  const activeProject = projects.find(p => p.id === selectedProjectId) || projects[0];

  // Розрахунок загального відсотка виконання проєкту на основі виконаних підзадач
  const calculateProjectProgress = (project: Project) => {
    if (!project.stages || project.stages.length === 0) return 0;
    let totalSubtasks = 0;
    let completedSubtasks = 0;

    project.stages.forEach(stage => {
      if (stage.subStages && stage.subStages.length > 0) {
        stage.subStages.forEach((sub: any) => {
          totalSubtasks++;
          if (sub.completed) completedSubtasks++;
        });
      }
    });

    if (totalSubtasks === 0) return 0;
    return Math.round((completedSubtasks / totalSubtasks) * 100);
  };

  // Допоміжна функція для розрахунку днів / прострочень
  const getDaysDifference = (dateStr1: string, dateStr2: string) => {
    const d1 = new Date(dateStr1).getTime();
    const d2 = new Date(dateStr2).getTime();
    const diffTime = d2 - d1;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div style={{ padding: '16px', maxWidth: '600px', margin: '0 auto', color: '#1c1c1e', fontFamily: "'SF Pro Condensed', -apple-system, sans-serif", fontSize: '12px' }}>
      
      {/* Вибір проєкту */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{ fontSize: '11px', color: '#8e8e93', fontStyle: 'italic', display: 'block', marginBottom: '4px' }}>Виберіть проєкт для перегляду діаграми:</label>
        <select
          value={selectedProjectId}
          onChange={(e) => setSelectedProjectId(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            backgroundColor: '#f2f2f7',
            border: '1px solid #d1d1d6',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: 'bold',
            fontStyle: 'italic',
            outline: 'none',
            color: '#1c1c1e'
          }}
        >
          {projects.map(p => (
            <option key={p.id} value={p.id}>
              {p.name} (ID: {p.id})
            </option>
          ))}
        </select>
      </div>

      {!activeProject ? (
        <div style={{ textAlign: 'center', color: '#8e8e93', padding: '40px 0', fontStyle: 'italic' }}>
          Немає доступних проєктів для аналітики.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          {/* Картка з основною інформацією та загальним прогресом */}
          <div style={{ backgroundColor: '#f2f2f7', padding: '14px', borderRadius: '10px', border: '1px solid #e5e5ea' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', fontStyle: 'italic' }}>{activeProject.name}</h3>
              <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#007aff' }}>
                Виконання: {calculateProjectProgress(activeProject)}%
              </span>
            </div>

            {/* Прогрес-бар */}
            <div style={{ width: '100%', height: '8px', backgroundColor: '#e5e5ea', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${calculateProjectProgress(activeProject)}%`, height: '100%', backgroundColor: '#34c759', transition: 'width 0.3s' }} />
            </div>
          </div>

          {/* Діаграма Ганта та деталі по стадіях */}
          <div style={{ backgroundColor: '#f2f2f7', padding: '14px', borderRadius: '10px', border: '1px solid #e5e5ea' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '13px', fontWeight: 'bold', fontStyle: 'italic' }}>Діаграма Ганта та етапи виконання</h4>

            {(!activeProject.stages || activeProject.stages.length === 0) ? (
              <div style={{ color: '#8e8e93', fontStyle: 'italic', textAlign: 'center', padding: '20px 0' }}>
                У цьому проєкті ще немає створених стадій та задач.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {activeProject.stages.map((stage: any, sIdx: number) => {
                  const startDate = stage.startDate;
                  const deadlineDate = stage.reviewDate || stage.endDate;
                  
                  // Розрахунок прострочення
                  let overdueDays = 0;
                  if (deadlineDate && deadlineDate < todayStr && stage.currentStatus !== 'Завершено') {
                    overdueDays = getDaysDifference(deadlineDate, todayStr);
                  }

                  return (
                    <div key={stage.id || sIdx} style={{ backgroundColor: '#ffffff', padding: '10px', borderRadius: '8px', border: '1px solid #e5e5ea' }}>
                      
                      {/* Шапка стадії */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontWeight: 'bold', fontStyle: 'italic', fontSize: '12px' }}>
                          {sIdx + 1}. {stage.title}
                        </span>
                        <span style={{ 
                          fontSize: '10px', 
                          padding: '2px 6px', 
                          borderRadius: '6px', 
                          backgroundColor: stage.currentStatus === 'Завершено' ? '#34c759' : '#007aff', 
                          color: '#fff',
                          fontWeight: 'bold',
                          fontStyle: 'italic'
                        }}>
                          {stage.currentStatus || 'В процесі'}
                        </span>
                      </div>

                      {/* Дані дат та термінів */}
                      <div style={{ fontSize: '11px', color: '#636366', marginBottom: '6px', fontStyle: 'italic', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <span>Старт: <b>{startDate || 'не вказано'}</b></span>
                        <span>Дедлайн: <b>{deadlineDate || 'не вказано'}</b></span>
                        
                        {overdueDays > 0 && (
                          <span style={{ color: '#ff3b30', fontWeight: 'bold' }}>
                            ⚠️ Прострочено на {overdueDays} дн.
                          </span>
                        )}
                      </div>

                      {/* Підзадачі (як частина діаграми Ганта) */}
                      {stage.subStages && stage.subStages.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px', paddingLeft: '8px', borderLeft: '2px solid #e5e5ea' }}>
                          {stage.subStages.map((sub: any, subIdx: number) => (
                            <div key={sub.id || subIdx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
                              <span style={{ fontStyle: 'italic', color: sub.completed ? '#8e8e93' : '#1c1c1e', textDecoration: sub.completed ? 'line-through' : 'none' }}>
                                • {sub.title}
                              </span>
                              <span style={{ fontSize: '10px', color: sub.completed ? '#34c759' : '#ff9500', fontWeight: 'bold' }}>
                                {sub.completed ? 'Виконано' в процесі'}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
};

export default Analytics;
