import React, { useState } from 'react';
import { Project, TeamMember } from '../App';

interface TeamTabProps {
  projects: Project[];
  onUpdateProjects: React.Dispatch<React.SetStateAction<Project[]>>;
}

export const TeamTab: React.FC<TeamTabProps> = ({ projects, onUpdateProjects }) => {
  const activeProjects = projects.filter((p) => p.status === 'active');
  const [selectedUid, setSelectedUid] = useState<string>(activeProjects[0]?.uid || '');

  const [fullName, setFullName] = useState('');
  const [telegramUsername, setTelegramUsername] = useState('');
  const [role, setRole] = useState<'Керівник' | 'Кресляр' | 'Візуалізатор' | 'Комплектатор'>('Кресляр');

  const selectedProject = projects.find((p) => p.uid === selectedUid);

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !selectedUid) return;

    const newMember: TeamMember = {
      id: Date.now().toString(),
      fullName: fullName.trim(),
      telegramUsername: telegramUsername.trim().replace(/^@/, ''),
      role
    };

    onUpdateProjects((prev) =>
      prev.map((p) =>
        p.uid === selectedUid
          ? { ...p, teamMembers: [...(p.teamMembers || []), newMember] }
          : p
      )
    );

    setFullName('');
    setTelegramUsername('');
  };

  const handleRemoveMember = (memberId: string) => {
    onUpdateProjects((prev) =>
      prev.map((p) =>
        p.uid === selectedUid
          ? { ...p, teamMembers: (p.teamMembers || []).filter((m) => m.id !== memberId) }
          : p
      )
    );
  };

  // Посилання для створення чату/групи в Telegram з автозаповненням
  const getTelegramGroupLink = () => {
    if (!selectedProject) return '#';
    const text = encodeURIComponent(`Проект: ${selectedProject.name} (${selectedProject.id})\nУчасники:\n` +
      (selectedProject.teamMembers || []).map(m => `- ${m.fullName} (@${m.telegramUsername}) — ${m.role}`).join('\n')
    );
    return `https://t.me/share/url?url=${text}`;
  };

  return (
    <div style={{ padding: '20px', color: '#1c1c1e', maxWidth: '500px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '16px' }}>Команда проекту</h2>

      {activeProjects.length === 0 ? (
        <p style={{ color: '#8e8e93' }}>Немає активних проектів.</p>
      ) : (
        <>
          {/* Вибір проекту */}
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Оберіть проект</label>
            <select
              value={selectedUid}
              onChange={(e) => setSelectedUid(e.target.value)}
              style={inputStyle}
            >
              {activeProjects.map((p) => (
                <option key={p.uid} value={p.uid}>
                  {p.name} ({p.id})
                </option>
              ))}
            </select>
          </div>

          {selectedProject && (
            <>
              {/* Форма додавання учасника */}
              <form onSubmit={handleAddMember} style={{ padding: '14px', backgroundColor: '#f2f2f7', borderRadius: '12px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <h4 style={{ margin: 0, fontSize: '14px' }}>Додати виконавця</h4>
                
                <input
                  type="text"
                  placeholder="Прізвище та Ім'я"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  style={inputStyle}
                />

                <input
                  type="text"
                  placeholder="Нікнейм в Telegram (напр. nickname)"
                  value={telegramUsername}
                  onChange={(e) => setTelegramUsername(e.target.value)}
                  style={inputStyle}
                />

                <select value={role} onChange={(e) => setRole(e.target.value as any)} style={inputStyle}>
                  <option value="Керівник">Керівник</option>
                  <option value="Кресляр">Кресляр</option>
                  <option value="Візуалізатор">Візуалізатор</option>
                  <option value="Комплектатор">Комплектатор</option>
                </select>

                <button type="submit" style={greenBtnStyle}>Додати в команду</button>
              </form>

              {/* Список доданих учасників */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '15px', marginBottom: '10px' }}>Учасники команди ({selectedProject.teamMembers?.length || 0})</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {(selectedProject.teamMembers || []).map((member) => (
                    <div key={member.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '14px' }}>{member.fullName}</div>
                        <div style={{ fontSize: '12px', color: '#8e8e93' }}>
                          {member.role} {member.telegramUsername && `• @${member.telegramUsername}`}
                        </div>
                      </div>
                      <button onClick={() => handleRemoveMember(member.id)} style={{ background: 'none', border: 'none', color: '#ff3b30', cursor: 'pointer' }}>✕</button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Кнопка створення чату */}
              <a
                href={getTelegramGroupLink()}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'block',
                  textAlign: 'center',
                  padding: '12px',
                  backgroundColor: '#0088cc',
                  color: '#ffffff',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '14px'
                }}
              >
                ✈️ Створити чат проекту в Telegram
              </a>
            </>
          )}
        </>
      )}
    </div>
  );
};

const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 12px', backgroundColor: '#ffffff', border: '1px solid #e5e5ea', borderRadius: '8px', fontSize: '14px', color: '#1c1c1e', outline: 'none', boxSizing: 'border-box' };
const labelStyle: React.CSSProperties = { fontSize: '13px', fontWeight: 500, color: '#636366', marginBottom: '4px', display: 'block' };
const greenBtnStyle: React.CSSProperties = { padding: '10px 14px', backgroundColor: '#34c759', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '14px', cursor: 'pointer' };
