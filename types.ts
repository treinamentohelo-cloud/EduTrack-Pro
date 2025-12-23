
export enum UserRole {
  MANAGER = 'Gestor',
  COORDINATOR = 'Coordenador',
  TEACHER = 'Professor'
}

export enum ReadingLevel {
  PRE_SYLLABIC = 'Iniciante',
  SYLLABIC = 'Silábico',
  SYLLABIC_ALPHABETIC = 'Silábico-Alfabético',
  ALPHABETIC = 'Alfabético',
  FLUENT = 'Fluente'
}

export enum PerformanceLevel {
  INSUFFICIENT = 'Insuficiente',
  BASIC = 'Básico',
  ADEQUATE = 'Adequado',
  ADVANCED = 'Avançado'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
}

export interface Student {
  id: string;
  name: string;
  classId: string;
  currentReadingLevel: ReadingLevel;
  mathScore: number;
  readingPerformance?: PerformanceLevel;
  mathPerformance?: PerformanceLevel;
  photoUrl?: string;
}

export interface Class {
  id: string;
  name: string;
  grade: string;
  teacherId: string;
}

export interface RemedialEnrollment {
  id: string;
  studentId: string;
  classId: string;
  startDate: string;
  endDate?: string;
  notes?: string;
}
