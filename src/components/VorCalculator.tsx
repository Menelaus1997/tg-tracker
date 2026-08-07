import React, { useState } from 'react';
import { Project } from '../App';

interface VorCalculatorProps {
  projects: Project[];
}

interface VorRow {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  pricePerUnit: number;
}

export const VorCalculator: React.FC<VorCalculatorProps> = ({ projects }) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const [rows, setRows] = useState<VorRow[]>([]);
  
  const [newName, setNewName] = useState('');
  const [newUnit, setNewUnit] = useState('м²');
  const [newQuantity, setNewQuantity] = useState('');
  const [newPrice, setNewPrice] = useState('');

  const activeProject = projects.find(p => p.id === selectedProjectId);

  const handleAddRow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newRow: VorRow = {
      id: Date.now().toString(),
      name: newName.trim(),
      unit: newUnit.trim(),
      quantity: parseFloat(newQuantity) || 0,
      pricePerUnit: parseFloat(newPrice) || 0,
    };

    setRows([...rows, newRow]);
    setNewName('');
    setNewQuantity('');
    setNewPrice('');
  };

  const handleRemoveRow = (id: string) => {
    setRows(rows.filter(r => r.id !== id));
  };

  const grandTotal = rows.reduce((sum, r) => sum + r.quantity * r.pricePerUnit, 0);

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto', color: '#1c1c1e' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>📊 ВОР (Відомість об'ємів робіт та вартість)</h2>

      {/* Вибір проекту */}
      <div style={{ marginBottom: '16px' }}>
        <label style={labelStyle}>Оберіть проект</label>
        <select
          value={selectedProjectId}
          onChange={(e) => setSelectedProjectId(e.target.value)}
          style={inputStyle}
        >
          {projects.length === 0 && <option value="">Немає активних проектів</option>}
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.id})
            </option>
          ))}
        </select>
      </div>

      {/* Форма додавання нової позиції */}
      <form onSubmit={handleAddRow} style={{ backgroundColor: '#f2f2f7', padding: '14px', borderRadius: '12px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <h4 style={{ margin: '0 0 4px 0', fontSize: '14px' }}>➕ Додати позицію робіт/матеріалів</h4>
        
        <input
          type="text"
          placeholder="Назва роботи / матеріалу"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          required
          style={inputStyle}
        />

        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            placeholder="Од. вим. (м² / шт)"
            value={newUnit}
            onChange={(e) => setNewUnit(e.target.value)}
            style={{ ...inputStyle, flex: 1 }}
          />
          <input
            type="number"
            step="any"
            placeholder="Кількість"
            value={newQuantity}
            onChange={(e) => setNewQuantity(e.target.value)}
            style={{ ...inputStyle, flex: 1 }}
          />
          <input
            type="number"
            step="any"
            placeholder="Ціна (грн)"
            value={newPrice}
            onChange={(e) => setNewPrice(e.target.value)}
            style={{ ...inputStyle, flex: 1 }}
          />
        </div>

        <button type="submit" style={{ ...btnStyle, backgroundColor: '#34c759', color: '#ffffff', marginTop: '4px' }}>
          Додати в кошторис
        </button>
      </form>

      {/* Таблиця / Список позицій ВОР */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
        <h4 style={{ margin: '0 0 6px 0', fontSize: '15px' }}>
          Кошторис робіт {activeProject ? `(${activeProject.name})` : ''}
        </h4>

        {rows.length === 0 ? (
          <div style={{ fontSize: '13px', color: '#8e8e93' }}>Позиції ВОР ще не додано.</div>
        ) : (
          rows.map((r, index) => {
            const rowSum = r.quantity * r.pricePerUnit;
            return (
              <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', backgroundColor: '#f9f9f9', borderRadius: '8px', borderLeft: '4px solid #007aff' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '14px' }}>
                    {index + 1}. {r.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#636366' }}>
                    {r.quantity} {r.unit} × {r.pricePerUnit} грн
                  </div>
                </div>
                <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontWeight: 700, fontSize: '14px', color: '#34c759' }}>
                    {rowSum.toLocaleString()} грн
                  </span>
                  <button onClick={() => handleRemoveRow(r.id)} style={iconBtnStyle}>✕</button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Підсумок кошторису */}
      {rows.length > 0 && (
        <div style={{ padding: '14px', backgroundColor: '#e5f3ff', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 600, fontSize: '15px', color: '#005580' }}>Загальна вартість ВОР:</span>
          <span style={{ fontWeight: 700, fontSize: '18px', color: '#007aff' }}>
            {grandTotal.toLocaleString()} грн
          </span>
        </div>
      )}
    </div>
  );
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  backgroundColor: '#ffffff',
  border: '1px solid #e5e5ea',
  borderRadius: '8px',
  fontSize: '13px',
  outline: 'none',
  boxSizing: 'border-box'
};

const labelStyle: React.CSSProperties = {
  fontSize: '12px',
  fontWeight: 500,
  color: '#636366',
  marginBottom: '4px',
  display: 'block'
};

const btnStyle: React.CSSProperties = {
  padding: '10px',
  borderRadius: '8px',
  border: 'none',
  fontWeight: 600,
  fontSize: '13px',
  cursor: 'pointer'
};

const iconBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: '#ff3b30',
  cursor: 'pointer',
  fontSize: '14px',
  padding: '2px'
};

export default VorCalculator;
