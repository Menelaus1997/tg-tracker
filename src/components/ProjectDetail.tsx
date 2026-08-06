import React, { useState } from 'react';
import { Project, CustomField, Stage } from '../App';

interface ProjectDetailProps {
  project: Project;
  onUpdateProject: (updatedProject: Project) => void;
  onSaveAsTemplate?: (templateName: string, stages: Stage[], customFields: CustomField[]) => void;
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
  // Основні дані проекту
  const [isEditingMain, setIsEditingMain] = useState(false);
  const [name, setName] = useState(project.name);
  const [projectId, setProjectId] = useState(project.id);
  const [color, setColor] = useState(project.color);

  // Загальні дані (посилання/адреса)
  const [generalInfo, setGeneralInfo] = useState(project.generalInfo || '');

  // Поля та стадії
  const [customFields, setCustomFields] = useState<CustomField[]>(
    project.customFields?.length > 0 ? project.customFields : [{ id: '1', name: '', unit: '' }]
  );
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldUnit, setNewFieldUnit] = useState('');

  const [stages, setStages] = useState<Stage[]>(project.stages || []);
  const [newStageTitle, setNewStageTitle] = useState('');
  const [newSubStageTitles, setNewSubStageTitles] = useState<{ [stageId: string]: string }>({});

  // Редагування стадій/підстадій на місці
  const [editingStageId, setEditingStageId] = useState<string | null>(null);
  const [editingStageTitle, setEditingStageTitle] = useState('');

  const [editingSubStageId, setEditingSubStageId] = useState<string | null>(null);
  const [editingSubStageTitle, setEditingSubStageTitle] = useState('');

  // Модальне вікно шаблону
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveAsTemplateChecked, setSaveAsTemplateChecked] = useState(false);
  const [templateName, setTemplateName] = useState('');

  const isArchived = project.status === 'archived';

  // --- Збереження основної інформації проекту ---
  const handleSaveMainInfo = () => {
    setIsEditingMain(false);
    onUpdateProject({
      ...project,
      name,
      id: projectId,
      color,
      generalInfo,
      customFields,
      stages
    });
  };

  // --- Параметри об'єкта ---
  const handleAddCustomField = (e: React.FormEvent) => {
    e.preventDefault();
    if (isArchived || (!newFieldName.trim() && !newFieldUnit.trim())) return;

    const newField: CustomField = {
      id: Date.now().toString(),
      name: newFieldName.trim(),
      unit: newFieldUnit.trim()
    };
    setCustomFields([...customFields, newField]);
    setNewFieldName('');
    setNewFieldUnit('');
  };

  const handleRemoveField = (id: string) => {
    if (isArchived) return;
    setCustomFields(customFields.filter((f) => f.id !== id));
  };

  // --- Стадії та Підстадії (CRUD) ---
  const handleAddStage = (e: React.FormEvent) => {
    e.preventDefault();
    if (isArchived || !newStageTitle.trim()) return;

    const newStage: Stage = {
      id: Date.now().toString(),
      title: newStageTitle.trim(),
      subStages: []
    };
    setStages([...stages, newStage]);
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

    setStages(stages.map((st) => {
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
    }));

    setNewSubStageTitles({ ...newSubStageTitles, [stageId]: '' });
  };

  const handleSaveEditedSubStage = (stageId: string, subStageId: string) => {
    setStages(stages.map((st) => {
      if (st.id === stageId) {
        return {
          ...st,
          subStages: st.subStages.map(sub => sub.id === subStageId ? { ...sub, title: editingSubStageTitle } : sub)
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
        return {
          ...st,
          subStages: st.subStages.filter(sub => sub.id !== subStageId)
        };
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
          subStages: st.subStages.map((sub) =>
            sub.id === subStageId ? { ...sub, completed: !sub.completed } : sub
          )
        };
      }
      return st;
    }));
  };

  // --- Фінальне збереження змін ---
  const handleFinalSave = () => {
    onUpdateProject({
      ...project,
      name,
      id: projectId,
      color,
      generalInfo,
      customFields,
      stages
    });

    if (saveAsTemplateChecked && templateName.trim() && onSaveAsTemplate) {
      onSaveAsTemplate(templateName.trim(), stages, customFields);
    }

    setShowSaveModal(false);
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#ffffff', color: '#1c1c1e', maxWidth: '500px', margin: '0 auto' }}>
      {/* Кнопка "Назад" та Назва/ID/Колір з редагуванням */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>←</button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: color, flexShrink: 0 }} />
            <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>{name}</h2>
            <span style={{ fontSize: '13px', color: '#8e8e93' }}>({projectId})</span>
          </div>
        </div>

        {!isArchived && (
          <button
            onClick={() => setIsEditingMain(!isEditingMain)}
            style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}
          >
            ✏️
          </button>
        )}
      </div>

      {/* Панель редагування основних даних (Назва, ID, Колір) */}
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
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
              {DEFAULT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: c,
                    border: color === c ? '2px solid #000' : 'none',
                    cursor: 'pointer'
                  }}
                />
              ))}
            </div>
          </div>
          <button onClick={handleSaveMainInfo} style={{ ...greenBtnStyle, marginTop: '6px' }}>Застосувати</button>
        </div>
      )}

      {/* РОЗДІЛ 1: Параметри об'єкта */}
      <div style={{ marginBottom: '28px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>Параметри об'єкта</h3>

        {/* 1. Загальні дані (Адреса / Google Drive) */}
        <div style={{ marginBottom: '12px' }}>
          <label style={labelStyle}>Загальні дані (Адреса / Посилання)</label>
          <input
            type="text"
            placeholder="Введіть адресу об'єкта або посилання на Google Диск"
            value={generalInfo}
            disabled={isArchived}
            onChange={(e) => setGeneralInfo(e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* Список доданих параметрів */}
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

        {/* Форма додавання нового параметра з зеленою кнопкою "Додати" */}
        {!isArchived && (
          <form onSubmit={handleAddCustomField} style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="Назва (напр. Площа)"
              value={newFieldName}
              onChange={(e) => setNewFieldName(e.target.value)}
              style={{ ...inputStyle, flex: 2 }}
            />
            <input
              type="text"
              placeholder="Од. вим. (напр. м²)"
              value={newFieldUnit}
              onChange={(e) => setNewFieldUnit(e.target.value)}
              style={{ ...inputStyle, flex: 1 }}
            />
            <button type="submit" style={greenBtnStyle}>Додати</button>
          </form>
        )}
      </div>

      {/* РОЗДІЛ 2: Стадії проекту */}
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>Стадії проекту</h3>

        {!isArchived && (
          <form onSubmit={handleAddStage} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <input
              type="text"
              placeholder="Нова стадія (напр. 1. Концепція)"
              value={newStageTitle}
              onChange={(e) => setNewStageTitle(e.target.value)}
              style={{ ...inputStyle, flex: 1 }}
            />
            <button type="submit" style={greenBtnStyle}>Додати</button>
          </form>
        )}

        {/* Список стадій */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {stages.map((st) => (
            <div key={st.id} style={{ padding: '14px', borderRadius: '10px', backgroundColor: '#f2f2f7' }}>
              
              {/* Шапка стадії (З можливістю редагування/видалення) */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                {editingStageId === st.id ? (
                  <div style={{ display: 'flex', gap: '6px', flex: 1 }}>
                    <input
                      type="text"
                      value={editingStageTitle}
                      onChange={(e) => setEditingStageTitle(e.target.value)}
                      style={{ ...inputStyle, padding: '4px 8px' }}
                    />
                    <button onClick={() => handleSaveEditedStage(st.id)} style={{ ...greenBtnStyle, padding: '4px 8px', fontSize: '12px' }}>✓</button>
                  </div>
                ) : (
                  <div style={{ fontWeight: 600, fontSize: '15px', color: '#1c1c1e' }}>{st.title}</div>
                )}

                {!isArchived && editingStageId !== st.id && (
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={() => { setEditingStageId(st.id); setEditingStageTitle(st.title); }} style={iconStyle}>✏️</button>
                    <button onClick={() => handleDeleteStage(st.id)} style={iconStyle}>🗑️</button>
                  </div>
                )}
              </div>

              {/* Підстадії */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginLeft: '8px' }}>
                {st.subStages.map((sub) => (
                  <div key={sub.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {editingSubStageId === sub.id ? (
                      <div style={{ display: 'flex', gap: '6px', flex: 1 }}>
                        <input
                          type="text"
                          value={editingSubStageTitle}
                          onChange={(e) => setEditingSubStageTitle(e.target.value)}
                          style={{ ...inputStyle, padding: '4px 8px', fontSize: '13px' }}
                        />
                        <button onClick={() => handleSaveEditedSubStage(st.id, sub.id)} style={{ ...greenBtnStyle, padding: '4px 8px', fontSize: '12px' }}>✓</button>
                      </div>
                    ) : (
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: isArchived ? 'default' : 'pointer', flex: 1 }}>
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
                    )}

                    {!isArchived && editingSubStageId !== sub.id && (
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button onClick={() => { setEditingSubStageId(sub.id); setEditingSubStageTitle(sub.title); }} style={{ ...iconStyle, fontSize: '13px' }}>✏️</button>
                        <button onClick={() => handleDeleteSubStage(st.id, sub.id)} style={{ ...iconStyle, fontSize: '13px' }}>🗑️</button>
                      </div>
                    )}
                  </div>
                ))}

                {/* Додавання підстадії */}
                {!isArchived && (
                  <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                    <input
                      type="text"
                      placeholder="+ Підстадія (напр. Виїзд на об'єкт)"
                      value={newSubStageTitles[st.id] || ''}
                      onChange={(e) => setNewSubStageTitles({ ...newSubStageTitles, [st.id]: e.target.value })}
                      style={{ ...inputStyle, fontSize: '13px', padding: '6px 8px' }}
                    />
                    <button onClick={() => handleAddSubStage(st.id)} style={greenBtnStyle}>+</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* РОЗДІЛ 3: Кнопка Зберегти Зміни */}
      {!isArchived && (
        <button
          onClick={() => setShowSaveModal(true)}
          style={{
            width: '100%',
            padding: '14px',
            backgroundColor: '#007aff',
            color: '#ffffff',
            border: 'none',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Зберегти зміни
        </button>
      )}

      {/* Модальне вікно Збереження / Збереження як Шаблон */}
      {showSaveModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h3 style={{ marginTop: 0, fontSize: '18px' }}>Збереження проекту</h3>
            <p style={{ fontSize: '14px', color: '#636366' }}>Основні дані проекту успішно оновлено.</p>

            <div style={{ marginTop: '14px', marginBottom: '14px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer', fontWeight: 500 }}>
                <input
                  type="checkbox"
                  checked={saveAsTemplateChecked}
                  onChange={(e) => setSaveAsTemplateChecked(e.target.checked)}
                />
                Зберегти цю структуру як шаблон?
              </label>

              {saveAsTemplateChecked && (
                <input
                  type="text"
                  placeholder="Введіть назву шаблону"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
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

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  backgroundColor: '#ffffff',
  border: '1px solid #e5e5ea',
  borderRadius: '8px',
  fontSize: '14px',
  color: '#1c1c1e',
  outline: 'none',
  boxSizing: 'border-box'
};

const labelStyle: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: 500,
  color: '#636366',
  marginBottom: '4px',
  display: 'block'
};

const greenBtnStyle: React.CSSProperties = {
  padding: '10px 14px',
  backgroundColor: '#34c759',
  color: '#ffffff',
  border: 'none',
  borderRadius: '8px',
  fontWeight: 600,
  fontSize: '14px',
  cursor: 'pointer',
  whiteSpace: 'nowrap'
};

const iconStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontSize: '14px',
  padding: '2px'
};

const btnStyle: React.CSSProperties = {
  padding: '8px 14px',
  borderRadius: '8px',
  border: 'none',
  fontWeight: 600,
  fontSize: '14px',
  cursor: 'pointer'
};

const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.4)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 2000
};

const modalContentStyle: React.CSSProperties = {
  backgroundColor: '#ffffff',
  padding: '20px',
  borderRadius: '14px',
  maxWidth: '360px',
  width: '90%',
  boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
};
