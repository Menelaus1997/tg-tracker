import React from 'react';
import { Project } from '../App';

interface AnalyticsProps {
  projects: Project[];
}

export const Analytics: React.FC<AnalyticsProps> = ({ projects }) => {
  const activeProjects = projects.filter((p) => p.status === 'active');

  const formatHours = (seconds: number = 0) => {
    return (seconds / 3600).toFixed(1);
  };

  return (
    <div style={{ padding: '20px', color: '#1c1c1e', maxWidth: '500px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '20px' }}>Загальна Аналітика</h2>

      {activeProjects.length === 0 ? (
        <p style={{ color: '#8e8e93' }}>Немає даних для відображення.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {activeProjects.map((prj) => {
            const totalProjectSec = prj.stages.reduce((acc, st) => acc + (st.loggedSeconds || 0), 0);

            return (
              <div key={prj.uid} style={{ padding: '16px', backgroundColor: '#f2f2f7', borderRadius: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ fontWeight: 700, fontSize: '16px' }}>
                    {prj.name} <span style={{ fontSize: '12px', color: '#8e8e93' }}>({prj.id})</span>
                  </div>
                  <div style={{ fontWeight: 700, color: '#007aff', fontSize: '15px' }}>
                    {formatHours(totalProjectSec)} год.
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {prj.stages.map((st) => (
                    <div key={st.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', backgroundColor: '#ffffff', padding: '6px 10px', borderRadius: '6px' }}>
                      <span style={{ color: '#636366' }}>{st.title}</span>
                      <span style={{ fontWeight: 600 }}>{formatHours(st.loggedSeconds)} год</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
