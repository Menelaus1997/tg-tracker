import React, { useState } from 'react';
import { Project, Stage, SubStage, TeamMember } from '../App';

// Інтерфейс для користувацьких статусів
interface ProjectStatus {
  id: string;
  label: string;
  color: string;
}

const DEFAULT_STATUSES: ProjectStatus[] = [
  { id: '1', label: 'In Progress', color: '#8e8e93' },
  { id: '2', label: 'On Hold', color: '#ffcc00' },
  { id: '3', label: 'In Review', color: '#ff9500' },
  { id: '4', label: 'Completed', color: '#34c759' }
];

// ... (інші імпорти та інтерфейси без змін)

export const ProjectDetail: React.FC<ProjectDetailProps> = ({
  project,
  onUpdateProject,
  // ... (інші пропси)
}) => {
  // Додаємо стан для кастомних статусів (зберігаємо в project, якщо є, або дефолтні)
  const [statuses, setStatuses] = useState<ProjectStatus[]>(
    (project as any).customStatuses || DEFAULT_STATUSES
  );
  const [newStatusLabel, setNewStatusLabel] = useState('');
  const [newStatusColor, setNewStatusColor] = useState('#007aff');

  // Функція додавання нового статусу
  const handleAddStatus = () => {
    if (!newStatusLabel.trim()) return;
    const newStatus: ProjectStatus = { id: Date.now().toString(), label: newStatusLabel, color: newStatusColor };
    setStatuses([...statuses, newStatus]);
    setNewStatusLabel('');
  };

  // Функція оновлення статусу стадії
  const handleUpdateStageStatus = (stageId: string, statusLabel: string) => {
    setStages(stages.map(s => s.id === stageId ? { ...s, currentStatus: statusLabel } : s));
  };

  // ... (решта коду залишається, додаємо відображення в рендері стадії)

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
      
      {/* Блок налаштування статусів (тільки для Admin) */}
      {isSuperAdmin && (
        <div style={{ backgroundColor: '#f2f2f7', padding: '14px', borderRadius: '12px', marginBottom: '16px' }}>
          <h4 style={{ margin: '0 0 10px 0' }}>Status Settings</h4>
          <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
            <input placeholder="Status Name" value={newStatusLabel} onChange={e => setNewStatusLabel(e.target.value)} style={cardInputStyle} />
            <input type="color" value={newStatusColor} onChange={e => setNewStatusColor(e.target.value)} style={{ width: '40px' }} />
            <button onClick={handleAddStatus} style={compactPlusBtnStyle}>+</button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {statuses.map(st => (
              <span key={st.id} style={{ padding: '4px 8px', borderRadius: '12px', backgroundColor: st.color, color: '#fff', fontSize: '11px' }}>
                {st.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ... (рендер стадій) */}
      {displayedStages.map((st) => {
        const currentStatusObj = statuses.find(s => s.label === (st as any).currentStatus) || statuses[0];
        
        return (
          <div key={st.id} style={{ .../* твій стиль картки стадії */ }}>
            
            {/* Рядок з датою та статусом */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#007aff', backgroundColor: '#eef5ff', padding: '2px 6px', borderRadius: '4px' }}>
                📅 {formatDateShort((st as any).endDate)}
              </div>
              
              {/* Бейдж статусу */}
              <select 
                value={(st as any).currentStatus || statuses[0].label}
                onChange={(e) => handleUpdateStageStatus(st.id, e.target.value)}
                style={{ 
                  border: 'none', 
                  borderRadius: '12px', 
                  padding: '2px 8px', 
                  fontSize: '10px', 
                  fontWeight: 600,
                  backgroundColor: currentStatusObj.color,
                  color: '#fff',
                  cursor: 'pointer'
                }}
              >
                {statuses.map(s => <option key={s.id} value={s.label}>{s.label}</option>)}
              </select>
            </div>

            {/* ... (решта контенту стадії) */}
          </div>
        );
      })}
    </div>
  );
};
