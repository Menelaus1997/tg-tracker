import React, { useState, useEffect } from 'react';

import ProjectList from './components/ProjectList';
import { ProjectDetail } from './components/ProjectDetail';
import { CreateProject } from './components/CreateProject';
import { VorCalculator } from './components/VorCalculator';
import { Analytics } from './components/Analytics';
import { TeamManagement } from './components/TeamManagement';
import { Settings } from './components/Settings';

export type RoleType = string;

export interface RolePermissions {
  canViewCreateProject: boolean;
  canViewVor: boolean;
  canViewAnalytics: boolean;
  canViewTeam: boolean;
  canViewSettings: boolean;
  canSeeAllProjects: boolean;
  canEditProjects: boolean;
  canDeleteProjects: boolean;
  canManageStages: boolean;
  canManageTimer: boolean;
  canAssignTeam: boolean;
  onlyAssignedStages?: boolean;
}

export interface RoleConfig {
  id: string;
  name: RoleType;
  permissions: RolePermissions;
}

export interface TeamMember {
  id: string;
  fullName: string;
  telegramUserId?: string;
  role: RoleType;
  isActive?: boolean;
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
}

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<number>(2);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

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
    return saved ? JSON.parse(saved) : [];
  });

  const [templates, setTemplates] = useState<any[]>(() => {
    const saved = localStorage.getItem('app_templates');
    return saved ? JSON.parse(saved) : [];
  });

  const [botToken, setBotToken] = useState<string>(() => localStorage.getItem('app_bot_token') || '');
  const [groupId, setGroupId] = useState<string>(() => localStorage.getItem('app_group_id') || '');
  const [fontFamily, setFontFamily] = useState<string>(() => localStorage.getItem('app_font') || 'system-ui');

  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(true);

  useEffect(() => {
    if ((window as any).Telegram?.WebApp) {
      const tg = (window as any).Telegram.WebApp;
      tg.ready();
      const user = tg.initDataUnsafe?.user;
      if (user?.id) {
        const uid = String(user.id);
        setCurrentUserId(uid);
        const savedOwner = localStorage.getItem('app_super_admin_id');
        if (!savedOwner) {
          localStorage.setItem('app_super_admin_id', uid);
          setIsSuperAdmin(true);
        } else {
          setIsSuperAdmin(savedOwner === uid);
        }
      }
    }
  }, []);

  useEffect(() => localStorage.setItem('app_projects', JSON.stringify(projects)), [projects]);
  useEffect(() => localStorage.setItem('app_team', JSON.stringify(teamMembers)), [teamMembers]);
  useEffect(() => localStorage.setItem('app_roles', JSON.stringify(roles)), [roles]);
  useEffect(() => localStorage.setItem('app_templates', JSON.stringify(templates)), [templates]);

  const handleSaveSettings = (token: string, group: string, font: string) => {
    setBotToken(token);
    setGroupId(group);
    setFontFamily(font);
    localStorage.setItem('app_bot_token', token);
    localStorage.setItem('app_group_id', group);
    localStorage.setItem('app_font', font);
  };

  const handleCreateProject = (newProject: Project) => {
    setProjects([newProject, ...projects]);
    setActiveTab(2);
  };

  // Збереження ТІЛЬКИ стадій і підстадій (без закреслених підстадій, без часу, прогресу та команди)
  const handleSaveTemplate = (project: Project) => {
    if (!project || !project.name) return;

    const cleanStages = (project.stages || []).map((st: any) => ({
      title: st.title,
      subStages: (st.subStages || []).map((sub: any) => ({
        title: sub.title,
        completed: false
      }))
    }));

    const newTemplate = {
      id: Date.now().toString(),
      name: project.name.trim(),
      stages: cleanStages
    };

    setTemplates((prev) => {
      const valid = prev.filter((t) => t && t.name && t.name !== 'undefined');
      return [...valid, newTemplate];
    });

    alert(`Проект "${project.name}" збережено як новий чистий шаблон!`);
  };

  const handlePermanentDelete = async (projectId: string) => {
    setProjects(projects.filter((p) => p.id !== projectId));
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
          onSaveAsTemplate={() => handleSaveTemplate(activeProject)}
          onBack={() => setSelectedProjectId(null)}
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
              isSuperAdmin={isSuperAdmin}
              onPermanentDelete={handlePermanentDelete}
            />
          )}
          {activeTab === 3 && <VorCalculator />}
          {activeTab === 4 && <Analytics projects={projects} />}
          {activeTab === 5 && (
            <TeamManagement
              teamMembers={teamMembers}
              onSaveTeamMember={(m) => {
                const exists = teamMembers.some((tm) => tm.id === m.id);
                setTeamMembers(exists ? teamMembers.map((tm) => (tm.id === m.id ? m : tm)) : [...teamMembers, m]);
              }}
              onDeleteTeamMember={(id) => setTeamMembers(teamMembers.filter((m) => m.id !== id))}
              roles={roles}
              onSaveRole={(r) => {
                const exists = roles.some((ro) => ro.id === r.id);
                setRoles(exists ? roles.map((ro) => (ro.id === r.id ? r : ro)) : [...roles, r]);
              }}
              onDeleteRole={(id) => setRoles(roles.filter((r) => r.id !== id))}
              isSuperAdmin={isSuperAdmin}
            />
          )}
          {activeTab === 6 && (
            <Settings
              botToken={botToken}
              groupId={groupId}
              superAdminId={currentUserId}
              fontFamily={fontFamily}
              onSaveSettings={handleSaveSettings}
              isSuperAdmin={isSuperAdmin}
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
          <button onClick={() => setActiveTab(6)} style={navBtnStyle(activeTab === 6)}>⚙️</button>
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
  fontSize: '20px',
  opacity: active ? 1 : 0.4,
  cursor: 'pointer',
  padding: '10px'
});

export default App;
