import React, { useState } from 'react';
import { TeamMember, RoleConfig, RolePermissions } from '../App';

interface TeamManagementProps {
  teamMembers: TeamMember[];
  onSaveTeamMember: (member: TeamMember) => void;
  onDeleteTeamMember: (id: string) => void;
  roles: RoleConfig[];
  onSaveRole: (role: RoleConfig) => void;
  onDeleteRole: (roleId: string) => void;
  isSuperAdmin: boolean;
}

const DEFAULT_PERMISSIONS: RolePermissions = {
  canViewCreateProject: false,
  canViewVor: true,
  canViewAnalytics: false,
  canViewTeam: false,
  canViewSettings: false,
  canSeeAllProjects: false,
  canEditProjects: false,
  canDeleteProjects: false,
  canManageStages: true,
  canManageTimer: true,
  canAssignTeam: false,
};

export const TeamManagement: React.FC<TeamManagementProps> = ({
  teamMembers,
  onSaveTeamMember,
  onDeleteTeamMember,
  roles,
  onSaveRole,
  onDeleteRole,
  isSuperAdmin
}) => {
  // Форма співробітника
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [fullName, setFullName] = useState('');
  const [telegramUserId, setTelegramUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>(roles[0]?.name || 'Кресляр');
  const [isActive, setIsActive] = useState<boolean>(true);

  // Секція керування ролями
  const [isRolesSectionOpen, setIsRolesSectionOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [editingRole, setEditingRole] = useState<RoleConfig | null>(null);

  const handleResetForm = () => {
    setEditingMemberId(null);
    setFullName('');
    setTelegramUserId('');
    setSelectedRole(roles[0]?.name || 'Кресляр');
    setIsActive(true);
  };

  const handleEditClick = (m: TeamMember) => {
    setEditingMemberId(m.id);
    setFullName(m.fullName);
    setTelegramUserId(m.telegramUserId || '');
    setSelectedRole(m.role);
    setIsActive(m.isActive !== false);
  };

  const handleSubmitMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    onSaveTeamMember({
      id: editingMemberId || Date.now().toString(),
      fullName: fullName.trim(),
      telegramUserId: telegramUserId.trim() || undefined,
      role: selectedRole,
      isActive
    });

    handleResetForm();
  };

  const handleCreateRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;

    const newRole: RoleConfig = {
      id: Date.now().toString(),
      name: newRoleName.trim(),
      permissions: { ...DEFAULT_PERMISSIONS }
    };

    onSaveRole(newRole);
    setNewRoleName('');
  };

  const handleTogglePermission = (role: RoleConfig, key: keyof RolePermissions) => {
    const updated: RoleConfig = {
      ...role,
      permissions: {
        ...role.permissions,
        [key]: !role.permissions[key]
      }
    };
    onSaveRole(updated);
    if (editingRole?.id === role.id) {
      setEditingRole(updated);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto', color: '#1c1c1e' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>Команда (База співробітників)</h2>

      {/* Форма додавання / редагування співробітника */}
      <form onSubmit={handleSubmitMember} style={{ backgroundColor: '#f2f2f7', padding: '16px', borderRadius: '12px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <h4 style={{ margin: 0, fontSize: '15px' }}>{editingMemberId ? '✏️ Редагувати співробітника' : '➕ Додати співробітника'}</h4>
        
        <div>
          <label style={labelStyle}>Ім'я та прізвище</label>
          <input type="text" placeholder="напр. Іван Іванов" value={fullName} onChange={(e) => setFullName(e.target.value)} required style={inputStyle} />
        </div>

        <div>
          <label style={labelStyle}>Telegram User ID (Цифровий ID)</label>
          <input type="text" placeholder="напр. 492810482" value={telegramUserId} onChange={(e) => setTelegramUserId(e.target.value)} style={inputStyle} />
          <span style={{ fontSize: '11px', color: '#8e8e93' }}>Перепишіть ID у разі зміни акаунта працівника для збереження історії.</span>
        </div>

        <div>
          <label style={labelStyle}>Роль за замовчуванням</label>
          <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} style={inputStyle}>
            {roles.map((r) => (
              <option key={r.id} value={r.name}>{r.name}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
          <label style={{ fontSize: '13px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            Активний співробітник (бачить систему та доступний у проектах)
          </label>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
          <button type="submit" style={{ ...btnStyle, backgroundColor: '#34c759', color: '#fff', flex: 1 }}>
            {editingMemberId ? 'Зберегти зміни' : 'Додати в базу'}
          </button>
          {editingMemberId && (
            <button type="button" onClick={handleResetForm} style={{ ...btnStyle, backgroundColor: '#e5e5ea', color: '#1c1c1e' }}>
              Скасувати
            </button>
          )}
        </div>
      </form>

      {/* Список збережених співробітників */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
        <h4 style={{ margin: '0 0 6px 0', fontSize: '15px' }}>Список фахівців ({teamMembers.length})</h4>
        {teamMembers.length === 0 ? (
          <div style={{ fontSize: '13px', color: '#8e8e93' }}>Співробітників ще не додано.</div>
        ) : (
          teamMembers.map((m) => (
            <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', backgroundColor: m.isActive !== false ? '#f9f9f9' : '#f2f2f7', borderRadius: '8px', borderLeft: m.isActive !== false ? '4px solid #34c759' : '4px solid #8e8e93' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '14px' }}>
                  {m.fullName} {m.isActive === false && <span style={{ fontSize: '11px', color: '#ff3b30' }}>(Неактивний)</span>}
                </div>
                <div style={{ fontSize: '12px', color: '#636366' }}>
                  {m.role} {m.telegramUserId && `• ID: ${m.telegramUserId}`}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={() => handleEditClick(m)} style={iconBtnStyle}>✏️</button>
                <button onClick={() => onDeleteTeamMember(m.id)} style={{ ...iconBtnStyle, color: '#ff3b30' }}>✕</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Блок налаштування ролей та прав доступу (сірим текстом) */}
      <div style={{ borderTop: '1px solid #e5e5ea', paddingTop: '16px' }}>
        <div 
          onClick={() => setIsRolesSectionOpen(!isRolesSectionOpen)}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#8e8e93' }}
        >
          <span style={{ fontSize: '13px', fontWeight: 500 }}>⚙️ Редагування ролей та прав доступу</span>
          <span style={{ fontSize: '12px' }}>{isRolesSectionOpen ? '▲' : '▼'}</span>
        </div>

        {isRolesSectionOpen && (
          <div style={{ marginTop: '12px', backgroundColor: '#f9f9f9', padding: '12px', borderRadius: '10px' }}>
            <form onSubmit={handleCreateRole} style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
              <input
                type="text"
                placeholder="Нова роль (напр. 3D-моделер)"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                style={{ ...inputStyle, fontSize: '13px' }}
              />
              <button type="submit" style={{ ...btnStyle, backgroundColor: '#007aff', color: '#fff', fontSize: '13px' }}>Додати</button>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {roles.map((r) => (
                <div key={r.id} style={{ padding: '10px', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e5e5ea' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 600, fontSize: '14px' }}>{r.name}</span>
                    <button onClick={() => setEditingRole(editingRole?.id === r.id ? null : r)} style={{ ...btnStyle, backgroundColor: '#e5e5ea', fontSize: '12px', padding: '4px 8px' }}>
                      {editingRole?.id === r.id ? 'Сховати права' : '⚙️ Налаштувати права'}
                    </button>
                  </div>

                  {/* Матриця тоглів (прав доступу для кожної ролі) */}
                  {editingRole?.id === r.id && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #f2f2f7', fontSize: '12px' }}>
                      <label style={toggleLabelStyle}>
                        <input type="checkbox" checked={r.permissions.canSeeAllProjects} onChange={() => handleTogglePermission(r, 'canSeeAllProjects')} />
                        Бачити всі проекти (інакше тільки призначені)
                      </label>
                      <label style={toggleLabelStyle}>
                        <input type="checkbox" checked={r.permissions.canEditProjects} onChange={() => handleTogglePermission(r, 'canEditProjects')} />
                        Створювати та редагувати проекти
                      </label>
                      <label style={toggleLabelStyle}>
                        <input type="checkbox" checked={r.permissions.canDeleteProjects} onChange={() => handleTogglePermission(r, 'canDeleteProjects')} />
                        Переміщувати проекти в Кошик
                      </label>
                      <label style={toggleLabelStyle}>
                        <input type="checkbox" checked={r.permissions.canManageStages} onChange={() => handleTogglePermission(r, 'canManageStages')} />
                        Керувати стадіями та задачами
                      </label>
                      <label style={toggleLabelStyle}>
                        <input type="checkbox" checked={r.permissions.canManageTimer} onChange={() => handleTogglePermission(r, 'canManageTimer')} />
                        Керувати таймером роботи
                      </label>
                      <label style={toggleLabelStyle}>
                        <input type="checkbox" checked={r.permissions.canAssignTeam} onChange={() => handleTogglePermission(r, 'canAssignTeam')} />
                        Призначати склад команди в проекті
                      </label>
                      <label style={toggleLabelStyle}>
                        <input type="checkbox" checked={r.permissions.canViewVor} onChange={() => handleTogglePermission(r, 'canViewVor')} />
                        Доступ до вкладки ВОР
                      </label>
                      <label style={toggleLabelStyle}>
                        <input type="checkbox" checked={r.permissions.canViewAnalytics} onChange={() => handleTogglePermission(r, 'canViewAnalytics')} />
                        Доступ до вкладки Аналітика
                      </label>
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

const inputStyle: React.CSSProperties = { width: '100%', padding: '8px 10px', backgroundColor: '#ffffff', border: '1px solid #e5e5ea', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' };
const labelStyle: React.CSSProperties = { fontSize: '12px', fontWeight: 500, color: '#636366', marginBottom: '2px', display: 'block' };
const btnStyle: React.CSSProperties = { padding: '8px 12px', borderRadius: '8px', border: 'none', fontWeight: 600, fontSize: '13px', cursor: 'pointer' };
const iconBtnStyle: React.CSSProperties = { background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', padding: '2px' };
const toggleLabelStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: '#1c1c1e' };
