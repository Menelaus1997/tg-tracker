import React, { useState } from 'react';

interface SettingsProps {
  botToken: string;
  groupId: string;
  fontFamily: string;
  onSaveSettings: (token: string, group: string, font: string) => void;
  adminCredentials: { login: string; passwordHash: string; secretWord: string };
  onUpdateCredentials: (login: string, pass: string, secret: string) => void;
}

export const Settings: React.FC<SettingsProps> = ({
  botToken,
  groupId,
  fontFamily,
  onSaveSettings,
  adminCredentials,
  onUpdateCredentials
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Стан для входу
  const [loginInput, setLoginInput] = useState('');
  const [passInput, setPassInput] = useState('');

  // Стан для скидання пароля через кодове слово
  const [isResetMode, setIsResetMode] = useState(false);
  const [secretInput, setSecretInput] = useState('');
  const [newPassInput, setNewPassInput] = useState('');

  // Налаштування після авторизації
  const [tokenInput, setTokenInput] = useState(botToken);
  const [groupInput, setGroupInput] = useState(groupId);
  const [fontSelect, setFontSelect] = useState(fontFamily || 'system-ui');

  // Зміна облікових даних
  const [newLogin, setNewLogin] = useState(adminCredentials.login);
  const [oldPassword, setOldPassword] = useState('');
  const [changePassword, setChangePassword] = useState('');
  const [newSecretWord, setNewSecretWord] = useState(adminCredentials.secretWord);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      loginInput.trim() === adminCredentials.login &&
      passInput.trim() === adminCredentials.passwordHash
    ) {
      setIsAuthenticated(true);
    } else {
      alert('Невірний логін або пароль!');
    }
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (secretInput.trim().toLowerCase() === adminCredentials.secretWord.toLowerCase()) {
      onUpdateCredentials(adminCredentials.login, newPassInput.trim(), adminCredentials.secretWord);
      alert('Пароль успішно скинуто! Тепер ви можете увійти з новим паролем.');
      setIsResetMode(false);
      setPassInput(newPassInput.trim());
    } else {
      alert('Невірне кодове слово!');
    }
  };

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();

    // Перевірка зміни логіну/пароля
    if (changePassword.trim()) {
      if (oldPassword.trim() !== adminCredentials.passwordHash) {
        alert('Для зміни пароля потрібно правильно вказати старий пароль!');
        return;
      }
    }

    const updatedPass = changePassword.trim() ? changePassword.trim() : adminCredentials.passwordHash;
    onUpdateCredentials(newLogin.trim(), updatedPass, newSecretWord.trim());
    onSaveSettings(tokenInput.trim(), groupInput.trim(), fontSelect);

    alert('Всі налаштування успішно збережено!');
  };

  // Екран входу та відновлення
  if (!isAuthenticated) {
    return (
      <div style={{ padding: '20px', maxWidth: '400px', margin: '20px auto', color: '#1c1c1e' }}>
        <h3 style={{ textAlign: 'center', marginBottom: '16px', fontSize: '18px' }}>
          🔒 Авторизація Адміністратора
        </h3>

        {!isResetMode ? (
          <form onSubmit={handleLoginSubmit} style={{ backgroundColor: '#f2f2f7', padding: '16px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Логін</label>
              <input type="text" value={loginInput} onChange={(e) => setLoginInput(e.target.value)} required style={inputStyle} placeholder="admin" />
            </div>

            <div>
              <label style={labelStyle}>Пароль</label>
              <input type="password" value={passInput} onChange={(e) => setPassInput(e.target.value)} required style={inputStyle} placeholder="••••••" />
            </div>

            <button type="submit" style={btnStyle}>Увійти в налаштування</button>

            <button
              type="button"
              onClick={() => setIsResetMode(true)}
              style={{ background: 'none', border: 'none', color: '#007aff', fontSize: '12px', cursor: 'pointer', marginTop: '6px' }}
            >
              Забули пароль? (За кодовим словом)
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetSubmit} style={{ backgroundColor: '#f2f2f7', padding: '16px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Кодове слово</label>
              <input type="text" value={secretInput} onChange={(e) => setSecretInput(e.target.value)} required style={inputStyle} placeholder="Введіть кодове слово" />
            </div>

            <div>
              <label style={labelStyle}>Новий пароль</label>
              <input type="password" value={newPassInput} onChange={(e) => setNewPassInput(e.target.value)} required style={inputStyle} placeholder="••••••" />
            </div>

            <button type="submit" style={{ ...btnStyle, backgroundColor: '#34c759' }}>Скинути та зберегти новий пароль</button>

            <button
              type="button"
              onClick={() => setIsResetMode(false)}
              style={{ background: 'none', border: 'none', color: '#8e8e93', fontSize: '12px', cursor: 'pointer' }}
            >
              Повернутися до входу
            </button>
          </form>
        )}
      </div>
    );
  }

  // Екран налаштувань після авторизації
  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto', color: '#1c1c1e' }}>
      <form onSubmit={handleSaveAll} style={{ backgroundColor: '#f2f2f7', padding: '16px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <h4 style={{ margin: 0, fontSize: '15px' }}>🔑 Облікові дані адміністратора</h4>

        <div>
          <label style={labelStyle}>Логін</label>
          <input type="text" value={newLogin} onChange={(e) => setNewLogin(e.target.value)} style={inputStyle} />
        </div>

        <div>
          <label style={labelStyle}>Поточний пароль (для підтвердження змін)</label>
          <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} style={inputStyle} placeholder="Поточний пароль" />
        </div>

        <div>
          <label style={labelStyle}>Новий пароль (залиште порожнім, якщо не змінюєте)</label>
          <input type="password" value={changePassword} onChange={(e) => setChangePassword(e.target.value)} style={inputStyle} placeholder="Новий пароль" />
        </div>

        <div>
          <label style={labelStyle}>Кодове слово (для відновлення доступу)</label>
          <input type="text" value={newSecretWord} onChange={(e) => setNewSecretWord(e.target.value)} style={inputStyle} />
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid #e5e5ea', margin: '6px 0' }} />

        <h4 style={{ margin: 0, fontSize: '15px' }}>⚙️ Telegram Bot API & Інтерфейс</h4>

        <div>
          <label style={labelStyle}>Telegram Bot Token</label>
          <input type="password" placeholder="1234567890:ABC..." value={tokenInput} onChange={(e) => setTokenInput(e.target.value)} style={inputStyle} />
        </div>

        <div>
          <label style={labelStyle}>Group Chat ID</label>
          <input type="text" placeholder="-1001234567890" value={groupInput} onChange={(e) => setGroupInput(e.target.value)} style={inputStyle} />
        </div>

        <div>
          <label style={labelStyle}>Стиль шрифту</label>
          <select value={fontSelect} onChange={(e) => setFontSelect(e.target.value)} style={inputStyle}>
            <option value="system-ui, -apple-system, sans-serif">Системний (iOS / Telegram)</option>
            <option value="'Roboto', sans-serif">Roboto</option>
            <option value="'Montserrat', sans-serif">Montserrat</option>
            <option value="'Inter', sans-serif">Inter</option>
          </select>
        </div>

        <button type="submit" style={btnStyle}>Зберегти налаштування</button>
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

const labelStyle: React.CSSProperties = {
  fontSize: '12px',
  fontWeight: 600,
  color: '#636366',
  marginBottom: '4px',
  display: 'block'
};

const btnStyle: React.CSSProperties = {
  padding: '12px',
  backgroundColor: '#007aff',
  color: '#ffffff',
  border: 'none',
  borderRadius: '10px',
  fontWeight: 600,
  fontSize: '14px',
  cursor: 'pointer'
};
