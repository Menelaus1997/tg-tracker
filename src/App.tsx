import React, { useState, useEffect } from 'react';
import ProjectList from './components/ProjectList';
import { ProjectDetail } from './components/ProjectDetail';
import { CreateProject } from './components/CreateProject';
import { Analytics } from './components/Analytics';
import { TeamManagement } from './components/TeamManagement';
import { Finance } from './components/Finance';
import { Settings } from './components/Settings';
import { WindowFrame } from './WindowFrame';
import { RoleConfig, TeamMember, Project } from './types';

const INITIAL_ROLES: RoleConfig[] = [
  {
    id: '1',
    name: 'Керівник',
    permissions: { canViewCreateProject: true, canViewAnalytics: true, canViewTeam: true, canViewSettings: true, canViewFinance: true, canSeeAllProjects: true, canEditProjects: true, canDeleteProjects: true, canManageStages: true, canManageTimer: true, canAssignTeam: true, showDates: true, canManageSubtasks: true, showOnlyAssignedStages: false }
  },
  {
    id: '2',
    name: 'Кресляр',
    permissions: { canViewCreateProject: false, canViewAnalytics: false, canViewTeam: false, canViewSettings: false, canViewFinance: false, canSeeAllProjects: false, canEditProjects: false, canDeleteProjects: false, canManageStages: true, canManageTimer: true, canAssignTeam: false, showDates: false, canManageSubtasks: true, showOnlyAssignedStages: true }
  },
  {
    id: '3',
    name: 'Візуалізатор',
    permissions: { canViewCreateProject: false, canViewAnalytics: false, canViewTeam: false, canViewSettings: false, canViewFinance: false, canSeeAllProjects: false, canEditProjects: false, canDeleteProjects: false, canManageStages: true, canManageTimer: true, canAssignTeam: false, showDates: false, canManageSubtasks: true, showOnlyAssignedStages: true }
  }
];

export const App: React.FC = () => {
  useEffect(() => {
    if (window.Telegram && window.Telegram.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
    }
  }, []);

  const [activeTab, setActiveTab] = useState<number>(2);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [currentRoleName, setCurrentRoleName] = useState<string>('Керівник');

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => {
    const saved = localStorage.getItem('app_team');
    return saved ? JSON.parse(saved) : [];
  });

  const normalizeStr = (str: string) => 
    str.toLowerCase().replace(/є/g, 'е').replace(/и/g, 'і').trim();

  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('app_projects');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    if (!teamMembers.length || !projects.length) return;

    let hasChanges = false;
    const updatedProjects = projects.map(proj => {
      let projectChanged = false;

      const updatedStages = (proj.stages || []).map(stage => {
        const contractors: string[] = stage.contractors || (stage.contractor ? [stage.contractor] : []);
        let stageChanged = false;

        const newContractors = contractors.map(cEntry => {
          const roleMatch = cEntry.match(/\s*\(([^)]+)\)$/);
          const rolePart = roleMatch ? roleMatch[0] : '';
          const namePart = roleMatch ? cEntry.replace(rolePart, '').trim() : cEntry.trim();
          const cleanName = normalizeStr(namePart);

          const matched = teamMembers.find(m => {
            const cleanMember = normalizeStr(m.fullName);
            return cleanMember === cleanName || cleanMember.includes(cleanName) || cleanName.includes(cleanMember);
          });

          if (matched && matched.fullName !== namePart) {
            stageChanged = true;
            hasChanges = true;
            return `${matched.fullName}${rolePart}`;
          }
          return cEntry;
        });

        if (stageChanged) {
          projectChanged = true;
          return { ...stage, contractors: newContractors };
        }
        return stage;
      });

      if (projectChanged) {
        return { ...proj, stages: updatedStages };
      }
      return proj;
    });

    if (hasChanges) {
      setProjects(updatedProjects);
    }
  }, [teamMembers]);

  const [roles, setRoles] = useState<RoleConfig[]>(() => {
    const saved = localStorage.getItem('app_roles');
    return saved ? JSON.parse(saved) : INITIAL_ROLES;
  });

  const [templates, setTemplates] = useState<any[]>(() => {
    const saved = localStorage.getItem('app_templates');
    return saved ? JSON.parse(saved) : [];
  });

  const [botToken, setBotToken] = useState<string>(() => localStorage.getItem('app_bot_token') || '');
  const [groupId, setGroupId] = useState<string>(() => localStorage.getItem('app_group_id') || '');
  const [fontFamily, setFontFamily] = useState<string>(() => localStorage.getItem('app_font') || "'SF Pro Condensed', -apple-system, sans-serif");

  const [adminCredentials, setAdminCredentials] = useState(() => {
    const saved = localStorage.getItem('app_admin_credentials');
    return saved ? JSON.parse(saved) : { login: 'admin', passwordHash: 'admin', secretWord: 'дизайн' };
  });

  useEffect(() => localStorage.setItem('app_projects', JSON.stringify(projects)), [projects]);
  useEffect(() => localStorage.setItem('app_team', JSON.stringify(teamMembers)), [teamMembers]);
  useEffect(() => localStorage.setItem('app_roles', JSON.stringify(roles)), [roles]);
  useEffect(() => localStorage.setItem('app_templates', JSON.stringify(templates)), [templates]);
  useEffect(() => localStorage.setItem('app_admin_credentials', JSON.stringify(adminCredentials)), [adminCredentials]);

  const handleSaveSettings = (token: string, group: string, font: string) => {
    setBotToken(token);
    setGroupId(group);
    setFontFamily(font);
    localStorage.setItem('app_bot_token', token);
    localStorage.setItem('app_group_id', group);
    localStorage.setItem('app_font', font);
  };

  const handleUpdateCredentials = (login: string, pass: string, secret: string) => {
    setAdminCredentials({ login, passwordHash: pass, secretWord: secret });
  };

  const handleCreateProject = (newProject: Project) => {
    setProjects([newProject, ...projects]);
    setActiveTab(2);
  };

  const handleSaveTemplate = (project: Project, templateName: string) => {
    if (!templateName || !templateName.trim()) return;

    const cleanStages = (project.stages || []).map((st: any) => ({
      title: st.title,
      subStages: (st.subStages || []).map((sub: any) => ({
        title: sub.title,
        completed: false
      }))
    }));

    const newTemplate = {
      id: Date.now().toString(),
      name: templateName.trim(),
      stages: cleanStages
    };

    setTemplates((prev) => [...prev, newTemplate]);
    alert(`Шаблон "${templateName.trim()}" успішно створено!`);
  };

  const activeProject = projects.find((p) => p.id === selectedProjectId);

  const ProjectListComponent = (ProjectList as any).ProjectList || ProjectList;
  const CreateProjectComponent = (CreateProject as any).CreateProject || CreateProject;

  return (
    <WindowFrame>
      <div style={{ paddingBottom: '70px', minHeight: '100vh', backgroundColor: '#ffffff', fontFamily }}>
        {selectedProjectId && activeProject ? (
          <ProjectDetail
            project={activeProject}
            onUpdateProject={(updated) => {
              setProjects(projects.map((p) => (p.id === activeProject.id || p.id === updated.id ? updated : p)));
            }}
            onSaveAsTemplate={handleSaveTemplate}
            onBack={() => setSelectedProjectId(null)}
            teamDatabase={teamMembers}
            availableRoles={roles.map((r) => r.name)}
            currentUserRole={currentRoleName}
            rolesConfig={roles}
          />
        ) : (
          <>
            {activeTab === 1 && (
              <CreateProjectComponent
                onCreateProject={handleCreateProject}
                templates={templates}
                onUpdateTemplates={setTemplates}
              />
            )}
            {activeTab === 2 && (
              <ProjectListComponent
                projects={projects}
                onSelectProject={(id: string) => setSelectedProjectId(id)}
                onUpdateProjects={setProjects}
                isSuperAdmin={true}
                onPermanentDelete={(id: string) => setProjects(projects.filter((p) => p.id !== id))}
              />
            )}
            {activeTab === 4 && <Analytics projects={projects} teamDatabase={teamMembers} />}
            
            {activeTab === 5 && (
              <TeamManagement
                members={teamMembers}
                onUpdateMembers={setTeamMembers}
                roles={roles}
                onSaveRole={(r) => {
                  const exists = roles.some((ro) => ro.id === r.id);
                  setRoles(exists ? roles.map((ro) => (ro.id === r.id ? r : ro)) : [...roles, r]);
                }}
                onDeleteRole={(id) => setRoles(roles.filter((r) => r.id !== id))}
                availableRoles={roles.map((r) => r.name)}
              />
            )}

            {activeTab === 6 && (
              <Finance
                projects={projects}
                onUpdateProject={(updatedProject) => {
                  setProjects(projects.map((p) => (p.id === updatedProject.id ? updatedProject : p)));
                }}
              />
            )}

            {activeTab === 7 && (
              <Settings
                botToken={botToken}
                groupId={groupId}
                fontFamily={fontFamily}
                onSaveSettings={handleSaveSettings}
                adminCredentials={adminCredentials}
                onUpdateCredentials={handleUpdateCredentials}
              />
            )}
          </>
        )}

        {!selectedProjectId && (
          <div style={navBarStyle}>
            <button onClick={() => setActiveTab(1)} style={navBtnStyle(activeTab === 1)} title="Створити проєкт">➕</button>
            <button onClick={() => setActiveTab(2)} style={navBtnStyle(activeTab === 2)} title="Проєкти">📁</button>
            <button onClick={() => setActiveTab(4)} style={navBtnStyle(activeTab === 4)} title="Аналітика">📈</button>
            <button onClick={() => setActiveTab(5)} style={navBtnStyle(activeTab === 5)} title="Команда">👥</button>
            <button onClick={() => setActiveTab(6)} style={navBtnStyle(activeTab === 6)} title="Фінанси">💰</button>
            <button onClick={() => setActiveTab(7)} style={navBtnStyle(activeTab === 7)} title="Налаштування">⚙️</button>
          </div>
        )}
      </div>
    </WindowFrame>
  );
};

const navBarStyle: React.CSSProperties = {
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  height: '60px',
  backgroundColor: '#ffffff',
  borderTop: '1px solid #e5e5ea',
  display: 'flex',
  justifyContent: 'space-around',
  alignItems: 'center',
  zIndex: 1000
};

const navBtnStyle = (active: boolean): React.CSSProperties => ({
  background: 'none',
  border: 'none',
  fontSize: '18px',
  opacity: active ? 1 : 0.4,
  cursor: 'pointer',
  padding: '10px'
});

export default App;
