import React, { useState, useRef } from 'react';
import { Project, CustomField, Stage } from '../App';

interface ProjectDetailProps {
  project: Project;
  onUpdateProject: (updatedProject: Project) => void;
  onSaveAsTemplate: (templateName: string, stages: Stage[], customFields: CustomField[]) => void;
  onBack: () => void;
}

const DEFAULT_COLORS = [
  '#00a84f', '#009688', '#7c4dff', 
  '#2196f3', '#e53935', '#3e2723', 
  '#d84315', '#8e24aa', '#3f51b5'
];

export const ProjectDetail: React.FC<ProjectDetailProps> = ({
  project,
  onUpdateProject,
  onSaveAsTemplate,
  onBack
}) => {
  const [isEditingMain, setIsEditingMain] = useState(false);
  const [name, setName] = useState(project.name);
  const [projectId, setProjectId] = useState(project.id);
  const [colors, setColors] = useState<string[]>(DEFAULT_COLORS);
  const [selectedColor, setSelectedColor] = useState(project.color);
  const colorInputRef = useRef<HTMLInputElement>(null);

  const [generalInfoList, setGeneralInfoList] = useState<string[]>(project.generalInfoList || []);
  const [newGeneralInput, setNewGeneralInput] = useState('');

  const [customFields, setCustomFields] = useState<CustomField[]>(project.customFields || []);
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldUnit, setNewFieldUnit] = useState('');

  const [stages, setStages] = useState<Stage[]>(project.stages || []);
  const [newStageTitle, setNewStageTitle] = useState('');
  const [newSubStageTitles, setNewSubStageTitles] = useState<{ [stageId: string]: string }>({});

  const [allStagesCollapsed, setAllStagesCollapsed] = useState<boolean>(false);
  const [collapsedStages, setCollapsedStages] = useState<{ [stageId: string]: boolean }>({});

  const [editingStageId, setEditingStageId] = useState<string | null>(null);
  const [editingStageTitle, setEditingStageTitle] = useState('');

  const [editingSubStageId, setEditingSubStageId] = useState<string | null>(null);
  const [editingSubStageTitle, setEditingSubStageTitle] = useState('');

  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveAsTemplateChecked, setSaveAsTemplateChecked] = useState(false);
  const [templateName, setTemplateName] = useState('');

  const [editingTimeStageId, setEditingTimeStageId] = useState<string | null>(null);
  const [manualHoursInput, setManualHoursInput] = useState<string>('');

  const isArchived = project.status === 'archived';

  const toggleAllStages = () => {
    const nextState = !allStagesCollapsed;
    setAllStagesCollapsed(nextState);
    const updated: { [key: string]: boolean } = {};
    stages.forEach((st) => {
      updated[st.id] = nextState;
    });
    setCollapsedStages(updated);
  };

  const toggleStageCollapse = (stageId: string) => {
    setCollapsedStages((prev) => ({ ...prev, [stageId]: !prev[stageId] }));
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCol = e.target.value;
    if (newCol) {
      setColors((prev) => [...prev.slice(0, 8), newCol]);
      setSelectedColor(newCol);
    }
  };

  const handleSaveMainInfo = () => {
    setIsEditingMain(false);
    onUpdateProject({
      ...project,
      name,
      id: projectId,
      color: selectedColor,
      generalInfoList,
      customFields,
      stages
    });
  };

  const handleAddGeneralInfo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGeneralInput.trim() || isArchived) return;
    setGeneralInfoList([...generalInfoList, newGeneralInput.trim()]);
    setNewGeneralInput('');
  };

  const handleRemoveGeneralInfo = (index: number) => {
    if (isArchived) return;
    setGeneralInfoList(generalInfoList.filter((_, i) => i !== index));
  };

  const handleAddCustomField = (e: React.FormEvent) => {
    e.preventDefault();
    if (isArchived || (!newFieldName.trim() && !newFieldUnit.trim())) return;

    setCustomFields([
      ...customFields,
      { id: Date.now().toString(), name: newFieldName.trim(), unit: newFieldUnit.trim() }
    ]);
    setNewFieldName('');
    setNewFieldUnit('');
  };

  const handleRemoveField = (id: string) => {
    if (isArchived) return;
    setCustomFields(customFields.filter((f) => f.id !== id));
  };

  const moveSubStage = (stageId: string, index: number, direction: 'up' | 'down') => {
    if (isArchived) return;
    setStages(stages.map((st) => {
      if (st.id === stageId) {
        const updatedSubs = [...st.subStages];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= updatedSubs.length) return st;

        const temp = updatedSubs[index];
        updatedSubs[index] = updatedSubs[targetIndex];
        updatedSubs[targetIndex] = temp;
        return { ...st, subStages: updatedSubs };
      }
      return st;
    }));
  };

  const handleAddStage = (e: React.FormEvent) => {
    e.preventDefault();
    if (isArchived || !newStageTitle.trim()) return;
    setStages([...stages, { id: Date.now().toString(), title: newStageTitle.trim(), subStages: [], loggedSeconds: 0 }]);
    setNewStageTitle('');
  };

  const handleSaveEditedStage = (stageId: string) => {
    setStages(stages.map(st => st.id === stageId ? { ...st, title: editingStageTitle } : st));
    setEditingStageId(null);
  };

  const handleDeleteStage = (stageId: string) => {
    if (isArchived) return;
    setStages(stages.filter(st => st.id !== stageId));
  };

  const handleAddSubStage = (stageId: string) => {
    if (isArchived) return;
    const title = newSubStageTitles[stageId];
    if (!title || !title.trim()) return;

    // Автоматично вибираємо лише чистий текст (без вручну введених номерів)
    const cleanTitle = title.trim().replace(/^\d+[\.\)]\s*/, '');

    setStages(stages.map((st) => {
      if (st.id === stageId) {
        return {
          ...st,
          subStages: [...st.subStages, { id: Date.now().toString(), title: cleanTitle, completed: false }]
        };
      }
      return st;
    }));

    setNewSubStageTitles({ ...newSubStageTitles, [stageId]: '' });
  };

  const handleSaveEditedSubStage = (stageId: string, subStageId: string) => {
    const cleanTitle = editingSubStageTitle.trim().replace(/^\d+[\.\)]\s*/, '');
    setStages(stages.map((st) => {
      if (st.id === stageId) {
        return {
          ...st,
          subStages: st.subStages.map(sub => sub.id === subStageId ? { ...sub, title: cleanTitle } : sub)
        };
      }
      return st;
    }));
    setEditingSubStageId(null);
  };

  const handleDeleteSubStage = (stageId: string, subStageId: string) => {
    if (isArchived) return;
    setStages(stages.map((st) => {
      if (st.id === stageId) {
        return { ...st, subStages: st.subStages.filter(sub => sub.id !== subStageId) };
      }
      return st;
    }));
  };

  const handleToggleSubStage = (stageId: string, subStageId: string) => {
    if (isArchived) return;
    setStages(stages.map((st) => {
      if (st.id === stageId) {
        return {
          ...st,
          subStages: st.subStages.map((sub) => sub.id === subStageId ? { ...sub, completed: !sub.completed } : sub)
        };
      }
      return st;
    }));
  };

  // Таймер та дедлайни для Стадій 2, 3, 4, 5, 6
  const isTimeAndDeadlineAllowed = (index: number) => {
    return index >= 1 && index <= 5; // Стадії #2, #3, #4, #5, #6 (індекси 1..5)
  };

  const toggleTimer = (stageId: string) => {
    setStages(stages.map(st => {
      if (st.id === stageId) {
        return { ...st, isTimerRunning: !st.isTimerRunning };
      }
      return st;
    }));
  };

  const handleSaveManualTime = (stageId: string) => {
    const hours = parseFloat(manualHoursInput);
    if (!isNaN(hours) && hours >= 0) {
      const seconds = Math.round(hours * 3600);
      setStages(stages.map(st => st.id === stageId ? { ...st, loggedSeconds: seconds } : st));
    }
    setEditingTimeStageId(null);
  };

  const handleDateChange = (stageId: string, field: 'startDate' | 'endDate', value: string) => {
    setStages(stages.map(st => st.id === stageId ? { ...st, [field]: value } : st));
  };

  const formatSecondsToHM = (totalSec: number = 0) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    return `${hrs}г ${mins}хв`;
  };

  const handleFinalSave = () => {
    onUpdateProject({
      ...project,
      name,
      id: projectId,
      color: selectedColor,
      generalInfoList,
      customFields,
      stages
    });

    if (saveAsTemplateChecked && templateName.trim()) {
      onSaveAsTemplate(templateName.trim(), stages, customFields);
    }

    setShowSaveModal(false);
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#ffffff', color: '#1c1c1e', maxWidth: '500px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>←</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: selectedColor, flexShrink: 0 }} />
            <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>{name}</h2>
            <span style={{ fontSize: '13px', color: '#8e8e93' }}>({projectId})</span>
          </div>
        </div>

        {!isArchived && (
          <button onClick={() => setIsEditingMain(!isEditingMain)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}>✏️</button>
        )}
      </div>

      {isEditingMain && (
        <div style={{ padding: '14px', backgroundColor: '#f2f2f7', borderRadius: '12px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <label style={labelStyle}>Назва проекту</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>ID проекту</label>
            <input type="text" value={projectId} onChange={(e) => setProjectId(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Колір проекту</label>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'nowrap', alignItems: 'center', marginTop: '4px' }}>
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedColor(c)}
                  style={{
                    width: '26px', height: '26px', borderRadius: '50%', backgroundColor: c, border: 'none',
                    cursor: 'pointer', boxShadow: selectedColor === c ? '0 0 0 2px #ffffff, 0 0 0 4px #007aff' : 'none', flexShrink: 0
                  }}
                />
              ))}
              <button
                type="button"
                onClick={() => colorInputRef.current?.click()}
                style={{
                  width: '26px', height: '26px', borderRadius: '50%', backgroundColor: '#e5e5ea', border: 'none',
                  color: '#636366', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}
              >
                +
              </button>
              <input ref={colorInputRef} type="color" onChange={handleCustomColorChange} style={{ display: 'none' }} />
            </div>
          </div>
          <button onClick={handleSaveMainInfo} style={{ ...greenBtnStyle, marginTop: '6px' }}>Застосувати</button>
        </div>
      )}

      {/* РОЗДІЛ 1: Параметри об'єкта */}
      <div style={{ marginBottom: '28px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>Параметри об'єкта</h3>

        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Загальні дані (Адреса / Посилання)</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '8px' }}>
            {generalInfoList.map((info, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', backgroundColor: '#f9f9f9', borderRadius: '8px', fontSize: '14px' }}>
                <span>{info}</span>
                {!isArchived && (
                  <button onClick={() => handleRemoveGeneralInfo(idx)} style={{ background: 'none', border: 'none', color: '#ff3b30', cursor: 'pointer' }}>✕</button>
                )}
              </div>
            ))}
          </div>

          {!isArchived && (
            <form onSubmit={handleAddGeneralInfo} style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="м.Київ вул.Героїв крут / Посилання"
                value={newGeneralInput}
                onChange={(e) => setNewGeneralInput(e.target.value)}
                style={{ ...inputStyle, flex: 1 }}
              />
              <button type="submit" style={greenBtnStyle}>Додати</button>
            </form>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
          {customFields.map((field) => (
            <div key={field.id} style={{ display: 'flex', gap: '8px', alignItems: 'center', backgroundColor: '#f9f9f9', padding: '8px 10px', borderRadius: '8px' }}>
              <div style={{ flex: 2, fontWeight: 500, fontSize: '14px' }}>{field.name || '—'}</div>
              <div style={{ flex: 1, color: '#636366', fontSize: '13px' }}>{field.unit || '—'}</div>
              {!isArchived && (
                <button onClick={() => handleRemoveField(field.id)} style={{ background: 'none', border: 'none', color: '#ff3b30', cursor: 'pointer' }}>✕</button>
              )}
            </div>
          ))}
        </div>

        {!isArchived && (
          <form onSubmit={handleAddCustomField} style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text" placeholder="Назва (напр. Площа)"
              value={newFieldName} onChange={(e) => setNewFieldName(e.target.value)}
              style={{ ...inputStyle, flex: 2 }}
            />
            <input
              type="text" placeholder="Од. вим. (напр. м²)"
              value={newFieldUnit} onChange={(e) => setNewFieldUnit(e.target.value)}
              style={{ ...inputStyle, flex: 1 }}
            />
            <button type="submit" style={greenBtnStyle}>Додати</button>
          </form>
        )}
      </div>

      {/* РОЗДІЛ 2: Стадії проекту зі спадним меню для всієї секції */}
      <div style={{ marginBottom: '30px' }}>
        <div 
          onClick={toggleAllStages}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '12px' }}
        >
          <span style={{
            display: 'inline-block',
            transition: 'transform 0.2s ease',
            transform: allStagesCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
            fontSize: '12px'
          }}>
            ▼
          </span>
          <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>Стадії проекту</h3>
        </div>

        {!isArchived && (
          <form onSubmit={handleAddStage} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <input
              type="text" placeholder="Нова стадія (напр. Стадія 7)"
              value={newStageTitle} onChange={(e) => setNewStageTitle(e.target.value)}
              style={{ ...inputStyle, flex: 1 }}
            />
            <button type="submit" style={greenBtnStyle}>Додати</button>
          </form>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {stages.map((st, index) => {
            const isCollapsed = collapsedStages[st.id];
            const allowTimeAndDeadline = isTimeAndDeadlineAllowed(index);

            return (
              <div key={st.id} style={{ padding: '14px', borderRadius: '10px', backgroundColor: '#f2f2f7' }}>
                
                {/* Шапка стадії */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isCollapsed ? '0px' : '10px' }}>
                  {editingStageId === st.id ? (
                    <div style={{ display: 'flex', gap: '6px', flex: 1 }}>
                      <input type="text" value={editingStageTitle} onChange={(e) => setEditingStageTitle(e.target.value)} style={{ ...inputStyle, padding: '4px 8px' }} />
                      <button onClick={() => handleSaveEditedStage(st.id)} style={{ ...greenBtnStyle, padding: '4px 8px', fontSize: '12px' }}>✓</button>
                    </div>
                  ) : (
                    <div 
                      onClick={() => toggleStageCollapse(st.id)}
                      style={{ fontWeight: 600, fontSize: '15px', color: '#1c1c1e', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}
                    >
                      <span style={{ 
                        display: 'inline-block', 
                        transition: 'transform 0.2s ease', 
                        transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
                        fontSize: '12px'
                      }}>
                        ▼
                      </span>
                      <span>{st.title}</span>
                    </div>
                  )}

                  {!isArchived && editingStageId !== st.id && (
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => { setEditingStageId(st.id); setEditingStageTitle(st.title); }} style={iconStyle}>✏️</button>
                      <button onClick={() => handleDeleteStage(st.id)} style={iconStyle}>🗑️</button>
                    </div>
                  )}
                </div>

                {!isCollapsed && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginLeft: '4px', marginTop: '6px' }}>
                    
                    {/* Список підстадій з АВТОМАТИЧНОЮ нумерацією */}
                    {st.subStages.map((sub, subIdx) => (
                      <div key={sub.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '4px' }}>
                        
                        {!isArchived && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
                            <button
                              disabled={subIdx === 0}
                              onClick={() => moveSubStage(st.id, subIdx, 'up')}
                              style={{ ...arrowBtnStyle, opacity: subIdx === 0 ? 0.2 : 1 }}
                            >
                              ▲
                            </button>
                            <button
                              disabled={subIdx === st.subStages.length - 1}
                              onClick={() => moveSubStage(st.id, subIdx, 'down')}
                              style={{ ...arrowBtnStyle, opacity: subIdx === st.subStages.length - 1 ? 0.2 : 1 }}
                            >
                              ▼
                            </button>
                          </div>
                        )}

                        {editingSubStageId === sub.id ? (
                          <div style={{ display: 'flex', gap: '6px', flex: 1 }}>
                            <input type="text" value={editingSubStageTitle} onChange={(e) => setEditingSubStageTitle(e.target.value)} style={{ ...inputStyle, padding: '4px 8px', fontSize: '13px' }} />
                            <button onClick={() => handleSaveEditedSubStage(st.id, sub.id)} style={{ ...greenBtnStyle, padding: '4px 8px', fontSize: '12px' }}>✓</button>
                          </div>
                        ) : (
                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: isArchived ? 'default' : 'pointer', flex: 1 }}>
                            <input type="checkbox" checked={sub.completed} disabled={isArchived} onChange={() => handleToggleSubStage(st.id, sub.id)} />
                            <span style={{ textDecoration: sub.completed ? 'line-through' : 'none', color: sub.completed ? '#8e8e93' : '#1c1c1e' }}>
                              {/* АВТОМАЧНА НУМЕРАЦІЯ: subIdx + 1 */}
                              {subIdx + 1}. {sub.title}
                            </span>
                          </label>
                        )}

                        {!isArchived && editingSubStageId !== sub.id && (
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button onClick={() => { setEditingSubStageId(sub.id); setEditingSubStageTitle(sub.title); }} style={{ ...iconStyle, fontSize: '13px' }}>✏️</button>
                            <button onClick={() => handleDeleteSubStage(st.id, sub.id)} style={{ ...iconStyle, fontSize: '13px' }}>🗑️</button>
                          </div>
                        )}
                      </div>
                    ))}

                    {!isArchived && (
                      <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                        <input
                          type="text" placeholder="+ Підстадія (напр. Обмірний план)"
                          value={newSubStageTitles[st.id] || ''} onChange={(e) => setNewSubStageTitles({ ...newSubStageTitles, [st.id]: e.target.value })}
                          style={{ ...inputStyle, fontSize: '13px', padding: '6px 8px' }}
                        />
                        <button onClick={() => handleAddSubStage(st.id)} style={greenBtnStyle}>+</button>
                      </div>
                    )}

                    {/* Блок Таймера та Дедлайнів (ТІЛЬКИ ДЛЯ СТАДІЙ 2, 3, 4, 5, 6) */}
                    {allowTimeAndDeadline && (
                      <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #e5e5ea', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        
                        {/* ⏱️ Таймер */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#ffffff', padding: '8px 12px', borderRadius: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '14px', fontWeight: 600 }}>⏱️ Час: {formatSecondsToHM(st.loggedSeconds)}</span>
                            
                            {!isArchived && (
                              <button
                                onClick={() => {
                                  setEditingTimeStageId(st.id);
                                  setManualHoursInput(((st.loggedSeconds || 0) / 3600).toFixed(1));
                                }}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px' }}
                                title="Редагувати години"
                              >
                                ✏️
                              </button>
                            )}
                          </div>

                          {!isArchived && (
                            <button
                              onClick={() => toggleTimer(st.id)}
                              style={{
                                padding: '4px 12px',
                                borderRadius: '6px',
                                border: 'none',
                                backgroundColor: st.isTimerRunning ? '#ff3b30' : '#34c759',
                                color: '#ffffff',
                                fontWeight: 600,
                                fontSize: '12px',
                                cursor: 'pointer'
                              }}
                            >
                              {st.isTimerRunning ? '⏸ Пауза' : '▶ Старт'}
                            </button>
                          )}
                        </div>

                        {/* Ручна підгонка часу */}
                        {editingTimeStageId === st.id && (
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <input
                              type="number"
                              step="0.1"
                              placeholder="Години"
                              value={manualHoursInput}
                              onChange={(e) => setManualHoursInput(e.target.value)}
                              style={{ ...inputStyle, padding: '4px 8px', fontSize: '12px', width: '100px' }}
                            />
                            <button onClick={() => handleSaveManualTime(st.id)} style={{ ...greenBtnStyle, padding: '4px 8px', fontSize: '12px' }}>Зберегти</button>
                            <button onClick={() => setEditingTimeStageId(null)} style={{ background: 'none', border: 'none', fontSize: '12px', cursor: 'pointer' }}>✕</button>
                          </div>
                        )}

                        {/* 📅 Дедлайни */}
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <div style={{ flex: 1 }}>
                            <label style={{ fontSize: '11px', color: '#636366', fontWeight: 500 }}>Дата початку</label>
                            <input
                              type="date"
                              disabled={isArchived}
                              value={st.startDate || ''}
                              onChange={(e) => handleDateChange(st.id, 'startDate', e.target.value)}
                              style={{ ...inputStyle, padding: '4px 6px', fontSize: '12px' }}
                            />
                          </div>
                          <div style={{ flex: 1 }}>
                            <label style={{ fontSize: '11px', color: '#ff3b30', fontWeight: 500 }}>Дедлайн (Здача)</label>
                            <input
                              type="date"
                              disabled={isArchived}
                              value={st.endDate || ''}
                              onChange={(e) => handleDateChange(st.id, 'endDate', e.target.value)}
                              style={{ ...inputStyle, padding: '4px 6px', fontSize: '12px' }}
                            />
                          </div>
                        </div>

                      </div>
                    )}

                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {!isArchived && (
        <button
          onClick={() => setShowSaveModal(true)}
          style={{ width: '100%', padding: '14px', backgroundColor: '#007aff', color: '#ffffff', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 600, cursor: 'pointer' }}
        >
          Зберегти зміни
        </button>
      )}

      {showSaveModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h3 style={{ marginTop: 0, fontSize: '18px' }}>Збереження проекту</h3>
            <p style={{ fontSize: '14px', color: '#636366' }}>Основні дані проекту оновлено.</p>

            <div style={{ marginTop: '14px', marginBottom: '14px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer', fontWeight: 500 }}>
                <input type="checkbox" checked={saveAsTemplateChecked} onChange={(e) => setSaveAsTemplateChecked(e.target.checked)} />
                Зберегти цю структуру як новий шаблон?
              </label>

              {saveAsTemplateChecked && (
                <input
                  type="text" placeholder="Введіть назву шаблону"
                  value={templateName} onChange={(e) => setTemplateName(e.target.value)}
                  style={{ ...inputStyle, marginTop: '10px' }}
                />
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
              <button onClick={() => setShowSaveModal(false)} style={{ ...btnStyle, backgroundColor: '#e5e5ea', color: '#1c1c1e' }}>Скасувати</button>
              <button onClick={handleFinalSave} style={{ ...btnStyle, backgroundColor: '#34c759', color: '#fff' }}>Підтвердити</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 12px', backgroundColor: '#ffffff', border: '1px solid #e5e5ea', borderRadius: '8px', fontSize: '14px', color: '#1c1c1e', outline: 'none', boxSizing: 'border-box' };
const labelStyle: React.CSSProperties = { fontSize: '13px', fontWeight: 500, color: '#636366', marginBottom: '4px', display: 'block' };
const greenBtnStyle: React.CSSProperties = { padding: '10px 14px', backgroundColor: '#34c759', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '14px', cursor: 'pointer', whiteSpace: 'nowrap' };
const iconStyle: React.CSSProperties = { background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', padding: '2px' };
const arrowBtnStyle: React.CSSProperties = { background: 'none', border: 'none', cursor: 'pointer', fontSize: '10px', color: '#007aff', padding: '0 2px', lineHeight: 1 };
const btnStyle: React.CSSProperties = { padding: '8px 14px', borderRadius: '8px', border: 'none', fontWeight: 600, fontSize: '14px', cursor: 'pointer' };
const modalOverlayStyle: React.CSSProperties = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 };
const modalContentStyle: React.CSSProperties = { backgroundColor: '#ffffff', padding: '20px', borderRadius: '14px', maxWidth: '360px', width: '90%', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' };
