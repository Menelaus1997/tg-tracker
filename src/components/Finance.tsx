import React, { useState } from 'react';
import { Project } from '../App';

interface FinanceProps {
  projects: Project[];
  onUpdateProject?: (updatedProject: Project) => void;
}

interface ExpenseItem {
  id: string;
  title: string;
  amount: number;
  currency: string;
  calcType: 'm2' | 'fixed';
}

export const Finance: React.FC<FinanceProps> = ({ projects, onUpdateProject }) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [newExpenseTitle, setNewExpenseTitle] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState<string>('');
  const [newExpenseCurrency, setNewExpenseCurrency] = useState('USD');
  const [newExpenseCalcType, setNewExpenseCalcType] = useState<'m2' | 'fixed'>('fixed');

  const [companyProfitPercent, setCompanyProfitPercent] = useState<string>('20');
  const [personalProfitPercent, setPersonalProfitPercent] = useState<string>('50');

  // Знаходимо актуальний проєкт
  const selectedProject = projects.find(p => p.id === selectedProjectId);
  
  // Безпечно витягуємо витрати саме з вибраного проєкту
  const expenses: ExpenseItem[] = (selectedProject as any)?.expenses || [];

  const getProjectArea = (proj: Project): number => {
    if (!proj.passportRows) return 0;
    for (const row of proj.passportRows) {
      const label = (row.label || row.title || '').toLowerCase();
      if (label.includes('площа') || label.includes('м2') || label.includes('м.кв')) {
        const val = parseFloat(String(row.value || row.val || '0').replace(',', '.'));
        if (!isNaN(val)) return val;
      }
    }
    return 0;
  };

  const projectArea = selectedProject ? getProjectArea(selectedProject) : 0;

  // Функція збереження витрат з оновленням стану проєкту
  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpenseTitle.trim() || !newExpenseAmount || !selectedProject) return;

    const numericAmount = parseFloat(newExpenseAmount) || 0;
    const newItem: ExpenseItem = {
      id: Date.now().toString(),
      title: newExpenseTitle.trim(),
      amount: numericAmount,
      currency: newExpenseCurrency,
      calcType: newExpenseCalcType
    };

    const updatedExpenses = [newItem, ...expenses];

    // Оновлюємо проєкт і передаємо наверх у батьківський App
    const updatedProject: Project = {
      ...selectedProject,
      expenses: updatedExpenses as any
    };

    if (onUpdateProject) {
      onUpdateProject(updatedProject);
    }

    // Очищаємо поля форми
    setNewExpenseTitle('');
    setNewExpenseAmount('');
    setIsAddExpenseOpen(false);
  };

  const handleDeleteExpense = (id: string) => {
    if (!selectedProject) return;
    const updatedExpenses = expenses.filter(item => item.id !== id);
    
    const updatedProject: Project = {
      ...selectedProject,
      expenses: updatedExpenses as any
    };

    if (onUpdateProject) {
      onUpdateProject(updatedProject);
    }
  };

  // Розрахунок загальних витрат (з урахуванням площі для м.кв або фіксованої суми)
  const totalExpenses = expenses.reduce((acc, item) => {
    const baseVal = Number(item.amount) || 0;
    if (item.calcType === 'm2') {
      return acc + (baseVal * (projectArea > 0 ? projectArea : 1));
    }
    return acc + baseVal;
  }, 0);
  
  const companyProfitVal = totalExpenses * ((parseFloat(companyProfitPercent) || 0) / 100);
  const personalProfitVal = companyProfitVal * ((parseFloat(personalProfitPercent) || 0) / 100);
  const totalProjectCost = totalExpenses + companyProfitVal;

  const getProjectDates = (proj: Project) => {
    if (!proj.stages || proj.stages.length === 0) return 'Дата не вказана';
    const firstStage = proj.stages[0];
    const lastStage = proj.stages[proj.stages.length - 1];
    const start = firstStage?.startDate || '';
    const end = lastStage?.endDate || '';
    if (start && end) return `${start.split('-').reverse().join('.')} - ${end.split('-').reverse().join('.')}`;
    if (start) return start.split('-').reverse().join('.');
    return 'Дата не вказана';
  };

  return (
    <div style={{ padding: '16px', maxWidth: '500px', margin: '0 auto', color: '#1c1c1e', fontFamily: "'SF Pro Condensed', -apple-system, sans-serif" }}>
      <h2 style={{ fontSize: '18px', fontWeight: 'bold', fontStyle: 'italic', marginBottom: '16px', textAlign: 'center' }}>
        Фінанси та бюджет
      </h2>

      {!selectedProjectId ? (
        <div>
          <div style={{ fontSize: '13px', fontStyle: 'italic', color: '#636366', marginBottom: '12px' }}>
            Оберіть проєкт для перегляду та редагування бюджету:
          </div>
          {projects.length === 0 ? (
            <div style={{ textAlign: 'center', fontSize: '12px', fontStyle: 'italic', color: '#8e8e93', marginTop: '30px' }}>
              Немає створених проєктів.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {projects.map((proj) => (
                <div
                  key={proj.id}
                  onClick={() => setSelectedProjectId(proj.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    backgroundColor: '#f2f2f7',
                    border: '1px solid #e5e5ea',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: proj.color || '#007aff', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 'bold', fontStyle: 'italic' }}>{proj.name}</div>
                      <div style={{ fontSize: '12px', fontStyle: 'italic', color: '#636366' }}>ID: {proj.id}</div>
                      <div style={{ fontSize: '11px', fontStyle: 'italic', color: '#8e8e93', marginTop: '2px', display: 'inline-block', backgroundColor: '#ffffff', padding: '2px 6px', borderRadius: '4px', border: '1px solid #e5e5ea' }}>
                        📅 {getProjectDates(proj)}
                      </div>
                    </div>
                  </div>
                  <span style={{ fontSize: '16px', color: '#8e8e93' }}>➡️</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          <button
            onClick={() => setSelectedProjectId(null)}
            style={{ background: 'none', border: 'none', color: '#007aff', fontSize: '13px', fontStyle: 'italic', cursor: 'pointer', marginBottom: '14px', padding: 0, display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            ← Назад до списку проєктів
          </button>

          <div style={{ padding: '12px 14px', backgroundColor: '#e5e5ea', borderRadius: '10px', marginBottom: '16px', border: '1px solid #d1d1d6' }}>
            <div style={{ fontSize: '15px', fontWeight: 'bold', fontStyle: 'italic' }}>{selectedProject?.name}</div>
            <div style={{ fontSize: '12px', fontStyle: 'italic', color: '#636366' }}>ID: {selectedProject?.id}</div>
            <div style={{ fontSize: '11px', fontStyle: 'italic', color: '#8e8e93', marginTop: '2px' }}>
              📅 {getProjectDates(selectedProject!)} {projectArea > 0 ? `| 📐 Площа: ${projectArea} м²` : ''}
            </div>
          </div>

          {/* Блок показників бюджету */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
            <div style={cardStyle}>
              <span style={cardLabelStyle}>Загальна вартість проекту:</span>
              <span style={cardValueStyle}>{totalProjectCost.toFixed(2)} USD</span>
            </div>

            <div style={cardStyle}>
              <span style={cardLabelStyle}>Загальна витрата проекту:</span>
              <span style={{ ...cardValueStyle, color: '#ff3b30' }}>{totalExpenses.toFixed(2)} USD</span>
            </div>

            <div style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
                <span style={cardLabelStyle}>Загальний чистий прибуток компанії:</span>
                <input
                  type="number"
                  value={companyProfitPercent}
                  onChange={(e) => setCompanyProfitPercent(e.target.value)}
                  style={{ width: '50px', padding: '4px', fontSize: '12px', fontStyle: 'italic', textAlign: 'center', borderRadius: '6px', border: '1px solid #d1d1d6' }}
                />
                <span style={{ fontSize: '12px', fontStyle: 'italic', color: '#636366' }}>%</span>
              </div>
              <span style={{ ...cardValueStyle, color: '#34c759' }}>{companyProfitVal.toFixed(2)} USD</span>
            </div>

            <div style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
                <span style={cardLabelStyle}>Загальний чистий власний прибуток:</span>
                <input
                  type="number"
                  value={personalProfitPercent}
                  onChange={(e) => setPersonalProfitPercent(e.target.value)}
                  style={{ width: '50px', padding: '4px', fontSize: '12px', fontStyle: 'italic', textAlign: 'center', borderRadius: '6px', border: '1px solid #d1d1d6' }}
                />
                <span style={{ fontSize: '12px', fontStyle: 'italic', color: '#636366' }}>%</span>
              </div>
              <span style={{ ...cardValueStyle, color: '#007aff' }}>{personalProfitVal.toFixed(2)} USD</span>
            </div>
          </div>

          {/* Кнопка та форма додавання витрат */}
          <div style={{ marginBottom: '16px' }}>
            <button
              onClick={() => setIsAddExpenseOpen(!isAddExpenseOpen)}
              style={{ width: '100%', padding: '12px', backgroundColor: '#007aff', color: '#ffffff', border: 'none', borderRadius: '10px', fontWeight: 'bold', fontStyle: 'italic', fontSize: '14px', cursor: 'pointer' }}
            >
              {isAddExpenseOpen ? 'Закрити меню витрат' : '+ Додати витрату'}
            </button>
          </div>

          {isAddExpenseOpen && (
            <form onSubmit={handleAddExpense} style={{ backgroundColor: '#f2f2f7', padding: '14px', borderRadius: '12px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '11px', fontStyle: 'italic', color: '#636366', display: 'block', marginBottom: '2px' }}>1. Назва витрати</label>
                <input
                  type="text"
                  placeholder="Введіть назву витрати..."
                  value={newExpenseTitle}
                  onChange={(e) => setNewExpenseTitle(e.target.value)}
                  style={inputStyle}
                  required
                />
              </div>

              {/* 2. Вартість, 3. Валюта, 4. Одиниці в один рядок */}
              <div style={{ display: 'flex', gap: '6px' }}>
                <div style={{ flex: 1.5 }}>
                  <label style={{ fontSize: '11px', fontStyle: 'italic', color: '#636366', display: 'block', marginBottom: '2px' }}>2. Вартість</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={newExpenseAmount}
                    onChange={(e) => setNewExpenseAmount(e.target.value)}
                    style={inputStyle}
                    required
                  />
                </div>
                <div style={{ flex: 1.2 }}>
                  <label style={{ fontSize: '11px', fontStyle: 'italic', color: '#636366', display: 'block', marginBottom: '2px' }}>3. Валюта</label>
                  <select
                    value={newExpenseCurrency}
                    onChange={(e) => setNewExpenseCurrency(e.target.value)}
                    style={inputStyle}
                  >
                    <option value="UAH">UAH</option>
                    <option value="USD">USD</option>
                    <option value="USDT">USDT</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
                <div style={{ flex: 1.3 }}>
                  <label style={{ fontSize: '11px', fontStyle: 'italic', color: '#636366', display: 'block', marginBottom: '2px' }}>4. Одиниці</label>
                  <select
                    value={newExpenseCalcType}
                    onChange={(e) => setNewExpenseCalcType(e.target.value as any)}
                    style={inputStyle}
                  >
                    <option value="fixed">Фіксована</option>
                    <option value="m2">м. кв.</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                style={{ width: '100%', padding: '10px', backgroundColor: '#34c759', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontStyle: 'italic', cursor: 'pointer', marginTop: '6px' }}
              >
                Зберегти витрату
              </button>
            </form>
          )}

          {/* Список витрат з 5 пунктом (детальним розрахунком) */}
          <div>
            <h3 style={{ fontSize: '14px', fontStyle: 'italic', color: '#636366', marginBottom: '10px' }}>Список витрат проєкту:</h3>
            {expenses.length === 0 ? (
              <div style={{ fontSize: '12px', fontStyle: 'italic', color: '#8e8e93', textAlign: 'center' }}>Немає доданих витрат для цього проєкту.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {expenses.map((item) => {
                  const calculatedAmount = item.calcType === 'm2' ? item.amount * (projectArea > 0 ? projectArea : 1) : item.amount;
                  return (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', backgroundColor: '#f9f9fb', border: '1px solid #e5e5ea', borderRadius: '8px' }}>
                      <div>
                        <div style={{ fontSize: '13px', fontStyle: 'italic', fontWeight: 500 }}>{item.title}</div>
                        {/* 5 пункт у списку з розрахунком загальної вартості витрати */}
                        <div style={{ fontSize: '11px', fontStyle: 'italic', color: '#8e8e93' }}>
                          5. Загальна вартість: {item.calcType === 'm2' ? `${item.amount} * ${projectArea} м²` : 'Фіксована сума'} = {calculatedAmount.toFixed(2)} {item.currency}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '13px', fontStyle: 'italic', fontWeight: 'bold', color: '#ff3b30' }}>
                          -{calculatedAmount.toFixed(2)} {item.currency}
                        </span>
                        <button
                          onClick={() => handleDeleteExpense(item.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
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
  padding: '8px 8px',
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
