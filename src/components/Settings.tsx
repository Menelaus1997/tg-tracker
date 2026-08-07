import React, { useState } from 'react';

interface SettingsProps {
  botToken: string;
  groupId: string;
  superAdminId: string;
  onSaveSettings: (token: string, group: string) => void;
  isSuperAdmin: boolean;
}

export const Settings: React.FC<SettingsProps> = ({
  botToken,
  groupId,
  superAdminId,
  onSaveSettings,
  isSuperAdmin
}) => {
  const [tokenInput, setTokenInput] = useState(botToken);
  const [groupInput, setGroupInput] = useState(groupId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(tokenInput.trim(), groupInput.trim());
    alert('Налаштування Telegram Bot API збережено!');
  };

  if (!isSuperAdmin) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#ff3b30' }}>
        <h3>⛔ Доступ обмежено</h3>
        <p style={{ fontSize: '14px', color: '#636366' }}>Ця вкладка доступна лише Супер-Адміністратору проєкту.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto', color: '#1c1c1e' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>⚙️ Налаштування Telegram Bot API</h2>

      <div style={{ padding: '12px', backgroundColor: '#e5f3ff', borderRadius: '10px', marginBottom: '20px', fontSize: '13px', color: '#005580' }}>
        🔑 <strong>Ідентифікатор Власника (Super-Admin):</strong> <code>{superAdminId || 'Зчитується при вході'}</code>
      </div>

      <form onSubmit={handleSubmit} style={{ backgroundColor: '#f2f2f7', padding: '16px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <label style={{ fontSize: '12px', fontWeight: 600, color: '#636366', marginBottom: '4px', display: 'block' }}>
            Telegram Bot Token
          </label>
          <input
            type="password"
            placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyZ"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            style={inputStyle}
          />
          <span style={{ fontSize: '11px', color: '#8e8e93' }}>Отриманий від @BotFather</span>
        </div>

        <div>
          <label style={{ fontSize: '12px', fontWeight: 600, color: '#636366', marginBottom: '4px', display: 'block' }}>
            Group Chat ID (Спільна група-форум)
          </label>
          <input
            type="text"
            placeholder="-1001234567890"
            value={groupInput}
            onChange={(e) => setGroupInput(e.target.value)}
            style={inputStyle}
          />
          <span style={{ fontSize: '11px', color: '#8e8e93' }}>ID групи починається з -100</span>
        </div>

        <button
          type="submit"
          style={{
            padding: '12px',
            backgroundColor: '#007aff',
            color: '#ffffff',
            border: 'none',
            borderRadius: '10px',
            fontWeight: 600,
            fontSize: '14px',
            cursor: 'pointer',
            marginTop: '6px'
          }}
        >
          Зберегти ключі
        </button>
      </form>
    </div>
  );
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  backgroundColor: '#ffffff',
  border: '1px solid #e5e5ea',
  borderRadius: '8px',
  fontSize: '14px',
  color: '#1c1c1e',
  outline: 'none',
  boxSizing: 'border-box'
};
