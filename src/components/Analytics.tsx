import React from 'react';
import { Project, Stage } from '../App';

interface AnalyticsProps {
  projects: Project[];
}

export const Analytics: React.FC<AnalyticsProps> = ({ projects }) => {
  const activeProjects = projects.filter((p) => p.status === 'active');

  const formatHours = (seconds: number = 0) => {
    return (seconds / 3600).toFixed(1);
  };

  // Розрахунок відсотка виконання стадії
  const getStageProgressPercent = (stage: Stage): number => {
    if (!stage.subStages || stage.subStages.length === 0) return 0;
    const completedCount = stage.subStages.filter((sub) => sub.completed).length;
    return Math.round((completedCount / stage.subStages.length) * 100);
  };

  // Малювання стилізованої батарейки (аккумулятора)
  const renderBatteryIcon = (percent: number) => {
    let fillColor = '#ff3b30'; // Червоний (<30%)
    if (percent >= 30 && percent < 75) fillColor = '#ff9500'; // Помаранчевий
    if (percent >= 75) fillColor = '#34c759'; // Зелений

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ fontSize: '12px', fontWeight: 700, color: '#1c1c1e', minWidth: '36px', textAlign: 'right' }}>
          {percent}%
        </span>
        
        {/* Графічний корпус акумулятора */}
        <div style={{
          width: '28px',
          height: '14px',
          border: '1.5px solid #8e8e93',
          borderRadius: '3px',
          padding: '1px',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#ffffff'
        }}>
          {/* Внутрішній рівень заряду */}
          <div style={{
            width: `${percent}%`,
            height: '100%',
            backgroundColor: fillColor,
            borderRadius: '1px',
            transition: 'width 0.3s ease'
          }} />
          {/* Носик батарейки */}
          <div style={{
            position: 'absolute',
            right: '-4px',
            top: '3px',
            width: '2px',
            height: '6px',
            backgroundColor: '#8e8e93',
            borderRadius: '0 1px 1px 0'
          }} />
        </div>
      </div>
    );
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

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {prj.stages.map((st) => {
                    const progress = getStageProgressPercent(st);

                    return (
                      <div 
                        key={st.id} 
                        style={{ 
                          display: 'flex', 
                          justify: 'space-between', 
                          alignItems: 'center',
                          fontSize: '13px', 
                          backgroundColor: '#ffffff', 
                          padding: '8px 10px', 
                          borderRadius: '8px' 
                        }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                          <span style={{ fontWeight: 600, color: '#1c1c1e' }}>{st.title}</span>
                          <span style={{ fontSize: '11px', color: '#8e8e93' }}>{formatHours(st.loggedSeconds)} год</span>
                        </div>

                        {/* Батарейка та відсотки */}
                        {renderBatteryIcon(progress)}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
