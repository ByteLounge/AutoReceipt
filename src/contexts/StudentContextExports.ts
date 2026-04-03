import { createContext } from 'react';
import type { Student } from '../types';

export interface StudentContextType {
  students: Student[];
  loading: boolean;
  error: string | null;
  addStudent: (student: Omit<Student, 'id' | 'createdAt'>) => Promise<void>;
  updateStudent: (id: string, student: Partial<Student>) => Promise<void>;
  removeStudent: (id: string) => Promise<void>;
}

export const StudentContext = createContext<StudentContextType | undefined>(undefined);
