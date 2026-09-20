import React, { useState } from 'react';
import { Project, TeamMember } from '../App';

interface AnalyticsProps {
  projects: Project[];
  teamDatabase: TeamMember[];
}

export const Analytics: React.FC<AnalyticsProps> = ({ projects, teamDatabase }) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const activeProject = projects.find(p => p.id === selectedProjectId) || projects[0];

  // Пошук фото виконавця з бази Telegram
  const getTeamMemberPhoto = (contractorEntry: string) => {
    if (!contractorEntry) return null;
    const cleanName = contractorEntry.replace(/\s*\([^)]+\)$/, '').trim().toLowerCase();
    const member = teamDatabase.find(m => m.fullName.toLowerCase().includes(cleanName));
    return member?.photoUrl || null;
  };

  // Розрахунок загального прогресу стадії
  const calculateStageProgress = (stage: any) => {
    if (!stage.subStages || stage.subStages.length === 0) {
      return stage.currentStatus === 'Завершено' ? 100 : 0;
    }
    const total = stage.subStages.length;
    const completed = stage.subStages.filter((sub: any) => sub.completed).length;
    return Math.round((completed / total) * 100);
  };

  // Визначаємо мінімальну та максимальну дату в проєкті для побудови шкали
  let minTimestamp = Infinity;
  let maxTimestamp = -Infinity;

  if (activeProject && activeProject.stages) {
    activeProject.stages.forEach((st: any) => {
      if (st.startDate) {
        const t = new Date(st.startDate).getTime();
        if (t < minTimestamp) minTimestamp = t;
      }
      const endD = st.reviewDate || st.endDate;
      if (endD) {
        const t = new Date(endD).getTime();
        if (t > maxTimestamp) maxTimestamp = t;
      }
    });
  }

  if (minTimestamp === Infinity) minTimestamp = new Date().getTime();
  if (maxTimestamp === -Infinity || maxTimestamp <= minTimestamp) {
    maxTimestamp = minTimestamp + 30 * 24 * 60 * 60 * 1000;
  }

  const totalProjectDurationMs = maxTimestamp - minTimestamp || 1;

  // Генеруємо масив днів для шапки
  const timelineDays: { dateStr: string; dayNum: number; monthName: string }[] = [];
  let curr = new Date(minTimestamp);
  const endLimit = new Date(maxTimestamp);
  endLimit.setDate(endLimit.getDate() + 5);

  while (curr <= endLimit) {
    timelineDays.push({
      dateStr: curr.toISOString().split('T')[0],
      dayNum: curr.getDate(),
      monthName: curr.toLocaleString('uk-UA', { month: 'short' })
    });
    curr.setDate(curr.getDate() + 1);
  }

  return (
    <div style={{ padding: '16px', maxWidth: '100%', overflowX: 'auto', color: '#1c1c1e', fontFamily: "'SF Pro Condensed', -apple-system, sans-serif", fontSize: '11px' }}>
      
      {/* Вибір проєкту */}
      <div style={{ marginBottom: '16px', maxWidth: '400px' }}>
        <label style={{ fontSize: '11px', color: '#8e8e93', fontStyle: 'italic', display: 'block', marginBottom: '4px' }}>Виберіть проєкт:</label>
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
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #d1d1d6', borderRadius: '12px', overflow: 'hidden', minWidth: '900px' }}>
          
          {/* Шапка: Назва проєкту + Календарна шкала днів з місяцями */}
          <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', backgroundColor: '#f2f2f7', borderBottom: '1px solid #d1d1d6', padding: '10px 12px', alignItems: 'center' }}>
            <div style={{ fontSize: '13px', fontWeight: 'bold', fontStyle: 'italic' }}>
              {activeProject.name}
            </div>

            {/* Шкала днів та місяців */}
            <div style={{ display: 'flex', overflowX: 'auto', gap: '4px', padding: '0 4px', fontSize: '10px', color: '#8e8e93', fontWeight: 'bold' }}>
              {timelineDays.map((d, idx) => (
                <div key={idx} style={{ minWidth: '22px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span style={{ fontSize: '8px', color: '#007aff' }}>{d.dayNum === 1 ? d.monthName : ''}</span>
                  <span>{d.dayNum}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Зведена шкала загального часу проєкту зверху */}
          <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', backgroundColor: '#fcfcfc', borderBottom: '1px solid #e5e5ea', padding: '8px 12px', alignItems: 'center' }}>
            <div style={{ fontSize: '11px', fontWeight: 'bold', fontStyle: 'italic', color: '#636366' }}>
              Загальний таймлайн проєкту
            </div>
            <div style={{ position: 'relative', height: '14px', backgroundColor: '#e5e5ea', borderRadius: '7px', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, bottom: 0, left: '0%', width: '100%', backgroundColor: '#007aff', opacity: 0.3, borderRadius: '7px' }} />
            </div>
          </div>

          {/* Список лише основних стадій */}
          {(!activeProject.stages || activeProject.stages.length === 0) ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#8e8e93', fontStyle: 'italic' }}>
              У проєкті ще немає стадій.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {activeProject.stages.map((stage: any, sIdx: number) => {
                const stageContractors: string[] = stage.contractors || (stage.contractor ? [stage.contractor] : []);
                const statusLabel = stage.currentStatus || 'В процесі';
                const progressPct = calculateStageProgress(stage);

                // Кольори статусів
                let statusBg = '#007aff';
                if (statusLabel.toLowerCase().includes('завершено')) statusBg = '#34c759';
                else if (statusLabel.toLowerCase().includes('паузі')) statusBg = '#ffcc00';
                else if (statusLabel.toLowerCase().includes('перевірці') || statusLabel.toLowerCase().includes('правки')) statusBg = '#ff9500';

                // Розрахунок позиції смужки Ганта
                let leftPercent = 0;
                let widthPercent = 10;

                if (stage.startDate) {
                  const startMs = new Date(stage.startDate).getTime();
                  leftPercent = Math.max(0, Math.min(100, ((startMs - minTimestamp) / totalProjectDurationMs) * 100));
                }

                const endD = stage.reviewDate || stage.endDate;
                if (stage.startDate && endD) {
                  const startMs = new Date(stage.startDate).getTime();
                  const endMs = new Date(endD).getTime();
                  const durationMs = Math.max(endMs - startMs, 24 * 60 * 60 * 1000);
                  widthPercent = Math.max(2, Math.min(100 - leftPercent, (durationMs / totalProjectDurationMs) * 100));
                }

                // Обчислюємо розмір та позицію для сірої зони паузи (від початку шкали 0% до початку стадії leftPercent)
                const pauseLeft = 0;
                const pauseWidth = Math.max(0, leftPercent);

                return (
                  <div key={stage.id || sIdx} style={{ display: 'grid', gridTemplateColumns: '350px 1fr', padding: '10px 12px', alignItems: 'center', borderBottom: '1px solid #e5e5ea', backgroundColor: '#fafafa' }}>
                    
                    {/* Ліва частина: Аватарка + Назва + Статус */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', paddingRight: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                        
                        {/* Аватарка виконавця */}
                        <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#e5e5ea', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid #d1d1d6' }}>
                          {stageContractors.length > 0 && getTeamMemberPhoto(stageContractors[0]) ? (
                            <img src={getTeamMemberPhoto(stageContractors[0])!} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <span style={{ fontSize: '8px', color: '#636366', fontWeight: 'bold' }}>👤</span>
                          )}
                        </div>

                        <span style={{ fontWeight: 'bold', fontStyle: 'italic', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {sIdx + 1}. {stage.title}
                        </span>
                      </div>

                      {/* Статус стадії */}
                      <span style={{ fontSize: '9px', padding: '2px 6px', borderRadius: '10px', backgroundColor: statusBg, color: '#fff', fontWeight: 'bold', fontStyle: 'italic', flexShrink: 0 }}>
                        {statusLabel}
                      </span>
                    </div>

                    {/* Права частина: Хронологічна смужка Ганта з сірою зоною паузи */}
                    <div style={{ position: 'relative', height: '18px', backgroundColor: '#f2f2f7', borderRadius: '4px', overflow: 'hidden' }}>
                      
                      {/* Сіра зона паузи (від початку таймлайну до старту стадії) */}
                      {pauseWidth > 0 && (
                        <div 
                          title="Пауза / Простій перед стадією"
                          style={{
                            position: 'absolute',
                            top: '2px',
                            bottom: '2px',
                            left: `${pauseLeft}%`,
                            width: `${pauseWidth}%`,
                            backgroundColor: '#e0e0e0',
                            borderRadius: '3px',
                            opacity: 0.8
                          }}
                        />
                      )}

                      {/* Основна смужка стадії */}
                      <div 
                        style={{ 
                          position: 'absolute', 
                          top: '2px', 
                          bottom: '2px', 
                          left: `${leftPercent}%`, 
                          width: `${widthPercent}%`, 
                          backgroundColor: '#d1d1d6', 
                          borderRadius: '3px',
                          overflow: 'hidden',
                          zIndex: 1
                        }} 
                      >
                        <div 
                          style={{ 
                            width: `${progressPct}%`, 
                            height: '100%', 
                            backgroundColor: statusBg,
                            transition: 'width 0.3s' 
                          }} 
                        />
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default Analytics;
