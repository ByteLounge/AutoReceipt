import React, { useState, useRef } from 'react';
import { useStudents } from '../hooks/useStudents';
import { Printer, Download, Bell, FileDown, Info } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import clsx from 'clsx';
import { generateReceiptPDF } from '../utils/generateReceipt';

const Registers: React.FC = () => {
  const { students, loading } = useStudents();
  const [activeTab, setActiveTab] = useState<'registers' | 'reminders'>('registers');
  const [registerGrade, setRegisterGrade] = useState<string>('All');
  const printRef = useRef<HTMLDivElement>(null);

  const pendingStudents = students.filter(s => s.pendingBalance > 0);
  
  const registerStudents = students.filter(s => 
    registerGrade === 'All' ? true : s.grade.toString() === registerGrade
  ).sort((a, b) => a.grade - b.grade || a.fullName.localeCompare(b.fullName));

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    const doc = new jsPDF('landscape');
    
    doc.setFontSize(18);
    doc.text(`Achievers Academy - Fee Register (${registerGrade === 'All' ? 'All Grades' : `Grade ${registerGrade}`})`, 14, 20);
    
    const tableColumn = ["Student Name", "Grade", "Mobile Number", "Total Paid", "Pending Balance", "Status"];
    const tableRows = registerStudents.map(s => [
      s.fullName,
      s.grade.toString(),
      s.mobileNumber,
      `Rs ${s.totalPaid}`,
      `Rs ${s.pendingBalance}`,
      s.status
    ]);

    autoTable(doc, {
      startY: 30,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [30, 64, 175] }
    });

    doc.save(`Fee_Register_${registerGrade === 'All' ? 'All' : 'Grade_' + registerGrade}.pdf`);
  };

  const sendReminder = (mobile: string) => {
    const text = encodeURIComponent("Reminder: Your tuition fee installment for Achievers Academy is pending.");
    window.open(`https://wa.me/91${mobile}?text=${text}`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 max-w-7xl mx-auto h-full flex flex-col animate-in fade-in duration-500">
      
      {/* Print-only Header */}
      <div className="hidden print:block mb-8 text-center">
         <h1 className="text-3xl font-bold text-gray-900">Achievers Academy</h1>
         <h2 className="text-xl text-gray-600 mt-1">Fee Register - {registerGrade === 'All' ? 'All Grades' : `Grade ${registerGrade}`}</h2>
      </div>

      <div className="print:hidden">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Admin Tools</h1>
        <p className="text-gray-500 mt-1 text-base md:text-lg">Registers and reminders.</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-200/50 p-1 rounded-xl w-full max-w-md print:hidden">
        <button
          onClick={() => setActiveTab('registers')}
          className={clsx(
            "flex-1 py-2 md:py-2.5 text-sm font-semibold rounded-lg transition-all active:scale-[0.98]",
            activeTab === 'registers' ? "bg-white text-blue-700 shadow-sm" : "text-gray-600 hover:text-gray-900"
          )}
        >
          Registers
        </button>
        <button
          onClick={() => setActiveTab('reminders')}
          className={clsx(
            "flex-1 py-2 md:py-2.5 text-sm font-semibold rounded-lg transition-all flex justify-center items-center active:scale-[0.98]",
            activeTab === 'reminders' ? "bg-white text-blue-700 shadow-sm" : "text-gray-600 hover:text-gray-900"
          )}
        >
          Reminders
          {pendingStudents.length > 0 && (
            <span className="ml-2 bg-rose-100 text-rose-600 py-0.5 px-2 rounded-full text-[10px] font-bold">
              {pendingStudents.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'registers' ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex-1 flex flex-col overflow-hidden print:border-none print:shadow-none">
          <div className="p-3 md:p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4 print:hidden">
            <div className="flex items-center space-x-3">
              <label className="text-sm font-bold text-gray-700 whitespace-nowrap">Grade:</label>
              <select
                value={registerGrade}
                onChange={(e) => setRegisterGrade(e.target.value)}
                className="flex-1 md:flex-none py-2 px-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-gray-50 cursor-pointer text-sm font-medium"
              >
                <option value="All">All Grades</option>
                {[5,6,7,8,9,10].map(g => <option key={g} value={g}>Grade {g}</option>)}
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="flex-1 md:inline-flex items-center justify-center px-3 py-2 border border-gray-200 rounded-xl text-xs md:text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 transition-colors active:scale-95"
              >
                <Printer className="w-4 h-4 mr-1.5 md:mr-2" />
                Print
              </button>
              <button
                onClick={handleExportPDF}
                className="flex-1 md:inline-flex items-center justify-center px-3 py-2 border border-transparent rounded-xl text-xs md:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm active:scale-95"
              >
                <Download className="w-4 h-4 mr-1.5 md:mr-2" />
                Export
              </button>
            </div>
          </div>

          <div className="md:hidden px-4 py-2 bg-blue-50/50 border-b border-blue-100 flex items-center text-[10px] text-blue-700 font-medium uppercase tracking-wider">
            <Info className="w-3 h-3 mr-1.5" />
            Swipe table horizontally to view more
          </div>

          <div className="overflow-x-auto scrollbar-hide" ref={printRef}>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 print:bg-gray-100">
                <tr>
                  <th className="px-4 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider">Student Name</th>
                  <th className="px-4 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider">Grade</th>
                  <th className="px-4 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider">Mobile</th>
                  <th className="px-4 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider">Total Paid</th>
                  <th className="px-4 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider">Pending</th>
                  <th className="px-4 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider print:hidden">Status</th>
                  <th className="px-4 md:px-6 py-3 md:py-4 text-center text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider print:hidden">Receipt</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {registerStudents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      No students found for this selection.
                    </td>
                  </tr>
                ) : (
                  registerStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50/50 transition-colors print:hover:bg-transparent">
                      <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap text-sm font-bold text-gray-900">{student.fullName}</td>
                      <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap text-sm text-gray-500">{student.grade}</td>
                      <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{student.mobileNumber}</td>
                      <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap text-sm font-bold text-gray-900">₹{student.totalPaid.toLocaleString()}</td>
                      <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap text-sm font-bold text-rose-600">
                        {student.pendingBalance > 0 ? `₹${student.pendingBalance.toLocaleString()}` : '-'}
                      </td>
                      <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap print:hidden">
                        <span className={clsx(
                          "px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider",
                          student.status === 'Fully Paid' && "bg-teal-100 text-teal-800",
                          student.status === 'Partial Paid' && "bg-amber-100 text-amber-800",
                          student.status === 'Pending' && "bg-rose-100 text-rose-800"
                        )}>
                          {student.status === 'Fully Paid' ? 'Paid' : student.status === 'Partial Paid' ? 'Partial' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap text-center print:hidden">
                        <button
                          onClick={() => generateReceiptPDF(student)}
                          className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-colors active:scale-90"
                          title="Download Receipt"
                        >
                          <FileDown className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {pendingStudents.length === 0 ? (
            <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-2xl border border-dashed border-gray-200">
              <Bell className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <p className="text-lg">No pending fees. Great job!</p>
            </div>
          ) : (
            pendingStudents.map(student => (
              <div key={student.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-6 flex flex-col relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-500"></div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 leading-tight">{student.fullName}</h3>
                    <p className="text-sm text-gray-500 mt-1 font-medium">Grade {student.grade} • {student.mobileNumber}</p>
                  </div>
                  <div className="bg-rose-50 text-rose-700 px-2.5 py-1.5 rounded-lg text-sm font-bold shadow-sm shadow-rose-100">
                    ₹{student.pendingBalance.toLocaleString()}
                  </div>
                </div>
                
                <div className="mt-auto pt-4 border-t border-gray-100">
                  <button
                    onClick={() => sendReminder(student.mobileNumber)}
                    className="w-full flex items-center justify-center px-4 py-3 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl text-sm font-bold transition-all shadow-sm active:scale-[0.98]"
                  >
                    <Bell className="w-4 h-4 mr-2" />
                    WhatsApp Reminder
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Registers;
