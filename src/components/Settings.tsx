import React, { useState } from 'react';

interface SettingsProps {
  botToken: string;
  groupId: string;
  superAdminId: string;
  fontFamily: string;
  onSaveSettings: (token: string, group: string, font: string) => void;
  isSuperAdmin: boolean;
}

export const Settings: React.FC<SettingsProps> = ({
  botToken,
  groupId,
  superAdminId,
  fontFamily,
  onSaveSettings,
  isSuperAdmin
}) => {
  const [tokenInput, setTokenInput] = useState(botToken);
  const [groupInput, setGroupInput] = useState(groupId);
  const [fontSelect, setFontSelect] = useState(fontFamily || 'system-ui');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(tokenInput.trim(), groupInput.trim(), fontSelect);
    alert('Налаштування збережено!');
  };

  if (!isSuperAdmin) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#ff3b30' }}>
        <h3>⛔ Доступ обмежено</h3>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto', color: '#1c1c1e' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>⚙️ Налаштування</h2>

      <div style={{ padding: '12px', backgroundColor: '#e5f3ff', borderRadius: '10px', marginBottom: '20px', fontSize: '13px', color: '#005580' }}>
        🔑 <strong>ID Власника:</strong> <code>{superAdminId || 'Зчитується при вході'}</code>
      </div>

      <form onSubmit={handleSubmit} style={{ backgroundColor: '#f2f2f7', padding: '16px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <label style={{ fontSize: '12px', fontWeight: 600, color: '#636366', marginBottom: '4px', display: 'block' }}>
            Стиль шрифту тексту
          </label>
          <select
            value={fontSelect}
            onChange={(e) => setFontSelect(e.target.value)}
            style={inputStyle}
          >
            <option value="system-ui, -apple-system, sans-serif">Системний (iOS / Telegram)</option>
            <option value="'Roboto', sans-serif">Roboto</option>
            <option value="'Montserrat', sans-serif">Montserrat</option>
            <option value="'Inter', sans-serif">Inter</option>
            <option value="Georgia, serif">Класичний (Serif)</option>
          </select>
        </div>

        <div>
          <label style={{ fontSize: '12px', fontWeight: 600, color: '#636366', marginBottom: '4px', display: 'block' }}>
            Telegram Bot Token
          </label>
          <input
            type="password"
            placeholder="1234567890:ABC..."
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div>
          <label style={{ fontSize: '12px', fontWeight: 600, color: '#636366', marginBottom: '4px', display: 'block' }}>
            Group Chat ID
          </label>
          <input
            type="text"
            placeholder="-1001234567890"
            value={groupInput}
            onChange={(e) => setGroupInput(e.target.value)}
            style={inputStyle}
          />
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
            cursor: 'pointer'
          }}
        >
          Зберегти всі зміни
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
