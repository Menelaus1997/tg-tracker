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

interface PassportRow {
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
  // 1. Основна інформація
  const [isBasicInfoOpen, setIsBasicInfoOpen] = useState(false);
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

  // Паспорт об'єкта
  const [isPassportOpen, setIsPassportOpen] = useState(true);
  const [passportRows, setPassportRows] = useState<PassportRow[]>(() => project.passportRows || [
    { id: '1', type: 'single', value: 'м. Київ, вул. Хрещатик, 1' },
    { id: '2', type: 'double', label: 'Загальна площа', value: '85 кв.м' }
  ]);

  // 2. Стадії та таймінг
  const [stages, setStages] = useState<Stage[]>(project.stages || []);
  const [collapsedStages, setCollapsedStages] = useState<{ [key: string]: boolean }>({});
  const [newStageTitle, setNewStageTitle] = useState('');
  const [newSubStageTitle, setNewSubStageTitle] = useState<{ [key: string]: string }>({});

  // Загальний таймер проєкту
  const [totalSeconds, setTotalSeconds] = useState(project.totalLoggedSeconds || 0);
  const [isGlobalTimerRunning, setIsGlobalTimerRunning] = useState(false);

  // 3. Команда проєкту
  const [projectTeam, setProjectTeam] = useState<{ id: string; memberId: string; role: string }[]>(
    project.projectTeam || []
  );
  const [selectedMemberId, setSelectedMemberId] = useState(teamDatabase[0]?.id || '');
  const [selectedProjectRole, setSelectedProjectRole] = useState(availableRoles[0] || 'Кресляр');

  // 4. Фінальне збереження + Шаблон
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [templateNameInput, setTemplateNameInput] = useState(project.name);

  // Обробники Паспорта Об'єкта
  const handleAddSingleRow = () => {
    setPassportRows([...passportRows, { id: Date.now().toString(), type: 'single', value: '' }]);
  };

  const handleAddDoubleRow = () => {
    setPassportRows([...passportRows, { id: Date.now().toString(), type: 'double', label: '', value: '' }]);
  };

  const handleUpdatePassportRow = (id: string, field: 'label' | 'value', text: string) => {
    setPassportRows(passportRows.map(r => r.id === id ? { ...r, [field]: text } : r));
  };

  const handleDeletePassportRow = (id: string) => {
    setPassportRows(passportRows.filter(r => r.id !== id));
  };

  // Колір через піпетку (+) для виділеного кола
  const handleCustomColorPicker = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    const updated = [...colors];
    updated[selectedColorIndex] = newColor;
    setColors(updated);
  };

  // Керування стадіями
  const handleAddStage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStageTitle.trim()) return;

    const newStage: Stage = {
      id: Date.now().toString(),
      title: newStageTitle.trim(),
      subStages: [],
      trackTime: true,
      startDate: '',
      endDate: ''
    };

    setStages([...stages, newStage]);
    setNewStageTitle('');
  };

  const handleDeleteStage = (id: string) => {
    setStages(stages.filter(s => s.id !== id));
  };

  const handleToggleStageTrackTime = (stageId: string) => {
    setStages(stages.map(s => s.id === stageId ? { ...s, trackTime: s.trackTime === false } : s));
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

  // Команда проекту
  const handleAddProjectMember = () => {
    if (!selectedMemberId) return;
    const newEntry = { id: Date.now().toString(), memberId: selectedMemberId, role: selectedProjectRole };
    setProjectTeam([...projectTeam, newEntry]);
  };

  const handleRemoveProjectMember = (id: string) => {
    setProjectTeam(projectTeam.filter(m => m.id !== id));
  };

  // Фінальне збереження проекту
  const handleFinalSave = () => {
    const updatedProject: Project = {
      ...project,
      id: projectId.trim(),
      name: name.trim(),
      color: colors[selectedColorIndex],
      passportRows,
      stages,
      totalLoggedSeconds: totalSeconds,
      projectTeam
    };

    onUpdateProject(updatedProject);

    if (saveAsTemplate && templateNameInput.trim()) {
      onSaveAsTemplate(updatedProject, templateNameInput.trim());
    }

    alert('Зміни успішно збережено!');
    onBack();
  };

  const formatTime = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    return `${h}г ${m}хв`;
  };

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto', color: '#1c1c1e' }}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', fontSize: '14px', color: '#007aff', cursor: 'pointer', marginBottom: '16px', fontWeight: 600 }}>
        ← Назад до проектів
      </button>

      {/* 1. Стек: Основна інформація (згортається за замовчуванням) */}
      <div style={{ backgroundColor: '#f2f2f7', padding: '14px', borderRadius: '12px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>Основна інформація</h3>
          <button onClick={() => setIsBasicInfoOpen(!isBasicInfoOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>
            ✏️
          </button>
        </div>

        {isBasicInfoOpen && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
            <div>
              <label style={labelStyle}>Найменування проекта</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>ID проекту</label>
              <input type="text" value={projectId} onChange={(e) => setProjectId(e.target.value)} style={inputStyle} />
            </div>

            {/* Палітра з контуром навколо кіл */}
            <div>
              <label style={labelStyle}>Колір маркування</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                {colors.map((c, idx) => {
                  const isSelected = selectedColorIndex === idx;
                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedColorIndex(idx)}
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
                  title="Змінити колір вибраної позиції"
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

      {/* Блок «Паспорт об'єкта» */}
      <div style={{ backgroundColor: '#f2f2f7', padding: '14px', borderRadius: '12px', marginBottom: '16px' }}>
        <div 
          onClick={() => setIsPassportOpen(!isPassportOpen)}
          style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>Паспорт об'єкта</h3>
          <span style={{ fontSize: '12px', color: '#8e8e93' }}>{isPassportOpen ? '▲' : '▼'}</span>
        </div>

        {isPassportOpen && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
            {passportRows.map((r) => (
              <div key={r.id} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                {r.type === 'single' ? (
                  <input
                    type="text"
                    placeholder="Локація / Адреса об'єкта"
                    value={r.value}
                    onChange={(e) => handleUpdatePassportRow(r.id, 'value', e.target.value)}
                    style={{ ...inputStyle, flex: 1 }}
                  />
                ) : (
                  <>
                    <input
                      type="text"
                      placeholder="Параметр (напр. Площа)"
                      value={r.label || ''}
                      onChange={(e) => handleUpdatePassportRow(r.id, 'label', e.target.value)}
                      style={{ ...inputStyle, flex: 1 }}
                    />
                    <input
                      type="text"
                      placeholder="Значення (напр. 85 м²)"
                      value={r.value}
                      onChange={(e) => handleUpdatePassportRow(r.id, 'value', e.target.value)}
                      style={{ ...inputStyle, flex: 1 }}
                    />
                  </>
                )}
                <button onClick={() => handleDeletePassportRow(r.id)} style={{ background: 'none', border: 'none', color: '#ff3b30', cursor: 'pointer' }}>✕</button>
              </div>
            ))}

            <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
              <button onClick={handleAddSingleRow} style={{ ...btnStyle, backgroundColor: '#e5e5ea', fontSize: '12px', flex: 1 }}>
                + Рядок (Локація)
              </button>
              <button onClick={handleAddDoubleRow} style={{ ...btnStyle, backgroundColor: '#e5e5ea', fontSize: '12px', flex: 1 }}>
                + Рядок (Характеристика)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. Стек: Таймер, Стадії та Задачі */}
      <div style={{ backgroundColor: '#f2f2f7', padding: '14px', borderRadius: '12px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>Стадії та задачі</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#007aff' }}>{formatTime(totalSeconds)}</span>
            <button
              onClick={() => setIsGlobalTimerRunning(!isGlobalTimerRunning)}
              style={{ ...btnStyle, backgroundColor: isGlobalTimerRunning ? '#ff3b30' : '#34c759', color: '#fff', fontSize: '11px', padding: '4px 8px' }}
            >
              {isGlobalTimerRunning ? 'Пауза' : 'Старт'}
            </button>
          </div>
        </div>

        <form onSubmit={handleAddStage} style={{ display: 'flex', gap: '6px', marginBottom: '14px' }}>
          <input
            type="text"
            placeholder="Нова стадія (напр. Планувальні рішення)"
            value={newStageTitle}
            onChange={(e) => setNewStageTitle(e.target.value)}
            style={{ ...inputStyle, flex: 1 }}
          />
          <button type="submit" style={{ ...btnStyle, backgroundColor: '#007aff', color: '#fff' }}>+ Стадія</button>
        </form>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {stages.map((st) => {
            const isCollapsed = collapsedStages[st.id];
            return (
              <div key={st.id} style={{ backgroundColor: '#ffffff', padding: '12px', borderRadius: '10px', border: '1px solid #e5e5ea' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span 
                      onClick={() => setCollapsedStages({ ...collapsedStages, [st.id]: !isCollapsed })}
                      style={{ cursor: 'pointer', fontSize: '12px', color: '#8e8e93' }}
                    >
                      {isCollapsed ? '▼' : '▲'}
                    </span>
                    <span style={{ fontWeight: 700, fontSize: '14px' }}>{st.title}</span>
                  </div>

                  <button onClick={() => handleDeleteStage(st.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}>
                    🗑️
                  </button>
                </div>

                {!isCollapsed && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #f2f2f7' }}>
                    {/* Перемикач часу та дедлайни */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                      <span>Рахувати час для стадії</span>
                      <div
                        onClick={() => handleToggleStageTrackTime(st.id)}
                        style={{
                          width: '34px',
                          height: '20px',
                          borderRadius: '10px',
                          backgroundColor: st.trackTime !== false ? '#34c759' : '#e5e5ea',
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
                            left: st.trackTime !== false ? '16px' : '2px',
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

                    {/* Нумерація підстадій 1., 2., 3. + Керування ↑ ↓ 🗑️ */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
                      {st.subStages.map((sub, idx) => (
                        <div key={sub.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', textDecoration: sub.completed ? 'line-through' : 'none', color: sub.completed ? '#8e8e93' : '#1c1c1e' }}>
                            <input
                              type="checkbox"
                              checked={sub.completed}
                              onChange={() => handleToggleSubStage(st.id, sub.id)}
                            />
                            <span>{idx + 1}. {sub.title}</span>
                          </label>

                          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                            <button onClick={() => handleMoveSubStage(st.id, idx, 'up')} style={iconBtnStyle}>↑</button>
                            <button onClick={() => handleMoveSubStage(st.id, idx, 'down')} style={iconBtnStyle}>↓</button>
                            <button onClick={() => handleDeleteSubStage(st.id, sub.id)} style={{ ...iconBtnStyle, color: '#ff3b30' }}>🗑️</button>
                          </div>
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
      </div>

      {/* 3. Стек: Команда проекту */}
      <div style={{ backgroundColor: '#f2f2f7', padding: '14px', borderRadius: '12px', marginBottom: '20px' }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '15px', fontWeight: 700 }}>Команда проекту</h3>

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

          <button onClick={handleAddProjectMember} style={{ ...btnStyle, backgroundColor: '#007aff', color: '#fff', fontSize: '12px' }}>
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
      </div>

      {/* 4. Стек: Фінальне збереження + Шаблон */}
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

export default ProjectDetail;
