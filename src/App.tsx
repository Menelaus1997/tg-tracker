import React, { useState, useEffect } from 'react';
import { ProjectList } from './components/ProjectList';
import { ProjectDetail } from './components/ProjectDetail';
import { ProjectForm } from './components/ProjectForm';
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

export interface CustomField {
  id: string;
  name: string;
  unit: string;
}

export interface SubStage {
  id: string;
  title: string;
  completed: boolean;
}

export interface Stage {
  id: string;
  title: string;
  subStages: SubStage[];
  loggedSeconds?: number;
  isTimerRunning?: boolean;
  timerStartedAt?: number;
  baseLoggedSeconds?: number;
  startDate?: string;
  endDate?: string;
}

export interface Project {
  id: string;
  name: string;
  color: string;
  status: 'active' | 'archived' | 'trash';
  generalInfoList?: string[];
  customFields?: CustomField[];
  stages?: Stage[];
  teamMembers?: TeamMember[];
  topicLink?: string;
  threadId?: number;
}

const DEFAULT_ROLES: RoleConfig[] = [
  {
    id: '1',
    name: 'Керівник',
    permissions: {
      canViewCreateProject: true,
      canViewVor: true,
      canViewAnalytics: true,
      canViewTeam: true,
      canViewSettings: false,
      canSeeAllProjects: true,
      canEditProjects: true,
      canDeleteProjects: true,
      canManageStages: true,
      canManageTimer: true,
      canAssignTeam: true
    }
  },
  {
    id: '2',
    name: 'Кресляр',
    permissions: {
      canViewCreateProject: false,
      canViewVor: true,
      canViewAnalytics: false,
      canViewTeam: false,
      canViewSettings: false,
      canSeeAllProjects: false,
      canEditProjects: false,
      canDeleteProjects: false,
      canManageStages: true,
      canManageTimer: true,
      canAssignTeam: false
    }
  }
];

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<number>(2); // За замовчуванням "Існуючі проекти"
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
    return saved ? JSON.parse(saved) : DEFAULT_ROLES;
  });

  const [botToken, setBotToken] = useState<string>(() => localStorage.getItem('app_bot_token') || '');
  const [groupId, setGroupId] = useState<string>(() => localStorage.getItem('app_group_id') || '');

  // Зчитування поточного користувача з Telegram SDK
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
        
        // Перший відвідувач або збережений Власник є Супер-Адміном
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

  const handleSaveSettings = (token: string, group: string) => {
    setBotToken(token);
    setGroupId(group);
    localStorage.setItem('app_bot_token', token);
    localStorage.setItem('app_group_id', group);
  };

  const handleCreateProject = (newProject: Project) => {
    setProjects([newProject, ...projects]);
    setActiveTab(2);
  };

  const handleUpdateProject = (updated: Project) => {
    setProjects(projects.map(p => p.id === updated.id ? updated : p));
  };

  const handlePermanentDelete = async (projectId: string) => {
    const proj = projects.find(p => p.id === projectId);
    if (proj?.threadId) {
      // Видалення гілки з Telegram при очищенні кошика
      await fetch('/api/manage-topic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          threadId: proj.threadId,
          customBotToken: botToken,
          customGroupId: groupId
        })
      });
    }
    setProjects(projects.filter(p => p.id !== projectId));
  };

  const activeProject = projects.find(p => p.id === selectedProjectId);

  // Визначення прав поточного користувача
  const currentUserMember = teamMembers.find(m => m.telegramUserId === currentUserId);
  const currentUserRoleConfig = roles.find(r => r.name === currentUserMember?.role);
  const permissions = currentUserRoleConfig?.permissions;

  const canSeeTab1 = isSuperAdmin || permissions?.canViewCreateProject;
  const canSeeTab3 = isSuperAdmin || permissions?.canViewVor;
  const canSeeTab4 = isSuperAdmin || permissions?.canViewAnalytics;
  const canSeeTab5 = isSuperAdmin || permissions?.canViewTeam;
  const canSeeTab6 = isSuperAdmin;

  return (
    <div style={{ paddingBottom: '70px', minHeight: '100vh', backgroundColor: '#ffffff' }}>
      {/* Контент активної вкладки */}
      {selectedProjectId && activeProject ? (
        <ProjectDetail
          project={activeProject}
          onUpdateProject={handleUpdateProject}
          onSaveAsTemplate={() => true}
          onBack={() => setSelectedProjectId(null)}
        />
      ) : (
        <>
          {activeTab === 1 && canSeeTab1 && <ProjectForm onCreateProject={handleCreateProject} />}
          {activeTab === 2 && (
            <ProjectList
              projects={projects}
              onSelectProject={(id) => setSelectedProjectId(id)}
              onUpdateProjects={setProjects}
              isSuperAdmin={isSuperAdmin}
              onPermanentDelete={handlePermanentDelete}
            />
          )}
          {activeTab === 3 && canSeeTab3 && <VorCalculator projects={projects} />}
          {activeTab === 4 && canSeeTab4 && <Analytics projects={projects} />}
          {activeTab === 5 && canSeeTab5 && (
            <TeamManagement
              teamMembers={teamMembers}
              onSaveTeamMember={(m) => {
                const exists = teamMembers.some(tm => tm.id === m.id);
                setTeamMembers(exists ? teamMembers.map(tm => tm.id === m.id ? m : tm) : [...teamMembers, m]);
              }}
              onDeleteTeamMember={(id) => setTeamMembers(teamMembers.filter(m => m.id !== id))}
              roles={roles}
              onSaveRole={(r) => {
                const exists = roles.some(ro => ro.id === r.id);
                setRoles(exists ? roles.map(ro => ro.id === r.id ? r : ro) : [...roles, r]);
              }}
              onDeleteRole={(id) => setRoles(roles.filter(r => r.id !== id))}
              isSuperAdmin={isSuperAdmin}
            />
          )}
          {activeTab === 6 && canSeeTab6 && (
            <Settings
              botToken={botToken}
              groupId={groupId}
              superAdminId={currentUserId}
              onSaveSettings={handleSaveSettings}
              isSuperAdmin={isSuperAdmin}
            />
          )}
        </>
      )}

      {/* Нижнє меню навігації (6 вкладок) */}
      {!selectedProjectId && (
        <div style={navBarStyle}>
          {canSeeTab1 && <button onClick={() => setActiveTab(1)} style={navBtnStyle(activeTab === 1)}>➕</button>}
          <button onClick={() => setActiveTab(2)} style={navBtnStyle(activeTab === 2)}>📁</button>
          {canSeeTab3 && <button onClick={() => setActiveTab(3)} style={navBtnStyle(activeTab === 3)}>📊</button>}
          {canSeeTab4 && <button onClick={() => setActiveTab(4)} style={navBtnStyle(activeTab === 4)}>📈</button>}
          {canSeeTab5 && <button onClick={() => setActiveTab(5)} style={navBtnStyle(activeTab === 5)}>👥</button>}
          {canSeeTab6 && <button onClick={() => setActiveTab(6)} style={navBtnStyle(activeTab === 6)}>⚙️</button>}
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
