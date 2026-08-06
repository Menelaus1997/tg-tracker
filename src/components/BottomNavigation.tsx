import React from 'react';
import { TabType } from '../types';

interface BottomNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'create', label: 'Створити', icon: '➕' },
    { id: 'projects', label: 'Проекти', icon: '📁' },
    { id: 'boq', label: 'Об’єми', icon: '📐' },
    { id: 'analytics', label: 'Аналітика', icon: '📊' },
    { id: 'settings', label: 'Налаштування', icon: '⚙️' },
  ];

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: '65px',
      backgroundColor: '#1c1c1e',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      borderTop: '1px solid #2c2c2e',
      paddingBottom: 'env(safe-area-inset-bottom)',
      zIndex: 1000
    }}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            style={{
              background: 'none',
              border: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: isActive ? '#3897f0' : '#8e8e93',
              fontSize: '11px',
              cursor: 'pointer',
              flex: 1
            }}
          >
            <span style={{ fontSize: '20px', marginBottom: '2px' }}>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
