import React from 'react';
import { TabType } from '../types';

interface BottomNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs: { id: TabType; icon: string }[] = [
    { id: 'create', icon: '➕' },
    { id: 'projects', icon: '📁' },
    { id: 'boq', icon: '📐' },
    { id: 'analytics', icon: '📊' },
    { id: 'settings', icon: '⚙️' },
  ];

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: '60px',
      backgroundColor: '#ffffff',
      display: 'flex',
      justify: 'space-around',
      alignItems: 'center',
      borderTop: '1px solid #e5e5ea',
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
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '26px',
              opacity: isActive ? 1 : 0.35,
              transform: isActive ? 'scale(1.15)' : 'scale(1)',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
              flex: 1,
              height: '100%'
            }}
          >
            {tab.icon}
          </button>
        );
      })}
    </nav>
  );
};
