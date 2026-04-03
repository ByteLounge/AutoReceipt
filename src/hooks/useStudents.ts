import { useContext } from 'react';
import { StudentContext } from '../contexts/StudentContextExports';

export const useStudents = () => {
  const context = useContext(StudentContext);
  if (context === undefined) {
    throw new Error('useStudents must be used within a StudentProvider');
  }
  return context;
};
