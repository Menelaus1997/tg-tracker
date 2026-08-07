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
  // 1. Шапка проекту (Динамічна назва)
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

  // 2. ЗАГАЛЬНІ ДАНІ (колишній Паспорт об'єкта)
  const [isGeneralDataOpen, setIsGeneralDataOpen] = useState(true);
  const [generalRows, setGeneralRows] = useState<GeneralDataRow[]>(() => project.passportRows || [
    { id: '1', type: 'single', value: 'м. Київ, вул. Хрещатик, 1' },
    { id: '2', type: 'double', label: 'Загальна площа', value: '85 кв.м' }
  ]);

  // 3. Структура (Стадії та задачі)
  const [isStructureOpen, setIsStructureOpen] = useState(true);
  const [stages, setStages] = useState<Stage[]>(project.stages || []);
  const [collapsedStages, setCollapsedStages] = useState<{ [key: string]: boolean }>({});
  const [newStageTitle, setNewStageTitle] = useState('');
  const [newSubStageTitle, setNewSubStageTitle] = useState<{ [key: string]: string }>({});

  // Ручне редагування часу для конкретної стадії
  const [editingTimeStageId, setEditingTimeStageId] = useState<string | null>(null);
  const [manualHours, setManualHours] = useState('0');
  const [manualMinutes, setManualMinutes] = useState('0');

  // 4. Команда проекту
  const [isTeamOpen, setIsTeamOpen] = useState(true);
  const [projectTeam, setProjectTeam] = useState<{ id: string; memberId: string; role: string }[]>(
    project.projectTeam || []
  );
  const [selectedMemberId, setSelectedMemberId] = useState(teamDatabase[0]?.id || '');
  const [selectedProjectRole, setSelectedProjectRole] = useState(availableRoles[0] || 'Кресляр');

  // 5. Фінальне збереження та Шаблон
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [templateNameInput, setTemplateNameInput] = useState(project.name);

  // Автозбереження базової інформації при її зміні
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

  // Палітра: Зміна кольору вибраної позиції через піпетку
  const handleCustomColorPicker = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    const updated = [...colors];
    updated[selectedColorIndex] = newColor;
    setColors(updated);
    handleAutoSaveBasicInfo(undefined, undefined, selectedColorIndex);
  };

  // Обробники Загальних даних
  const handleAddRowAfter = (index: number, type: 'single' | 'double') => {
    const newRow: GeneralDataRow = { id: Date.now().toString(), type, label: '', value: '' };
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

  // Стадії
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
      endDate: ''
    };

    setStages([...stages, newStage]);
    setNewStageTitle('');
  };

  const handleUpdateStageTitle = (stageId: string, newTitle: string) => {
    setStages(stages.map(s => s.id === stageId ? { ...s, title: newTitle } : s));
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

  // Підстадії
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

  const handleMoveSubStage = (stageId: string, index: number, direction: 'up' | 'down') => {
    setStages(stages.map(s => {
      if (s.id === stageId) {
        const list = [...s.subStages];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= list.length) return s;
        const temp = list[index];
        list[index] = list[targetIndex];
        list[targetIndex] = temp;
        return { ...s, subStages: list };
      }
      return s;
    }));
  };

  const handleDeleteSubStage = (stageId: string, subStageId: string) => {
    setStages(stages.map(s => {
      if (s.id === stageId) {
        return { ...s, subStages: s.subStages.filter(sub => sub.id !== subStageId) };
      }
      return s;
    }));
  };

  // Команда
  const handleAddProjectMember = () => {
    if (!selectedMemberId) return;
    const newEntry = { id: Date.now().toString(), memberId: selectedMemberId, role: selectedProjectRole };
    setProjectTeam([...projectTeam, newEntry]);
  };

  const handleRemoveProjectMember = (id: string) => {
    setProjectTeam(projectTeam.filter(m => m.id !== id));
  };

  // Фінальне збереження
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

    alert('Зміни успішно збережено!');
    onBack();
  };

  const formatTime = (sec: number = 0) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    return `${h}г ${m}хв`;
  };

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto', color: '#1c1c1e' }}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', fontSize: '14px', color: '#007aff', cursor: 'pointer', marginBottom: '16px', fontWeight: 600 }}>
        ← Назад до проектів
      </button>

      {/* 1. Блок: Назва проекту (замість «Основна інформація») */}
      <div style={{ backgroundColor: '#f2f2f7', padding: '14px', borderRadius: '12px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>{name || 'Без назви'}</h3>
          <button onClick={() => setIsHeaderOpen(!isHeaderOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>
            ✏️
          </button>
        </div>

        {isHeaderOpen && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
            <div>
              <label style={labelStyle}>Найменування проекта</label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  handleAutoSaveBasicInfo(e.target.value, undefined, undefined);
                }}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>ID проекту</label>
              <input
                type="text"
                value={projectId}
                onChange={(e) => {
                  setProjectId(e.target.value);
                  handleAutoSaveBasicInfo(undefined, e.target.value, undefined);
                }}
                style={inputStyle}
              />
            </div>

            {/* Палітра з сірим контуром навколо кіл */}
            <div>
              <label style={labelStyle}>Колір маркування</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
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
                    fontSize: '16px',
                    fontWeight: 600,
                    color: '#007aff',
                    position: 'relative'
                  }}
                  title="Змінити колір вибраного кола"
                >
                  +
                  <input
                    type="color"
                    value={colors[selectedColorIndex]}
                    onChange={handleCustomColorPicker}
                    style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }}
                  />
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Блок: ЗАГАЛЬНІ ДАНІ */}
      <div style={{ backgroundColor: '#f2f2f7', padding: '14px', borderRadius: '12px', marginBottom: '16px' }}>
        <div 
          onClick={() => setIsGeneralDataOpen(!isGeneralDataOpen)}
          style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>ЗАГАЛЬНІ ДАНІ</h3>
          <span style={{ fontSize: '12px', color: '#8e8e93' }}>{isGeneralDataOpen ? '▲' : '▼'}</span>
        </div>

        {isGeneralDataOpen && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
            {generalRows.map((r, index) => (
              <div key={r.id} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {r.type === 'single' ? (
                  <input
                    type="text"
                    placeholder="Локація / Адреса об'єкта"
                    value={r.value}
                    onChange={(e) => handleUpdateGeneralRow(r.id, 'value', e.target.value)}
                    style={{ ...inputStyle, width: '180px', flexShrink: 0 }}
                  />
                ) : (
                  <>
                    <input
                      type="text"
                      placeholder="Параметр"
                      value={r.label || ''}
                      onChange={(e) => handleUpdateGeneralRow(r.id, 'label', e.target.value)}
                      style={{ ...inputStyle, width: '180px', flexShrink: 0 }}
                    />
                    <input
                      type="text"
                      placeholder="Значення"
                      value={r.value}
                      onChange={(e) => handleUpdateGeneralRow(r.id, 'value', e.target.value)}
                      style={{ ...inputStyle, flex: 1 }}
                    />
                  </>
                )}

                <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flexShrink: 0 }}>
                  <button onClick={() => handleAddRowAfter(index, 'single')} style={actionIconBtnStyle} title="Додати рядок адреси">+</button>
                  <button onClick={() => handleAddRowAfter(index, 'double')} style={actionIconBtnStyle} title="Додати параметр/значення">++</button>
                  <button onClick={() => handleDeleteGeneralRow(r.id)} style={{ ...actionIconBtnStyle, color: '#ff3b30' }}>🗑️</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Блок: Структура (Стадії та задачі) */}
      <div style={{ backgroundColor: '#f2f2f7', padding: '14px', borderRadius: '12px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div 
            onClick={() => setIsStructureOpen(!isStructureOpen)}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <span style={{ fontSize: '12px', color: '#8e8e93' }}>{isStructureOpen ? '▲' : '▼'}</span>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>Структура</h3>
          </div>
        </div>

        {isStructureOpen && (
          <>
            <form onSubmit={handleAddStage} style={{ display: 'flex', gap: '6px', marginBottom: '14px' }}>
              <input
                type="text"
                placeholder="Нова стадія (напр. Планувальні рішення)"
                value={newStageTitle}
                onChange={(e) => setNewStageTitle(e.target.value)}
                style={{ ...inputStyle, flex: 1 }}
              />
              <button type="submit" style={{ ...btnStyle, backgroundColor: '#e5e5ea', color: '#1c1c1e' }}>+ Стадія</button>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {stages.map((st) => {
                const isCollapsed = collapsedStages[st.id];
                const isTrackTimeOn = st.trackTime !== false;

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

                        {/* Пряме inline-редагування назви стадії кліком */}
                        <input
                          type="text"
                          value={st.title}
                          onChange={(e) => handleUpdateStageTitle(st.id, e.target.value)}
                          style={inlineTitleInputStyle}
                        />
                      </div>

                      {/* Динамічний таймер (показується ТІЛЬКИ коли тумблер увімкнений) */}
                      {isTrackTimeOn && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginRight: '8px' }}>
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
                            title="Редагувати час"
                          >
                            ⏱️
                          </button>
                        </div>
                      )}

                      <button onClick={() => handleDeleteStage(st.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}>
                        🗑️
                      </button>
                    </div>

                    {/* Віконце ручного редагування часу */}
                    {editingTimeStageId === st.id && (
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '8px', padding: '6px', backgroundColor: '#f2f2f7', borderRadius: '6px', fontSize: '12px' }}>
                        <span>Годин:</span>
                        <input type="number" value={manualHours} onChange={(e) => setManualHours(e.target.value)} style={{ ...inputStyle, width: '50px', padding: '2px 4px' }} />
                        <span>Хвилин:</span>
                        <input type="number" value={manualMinutes} onChange={(e) => setManualMinutes(e.target.value)} style={{ ...inputStyle, width: '50px', padding: '2px 4px' }} />
                        <button onClick={() => handleSaveManualTime(st.id)} style={{ ...btnStyle, backgroundColor: '#34c759', color: '#fff', padding: '2px 6px', fontSize: '11px' }}>✓</button>
                      </div>
                    )}

                    {!isCollapsed && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #f2f2f7' }}>
                        {/* Тумблер обліку часу */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                          <span>Облік робочого часу за ПК</span>
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

                        <div style={{ display: 'flex', gap: '8px', fontSize: '11px' }}>
                          <div style={{ flex: 1 }}>
                            <label style={{ color: '#8e8e93', display: 'block' }}>Дата початку</label>
                            <input
                              type="date"
                              value={st.startDate || ''}
                              onChange={(e) => handleUpdateStageDates(st.id, 'startDate', e.target.value)}
                              style={{ ...inputStyle, padding: '4px', fontSize: '11px' }}
                            />
                          </div>
                          <div style={{ flex: 1 }}>
                            <label style={{ color: '#8e8e93', display: 'block' }}>Дедлайн</label>
                            <input
                              type="date"
                              value={st.endDate || ''}
                              onChange={(e) => handleUpdateStageDates(st.id, 'endDate', e.target.value)}
                              style={{ ...inputStyle, padding: '4px', fontSize: '11px' }}
                            />
                          </div>
                        </div>

                        {/* Підстадії зі стрілочками ↑ ↓ НА ЛІВІЙ СТОРОНІ */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
                          {st.subStages.map((sub, idx) => (
                            <div key={sub.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
                                <input
                                  type="checkbox"
                                  checked={sub.completed}
                                  onChange={() => handleToggleSubStage(st.id, sub.id)}
                                />
                                
                                {/* Стрілочки ↑ ↓ перенесені на ліву сторону */}
                                <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
                                  <button onClick={() => handleMoveSubStage(st.id, idx, 'up')} style={iconBtnStyle}>↑</button>
                                  <button onClick={() => handleMoveSubStage(st.id, idx, 'down')} style={iconBtnStyle}>↓</button>
                                </div>

                                <span>{idx + 1}.</span>

                                {/* Пряме inline-редагування назви підстадії */}
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

                              <button onClick={() => handleDeleteSubStage(st.id, sub.id)} style={{ ...iconBtnStyle, color: '#ff3b30' }}>🗑️</button>
                            </div>
                          ))}
                        </div>

                        <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                          <input
                            type="text"
                            placeholder="Додати підстадію / задачу"
                            value={newSubStageTitle[st.id] || ''}
                            onChange={(e) => setNewSubStageTitle({ ...newSubStageTitle, [st.id]: e.target.value })}
                            style={{ ...inputStyle, padding: '6px 8px', fontSize: '12px' }}
                          />
                          <button onClick={() => handleAddSubStage(st.id)} style={{ ...btnStyle, backgroundColor: '#e5e5ea', fontSize: '12px' }}>
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

      {/* 4. Блок: Команда проекту */}
      <div style={{ backgroundColor: '#f2f2f7', padding: '14px', borderRadius: '12px', marginBottom: '20px' }}>
        <div 
          onClick={() => setIsTeamOpen(!isTeamOpen)}
          style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isTeamOpen ? '10px' : 0 }}
        >
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>Команда проекту</h3>
          <span style={{ fontSize: '12px', color: '#8e8e93' }}>{isTeamOpen ? '▲' : '▼'}</span>
        </div>

        {isTeamOpen && (
          <>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
              <select
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                style={{ ...inputStyle, flex: 1, fontSize: '12px' }}
              >
                {teamDatabase.length === 0 && <option value="">Немає фахівців у базі</option>}
                {teamDatabase.map((m) => (
                  <option key={m.id} value={m.id}>{m.fullName}</option>
                ))}
              </select>

              <select
                value={selectedProjectRole}
                onChange={(e) => setSelectedProjectRole(e.target.value)}
                style={{ ...inputStyle, flex: 1, fontSize: '12px' }}
              >
                {availableRoles.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>

              {/* Сіра кнопка + */}
              <button onClick={handleAddProjectMember} style={{ ...btnStyle, backgroundColor: '#e5e5ea', color: '#1c1c1e', fontSize: '12px' }}>
                +
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {projectTeam.map((pt) => {
                const member = teamDatabase.find(m => m.id === pt.memberId);
                return (
                  <div key={pt.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', backgroundColor: '#ffffff', borderRadius: '8px', fontSize: '13px' }}>
                    <span><strong>{member?.fullName || 'Фахівець'}</strong> ({pt.role})</span>
                    <button onClick={() => handleRemoveProjectMember(pt.id)} style={{ background: 'none', border: 'none', color: '#ff3b30', cursor: 'pointer' }}>✕</button>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* 5. Блок: Фінальне збереження */}
      <div style={{ backgroundColor: '#ffffff', padding: '14px', border: '1px solid #e5e5ea', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={saveAsTemplate}
            onChange={(e) => setSaveAsTemplate(e.target.checked)}
          />
          Зберегти також як новий шаблон
        </label>

        {saveAsTemplate && (
          <input
            type="text"
            placeholder="Назва шаблону"
            value={templateNameInput}
            onChange={(e) => setTemplateNameInput(e.target.value)}
            style={inputStyle}
          />
        )}

        <button
          onClick={handleFinalSave}
          style={{ width: '100%', padding: '14px', backgroundColor: '#007aff', color: '#ffffff', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '15px', cursor: 'pointer' }}
        >
          Зберегти зміни
        </button>
      </div>
    </div>
  );
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  backgroundColor: '#ffffff',
  border: '1px solid #e5e5ea',
  borderRadius: '8px',
  fontSize: '13px',
  outline: 'none',
  boxSizing: 'border-box'
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

const actionIconBtnStyle: React.CSSProperties = {
  backgroundColor: '#e5e5ea',
  border: 'none',
  borderRadius: '6px',
  padding: '4px 6px',
  fontSize: '11px',
  fontWeight: 700,
  cursor: 'pointer'
};

export default ProjectDetail;
