export type RoleType = string;

// Права доступу для ролей (Матриця прав)
export interface RolePermissions {
  canViewCreateProject: boolean;
  canViewVor: boolean;
  canViewAnalytics: boolean;
  canViewTeam: boolean;
  canViewSettings: boolean;
  canSeeAllProjects: boolean;
  canEditProjects: boolean;
  canDeleteProjects: boolean; // М'яке видалення в кошик
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
  telegramUserId?: string; // Цифровий ID для автоматичного тегування
  role: RoleType;
  isActive?: boolean; // Статус: активний / неактивний
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
