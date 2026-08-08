import React, { useState, useEffect } from 'react';

import ProjectList from './components/ProjectList';
import { ProjectDetail } from './components/ProjectDetail';
import { CreateProject } from './components/CreateProject';
import { VorCalculator } from './components/VorCalculator';
import { Analytics } from './components/Analytics';
import { TeamManagement } from './components/TeamManagement';
import { Finance } from './components/Finance';
import { Settings } from './components/Settings';

export type RoleType = string;

export interface RolePermissions {
  canViewCreateProject: boolean;
  canViewVor: boolean;
  canViewAnalytics: boolean;
  canViewTeam: boolean;
  canViewSettings: boolean;
  canViewFinance?: boolean;
  canSeeAllProjects: boolean;
  canEditProjects: boolean;
  canDeleteProjects: boolean;
  canManageStages: boolean;
  canManageTimer: boolean;
  canAssignTeam: boolean;
  onlyAssignedStages?: boolean;
  showDates?: boolean;
  canManageSubtasks?: boolean;
  showOnlyAssignedStages?: boolean;
}

export interface RoleConfig {
  id: string;
  name: RoleType;
  permissions: RolePermissions;
}

export interface TeamMember {
  id: string;
  fullName: string;
  telegramId?: string;
  role: RoleType;
  active?: boolean;
}

export interface Project {
  id: string;
  name: string;
  color: string;
  status: 'active' | 'archived' | 'trash';
  stages?: any[];
  teamMembers?: TeamMember[];
  topicLink?: string;
  threadId?: number;
  passportRows?: any[];
  totalLoggedSeconds?: number;
  projectTeam?: any[];
}

const INITIAL_ROLES: RoleConfig[] = [
  {
    id: '1',
    name: 'Керівник',
    permissions: { canViewCreateProject: true, canViewVor: true, canViewAnalytics: true, canViewTeam: true, canViewSettings: true, canViewFinance: true, canSeeAllProjects: true, canEditProjects: true, canDeleteProjects: true, canManageStages: true, canManageTimer: true, canAssignTeam: true, showDates: true, canManageSubtasks: true, showOnlyAssignedStages: false }
  },
  {
    id: '2',
    name: 'Кресляр',
    permissions: { canViewCreateProject: false, canViewVor: true, canViewAnalytics: false, canViewTeam: false, canViewSettings: false, canViewFinance: false, canSeeAllProjects: false, canEditProjects: false, canDeleteProjects: false, canManageStages: true, canManageTimer: true, canAssignTeam: false, showDates: false, canManageSubtasks: true, showOnlyAssignedStages: true }
  },
  {
    id: '3',
    name: 'Візуалізатор',
    permissions: { canViewCreateProject: false, canViewVor: true, canViewAnalytics: false, canViewTeam: false, canViewSettings: false, canViewFinance: false, canSeeAllProjects: false, canEditProjects: false, canDeleteProjects: false, canManageStages: true, canManageTimer: true, canAssignTeam: false, showDates: false, canManageSubtasks: true, showOnlyAssignedStages: true }
  }
];

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<number>(2);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  
  // Для прикладу беремо поточну роль (можна буде винести в стейт або налаштування)
  const [currentRoleName, setCurrentRoleName] = useState<string>('Керівник');

  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('app_projects');
    return saved ? JSON.parse(saved) : [];
  });

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => {
    const saved = localStorage.getItem('app_team');
    return saved ? JSON.parse(saved) : [];
  });

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
  const [fontFamily, setFontFamily] = useState<string>(() => localStorage.getItem('app_font') || 'system-ui');

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
    <div style={{ paddingBottom: '70px', minHeight: '100vh', backgroundColor: '#ffffff', fontFamily }}>
      {selectedProjectId && activeProject ? (
        <ProjectDetail
          project={activeProject}
          onUpdateProject={(updated) => setProjects(projects.map((p) => (p.id === updated.id ? updated : p)))}
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
          {activeTab === 3 && <VorCalculator />}
          {activeTab === 4 && <Analytics projects={projects} teamDatabase={teamMembers} />}
          
          {/* Вкладка 5: Команда (TeamManagement) з передачею ролей */}
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

          {/* Вкладка 6: Фінанси (Finance) */}
          {activeTab === 6 && <Finance projects={projects} />}

          {/* Вкладка 7: Налаштування (Settings) */}
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
          <button onClick={() => setActiveTab(1)} style={navBtnStyle(activeTab === 1)}>➕</button>
          <button onClick={() => setActiveTab(2)} style={navBtnStyle(activeTab === 2)}>📁</button>
          <button onClick={() => setActiveTab(3)} style={navBtnStyle(activeTab === 3)}>📊</button>
          <button onClick={() => setActiveTab(4)} style={navBtnStyle(activeTab === 4)}>📈</button>
          <button onClick={() => setActiveTab(5)} style={navBtnStyle(activeTab === 5)}>👥</button>
          <button onClick={() => setActiveTab(6)} style={navBtnStyle(activeTab === 6)}>💰</button>
          <button onClick={() => setActiveTab(7)} style={navBtnStyle(activeTab === 7)}>⚙️</button>
        </div>
      )}
    </div>
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
