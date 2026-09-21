import React, { useState, useEffect, useRef } from 'react';
import { Project, TeamMember } from '../App';

interface AnalyticsProps {
  projects: Project[];
  teamDatabase: TeamMember[];
  onUpdateProject?: (project: Project) => void;
}

export const Analytics: React.FC<AnalyticsProps> = ({ projects = [], teamDatabase = [], onUpdateProject }) => {
  const safeProjects = Array.isArray(projects) ? projects : [];
  const [selectedProjectId, setSelectedProjectId] = useState<string>(safeProjects[0]?.id || '');
  const activeProject = safeProjects.find(p => p.id === selectedProjectId) || safeProjects[0];

  const [gapComments, setGapComments] = useState<{ [key: string]: string }>({});
  const [editingGapKey, setEditingGapKey] = useState<string | null>(null);
  const [tempComment, setTempComment] = useState<string>('');
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);

  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeProject) {
      const storageKey = `project_gaps_${activeProject.id}`;
      const savedLocal = localStorage.getItem(storageKey);
      let parsedLocal = {};
      try {
        parsedLocal = savedLocal ? JSON.parse(savedLocal) : {};
      } catch (e) {
        parsedLocal = {};
      }

      const projectComments = (activeProject as any)?.gapComments || {};
      const merged = { ...parsedLocal, ...projectComments };
      setGapComments(merged);
      setSelectedDayIndex(null);
    }
  }, [selectedProjectId, activeProject]);

  const handleSelectProject = (id: string) => {
    setSelectedProjectId(id);
    setEditingGapKey(null);
    setSelectedDayIndex(null);
  };

  const handleSaveComment = (gapKey: string) => {
    const updatedComments = { ...gapComments, [gapKey]: tempComment };
    setGapComments(updatedComments);
    setEditingGapKey(null);

    if (activeProject) {
      const storageKey = `project_gaps_${activeProject.id}`;
      localStorage.setItem(storageKey, JSON.stringify(updatedComments));
    }

    if (onUpdateProject && activeProject) {
      const updatedProject = {
        ...activeProject,
        gapComments: updatedComments
      };
      onUpdateProject(updatedProject);
    }
  };

  const handleExportPDF = () => {
    setEditingGapKey(null);
    window.print();
  };

  const getTeamMemberPhoto = (contractorEntry: string) => {
    if (!contractorEntry) return null;
    const cleanName = contractorEntry.replace(/\s*\([^)]+\)$/, '').trim().toLowerCase();
    const member = teamDatabase.find(m => m?.fullName?.toLowerCase().includes(cleanName));
    return member?.photoUrl || null;
  };

  const formatDateShort = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = String(d.getFullYear()).slice(-2);
    return `${day}.${month}.${year}`;
  };

  const calculateStageProgress = (stage: any) => {
    if (!stage || !stage.subStages || stage.subStages.length === 0) {
      return stage?.currentStatus === 'Завершено' ? 100 : 0;
    }
    const total = stage.subStages.length;
    const completed = stage.subStages.filter((sub: any) => sub?.completed).length;
    return Math.round((completed / total) * 100);
  };

  const calculateProjectProgress = (project: Project) => {
    if (!project || !project.stages || project.stages.length === 0) return 0;
    let totalSubtasks = 0;
    let completedSubtasks = 0;

    project.stages.forEach(stage => {
      if (!stage) return;
      if (stage.subStages && stage.subStages.length > 0) {
        stage.subStages.forEach((sub: any) => {
          totalSubtasks++;
          if (sub?.completed) completedSubtasks++;
        });
      } else {
        totalSubtasks++;
        if (stage.currentStatus === 'Завершено') completedSubtasks++;
      }
    });

    if (totalSubtasks === 0) return 0;
    return Math.round((completedSubtasks / totalSubtasks) * 100);
  };

  let minTimestamp = Infinity;
  let maxTimestamp = -Infinity;

  if (activeProject && Array.isArray(activeProject.stages)) {
    activeProject.stages.forEach((st: any) => {
      if (!st) return;
      if (st.startDate) {
        const t = new Date(st.startDate).getTime();
        if (!isNaN(t) && t < minTimestamp) minTimestamp = t;
      }
      const endD = st.reviewDate || st.endDate;
      if (endD) {
        const t = new Date(endD).getTime();
        if (!isNaN(t) && t > maxTimestamp) maxTimestamp = t;
      }
    });
  }

  if (minTimestamp === Infinity) minTimestamp = new Date().getTime();
  if (maxTimestamp === -Infinity || maxTimestamp <= minTimestamp) {
    maxTimestamp = minTimestamp + 30 * 24 * 60 * 60 * 1000;
  }

  const startDateObj = new Date(minTimestamp);
  startDateObj.setHours(0, 0, 0, 0);
  const adjustedMinTimestamp = startDateObj.getTime();

  maxTimestamp += 3 * 24 * 60 * 60 * 1000;

  const timelineDays: { dateStr: string; dayNum: number; monthYearLabel: string; timestamp: number }[] = [];
  let curr = new Date(adjustedMinTimestamp);
  const endLimit = new Date(maxTimestamp);

  while (curr <= endLimit) {
    const monthName = curr.toLocaleString('uk-UA', { month: 'long' });
    const yearNum = curr.getFullYear();
    timelineDays.push({
      dateStr: curr.toISOString().split('T')[0],
      dayNum: curr.getDate(),
      monthYearLabel: `${monthName} ${yearNum}`,
      timestamp: curr.getTime()
    });
    curr.setDate(curr.getDate() + 1);
  }

  const totalDays = timelineDays.length;
  const gridTemplateColumnsStyle = `repeat(${totalDays}, 32px)`;

  const monthGroups: { label: string; span: number }[] = [];
  let currentMonthLabel = '';
  let currentSpan = 0;

  timelineDays.forEach((d) => {
    if (d.monthYearLabel === currentMonthLabel) {
      currentSpan++;
    } else {
      if (currentSpan > 0) {
        monthGroups.push({ label: currentMonthLabel, span: currentSpan });
      }
      currentMonthLabel = d.monthYearLabel;
      currentSpan = 1;
    }
  });
  if (currentSpan > 0) {
    monthGroups.push({ label: currentMonthLabel, span: currentSpan });
  }

  const totalStagesCount = activeProject?.stages?.length || 0;
  const projectProgress = activeProject ? calculateProjectProgress(activeProject) : 0;

  const firstStageStart = minTimestamp;
  let lastStageEnd = minTimestamp;
  if (activeProject && Array.isArray(activeProject.stages)) {
    activeProject.stages.forEach((st: any) => {
      if (!st) return;
      const endD = st.reviewDate || st.endDate;
      if (endD) {
        const t = new Date(endD).setHours(23,59,59,999);
        if (!isNaN(t) && t > lastStageEnd) lastStageEnd = t;
      }
    });
  }

  const dayWidthMs = 24 * 60 * 60 * 1000;
  const projStartIndex = Math.max(0, Math.floor((firstStageStart - adjustedMinTimestamp) / dayWidthMs));
  const projEndIndex = Math.max(projStartIndex + 1, Math.ceil((lastStageEnd - adjustedMinTimestamp) / dayWidthMs));
  const projSpanCount = Math.max(1, projEndIndex - projStartIndex);

  const HEADER_HEIGHT = '48px';
  const TIMELINE_HEIGHT = '34px';
  const STAGE_ROW_HEIGHT = '42px';
  const totalAnalyticsMinWidth = 270 + (totalDays * 32);

  return (
    <div style={{ padding: '12px', width: '100%', boxSizing: 'border-box', color: '#1c1c1e', fontFamily: "'SF Pro Condensed', -apple-system, sans-serif", fontSize: '11px' }}>
      
      <style>{`
        @media print {
          @page {
            size: landscape;
            margin: 5mm;
          }
          body, html {
            width: 100% !important;
            height: 100% !important;
            background-color: #ffffff !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          body * {
            visibility: hidden !important;
          }
          #printable-analytics, #printable-analytics * {
            visibility: visible !important;
          }
          #printable-analytics {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            min-width: 100% !important;
            display: flex !important;
            flex-direction: row !important;
            background-color: #ffffff !important;
            box-sizing: border-box !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Кнопка друку у вигляді білої іконки з принтером */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
        <button
          onClick={handleExportPDF}
          title="Зберегти в PDF / Друк"
          style={{
            padding: '6px 10px',
            backgroundColor: '#ffffff',
            color: '#636366',
            border: '1px solid #d1d1d6',
            borderRadius: '6px',
            fontSize: '13px',
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          🖨️
        </button>
      </div>

      {!activeProject ? (
        <div style={{ textAlign: 'center', color: '#8e8e93', padding: '40px 0', fontStyle: 'italic' }}>
          Немає доступних проєктів.
        </div>
      ) : (
        <div style={{ width: '100%', overflowX: 'auto', overflowY: 'hidden', paddingBottom: '16px' }}>
          <div 
            id="printable-analytics" 
            ref={reportRef} 
            style={{ 
              display: 'flex', 
              gap: '10px', 
              alignItems: 'flex-start', 
              minWidth: `${totalAnalyticsMinWidth}px`, 
              backgroundColor: '#ffffff', 
              padding: '4px', 
              boxSizing: 'border-box' 
            }}
          >
            
            {/* БЛОК 1: Список стадій зліва */}
            <div style={{ 
              width: '270px', 
              minWidth: '270px', 
              backgroundColor: '#ffffff', 
              border: '1px solid #d1d1d6', 
              borderRadius: '10px', 
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              flexShrink: 0
            }}>
              <div style={{ 
                backgroundColor: '#ffffff', 
                borderBottom: '1px solid #d1d1d6', 
                padding: '4px 8px', 
                height: HEADER_HEIGHT, 
                boxSizing: 'border-box', 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center',
                gap: '2px'
              }}>
                <select
                  className="no-print"
                  value={selectedProjectId}
                  onChange={(e) => handleSelectProject(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '2px 4px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #d1d1d6',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    fontStyle: 'italic',
                    outline: 'none',
                    color: '#1c1c1e',
                    cursor: 'pointer'
                  }}
                >
                  {safeProjects.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>

                <div style={{ fontSize: '9px', color: '#8e8e93', fontStyle: 'italic', fontWeight: 'bold', paddingLeft: '2px' }}>
                  ID проєкту: <span style={{ color: '#007aff' }}>{activeProject.id}</span>
                </div>
              </div>

              <div style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e5e5ea', padding: '0 10px', height: TIMELINE_HEIGHT, boxSizing: 'border-box', display: 'flex', alignItems: 'center' }}>
                <span style={{ fontSize: '10px', fontWeight: 'bold', fontStyle: 'italic', color: '#636366' }}>Загальний таймлайн проєкту</span>
              </div>

              {(!activeProject.stages || activeProject.stages.length === 0) ? (
                <div style={{ padding: '15px', textAlign: 'center', color: '#8e8e93', fontStyle: 'italic' }}>Немає стадій</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {activeProject.stages.map((stage: any, sIdx: number) => {
                    if (!stage) return null;
                    const stageContractors: string[] = stage.contractors || (stage.contractor ? [stage.contractor] : []);
                    const statusLabel = stage.currentStatus || 'В процесі';

                    let statusBg = '#007aff';
                    if (statusLabel.toLowerCase().includes('завершено')) statusBg = '#34c759';
                    else if (statusLabel.toLowerCase().includes('паузі')) statusBg = '#ffcc00';
                    else if (statusLabel.toLowerCase().includes('перевірці') || statusLabel.toLowerCase().includes('правки')) statusBg = '#ff9500';

                    const sDateFormatted = formatDateShort(stage.startDate);
                    const eDateFormatted = formatDateShort(stage.reviewDate || stage.endDate);
                    const dateRangeText = (sDateFormatted && eDateFormatted) ? `${sDateFormatted} — ${eDateFormatted}` : (sDateFormatted || '');

                    return (
                      <div key={stage.id || sIdx} style={{ padding: '4px 10px', height: STAGE_ROW_HEIGHT, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e5e5ea', backgroundColor: '#ffffff' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden', flexGrow: 1 }}>
                          <div style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: '#e5e5ea', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid #d1d1d6' }}>
                            {stageContractors.length > 0 && getTeamMemberPhoto(stageContractors[0]) ? (
                              <img src={getTeamMemberPhoto(stageContractors[0])!} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <span style={{ fontSize: '7px', color: '#636366', fontWeight: 'bold' }}>👤</span>
                            )}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', flexGrow: 1 }}>
                            <span style={{ fontSize: '10px', fontWeight: 'bold', fontStyle: 'italic', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {sIdx + 1}. {stage.title}
                            </span>
                            {dateRangeText && (
                              <span style={{ fontSize: '8px', color: '#8e8e93', fontStyle: 'italic' }}>
                                {dateRangeText}
                              </span>
                            )}
                          </div>
                        </div>
                        <span style={{ fontSize: '8px', padding: '1px 5px', borderRadius: '8px', backgroundColor: statusBg, color: '#fff', fontWeight: 'bold', fontStyle: 'italic', flexShrink: 0, WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                          {statusLabel}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* БЛОК 2: Графік Ганта праворуч */}
            <div style={{ flexGrow: 1, minWidth: `${totalDays * 32}px`, backgroundColor: 'transparent', position: 'relative' }}>
              
              {/* Шапка Блоку 2 (без сірого фону, білий чистий фон) */}
              <div style={{ 
                display: 'grid', 
                gridTemplateRows: 'auto auto', 
                backgroundColor: '#ffffff', 
                border: '1px solid #d1d1d6', 
                borderRadius: '10px 10px 0 0', 
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                height: HEADER_HEIGHT,
                boxSizing: 'border-box',
                WebkitPrintColorAdjust: 'exact',
                printColorAdjust: 'exact'
              }}>
                
                {/* Назви місяців (жирний шрифт, геом. центр, без фону) */}
                <div style={{ display: 'grid', gridTemplateColumns: gridTemplateColumnsStyle, borderBottom: '1px solid #e5e5ea', backgroundColor: '#ffffff', height: '26px', alignItems: 'center' }}>
                  {monthGroups.map((mg, gIdx) => (
                    <div 
                      key={`mg-${gIdx}`} 
                      style={{ 
                        gridColumn: `span ${mg.span}`, 
                        textAlign: 'center', 
                        fontSize: '11px', 
                        fontWeight: 'bold', 
                        fontStyle: 'italic',
                        color: '#1c1c1e', 
                        borderRight: '1px solid #e5e5ea', 
                        whiteSpace: 'nowrap', 
                        overflow: 'hidden',
                        textTransform: 'capitalize'
                      }}
                    >
                      {mg.label}
                    </div>
                  ))}
                </div>

                {/* Числа днів (жирні, білий фон, геом. центр ячейки) */}
                <div style={{ display: 'grid', gridTemplateColumns: gridTemplateColumnsStyle, backgroundColor: '#ffffff', height: '22px', alignItems: 'center' }}>
                  {timelineDays.map((d, localIdx) => {
                    const isSelected = selectedDayIndex === localIdx;
                    return (
                      <div 
                        key={`day-${localIdx}`} 
                        onClick={() => setSelectedDayIndex(isSelected ? null : localIdx)}
                        style={{ 
                          textAlign: 'center', 
                          fontSize: '10px', 
                          fontStyle: 'italic', 
                          fontWeight: 'bold', 
                          color: isSelected ? '#b26a00' : '#1c1c1e', 
                          backgroundColor: isSelected ? 'rgba(255, 239, 179, 0.8)' : '#ffffff',
                          borderRight: '1px solid #e5e5ea', 
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s'
                        }}
                        title={`Виділити дату ${d.dateStr}`}
                      >
                        {d.dayNum}
                      </div>
                    );
                  })}
                </div>

              </div>

              {/* Безперервна нерозривна прозора жовта вертикальна лінія, обмежена рівно по нижню межу останньої стадії */}
              {selectedDayIndex !== null && (
                <div style={{
                  position: 'absolute',
                  top: HEADER_HEIGHT,
                  left: `${selectedDayIndex * 32}px`,
                  height: `calc(${TIMELINE_HEIGHT} + ${activeProject.stages.length * 42}px)`,
                  width: '32px',
                  backgroundColor: 'rgba(255, 235, 59, 0.2)',
                  zIndex: 5,
                  pointerEvents: 'none'
                }} />
              )}

              {/* Рядок загального таймлайну проєкту */}
              <div style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e5e5ea', borderLeft: '1px solid #d1d1d6', borderRight: '1px solid #d1d1d6', padding: '0', height: TIMELINE_HEIGHT, boxSizing: 'border-box', display: 'flex', alignItems: 'center', position: 'relative' }}>
                <div style={{ position: 'relative', width: '100%', height: '24px', backgroundColor: 'transparent', borderRadius: '4px', overflow: 'visible', display: 'grid', gridTemplateColumns: gridTemplateColumnsStyle }}>

                  {(() => {
                    const pStartCol = Math.max(1, projStartIndex + 1);
                    const pEndCol = Math.min(totalDays + 1, projStartIndex + projSpanCount + 1);
                    if (pStartCol > totalDays || pEndCol < 1) return null;
                    const spanCol = Math.max(1, pEndCol - pStartCol);

                    return (
                      <div 
                        style={{ 
                          gridColumn: `${pStartCol} / span ${spanCol}`,
                          gridRow: 1,
                          backgroundColor: '#007aff', 
                          borderRadius: '4px',
                          overflow: 'hidden',
                          zIndex: 2,
                          position: 'relative',
                          display: 'flex',
                          alignItems: 'center',
                          WebkitPrintColorAdjust: 'exact',
                          printColorAdjust: 'exact'
                        }} 
                      >
                        <div 
                          style={{ 
                            width: `${projectProgress}%`, 
                            height: '100%', 
                            backgroundColor: '#005ec4',
                            transition: 'width 0.3s',
                            WebkitPrintColorAdjust: 'exact',
                            printColorAdjust: 'exact'
                          }} 
                        />
                        <span style={{
                          position: 'absolute',
                          width: '100%',
                          textAlign: 'center',
                          fontSize: '9px',
                          fontWeight: 'bold',
                          fontStyle: 'italic',
                          color: '#ffffff',
                          pointerEvents: 'none'
                        }}>
                          {projectProgress}%
                        </span>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Графік Ганта по стадіях */}
              {(!activeProject.stages || activeProject.stages.length === 0) ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#8e8e93', fontStyle: 'italic' }}>Немає стадій</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', overflow: 'visible', backgroundColor: '#ffffff', borderBottom: '1px solid #d1d1d6', borderLeft: '1px solid #d1d1d6', borderRight: '1px solid #d1d1d6', borderRadius: '0 0 10px 10px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', position: 'relative' }}>
                  
                  {activeProject.stages.map((stage: any, sIdx: number) => {
                    if (!stage) return null;
                    const statusLabel = stage.currentStatus || 'В процесі';
                    const progressPct = calculateStageProgress(stage);
                    const isCompleted = statusLabel.toLowerCase().includes('завершено');

                    let statusBg = '#007aff';
                    if (isCompleted) statusBg = '#34c759';
                    else if (statusLabel.toLowerCase().includes('паузі')) statusBg = '#ffcc00';
                    else if (statusLabel.toLowerCase().includes('перевірці') || statusLabel.toLowerCase().includes('правки')) statusBg = '#ff9500';

                    const startMs = stage.startDate ? new Date(stage.startDate).setHours(0,0,0,0) : adjustedMinTimestamp;
                    const endD = stage.reviewDate || stage.endDate;
                    const endMs = endD ? new Date(endD).setHours(23,59,59,999) : startMs + 24 * 60 * 60 * 1000;

                    const startIndexDay = Math.max(0, Math.floor((startMs - adjustedMinTimestamp) / dayWidthMs));
                    const endIndexDay = Math.max(startIndexDay, Math.ceil((endMs - adjustedMinTimestamp) / dayWidthMs));

                    const colStart = Math.max(1, startIndexDay + 1);
                    const colEnd = Math.min(totalDays + 1, endIndexDay + 1);
                    const spanCount = Math.max(1, colEnd - colStart);

                    let prevEndMs = adjustedMinTimestamp;
                    for (let i = 0; i < sIdx; i++) {
                      const stPrev = activeProject.stages[i];
                      if (!stPrev) continue;
                      const stPrevEnd = stPrev.reviewDate || stPrev.endDate;
                      if (stPrevEnd) {
                        const t = new Date(stPrevEnd).getTime();
                        if (!isNaN(t) && t > prevEndMs) prevEndMs = t;
                      }
                    }

                    let gapStartDay = 0;
                    let gapSpan = 0;
                    const GAP_THRESHOLD_MS = 2 * 24 * 60 * 60 * 1000;

                    if (sIdx > 0 && startMs > prevEndMs + GAP_THRESHOLD_MS) {
                      const prevEndDateObj = new Date(prevEndMs);
                      prevEndDateObj.setDate(prevEndDateObj.getDate() + 1);
                      prevEndDateObj.setHours(0, 0, 0, 0);

                      const gStartIdx = Math.max(0, Math.floor((prevEndDateObj.getTime() - adjustedMinTimestamp) / dayWidthMs));
                      const gEndIdx = Math.max(gStartIdx, Math.floor((startMs - adjustedMinTimestamp) / dayWidthMs));
                      const gColStart = Math.max(1, gStartIdx + 1);
                      const gColEnd = Math.min(totalDays + 1, gEndIdx + 1);
                      if (gColEnd > gColStart) {
                        gapStartDay = gColStart;
                        gapSpan = gColEnd - gColStart;
                      }
                    }

                    const gapKey = `stage_${stage.id || sIdx}_gap`;
                    const savedComment = gapComments[gapKey];
                    const isEditing = editingGapKey === gapKey;
                    const isNearBottom = sIdx >= totalStagesCount - 2;

                    return (
                      <div key={stage.id || sIdx} style={{ padding: '4px 0', height: STAGE_ROW_HEIGHT, boxSizing: 'border-box', backgroundColor: '#ffffff', overflow: 'visible', display: 'flex', alignItems: 'center', borderBottom: sIdx === activeProject.stages.length - 1 ? 'none' : '1px solid #e5e5ea', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact', position: 'relative' }}>
                        
                        <div style={{ position: 'relative', width: '100%', height: '24px', backgroundColor: 'transparent', borderRadius: '4px', overflow: 'visible', display: 'grid', gridTemplateColumns: gridTemplateColumnsStyle }}>
                          
                          {gapSpan > 0 && (
                            <div 
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingGapKey(gapKey);
                                setTempComment(savedComment || '');
                              }}
                              title={savedComment ? `Коментар: ${savedComment}` : "Клікніть, щоб додати коментар до гепу (паузи)"}
                              style={{
                                gridColumn: `${gapStartDay} / span ${gapSpan}`,
                                gridRow: 1,
                                backgroundColor: '#ff3b30',
                                borderRadius: '4px',
                                opacity: 0.9,
                                zIndex: 3,
                                cursor: 'pointer',
                                boxShadow: '0 0 4px rgba(255, 59, 48, 0.4)',
                                position: 'relative',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'visible',
                                WebkitPrintColorAdjust: 'exact',
                                printColorAdjust: 'exact'
                              }}
                            >
                              {savedComment && (
                                <span style={{
                                  fontSize: '9px',
                                  fontWeight: 'bold',
                                  fontStyle: 'italic',
                                  color: '#ffffff',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  padding: '0 4px',
                                  pointerEvents: 'none'
                                }}>
                                  {savedComment}
                                </span>
                              )}

                              {isEditing && (
                                <div className="no-print" style={{
                                  position: 'absolute',
                                  ...(isNearBottom ? { bottom: '32px' } : { top: '32px' }),
                                  left: '0px',
                                  zIndex: 1000,
                                  backgroundColor: '#ffffff',
                                  border: '1px solid #d1d1d6',
                                  borderRadius: '6px',
                                  padding: '6px',
                                  boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                                  width: '210px',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '4px',
                                  cursor: 'default'
                                }} onClick={(e) => e.stopPropagation()}>
                                  <span style={{ fontSize: '9px', fontWeight: 'bold', color: '#ff3b30' }}>Причина паузи / гепу:</span>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <input
                                      type="text"
                                      value={tempComment}
                                      onChange={(e) => setTempComment(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          handleSaveComment(gapKey);
                                        }
                                      }}
                                      placeholder="Введіть причину..."
                                      style={{
                                        padding: '4px 6px',
                                        border: '1px solid #d1d1d6',
                                        borderRadius: '4px',
                                        fontSize: '10px',
                                        outline: 'none',
                                        flexGrow: 1,
                                        boxSizing: 'border-box'
                                      }}
                                      autoFocus
                                    />
                                    <button
                                      onClick={() => handleSaveComment(gapKey)}
                                      title="Зберегти"
                                      style={{
                                        backgroundColor: '#34c759',
                                        color: '#ffffff',
                                        border: '1px solid #d1d1d6',
                                        borderRadius: '4px',
                                        width: '24px',
                                        height: '24px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        fontSize: '12px',
                                        fontWeight: 'bold',
                                        flexShrink: 0
                                      }}
                                    >
                                      ✓
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {colStart <= totalDays && colEnd >= 1 && (
                            <div 
                              style={{ 
                                gridColumn: `${colStart} / span ${spanCount}`,
                                gridRow: 1,
                                backgroundColor: '#e5e5ea', 
                                borderRadius: '4px',
                                overflow: 'hidden',
                                zIndex: 2,
                                position: 'relative',
                                display: 'flex',
                                alignItems: 'center',
                                WebkitPrintColorAdjust: 'exact',
                                printColorAdjust: 'exact'
                              }} 
                            >
                              <div 
                                style={{ 
                                  width: `${progressPct}%`, 
                                  height: '100%', 
                                  backgroundColor: statusBg,
                                  transition: 'width 0.3s',
                                  WebkitPrintColorAdjust: 'exact',
                                  printColorAdjust: 'exact'
                                }} 
                              />
                              {!isCompleted && (
                                <span style={{
                                  position: 'absolute',
                                  width: '100%',
                                  textAlign: 'center',
                                  fontSize: '9px',
                                  fontWeight: 'bold',
                                  fontStyle: 'italic',
                                  color: progressPct > 50 ? '#ffffff' : '#1c1c1e',
                                  pointerEvents: 'none'
                                }}>
                                  {progressPct}%
                                </span>
                              )}
                            </div>
                          )}

                        </div>

                      </div>
                    );
                  })}
                </div>
              )}

            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
