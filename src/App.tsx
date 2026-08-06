import React, { useState } from 'react';
import { BottomNavigation } from './components/BottomNavigation';
import { CreateProject } from './components/CreateProject';
import { TabType } from './types';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('create');

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#000000',
      paddingBottom: '80px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {activeTab === 'create' && <CreateProject />}
      {activeTab === 'projects' && <div style={{ padding: '20px', color: '#fff' }}>Розділ Проекти</div>}
      {activeTab === 'boq' && <div style={{ padding: '20px', color: '#fff' }}>Розділ Об’єми</div>}
      {activeTab === 'analytics' && <div style={{ padding: '20px', color: '#fff' }}>Розділ Аналітика</div>}
      {activeTab === 'settings' && <div style={{ padding: '20px', color: '#fff' }}>Розділ Налаштування</div>}

      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default App;
