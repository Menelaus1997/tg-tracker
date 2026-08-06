import React, { useState } from 'react';
import { Project, CustomField, Stage } from '../App';

interface ProjectDetailProps {
  project: Project;
  onUpdateProject: (updatedProject: Project) => void;
  onBack: () => void;
}

export const ProjectDetail: React.FC<ProjectDetailProps> = ({
  project,
  onUpdateProject,
  onBack
}) => {
  const [customFields, setCustomFields] = useState<CustomField[]>(
    project.customFields.length > 0 ? project.customFields : [{ id: '1', name: '', unit: '' }]
  );
  const [stages, setStages] = useState<Stage[]>(project.stages || []);
  const [newStageTitle, setNewStageTitle] = useState('');
  const [newSubStageTitles, setNewSubStageTitles] = useState<{ [stageId: string]: string }>({});

  const isArchived = project.status === 'archived';

  // --- Управління кастомними полями ---
  const handleAddField = () => {
    if (isArchived) return;
    const newField: CustomField = {
      id: Date.now().toString(),
      name: '',
      unit: ''
    };
    const updated = [...customFields, newField];
    setCustomFields(updated);
    saveChanges(updated, stages);
  };

  const handleFieldChange = (id: string, key: 'name' | 'unit', value: string) => {
    if (isArchived) return;
    const updated = customFields.map((f) => (f.id === id ? { ...f, [key]: value } : f));
    setCustomFields(updated);
    saveChanges(updated, stages);
  };

  const handleRemoveField = (id: string) => {
    if (isArchived) return;
    const updated = customFields.filter((f) => f.id !== id);
    setCustomFields(updated);
    saveChanges(updated, stages);
  };

  // --- Управління стадіями ---
  const handleAddStage = (e: React.FormEvent) => {
    e.preventDefault();
    if (isArchived || !newStageTitle.trim()) return;

    const newStage: Stage = {
      id: Date.now().toString(),
      title: newStageTitle.trim(),
      subStages: []
    };
    const updated = [...stages, newStage];
    setStages(updated);
    setNewStageTitle('');
    saveChanges(customFields, updated);
  };

  const handleAddSubStage = (stageId: string) => {
    if (isArchived) return;
    const title = newSubStageTitles[stageId];
    if (!title || !title.trim()) return;

    const updated = stages.map((st) => {
      if (st.id === stageId) {
        return {
          ...st,
          subStages: [
            ...st.subStages,
            { id: Date.now().toString(), title: title.trim(), completed: false }
          ]
        };
      }
      return st;
    });

    setStages(updated);
    setNewSubStageTitles({ ...newSubStageTitles, [stageId]: '' });
    saveChanges(customFields, updated);
  };

  const handleToggleSubStage = (stageId: string, subStageId: string) => {
    if (isArchived) return;
    const updated = stages.map((st) => {
      if (st.id === stageId) {
        return {
          ...st,
          subStages: st.subStages.map((sub) =>
            sub.id === subStageId ? { ...sub, completed: !sub.completed } : sub
          )
        };
      }
      return st;
    });
    setStages(updated);
    saveChanges(customFields, updated);
  };

  const saveChanges = (updatedFields: CustomField[], updatedStages: Stage[]) => {
    onUpdateProject({
      ...project,
      customFields: updatedFields,
      stages: updatedStages
    });
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#ffffff', color: '#1c1c1e', maxWidth: '500px', margin: '0 auto' }}>
      {/* Кнопка "Назад" та Заголовок */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <button
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '4px'
          }}
        >
          ←
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: project.color }} />
          <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>{project.name}</h2>
          <span style={{ fontSize: '13px', color: '#8e8e93' }}>({project.id})</span>
        </div>
      </div>

      {isArchived && (
        <div style={{ padding: '10px 14px', backgroundColor: '#f2f2f7', borderRadius: '8px', color: '#8e8e93', fontSize: '13px', marginBottom: '20px' }}>
          🔒 Проект в архіві. Дані зафіксовані (тільки перегляд).
        </div>
      )}

      {/* РОЗДІЛ 1: Власні параметри проекту */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>Параметри об'єкта</h3>
          {!isArchived && (
            <button
              onClick={handleAddField}
              style={{
                backgroundColor: '#007aff',
                color: '#fff',
                border: 'none',
                borderRadius: '50%',
                width: '28px',
                height: '28px',
                fontSize: '18px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              +
            </button>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {customFields.map((field) => (
            <div key={field.id} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Назва (напр. Площа)"
                value={field.name}
                disabled={isArchived}
                onChange={(e) => handleFieldChange(field.id, 'name', e.target.value)}
                style={{ ...inputStyle, flex: 2 }}
              />
              <input
                type="text"
                placeholder="Од. вим. (напр. м²)"
                value={field.unit}
                disabled={isArchived}
                onChange={(e) => handleFieldChange(field.id, 'unit', e.target.value)}
                style={{ ...inputStyle, flex: 1 }}
              />
              {!isArchived && customFields.length > 1 && (
                <button
                  onClick={() => handleRemoveField(field.id)}
                  style={{ background: 'none', border: 'none', color: '#ff3b30', fontSize: '16px', cursor: 'pointer' }}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* РОЗДІЛ 2: Стадії та Підстадії */}
      <div>
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>Стадії проекту</h3>

        {/* Створення основної стадії */}
        {!isArchived && (
          <form onSubmit={handleAddStage} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <input
              type="text"
              placeholder="Нова стадія (напр. 1. Концепція)"
              value={newStageTitle}
              onChange={(e) => setNewStageTitle(e.target.value)}
              style={{ ...inputStyle, flex: 1 }}
            />
            <button
              type="submit"
              style={{
                padding: '10px 14px',
                backgroundColor: '#34c759',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Додати
            </button>
          </form>
        )}

        {/* Список стадій */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {stages.map((st) => (
            <div key={st.id} style={{ padding: '14px', borderRadius: '10px', backgroundColor: '#f2f2f7' }}>
              <div style={{ fontWeight: 600, fontSize: '15px', color: '#1c1c1e', marginBottom: '10px' }}>
                {st.title}
              </div>

              {/* Підстадії */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginLeft: '8px' }}>
                {st.subStages.map((sub) => (
                  <label key={sub.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: isArchived ? 'default' : 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={sub.completed}
                      disabled={isArchived}
                      onChange={() => handleToggleSubStage(st.id, sub.id)}
                    />
                    <span style={{ textDecoration: sub.completed ? 'line-through' : 'none', color: sub.completed ? '#8e8e93' : '#1c1c1e' }}>
                      {sub.title}
                    </span>
                  </label>
                ))}

                {/* Додавання підстадії */}
                {!isArchived && (
                  <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                    <input
                      type="text"
                      placeholder="+ Підстадія (напр. Обміри)"
                      value={newSubStageTitles[st.id] || ''}
                      onChange={(e) => setNewSubStageTitles({ ...newSubStageTitles, [st.id]: e.target.value })}
                      style={{ ...inputStyle, fontSize: '13px', padding: '6px 8px' }}
                    />
                    <button
                      onClick={() => handleAddSubStage(st.id)}
                      style={{
                        padding: '6px 10px',
                        backgroundColor: '#e5e5ea',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const inputStyle: React.CSSProperties = {
  padding: '10px 12px',
  backgroundColor: '#ffffff',
  border: '1px solid #e5e5ea',
  borderRadius: '8px',
  fontSize: '14px',
  color: '#1c1c1e',
  outline: 'none'
};
