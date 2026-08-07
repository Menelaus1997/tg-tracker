import React, { useState } from 'react';
import { Project, Stage, SubStage, TeamMember } from '../App';

interface ProjectDetailProps {
  project: Project;
  onUpdateProject: (project: Project) => void;
  onSaveAsTemplate: () => void;
  onBack: () => void;
  availableRoles?: string[];
}

const DEFAULT_COLORS = [
  '#34c759', '#00c7be', '#5856d6', '#007aff',
  '#ff3b30', '#5c3d2e', '#ff9500', '#af52de'
];

export const ProjectDetail: React.FC<ProjectDetailProps> = ({
  project,
  onUpdateProject,
  onSaveAsTemplate,
  onBack
}) => {
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

  const [stages, setStages] = useState<Stage[]>(project.stages || []);
  const [newStageTitle, setNewStageTitle] = useState('');
  const [newSubStageTitle, setNewSubStageTitle] = useState<{ [key: string]: string }>({});

  // Зміна кольору через піпетку (+) для САМЕ вибраної позиції
  const handleCustomColorPicker = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    const updatedColors = [...colors];
    updatedColors[selectedColorIndex] = newColor;
    setColors(updatedColors);
    onUpdateProject({ ...project, color: newColor, stages });
  };

  const handleSelectColor = (index: number) => {
    setSelectedColorIndex(index);
    onUpdateProject({ ...project, color: colors[index], stages });
  };

  const handleSaveBasicInfo = () => {
    onUpdateProject({
      ...project,
      id: projectId.trim(),
      name: name.trim(),
      color: colors[selectedColorIndex],
      stages
    });
  };

  // Керування стадіями та підстадіями
  const handleAddStage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStageTitle.trim()) return;

    const newStage: Stage = {
      id: Date.now().toString(),
      title: newStageTitle.trim(),
      subStages: [],
      loggedSeconds: 0,
      isTimerRunning: false
    };

    const updated = [...stages, newStage];
    setStages(updated);
    onUpdateProject({ ...project, stages: updated });
    setNewStageTitle('');
  };

  const handleDeleteStage = (stageId: string) => {
    const updated = stages.filter(s => s.id !== stageId);
    setStages(updated);
    onUpdateProject({ ...project, stages: updated });
  };

  const handleAddSubStage = (stageId: string) => {
    const title = newSubStageTitle[stageId];
    if (!title || !title.trim()) return;

    const updated = stages.map(s => {
      if (s.id === stageId) {
        const newSub: SubStage = {
          id: Date.now().toString(),
          title: title.trim(),
          completed: false
        };
        return { ...s, subStages: [...s.subStages, newSub] };
      }
      return s;
    });

    setStages(updated);
    onUpdateProject({ ...project, stages: updated });
    setNewSubStageTitle({ ...newSubStageTitle, [stageId]: '' });
  };

  const handleToggleSubStage = (stageId: string, subStageId: string) => {
    const updated = stages.map(s => {
      if (s.id === stageId) {
        const subStages = s.subStages.map(sub => {
          if (sub.id === subStageId) {
            return { ...sub, completed: !sub.completed };
          }
          return sub;
        });
        return { ...s, subStages };
      }
      return s;
    });

    setStages(updated);
    onUpdateProject({ ...project, stages: updated });
  };

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto', color: '#1c1c1e' }}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', fontSize: '14px', color: '#007aff', cursor: 'pointer', marginBottom: '16px', fontWeight: 600 }}>
        ← Назад до проектів
      </button>

      {/* Редагування назви та ID */}
      <div style={{ backgroundColor: '#f2f2f7', padding: '16px', borderRadius: '12px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div>
          <label style={labelStyle}>Найменування проекта</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleSaveBasicInfo}
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>ID проекту</label>
          <input
            type="text"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            onBlur={handleSaveBasicInfo}
            style={inputStyle}
          />
        </div>

        {/* Палітра: 8 колів + 9-й плюс. Змінюється колір ТОГО КІЛА, де галочка! */}
        <div>
          <label style={labelStyle}>Колір маркування</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
            {colors.map((c, idx) => {
              const isSelected = selectedColorIndex === idx;
              return (
                <div
                  key={idx}
                  onClick={() => handleSelectColor(idx)}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: c,
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

            {/* Плюс відкриває піпетку і змінює вибране коло (де галочка) */}
            <label
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: '#e5e5ea',
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

        <button
          onClick={onSaveAsTemplate}
          style={{ width: '100%', padding: '10px', backgroundColor: '#34c759', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', marginTop: '4px' }}
        >
          Зберегти як новий шаблон
        </button>
      </div>

      {/* Розділ стадій та задач */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>Стадії та задачі проекту</h3>

        <form onSubmit={handleAddStage} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <input
            type="text"
            placeholder="Нова стадія (напр. Ескізний проект)"
            value={newStageTitle}
            onChange={(e) => setNewStageTitle(e.target.value)}
            style={{ ...inputStyle, flex: 1 }}
          />
          <button type="submit" style={{ padding: '8px 12px', backgroundColor: '#007aff', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
            + Стадія
          </button>
        </form>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {stages.map((st) => (
            <div key={st.id} style={{ backgroundColor: '#f2f2f7', padding: '12px', borderRadius: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontWeight: 700, fontSize: '15px' }}>{st.title}</span>
                <button onClick={() => handleDeleteStage(st.id)} style={{ background: 'none', border: 'none', color: '#ff3b30', cursor: 'pointer' }}>✕</button>
              </div>

              {/* Список підстадій */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '8px' }}>
                {st.subStages.map((sub) => (
                  <label key={sub.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', textDecoration: sub.completed ? 'line-through' : 'none', color: sub.completed ? '#8e8e93' : '#1c1c1e' }}>
                    <input
                      type="checkbox"
                      checked={sub.completed}
                      onChange={() => handleToggleSubStage(st.id, sub.id)}
                    />
                    {sub.title}
                  </label>
                ))}
              </div>

              {/* Додавання підстадії */}
              <div style={{ display: 'flex', gap: '6px' }}>
                <input
                  type="text"
                  placeholder="Додати підстадію / задачу"
                  value={newSubStageTitle[st.id] || ''}
                  onChange={(e) => setNewSubStageTitle({ ...newSubStageTitle, [st.id]: e.target.value })}
                  style={{ ...inputStyle, padding: '6px 8px', fontSize: '12px' }}
                />
                <button
                  type="button"
                  onClick={() => handleAddSubStage(st.id)}
                  style={{ padding: '6px 10px', backgroundColor: '#e5e5ea', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  backgroundColor: '#ffffff',
  border: '1px solid #e5e5ea',
  borderRadius: '8px',
  fontSize: '14px',
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

export default ProjectDetail;
