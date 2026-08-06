import React, { useState, useRef } from 'react';
import { SavedTemplate } from '../App';

interface CreateProjectProps {
  onCreateProject: (project: { id: string; name: string; template: string; color: string }) => void;
  availableTemplates?: SavedTemplate[];
  onDeleteTemplate?: (templateId: string) => void;
  onRenameTemplate?: (templateId: string, newName: string) => void;
}

const DEFAULT_COLORS = [
  '#00a84f', '#009688', '#7c4dff', 
  '#2196f3', '#e53935', '#3e2723', 
  '#d84315', '#8e24aa', '#3f51b5'
];

export const CreateProject: React.FC<CreateProjectProps> = ({ 
  onCreateProject, 
  availableTemplates = [],
  onDeleteTemplate,
  onRenameTemplate
}) => {
  const [name, setName] = useState('');
  const [projectId, setProjectId] = useState('#V1');
  const [template, setTemplate] = useState('general');
  const [colors, setColors] = useState<string[]>(DEFAULT_COLORS);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [showTemplatesArchive, setShowTemplatesArchive] = useState<boolean>(false);

  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [editingTemplateName, setEditingTemplateName] = useState<string>('');

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const colorInputRef = useRef<HTMLInputElement>(null);

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    if (newColor) {
      setColors((prevColors) => {
        const updated = [...prevColors];
        updated[selectedIndex] = newColor;
        return updated;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onCreateProject({
      id: projectId,
      name: name,
      template: template,
      color: colors[selectedIndex]
    });
  };

  const handleStartRename = (tmpl: SavedTemplate) => {
    setEditingTemplateId(tmpl.id);
    setEditingTemplateName(tmpl.name);
  };

  const handleSaveRename = (id: string) => {
    if (onRenameTemplate && editingTemplateName.trim()) {
      onRenameTemplate(id, editingTemplateName.trim());
    }
    setEditingTemplateId(null);
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmId && onDeleteTemplate) {
      onDeleteTemplate(deleteConfirmId);
    }
    setDeleteConfirmId(null);
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#ffffff', color: '#1c1c1e', maxWidth: '500px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '20px', fontSize: '22px', fontWeight: 700, color: '#1c1c1e' }}>
        Створення проекту
      </h2>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '14px', fontWeight: 500, color: '#636366' }}>Найменування проекта</label>
          <input
            type="text"
            placeholder="ЖК Варшавський"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={inputStyle}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '14px', fontWeight: 500, color: '#636366' }}>ID проекту</label>
          <input
            type="text"
            placeholder="#V1"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '14px', fontWeight: 500, color: '#636366' }}>Шаблон</label>
          <div style={{ position: 'relative' }}>
            <select
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              style={{
                ...inputStyle,
                appearance: 'none',
                WebkitAppearance: 'none',
                paddingRight: '36px',
                cursor: 'pointer'
              }}
            >
              <option value="general">Загальний шаблон (свій варіант)</option>
              {availableTemplates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            <div style={{
              position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
              pointerEvents: 'none', width: 0, height: 0,
              borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '6px solid #1c1c1e'
            }} />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '14px', fontWeight: 500, color: '#636366' }}>Колір</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'nowrap' }}>
            {colors.map((color, index) => {
              const isSelected = selectedIndex === index;
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => setSelectedIndex(index)}
                  style={{
                    width: '32px', height: '32px', borderRadius: '50%', backgroundColor: color, border: 'none',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#ffffff', fontSize: '14px',
                    boxShadow: isSelected ? '0 0 0 2px #ffffff, 0 0 0 4px #007aff' : 'none',
                    flexShrink: 0
                  }}
                >
                  {isSelected && '✓'}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => colorInputRef.current?.click()}
              style={{
                width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#e5e5ea',
                border: 'none', color: '#636366', fontSize: '18px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}
            >
              +
            </button>
            <input
              ref={colorInputRef}
              type="color"
              onChange={handleCustomColorChange}
              style={{ display: 'none' }}
            />
          </div>
        </div>

        <button
          type="submit"
          style={{
            marginTop: '16px', padding: '14px', backgroundColor: '#007aff', color: '#ffffff',
            border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 600, cursor: 'pointer'
          }}
        >
          Створити проект
        </button>
      </form>

      {/* Напис без дужок і підкреслення */}
      <div style={{ marginTop: '16px', textAlign: 'center' }}>
        <button
          type="button"
          onClick={() => setShowTemplatesArchive(!showTemplatesArchive)}
          style={{
            background: 'none',
            border: 'none',
            color: '#8e8e93',
            fontSize: '13px',
            cursor: 'pointer',
            padding: '4px'
          }}
        >
          Архів шаблонів
        </button>

        {showTemplatesArchive && (
          <div style={{ marginTop: '12px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {availableTemplates.length === 0 ? (
              <div style={{ fontSize: '13px', color: '#8e8e93', textAlign: 'center' }}>Немає збережених шаблонів</div>
            ) : (
              availableTemplates.map((tmpl) => (
                <div
                  key={tmpl.id}
                  style={{
                    padding: '10px 14px',
                    backgroundColor: '#f2f2f7',
                    borderRadius: '8px',
                    display: 'flex',
                    justify: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  {editingTemplateId === tmpl.id ? (
                    <div style={{ display: 'flex', gap: '6px', flex: 1 }}>
                      <input
                        type="text"
                        value={editingTemplateName}
                        onChange={(e) => setEditingTemplateName(e.target.value)}
                        style={{ ...inputStyle, padding: '4px 8px', fontSize: '13px' }}
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveRename(tmpl.id)}
                        style={{ padding: '4px 8px', backgroundColor: '#34c759', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                      >
                        ✓
                      </button>
                    </div>
                  ) : (
                    <span style={{ fontSize: '14px', fontWeight: 500, color: '#1c1c1e' }}>{tmpl.name}</span>
                  )}

                  {editingTemplateId !== tmpl.id && (
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => handleStartRename(tmpl)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}
                        title="Редагувати назву"
                      >
                        ✏️
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(tmpl.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}
                        title="Видалити шаблон"
                      >
                        🗑️
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Модалка підтвердження видалення шаблону */}
      {deleteConfirmId && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h3 style={{ marginTop: 0, fontSize: '18px' }}>Видалити шаблон?</h3>
            <p style={{ fontSize: '14px', color: '#636366' }}>Ви дійсно бажаєте видалити цей шаблон безповоротно?</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => setDeleteConfirmId(null)} style={{ ...modalBtnStyle, backgroundColor: '#e5e5ea', color: '#1c1c1e' }}>Ні</button>
              <button onClick={handleConfirmDelete} style={{ ...modalBtnStyle, backgroundColor: '#ff3b30', color: '#ffffff' }}>Так, видалити</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 14px', backgroundColor: '#f2f2f7',
  border: '1px solid #e5e5ea', borderRadius: '10px', color: '#1c1c1e', fontSize: '15px', outline: 'none', boxSizing: 'border-box'
};
const modalOverlayStyle: React.CSSProperties = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 };
const modalContentStyle: React.CSSProperties = { backgroundColor: '#ffffff', padding: '20px', borderRadius: '14px', maxWidth: '360px', width: '90%', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' };
const modalBtnStyle: React.CSSProperties = { padding: '8px 14px', borderRadius: '8px', border: 'none', fontWeight: 600, fontSize: '14px', cursor: 'pointer' };
