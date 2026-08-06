import React from 'react';
import { TabType } from '../types';

interface BottomNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ activeTab, onTabChange }) => {
  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: '56px',
      backgroundColor: '#ffffff',
      borderTop: '1px solid #f0f0f0',
      display: 'flex',
      justify: 'space-around',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <button
        onClick={() => onTabChange('create')}
        style={navBtnStyle}
        title="Створити"
      >
        <span style={{ fontSize: '24px', opacity: activeTab === 'create' ? 1 : 0.4 }}>➕</span>
      </button>

      <button
        onClick={() => onTabChange('projects')}
        style={navBtnStyle}
        title="Проекти"
      >
        <span style={{ fontSize: '24px', opacity: activeTab === 'projects' ? 1 : 0.4 }}>📁</span>
      </button>

      {/* 📐 ВОР (Відомість об'ємів робіт) */}
      <button
        onClick={() => onTabChange('boq')}
        style={navBtnStyle}
        title="Відомість об'ємів робіт"
      >
        <span style={{ fontSize: '24px', opacity: activeTab === 'boq' ? 1 : 0.4 }}>📐</span>
      </button>

      <button
        onClick={() => onTabChange('analytics')}
        style={navBtnStyle}
        title="Аналітика"
      >
        <span style={{ fontSize: '24px', opacity: activeTab === 'analytics' ? 1 : 0.4 }}>📊</span>
      </button>

      <button
        onClick={() => onTabChange('settings')}
        style={navBtnStyle}
        title="Налаштування"
      >
        <span style={{ fontSize: '24px', opacity: activeTab === 'settings' ? 1 : 0.4 }}>⚙️</span>
      </button>
    </div>
  );
};

const navBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  display: 'flex',
  alignItems: 'center',
  justify: 'center',
  cursor: 'pointer',
  padding: '8px',
  flex: 1
};
