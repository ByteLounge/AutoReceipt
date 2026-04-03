import React, { useState } from 'react';
import { useStudents } from '../hooks/useStudents';
import { X, UserPlus } from 'lucide-react';
import type { Student } from '../types';

interface Props {
  onClose: () => void;
}

const NewStudentModal: React.FC<Props> = ({ onClose }) => {
  const { addStudent } = useStudents();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    mobileNumber: '',
    grade: '10',
    academicYear: '2026-27',
    joiningInstallment: '1',
    remarks: ''
  });

  const getFeeStructure = (grade: number) => {
    if (grade === 10) {
      return { annualFees: 15000, installments: [7500, 7500] };
    }
    return { annualFees: 11000, installments: [3000, 4000, 4000] };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const grade = parseInt(formData.grade);
    const joiningInstallment = parseInt(formData.joiningInstallment);
    const feeStructure = getFeeStructure(grade);

    // Calculate initial pending balance
    let initialPending = 0;
    for (let i = joiningInstallment - 1; i < feeStructure.installments.length; i++) {
        initialPending += feeStructure.installments[i];
    }

    const newStudent: Omit<Student, 'id' | 'createdAt'> = {
      fullName: formData.fullName,
      mobileNumber: formData.mobileNumber,
      grade,
      academicYear: formData.academicYear,
      joiningInstallment,
      feeStructure,
      paymentHistory: [],
      status: initialPending > 0 ? 'Pending' : 'Fully Paid',
      pendingBalance: initialPending,
      totalPaid: 0,
      remarks: formData.remarks
    };

    try {
      await addStudent(newStudent);
      onClose();
    } catch (err: unknown) {
      const error = err as Error;
      console.error(error);
      alert(`Failed to add student: ${error.message || 'Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center">
            <div className="bg-blue-100 p-2 rounded-lg mr-3">
              <UserPlus className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">New Admission</h2>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                required
                type="text"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                placeholder="Student's full name"
                value={formData.fullName}
                onChange={e => setFormData({...formData, fullName: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
              <input
                required
                type="tel"
                pattern="[0-9]{10}"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                placeholder="10-digit mobile number"
                value={formData.mobileNumber}
                onChange={e => setFormData({...formData, mobileNumber: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Grade / Standard</label>
              <select
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none cursor-pointer"
                value={formData.grade}
                onChange={e => setFormData({...formData, grade: e.target.value})}
              >
                {[5,6,7,8,9,10].map(g => <option key={g} value={g}>Grade {g}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Academic Year</label>
              <select
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none cursor-pointer"
                value={formData.academicYear}
                onChange={e => setFormData({...formData, academicYear: e.target.value})}
              >
                <option value="2024-25">2024-25</option>
                <option value="2025-26">2025-26</option>
                <option value="2026-27">2026-27</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Joining Installment</label>
              <select
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none cursor-pointer"
                value={formData.joiningInstallment}
                onChange={e => setFormData({...formData, joiningInstallment: e.target.value})}
              >
                <option value="1">1st Installment</option>
                <option value="2">2nd Installment</option>
                {formData.grade !== '10' && <option value="3">3rd Installment</option>}
              </select>
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Remarks (Optional)</label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                placeholder="Any special notes..."
                value={formData.remarks}
                onChange={e => setFormData({...formData, remarks: e.target.value})}
              />
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 shadow-sm transition-all hover:shadow-md disabled:opacity-70 flex items-center"
            >
              {loading ? (
                 <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              ) : (
                <UserPlus className="w-5 h-5 mr-2" />
              )}
              Save Student
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewStudentModal;
