import React, { useState, useRef } from 'react';

interface TagManagerProps {
  tags: string[];
  selectedTags: string[];
  onSelectTag: (tag: string) => void;
  onAddTag: (newTag: string) => void;
  onDeleteTag: (tagToDelete: string) => void;
}

export const TagManager: React.FC<TagManagerProps> = ({
  tags,
  selectedTags,
  onSelectTag,
  onAddTag,
  onDeleteTag,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [newTagInput, setNewTagInput] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeContextMenu, setActiveContextMenu] = useState<string | null>(null);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Фільтрація тегів за пошуковим запитом
  const filteredTags = tags.filter((tag) =>
    tag.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Обробка довгого натискання (Long Press для тачскрінів)
  const handleTouchStart = (tag: string) => {
    timerRef.current = setTimeout(() => {
      setActiveContextMenu(tag);
    }, 600); // 600мс тримання
  };

  const handleTouchEnd = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  // Права кнопка миші (ПКМ для десктопа)
  const handleContextMenu = (e: React.MouseEvent, tag: string) => {
    e.preventDefault();
    setActiveContextMenu(tag);
  };

  const handleCreateTag = () => {
    if (newTagInput.trim()) {
      onAddTag(newTagInput.trim().toUpperCase());
      setNewTagInput('');
      setShowAddModal(false);
    }
  };

  return (
    <div style={{ padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
      {/* Верхня панель пошуку та додавання */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <span style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: '#888' }}>
            🔍
          </span>
          <input
            type="text"
            placeholder="Пошук тегів..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '6px 8px 6px 30px',
              borderRadius: '6px',
              border: '1px solid #ccc',
              boxSizing: 'border-box'
            }}
          />
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          style={{
            padding: '6px 12px',
            backgroundColor: '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          + Тег
        </button>
      </div>

      {/* Перелік тегів */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {filteredTags.map((tag) => {
          const isSelected = selectedTags.includes(tag);
          return (
            <div key={tag} style={{ position: 'relative' }}>
              <span
                onClick={() => onSelectTag(tag)}
                onContextMenu={(e) => handleContextMenu(e, tag)}
                onTouchStart={() => handleTouchStart(tag)}
                onTouchEnd={handleTouchEnd}
                style={{
                  display: 'inline-block',
                  padding: '4px 10px',
                  borderRadius: '16px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  userSelect: 'none',
                  backgroundColor: isSelected ? '#007bff' : '#e2e8f0',
                  color: isSelected ? '#ffffff' : '#334155',
                  transition: 'all 0.2s'
                }}
              >
                #{tag}
              </span>

              {/* Контекстне меню (редагування/видалення) */}
              {activeContextMenu === tag && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    zIndex: 10,
                    backgroundColor: '#fff',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    borderRadius: '6px',
                    padding: '4px 0',
                    minWidth: '100px'
                  }}
                >
                  <button
                    onClick={() => {
                      onDeleteTag(tag);
                      setActiveContextMenu(null);
                    }}
                    style={{
                      width: '100%',
                      padding: '6px 12px',
                      border: 'none',
                      backgroundColor: 'transparent',
                      color: '#ef4444',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    🗑 Видалити
                  </button>
                  <button
                    onClick={() => setActiveContextMenu(null)}
                    style={{
                      width: '100%',
                      padding: '6px 12px',
                      border: 'none',
                      backgroundColor: 'transparent',
                      color: '#64748b',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    Скасувати
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Модальне вікно створення нового тегу */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100
        }}>
          <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '8px', width: '280px' }}>
            <h4 style={{ margin: '0 0 12px 0' }}>Створити новий тег</h4>
            <input
              type="text"
              placeholder="Назва тегу (напр. ВІЗУАЛ)"
              value={newTagInput}
              onChange={(e) => setNewTagInput(e.target.value)}
              style={{ width: '100%', padding: '8px', marginBottom: '12px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button onClick={() => setShowAddModal(false)} style={{ padding: '6px 12px', border: 'none', borderRadius: '4px' }}>
                Скасувати
              </button>
              <button onClick={handleCreateTag} style={{ padding: '6px 12px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px' }}>
                Додати
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
