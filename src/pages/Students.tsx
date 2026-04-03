import React, { useState } from 'react';
import { useStudents } from '../hooks/useStudents';
import type { Student } from '../types';
import { AlertCircle, FileDown, Plus, Receipt, Search, Trash2, UserX } from 'lucide-react';
import clsx from 'clsx';
import NewStudentModal from '../components/NewStudentModal';
import PaymentModal from '../components/PaymentModal';
import { generateReceiptPDF } from '../utils/generateReceipt';

const Students: React.FC = () => {
  const { students, loading, removeStudent } = useStudents();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrade, setFilterGrade] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedStudentForPay, setSelectedStudentForPay] = useState<Student | null>(null);

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this student record? This cannot be undone.")) {
      await removeStudent(id);
    }
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || s.mobileNumber.includes(searchTerm);
    const matchesGrade = filterGrade === 'All' || s.grade.toString() === filterGrade;
    const matchesStatus = filterStatus === 'All' || s.status === filterStatus;
    
    return matchesSearch && matchesGrade && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 animate-in fade-in duration-500 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Students & Fees</h1>
          <p className="text-gray-500 mt-1 text-base md:text-lg">Manage admissions and process fee payments.</p>
        </div>
        <button
          onClick={() => setIsNewModalOpen(true)}
          className="hidden md:inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-all hover:shadow-md"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Student
        </button>
      </div>

      {/* Floating Action Button for Mobile */}
      <button
        onClick={() => setIsNewModalOpen(true)}
        className="md:hidden fixed bottom-6 right-6 z-30 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg shadow-blue-300 flex items-center justify-center active:scale-90 transition-transform"
        aria-label="Add Student"
      >
        <Plus className="w-7 h-7" />
      </button>

      {/* Filters & Search */}
      <div className="bg-white p-3 md:p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-3 md:gap-4 items-stretch md:items-center">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2.5 md:py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 text-sm md:text-base"
            placeholder="Search by name or mobile..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterGrade}
            onChange={(e) => setFilterGrade(e.target.value)}
            className="flex-1 md:w-32 py-2.5 md:py-3 px-3 md:px-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 transition-colors cursor-pointer text-sm"
          >
            <option value="All">All Grades</option>
            {[5,6,7,8,9,10].map(g => <option key={g} value={g}>Grade {g}</option>)}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="flex-1 md:w-40 py-2.5 md:py-3 px-3 md:px-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 transition-colors cursor-pointer text-sm"
          >
            <option value="All">All Statuses</option>
            <option value="Fully Paid">Fully Paid</option>
            <option value="Partial Paid">Partial Paid</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Student List Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {filteredStudents.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-2xl border border-dashed border-gray-200">
            <UserX className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <p className="text-lg">No students found matching your filters.</p>
          </div>
        ) : (
          filteredStudents.map((student) => (
            <div key={student.id} className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="flex justify-between items-start mb-4">
                <div className="max-w-[70%]">
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">{student.fullName}</h3>
                  <p className="text-xs md:text-sm text-gray-500 mt-1">
                    Grade {student.grade} • {student.mobileNumber}
                  </p>
                </div>
                <div className={clsx(
                  "px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider",
                  student.status === 'Fully Paid' && "bg-teal-100 text-teal-800",
                  student.status === 'Partial Paid' && "bg-amber-100 text-amber-800",
                  student.status === 'Pending' && "bg-rose-100 text-rose-800",
                )}>
                  {student.status === 'Fully Paid' ? 'Paid' : student.status === 'Partial Paid' ? 'Partial' : 'Pending'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 md:gap-4 mb-4 md:mb-6">
                <div className="bg-gray-50 p-2.5 md:p-3 rounded-xl border border-gray-100">
                   <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider mb-0.5">Paid</p>
                   <p className="text-base md:text-xl font-bold text-gray-900">₹{student.totalPaid.toLocaleString()}</p>
                </div>
                <div className={clsx("p-2.5 md:p-3 rounded-xl border", student.pendingBalance > 0 ? "bg-rose-50 border-rose-100" : "bg-teal-50 border-teal-100")}>
                   <p className={clsx("text-[10px] font-medium uppercase tracking-wider mb-0.5", student.pendingBalance > 0 ? "text-rose-500" : "text-teal-600")}>Balance</p>
                   <p className="text-base md:text-xl font-bold text-gray-900">₹{student.pendingBalance.toLocaleString()}</p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 md:gap-3 pt-4 border-t border-gray-100">
                {student.status !== 'Fully Paid' ? (
                  <button
                    onClick={() => setSelectedStudentForPay(student)}
                    className="flex-1 inline-flex items-center justify-center px-3 py-2.5 border border-transparent text-xs md:text-sm font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm active:scale-95"
                  >
                    <Receipt className="w-4 h-4 mr-1.5" />
                    Pay
                  </button>
                ) : (
                  <button
                    disabled
                    className="flex-1 inline-flex items-center justify-center px-3 py-2.5 border border-transparent text-xs md:text-sm font-bold rounded-xl text-teal-700 bg-teal-50"
                  >
                    <AlertCircle className="w-4 h-4 mr-1.5" />
                    Paid
                  </button>
                )}

                <button
                  onClick={() => generateReceiptPDF(student)}
                  className="p-2.5 text-blue-600 border border-blue-100 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-colors active:scale-95"
                  title="Download Fee Card"
                >
                  <FileDown className="w-5 h-5" />
                </button>

                <button
                  onClick={() => handleDelete(student.id!)}
                  className="p-2.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors active:scale-95"
                  title="Delete Student"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {isNewModalOpen && <NewStudentModal onClose={() => setIsNewModalOpen(false)} />}
      {selectedStudentForPay && (
        <PaymentModal 
          student={selectedStudentForPay} 
          onClose={() => setSelectedStudentForPay(null)} 
        />
      )}
    </div>
  );
};

export default Students;
