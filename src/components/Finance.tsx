import React from 'react';
import { Project } from '../App';

interface FinanceProps {
  projects: Project[];
}

export const Finance: React.FC<FinanceProps> = ({ projects }) => {
  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto', color: '#1c1c1e' }}>
      <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>💰 Фінанси та прибутковість</h2>
      <div style={{ backgroundColor: '#f2f2f7', padding: '20px', borderRadius: '12px', textAlign: 'center', color: '#8e8e93' }}>
        <p style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>Форма фінансів та розрахунків готується до налаштування.</p>
      </div>
    </div>
  );
};

export default Finance;
