import React, { useState, useEffect, useRef } from 'react';
import { Project } from '../App';

interface CreateProjectProps {
  onCreateProject: (project: Project) => void;
  templates: any[];
  onUpdateTemplates?: (templates: any[]) => void;
}

const INITIAL_MARKS = ['ЕП', 'АР', 'КР', 'АІ', 'BILD'];

export const CreateProject: React.FC<CreateProjectProps> = ({
  onCreateProject,
  templates = [],
  onUpdateTemplates
}) => {
  const [name, setName] = useState('');
  
  // 4 елементи шифру
  const [objectIndex, setObjectIndex] = useState('01');
  const [contractNumber, setContractNumber] = useState('100');
  const [projectYear, setProjectYear] = useState('2024');
  
  // Список марок та стан випадаючого меню
  const [marksList, setMarksList] = useState<string[]>(INITIAL_MARKS);
  const [projectMark, setProjectMark] = useState(INITIAL_MARKS[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAddingMark, setIsAddingMark] = useState(false);
  const [newMarkInput, setNewMarkInput] = useState('');

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Закриття випадаючого списку при кліку зовні
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
        setIsAddingMark(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Підсумковий шифр
  const [generatedId, setGeneratedId] = useState('');

  useEffect(() => {
    const objNum = objectIndex.trim() || 'XXX';
    const contract = contractNumber.trim() || 'XXX';
    const year = projectYear.trim() || 'XXX';
    setGeneratedId(`${objNum}/${contract}-${year}-${projectMark}`);
  }, [objectIndex, contractNumber, projectYear, projectMark]);

  const [selectedTemplateId, setSelectedTemplateId] = useState('');

  const [isTemplateManagerOpen, setIsTemplateManagerOpen] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [editingTemplateName, setEditingTemplateName] = useState('');

  const validTemplates = templates.filter((t) => t && t.id && t.name && t.name !== 'undefined');

  const handleAddNewMark = () => {
    const trimmed = newMarkInput.trim().toUpperCase();
    if (!trimmed) return;
    if (!marksList.includes(trimmed)) {
      const updatedMarks = [...marksList, trimmed];
      setMarksList(updatedMarks);
      setProjectMark(trimmed);
    } else {
      setProjectMark(trimmed);
    }
    setNewMarkInput('');
    setIsAddingMark(false);
    setIsDropdownOpen(false);
  };

  const handleDeleteMark = (e: React.MouseEvent, markToDelete: string) => {
    e.stopPropagation();
    if (marksList.length <= 1) {
      alert('Повинна залишитися хоча б одна марка.');
      return;
    }
    const updated = marksList.filter(m => m !== markToDelete);
    setMarksList(updated);
    if (projectMark === markToDelete) {
      setProjectMark(updated[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !generatedId.trim()) {
      alert('Будь ласка, заповніть найменування проєкту.');
      return;
    }

    const matchedTemplate = validTemplates.find((t) => t.id === selectedTemplateId);

    const cleanStages = matchedTemplate?.stages
      ? matchedTemplate.stages.map((st: any) => ({
          id: Date.now().toString() + Math.random().toString(36).substr(2, 4),
          title: st.title,
          subStages: (st.subStages || []).map((sub: any) => ({
            id: Date.now().toString() + Math.random().toString(36).substr(2, 4),
            title: sub.title,
            completed: false
          })),
          loggedSeconds: 0,
          isTimerRunning: false
        }))
      : [];

    const newProj: Project = {
      id: generatedId.trim(),
      name: name.trim(),
      color: '#007aff', // Дефолтний колір, оскільки вибір видалено
      status: 'active',
      stages: cleanStages,
      teamMembers: []
    };

    onCreateProject(newProj);
    setName('');
    setContractNumber('100');
    setObjectIndex('01');
    setProjectYear('2024');
    setSelectedTemplateId('');
  };

  const handleDeleteTemplate = (id: string) => {
    if (!onUpdateTemplates) return;
    if (confirm('Видалити цей шаблон?')) {
      const updated = templates.filter((t) => t.id !== id);
      onUpdateTemplates(updated);
      if (selectedTemplateId === id) setSelectedTemplateId('');
    }
  };

  const handleSaveTemplateName = (id: string) => {
    if (!onUpdateTemplates || !editingTemplateName.trim()) return;
    const updated = templates.map((t) =>
      t.id === id ? { ...t, name: editingTemplateName.trim() } : t
    );
    onUpdateTemplates(updated);
    setEditingTemplateId(null);
    setEditingTemplateName('');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto', color: '#1c1c1e' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        
        {/* Блок формування шифру */}
        <div style={{ backgroundColor: '#f2f2f7', padding: '12px', borderRadius: '12px', border: '1px solid #e5e5ea', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          
          {/* 4 елементи в один рядок */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
            <div>
              <label style={labelStyle}>№ об'єкту</label>
              <input
                type="text"
                value={objectIndex}
                onChange={(e) => setObjectIndex(e.target.value)}
                required
                style={{ ...formInputStyle, backgroundColor: '#ffffff', textAlign: 'center' }}
              />
            </div>

            <div>
              <label style={labelStyle}>№ Договору</label>
              <input
                type="text"
                value={contractNumber}
                onChange={(e) => setContractNumber(e.target.value)}
                required
                style={{ ...formInputStyle, backgroundColor: '#ffffff', textAlign: 'center' }}
              />
            </div>

            <div>
              <label style={labelStyle}>Рік</label>
              <input
                type="text"
                value={projectYear}
                onChange={(e) => setProjectYear(e.target.value)}
                required
                style={{ ...formInputStyle, backgroundColor: '#ffffff', textAlign: 'center' }}
              />
            </div>

            {/* Кастомний випадаючий список марок (із курсивом) */}
            <div style={{ position: 'relative' }} ref={dropdownRef}>
              <label style={labelStyle}>Марка</label>
              
              <div
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                style={{
                  ...formInputStyle,
                  backgroundColor: '#ffffff',
                  cursor: 'pointer',
                  textAlign: 'center',
                  padding: '10px 4px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '4px',
                  userSelect: 'none'
                }}
              >
                <span>{projectMark}</span>
                <span style={{ fontSize: '10px', color: '#636366' }}>▼</span>
              </div>

              {isDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  left: 0,
                  marginTop: '4px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #d1d1d6',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  zIndex: 100,
                  maxHeight: '160px',
                  overflowY: 'auto'
                }}>
                  {marksList.map((mark) => (
                    <div
                      key={mark}
                      onClick={() => {
                        setProjectMark(mark);
                        setIsDropdownOpen(false);
                        setIsAddingMark(false);
                      }}
                      style={{
                        padding: '8px 10px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '13px',
                        fontStyle: 'italic',
                        cursor: 'pointer',
                        backgroundColor: projectMark === mark ? '#f2f2f7' : '#ffffff',
                        borderBottom: '1px solid #f2f2f7'
                      }}
                    >
                      <span style={{ fontWeight: projectMark === mark ? 'bold' : 'normal' }}>{mark}</span>
                      {marksList.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => handleDeleteMark(e, mark)}
                          title="Видалити марку"
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '12px',
                            color: '#ff3b30',
                            padding: '2px 6px',
                            borderRadius: '4px'
                          }}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}

                  {!isAddingMark ? (
                    <div
                      onClick={() => setIsAddingMark(true)}
                      style={{
                        padding: '8px 10px',
                        color: '#007aff',
                        fontWeight: 'bold',
                        fontSize: '14px',
                        fontStyle: 'italic',
                        textAlign: 'center',
                        cursor: 'pointer',
                        backgroundColor: '#f9f9fb'
                      }}
                    >
                      +
                    </div>
                  ) : (
                    <div style={{ padding: '6px', display: 'flex', gap: '4px', backgroundColor: '#f9f9fb' }}>
                      <input
                        type="text"
                        placeholder="Марка"
                        value={newMarkInput}
                        onChange={(e) => setNewMarkInput(e.target.value)}
                        style={{ ...formInputStyle, backgroundColor: '#ffffff', padding: '4px 6px', fontSize: '12px', textAlign: 'center' }}
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={handleAddNewMark}
                        style={{ backgroundColor: '#34c759', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', padding: '0 8px', fontSize: '12px' }}
                      >
                        ✓
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Шифр */}
          <div>
            <label style={labelStyle}>Шифр:</label>
            <input
              type="text"
              value={generatedId}
              readOnly
              style={{
                ...formInputStyle,
                backgroundColor: '#ffffff',
                fontWeight: 'bold',
                color: '#1c1c1e',
                cursor: 'not-allowed'
              }}
            />
          </div>
        </div>

        {/* Найменування проєкту */}
        <div>
          <label style={labelStyle}>Найменування проєкту</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={formInputStyle}
          />
        </div>

        {/* Шаблон */}
        <div>
          <label style={labelStyle}>Шаблон етапів</label>
          <select
            value={selectedTemplateId}
            onChange={(e) => setSelectedTemplateId(e.target.value)}
            style={formInputStyle}
          >
            <option value="">Загальний шаблон (кастомний)</option>
            {validTemplates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          style={{
            padding: '14px',
            backgroundColor: '#007aff',
            color: '#ffffff',
            border: 'none',
            borderRadius: '12px',
            fontWeight: 700,
            fontSize: '15px',
            fontStyle: 'italic',
            cursor: 'pointer',
            marginTop: '6px'
          }}
        >
          Додати проєкт
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '16px' }}>
        <button
          type="button"
          onClick={() => setIsTemplateManagerOpen(!isTemplateManagerOpen)}
          style={{
            background: 'none',
            border: 'none',
            color: '#8e8e93',
            fontSize: '13px',
            fontStyle: 'italic',
            cursor: 'pointer',
            textDecoration: 'underline'
          }}
        >
          {isTemplateManagerOpen ? 'Сховати архів' : 'Архів шаблонів'}
        </button>
      </div>

      {isTemplateManagerOpen && (
        <div style={{ marginTop: '16px', padding: '14px', backgroundColor: '#f2f2f7', borderRadius: '12px' }}>
          {validTemplates.length === 0 ? (
            <div style={{ fontSize: '12px', fontStyle: 'italic', color: '#8e8e93' }}>Немає збережених шаблонів.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {validTemplates.map((t) => (
                <div
                  key={t.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    fontSize: '13px',
                    border: '1px solid #e5e5ea'
                  }}
                >
                  {editingTemplateId === t.id ? (
                    <div style={{ display: 'flex', gap: '6px', flex: 1, marginRight: '8px' }}>
                      <input
                        type="text"
                        value={editingTemplateName}
                        onChange={(e) => setEditingTemplateName(e.target.value)}
                        style={{ ...formInputStyle, padding: '4px 8px', fontSize: '12px' }}
                      />
                      <button
                        onClick={() => handleSaveTemplateName(t.id)}
                        style={{ padding: '4px 8px', backgroundColor: '#34c759', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontStyle: 'italic' }}
                      >
                        ✓
                      </button>
                    </div>
                  ) : (
                    <span
                      onClick={() => {
                        setEditingTemplateId(t.id);
                        setEditingTemplateName(t.name);
                      }}
                      style={{ fontWeight: 500, fontStyle: 'italic', cursor: 'pointer', flex: 1 }}
                    >
                      {t.name}
                    </span>
                  )}

                  <button
                    onClick={() => handleDeleteTemplate(t.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px' }}
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const formInputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  backgroundColor: '#e5e5ea',
  border: '1px solid #d1d1d6',
  borderRadius: '10px',
  fontSize: '13px',
  fontStyle: 'italic',
  outline: 'none',
  boxSizing: 'border-box',
  color: '#1c1c1e'
};

const labelStyle: React.CSSProperties = {
  fontSize: '10px',
  color: '#636366',
  marginBottom: '2px',
  fontStyle: 'italic',
  display: 'block',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis'
};

export default CreateProject;
