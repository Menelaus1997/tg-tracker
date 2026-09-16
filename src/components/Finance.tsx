import React, { useState, useEffect } from 'react';
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

  // Податки у відсотках (наприклад, 8%: 6% прихід + 2% буфер)
  const [taxPercent, setTaxPercent] = useState<string>('8');

  // Кастомна вартість за м.кв. для Вартість проєкту (Колонка 3)
  const [customPricePerM2, setCustomPricePerM2] = useState<string>('');

  const selectedProject = projects.find(p => p.id === selectedProjectId);
  const expenses: ExpenseItem[] = (selectedProject as any)?.expenses || [];

  useEffect(() => {
    setCustomPricePerM2('');
  }, [selectedProjectId]);

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

  const currentInputAmount = parseFloat(newExpenseAmount) || 0;
  const calculatedPreviewAmount = newExpenseCalcType === 'm2' 
    ? currentInputAmount * (projectArea > 0 ? projectArea : 1) 
    : currentInputAmount;

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpenseTitle.trim() || !newExpenseAmount || !selectedProject) return;

    const newItem: ExpenseItem = {
      id: Date.now().toString(),
      title: newExpenseTitle.trim(),
      amount: currentInputAmount,
      currency: newExpenseCurrency,
      calcType: newExpenseCalcType
    };

    const updatedExpenses = [newItem, ...expenses];
    const updatedProject: Project = {
      ...selectedProject,
      expenses: updatedExpenses as any
    };

    if (onUpdateProject) {
      onUpdateProject(updatedProject);
    }

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

  // 1. Собівартість (загальна сума з урахуванням витрат і м.кв.)
  const totalExpenses = expenses.reduce((acc, item) => {
    const baseVal = Number(item.amount) || 0;
    if (item.calcType === 'm2') {
      return acc + (baseVal * (projectArea > 0 ? projectArea : 1));
    }
    return acc + baseVal;
  }, 0);

  // 2. Вартість проєкту (загальна сума та ціна за м.кв.)
  // За замовчуванням стартуємо від собівартості + націнки, або якщо є ручне введення в колонці 3:
  const defaultTotalProjectCost = totalExpenses > 0 ? totalExpenses * 1.5 : 0; // умовний дефолт, якщо немає введення
  const defaultPricePerM2 = projectArea > 0 ? defaultTotalProjectCost / projectArea : 0;

  let finalTotalProjectCost = defaultTotalProjectCost;
  let finalPricePerM2 = defaultPricePerM2;

  if (customPricePerM2 !== '' && !isNaN(parseFloat(customPricePerM2)) && projectArea > 0) {
    finalPricePerM2 = parseFloat(customPricePerM2);
    finalTotalProjectCost = finalPricePerM2 * projectArea;
  } else if (projectArea > 0 && customPricePerM2 === '' && totalExpenses === 0) {
    finalPricePerM2 = 0;
    finalTotalProjectCost = 0;
  }

  // 3. Податки (на основі введеного % від загальної вартості проєкту)
  const taxRate = parseFloat(taxPercent) || 0;
  const taxTotal = finalTotalProjectCost * (taxRate / 100);
  const taxPerM2 = projectArea > 0 ? taxTotal / projectArea : 0;

  // 4. Націнка (як залишок: Загальна вартість - Податки - Собівартість)
  const markupTotal = finalTotalProjectCost - taxTotal - totalExpenses;
  const markupPerM2 = projectArea > 0 ? markupTotal / projectArea : 0;
  const markupPercent = finalTotalProjectCost > 0 ? (markupTotal / finalTotalProjectCost) * 100 : 0;

  // Відсоткові вираження для інших рядків
  const costPercent = 100;
  const expensesPercent = finalTotalProjectCost > 0 ? (totalExpenses / finalTotalProjectCost) * 100 : 0;

  const expensesPerM2 = projectArea > 0 ? totalExpenses / projectArea : 0;

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
    <div style={{ padding: '16px', maxWidth: '600px', margin: '0 auto', color: '#1c1c1e', fontFamily: "'SF Pro Condensed', -apple-system, sans-serif" }}>
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
              {projects.map((proj) => {
                const area = getProjectArea(proj);
                return (
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
                        <div style={{ display: 'flex', gap: '6px', marginTop: '2px' }}>
                          <span style={{ fontSize: '11px', fontStyle: 'italic', color: '#8e8e93', backgroundColor: '#ffffff', padding: '2px 6px', borderRadius: '4px', border: '1px solid #e5e5ea' }}>
                            📅 {getProjectDates(proj)}
                          </span>
                          {area > 0 && (
                            <span style={{ fontSize: '11px', fontStyle: 'italic', color: '#007aff', backgroundColor: '#ffffff', padding: '2px 6px', borderRadius: '4px', border: '1px solid #e5e5ea' }}>
                              📐 {area} м²
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <span style={{ fontSize: '16px', color: '#8e8e93' }}>➡️</span>
                  </div>
                );
              })}
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

          {/* Таблиця з 4 колонками */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
            
            {/* Рядок 1: Вартість проєкту */}
            <div style={rowStyle}>
              <div style={{ flex: 1.8, fontSize: '13px', fontStyle: 'italic', fontWeight: 500 }}>Вартість проєкту:</div>
              <div style={{ flex: 1, textAlign: 'center', fontSize: '13px', fontStyle: 'italic', color: '#636366' }}>{costPercent}%</div>
              <div style={{ flex: 1.4, textAlign: 'right' }}>
                {projectArea > 0 ? (
                  <input
                    type="number"
                    step="0.01"
                    value={customPricePerM2 !== '' ? customPricePerM2 : defaultPricePerM2.toFixed(2)}
                    onChange={(e) => setCustomPricePerM2(e.target.value)}
                    style={tableInputStyle}
                  />
                ) : (
                  <span style={{ fontSize: '12px', fontStyle: 'italic' }}>0.00</span>
                )}
                <span style={{ fontSize: '11px', fontStyle: 'italic', color: '#636366', marginLeft: '2px' }}> USD/м²</span>
              </div>
              <div style={{ flex: 1.4, textAlign: 'right', fontWeight: 'bold', fontSize: '13px', fontStyle: 'italic' }}>
                {finalTotalProjectCost.toFixed(2)} USD
              </div>
            </div>

            {/* Рядок 2: Собівартість */}
            <div style={rowStyle}>
              <div style={{ flex: 1.8, fontSize: '13px', fontStyle: 'italic', fontWeight: 500 }}>Собівартість</div>
              <div style={{ flex: 1, textAlign: 'center', fontSize: '13px', fontStyle: 'italic', color: '#636366' }}>{expensesPercent.toFixed(1)}%</div>
              <div style={{ flex: 1.4, textAlign: 'right', fontSize: '12px', fontStyle: 'italic', color: '#3a3a3c' }}>
                {expensesPerM2.toFixed(2)} USD/м²
              </div>
              <div style={{ flex: 1.4, textAlign: 'right', fontWeight: 'bold', fontSize: '13px', fontStyle: 'italic', color: '#ff3b30' }}>
                {totalExpenses.toFixed(2)} USD
              </div>
            </div>

            {/* Рядок 3: Націнка */}
            <div style={rowStyle}>
              <div style={{ flex: 1.8, fontSize: '13px', fontStyle: 'italic', fontWeight: 500 }}>Націнка</div>
              <div style={{ flex: 1, textAlign: 'center', fontSize: '13px', fontStyle: 'italic', color: '#34c759' }}>
                {markupPercent.toFixed(1)}%
              </div>
              <div style={{ flex: 1.4, textAlign: 'right', fontSize: '12px', fontStyle: 'italic', color: '#3a3a3c' }}>
                {markupPerM2.toFixed(2)} USD/м²
              </div>
              <div style={{ flex: 1.4, textAlign: 'right', fontWeight: 'bold', fontSize: '13px', fontStyle: 'italic', color: '#34c759' }}>
                {markupTotal.toFixed(2)} USD
              </div>
            </div>

            {/* Рядок 4: Податки */}
            <div style={rowStyle}>
              <div style={{ flex: 1.8, fontSize: '13px', fontStyle: 'italic', fontWeight: 500 }}>Податки</div>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
                <input
                  type="number"
                  value={taxPercent}
                  onChange={(e) => setTaxPercent(e.target.value)}
                  style={{ width: '40px', padding: '2px', fontSize: '12px', fontStyle: 'italic', textAlign: 'center', borderRadius: '4px', border: '1px solid #d1d1d6' }}
                />
                <span style={{ fontSize: '12px', fontStyle: 'italic', color: '#636366' }}>%</span>
              </div>
              <div style={{ flex: 1.4, textAlign: 'right', fontSize: '12px', fontStyle: 'italic', color: '#3a3a3c' }}>
                {taxPerM2.toFixed(2)} USD/м²
              </div>
              <div style={{ flex: 1.4, textAlign: 'right', fontWeight: 'bold', fontSize: '13px', fontStyle: 'italic', color: '#007aff' }}>
                {taxTotal.toFixed(2)} USD
              </div>
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

              <div style={{ padding: '8px 10px', backgroundColor: '#e5e5ea', borderRadius: '8px', fontSize: '12px', fontStyle: 'italic', color: '#3a3a3c', display: 'flex', justifyContent: 'space-between' }}>
                <span>5. Загальна вартість витрати:</span>
                <span style={{ fontWeight: 'bold', color: '#007aff' }}>
                  {calculatedPreviewAmount.toFixed(2)} {newExpenseCurrency}
                </span>
              </div>

              <button
                type="submit"
                style={{ width: '100%', padding: '10px', backgroundColor: '#34c759', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontStyle: 'italic', cursor: 'pointer', marginTop: '6px' }}
              >
                Зберегти витрату
              </button>
            </form>
          )}

          {/* Список витрат з можливістю видалення */}
          <div>
            <h3 style={{ fontSize: '14px', fontStyle: 'italic', color: '#636366', marginBottom: '10px' }}>Список витрат проєкту (Собівартість):</h3>
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
                        <div style={{ fontSize: '11px', fontStyle: 'italic', color: '#8e8e93' }}>
                          {item.calcType === 'm2' ? `${item.amount} * ${projectArea} м²` : 'Фіксована сума'} = {calculatedAmount.toFixed(2)} {item.currency}
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

const rowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '10px 12px',
  backgroundColor: '#f2f2f7',
  borderRadius: '10px',
  border: '1px solid #e5e5ea'
};

const tableInputStyle: React.CSSProperties = {
  width: '55px',
  padding: '2px 4px',
  backgroundColor: '#ffffff',
  border: '1px solid #d1d1d6',
  borderRadius: '4px',
  fontSize: '12px',
  fontStyle: 'italic',
  textAlign: 'right',
  outline: 'none',
  fontWeight: 'bold',
  color: '#1c1c1e'
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
