// Ролі користувачів у системі
export type UserRole = 'admin' | 'manager' | 'executor';

export interface User {
  id: string;
  telegramId: string;
  username: string;
  name: string;
  role: UserRole;
}

// Етапи виконання проекту
export type ProjectStage = 
  | 'started' 
  | 'measurements' 
  | 'planning' 
  | 'visualization' 
  | 'specification' 
  | 'completed';

// Структура кастомного посилання (Гугл Диск, Файли тощо)
export interface ProjectLink {
  id: string;
  title: string; // Назва: "Дизайн-проект", "Кошторис", "Фото" тощо
  url: string;
}

// Стан тумблерів-повзунків (Toggle Switches) для приховування блоків
export interface VisibleBlocks {
  passport: boolean;
  comments: boolean;
  links: boolean;
  analytics: boolean;
}

// Основна модель Проекту
export interface Project {
  id: string;                  // Номер ID проекту
  title: string;               // Назва проекту
  colorMarker: string;         // Колірний маркер (HEX, напр. "#FF5733")
  tags: string[];              // Масив тегів проекту
  team: User[];                // Учасники команди
  currentStage: ProjectStage;  // Поточний етап
  completionPercentage: number;// Відсоток готовності (%)
  
  // Дедлайни та віджет календаря
  deadlineDate: string;        // Дата видачі ("YYYY-MM-DD")
  deadlineDays: number;        // Днів на виконання етапу
  
  // Файли та примітки
  links: ProjectLink[];        // Кастомні посилання
  comments: string;            // Примітки/причини затримок (до 4096 символів)
  
  // Налаштування відображення блоків
  visibleBlocks: VisibleBlocks;
}

// Налаштування інтерфейсу користувача
export interface AppSettings {
  language: 'uk' | 'en';
  textColor: string;
  isBold: boolean;
  isItalic: boolean;
}
