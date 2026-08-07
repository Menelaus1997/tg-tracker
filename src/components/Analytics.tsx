import React from 'react';
import { Project } from '../App';

interface AnalyticsProps {
  projects: Project[];
}

export const Analytics: React.FC<AnalyticsProps> = ({ projects }) => {
  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto', color: '#1c1c1e' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>📈 Аналітика та прогрес</h2>

      {projects.length === 0 ? (
        <div style={{ fontSize: '13px', color: '#8e8e93', textAlign: 'center', marginTop: '20px' }}>
          Немає активних проектів для аналітики.
        </div>
      ) : (
        projects.map((p) => {
          const stages = p.stages || [];
          
          // Підрахунок загальної кількості підстадій
          let totalSubStages = 0;
          let completedSubStages = 0;

          stages.forEach((st) => {
            const subs = st.subStages || [];
            totalSubStages += subs.length;
            completedSubStages += subs.filter((s: any) => s.completed).length;
          });

          const overallPercent = totalSubStages > 0
            ? Math.round((completedSubStages / totalSubStages) * 100)
            : 0;

          return (
            <div key={p.id} style={{ backgroundColor: '#f2f2f7', padding: '16px', borderRadius: '12px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontWeight: 700, fontSize: '16px' }}>{p.name} ({p.id})</span>
                <span style={{ fontWeight: 700, fontSize: '16px', color: '#007aff' }}>{overallPercent}%</span>
              </div>

              {/* Загальний прогрес-бар */}
              <div style={{ width: '100%', height: '8px', backgroundColor: '#e5e5ea', borderRadius: '4px', overflow: 'hidden', marginBottom: '14px' }}>
                <div style={{ width: `${overallPercent}%`, height: '100%', backgroundColor: p.color || '#007aff', transition: 'width 0.3s' }} />
              </div>

              {/* Деталізація по кожній стадії окремо */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {stages.map((st) => {
                  const subs = st.subStages || [];
                  const stTotal = subs.length;
                  const stDone = subs.filter((s: any) => s.completed).length;
                  const stPercent = stTotal > 0 ? Math.round((stDone / stTotal) * 100) : 0;

                  return (
                    <div key={st.id} style={{ backgroundColor: '#ffffff', padding: '8px 10px', borderRadius: '8px', fontSize: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span>{st.title}</span>
                        <span style={{ fontWeight: 600 }}>{stPercent}%</span>
                      </div>
                      <div style={{ width: '100%', height: '4px', backgroundColor: '#f2f2f7', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ width: `${stPercent}%`, height: '100%', backgroundColor: '#34c759' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default Analytics;
