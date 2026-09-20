import React, { useState, useEffect, useRef } from 'react';
import { Project, TeamMember } from '../App';

interface AnalyticsProps {
  projects: Project[];
  teamDatabase: TeamMember[];
  onUpdateProject?: (project: Project) => void;
}

export const Analytics: React.FC<AnalyticsProps> = ({ projects, teamDatabase, onUpdateProject }) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const activeProject = projects.find(p => p.id === selectedProjectId) || projects[0];

  const [gapComments, setGapComments] = useState<{ [key: string]: string }>({});
  const [editingGapKey, setEditingGapKey] = useState<string | null>(null);
  const [tempComment, setTempComment] = useState<string>('');

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
    }
  }, [selectedProjectId, activeProject]);

  const handleSelectProject = (id: string) => {
    setSelectedProjectId(id);
    setEditingGapKey(null);
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
  const gridTemplateColumnsStyle = `repeat(${totalDays}, 36px)`;

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
  if (activeProject && activeProject.stages) {
    activeProject.stages.forEach((st: any) => {
      const endD = st.reviewDate || st.endDate;
      if (endD) {
        const t = new Date(endD).setHours(23,59,59,999);
        if (t > lastStageEnd) lastStageEnd = t;
      }
    });
  }

  const dayWidthMs = 24 * 60 * 60 * 1000;
  const projStartIndex = Math.max(0, Math.floor((firstStageStart - adjustedMinTimestamp) / dayWidthMs));
  const projEndIndex = Math.max(projStartIndex + 1, Math.ceil((lastStageEnd - adjustedMinTimestamp) / dayWidthMs));
  const projSpanCount = Math.max(1, projEndIndex - projStartIndex);
  const projGridColumnStart = projStartIndex + 1;

  const HEADER_HEIGHT = '60px';
  const TIMELINE_HEIGHT = '43px';
  const STAGE_ROW_HEIGHT = '43px';

  const totalAnalyticsMinWidth = 300 + (totalDays * 36);

  return (
    <div style={{ padding: '16px', width: '100%', boxSizing: 'border-box', color: '#1c1c1e', fontFamily: "'SF Pro Condensed', -apple-system, sans-serif", fontSize: '11px' }}>
      
      {/* Спеціальні стилі для друку: розтягують звіт на 100% ширини аркуша в альбомній орієнтації */}
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
          #printable-analytics > div:nth-child(2) {
            flex-grow: 1 !important;
            overflow: visible !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
        <button
          onClick={handleExportPDF}
          style={{
            padding: '8px 16px',
            backgroundColor: '#007aff',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: 'bold',
            fontStyle: 'italic',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          📥 Зберегти в PDF / Друк
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
              gap: '12px', 
              alignItems: 'flex-start', 
              minWidth: `${totalAnalyticsMinWidth}px`, 
              backgroundColor: '#ffffff', 
              padding: '8px', 
              boxSizing: 'border-box' 
            }}
          >
            
            {/* БЛОК 1: Список стадій зліва */}
            <div style={{ 
              width: '300px', 
              minWidth: '300px', 
              backgroundColor: '#ffffff', 
              border: '1px solid #d1d1d6', 
              borderRadius: '12px', 
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              flexShrink: 0
            }}>
              <div style={{ 
                backgroundColor: '#f2f2f7', 
                borderBottom: '1px solid #d1d1d6', 
                padding: '6px 10px', 
                height: HEADER_HEIGHT, 
                boxSizing: 'border-box', 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center',
                gap: '3px'
              }}>
                <select
                  className="no-print"
                  value={selectedProjectId}
                  onChange={(e) => handleSelectProject(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '3px 6px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #d1d1d6',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    fontStyle: 'italic',
                    outline: 'none',
                    color: '#1c1c1e',
                    cursor: 'pointer'
                  }}
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>

                <div style={{ fontSize: '10px', color: '#8e8e93', fontStyle: 'italic', fontWeight: 'bold', paddingLeft: '2px' }}>
                  ID проєкту: <span style={{ color: '#007aff' }}>{activeProject.id}</span>
                </div>
              </div>

              <div style={{ backgroundColor: '#fcfcfc', borderBottom: '1px solid #e5e5ea', padding: '0 12px', height: TIMELINE_HEIGHT, boxSizing: 'border-box', display: 'flex', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: 'bold', fontStyle: 'italic', color: '#636366' }}>Загальний таймлайн проєкту</span>
              </div>

              {(!activeProject.stages || activeProject.stages.length === 0) ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#8e8e93', fontStyle: 'italic' }}>Немає стадій</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {activeProject.stages.map((stage: any, sIdx: number) => {
                    const stageContractors: string[] = stage.contractors || (stage.contractor ? [stage.contractor] : []);
                    const statusLabel = stage.currentStatus || 'В процесі';

                    let statusBg = '#007aff';
                    if (statusLabel.toLowerCase().includes('завершено')) statusBg = '#34c759';
                    else if (statusLabel.toLowerCase().includes('паузі')) statusBg = '#ffcc00';
                    else if (statusLabel.toLowerCase().includes('перевірці') || statusLabel.toLowerCase().includes('правки')) statusBg = '#ff9500';

                    return (
                      <div key={stage.id || sIdx} style={{ padding: '0 12px', height: STAGE_ROW_HEIGHT, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e5e5ea', backgroundColor: '#fafafa' }}>
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
                        <span style={{ fontSize: '9px', padding: '2px 6px', borderRadius: '10px', backgroundColor: statusBg, color: '#fff', fontWeight: 'bold', fontStyle: 'italic', flexShrink: 0, WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                          {statusLabel}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* БЛОК 2: Графік Ганта праворуч */}
            <div style={{ flexGrow: 1, minWidth: `${totalDays * 36}px`, backgroundColor: 'transparent' }}>
              
              {/* Шапка Блоку 2 */}
              <div style={{ 
                display: 'grid', 
                gridTemplateRows: 'auto auto', 
                backgroundColor: '#f2f2f7', 
                border: '1px solid #d1d1d6', 
                borderRadius: '12px 12px 0 0', 
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                height: HEADER_HEIGHT,
                boxSizing: 'border-box',
                WebkitPrintColorAdjust: 'exact',
                printColorAdjust: 'exact'
              }}>
                
                <div style={{ display: 'grid', gridTemplateColumns: gridTemplateColumnsStyle, borderBottom: '1px solid #e5e5ea', backgroundColor: '#f9f9fb' }}>
                  {monthGroups.map((mg, gIdx) => (
                    <div 
                      key={`mg-${gIdx}`} 
                      style={{ 
                        gridColumn: `span ${mg.span}`, 
                        textAlign: 'center', 
                        padding: '4px 2px', 
                        fontSize: '16px', 
                        fontWeight: 'bold', 
                        fontStyle: 'italic',
                        color: '#000000', 
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

                <div style={{ display: 'grid', gridTemplateColumns: gridTemplateColumnsStyle, backgroundColor: '#f2f2f7', height: '28px', boxSizing: 'border-box' }}>
                  {timelineDays.map((d, idx) => (
                    <div key={`day-${idx}`} style={{ textAlign: 'center', padding: '4px 0', fontSize: '15px', fontStyle: 'italic', fontWeight: 'bold', color: '#1c1c1e', borderRight: '1px solid #e5e5ea', overflow: 'hidden' }}>
                      {d.dayNum}
                    </div>
                  ))}
                </div>

              </div>

              {/* Рядок загального таймлайну проєкту */}
              <div style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e5e5ea', borderLeft: '1px solid #d1d1d6', borderRight: '1px solid #d1d1d6', padding: '0', height: TIMELINE_HEIGHT, boxSizing: 'border-box', display: 'flex', alignItems: 'center' }}>
                <div style={{ position: 'relative', width: '100%', height: '31px', backgroundColor: 'transparent', borderRadius: '4px', overflow: 'visible', display: 'grid', gridTemplateColumns: gridTemplateColumnsStyle }}>
                  <div 
                    style={{ 
                      gridColumn: `${projGridColumnStart} / span ${projSpanCount}`,
                      gridRow: 1,
                      backgroundColor: '#007aff', 
                      borderRadius: '4px',
                      overflow: 'hidden',
                      zIndex: 1,
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
                      fontSize: '10px',
                      fontWeight: 'bold',
                      fontStyle: 'italic',
                      color: '#ffffff',
                      pointerEvents: 'none'
                    }}>
                      {projectProgress}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Графік Ганта по стадіях */}
              {(!activeProject.stages || activeProject.stages.length === 0) ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#8e8e93', fontStyle: 'italic' }}>Немає стадій</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', overflow: 'visible', backgroundColor: '#ffffff', borderBottom: '1px solid #d1d1d6', borderLeft: '1px solid #d1d1d6', borderRight: '1px solid #d1d1d6', borderRadius: '0 0 12px 12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  {activeProject.stages.map((stage: any, sIdx: number) => {
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

                    const startIndex = Math.max(0, Math.floor((startMs - adjustedMinTimestamp) / dayWidthMs));
                    const endIndex = Math.max(startIndex, Math.ceil((endMs - adjustedMinTimestamp) / dayWidthMs));
                    const spanCount = Math.max(1, endIndex - startIndex);

                    const gridColumnStart = startIndex + 1;

                    let prevEndMs = adjustedMinTimestamp;
                    for (let i = 0; i < sIdx; i++) {
                      const stPrev = activeProject.stages[i];
                      const stPrevEnd = stPrev.reviewDate || stPrev.endDate;
                      if (stPrevEnd) {
                        const t = new Date(stPrevEnd).getTime();
                        if (t > prevEndMs) prevEndMs = t;
                      }
                    }

                    let gapGridStart = 0;
                    let gapSpanCount = 0;
                    const GAP_THRESHOLD_MS = 2 * 24 * 60 * 60 * 1000;

                    if (sIdx > 0 && startMs > prevEndMs + GAP_THRESHOLD_MS) {
                      const prevEndDateObj = new Date(prevEndMs);
                      prevEndDateObj.setDate(prevEndDateObj.getDate() + 1);
                      prevEndDateObj.setHours(0, 0, 0, 0);

                      const gStartIndex = Math.max(0, Math.floor((prevEndDateObj.getTime() - adjustedMinTimestamp) / dayWidthMs));
                      const gEndIndex = Math.max(gStartIndex, Math.floor((startMs - adjustedMinTimestamp) / dayWidthMs));
                      if (gEndIndex > gStartIndex) {
                        gapGridStart = gStartIndex + 1;
                        gapSpanCount = gEndIndex - gStartIndex;
                      }
                    }

                    const gapKey = `stage_${stage.id || sIdx}_gap`;
                    const savedComment = gapComments[gapKey];
                    const isEditing = editingGapKey === gapKey;
                    const isNearBottom = sIdx >= totalStagesCount - 2;

                    return (
                      <div key={stage.id || sIdx} style={{ padding: '0', height: STAGE_ROW_HEIGHT, boxSizing: 'border-box', backgroundColor: sIdx % 2 === 1 ? '#fafafa' : '#ffffff', overflow: 'visible', display: 'flex', alignItems: 'center', borderBottom: sIdx === activeProject.stages.length - 1 ? 'none' : '1px solid #e5e5ea', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                        
                        <div style={{ position: 'relative', width: '100%', height: '31px', backgroundColor: 'transparent', borderRadius: '4px', overflow: 'visible', display: 'grid', gridTemplateColumns: gridTemplateColumnsStyle }}>
                          
                          {/* Червоний геп */}
                          {gapSpanCount > 0 && (
                            <div 
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingGapKey(gapKey);
                                setTempComment(savedComment || '');
                              }}
                              title={savedComment ? `Коментар: ${savedComment}` : "Клікніть, щоб додати коментар до гепу (паузи)"}
                              style={{
                                gridColumn: `${gapGridStart} / span ${gapSpanCount}`,
                                gridRow: 1,
                                backgroundColor: '#ff3b30',
                                borderRadius: '4px',
                                opacity: 0.9,
                                zIndex: 2,
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
                                  fontSize: '10px',
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
                                  ...(isNearBottom ? { bottom: '38px' } : { top: '38px' }),
                                  left: '0px',
                                  zIndex: 1000,
                                  backgroundColor: '#ffffff',
                                  border: '1px solid #d1d1d6',
                                  borderRadius: '8px',
                                  padding: '8px',
                                  boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                                  width: '230px',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '6px',
                                  cursor: 'default'
                                }} onClick={(e) => e.stopPropagation()}>
                                  <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#ff3b30' }}>Причина паузи / гепу:</span>
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
                                        padding: '5px 8px',
                                        border: '1px solid #d1d1d6',
                                        borderRadius: '6px',
                                        fontSize: '11px',
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
                                        borderRadius: '6px',
                                        width: '28px',
                                        height: '28px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        fontSize: '14px',
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

                          {/* Смужка стадії */}
                          <div 
                            style={{ 
                              gridColumn: `${gridColumnStart} / span ${spanCount}`,
                              gridRow: 1,
                              backgroundColor: '#e5e5ea', 
                              borderRadius: '4px',
                              overflow: 'hidden',
                              zIndex: 1,
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
                                fontSize: '10px',
                                fontWeight: 'bold',
                                fontStyle: 'italic',
                                color: progressPct > 50 ? '#ffffff' : '#1c1c1e',
                                pointerEvents: 'none'
                              }}>
                                {progressPct}%
                              </span>
                            )}
                          </div>

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
