import React, { useState } from 'react';
import { Project, TeamMember } from '../App';

interface AnalyticsProps {
  projects: Project[];
  teamDatabase: TeamMember[];
  onUpdateProject?: (project: Project) => void;
}

export const Analytics: React.FC<AnalyticsProps> = ({ projects, teamDatabase, onUpdateProject }) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const activeProject = projects.find(p => p.id === selectedProjectId) || projects[0];

  const [gapComments, setGapComments] = useState<{ [key: string]: string }>(() => {
    return (activeProject as any)?.gapComments || {};
  });
  const [editingGapKey, setEditingGapKey] = useState<string | null>(null);
  const [tempComment, setTempComment] = useState<string>('');

  const handleSelectProject = (id: string) => {
    setSelectedProjectId(id);
    const p = projects.find(proj => proj.id === id);
    setGapComments((p as any)?.gapComments || {});
  };

  const handleSaveComment = (gapKey: string) => {
    const updatedComments = { ...gapComments, [gapKey]: tempComment };
    setGapComments(updatedComments);
    setEditingGapKey(null);

    if (onUpdateProject && activeProject) {
      const updatedProject = {
        ...activeProject,
        gapComments: updatedComments
      };
      onUpdateProject(updatedProject);
    }
  };

  const getTeamMemberPhoto = (contractorEntry: string) => {
    if (!contractorEntry) return null;
    const cleanName = contractorEntry.replace(/\s*\([^)]+\)$/, '').trim().toLowerCase();
    const member = teamDatabase.find(m => m.fullName.toLowerCase().includes(cleanName));
    return member?.photoUrl || null;
  };

  const calculateStageProgress = (stage: any) => {
    if (!stage.subStages || stage.subStages.length === 0) {
      return stage.currentStatus === 'Завершено' ? 100 : 0;
    }
    const total = stage.subStages.length;
    const completed = stage.subStages.filter((sub: any) => sub.completed).length;
    return Math.round((completed / total) * 100);
  };

  // Визначення часових меж проекту
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

  minTimestamp -= 1 * 24 * 60 * 60 * 1000;
  maxTimestamp += 3 * 24 * 60 * 60 * 1000;

  const totalDaysCount = Math.round((maxTimestamp - minTimestamp) / (1000 * 60 * 60 * 24)) + 1;

  // Генеруємо масив днів для шкали
  const timelineDays: { dateStr: string; dayNum: number; monthYearLabel: string }[] = [];
  let curr = new Date(minTimestamp);
  curr.setHours(0, 0, 0, 0);
  const endLimit = new Date(maxTimestamp);

  while (curr <= endLimit) {
    const monthName = curr.toLocaleString('uk-UA', { month: 'long' });
    const yearNum = curr.getFullYear();
    timelineDays.push({
      dateStr: curr.toISOString().split('T')[0],
      dayNum: curr.getDate(),
      monthYearLabel: `${monthName} ${yearNum}`
    });
    curr.setDate(curr.getDate() + 1);
  }

  const gridTemplateColumnsStyle = `repeat(${timelineDays.length}, minmax(28px, 1fr))`;

  return (
    <div style={{ padding: '16px', maxWidth: '100%', overflowX: 'auto', color: '#1c1c1e', fontFamily: "'SF Pro Condensed', -apple-system, sans-serif", fontSize: '11px' }}>
      
      {/* Вибір проєкту */}
      <div style={{ marginBottom: '16px', maxWidth: '400px' }}>
        <label style={{ fontSize: '11px', color: '#8e8e93', fontStyle: 'italic', display: 'block', marginBottom: '4px' }}>Виберіть проєкт:</label>
        <select
          value={selectedProjectId}
          onChange={(e) => handleSelectProject(e.target.value)}
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
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #d1d1d6', borderRadius: '12px', overflow: 'visible', width: '100%', minWidth: '1000px' }}>
          
          {/* Шапка: 2 рядки (Місяць з роком + Числа) */}
          <div style={{ display: 'grid', gridTemplateColumns: `350px 1fr`, backgroundColor: '#f2f2f7', borderBottom: '1px solid #d1d1d6' }}>
            
            <div style={{ padding: '10px 12px', fontSize: '13px', fontWeight: 'bold', fontStyle: 'italic', display: 'flex', alignItems: 'center', borderRight: '1px solid #d1d1d6' }}>
              {activeProject.name}
            </div>

            {/* Контейнер шапки з 2 рядками */}
            <div style={{ display: 'grid', gridTemplateRows: 'auto auto' }}>
              
              {/* Рядок 1: Назва місяця з роком (наприклад, червень 2026) */}
              <div style={{ display: 'grid', gridTemplateColumns: gridTemplateColumnsStyle, borderBottom: '1px solid #e5e5ea', backgroundColor: '#f9f9fb' }}>
                {timelineDays.map((d, idx) => {
                  const showLabel = idx === 0 || timelineDays[idx - 1].monthYearLabel !== d.monthYearLabel;
                  return (
                    <div key={`month-${idx}`} style={{ textAlign: 'left', padding: '4px 2px', fontSize: '10px', fontWeight: 'bold', color: '#007aff', borderRight: '1px solid #e5e5ea', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                      {showLabel ? d.monthYearLabel : ''}
                    </div>
                  );
                })}
              </div>

              {/* Рядок 2: Числові значення днів */}
              <div style={{ display: 'grid', gridTemplateColumns: gridTemplateColumnsStyle, backgroundColor: '#f2f2f7' }}>
                {timelineDays.map((d, idx) => (
                  <div key={`day-${idx}`} style={{ textAlign: 'center', padding: '4px 0', fontSize: '10px', fontWeight: 'bold', color: '#1c1c1e', borderRight: '1px solid #e5e5ea' }}>
                    {d.dayNum}
                  </div>
                ))}
              </div>

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
            <div style={{ display: 'flex', flexDirection: 'column', overflow: 'visible' }}>
              {activeProject.stages.map((stage: any, sIdx: number) => {
                const stageContractors: string[] = stage.contractors || (stage.contractor ? [stage.contractor] : []);
                const statusLabel = stage.currentStatus || 'В процесі';
                const progressPct = calculateStageProgress(stage);

                let statusBg = '#007aff';
                if (statusLabel.toLowerCase().includes('завершено')) statusBg = '#34c759';
                else if (statusLabel.toLowerCase().includes('паузі')) statusBg = '#ffcc00';
                else if (statusLabel.toLowerCase().includes('перевірці') || statusLabel.toLowerCase().includes('правки')) statusBg = '#ff9500';

                // Розрахунок позицій у відсотках або днях для ідеального збігу з сіткою
                const startMs = stage.startDate ? new Date(stage.startDate).getTime() : minTimestamp;
                const endD = stage.reviewDate || stage.endDate;
                const endMs = endD ? new Date(endD).getTime() : startMs + 24 * 60 * 60 * 1000;

                const startIndex = Math.max(0, Math.round((startMs - minTimestamp) / (1000 * 60 * 60 * 24)));
                const durationDays = Math.max(1, Math.round((endMs - startMs) / (1000 * 60 * 60 * 24)));

                const leftPercent = (startIndex / timelineDays.length) * 100;
                const widthPercent = (durationDays / timelineDays.length) * 100;

                // Пошук реального попереднього завершення для гепу
                let prevEndMs = minTimestamp;
                for (let i = 0; i < sIdx; i++) {
                  const stPrev = activeProject.stages[i];
                  const stPrevEnd = stPrev.reviewDate || stPrev.endDate;
                  if (stPrevEnd) {
                    const t = new Date(stPrevEnd).getTime();
                    if (t > prevEndMs) prevEndMs = t;
                  }
                }

                let gapLeftPercent = 0;
                let gapWidthPercent = 0;
                const GAP_THRESHOLD_MS = 2 * 24 * 60 * 60 * 1000; // більше 2 днів вважається гепом

                if (sIdx > 0 && startMs > prevEndMs + GAP_THRESHOLD_MS) {
                  const gapStartIndex = Math.max(0, Math.round((prevEndMs - minTimestamp) / (1000 * 60 * 60 * 24)));
                  gapLeftPercent = (gapStartIndex / timelineDays.length) * 100;
                  gapWidthPercent = leftPercent - gapLeftPercent;
                }

                const gapKey = `stage_${stage.id || sIdx}_gap`;
                const savedComment = gapComments[gapKey];
                const isEditing = editingGapKey === gapKey;
                const isNearBottom = sIdx >= totalDaysCount - 2;

                return (
                  <div key={stage.id || sIdx} style={{ display: 'grid', gridTemplateColumns: '350px 1fr', padding: '10px 12px', alignItems: 'center', borderBottom: '1px solid #e5e5ea', backgroundColor: '#fafafa', overflow: 'visible' }}>
                    
                    {/* Ліва частина: Аватарка + Назва + Статус */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', paddingRight: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                        
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

                      <span style={{ fontSize: '9px', padding: '2px 6px', borderRadius: '10px', backgroundColor: statusBg, color: '#fff', fontWeight: 'bold', fontStyle: 'italic', flexShrink: 0 }}>
                        {statusLabel}
                      </span>
                    </div>

                    {/* Права частина: Сітка днів та смужки Ганта */}
                    <div style={{ position: 'relative', height: '22px', backgroundColor: '#f2f2f7', borderRadius: '4px', overflow: 'visible' }}>
                      
                      {/* Фонова сітка клітинок, яка повністю збігається з шапкою */}
                      <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: gridTemplateColumnsStyle, pointerEvents: 'none' }}>
                        {timelineDays.map((_, dIdx) => (
                          <div key={`grid-cell-${dIdx}`} style={{ borderRight: '1px solid #e5e5ea', height: '100%' }} />
                        ))}
                      </div>

                      {/* Червоне виділення справжнього гепу */}
                      {gapWidthPercent > 0.2 && (
                        <div 
                          onClick={() => {
                            setEditingGapKey(gapKey);
                            setTempComment(savedComment || '');
                          }}
                          title={savedComment ? `Коментар: ${savedComment}` : "Клікніть, щоб додати коментар до гепу (паузи)"}
                          style={{
                            position: 'absolute',
                            top: '2px',
                            bottom: '2px',
                            left: `${gapLeftPercent}%`,
                            width: `${gapWidthPercent}%`,
                            backgroundColor: '#ff3b30',
                            borderRadius: '3px',
                            opacity: 0.9,
                            zIndex: 2,
                            cursor: 'pointer',
                            boxShadow: '0 0 4px rgba(255, 59, 48, 0.4)'
                          }}
                        />
                      )}

                      {/* Вікно введення коментаря */}
                      {isEditing && (
                        <div style={{
                          position: 'absolute',
                          ...(isNearBottom ? { bottom: '26px' } : { top: '26px' }),
                          left: `${gapLeftPercent}%`,
                          zIndex: 100,
                          backgroundColor: '#ffffff',
                          border: '1px solid #d1d1d6',
                          borderRadius: '8px',
                          padding: '8px',
                          boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                          width: '220px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px'
                        }}>
                          <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#ff3b30' }}>Причина паузи / гепу:</span>
                          <input
                            type="text"
                            value={tempComment}
                            onChange={(e) => setTempComment(e.target.value)}
                            placeholder="Введіть причину..."
                            style={{
                              padding: '4px 6px',
                              border: '1px solid #d1d1d6',
                              borderRadius: '4px',
                              fontSize: '11px',
                              outline: 'none'
                            }}
                            autoFocus
                          />
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px' }}>
                            <button 
                              onClick={() => setEditingGapKey(null)}
                              style={{ padding: '2px 6px', fontSize: '10px', background: '#e5e5ea', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                            >
                              Скасувати
                            </button>
                            <button 
                              onClick={() => handleSaveComment(gapKey)}
                              style={{ padding: '2px 6px', fontSize: '10px', background: '#007aff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                            >
                              Зберегти
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Текст збереженого коментаря */}
                      {savedComment && !isEditing && (
                        <div 
                          onClick={() => {
                            setEditingGapKey(gapKey);
                            setTempComment(savedComment);
                          }}
                          style={{
                            position: 'absolute',
                            ...(isNearBottom ? { bottom: '24px' } : { top: '22px' }),
                            left: `${gapLeftPercent}%`,
                            fontSize: '9px',
                            color: '#ff3b30',
                            fontStyle: 'italic',
                            cursor: 'pointer',
                            maxWidth: '160px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            zIndex: 10,
                            backgroundColor: 'rgba(255,255,255,0.9)',
                            padding: '1px 4px',
                            borderRadius: '4px',
                            border: '1px solid rgba(255,59,48,0.3)'
                          }}
                          title={savedComment}
                        >
                          💬 {savedComment}
                        </div>
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
