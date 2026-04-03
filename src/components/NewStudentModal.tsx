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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-t-3xl sm:rounded-2xl shadow-xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-300">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 shrink-0">
          <div className="flex items-center">
            <div className="bg-blue-100 p-2 rounded-lg mr-3">
              <UserPlus className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-lg md:text-xl font-bold text-gray-900 tracking-tight">New Admission</h2>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
            <div className="col-span-1 md:col-span-2">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Full Name</label>
              <input
                required
                type="text"
                className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-base font-semibold"
                placeholder="Student's full name"
                value={formData.fullName}
                onChange={e => setFormData({...formData, fullName: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Mobile Number</label>
              <input
                required
                type="tel"
                pattern="[0-9]{10}"
                className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-base font-semibold font-mono"
                placeholder="10-digit mobile number"
                value={formData.mobileNumber}
                onChange={e => setFormData({...formData, mobileNumber: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Grade / Standard</label>
              <select
                className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none cursor-pointer text-base font-semibold"
                value={formData.grade}
                onChange={e => setFormData({...formData, grade: e.target.value})}
              >
                {[5,6,7,8,9,10].map(g => <option key={g} value={g}>Grade {g}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Academic Year</label>
              <select
                className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none cursor-pointer text-base font-semibold"
                value={formData.academicYear}
                onChange={e => setFormData({...formData, academicYear: e.target.value})}
              >
                <option value="2024-25">2024-25</option>
                <option value="2025-26">2025-26</option>
                <option value="2026-27">2026-27</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Joining Installment</label>
              <select
                className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none cursor-pointer text-base font-semibold"
                value={formData.joiningInstallment}
                onChange={e => setFormData({...formData, joiningInstallment: e.target.value})}
              >
                <option value="1">1st Installment</option>
                <option value="2">2nd Installment</option>
                {formData.grade !== '10' && <option value="3">3rd Installment</option>}
              </select>
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Remarks (Optional)</label>
              <input
                type="text"
                className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-base font-semibold"
                placeholder="Any special notes..."
                value={formData.remarks}
                onChange={e => setFormData({...formData, remarks: e.target.value})}
              />
            </div>
          </div>

          <div className="mt-8 flex gap-3 pb-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 border-2 border-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-50 transition-colors active:scale-[0.98]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[1.5] py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 shadow-md shadow-blue-200 transition-all hover:shadow-lg disabled:opacity-70 flex items-center justify-center active:scale-[0.98]"
            >
              {loading ? (
                 <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-5 h-5 mr-2" />
                  Save Admission
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewStudentModal;
