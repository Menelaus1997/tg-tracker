{/* Блок "Дані" */}
{isSuperAdmin && enableData && (
  <div style={{ backgroundColor: '#f2f2f7', padding: '14px', borderRadius: '12px', marginBottom: '16px' }}>
    <div 
      onClick={() => setIsGeneralDataOpen(!isGeneralDataOpen)}
      style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
    >
      <span style={{ fontSize: '12px', color: '#8e8e93' }}>{isGeneralDataOpen ? '▲' : '▼'}</span>
      <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>Дані</h3>
    </div>

    {isGeneralDataOpen && (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
        {generalRows.map((r, index) => (
          <div 
            key={r.id} 
            draggable={isSuperAdmin}
            onDragStart={() => handleDataDragStart(index)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDataDrop(index)}
            style={{ display: 'flex', gap: '8px', alignItems: 'center', cursor: isSuperAdmin ? 'grab' : 'default' }}
          >
            {/* 1-й стовпчик: Назва рядка (гнучкий, займає весь залишок і підтягується до краю 2-го) */}
            <input
              type="text"
              placeholder="Назва рядка"
              value={r.label || ''}
              onChange={(e) => handleUpdateGeneralRow(r.id, 'label', e.target.value)}
              disabled={!isSuperAdmin}
              style={{ ...cardInputStyle, flex: 1, height: '28px', padding: '2px 8px', boxSizing: 'border-box' }}
            />

            {/* 2-й стовпчик: Значення (автоматично підлаштовується під довжину тексту + запас) */}
            <input
              type="text"
              placeholder="Значення"
              value={r.value}
              onChange={(e) => handleUpdateGeneralRow(r.id, 'value', e.target.value)}
              disabled={!isSuperAdmin}
              style={{ 
                ...cardInputStyle, 
                flex: 'none', 
                width: `${Math.max((r.value || '').length + 4, 8)}ch`, 
                minWidth: '70px',
                height: '28px', 
                padding: '2px 8px', 
                boxSizing: 'border-box',
                textAlign: 'center' 
              }}
            />

            {isSuperAdmin && (
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center', width: '70px', justifyContent: 'center' }}>
                <button onClick={() => handleAddRowAfter(index)} style={compactPlusBtnStyle}>+</button>
                <button onClick={() => handleDeleteGeneralRow(r.id)} style={{ ...compactPlusBtnStyle, color: '#ff3b30' }}>🗑️</button>
              </div>
            )}
          </div>
        ))}
      </div>
    )}
  </div>
)}
