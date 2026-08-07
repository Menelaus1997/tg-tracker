import React, { useState } from 'react';
import { TeamMember } from '../App';

interface TeamManagementProps {
  members: TeamMember[];
  onUpdateMembers: (members: TeamMember[]) => void;
  availableRoles: string[];
}

export const TeamManagement: React.FC<TeamManagementProps> = ({ members, onUpdateMembers, availableRoles }) => {
  const [name, setName] = useState('');
  const [telegramId, setTelegramId] = useState('');
  const [role, setRole] = useState(availableRoles[0] || 'Draftsman');

  // Інлайн-редагування
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<TeamMember>>({});

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newMember: TeamMember = {
      id: Date.now().toString(),
      fullName: name.trim(),
      telegramId: telegramId.trim(),
      role,
      active: true // Тумблер активний за замовчуванням
    };

    onUpdateMembers([...members, newMember]);
    setName('');
    setTelegramId('');
  };

  const toggleStatus = (id: string) => {
    onUpdateMembers(members.map(m => m.id === id ? { ...m, active: !m.active } : m));
  };

  const handleSaveEdit = (id: string) => {
    onUpdateMembers(members.map(m => m.id === id ? { ...m, ...editForm } : m));
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    onUpdateMembers(members.filter(m => m.id !== id));
  };

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto', color: '#1c1c1e' }}>
      {/* Форма додавання нового фахівця */}
      <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px', backgroundColor: '#f2f2f7', padding: '16px', borderRadius: '12px' }}>
        <div>
          <label style={labelStyle}>Full Name</label>
          <input
            type="text"
            placeholder="e.g. Ivan Ivanov"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Telegram User ID (Digital ID)</label>
          <input
            type="text"
            placeholder="e.g. 492810482 (optional for stats)"
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

      {/* Список фахівців (без заголовка та без шестерні) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
                {/* Трикутник згортання перенесено на лівий бік */}
                <span style={{ fontSize: '10px', color: '#8e8e93', cursor: 'pointer' }}>▼</span>

                <div style={{ flex: 1 }}>
                  {isEditing ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <input
                        type="text"
                        value={editForm.fullName !== undefined ? editForm.fullName : m.fullName}
                        onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                        style={{ ...inputStyle, padding: '6px 8px', fontSize: '12px' }}
                      />
                      <input
                        type="text"
                        value={editForm.telegramId !== undefined ? editForm.telegramId : m.telegramId}
                        onChange={(e) => setEditForm({ ...editForm, telegramId: e.target.value })}
                        placeholder="Telegram ID"
                        style={{ ...inputStyle, padding: '6px 8px', fontSize: '12px' }}
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(m.id)}
                        style={{ padding: '4px 8px', backgroundColor: '#34c759', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', width: 'fit-content' }}
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    /* Інлайн-редагування за кліком на текст або олівець */
                    <div
                      onClick={() => {
                        setEditingId(m.id);
                        setEditForm(m);
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      <div style={{ fontWeight: 600, fontSize: '14px', color: '#1c1c1e' }}>{m.fullName}</div>
                      <div style={{ fontSize: '12px', color: '#8e8e93', marginTop: '2px' }}>
                        {m.role} {m.telegramId ? `• ID: ${m.telegramId}` : '• No ID (Stats only)'}
                      </div>
                    </div>
                  )}
                </div>

                {/* Кнопка олівця для редагування */}
                {!isEditing && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(m.id);
                      setEditForm(m);
                    }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', padding: '4px' }}
                    title="Edit"
                  >
                    ✏️
                  </button>
                )}

                {/* Кнопка видалення (кошик) */}
                <button
                  type="button"
                  onClick={() => handleDelete(m.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', padding: '4px', color: '#ff3b30' }}
                  title="Delete"
                >
                  🗑️
                </button>

                {/* Тумблер On/Off (активність / ноунейм для статистики) */}
                <div
                  onClick={() => toggleStatus(m.id)}
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
