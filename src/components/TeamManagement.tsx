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
  const [role, setRole] = useState(availableRoles[0] || 'Керівник');
  
  // Тумблер для створення (True = повноцінний учасник з роллю та ID, False = підрядник лише з ім'ям)
  const [isFullMember, setIsFullMember] = useState(true);

  // Інлайн-редагування фахівця
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<TeamMember>>({});
  const [editIsFull, setEditIsFull] = useState(true);

  // Управління ролями та правами
  const [isRolesOpen, setIsRolesOpen] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [roleEditForm, setRoleEditForm] = useState<RoleConfig | null>(null);

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newMember: TeamMember = {
      id: Date.now().toString(),
      fullName: name.trim(),
      telegramId: isFullMember ? telegramId.trim() : undefined,
      role: isFullMember ? role : 'Підрядник',
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
      role: editIsFull ? editForm.role : 'Підрядник'
    } : m));
    setEditingId(null);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto', color: '#1c1c1e' }}>
      
      {/* Форма створення фахівця з тумблером праворуч від Full Name */}
      <form onSubmit={handleAddMember} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px', backgroundColor: '#f2f2f7', padding: '16px', borderRadius: '12px' }}>
        
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <label style={labelStyle}>Full Name</label>
            {/* Тумблер створення (учасник з роллю / підрядник) */}
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

        {/* Поля з'являються лише якщо тумблер увімкнено */}
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

      {/* Список фахівців (без трикутника зліва) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '30px' }}>
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

                {/* Кнопка олівця */}
                {!isEditing && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(m.id);
                      setEditForm(m);
                      setEditIsFull(!!m.telegramId || m.role !== 'Підрядник');
                    }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', padding: '4px' }}
                    title="Edit"
                  >
                    ✏️
                  </button>
                )}

                {/* Кошик видалення */}
                <button
                  type="button"
                  onClick={() => onUpdateMembers(members.filter(item => item.id !== m.id))}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', padding: '4px', color: '#ff3b30' }}
                  title="Delete"
                >
                  🗑️
                </button>

                {/* Тумблер активності фахівця */}
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

      {/* Блок налаштування ролей та прав доступу (Permissions Matrix) */}
      <div style={{ backgroundColor: '#f2f2f7', padding: '14px', borderRadius: '12px' }}>
        <div
          onClick={() => setIsRolesOpen(!isRolesOpen)}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', color: '#8e8e93' }}>{isRolesOpen ? '▼' : '▲'}</span>
            <span style={{ fontSize: '14px', fontWeight: 700 }}>Редагування ролей та прав доступу</span>
          </div>
        </div>

        {isRolesOpen && (
          <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {roles.map((r) => (
              <div key={r.id} style={{ backgroundColor: '#ffffff', padding: '10px', borderRadius: '8px', border: '1px solid #e5e5ea', fontSize: '13px' }}>
                <div style={{ fontWeight: 600, marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{r.name}</span>
                  <button
                    onClick={() => {
                      setEditingRoleId(r.id);
                      setRoleEditForm(r);
                    }}
                    style={{ background: 'none', border: 'none', color: '#007aff', cursor: 'pointer', fontSize: '12px' }}
                  >
                    Edit Permissions
                  </button>
                </div>

                {editingRoleId === r.id && roleEditForm && (
                  <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #f2f2f7', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
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
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
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
                      onClick={() => {
                        onSaveRole(roleEditForm);
                        setEditingRoleId(null);
                      }}
                      style={{ padding: '6px', backgroundColor: '#007aff', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, marginTop: '4px' }}
                    >
                      Save Role
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
