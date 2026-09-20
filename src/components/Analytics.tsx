import React, { useState } from 'react';
import { Project, TeamMember } from '../App';

interface AnalyticsProps {
  projects: Project[];
  teamDatabase: TeamMember[];
}

export const Analytics: React.FC<AnalyticsProps> = ({ projects }) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const activeProject = projects.find(p => p.id === selectedProjectId) || projects[0];

  // Розрахунок загального відсотка виконання
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

  // Генерація днів поточного місяця для таймлайну зверху (наприклад, 1-31)
  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div style={{ padding: '16px', maxWidth: '100%', overflowX: 'auto', color: '#1c1c1e', fontFamily: "'SF Pro Condensed', -apple-system, sans-serif", fontSize: '11px' }}>
      
      {/* Вибір проєкту */}
      <div style={{ marginBottom: '16px', maxWidth: '500px' }}>
        <label style={{ fontSize: '11px', color: '#8e8e93', fontStyle: 'italic', display: 'block', marginBottom: '4px' }}>Виберіть проєкт для перегляду розкладу:</label>
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
          Немає доступних проєктів.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          {/* Загальний прогрес проєкту */}
          <div style={{ backgroundColor: '#f2f2f7', padding: '12px', borderRadius: '10px', border: '1px solid #e5e5ea', maxWidth: '500px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <h3 style={{ margin: 0, fontSize: '13px', fontWeight: 'bold', fontStyle: 'italic' }}>{activeProject.name}</h3>
              <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#007aff' }}>
                Виконання: {calculateProjectProgress(activeProject)}%
              </span>
            </div>
            <div style={{ width: '100%', height: '6px', backgroundColor: '#e5e5ea', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: `${calculateProjectProgress(activeProject)}%`, height: '100%', backgroundColor: '#34c759', transition: 'width 0.3s' }} />
            </div>
          </div>

          {/* Головна таблиця з Таймлайном (як на зразку) */}
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #d1d1d6', borderRadius: '12px', overflow: 'hidden', minWidth: '750px' }}>
            
            {/* Верхня шапка: Назва проєкту + Таймлайн днів */}
            <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', backgroundColor: '#f2f2f7', borderBottom: '1px solid #d1d1d6', padding: '10px 12px', alignItems: 'center' }}>
              <div style={{ fontSize: '13px', fontWeight: 'bold', fontStyle: 'italic' }}>
                {activeProject.name}
              </div>

              {/* Шкала днів (Таймлайн) */}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 4px', fontSize: '10px', color: '#8e8e93', fontWeight: 'bold' }}>
                {daysInMonth.map(day => (
                  <span key={day} style={{ width: '18px', textAlign: 'center', color: day === 20 ? '#007aff' : '#8e8e93' }}>
                    {day}
                  </span>
                ))}
              </div>
            </div>

            {/* Список стадій та підзадач */}
            {(!activeProject.stages || activeProject.stages.length === 0) ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#8e8e93', fontStyle: 'italic' }}>
                У проєкті ще немає стадій.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {activeProject.stages.map((stage: any, sIdx: number) => {
                  const stageContractors: string[] = stage.contractors || (stage.contractor ? [stage.contractor] : []);
                  const statusLabel = stage.currentStatus || 'В процесі';
                  
                  // Колір статусу
                  let statusBg = '#007aff';
                  if (statusLabel.toLowerCase().includes('завершено')) statusBg = '#34c759';
                  else if (statusLabel.toLowerCase().includes('паузі')) statusBg = '#ffcc00';
                  else if (statusLabel.toLowerCase().includes('перевірці') || statusLabel.toLowerCase().includes('правки')) statusBg = '#ff9500';

                  return (
                    <div key={stage.id || sIdx} style={{ borderBottom: '1px solid #e5e5ea' }}>
                      
                      {/* Рядок стадії */}
                      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', padding: '10px 12px', alignItems: 'center', backgroundColor: '#fafafa' }}>
                        
                        {/* Ліва колонка: Назва стадії + статус + відповідальні */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', paddingRight: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                            <span style={{ fontWeight: 'bold', fontStyle: 'italic' }}>{sIdx + 1}. {stage.title}</span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                            {/* Статус */}
                            <span style={{ fontSize: '9px', padding: '2px 6px', borderRadius: '10px', backgroundColor: statusBg, color: '#fff', fontWeight: 'bold', fontStyle: 'italic' }}>
                              {statusLabel}
                            </span>

                            {/* Ролі / Відповідальні */}
                            {stageContractors.length > 0 && (
                              <span style={{ fontSize: '9px', backgroundColor: '#e5e5ea', padding: '2px 6px', borderRadius: '6px', color: '#3a3a3c', fontStyle: 'italic' }} title={stageContractors.join(', ')}>
                                👤 {stageContractors[0]} {stageContractors.length > 1 ? `(+${stageContractors.length - 1})` : ''}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Права колонка: Графічний блок Ганта (таймлайн смужка) */}
                        <div style={{ position: 'relative', height: '16px', backgroundColor: '#f2f2f7', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ 
                            position: 'absolute', 
                            top: '2px', 
                            bottom: '2px', 
                            left: `${(sIdx * 15) % 60}%`, 
                            width: '25%', 
                            backgroundColor: statusBg, 
                            opacity: 0.7, 
                            borderRadius: '3px' 
                          }} />
                        </div>
                      </div>

                      {/* Підзадачі всередині стадії */}
                      {stage.subStages && stage.subStages.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          {stage.subStages.map((sub: any, subIdx: number) => (
                            <div key={sub.id || subIdx} style={{ display: 'grid', gridTemplateColumns: '320px 1fr', padding: '6px 12px 6px 24px', alignItems: 'center', borderTop: '1px solid #f2f2f7', backgroundColor: '#ffffff' }}>
                              
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: '10px' }}>
                                <span style={{ fontStyle: 'italic', color: sub.completed ? '#8e8e93' : '#1c1c1e', textDecoration: sub.completed ? 'line-through' : 'none' }}>
                                  • {sub.title}
                                </span>
                                <span style={{ fontSize: '9px', fontWeight: 'bold', color: sub.completed ? '#34c759' : '#ff9500' }}>
                                  {sub.completed ? 'Виконано' : 'В процесі'}
                                </span>
                              </div>

                              {/* Міні-смужка для підзадачі */}
                              <div style={{ position: 'relative', height: '10px', backgroundColor: '#f9f9fb', borderRadius: '3px' }}>
                                <div style={{ 
                                  position: 'absolute', 
                                  top: '1px', 
                                  bottom: '1px', 
                                  left: `${((sIdx * 15) + (subIdx * 5)) % 70}%`, 
                                  width: '15%', 
                                  backgroundColor: sub.completed ? '#34c759' : '#007aff', 
                                  opacity: 0.5, 
                                  borderRadius: '2px' 
                                }} />
                              </div>

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
