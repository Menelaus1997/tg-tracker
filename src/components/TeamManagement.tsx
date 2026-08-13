import React, { useState } from 'react';
import { TeamMember, RoleConfig } from '../App';

interface TeamManagementProps {
  members: TeamMember[];
  onUpdateMembers: (members: TeamMember[]) => void;
  roles: RoleConfig[];
  onSaveRole: (role: RoleConfig) => void;
  onDeleteRole: (id: string) => void;
  availableRoles: string[];
}

export const TeamManagement: React.FC<TeamManagementProps> = ({
  members,
  onUpdateMembers,
  roles = [],
  onSaveRole,
  onDeleteRole,
  availableRoles = []
}) => {
  const [name, setName] = useState('');
  const [telegramId, setTelegramId] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<TeamMember>>({});
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(true);
  const [isRolesOpen, setIsRolesOpen] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [roleEditForm, setRoleEditForm] = useState<RoleConfig | null>(null);
  const [editingRoleNameId, setEditingRoleNameId] = useState<string | null>(null);
  const [tempRoleName, setTempRoleName] = useState('');
  const [newRoleName, setNewRoleName] = useState('');

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newMember: TeamMember = {
      id: Date.now().toString(),
      fullName: name.trim(),
      telegramId: telegramId.trim() ? telegramId.trim() : undefined,
      role: '',
      active: true
    };

    onUpdateMembers([...members, newMember]);
    setName('');
    setTelegramId('');
  };

  const handleSaveEditMember = (id: string) => {
    onUpdateMembers(members.map(m => m.id === id ? { ...m, ...editForm } : m));
    setEditingId(null);
  };

  const toggleMemberStatus = (id: string) => {
    onUpdateMembers(members.map(m => m.id === id ? { ...m, active: m.active === false ? true : false } : m));
  };

  const handleCreateNewRole = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;
    const newRole: RoleConfig = {
      id: Date.now().toString(),
      name: newRoleName.trim(),
      permissions: {
        canViewAnalytics: true,
        canViewVor: true,
        canViewFinance: true,
        canViewSettings: true,
        canEditProjects: true,
        showDates: true,
        canManageSubtasks: true,
        showOnlyAssignedStages: false,
        canViewCreateProject: true,
        canViewTeam: true,
        canSeeAllProjects: true,
        canDeleteProjects: true,
        canManageStages: true,
        canManageTimer: true,
        canAssignTeam: true
      }
    };
    onSaveRole(newRole);
    setNewRoleName('');
  };

  return (
    <div style={{ padding: '16px', maxWidth: '500px', margin: '0 auto', color: '#1c1c1e', paddingBottom: '80px', fontFamily: "'SF Pro Condensed', -apple-system, sans-serif", fontSize: '11px', lineHeight: 1 }}>
      
      {/* Форма створення фахівця */}
      <form onSubmit={handleAddMember} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px', backgroundColor: '#f2f2f7', padding: '12px', borderRadius: '10px' }}>
        <div>
          <label style={labelStyle}>Повне ім'я</label>
          <input 
            type="text" 
            placeholder="напр. Іван Іванов" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
            style={inputStyle} 
          />
        </div>

        <div>
          <label style={labelStyle}>Telegram ID</label>
          <input 
            type="text" 
            placeholder="Telegram User ID" 
            value={telegramId} 
            onChange={(e) => setTelegramId(e.target.value)} 
            style={inputStyle} 
          />
        </div>

        <button 
          type="submit" 
          style={{ width: '100%', padding: '10px', backgroundColor: '#007aff', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontStyle: 'italic', fontSize: '12px', cursor: 'pointer', lineHeight: 1, marginTop: '2px' }}
        >
          Додати до бази даних
        </button>
      </form>

      {/* Список учасників */}
      <div style={{ backgroundColor: '#f2f2f7', padding: '12px', borderRadius: '10px', marginBottom: '14px' }}>
        <div 
          onClick={() => setIsParticipantsOpen(!isParticipantsOpen)} 
          style={{ cursor: 'pointer', textAlign: 'center', fontSize: '14px', fontWeight: 'bold', fontStyle: 'italic', color: '#8e8e93', userSelect: 'none', lineHeight: 1 }}
        >
          Учасники {isParticipantsOpen ? '▲' : '▼'}
        </div>

        {isParticipantsOpen && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
            {members.map((m) => (
              <div key={m.id} style={{ padding: '10px', borderRadius: '8px', backgroundColor: '#ffffff', border: '1px solid #e5e5ea' }}>
                {editingId === m.id ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <input 
                      type="text" 
                      value={editForm.fullName || ''} 
                      onChange={(e) => setEditForm({...editForm, fullName: e.target.value})} 
                      style={inputStyle} 
                    />
                    <input 
                      type="text" 
                      placeholder="Telegram ID" 
                      value={editForm.telegramId || ''} 
                      onChange={(e) => setEditForm({...editForm, telegramId: e.target.value})} 
                      style={inputStyle} 
                    />
                    <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                      <button 
                        type="button" 
                        onClick={() => handleSaveEditMember(m.id)} 
                        style={{ padding: '6px 10px', backgroundColor: '#34c759', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', fontStyle: 'italic', cursor: 'pointer', lineHeight: 1 }}
                      >
                        Зберегти
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setEditingId(null)} 
                        style={{ padding: '6px 10px', backgroundColor: '#e5e5ea', color: '#1c1c1e', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', fontStyle: 'italic', cursor: 'pointer', lineHeight: 1 }}
                      >
                        Скасувати
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => { setEditingId(m.id); setEditForm(m); }}>
                      <div style={{ fontWeight: 'bold', fontSize: '14px', fontStyle: 'italic', color: '#1c1c1e', lineHeight: 1 }}>{m.fullName}</div>
                      {m.telegramId && (
                        <div style={{ fontSize: '11px', fontStyle: 'italic', color: '#8e8e93', marginTop: '2px', lineHeight: 1 }}>ID: {m.telegramId}</div>
                      )}
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button 
                        type="button" 
                        onClick={() => onUpdateMembers(members.filter(i => i.id !== m.id))} 
                        style={{ background: 'none', border: 'none', color: '#ff3b30', cursor: 'pointer', fontSize: '12px', padding: 0, lineHeight: 1 }}
                        title="Видалити"
                      >
                        🗑️
                      </button>

                      <div
                        onClick={() => toggleMemberStatus(m.id)}
                        style={{ width: '30px', height: '16px', borderRadius: '8px', backgroundColor: m.active !== false ? '#34c759' : '#e5e5ea', position: 'relative', cursor: 'pointer', flexShrink: 0 }}
                      >
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#fff', position: 'absolute', top: '2px', left: m.active !== false ? '16px' : '2px', transition: 'left 0.2s' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Управління ролями */}
      <div style={{ backgroundColor: '#f2f2f7', padding: '12px', borderRadius: '10px' }}>
        <div 
          onClick={() => setIsRolesOpen(!isRolesOpen)} 
          style={{ cursor: 'pointer', textAlign: 'center', fontSize: '14px', fontWeight: 'bold', fontStyle: 'italic', color: '#8e8e93', userSelect: 'none', lineHeight: 1 }}
        >
          Управління ролями та дозволами {isRolesOpen ? '▲' : '▼'}
        </div>

        {isRolesOpen && (
          <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <input 
                type="text" 
                placeholder="Нова назва ролі..." 
                value={newRoleName} 
                onChange={(e) => setNewRoleName(e.target.value)} 
                style={{ ...inputStyle, flex: 1 }} 
              />
              <button 
                type="button" 
                onClick={handleCreateNewRole} 
                style={{ ...compactPlusBtnStyle }}
                title="Додати роль"
              >
                +
              </button>
            </div>

            {roles.map(r => (
              <div key={r.id} style={{ backgroundColor: '#fff', padding: '10px', borderRadius: '8px', border: '1px solid #e5e5ea' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  
                  {editingRoleNameId === r.id ? (
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flex: 1, marginRight: '10px' }}>
                      <input 
                        type="text" 
                        value={tempRoleName} 
                        onChange={(e) => setTempRoleName(e.target.value)} 
                        style={{ ...inputStyle, padding: '4px 8px', fontSize: '11px', height: '24px' }} 
                      />
                      <button 
                        type="button" 
                        onClick={() => {
                          if (tempRoleName.trim()) {
                            onSaveRole({ ...r, name: tempRoleName.trim() });
                          }
                          setEditingRoleNameId(null);
                        }} 
                        style={{ padding: '4px 8px', backgroundColor: '#34c759', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', fontStyle: 'italic', cursor: 'pointer', height: '24px', lineHeight: 1 }}
                      >
                        OK
                      </button>
                    </div>
                  ) : (
                    <span 
                      style={{ fontWeight: 'bold', fontSize: '14px', fontStyle: 'italic', cursor: 'pointer', flex: 1, lineHeight: 1 }} 
                      onClick={() => {
                        setEditingRoleNameId(r.id);
                        setTempRoleName(r.name);
                      }}
                      title="Натисніть, щоб перейменувати роль"
                    >
                      {r.name}
                    </span>
                  )}

                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <button 
                      type="button" 
                      onClick={() => { setEditingRoleId(editingRoleId === r.id ? null : r.id); setRoleEditForm(r); }} 
                      style={{ background: 'none', border: 'none', color: '#8e8e93', fontSize: '11px', fontWeight: 'bold', fontStyle: 'italic', cursor: 'pointer', lineHeight: 1 }}
                    >
                      {editingRoleId === r.id ? 'Закрити' : 'Редагувати'}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => onDeleteRole(r.id)} 
                      style={{ background: 'none', border: 'none', color: '#ff3b30', fontSize: '12px', cursor: 'pointer', padding: 0, lineHeight: 1 }} 
                      title="Видалити"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {editingRoleId === r.id && roleEditForm && (
                  <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #f2f2f7', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11px' }}>
                    
                    {/* Повзунки доступу */}
                    <PermissionToggle
                      label="Бачить вкладку Аналітика"
                      value={roleEditForm.permissions?.canViewAnalytics ?? true}
                      onChange={(val) => setRoleEditForm({ ...roleEditForm, permissions: { ...roleEditForm.permissions, canViewAnalytics: val } })}
                    />
                    <PermissionToggle
                      label="Бачить вкладку Вор"
                      value={roleEditForm.permissions?.canViewVor ?? true}
                      onChange={(val) => setRoleEditForm({ ...roleEditForm, permissions: { ...roleEditForm.permissions, canViewVor: val } })}
                    />
                    <PermissionToggle
                      label="Бачить вкладку Фінанси"
                      value={roleEditForm.permissions?.canViewFinance ?? true}
                      onChange={(val) => setRoleEditForm({ ...roleEditForm, permissions: { ...roleEditForm.permissions, canViewFinance: val } })}
                    />
                    <PermissionToggle
                      label="Бачить вкладку Налаштування"
                      value={roleEditForm.permissions?.canViewSettings ?? true}
                      onChange={(val) => setRoleEditForm({ ...roleEditForm, permissions: { ...roleEditForm.permissions, canViewSettings: val } })}
                    />
                    <PermissionToggle
                      label="Відображати дати в проєктах/стадіях"
                      value={roleEditForm.permissions?.showDates ?? true}
                      onChange={(val) => setRoleEditForm({ ...roleEditForm, permissions: { ...roleEditForm.permissions, showDates: val } })}
                    />
                    <PermissionToggle
                      label="Може виконувати дії з підзадачами"
                      value={roleEditForm.permissions?.canManageSubtasks ?? true}
                      onChange={(val) => setRoleEditForm({ ...roleEditForm, permissions: { ...roleEditForm.permissions, canManageSubtasks: val } })}
                    />
                    <PermissionToggle
                      label="Відображати тільки призначені стадії"
                      value={roleEditForm.permissions?.showOnlyAssignedStages ?? false}
                      onChange={(val) => setRoleEditForm({ ...roleEditForm, permissions: { ...roleEditForm.permissions, showOnlyAssignedStages: val } })}
                    />

                    <button 
                      type="button" 
                      onClick={() => { onSaveRole(roleEditForm); setEditingRoleId(null); }} 
                      style={{ padding: '6px 12px', backgroundColor: '#34c759', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontStyle: 'italic', width: 'fit-content', cursor: 'pointer', marginTop: '4px', lineHeight: 1 }}
                    >
                      Зберегти
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Допоміжний компонент для охайних тумблерів
const PermissionToggle: React.FC<{ label: string; value: boolean; onChange: (val: boolean) => void }> = ({ label, value, onChange }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontStyle: 'italic' }}>
    <span>{label}</span>
    <div
      onClick={() => onChange(!value)}
      style={{ width: '30px', height: '16px', borderRadius: '8px', backgroundColor: value ? '#34c759' : '#e5e5ea', position: 'relative', cursor: 'pointer', flexShrink: 0 }}
    >
      <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#fff', position: 'absolute', top: '2px', left: value ? '16px' : '2px', transition: 'left 0.2s' }} />
    </div>
  </div>
);

const inputStyle: React.CSSProperties = {
  width: '100%',
  height: '24px',
  padding: '2px 6px',
  backgroundColor: '#e5e5ea',
  border: '1px solid #d1d1d6',
  borderRadius: '6px',
  fontSize: '11px',
  fontStyle: 'italic',
  outline: 'none',
  boxSizing: 'border-box',
  color: '#1c1c1e',
  lineHeight: 1
};

const labelStyle: React.CSSProperties = {
  fontSize: '11px',
  color: '#636366',
  marginBottom: '2px',
  display: 'block',
  lineHeight: 1,
  fontStyle: 'italic'
};

const compactPlusBtnStyle: React.CSSProperties = {
  backgroundColor: '#e5e5ea',
  border: '1px solid #d1d1d6',
  borderRadius: '6px',
  width: '24px',
  height: '24px',
  fontSize: '14px',
  lineHeight: 1,
  color: '#1c1c1e',
  padding: 0,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: '0',
  boxSizing: 'border-box'
};

export default TeamManagement;
