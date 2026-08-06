import { Project, User, AppSettings } from '../types';

// Тестові користувачі
export const mockUsers: User[] = [
  {
    id: '1',
    telegramId: '123456',
    username: 'menelaus_27',
    name: 'Олександр (Керівник)',
    role: 'admin',
  },
  {
    id: '2',
    telegramId: '654321',
    username: 'designer_art',
    name: 'Марія (Візуалізатор)',
    role: 'executor',
  },
  {
    id: '3',
    telegramId: '987654',
    username: 'drafter_pro',
    name: 'Іван (Кресляр)',
    role: 'executor',
  },
];

// Тестові об'єкти / проекти
export const initialProjects: Project[] = [
  {
    id: 'PRJ-101',
    title: 'ЖК Новопечерські Липки',
    colorMarker: '#22c55e', // Зелений
    tags: ['ДИЗАЙН', 'ВИТРАТИ', 'КВАРАТИРА'],
    team: [mockUsers[0], mockUsers[1]],
    currentStage: 'visualization',
    completionPercentage: 60,
    deadlineDate: '2026-09-15',
    deadlineDays: 14,
    links: [
      {
        id: 'l1',
        title: 'Дизайн-проект (Google Drive)',
        url: 'https://drive.google.com',
      },
      {
        id: 'l2',
        title: 'Кошторис та спеки',
        url: 'https://docs.google.com',
      },
    ],
    comments: 'Очікуємо фінальне затвердження правок по спальні від замовника.',
    visibleBlocks: {
      passport: true,
      comments: true,
      links: true,
      analytics: true,
    },
  },
  {
    id: 'PRJ-102',
    title: 'Приватний будинок (Козин)',
    colorMarker: '#3b82f6', // Синій
    tags: ['ОБМІРИ', 'БУДИНОК'],
    team: [mockUsers[0], mockUsers[2]],
    currentStage: 'measurements',
    completionPercentage: 25,
    deadlineDate: '2026-08-20',
    deadlineDays: 3,
    links: [
      {
        id: 'l3',
        title: 'Обміряльні креслення',
        url: 'https://drive.google.com',
      },
    ],
    comments: 'Обміри завершено, готуємо планувальні рішення.',
    visibleBlocks: {
      passport: true,
      comments: true,
      links: true,
      analytics: true,
    },
  },
];

// Дефолтні налаштування
export const defaultSettings: AppSettings = {
  language: 'uk',
  textColor: '#000000',
  isBold: false,
  isItalic: false,
};
