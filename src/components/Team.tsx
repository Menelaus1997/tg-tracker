import React, { useState } from 'react';
import { TeamMember } from '../App';

interface TeamProps {
  members: TeamMember[];
  onUpdateMembers: (members: TeamMember[]) => void;
  availableRoles: string[];
}

export const Team: React.FC<TeamProps> = ({ members, onUpdateMembers, availableRoles }) => {
  const [name, setName] = useState('');
  const [telegramId, setTelegramId] = useState('');
  const [role, setRole] = useState(availableRoles[0] || 'Draftsman');

  // Інлайн-редагування
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<TeamMember>>({});

  const handleAdd = () => {
    if (!name.trim()) return;
    const newMember: TeamMember = {
      id: Date.now().toString(),
      fullName: name,
      telegramId,
      role,
      active: true // Тумблер увімкнено за замовчуванням
    };
    onUpdateMembers([...members, newMember]);
    setName(''); setTelegramId('');
  };

  const toggleStatus = (id: string) => {
    onUpdateMembers(members.map(m => m.id === id ? { ...m, active: !m.active } : m));
  };

  const handleSaveEdit = (id: string) => {
    onUpdateMembers(members.map(m => m.id === id ? { ...m, ...editForm } : m));
    setEditingId(null);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto', color: '#1c1c1e' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px', backgroundColor: '#f2f2f7', padding: '16px', borderRadius: '12px' }}>
        <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
        <input type="text" placeholder="Telegram User ID" value={telegramId} onChange={(e) => setTelegramId(e.target.value)} style={inputStyle} />
        <select value={role} onChange={(e) => setRole(e.target.value)} style={inputStyle}>
          {availableRoles.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <button onClick={handleAdd} style={btnStyle}>Add to Database</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {members.map((m) => (
          <div key={m.id} style={{ padding: '12px', borderRadius: '10px', backgroundColor: '#ffffff', border: '1px solid #e5e5ea', display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Трикутник зліва */}
            <span onClick={() => alert("Details info")} style={{ cursor: 'pointer', fontSize: '10px', color: '#8e8e93' }}>▼</span>
            
            <div style={{ flex: 1 }}>
              {editingId === m.id ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <input value={editForm.fullName || m.fullName} onChange={e => setEditForm({...editForm, fullName: e.target.value})} style={inputStyle} />
                  <button onClick={() => handleSaveEdit(m.id)} style={{ ...btnStyle, fontSize: '11px', padding: '4px' }}>Save</button>
                </div>
              ) : (
                <div onClick={() => { setEditingId(m.id); setEditForm(m); }} style={{ cursor: 'pointer' }}>
                  <div style={{ fontWeight: 600 }}>{m.fullName}</div>
                  <div style={{ fontSize: '11px', color: '#8e8e93' }}>{m.role} • ID: {m.telegramId || 'N/A'}</div>
                </div>
              )}
            </div>

            <button onClick={() => onUpdateMembers(members.filter(mem => mem.id !== m.id))} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>🗑️</button>
            
            {/* Тумблер */}
            <div onClick={() => toggleStatus(m.id)} style={{ width: '34px', height: '20px', borderRadius: '10px', backgroundColor: m.active ? '#34c759' : '#e5e5ea', position: 'relative', cursor: 'pointer' }}>
              <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#fff', position: 'absolute', top: '2px', left: m.active ? '16px' : '2px', transition: 'left 0.2s' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const inputStyle: React.CSSProperties = { padding: '10px', borderRadius: '8px', border: '1px solid #d1d1d6', fontSize: '13px' };
const btnStyle: React.CSSProperties = { padding: '10px', backgroundColor: '#34c759', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' };
