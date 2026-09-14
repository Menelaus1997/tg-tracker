// Приклад коду форми створення проекту українською мовою:

<div style={{ padding: '16px', maxWidth: '400px', margin: '0 auto', fontFamily: "'SF Pro Condensed', -apple-system, sans-serif" }}>
  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
    
    <div>
      <label style={{ fontSize: '11px', color: '#636366', marginBottom: '2px', display: 'block', fontStyle: 'italic' }}>
        Назва проекту
      </label>
      <input
        type="text"
        placeholder="Введіть назву проекту"
        // value={...}
        // onChange={...}
        style={{ width: '100%', padding: '8px', backgroundColor: '#e5e5ea', border: '1px solid #d1d1d6', borderRadius: '6px', fontSize: '12px', fontStyle: 'italic', boxSizing: 'border-box', outline: 'none' }}
      />
    </div>

    <div>
      <label style={{ fontSize: '11px', color: '#636366', marginBottom: '2px', display: 'block', fontStyle: 'italic' }}>
        ID проекту
      </label>
      <input
        type="text"
        placeholder="Введіть ID проекту"
        // value={...}
        // onChange={...}
        style={{ width: '100%', padding: '8px', backgroundColor: '#e5e5ea', border: '1px solid #d1d1d6', borderRadius: '6px', fontSize: '12px', fontStyle: 'italic', boxSizing: 'border-box', outline: 'none' }}
      />
    </div>

    <div>
      <label style={{ fontSize: '11px', color: '#636366', marginBottom: '2px', display: 'block', fontStyle: 'italic' }}>
        Шаблон
      </label>
      <select
        // value={...}
        // onChange={...}
        style={{ width: '100%', padding: '8px', backgroundColor: '#e5e5ea', border: '1px solid #d1d1d6', borderRadius: '6px', fontSize: '12px', fontStyle: 'italic', boxSizing: 'border-box', outline: 'none', cursor: 'pointer' }}
      >
        <option value="general">Загальний шаблон (кастомний)</option>
      </select>
    </div>

    {/* Палітра кольорів та кнопка додавання */}
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '8px 0' }}>
      {/* Список кольорів */}
    </div>

    <button
      // onClick={...}
      style={{ width: '100%', padding: '10px', backgroundColor: '#007aff', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontStyle: 'italic', fontSize: '12px', cursor: 'pointer' }}
    >
      Додати проект
    </button>

    <div style={{ textAlign: 'center', marginTop: '6px' }}>
      <span style={{ fontSize: '11px', color: '#007aff', cursor: 'pointer', fontStyle: 'italic', textDecoration: 'underline' }}>
        Сховати архів
      </span>
    </div>

  </div>
</div>
