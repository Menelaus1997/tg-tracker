import React from 'react';
import { Project } from '../App';

interface FinanceProps {
  projects: Project[];
}

export const Finance: React.FC<FinanceProps> = () => {
  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto', color: '#1c1c1e' }}>
      <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Finance & Profitability</h2>
      <div style={{ padding: '40px', textAlign: 'center', color: '#8e8e93', border: '2px dashed #e5e5ea', borderRadius: '12px' }}>
        Finance module setup pending.
      </div>
    </div>
  );
};

export default Finance;
