import React, { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import type { Student } from '../types';
import { StudentContext } from './StudentContextExports';

export const StudentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'students'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const studentList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Student[];
        setStudents(studentList);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching students:", err);
        setError("Failed to load students. Please check your internet connection.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const addStudent = async (studentData: Omit<Student, 'id' | 'createdAt'>) => {
    try {
      const newStudent = {
        ...studentData,
        createdAt: Date.now()
      };
      await addDoc(collection(db, 'students'), newStudent);
    } catch (err: unknown) {
      const error = err as Error;
      console.error("Error adding student:", error);
      throw new Error(error.message);
    }
  };

  const updateStudent = async (id: string, studentData: Partial<Student>) => {
    try {
      const studentRef = doc(db, 'students', id);
      await updateDoc(studentRef, studentData);
    } catch (err: unknown) {
      const error = err as Error;
      console.error("Error updating student:", error);
      throw new Error(error.message);
    }
  };

  const removeStudent = async (id: string) => {
    try {
      const studentRef = doc(db, 'students', id);
      await deleteDoc(studentRef);
    } catch (err: unknown) {
      const error = err as Error;
      console.error("Error deleting student:", error);
      throw new Error(error.message);
    }
  };

  return (
    <StudentContext.Provider value={{ students, loading, error, addStudent, updateStudent, removeStudent }}>
      {children}
    </StudentContext.Provider>
  );
};
