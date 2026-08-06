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
      height: '60px',
      backgroundColor: '#ffffff',
      borderTop: '1px solid #e5e5ea',
      display: 'flex',
      justify: 'space-around',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <button
        onClick={() => onTabChange('create')}
        style={{ ...navBtnStyle, color: activeTab === 'create' ? '#007aff' : '#8e8e93' }}
      >
        <span style={{ fontSize: '20px' }}>➕</span>
        <span style={{ fontSize: '10px', marginTop: '2px' }}>Створити</span>
      </button>

      <button
        onClick={() => onTabChange('projects')}
        style={{ ...navBtnStyle, color: activeTab === 'projects' ? '#007aff' : '#8e8e93' }}
      >
        <span style={{ fontSize: '20px' }}>📁</span>
        <span style={{ fontSize: '10px', marginTop: '2px' }}>Проекти</span>
      </button>

      {/* НОВА ВКЛАДКА КОМАНДА */}
      <button
        onClick={() => onTabChange('team')}
        style={{ ...navBtnStyle, color: activeTab === 'team' ? '#007aff' : '#8e8e93' }}
      >
        <span style={{ fontSize: '20px' }}>👥</span>
        <span style={{ fontSize: '10px', marginTop: '2px' }}>Команда</span>
      </button>

      <button
        onClick={() => onTabChange('analytics')}
        style={{ ...navBtnStyle, color: activeTab === 'analytics' ? '#007aff' : '#8e8e93' }}
      >
        <span style={{ fontSize: '20px' }}>📊</span>
        <span style={{ fontSize: '10px', marginTop: '2px' }}>Аналітика</span>
      </button>

      <button
        onClick={() => onTabChange('settings')}
        style={{ ...navBtnStyle, color: activeTab === 'settings' ? '#007aff' : '#8e8e93' }}
      >
        <span style={{ fontSize: '20px' }}>⚙️</span>
        <span style={{ fontSize: '10px', marginTop: '2px' }}>Налаштування</span>
      </button>
    </div>
  );
};

const navBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justify: 'center',
  cursor: 'pointer',
  padding: '4px'
};
