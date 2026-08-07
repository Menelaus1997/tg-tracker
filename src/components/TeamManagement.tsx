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
  const [role, setRole] = useState('');
  const [isTeamMember, setIsTeamMember] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<TeamMember>>({});
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(true);
  const [isRolesOpen, setIsRolesOpen] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [roleEditForm, setRoleEditForm] = useState<RoleConfig | null>(null);
  const [editingRoleNameId, setEditingRoleNameId] = useState<string | null>(null);
  const [tempRoleName, setTempRoleName] = useState('');
  const [newRoleName, setNewRoleName] = useState('');
  
  // Тумблер "Болванка" для ролей
  const [isRolePlaceholder, setIsRolePlaceholder] = useState(false);

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newMember: TeamMember = {
      id: Date.now().toString(),
      fullName: name.trim(),
      telegramId: isTeamMember && telegramId.trim() ? telegramId.trim() : undefined,
      role: isTeamMember && role ? role : '',
      active: true
    };

    onUpdateMembers([...members, newMember]);
    setName('');
    setTelegramId('');
    setRole('');
    setIsTeamMember(false);
  };

  const toggleMemberStatus = (id: string) => {
    onUpdateMembers(members.map(m => m.id === id ? { ...m, active: m.active === false ? true : false } : m));
  };

  const handleSaveEditMember = (id: string) => {
    onUpdateMembers(members.map(m => m.id === id ? { ...m, ...editForm } : m));
    setEditingId(null);
  };

  const handleCreateNewRole = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;
    const newRole: RoleConfig = {
      id: Date.now().toString(),
      name: newRoleName.trim(),
      // Зберігаємо також мітку болванки в конфіг ролі, якщо потрібно
      isPlaceholder: isRolePlaceholder,
      permissions: { canViewCreateProject: true, canViewVor: true, canViewAnalytics: true, canViewTeam: true, canViewSettings: true, canSeeAllProjects: true, canEditProjects: true, canDeleteProjects: true, canManageStages: true, canManageTimer: true, canAssignTeam: true }
    };
    onSaveRole(newRole);
    setNewRoleName('');
    setIsRolePlaceholder(false);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto', color: '#1c1c1e' }}>
      
      {/* Форма створення фахівця */}
      <form onSubmit={handleAddMember} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px', backgroundColor: '#f2f2f7', padding: '16px', borderRadius: '12px' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label style={labelStyle}>Full Name</label>
            <div
              onClick={() => setIsTeamMember(!isTeamMember)}
              style={{ width: '36px', height: '20px', borderRadius: '10px', backgroundColor: isTeamMember ? '#34c759' : '#e5e5ea', position: 'relative', cursor: 'pointer' }}
            >
              <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#fff', position: 'absolute', top: '2px', left: isTeamMember ? '18px' : '2px', transition: 'left 0.2s' }} />
            </div>
          </div>
          <input type="text" placeholder="e.g. Ivan Ivanov" value={name} onChange={(e) => setName(e.target.value)} required style={inputStyle} />
        </div>

        {isTeamMember && (
          <>
            <input type="text" placeholder="Telegram User ID" value={telegramId} onChange={(e) => setTelegramId(e.target.value)} style={inputStyle} />
            <select value={role} onChange={(e) => setRole(e.target.value)} style={inputStyle}>
              <option value="">Select role...</option>
              {availableRoles.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </>
        )}

        <button type="submit" style={{ padding: '12px', backgroundColor: '#34c759', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}>Add to Database</button>
      </form>

      {/* Список учасників */}
      <div style={{ backgroundColor: '#f2f2f7', padding: '12px 14px', borderRadius: '12px', marginBottom: '20px' }}>
        <div onClick={() => setIsParticipantsOpen(!isParticipantsOpen)} style={{ cursor: 'pointer', textAlign: 'center', fontSize: '14px', fontWeight: 700, color: '#8e8e93' }}>Participants</div>
        {isParticipantsOpen && members.map((m) => {
          const validRole = m.role && m.role !== 'Підрядник' && m.role !== 'Contractor' ? m.role : '';
          const isEditing = editingId === m.id;

          return (
            <div key={m.id} style={{ padding: '12px', borderRadius: '10px', backgroundColor: '#ffffff', marginTop: '10px', border: '1px solid #e5e5ea' }}>
              {isEditing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <input type="text" value={editForm.fullName || ''} onChange={(e) => setEditForm({...editForm, fullName: e.target.value})} style={inputStyle} />
                  <input type="text" placeholder="Telegram ID" value={editForm.telegramId || ''} onChange={(e) => setEditForm({...editForm, telegramId: e.target.value})} style={inputStyle} />
                  <select value={editForm.role || ''} onChange={(e) => setEditForm({...editForm, role: e.target.value})} style={inputStyle}>
                    <option value="">Select role...</option>
                    {availableRoles.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                    <button type="button" onClick={() => handleSaveEditMember(m.id)} style={{ padding: '4px 10px', backgroundColor: '#34c759', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>Save</button>
                    <button type="button" onClick={() => setEditingId(null)} style={{ padding: '4px 10px', backgroundColor: '#e5e5ea', color: '#1c1c1e', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => { setEditingId(m.id); setEditForm(m); }}>
                    <div style={{ fontWeight: 600 }}>{m.fullName}</div>
                    {(validRole || m.telegramId) && (
                      <div style={{ fontSize: '12px', color: '#8e8e93' }}>{validRole ? `${validRole} ` : ''}{m.telegramId ? `• ID: ${m.telegramId}` : ''}</div>
                    )}
                  </div>
                  <button type="button" onClick={() => onUpdateMembers(members.filter(i => i.id !== m.id))} style={{ background: 'none', border: 'none', color: '#ff3b30', cursor: 'pointer', marginRight: '8px' }}>🗑️</button>
                  <div
                    onClick={() => toggleMemberStatus(m.id)}
                    style={{ width: '36px', height: '20px', borderRadius: '10px', backgroundColor: m.active !== false ? '#34c759' : '#e5e5ea', position: 'relative', cursor: 'pointer', flexShrink: 0 }}
                  >
                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#fff', position: 'absolute', top: '2px', left: m.active !== false ? '18px' : '2px', transition: 'left 0.2s' }} />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Управління ролями (з тумблером "Болванка") */}
      <div style={{ backgroundColor: '#f2f2f7', padding: '14px', borderRadius: '12px' }}>
        <div onClick={() => setIsRolesOpen(!isRolesOpen)} style={{ cursor: 'pointer', textAlign: 'center', fontWeight: 700, color: '#8e8e93' }}>Roles & Permissions Management</div>
        {isRolesOpen && (
          <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            
            {/* Поля створення нової ролі + Тумблер "Болванка" */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', backgroundColor: '#fff', padding: '10px', borderRadius: '8px', border: '1px solid #e5e5ea' }}>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <input type="text" placeholder="New role name..." value={newRoleName} onChange={(e) => setNewRoleName(e.target.value)} style={{ ...inputStyle, padding: '8px 10px', flex: 1 }} />
                <button 
                  type="button" 
                  onClick={handleCreateNewRole} 
                  style={{ width: '28px', height: '28px', backgroundColor: '#e5e5ea', color: '#1c1c1e', border: 'none', borderRadius: '6px', fontSize: '16px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                  title="Add Role"
                >
                  +
                </button>
              </div>

              {/* Тумблер Болванка */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', paddingTop: '4px' }}>
                <span style={{ fontWeight: 600, color: '#636366' }}>Болванка</span>
                <div
                  onClick={() => setIsRolePlaceholder(!isRolePlaceholder)}
                  style={{ width: '36px', height: '20px', borderRadius: '10px', backgroundColor: isRolePlaceholder ? '#34c759' : '#e5e5ea', position: 'relative', cursor: 'pointer', flexShrink: 0 }}
                >
                  <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#fff', position: 'absolute', top: '2px', left: isRolePlaceholder ? '18px' : '2px', transition: 'left 0.2s' }} />
                </div>
              </div>
            </div>

            {roles.map(r => (
              <div key={r.id} style={{ backgroundColor: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid #e5e5ea' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  
                  {editingRoleNameId === r.id ? (
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flex: 1, marginRight: '10px' }}>
                      <input 
                        type="text" 
                        value={tempRoleName} 
                        onChange={(e) => setTempRoleName(e.target.value)} 
                        style={{ ...inputStyle, padding: '4px 8px', fontSize: '13px' }} 
                      />
                      <button 
                        type="button" 
                        onClick={() => {
                          if (tempRoleName.trim()) {
                            onSaveRole({ ...r, name: tempRoleName.trim() });
                          }
                          setEditingRoleNameId(null);
                        }} 
                        style={{ padding: '4px 8px', backgroundColor: '#34c759', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}
                      >
                        OK
                      </button>
                    </div>
                  ) : (
                    <span 
                      style={{ fontWeight: 600, fontSize: '13px', cursor: 'pointer', flex: 1 }} 
                      onClick={() => {
                        setEditingRoleNameId(r.id);
                        setTempRoleName(r.name);
                      }}
                      title="Click to rename role"
                    >
                      {r.name} {r.isPlaceholder && <span style={{ fontSize: '10px', color: '#8e8e93', fontWeight: 400 }}>(Болванка)</span>}
                    </span>
                  )}

                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <button type="button" onClick={() => { setEditingRoleId(editingRoleId === r.id ? null : r.id); setRoleEditForm(r); }} style={{ background: 'none', border: 'none', color: '#8e8e93', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                      {editingRoleId === r.id ? 'Close' : 'Edit'}
                    </button>
                    <button type="button" onClick={() => onDeleteRole(r.id)} style={{ background: 'none', border: 'none', color: '#ff3b30', fontSize: '12px', cursor: 'pointer' }} title="Delete">
                      🗑️
                    </button>
                  </div>
                </div>

                {editingRoleId === r.id && roleEditForm && (
                  <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #f2f2f7', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
                    
                    {/* Тумблер Болванка при редагуванні існуючої ролі */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, color: '#636366' }}>Болванка</span>
                      <div
                        onClick={() => setRoleEditForm({ ...roleEditForm, isPlaceholder: !roleEditForm.isPlaceholder })}
                        style={{ width: '36px', height: '20px', borderRadius: '10px', backgroundColor: roleEditForm.isPlaceholder ? '#34c759' : '#e5e5ea', position: 'relative', cursor: 'pointer' }}
                      >
                        <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#fff', position: 'absolute', top: '2px', left: roleEditForm.isPlaceholder ? '18px' : '2px', transition: 'left 0.2s' }} />
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Can view analytics</span>
                      <div
                        onClick={() => setRoleEditForm({ ...roleEditForm, permissions: { ...roleEditForm.permissions, canViewAnalytics: !(roleEditForm.permissions?.canViewAnalytics ?? false) } })}
                        style={{ width: '36px', height: '20px', borderRadius: '10px', backgroundColor: (roleEditForm.permissions?.canViewAnalytics ?? false) ? '#34c759' : '#e5e5ea', position: 'relative', cursor: 'pointer' }}
                      >
                        <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#fff', position: 'absolute', top: '2px', left: (roleEditForm.permissions?.canViewAnalytics ?? false) ? '18px' : '2px', transition: 'left 0.2s' }} />
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Can edit projects</span>
                      <div
                        onClick={() => setRoleEditForm({ ...roleEditForm, permissions: { ...roleEditForm.permissions, canEditProjects: !(roleEditForm.permissions?.canEditProjects ?? false) } })}
                        style={{ width: '36px', height: '20px', borderRadius: '10px', backgroundColor: (roleEditForm.permissions?.canEditProjects ?? false) ? '#34c759' : '#e5e5ea', position: 'relative', cursor: 'pointer' }}
                      >
                        <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#fff', position: 'absolute', top: '2px', left: (roleEditForm.permissions?.canEditProjects ?? false) ? '18px' : '2px', transition: 'left 0.2s' }} />
                      </div>
                    </div>

                    <button type="button" onClick={() => { onSaveRole(roleEditForm); setEditingRoleId(null); }} style={{ padding: '6px 12px', backgroundColor: '#34c759', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 600, width: 'fit-content', cursor: 'pointer' }}>Save</button>
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

const inputStyle: React.CSSProperties = { width: '100%', padding: '10px', backgroundColor: '#ffffff', border: '1px solid #d1d1d6', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box', color: '#1c1c1e' };
const labelStyle: React.CSSProperties = { fontSize: '12px', color: '#636366', fontWeight: 600 };

export default TeamManagement;
