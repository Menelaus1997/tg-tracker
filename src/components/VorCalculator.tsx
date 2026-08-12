import React, { useState, useEffect } from 'react';
import { Project } from '../App';

interface VorCalculatorProps {
  project?: Project;
  onUpdateProject?: (project: Project) => void;
}

export const VorCalculator: React.FC<VorCalculatorProps> = ({ project, onUpdateProject }) => {
  // Локальний стан для значень у ВОР, прив'язаний до passportRows проекту
  const [rows, setRows] = useState<any[]>(project?.passportRows || []);

  useEffect(() => {
    if (project?.passportRows) {
      setRows(project.passportRows);
    }
  }, [project?.passportRows]);

  const handleValueChange = (id: string, newVal: string) => {
    const updated = rows.map(r => r.id === id ? { ...r, value: newVal } : r);
    setRows(updated);

    if (project && onUpdateProject) {
      onUpdateProject({
        ...project,
        passportRows: updated
      });
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto', color: '#1c1c1e' }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <div style={{ fontSize: '32px', marginBottom: '8px' }}>📊</div>
        <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 4px 0' }}>
          ВОР (Відомість об'ємів робіт)
        </h3>
        <p style={{ fontSize: '13px', color: '#8e8e93', margin: 0 }}>
          {project ? `Проект: ${project.name}` : 'Дані проекту не вибрано'}
        </p>
      </div>

      {rows.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '30px', color: '#8e8e93', fontSize: '13px', backgroundColor: '#f2f2f7', borderRadius: '12px' }}>
          Немає створених рядків у вкладці «Дані». Додайте їх у налаштуваннях проекту.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {rows.map((r) => (
            <div 
              key={r.id} 
              style={{ 
                backgroundColor: '#f2f2f7', 
                padding: '12px 14px', 
                borderRadius: '12px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                gap: '12px',
                border: '1px solid #e5e5ea'
              }}
            >
              {/* Відображення назви рядка із вкладки Дані (напр. Загальна площа) */}
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#1c1c1e', flex: 1 }}>
                {r.label || 'Без назви'}
              </span>

              {/* Поле для введення або перегляду значення в м² / одиницях */}
              <input
                type="text"
                placeholder="0"
                value={r.value || ''}
                onChange={(e) => handleValueChange(r.id, e.target.value)}
                style={{
                  width: '120px',
                  padding: '6px 10px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #d1d1d6',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  textAlign: 'right',
                  outline: 'none',
                  color: '#1c1c1e',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VorCalculator;
