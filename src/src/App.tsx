import React, { useState, useEffect } from 'react';
import { Project, UserRole } from './types';
import { initialProjects, mockUsers } from './data/mockData';
import { WindowHeader } from './components/WindowHeader';
import { TagManager } from './components/TagManager';
import { ProjectCard } from './components/ProjectCard';

export const App: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [currentRole, setCurrentRole] = useState<UserRole>('admin');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);

  // Ініціалізація Telegram WebApp SDK при завантаженні
  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand(); // Розгортаємо додаток на весь екран за замовчуванням
    }

    // Збір усіх унікальних тегів із проектів
    const tagsSet = new Set<string>();
    initialProjects.forEach((p) => p.tags.forEach((t) => tagsSet.add(t)));
    setAllTags(Array.from(tagsSet));
  }, []);

  // Оновлення проекту в стані
  const handleUpdateProject = (updatedProject: Project) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === updatedProject.id ? updatedProject : p))
    );
  };

  // Вибір / зняття вибору тегу
  const handleSelectTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // Додавання нового тегу
  const handleAddTag = (newTag: string) => {
    if (!allTags.includes(newTag)) {
      setAllTags((prev) => [...prev, newTag]);
    }
  };

  // Видалення тегу
  const handleDeleteTag = (tagToDelete: string) => {
    setAllTags((prev) => prev.filter((t) => t !== tagToDelete));
    setSelectedTags((prev) => prev.filter((t) => t !== tagToDelete));
  };

  // Фільтрація проектів за вибраними тегами
  const filteredProjects = projects.filter((project) => {
    if (selectedTags.length === 0) return true;
    return selectedTags.every((tag) => project.tags.includes(tag));
  });

  // Загальна статистика для дашборду (тільки Admin/Manager)
  const totalProjects = projects.length;
  const completedProjects = projects.filter((p) => p.currentStage === 'completed').length;
  const avgProgress = Math.round(
    projects.reduce((acc, p) => acc + p.completionPercentage, 0) / (totalProjects || 1)
  );

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f1f5f9',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        paddingBottom: '24px',
      }}
    >
      {/* 1. Верхня шапка Windows-style */}
      <WindowHeader title="TG Tracker — Управління проектами" />

      <div style={{ padding: '16px', maxWidth: '600px', margin: '0 auto' }}>
        {/* 2. Панель перемикання ролей (Для демонстрації та тестування) */}
        <div
          style={{
            backgroundColor: '#fff',
            padding: '10px 14px',
            borderRadius: '8px',
            marginBottom: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>
            👤 Роль:
          </span>
          <select
            value={currentRole}
            onChange={(e) => setCurrentRole(e.target.value as UserRole)}
            style={{
              padding: '4px 8px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              fontSize: '12px',
              fontWeight: 'bold',
            }}
          >
            <option value="admin">Admin (Адміністратор)</option>
            <option value="manager">Manager (Менеджер)</option>
            <option value="executor">Executor (Виконавець)</option>
          </select>
        </div>

        {/* 3. Блок аналітики / Дашборд (Тільки для Admin та Manager) */}
        {(currentRole === 'admin' || currentRole === 'manager') && (
          <div
            style={{
              backgroundColor: '#0f172a',
              color: '#fff',
              padding: '14px',
              borderRadius: '10px',
              marginBottom: '16px',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '8px',
              textAlign: 'center',
            }}
          >
            <div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#38bdf8' }}>{totalProjects}</div>
              <div style={{ fontSize: '10px', color: '#94a3b8' }}>Всього проектів</div>
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#4ade80' }}>{completedProjects}</div>
              <div style={{ fontSize: '10px', color: '#94a3b8' }}>Завершено</div>
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#fbbf24' }}>{avgProgress}%</div>
              <div style={{ fontSize: '10px', color: '#94a3b8' }}>Сер. прогрес</div>
            </div>
          </div>
        )}

        {/* 4. Блок управління тегами */}
        <div style={{ marginBottom: '16px' }}>
          <TagManager
            tags={allTags}
            selectedTags={selectedTags}
            onSelectTag={handleSelectTag}
            onAddTag={handleAddTag}
            onDeleteTag={handleDeleteTag}
          />
        </div>

        {/* 5. Список проектів */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h4 style={{ margin: 0, color: '#334155' }}>
              Проекти ({filteredProjects.length})
            </h4>
            {selectedTags.length > 0 && (
              <button
                onClick={() => setSelectedTags([])}
                style={{ border: 'none', background: 'none', color: '#ef4444', fontSize: '12px', cursor: 'pointer' }}
              >
                Очистити фільтри
              </button>
            )}
          </div>

          {filteredProjects.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px', color: '#64748b', backgroundColor: '#fff', borderRadius: '8px' }}>
              Проектів за вибраними тегами не знайдено.
            </div>
          ) : (
            filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onUpdateProject={handleUpdateProject}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
