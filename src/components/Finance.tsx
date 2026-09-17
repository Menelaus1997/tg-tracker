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
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  
  // Стан для згортання/розгортання блоку собівартості
  const [isExpensesListOpen, setIsExpensesListOpen] = useState(false);
  
  const [newExpenseTitle, setNewExpenseTitle] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState<string>('');
  const [newExpenseCurrency, setNewExpenseCurrency] = useState('USD');
  const [newExpenseCalcType, setNewExpenseCalcType] = useState<'m2' | 'fixed'>('fixed');

  const [taxPercent, setTaxPercent] = useState<string>('8');

  const selectedProject = projects.find(p => p.id === selectedProjectId);
  
  // 1. Автоматично збираємо виконавців та їхні ролі зі стадій проєкту (якщо вони там призначені)
  const getProjectTeamExpenses = (): ExpenseItem[] => {
    if (!selectedProject || !selectedProject.stages) return [];
    
    const teamMap = new Map<string, ExpenseItem>();

    selectedProject.stages.forEach((stage: any) => {
      // Перевіряємо, чи в стадії вказано виконавця/роль (адаптуємо під можливі поля в структурі стадії)
      const assignee = stage.assignee || stage.executor || stage.teamMember;
      const role = stage.role || stage.position || 'Виконавець';

      if (assignee) {
        const title = `${assignee} (${role})`;
        if (!teamMap.has(title)) {
          teamMap.set(title, {
            id: `auto-${stage.id || Math.random()}`,
            title: title,
            amount: 0, // Суму можна налаштувати або залишити за замовчуванням
            currency: 'USD',
            calcType: 'fixed'
          });
        }
      }
    });

    return Array.from(teamMap.values());
  };

  // Ручні витрати, які користувач додав самостійно через форму
  const manualExpenses: ExpenseItem[] = (selectedProject as any)?.expenses || [];

  // Об'єднуємо автоматичні витрати з команди та ручні витрати
  const autoTeamExpenses = getProjectTeamExpenses();
  // Щоб не було дублікатів за назвою
  const manualFiltered = manualExpenses.filter(m => !autoTeamExpenses.some(a => a.title === m.title));
  const expenses: ExpenseItem[] = [...autoTeamExpenses, ...manualFiltered];
  
  const usdRate = (selectedProject as any)?.usdRate ?? '41.50';
  const customPricePerM2 = (selectedProject as any)?.customPricePerM2 ?? '';

  const setUsdRate = (rate: string) => {
    if (!selectedProject || !onUpdateProject) return;
    const updatedProject: Project = {
      ...selectedProject,
      usdRate: rate as any
    };
    onUpdateProject(updatedProject);
  };

  const setCustomPricePerM2 = (price: string) => {
    if (!selectedProject || !onUpdateProject) return;
    const updatedProject: Project = {
      ...selectedProject,
      customPricePerM2: price as any
    };
    onUpdateProject(updatedProject);
  };

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
  const currentRate = parseFloat(usdRate) || 1;

  const formatUAH = (val: number): string => {
    const parts = val.toFixed(2).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return `${parts.join('.')} UAH`;
  };

  const currentInputAmount = parseFloat(newExpenseAmount) || 0;
  const calculatedPreviewAmount = newExpenseCalcType === 'm2' 
    ? currentInputAmount * (projectArea > 0 ? projectArea : 1) 
    : currentInputAmount;

  const handleOpenAddForm = () => {
    setEditingExpenseId(null);
    setNewExpenseTitle('');
    setNewExpenseAmount('');
    setNewExpenseCurrency('USD');
    setNewExpenseCalcType('fixed');
    setIsAddExpenseOpen(true);
  };

  const handleEditExpenseClick = (item: ExpenseItem) => {
    setEditingExpenseId(item.id);
    setNewExpenseTitle(item.title);
    setNewExpenseAmount(String(item.amount));
    setNewExpenseCurrency(item.currency);
    setNewExpenseCalcType(item.calcType);
    setIsAddExpenseOpen(true);
  };

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpenseTitle.trim() || !newExpenseAmount || !selectedProject) return;

    let updatedExpenses: ExpenseItem[];

    if (editingExpenseId) {
      updatedExpenses = manualExpenses.map(item => 
        item.id === editingExpenseId 
          ? { ...item, title: newExpenseTitle.trim(), amount: currentInputAmount, currency: newExpenseCurrency, calcType: newExpenseCalcType }
          : item
      );
    } else {
      const newItem: ExpenseItem = {
        id: Date.now().toString(),
        title: newExpenseTitle.trim(),
        amount: currentInputAmount,
        currency: newExpenseCurrency,
        calcType: newExpenseCalcType
      };
      updatedExpenses = [newItem, ...manualExpenses];
    }

    const updatedProject: Project = {
      ...selectedProject,
      expenses: updatedExpenses as any
    };

    if (onUpdateProject) {
      onUpdateProject(updatedProject);
    }

    setNewExpenseTitle('');
    setNewExpenseAmount('');
    setEditingExpenseId(null);
    setIsAddExpenseOpen(false);
  };

  const handleDeleteExpense = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!selectedProject) return;
    // Видаляємо лише з ручних витрат (автоматичні прив'язані до команди проєкту)
    const updatedExpenses = manualExpenses.filter(item => item.id !== id);
    
    const updatedProject: Project = {
      ...selectedProject,
      expenses: updatedExpenses as any
    };

    if (onUpdateProject) {
      onUpdateProject(updatedProject);
    }
  };

  const totalExpenses = expenses.reduce((acc, item) => {
    const baseVal = Number(item.amount) || 0;
    if (item.calcType === 'm2') {
      return acc + (baseVal * (projectArea > 0 ? projectArea : 1));
    }
    return acc + baseVal;
  }, 0);

  const defaultTotalProjectCost = totalExpenses > 0 ? totalExpenses * 1.5 : 0;
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

  const taxRate = parseFloat(taxPercent) || 0;
  const taxTotal = finalTotalProjectCost * (taxRate / 100);
  const taxPerM2 = projectArea > 0 ? taxTotal / projectArea : 0;

  const markupTotal = finalTotalProjectCost - taxTotal - totalExpenses;
  const markupPerM2 = projectArea > 0 ? markupTotal / projectArea : 0;
  const markupPercent = finalTotalProjectCost > 0 ? (markupTotal / finalTotalProjectCost) * 100 : 0;

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
    <div style={{ padding: '16px', maxWidth: '650px', margin: '0 auto', color: '#1c1c1e', fontFamily: "'SF Pro Condensed', -apple-system, sans-serif" }}>
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

          <div style={{ padding: '12px 14px', backgroundColor: '#e5e5ea', borderRadius: '10px', marginBottom: '16px', border: '1px solid #d1d1d6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 'bold', fontStyle: 'italic' }}>{selectedProject?.name}</div>
              <div style={{ fontSize: '12px', fontStyle: 'italic', color: '#636366' }}>ID: {selectedProject?.id}</div>
              <div style={{ fontSize: '11px', fontStyle: 'italic', color: '#8e8e93', marginTop: '2px' }}>
                📅 {getProjectDates(selectedProject!)} {projectArea > 0 ? `| 📐 Площа: ${projectArea} м²` : ''}
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#ffffff', padding: '6px 10px', borderRadius: '8px', border: '1px solid #d1d1d6' }}>
              <span style={{ fontSize: '11px', fontStyle: 'italic', color: '#636366' }}>Курс USD/UAH:</span>
              <input
                type="text"
                inputMode="decimal"
                value={usdRate}
                onChange={(e) => setUsdRate(e.target.value)}
                style={{ width: '45px', border: 'none', fontSize: '12px', fontStyle: 'italic', fontWeight: 'bold', textAlign: 'center', outline: 'none' }}
              />
            </div>
          </div>

          {/* Основна таблиця фінансів */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
            
            {/* Рядок 1: Загальна вартість */}
            <div style={gridRowStyle}>
              <div style={colNameStyle}>Загальна вартість:</div>
              <div style={colPercentStyle}>{costPercent}%</div>
              <div style={colM2Style}>
                {projectArea > 0 ? (
                  <input
                    type="text"
                    inputMode="decimal"
                    value={customPricePerM2 !== '' ? customPricePerM2 : defaultPricePerM2.toFixed(2)}
                    onChange={(e) => setCustomPricePerM2(e.target.value)}
                    style={seamlessInputStyle}
                  />
                ) : (
                  <span>0.00</span>
                )}
                <span style={{ color: '#636366', marginLeft: '2px' }}>USD/м²</span>
              </div>
              <div style={colTotalStyle}>
                <div>{finalTotalProjectCost.toFixed(2)} USD</div>
                <div style={{ fontSize: '11px', color: '#636366', fontWeight: 'normal' }}>
                  {formatUAH(finalTotalProjectCost * currentRate)}
                </div>
              </div>
            </div>

            {/* Рядок 2: Націнка */}
            <div style={gridRowStyle}>
              <div style={colNameStyle}>Націнка</div>
              <div style={{ ...colPercentStyle, color: '#34c759' }}>{markupPercent.toFixed(1)}%</div>
              <div style={colM2Style}>
                <span>{markupPerM2.toFixed(2)}</span>
                <span style={{ color: '#636366', marginLeft: '2px' }}>USD/м²</span>
              </div>
              <div style={{ ...colTotalStyle, color: '#34c759' }}>
                <div>{markupTotal.toFixed(2)} USD</div>
                <div style={{ fontSize: '11px', color: '#636366', fontWeight: 'normal' }}>
                  {formatUAH(markupTotal * currentRate)}
                </div>
              </div>
            </div>

            {/* Рядок 3: Податки */}
            <div style={gridRowStyle}>
              <div style={colNameStyle}>Податки</div>
              <div style={{ ...colPercentStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
                <input
                  type="text"
                  inputMode="numeric"
                  value={taxPercent}
                  onChange={(e) => setTaxPercent(e.target.value)}
                  style={taxInputStyle}
                />
                <span style={{ fontSize: '12px', fontStyle: 'italic', color: '#636366' }}>%</span>
              </div>
              <div style={colM2Style}>
                <span>{taxPerM2.toFixed(2)}</span>
                <span style={{ color: '#636366', marginLeft: '2px' }}>USD/м²</span>
              </div>
              <div style={{ ...colTotalStyle, color: '#007aff' }}>
                <div>{taxTotal.toFixed(2)} USD</div>
                <div style={{ fontSize: '11px', color: '#636366', fontWeight: 'normal' }}>
                  {formatUAH(taxTotal * currentRate)}
                </div>
              </div>
            </div>

            {/* Рядок 4: Собівартість (зі списком учасників та витрат) */}
            <div style={{ backgroundColor: '#f2f2f7', border: '1px solid #e5e5ea', borderRadius: '10px', overflow: 'hidden' }}>
              <div 
                onClick={() => setIsExpensesListOpen(!isExpensesListOpen)}
                style={{ ...gridRowStyle, border: 'none', backgroundColor: 'transparent', cursor: 'pointer', userSelect: 'none' }}
              >
                <div style={{ ...colNameStyle, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>Собівартість</span>
                  <span style={{ fontSize: '11px', color: '#48484a', fontWeight: 'bold' }}>
                    {isExpensesListOpen ? '▲' : '▼'}
                  </span>
                </div>
                <div style={colPercentStyle}>{expensesPercent.toFixed(1)}%</div>
                <div style={colM2Style}>
                  <span>{expensesPerM2.toFixed(2)}</span>
                  <span style={{ color: '#636366', marginLeft: '2px' }}>USD/м²</span>
                </div>
                <div style={{ ...colTotalStyle, color: '#ff3b30' }}>
                  <div>{totalExpenses.toFixed(2)} USD</div>
                  <div style={{ fontSize: '11px', color: '#8e8e93', fontWeight: 'normal' }}>
                    {formatUAH(totalExpenses * currentRate)}
                  </div>
                </div>
              </div>

              {/* Випадаюче меню витрат та команди всередині Собівартості */}
              {isExpensesListOpen && (
                <div style={{ padding: '0 12px 12px 12px', borderTop: '1px solid #e5e5ea', marginTop: '4px', paddingTop: '10px' }}>
                  
                  {/* Кнопка Додати витрату всередині меню */}
                  <div style={{ marginBottom: '10px' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isAddExpenseOpen) {
                          setIsAddExpenseOpen(false);
                        } else {
                          handleOpenAddForm();
                        }
                      }}
                      style={{ width: '100%', padding: '10px', backgroundColor: '#007aff', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontStyle: 'italic', fontSize: '13px', cursor: 'pointer' }}
                    >
                      {isAddExpenseOpen ? 'Закрити меню витрат' : '+ Додати витрату'}
                    </button>
                  </div>

                  {isAddExpenseOpen && (
                    <form onSubmit={handleSaveExpense} style={{ backgroundColor: '#ffffff', padding: '12px', borderRadius: '10px', marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '8px', border: '1px solid #d1d1d6' }}>
                      <div style={{ fontSize: '12px', fontWeight: 'bold', fontStyle: 'italic', color: '#007aff' }}>
                        {editingExpenseId ? 'Редагування витрати' : 'Нова витрата'}
                      </div>
                      <div>
                        <label style={{ fontSize: '10px', fontStyle: 'italic', color: '#636366', display: 'block', marginBottom: '2px' }}>1. Назва витрати</label>
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
                          <label style={{ fontSize: '10px', fontStyle: 'italic', color: '#636366', display: 'block', marginBottom: '2px' }}>2. Вартість</label>
                          <input
                            type="text"
                            inputMode="decimal"
                            placeholder="0.00"
                            value={newExpenseAmount}
                            onChange={(e) => setNewExpenseAmount(e.target.value)}
                            style={inputStyle}
                            required
                          />
                        </div>
                        <div style={{ flex: 1.2 }}>
                          <label style={{ fontSize: '10px', fontStyle: 'italic', color: '#636366', display: 'block', marginBottom: '2px' }}>3. Валюта</label>
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
                          <label style={{ fontSize: '10px', fontStyle: 'italic', color: '#636366', display: 'block', marginBottom: '2px' }}>4. Одиниці</label>
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

                      <div style={{ padding: '6px 8px', backgroundColor: '#f2f2f7', borderRadius: '6px', fontSize: '11px', fontStyle: 'italic', color: '#3a3a3c', display: 'flex', justifyContent: 'space-between' }}>
                        <span>5. Загальна вартість:</span>
                        <span style={{ fontWeight: 'bold', color: '#007aff' }}>
                          {calculatedPreviewAmount.toFixed(2)} {newExpenseCurrency} {newExpenseCurrency !== 'UAH' ? `(~ ${formatUAH(calculatedPreviewAmount * (newExpenseCurrency === 'USD' ? currentRate : 1))})` : ''}
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                        <button
                          type="submit"
                          style={{ flex: 1, padding: '8px', backgroundColor: '#34c759', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontStyle: 'italic', cursor: 'pointer', fontSize: '12px' }}
                        >
                          {editingExpenseId ? 'Оновити витрату' : 'Зберегти витрату'}
                        </button>
                        {editingExpenseId && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingExpenseId(null);
                              setIsAddExpenseOpen(false);
                            }}
                            style={{ padding: '8px 12px', backgroundColor: '#8e8e93', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontStyle: 'italic', cursor: 'pointer', fontSize: '12px' }}
                          >
                            Скасувати
                          </button>
                        )}
                      </div>
                    </form>
                  )}

                  {/* Список витрат та мігрованих членів команди проєкту */}
                  {expenses.length === 0 ? (
                    <div style={{ fontSize: '12px', fontStyle: 'italic', color: '#8e8e93', textAlign: 'center', padding: '8px' }}>Немає призначених виконавців чи витрат для цього проєкту.</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {expenses.map((item) => {
                        const calculatedAmount = item.calcType === 'm2' ? item.amount * (projectArea > 0 ? projectArea : 1) : item.amount;
                        const isAutoTeam = item.id.startsWith('auto-');
                        return (
                          <div 
                            key={item.id} 
                            onClick={() => !isAutoTeam && handleEditExpenseClick(item)}
                            style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'center', 
                              padding: '8px 10px', 
                              backgroundColor: '#ffffff', 
                              border: editingExpenseId === item.id ? '2px solid #007aff' : '1px solid #e5e5ea', 
                              borderRadius: '8px',
                              cursor: isAutoTeam ? 'default' : 'pointer'
                            }}
                            title={isAutoTeam ? "Автоматично підтягнуто з команди проєкту" : "Натисніть, щоб редагувати витрату"}
                          >
                            <div>
                              <div style={{ fontSize: '12px', fontStyle: 'italic', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                {isAutoTeam && <span style={{ fontSize: '10px', color: '#007aff', backgroundColor: '#e5e5ea', padding: '1px 4px', borderRadius: '4px' }}>Команда</span>}
                                {item.title}
                              </div>
                              <div style={{ fontSize: '10px', fontStyle: 'italic', color: '#8e8e93' }}>
                                {item.calcType === 'm2' ? `${item.amount} * ${projectArea} м²` : (isAutoTeam && item.amount === 0 ? 'Виконавець проєкту (сума не вказана)' : 'Фіксована сума')} {item.amount > 0 ? `= ${calculatedAmount.toFixed(2)} ${item.currency}` : ''}
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{ textAlign: 'right' }}>
                                <span style={{ fontSize: '12px', fontStyle: 'italic', fontWeight: 'bold', color: '#ff3b30' }}>
                                  -{calculatedAmount.toFixed(2)} {item.currency}
                                </span>
                                <div style={{ fontSize: '9px', color: '#8e8e93' }}>
                                  -{formatUAH(calculatedAmount * (item.currency === 'USD' ? currentRate : 1))}
                                </div>
                              </div>
                              {!isAutoTeam && (
                                <button
                                  onClick={(e) => handleDeleteExpense(e, item.id)}
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px' }}
                                  title="Видалити"
                                >
                                  🗑️
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                </div>
              )}
            </div>

          </div>

        </div>
      )}
    </div>
  );
};

const gridRowStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1.5fr 0.9fr 1.6fr 1.3fr',
  alignItems: 'center',
  padding: '10px 12px',
  backgroundColor: '#f2f2f7',
  borderRadius: '10px',
  border: '1px solid #e5e5ea'
};

const colNameStyle: React.CSSProperties = {
  fontSize: '13px',
  fontStyle: 'italic',
  fontWeight: 500
};

const colPercentStyle: React.CSSProperties = {
  textAlign: 'center',
  fontSize: '13px',
  fontStyle: 'italic',
  color: '#636366'
};

const colM2Style: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: '3px',
  fontSize: '12px',
  fontStyle: 'italic',
  color: '#3a3a3c',
  textAlign: 'right',
  paddingRight: '4px'
};

const colTotalStyle: React.CSSProperties = {
  textAlign: 'right',
  fontWeight: 'bold',
  fontSize: '13px',
  fontStyle: 'italic'
};

const seamlessInputStyle: React.CSSProperties = {
  width: '56px',
  padding: '1px 2px',
  backgroundColor: 'transparent',
  border: 'none',
  borderBottom: 'none',
  borderRadius: '0px',
  fontSize: '12px',
  fontStyle: 'italic',
  textAlign: 'right',
  outline: 'none',
  fontWeight: 'bold',
  color: '#1c1c1e'
};

const taxInputStyle: React.CSSProperties = {
  width: '40px',
  padding: '2px',
  backgroundColor: '#ffffff',
  border: '1px solid #d1d1d6',
  borderRadius: '4px',
  fontSize: '12px',
  fontStyle: 'italic',
  textAlign: 'center',
  outline: 'none'
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
