import React, { useState } from 'react';
import { Project, TeamMember } from '../App';

interface TeamTabProps {
  projects: Project[];
  onUpdateProjects: React.Dispatch<React.SetStateAction<Project[]>>;
}

export type RoleType = 'Кресляр' | 'Візуалізатор' | 'Комплектатор' | 'Виконроб' | 'Керівник' | 'Кошторисник';

export const TeamTab: React.FC<TeamTabProps> = ({ projects, onUpdateProjects }) => {
  const activeProjects = projects.filter((p) => p.status === 'active');
  const [selectedUid, setSelectedUid] = useState<string>(activeProjects[0]?.uid || '');

  // Стан для 3 рядків форми
  const [fullName, setFullName] = useState('');
  const [telegramUsername, setTelegramUsername] = useState('');
  const [role, setRole] = useState<RoleType>('Кресляр');

  const selectedProject = projects.find((p) => p.uid === selectedUid);

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !selectedUid) return;

    // Додаємо усі 3 рядки як єдину цілісну картку
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

    // Очищення форми
    setFullName('');
    setTelegramUsername('');
    setRole('Кресляр');
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

  const getTelegramGroupLink = () => {
    if (!selectedProject) return '#';
    const text = encodeURIComponent(
      `Проект: ${selectedProject.name} (${selectedProject.id})\n` +
      `Учасники команди:\n` +
      (selectedProject.teamMembers || [])
        .map((m) => `- ${m.fullName} (@${m.telegramUsername}) — ${m.role}`)
        .join('\n')
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
          <div style={{ marginBottom: '20px' }}>
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
              {/* Форма додавання 3 рядків однією кнопкою */}
              <form
                onSubmit={handleAddMember}
                style={{
                  padding: '16px',
                  backgroundColor: '#f2f2f7',
                  borderRadius: '14px',
                  marginBottom: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600 }}>Додати учасника в команду</h4>

                {/* Строка 1: Ім'я та прізвище */}
                <div>
                  <label style={subLabelStyle}>Строка 1: Ім'я та прізвище</label>
                  <input
                    type="text"
                    placeholder="напр. Іван Іванов"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    style={inputStyle}
                  />
                </div>

                {/* Строка 2: Нікнейм в ТГ */}
                <div>
                  <label style={subLabelStyle}>Строка 2: Нікнейм в ТГ</label>
                  <input
                    type="text"
                    placeholder="напр. nickname"
                    value={telegramUsername}
                    onChange={(e) => setTelegramUsername(e.target.value)}
                    style={inputStyle}
                  />
                </div>

                {/* Строка 3: Спадне меню ролей */}
                <div>
                  <label style={subLabelStyle}>Строка 3: Роль</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as RoleType)}
                    style={inputStyle}
                  >
                    <option value="Кресляр">Кресляр</option>
                    <option value="Візуалізатор">Візуалізатор</option>
                    <option value="Комплектатор">Комплектатор</option>
                    <option value="Виконроб">Виконроб</option>
                    <option value="Керівник">Керівник</option>
                    <option value="Кошторисник">Кошторисник</option>
                  </select>
                </div>

                {/* Єдина кнопка додати для 3 рядків */}
                <button type="submit" style={greenBtnStyle}>
                  Додати учасника
                </button>
              </form>

              {/* Список доданих спеціалістів */}
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '12px' }}>
                  Склад команди ({selectedProject.teamMembers?.length || 0})
                </h4>

                {(!selectedProject.teamMembers || selectedProject.teamMembers.length === 0) ? (
                  <p style={{ fontSize: '13px', color: '#8e8e93' }}>Учасників ще не додано.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {selectedProject.teamMembers.map((member) => (
                      <div
                        key={member.id}
                        style={{
                          display: 'flex',
                          justify: 'space-between',
                          alignItems: 'center',
                          padding: '12px 14px',
                          backgroundColor: '#ffffff',
                          border: '1px solid #e5e5ea',
                          borderRadius: '10px'
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '15px', color: '#1c1c1e' }}>
                            {member.fullName}
                          </div>
                          <div style={{ fontSize: '13px', color: '#007aff', marginTop: '2px' }}>
                            {member.role} {member.telegramUsername && `• @${member.telegramUsername}`}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveMember(member.id)}
                          style={{ background: 'none', border: 'none', color: '#ff3b30', fontSize: '16px', cursor: 'pointer' }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Кнопка запуску чату */}
              <a
                href={getTelegramGroupLink()}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'block',
                  textAlign: 'center',
                  padding: '14px',
                  backgroundColor: '#0088cc',
                  color: '#ffffff',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '15px'
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
const labelStyle: React.CSSProperties = { fontSize: '13px', fontWeight: 600, color: '#636366', marginBottom: '6px', display: 'block' };
const subLabelStyle: React.CSSProperties = { fontSize: '12px', fontWeight: 500, color: '#8e8e93', marginBottom: '4px', display: 'block' };
const greenBtnStyle: React.CSSProperties = { width: '100%', padding: '12px', backgroundColor: '#34c759', color: '#ffffff', border: 'none', borderRadius: '10px', fontWeight: 600, fontSize: '14px', cursor: 'pointer', marginTop: '4px' };
