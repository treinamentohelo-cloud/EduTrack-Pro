
import { UserRole, ReadingLevel, Student, Class, User } from './types';

export const MOCK_USERS: User[] = [
  { id: '1', name: 'Dr. Ricardo Gesta', role: UserRole.MANAGER, email: 'gestor@escola.com' },
  { id: '2', name: 'Profa. Ana Coordenação', role: UserRole.COORDINATOR, email: 'coord@escola.com' },
  { id: '3', name: 'Prof. João Silva', role: UserRole.TEACHER, email: 'joao@escola.com' },
];

export const MOCK_CLASSES: Class[] = [
  { id: 'c1', name: '1º Ano A', grade: '1º Ano', teacherId: '3' },
  { id: 'c2', name: '1º Ano B', grade: '1º Ano', teacherId: '4' },
  { id: 'c3', name: '2º Ano A', grade: '2º Ano', teacherId: '5' },
];

export const MOCK_STUDENTS: Student[] = [
  { id: 's1', name: 'Ana Souza', classId: 'c1', currentReadingLevel: ReadingLevel.SYLLABIC, mathScore: 65 },
  { id: 's2', name: 'Beto Lima', classId: 'c1', currentReadingLevel: ReadingLevel.ALPHABETIC, mathScore: 88 },
  { id: 's3', name: 'Carla Dias', classId: 'c1', currentReadingLevel: ReadingLevel.FLUENT, mathScore: 92 },
  { id: 's4', name: 'Davi Mendes', classId: 'c2', currentReadingLevel: ReadingLevel.PRE_SYLLABIC, mathScore: 45 },
  { id: 's5', name: 'Eva Rocha', classId: 'c2', currentReadingLevel: ReadingLevel.SYLLABIC_ALPHABETIC, mathScore: 72 },
];
