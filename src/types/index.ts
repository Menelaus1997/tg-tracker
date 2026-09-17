export type TabType = 'create' | 'projects' | 'boq' | 'analytics' | 'settings' | 'team' | 'finance';

export type RoleType = string;

export interface RolePermissions {
  canViewCreateProject: boolean;
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

export interface SubStage {
  id: string;
  title: string;
  completed: boolean;
}

export interface Stage {
  id: string;
  title: string;
  subStages: SubStage[];
  startDate?: string;
  endDate?: string;
  reviewDate?: string;
  correctionDate?: string;
  contractors?: string[];
  currentStatus?: string;
}

export interface ExpenseItem {
  id: string;
  title: string;
  amount: number;
  currency: string;
  calcType: 'm2' | 'fixed';
  isDeleted?: boolean;
}

export interface Project {
  id: string; // Формується автоматично: [Об'єкт]/[Договір]-[Рік]-[Марка], наприклад "01/100-2026-АР"
  name: string;
  color?: string;
  status: 'active' | 'archived' | 'trash' | string;
  driveUrl?: string;
  stages?: Stage[];
  teamMembers?: TeamMember[];
  passportRows?: any[];
  expenses?: ExpenseItem[];
  
  // Додаткові налаштування проєкту
  enableRoles?: boolean;
  enableTeamRoles?: boolean;
  enableTags?: boolean;
  showStageTags?: boolean;
  enableData?: boolean;
  showDates?: boolean;
  enableSubtaskMoving?: boolean;
  customStatuses?: any[];
  tagsTitle?: string;
  dataTitle?: string;
  structureTitle?: string;
  settingsTitle?: string;
  usdRate?: string;
  customPricePerM2?: string;
}
