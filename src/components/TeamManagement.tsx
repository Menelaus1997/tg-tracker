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
  const [newRoleName, setNewRoleName] = useState('');

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Створюємо учасника. ID та Роль - лише якщо заповнені
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
      permissions: { canViewCreateProject: true, canViewVor: true, canViewAnalytics: true, canViewTeam: true, canViewSettings: true, canSeeAllProjects: true, canEditProjects: true, canDeleteProjects: true, canManageStages: true, canManageTimer: true, canAssignTeam: true }
    };
    onSaveRole(newRole);
    setNewRoleName('');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto', color: '#1c1c1e' }}>
      
      <form onSubmit={handleAddMember} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px', backgroundColor: '#f2f2f7', padding: '16px', borderRadius: '12px' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label style={labelStyle}>Full Name</label>
            {/* Тільки тумблер, без тексту */}
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
      <div style={{ backgroundColor: '#f2f2f7', padding: '12px 14px', borderRadius: '12px' }}>
        <div onClick={() => setIsParticipantsOpen(!isParticipantsOpen)} style={{ cursor: 'pointer', textAlign: 'center', fontSize: '14px', fontWeight: 700, color: '#8e8e93' }}>Participants</div>
        {isParticipantsOpen && members.map((m) => (
          <div key={m.id} style={{ padding: '12px', borderRadius: '10px', backgroundColor: '#ffffff', marginTop: '10px', border: '1px solid #e5e5ea' }}>
            {editingId === m.id ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <input type="text" value={editForm.fullName} onChange={(e) => setEditForm({...editForm, fullName: e.target.value})} style={inputStyle} />
                <input type="text" placeholder="Telegram ID" value={editForm.telegramId || ''} onChange={(e) => setEditForm({...editForm, telegramId: e.target.value})} style={inputStyle} />
                <select value={editForm.role || ''} onChange={(e) => setEditForm({...editForm, role: e.target.value})} style={inputStyle}>
                  <option value="">Select role...</option>
                  {availableRoles.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <button onClick={() => handleSaveEditMember(m.id)} style={{ backgroundColor: '#34c759', border: 'none', color: '#fff', borderRadius: '6px', padding: '6px' }}>Save</button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => { setEditingId(m.id); setEditForm(m); }}>
                  <div style={{ fontWeight: 600 }}>{m.fullName}</div>
                  <div style={{ fontSize: '12px', color: '#8e8e93' }}>{m.role || ''} {m.telegramId ? `• ID: ${m.telegramId}` : ''}</div>
                </div>
                <button onClick={() => onUpdateMembers(members.filter(i => i.id !== m.id))} style={{ background: 'none', border: 'none', color: '#ff3b30', cursor: 'pointer' }}>🗑️</button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Ролі (без трикутників) */}
      <div style={{ backgroundColor: '#f2f2f7', padding: '14px', borderRadius: '12px', marginTop: '20px' }}>
        <div onClick={() => setIsRolesOpen(!isRolesOpen)} style={{ cursor: 'pointer', textAlign: 'center', fontWeight: 700, color: '#8e8e93' }}>Roles & Permissions Management</div>
        {isRolesOpen && (
          <div style={{ marginTop: '10px' }}>
             {roles.map(r => (
               <div key={r.id} style={{ backgroundColor: '#fff', padding: '10px', marginBottom: '6px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
                 <span>{r.name}</span>
                 <button onClick={() => { setEditingRoleId(r.id); setRoleEditForm(r); }} style={{ background: 'none', border: 'none', color: '#8e8e93', fontSize: '12px', fontWeight: 600 }}>Edit</button>
               </div>
             ))}
          </div>
        )}
      </div>
    </div>
  );
};

const inputStyle: React.CSSProperties = { width: '100%', padding: '10px', backgroundColor: '#ffffff', border: '1px solid #d1d1d6', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box' };
const labelStyle: React.CSSProperties = { fontSize: '12px', color: '#636366', fontWeight: 600 };

export default TeamManagement;
