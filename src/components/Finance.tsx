import React, { useState } from 'react';
import { Project } from '../App';

interface FinanceProps {
  projects: Project[];
}

interface ExpenseItem {
  id: string;
  title: string;
  amount: number;
  currency: string; // '$', 'грн', '%' тощо
  calcType: 'm2' | 'fixed' | 'net'; // м.кв., фіксована сума, чиста вартість
}

export const Finance: React.FC<FinanceProps> = ({ projects }) => {
  // Стани для розширеного управління бюджетом
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [newExpenseTitle, setNewExpenseTitle] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState<string>('');
  const [newExpenseCurrency, setNewExpenseCurrency] = useState('$');
  const [newExpenseCalcType, setNewExpenseCalcType] = useState<'m2' | 'fixed' | 'net'>('fixed');

  // Мокаємо або беремо витрати (у майбутньому можна прив'язати до проєкту чи зберігати локально)
  const [expenses, setExpenses] = useState<ExpenseItem[]>([
    { id: '1', title: 'Візуалізація загальних зон', amount: 300, currency: '$', calcType: 'fixed' },
    { id: '2', title: 'Креслення проєкту', amount: 15, currency: '$', calcType: 'm2' }
  ]);

  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);

  // Розрахунки (умовно для прикладу або загальні по проєкту)
  const totalProjectCost = 1500; // Загальна вартість проекту
  const totalExpenses = expenses.reduce((acc, item) => acc + (Number(item.amount) || 0), 0);
  const companyNetProfit = totalProjectCost - totalExpenses; // Загальний чистий прибуток компанії
  const personalNetProfit = companyNetProfit * 0.7; // Загальний чистий власний прибуток (наприклад, 70%)

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpenseTitle.trim() || !newExpenseAmount) return;

    const newItem: ExpenseItem = {
      id: Date.now().toString(),
      title: newExpenseTitle.trim(),
      amount: parseFloat(newExpenseAmount) || 0,
      currency: newExpenseCurrency,
      calcType: newExpenseCalcType
    };

    setExpenses([newItem, ...expenses]);
    setNewExpenseTitle('');
    setNewExpenseAmount('');
    setIsAddExpenseOpen(false);
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses(expenses.filter(item => item.id !== id));
  };

  return (
    <div style={{ padding: '16px', maxWidth: '500px', margin: '0 auto', color: '#1c1c1e', fontFamily: "'SF Pro Condensed', -apple-system, sans-serif" }}>
      <h2 style={{ fontSize: '18px', fontWeight: 'bold', fontStyle: 'italic', marginBottom: '16px', textAlign: 'center' }}>
        Бюджет проєкту
      </h2>

      {/* Основні показники */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
        <div style={cardStyle}>
          <span style={cardLabelStyle}>Загальна вартість проекту:</span>
          <span style={cardValueStyle}>{totalProjectCost} $</span>
        </div>
        <div style={cardStyle}>
          <span style={cardLabelStyle}>Загальна витрата проекту:</span>
          <span style={{ ...cardValueStyle, color: '#ff3b30' }}>{totalExpenses} $</span>
        </div>
        <div style={cardStyle}>
          <span style={cardLabelStyle}>Загальний чистий прибуток компанії:</span>
          <span style={{ ...cardValueStyle, color: '#34c759' }}>{companyNetProfit} $</span>
        </div>
        <div style={cardStyle}>
          <span style={cardLabelStyle}>Загальний чистий власний прибуток:</span>
          <span style={{ ...cardValueStyle, color: '#007aff' }}>{personalNetProfit} $</span>
        </div>
      </div>

      {/* Кнопка відкриття спадного меню для додавання витрати */}
      <div style={{ marginBottom: '16px' }}>
        <button
          onClick={() => setIsAddExpenseOpen(!isAddExpenseOpen)}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#007aff',
            color: '#ffffff',
            border: 'none',
            borderRadius: '10px',
            fontWeight: 'bold',
            fontStyle: 'italic',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          {isAddExpenseOpen ? 'Закрити меню витрат' : '+ Додати витрату'}
        </button>
      </div>

      {/* Спадне меню / Форма додавання витрати */}
      {isAddExpenseOpen && (
        <form onSubmit={handleAddExpense} style={{ backgroundColor: '#f2f2f7', padding: '14px', borderRadius: '12px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <label style={{ fontSize: '11px', fontStyle: 'italic', color: '#636366', display: 'block', marginBottom: '2px' }}>Назва витрати</label>
            <input
              type="text"
              placeholder="Введіть назву..."
              value={newExpenseTitle}
              onChange={(e) => setNewExpenseTitle(e.target.value)}
              style={inputStyle}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ flex: 2 }}>
              <label style={{ fontSize: '11px', fontStyle: 'italic', color: '#636366', display: 'block', marginBottom: '2px' }}>Вартість (число)</label>
              <input
                type="number"
                placeholder="0.00"
                value={newExpenseAmount}
                onChange={(e) => setNewExpenseAmount(e.target.value)}
                style={inputStyle}
                required
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '11px', fontStyle: 'italic', color: '#636366', display: 'block', marginBottom: '2px' }}>Валюта</label>
              <select
                value={newExpenseCurrency}
                onChange={(e) => setNewExpenseCurrency(e.target.value)}
                style={inputStyle}
              >
                <option value="$">$</option>
                <option value="грн">грн</option>
                <option value="%">%</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '11px', fontStyle: 'italic', color: '#636366', display: 'block', marginBottom: '2px' }}>Тип розрахунку</label>
            <select
              value={newExpenseCalcType}
              onChange={(e) => setNewExpenseCalcType(e.target.value as any)}
              style={inputStyle}
            >
              <option value="fixed">Фіксована сума</option>
              <option value="m2">м. кв.</option>
              <option value="net">Чиста вартість проекту</option>
            </select>
          </div>

          <button
            type="submit"
            style={{ width: '100%', padding: '10px', backgroundColor: '#34c759', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontStyle: 'italic', cursor: 'pointer', marginTop: '6px' }}
          >
            Зберегти витрату
          </button>
        </form>
      )}

      {/* Список поточних витрат */}
      <div>
        <h3 style={{ fontSize: '14px', fontStyle: 'italic', color: '#636366', marginBottom: '10px' }}>Список витрат:</h3>
        {expenses.length === 0 ? (
          <div style={{ fontSize: '12px', fontStyle: 'italic', color: '#8e8e93', textAlign: 'center' }}>Немає доданих витрат.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {expenses.map((item) => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', backgroundColor: '#f9f9fb', border: '1px solid #e5e5ea', borderRadius: '8px' }}>
                <div>
                  <div style={{ fontSize: '13px', fontStyle: 'italic', fontWeight: 500 }}>{item.title}</div>
                  <div style={{ fontSize: '11px', fontStyle: 'italic', color: '#8e8e93' }}>
                    Тип: {item.calcType === 'm2' ? 'м.кв.' : item.calcType === 'fixed' ? 'Фіксована сума' : 'Чиста вартість'}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '13px', fontStyle: 'italic', fontWeight: 'bold', color: '#ff3b30' }}>
                    -{item.amount} {item.currency}
                  </span>
                  <button
                    onClick={() => handleDeleteExpense(item.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const cardStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '12px 14px',
  backgroundColor: '#f2f2f7',
  borderRadius: '10px',
  border: '1px solid #e5e5ea'
};

const cardLabelStyle: React.CSSProperties = {
  fontSize: '13px',
  fontStyle: 'italic',
  color: '#3a3a3c'
};

const cardValueStyle: React.CSSProperties = {
  fontSize: '14px',
  fontStyle: 'italic',
  fontWeight: 'bold'
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  backgroundColor: '#ffffff',
  border: '1px solid #d1d1d6',
  borderRadius: '6px',
  fontSize: '12px',
  fontStyle: 'italic',
  outline: 'none',
  boxSizing: 'border-box',
  color: '#1c1c1e'
};

export default Finance;
