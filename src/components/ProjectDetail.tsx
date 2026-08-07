import React, { useState } from 'react';
import { Project, Stage, SubStage, TeamMember } from '../App';

interface ProjectDetailProps {
  project: Project;
  onUpdateProject: (project: Project) => void;
  onSaveAsTemplate: (project: Project, templateName: string) => void;
  onBack: () => void;
  teamDatabase: TeamMember[];
  availableRoles: string[];
}

interface GeneralDataRow {
  id: string;
  type: 'single' | 'double';
  label?: string;
  value: string;
}

const DEFAULT_COLORS = [
  '#34c759', '#00c7be', '#5856d6', '#007aff',
  '#ff3b30', '#5c3d2e', '#ff9500', '#af52de'
];

export const ProjectDetail: React.FC<ProjectDetailProps> = ({
  project,
  onUpdateProject,
  onSaveAsTemplate,
  onBack,
  teamDatabase = [],
  availableRoles = []
}) => {
  const [isHeaderOpen, setIsHeaderOpen] = useState(false);
  const [name, setName] = useState(project.name);
  const [projectId, setProjectId] = useState(project.id);

  const [colors, setColors] = useState<string[]>(() => {
    const initial = [...DEFAULT_COLORS];
    if (project.color && !initial.includes(project.color)) {
      initial[0] = project.color;
    }
    return initial;
  });
  const [selectedColorIndex, setSelectedColorIndex] = useState<number>(() => {
    const idx = DEFAULT_COLORS.indexOf(project.color);
    return idx !== -1 ? idx : 0;
  });

  const [isGeneralDataOpen, setIsGeneralDataOpen] = useState(true);
  const [generalRows, setGeneralRows] = useState<GeneralDataRow[]>(() => project.passportRows || [
    { id: '1', type: 'single', value: '' },
    { id: '2', type: 'double', label: '', value: '' }
  ]);

  const [isStructureOpen, setIsStructureOpen] = useState(true);
  const [stages, setStages] = useState<Stage[]>(() => (project.stages || []).map(s => ({
    ...s,
    contractors: (s as any).contractors || (s.contractor ? [s.contractor] : [])
  })));
  const [collapsedStages, setCollapsedStages] = useState<{ [key: string]: boolean }>({});
  const [newStageTitle, setNewStageTitle] = useState('');
  const [newSubStageTitle, setNewSubStageTitle] = useState<{ [key: string]: string }>({});

  const [editingTimeStageId, setEditingTimeStageId] = useState<string | null>(null);
  const [manualHours, setManualHours] = useState('0');
  const [manualMinutes, setManualMinutes] = useState('0');

  const [isTeamOpen, setIsTeamOpen] = useState(true);
  const [projectTeam, setProjectTeam] = useState<{ id: string; memberId: string; role: string }[]>(
    project.projectTeam || []
  );
  const [selectedMemberId, setSelectedMemberId] = useState(teamDatabase[0]?.id || '');
  const [selectedProjectRole, setSelectedProjectRole] = useState(availableRoles[0] || 'Draftsman');

  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [templateNameInput, setTemplateNameInput] = useState(project.name);

  const [draggedDataIndex, setDraggedDataIndex] = useState<number | null>(null);
  const [draggedSubStage, setDraggedSubStage] = useState<{ stageId: string; index: number } | null>(null);

  const handleAutoSaveBasicInfo = (updatedName?: string, updatedId?: string, updatedColorIndex?: number) => {
    const nextName = updatedName !== undefined ? updatedName : name;
    const nextId = updatedId !== undefined ? updatedId : projectId;
    const nextColor = colors[updatedColorIndex !== undefined ? updatedColorIndex : selectedColorIndex];

    onUpdateProject({
      ...project,
      id: nextId.trim(),
      name: nextName.trim(),
      color: nextColor,
      passportRows: generalRows,
      stages,
      projectTeam
    });
  };

  const handleCustomColorPicker = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    const updated = [...colors];
    updated[selectedColorIndex] = newColor;
    setColors(updated);
    handleAutoSaveBasicInfo(undefined, undefined, selectedColorIndex);
  };

  const handleAddRowAfter = (index: number) => {
    const newRow: GeneralDataRow = { id: Date.now().toString(), type: 'double', label: '', value: '' };
    const updated = [...generalRows];
    updated.splice(index + 1, 0, newRow);
    setGeneralRows(updated);
  };

  const handleUpdateGeneralRow = (id: string, field: 'label' | 'value', text: string) => {
    setGeneralRows(generalRows.map(r => r.id === id ? { ...r, [field]: text } : r));
  };

  const handleDeleteGeneralRow = (id: string) => {
    setGeneralRows(generalRows.filter(r => r.id !== id));
  };

  const handleDataDragStart = (index: number) => {
    setDraggedDataIndex(index);
  };

  const handleDataDrop = (targetIndex: number) => {
    if (draggedDataIndex === null || draggedDataIndex === targetIndex) return;
    const updated = [...generalRows];
    const [movedItem] = updated.splice(draggedDataIndex, 1);
    updated.splice(targetIndex, 0, movedItem);
    setGeneralRows(updated);
    setDraggedDataIndex(null);
  };

  const handleAddStage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStageTitle.trim()) return;

    const newStage: Stage = {
      id: Date.now().toString(),
      title: newStageTitle.trim(),
      subStages: [],
      trackTime: true,
      loggedSeconds: 0,
      isTimerRunning: false,
      startDate: '',
      endDate: '',
      contractors: []
    } as any;

    setStages([...stages, newStage]);
    setNewStageTitle('');
  };

  const handleUpdateStageTitle = (stageId: string, newTitle: string) => {
    setStages(stages.map(s => s.id === stageId ? { ...s, title: newTitle } : s));
  };

  // Функції для керування багатьма виконавцями на стадії
  const handleAddStageContractor = (stageId: string, contractorName: string) => {
    if (!contractorName) return;
    setStages(stages.map(s => {
      if (s.id === stageId) {
        const currentList = (s as any).contractors || (s.contractor ? [s.contractor] : []);
        if (!currentList.includes(contractorName)) {
          return { ...s, contractors: [...currentList, contractorName] };
        }
      }
      return s;
    }));
  };

  const handleRemoveStageContractor = (stageId: string, contractorName: string) => {
    setStages(stages.map(s => {
      if (s.id === stageId) {
        const currentList = (s as any).contractors || (s.contractor ? [s.contractor] : []);
        return { ...s, contractors: currentList.filter((c: string) => c !== contractorName) };
      }
      return s;
    }));
  };

  const handleDeleteStage = (id: string) => {
    setStages(stages.filter(s => s.id !== id));
  };

  const handleToggleStageTrackTime = (stageId: string) => {
    setStages(stages.map(s => s.id === stageId ? { ...s, trackTime: s.trackTime === false } : s));
  };

  const handleToggleStageTimer = (stageId: string) => {
    setStages(stages.map(s => {
      if (s.id === stageId) {
        return { ...s, isTimerRunning: !s.isTimerRunning };
      }
      return s;
    }));
  };

  const handleSaveManualTime = (stageId: string) => {
    const sec = (parseInt(manualHours) || 0) * 3600 + (parseInt(manualMinutes) || 0) * 60;
    setStages(stages.map(s => s.id === stageId ? { ...s, loggedSeconds: sec } : s));
    setEditingTimeStageId(null);
  };

  const handleUpdateStageDates = (stageId: string, field: 'startDate' | 'endDate', val: string) => {
    setStages(stages.map(s => s.id === stageId ? { ...s, [field]: val } : s));
  };

  const handleAddSubStage = (stageId: string) => {
    const title = newSubStageTitle[stageId];
    if (!title || !title.trim()) return;

    setStages(stages.map(s => {
      if (s.id === stageId) {
        const newSub: SubStage = {
          id: Date.now().toString(),
          title: title.trim(),
          completed: false
        };
        return { ...s, subStages: [...s.subStages, newSub] };
      }
      return s;
    }));

    setNewSubStageTitle({ ...newSubStageTitle, [stageId]: '' });
  };

  const handleUpdateSubStageTitle = (stageId: string, subStageId: string, newTitle: string) => {
    setStages(stages.map(s => {
      if (s.id === stageId) {
        return {
          ...s,
          subStages: s.subStages.map(sub => sub.id === subStageId ? { ...sub, title: newTitle } : sub)
        };
      }
      return s;
    }));
  };

  const handleToggleSubStage = (stageId: string, subStageId: string) => {
    setStages(stages.map(s => {
      if (s.id === stageId) {
        return {
          ...s,
          subStages: s.subStages.map(sub => sub.id === subStageId ? { ...sub, completed: !sub.completed } : sub)
        };
      }
      return s;
    }));
  };

  const handleSubStageDragStart = (stageId: string, index: number) => {
    setDraggedSubStage({ stageId, index });
  };

  const handleSubStageDrop = (stageId: string, targetIndex: number) => {
    if (!draggedSubStage || draggedSubStage.stageId !== stageId || draggedSubStage.index === targetIndex) return;

    setStages(stages.map(s => {
      if (s.id === stageId) {
        const list = [...s.subStages];
        const [movedItem] = list.splice(draggedSubStage.index, 1);
        list.splice(targetIndex, 0, movedItem);
        return { ...s, subStages: list };
      }
      return s;
    }));
    setDraggedSubStage(null);
  };

  const handleDeleteSubStage = (stageId: string, subStageId: string) => {
    setStages(stages.map(s => {
      if (s.id === stageId) {
        return { ...s, subStages: s.subStages.filter(sub => sub.id !== subStageId) };
      }
      return s;
    }));
  };

  const handleAddProjectMember = () => {
    if (!selectedMemberId) return;
    const newEntry = { id: Date.now().toString(), memberId: selectedMemberId, role: selectedProjectRole };
    setProjectTeam([...projectTeam, newEntry]);
  };

  const handleRemoveProjectMember = (id: string) => {
    setProjectTeam(projectTeam.filter(m => m.id !== id));
  };

  const handleFinalSave = () => {
    const updatedProject: Project = {
      ...project,
      id: projectId.trim(),
      name: name.trim(),
      color: colors[selectedColorIndex],
      passportRows: generalRows,
      stages,
      projectTeam
    };

    onUpdateProject(updatedProject);

    if (saveAsTemplate && templateNameInput.trim()) {
      onSaveAsTemplate(updatedProject, templateNameInput.trim());
    }

    alert('Changes saved successfully!');
    onBack();
  };

  const formatTime = (sec: number = 0) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    return `${h}h ${m}min`;
  };

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto', color: '#1c1c1e' }}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', fontSize: '14px', color: '#007aff', cursor: 'pointer', marginBottom: '16px', fontWeight: 600 }}>
        ← Back
      </button>

      {/* 1. Header Block */}
      <div style={{ backgroundColor: '#f2f2f7', padding: '14px', borderRadius: '12px', marginBottom: '16px' }}>
        <div 
          onClick={() => setIsHeaderOpen(!isHeaderOpen)} 
          style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>{name || 'Untitled'}</h3>
          <span style={{ fontSize: '12px', color: '#8e8e93' }}>{isHeaderOpen ? '▲' : '▼'}</span>
        </div>

        {isHeaderOpen && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }} onClick={(e) => e.stopPropagation()}>
            <div>
              <label style={labelStyle}>Project Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  handleAutoSaveBasicInfo(e.target.value, undefined, undefined);
                }}
                style={cardInputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Project ID</label>
              <input
                type="text"
                value={projectId}
                onChange={(e) => {
                  setProjectId(e.target.value);
                  handleAutoSaveBasicInfo(undefined, e.target.value, undefined);
                }}
                style={cardInputStyle}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
              {colors.map((c, idx) => {
                const isSelected = selectedColorIndex === idx;
                return (
                  <div
                    key={idx}
                    onClick={() => {
                      setSelectedColorIndex(idx);
                      handleAutoSaveBasicInfo(undefined, undefined, idx);
                    }}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: c,
                      border: '1px solid #d1d1d6',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    {isSelected && <span style={{ color: '#fff', fontSize: '12px', fontWeight: 700 }}>✓</span>}
                  </div>
                );
              })}

              <label
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: '#e5e5ea',
                  border: '1px solid #d1d1d6',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  fontSize: '22px',
                  fontWeight: 700,
                  color: '#007aff',
                  position: 'relative',
                  padding: 0,
                  margin: 0,
                  boxSizing: 'border-box'
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', lineHeight: 1 }}>+</span>
                <input
                  type="color"
                  value={colors[selectedColorIndex]}
                  onChange={handleCustomColorPicker}
                  style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer', top: 0, left: 0 }}
                />
              </label>
            </div>
          </div>
        )}
      </div>

      {/* 2. Data Block */}
      <div style={{ backgroundColor: '#f2f2f7', padding: '14px', borderRadius: '12px', marginBottom: '16px' }}>
        <div 
          onClick={() => setIsGeneralDataOpen(!isGeneralDataOpen)}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <span style={{ fontSize: '12px', color: '#8e8e93' }}>{isGeneralDataOpen ? '▲' : '▼'}</span>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>Data</h3>
        </div>

        {isGeneralDataOpen && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
            {generalRows.map((r, index) => (
              <div 
                key={r.id} 
                draggable
                onDragStart={() => handleDataDragStart(index)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDataDrop(index)}
                style={{ display: 'flex', gap: '8px', alignItems: 'center', cursor: 'grab' }}
              >
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#8e8e93', width: '16px', textAlign: 'center', userSelect: 'none' }}>
                  {index + 1}.
                </span>

                {r.type === 'single' ? (
                  <input
                    type="text"
                    value={r.value}
                    onChange={(e) => handleUpdateGeneralRow(r.id, 'value', e.target.value)}
                    style={{ ...cardInputStyle, flex: 1 }}
                  />
                ) : (
                  <>
                    <input
                      type="text"
                      value={r.label || ''}
                      onChange={(e) => handleUpdateGeneralRow(r.id, 'label', e.target.value)}
                      style={{ ...cardInputStyle, flex: 1 }}
                    />
                    <input
                      type="text"
                      value={r.value}
                      onChange={(e) => handleUpdateGeneralRow(r.id, 'value', e.target.value)}
                      style={{ ...cardInputStyle, width: '60px', flexShrink: 0, textAlign: 'center' }}
                    />
                  </>
                )}

                <div style={{ display: 'flex', gap: '4px', alignItems: 'center', width: '70px', justifyContent: 'center' }}>
                  <button onClick={() => handleAddRowAfter(index)} style={compactPlusBtnStyle}>+</button>
                  <button onClick={() => handleDeleteGeneralRow(r.id)} style={{ ...compactPlusBtnStyle, color: '#ff3b30' }}>🗑️</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Structure Block */}
      <div style={{ backgroundColor: '#f2f2f7', padding: '14px', borderRadius: '12px', marginBottom: '20px' }}>
        <div 
          onClick={() => setIsStructureOpen(!isStructureOpen)}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}
        >
          <span style={{ fontSize: '12px', color: '#8e8e93' }}>{isStructureOpen ? '▲' : '▼'}</span>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>Structure</h3>
        </div>

        {isStructureOpen && (
          <>
            <form onSubmit={handleAddStage} style={{ display: 'flex', gap: '6px', marginBottom: '14px' }}>
              <input
                type="text"
                placeholder="come up with your own structure"
                value={newStageTitle}
                onChange={(e) => setNewStageTitle(e.target.value)}
                style={{ ...cardInputStyle, flex: 1 }}
              />
              <button type="submit" style={compactPlusBtnStyle}>
                +
              </button>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {stages.map((st) => {
                const isCollapsed = collapsedStages[st.id];
                const isTrackTimeOn = st.trackTime !== false;
                const stageContractors: string[] = (st as any).contractors || (st.contractor ? [st.contractor] : []);

                return (
                  <div key={st.id} style={{ backgroundColor: '#ffffff', padding: '12px', borderRadius: '10px', border: '1px solid #e5e5ea' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                        <span 
                          onClick={() => setCollapsedStages({ ...collapsedStages, [st.id]: !isCollapsed })}
                          style={{ cursor: 'pointer', fontSize: '12px', color: '#8e8e93' }}
                        >
                          {isCollapsed ? '▼' : '▲'}
                        </span>

                        <input
                          type="text"
                          value={st.title}
                          onChange={(e) => handleUpdateStageTitle(st.id, e.target.value)}
                          style={inlineTitleInputStyle}
                        />
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {isTrackTimeOn && (
                          <>
                            <button
                              onClick={() => handleToggleStageTimer(st.id)}
                              style={{
                                ...btnStyle,
                                backgroundColor: st.isTimerRunning ? '#ff3b30' : '#34c759',
                                color: '#fff',
                                fontSize: '11px',
                                padding: '4px 8px'
                              }}
                            >
                              {st.isTimerRunning ? `⏸ [ ${formatTime(st.loggedSeconds)} ]` : `▶ [ ${formatTime(st.loggedSeconds)} ]`}
                            </button>

                            <button
                              onClick={() => {
                                setEditingTimeStageId(editingTimeStageId === st.id ? null : st.id);
                                setManualHours(Math.floor((st.loggedSeconds || 0) / 3600).toString());
                                setManualMinutes(Math.floor(((st.loggedSeconds || 0) % 3600) / 60).toString());
                              }}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}
                            >
                              ⏱️
                            </button>
                          </>
                        )}

                        <div style={{ width: '38px', display: 'flex', justifyContent: 'center', transform: 'translateX(1px)' }}>
                          <button onClick={() => handleDeleteStage(st.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}>
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Додавання кількох виконавців через селект та кнопку + */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <select
                          id={`select-contractor-${st.id}`}
                          defaultValue=""
                          style={{ ...cardInputStyle, fontSize: '12px', padding: '6px 8px', flex: 1 }}
                        >
                          <option value="">Select contractor / assignee...</option>
                          {projectTeam.map(pt => {
                            const member = teamDatabase.find(m => m.id === pt.memberId);
                            const nameStr = `${member?.fullName || 'Member'} (${pt.role})`;
                            return (
                              <option key={pt.id} value={member?.fullName || ''}>
                                {nameStr}
                              </option>
                            );
                          })}
                        </select>
                        <button
                          type="button"
                          onClick={() => {
                            const selectEl = document.getElementById(`select-contractor-${st.id}`) as HTMLSelectElement;
                            if (selectEl && selectEl.value) {
                              handleAddStageContractor(st.id, selectEl.value);
                              selectEl.value = '';
                            }
                          }}
                          style={compactPlusBtnStyle}
                          title="Add contractor"
                        >
                          +
                        </button>
                      </div>

                      {stageContractors.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '2px' }}>
                          {stageContractors.map((cName, cIdx) => (
                            <div key={cIdx, cName} style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#e5e5ea', padding: '4px 8px', borderRadius: '6px', fontSize: '12px' }}>
                              <span>{cName}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveStageContractor(st.id, cName)}
                                style={{ background: 'none', border: 'none', color: '#ff3b30', cursor: 'pointer', fontSize: '11px', padding: 0, fontWeight: 700 }}
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {editingTimeStageId === st.id && (
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '8px', padding: '6px', backgroundColor: '#f2f2f7', borderRadius: '6px', fontSize: '12px' }}>
                        <span>Hours:</span>
                        <input type="number" value={manualHours} onChange={(e) => setManualHours(e.target.value)} style={{ ...cardInputStyle, width: '50px', padding: '2px 4px' }} />
                        <span>Min:</span>
                        <input type="number" value={manualMinutes} onChange={(e) => setManualMinutes(e.target.value)} style={{ ...cardInputStyle, width: '50px', padding: '2px 4px' }} />
                        <button onClick={() => handleSaveManualTime(st.id)} style={{ ...btnStyle, backgroundColor: '#34c759', color: '#fff', padding: '2px 6px', fontSize: '11px' }}>✓</button>
                      </div>
                    )}

                    {!isCollapsed && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #f2f2f7' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                          <span>time</span>
                          <div style={{ width: '38px', display: 'flex', justifyContent: 'center', transform: 'translateX(1px)' }}>
                            <div
                              onClick={() => handleToggleStageTrackTime(st.id)}
                              style={{
                                width: '34px',
                                height: '20px',
                                borderRadius: '10px',
                                backgroundColor: isTrackTimeOn ? '#34c759' : '#e5e5ea',
                                position: 'relative',
                                cursor: 'pointer'
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
                                  left: isTrackTimeOn ? '16px' : '2px',
                                  transition: 'left 0.2s'
                                }}
                              />
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '8px', fontSize: '11px' }}>
                          <input
                            type="date"
                            value={st.startDate || ''}
                            onChange={(e) => handleUpdateStageDates(st.id, 'startDate', e.target.value)}
                            style={{ ...cardInputStyle, flex: 1, padding: '4px', fontSize: '11px' }}
                          />
                          <input
                            type="date"
                            value={st.endDate || ''}
                            onChange={(e) => handleUpdateStageDates(st.id, 'endDate', e.target.value)}
                            style={{ ...cardInputStyle, flex: 1, padding: '4px', fontSize: '11px' }}
                          />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
                          {st.subStages.map((sub, idx) => (
                            <div 
                              key={sub.id} 
                              draggable
                              onDragStart={() => handleSubStageDragStart(st.id, idx)}
                              onDragOver={(e) => e.preventDefault()}
                              onDrop={() => handleSubStageDrop(st.id, idx)}
                              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px', cursor: 'grab' }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
                                <input
                                  type="checkbox"
                                  checked={sub.completed}
                                  onChange={() => handleToggleSubStage(st.id, sub.id)}
                                />
                                
                                <span style={{ fontWeight: 600, color: '#8e8e93', userSelect: 'none', minWidth: '16px' }}>{idx + 1}.</span>

                                <input
                                  type="text"
                                  value={sub.title}
                                  onChange={(e) => handleUpdateSubStageTitle(st.id, sub.id, e.target.value)}
                                  style={{
                                    ...inlineTitleInputStyle,
                                    fontSize: '13px',
                                    textDecoration: sub.completed ? 'line-through' : 'none',
                                    color: sub.completed ? '#8e8e93' : '#1c1c1e'
                                  }}
                                />
                              </div>

                              <div style={{ width: '38px', display: 'flex', justifyContent: 'center', transform: 'translateX(1px)' }}>
                                <button onClick={() => handleDeleteSubStage(st.id, sub.id)} style={{ ...iconBtnStyle, color: '#ff3b30' }}>🗑️</button>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                          <input
                            type="text"
                            placeholder="Add task/subtask"
                            value={newSubStageTitle[st.id] || ''}
                            onChange={(e) => setNewSubStageTitle({ ...newSubStageTitle, [st.id]: e.target.value })}
                            style={{ ...cardInputStyle, padding: '6px 8px', fontSize: '12px', flex: 1 }}
                          />
                          <button onClick={() => handleAddSubStage(st.id)} style={compactPlusBtnStyle}>
                            +
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* 4. Team Block */}
      <div style={{ backgroundColor: '#f2f2f7', padding: '14px', borderRadius: '12px', marginBottom: '20px' }}>
        <div 
          onClick={() => setIsTeamOpen(!isTeamOpen)}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: isTeamOpen ? '10px' : 0 }}
        >
          <span style={{ fontSize: '12px', color: '#8e8e93' }}>{isTeamOpen ? '▲' : '▼'}</span>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>Team</h3>
        </div>

        {isTeamOpen && (
          <>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
              <select
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                style={{ ...cardInputStyle, flex: 1, fontSize: '12px' }}
              >
                {teamDatabase.length === 0 && <option value="">No members in DB</option>}
                {teamDatabase.map((m) => (
                  <option key={m.id} value={m.id}>{m.fullName}</option>
                ))}
              </select>

              <select
                value={selectedProjectRole}
                onChange={(e) => setSelectedProjectRole(e.target.value)}
                style={{ ...cardInputStyle, flex: 1, fontSize: '12px' }}
              >
                {availableRoles.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>

              <button onClick={handleAddProjectMember} style={compactPlusBtnStyle}>
                +
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {projectTeam.map((pt) => {
                const member = teamDatabase.find(m => m.id === pt.memberId);
                return (
                  <div key={pt.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', backgroundColor: '#ffffff', borderRadius: '8px', fontSize: '13px', border: '1px solid #e5e5ea' }}>
                    <span><strong>{member?.fullName || 'Member'}</strong> ({pt.role})</span>
                    <div style={{ width: '38px', display: 'flex', justifyContent: 'center', transform: 'translateX(1px)' }}>
                      <button onClick={() => handleRemoveProjectMember(pt.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}>🗑️</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* 5. Save Block */}
      <div style={{ backgroundColor: '#ffffff', padding: '14px', border: '1px solid #e5e5ea', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={saveAsTemplate}
            onChange={(e) => setSaveAsTemplate(e.target.checked)}
          />
          Save as a new template
        </label>

        {saveAsTemplate && (
          <input
            type="text"
            placeholder="Template Name"
            value={templateNameInput}
            onChange={(e) => setTemplateNameInput(e.target.value)}
            style={cardInputStyle}
          />
        )}

        <button
          onClick={handleFinalSave}
          style={{ width: '100%', padding: '14px', backgroundColor: '#007aff', color: '#ffffff', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '15px', cursor: 'pointer' }}
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

const cardInputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  backgroundColor: '#e5e5ea',
  border: '1px solid #d1d1d6',
  borderRadius: '8px',
  fontSize: '13px',
  outline: 'none',
  boxSizing: 'border-box',
  color: '#1c1c1e'
};

const inlineTitleInputStyle: React.CSSProperties = {
  width: '100%',
  border: 'none',
  background: 'transparent',
  fontSize: '14px',
  fontWeight: 700,
  color: '#1c1c1e',
  outline: 'none',
  padding: '2px 0'
};

const labelStyle: React.CSSProperties = {
  fontSize: '12px',
  fontWeight: 600,
  color: '#636366',
  marginBottom: '2px',
  display: 'block'
};

const btnStyle: React.CSSProperties = {
  padding: '8px 12px',
  borderRadius: '8px',
  border: 'none',
  fontWeight: 600,
  fontSize: '13px',
  cursor: 'pointer'
};

const iconBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontSize: '12px',
  padding: '2px 4px'
};

const compactPlusBtnStyle: React.CSSProperties = {
  backgroundColor: '#e5e5ea',
  border: '1px solid #d1d1d6',
  borderRadius: '6px',
  width: '26px',
  height: '26px',
  fontSize: '16px',
  fontWeight: 700,
  lineHeight: '1',
  color: '#1c1c1e',
  padding: 0,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0
};

export default ProjectDetail;
