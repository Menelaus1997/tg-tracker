import React, { useState } from 'react';
import { TabType } from './types';
import { BottomNavigation } from './components/BottomNavigation';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('projects');

  return (
    <div style={{ paddingBottom: '75px', minHeight: '100vh', backgroundColor: '#000', color: '#fff' }}>
      <main style={{ padding: '16px' }}>
        {activeTab === 'create' && <div><h2>➕ Створення проекту</h2></div>}
        {activeTab === 'projects' && <div><h2>📁 Існуючі проекти</h2></div>}
        {activeTab === 'boq' && <div><h2>📐 Відомість об'ємів</h2></div>}
        {activeTab === 'analytics' && <div><h2>📊 Аналітика</h2></div>}
        {activeTab === 'settings' && <div><h2>⚙️ Налаштування</h2></div>}
      </main>

      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default App;
