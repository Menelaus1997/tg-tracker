export type TabType = 'create' | 'projects' | 'boq' | 'analytics' | 'settings';

export interface Project {
  id: string;
  name: string;
  status: string;
  driveUrl?: string;
}
