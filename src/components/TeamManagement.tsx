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
  roles,
  onSaveRole,
  onDeleteRole,
  availableRoles
}) => {
  const [name, setName] = useState('');
  const [telegramId, setTelegramId] = useState('');
  const [role, setRole] = useState(availableRoles[0] || 'Manager');
  
  // Тумблер для створення (True = повноцінний учасник, False = підрядник)
  const [isFullMember, setIsFullMember] = useState(true);

  // Інлайн-редагування фахівця
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<TeamMember>>({});
  const [editIsFull, setEditIsFull] = useState(true);

  // Блок ролей та прав доступу
  const [isRolesOpen, setIsRolesOpen] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [roleEditForm, setRoleEditForm] = useState<RoleConfig | null>(null);
  const [newRoleName, setNewRoleName] = useState('');

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newMember: TeamMember = {
      id: Date.now().toString(),
      fullName: name.trim(),
      telegramId: isFullMember ? telegramId.trim() : undefined,
      role: isFullMember ? role : 'Contractor',
      active: true
    };

    onUpdateMembers([...members, newMember]);
    setName('');
    setTelegramId('');
  };

  const toggleMemberStatus = (id: string) => {
    onUpdateMembers(members.map(m => m.id === id ? { ...m, active: m.active === false ? true : false } : m));
  };

  const handleSaveEditMember = (id: string) => {
    onUpdateMembers(members.map(m => m.id === id ? {
      ...m,
      ...editForm,
      telegramId: editIsFull ? editForm.telegramId : undefined,
      role: editIsFull ? editForm.role : 'Contractor'
    } : m));
    setEditingId(null);
  };

  const handleCreateNewRole = () => {
    if (!newRoleName.trim()) return;
    const newRole: RoleConfig = {
      id: Date.now().toString(),
      name: newRoleName.trim(),
      permissions: {
        canViewCreateProject: true,
        canViewVor: true,
        canViewAnalytics: true,
        canViewTeam: true,
        canViewSettings: true,
        canSeeAllProjects: true,
        canEditProjects: true,
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
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto', color: '#1c1c1e' }}>
      
      {/* Форма створення фахівця */}
      <form onSubmit={handleAddMember} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px', backgroundColor: '#f2f2f7', padding: '16px', borderRadius: '12px' }}>
        
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <label style={labelStyle}>Full Name</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#636366' }}>
              <span>{isFullMember ? 'Team Member' : 'Contractor'}</span>
              <div
                onClick={() => setIsFullMember(!isFullMember)}
                style={{
                  width: '34px',
                  height: '20px',
                  borderRadius: '10px',
                  backgroundColor: isFullMember ? '#34c759' : '#e5e5ea',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
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
                    left: isFullMember ? '16px' : '2px',
                    transition: 'left 0.2s'
                  }}
                />
              </div>
            </div>
          </div>
          <input
            type="text"
            placeholder="e.g. Ivan Ivanov"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={inputStyle}
          />
        </div>

        {isFullMember && (
          <>
            <div>
              <label style={labelStyle}>Telegram User ID (Digital ID)</label>
              <input
                type="text"
                placeholder="e.g. 492810482"
                value={telegramId}
                onChange={(e) => setTelegramId(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Default Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={inputStyle}
              >
                {availableRoles.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </>
        )}

        <button
          type="submit"
          style={{
            padding: '12px',
            backgroundColor: '#34c759',
            color: '#ffffff',
            border: 'none',
            borderRadius: '10px',
            fontWeight: 700,
            fontSize: '14px',
            cursor: 'pointer',
            marginTop: '4px'
          }}
        >
          Add to Database
        </button>
      </form>

      {/* Список фахівців */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
        {members.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#8e8e93', fontSize: '13px', marginTop: '10px' }}>
            No team members added yet.
          </div>
        ) : (
          members.map((m) => {
            const isEditing = editingId === m.id;

            return (
              <div
                key={m.id}
                style={{
                  padding: '12px 14px',
                  borderRadius: '10px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e5ea',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <div style={{ flex: 1 }}>
                  {isEditing ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <input
                        type="text"
                        value={editForm.fullName !== undefined ? editForm.fullName : m.fullName}
                        onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                        style={{ ...inputStyle, padding: '6px 8px', fontSize: '12px' }}
                      />
                      {editIsFull && (
                        <>
                          <input
                            type="text"
                            value={editForm.telegramId !== undefined ? editForm.telegramId : (m.telegramId || '')}
                            onChange={(e) => setEditForm({ ...editForm, telegramId: e.target.value })}
                            placeholder="Telegram ID"
                            style={{ ...inputStyle, padding: '6px 8px', fontSize: '12px' }}
                          />
                          <select
                            value={editForm.role || m.role}
                            onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                            style={{ ...inputStyle, padding: '6px 8px', fontSize: '12px' }}
                          >
                            {availableRoles.map(r => <option key={r} value={r}>{r}</option>)}
                          </select>
                        </>
                      )}
                      <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                        <button
                          type="button"
                          onClick={() => handleSaveEditMember(m.id)}
                          style={{ padding: '4px 10px', backgroundColor: '#34c759', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          style={{ padding: '4px 10px', backgroundColor: '#e5e5ea', color: '#1c1c1e', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '14px', color: '#1c1c1e' }}>{m.fullName}</div>
                      <div style={{ fontSize: '12px', color: '#8e8e93', marginTop: '2px' }}>
                        {m.role} {m.telegramId ? `• ID: ${m.telegramId}` : '• Contractor / Stats only'}
                      </div>
                    </div>
                  )}
                </div>

                {!isEditing && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(m.id);
                      setEditForm(m);
                      setEditIsFull(!!m.telegramId || m.role !== 'Contractor');
                    }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', padding: '4px' }}
                    title="Edit"
                  >
                    ✏️
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => onUpdateMembers(members.filter(item => item.id !== m.id))}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', padding: '4px', color: '#ff3b30' }}
                  title="Delete"
                >
                  🗑️
                </button>

                <div
                  onClick={() => toggleMemberStatus(m.id)}
                  style={{
                    width: '36px',
                    height: '20px',
                    borderRadius: '10px',
                    backgroundColor: m.active !== false ? '#34c759' : '#e5e5ea',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                    flexShrink: 0
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
                      left: m.active !== false ? '18px' : '2px',
                      transition: 'left 0.2s'
                    }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Блок управління ролями та правами доступу (Roles & Permissions Management) */}
      <div style={{ backgroundColor: '#f2f2f7', padding: '14px', borderRadius: '12px' }}>
        <div
          onClick={() => setIsRolesOpen(!isRolesOpen)}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', color: '#8e8e93' }}>{isRolesOpen ? '▼' : '▲'}</span>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#1c1c1e' }}>Roles & Permissions Management</span>
          </div>
        </div>

        {isRolesOpen && (
          <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            
            {/* Форма створення нової ролі */}
            <div style={{ display: 'flex', gap: '6px' }}>
              <input
                type="text"
                placeholder="New role name..."
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                style={{ ...inputStyle, padding: '8px 10px', fontSize: '12px', flex: 1 }}
              />
              <button
                type="button"
                onClick={handleCreateNewRole}
                style={{ padding: '8px 12px', backgroundColor: '#007aff', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
              >
                Add Role
              </button>
            </div>

            {/* Список існуючих ролей з можливістю редагування/видалення */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {roles.map((r) => (
                <div key={r.id} style={{ backgroundColor: '#ffffff', padding: '12px', borderRadius: '8px', border: '1px solid #e5e5ea', color: '#1c1c1e' }}>
                  <div style={{ fontWeight: 600, fontSize: '13px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{r.name}</span>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingRoleId(editingRoleId === r.id ? null : r.id);
                          setRoleEditForm(r);
                        }}
                        style={{ background: 'none', border: 'none', color: '#007aff', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
                      >
                        {editingRoleId === r.id ? 'Close' : 'Edit'}
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteRole(r.id)}
                        style={{ background: 'none', border: 'none', color: '#ff3b30', cursor: 'pointer', fontSize: '12px' }}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  {editingRoleId === r.id && roleEditForm && (
                    <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #f2f2f7', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#1c1c1e', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={roleEditForm.permissions.canViewAnalytics}
                          onChange={(e) => setRoleEditForm({
                            ...roleEditForm,
                            permissions: { ...roleEditForm.permissions, canViewAnalytics: e.target.checked }
                          })}
                        />
                        Can view analytics
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#1c1c1e', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={roleEditForm.permissions.canEditProjects}
                          onChange={(e) => setRoleEditForm({
                            ...roleEditForm,
                            permissions: { ...roleEditForm.permissions, canEditProjects: e.target.checked }
                          })}
                        />
                        Can edit projects
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          onSaveRole(roleEditForm);
                          setEditingRoleId(null);
                        }}
                        style={{ padding: '6px 12px', backgroundColor: '#34c759', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, marginTop: '6px', width: 'fit-content' }}
                      >
                        Save Role
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

          </div>
        )}
      </div>

    </div>
  );
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px',
  backgroundColor: '#ffffff',
  border: '1px solid #d1d1d6',
  borderRadius: '8px',
  fontSize: '13px',
  outline: 'none',
  boxSizing: 'border-box',
  color: '#1c1c1e'
};

const labelStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#636366',
  marginBottom: '4px',
  display: 'block',
  fontWeight: 600
};

export default TeamManagement;
