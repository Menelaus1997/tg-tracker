import React, { useState } from 'react';
import { Project, TeamMember } from '../types';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface AnalyticsProps {
  projects: Project[];
  teamDatabase: TeamMember[];
}

export const Analytics: React.FC<AnalyticsProps> = ({ projects, teamDatabase }) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const activeProject = projects.find((p) => p.id === selectedProjectId);

  // Функція експорту в PDF
  const handleExportPDF = async () => {
    const reportElement = document.getElementById('analytics-report-area');
    if (!reportElement) return;

    try {
      setIsExporting(true);
      const canvas = await html2canvas(reportElement, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Analytics_${activeProject?.name || 'project'}.pdf`);
    } catch (error) {
      console.error('Помилка генерації PDF:', error);
      alert('Не вдалося експортувати документ у PDF.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div style={{ padding: '16px', width: '100%', boxSizing: 'border-box' }}>
      {/* Шапка з вибором проєкту та кнопкою експорту */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '250px' }}>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #ccc', width: '100%', maxWidth: '300px', fontSize: '14px' }}
          >
            {projects.map((proj) => (
              <option key={proj.id} value={proj.id}>
                {proj.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleExportPDF}
          disabled={isExporting || !activeProject}
          style={{
            backgroundColor: '#007aff',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 16px',
            cursor: 'pointer',
            fontWeight: 500,
            fontSize: '14px',
          }}
        >
          {isExporting ? 'Генерація PDF...' : 'Зберегти в PDF'}
        </button>
      </div>

      {/* Зона для експорту в PDF та перегляду */}
      <div
        id="analytics-report-area"
        style={{
          backgroundColor: '#ffffff',
          padding: '16px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        {activeProject ? (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '16px' }}>{activeProject.name}</h3>
              <span style={{ fontSize: '12px', color: '#666' }}>ID проєкту: {activeProject.id}</span>
            </div>

            {/* Контейнер діаграми Ганта з гнучким заповненням ширини */}
            <div style={{ width: '100%', overflowX: 'auto' }}>
              <div style={{ minWidth: '800px', width: '100%' }}>
                {/* Сітка днів/місяців та стадій */}
                <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', border: '1px solid #e5e5ea', borderRadius: '8px' }}>
                  <div style={{ padding: '10px', fontWeight: 'bold', borderRight: '1px solid #e5e5ea', backgroundColor: '#f9f9fb' }}>
                    Загальний таймлайн проєкту
                  </div>
                  <div style={{ padding: '10px', backgroundColor: '#f9f9fb', textAlign: 'center', fontWeight: 'bold' }}>
                    Графік виконання стадій
                  </div>
                </div>

                {activeProject.stages && activeProject.stages.length > 0 ? (
                  activeProject.stages.map((stage: any, index: number) => (
                    <div
                      key={index}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '250px 1fr',
                        borderBottom: '1px solid #e5e5ea',
                        alignItems: 'center',
                      }}
                    >
                      <div style={{ padding: '12px 10px', borderRight: '1px solid #e5e5ea', fontSize: '14px' }}>
                        {index + 1}. {stage.title}
                      </div>
                      <div style={{ padding: '10px', position: 'relative', height: '40px', display: 'flex', alignItems: 'center' }}>
                        {/* Візуальне представлення прогресу стадії */}
                        <div
                          style={{
                            width: '100%',
                            backgroundColor: '#f1f1f3',
                            borderRadius: '4px',
                            height: '20px',
                            position: 'relative',
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              width: `${stage.progress || 0}%`,
                              backgroundColor: '#34c759',
                              height: '100%',
                              borderRadius: '4px',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '30px', textAlign: 'center', color: '#8e8e93' }}>
                    Для цього проєкту ще не додано стадій.
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#8e8e93' }}>
            Оберіть проєкт для перегляду аналітики.
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
