import React, { useState, useRef } from 'react';
import { useStudents } from '../hooks/useStudents';
import { Printer, Download, Bell, FileDown } from 'lucide-react';
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
    <div className="space-y-6 max-w-7xl mx-auto h-full flex flex-col animate-in fade-in duration-500">
      
      {/* Print-only Header */}
      <div className="hidden print:block mb-8 text-center">
         <h1 className="text-3xl font-bold text-gray-900">Achievers Academy</h1>
         <h2 className="text-xl text-gray-600 mt-1">Fee Register - {registerGrade === 'All' ? 'All Grades' : `Grade ${registerGrade}`}</h2>
      </div>

      <div className="print:hidden">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Admin Tools</h1>
        <p className="text-gray-500 mt-1 text-lg">Generate registers and send fee reminders.</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-200/50 p-1 rounded-xl w-full max-w-md print:hidden">
        <button
          onClick={() => setActiveTab('registers')}
          className={clsx(
            "flex-1 py-2.5 text-sm font-medium rounded-lg transition-all",
            activeTab === 'registers' ? "bg-white text-blue-700 shadow-sm" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/50"
          )}
        >
          Registers
        </button>
        <button
          onClick={() => setActiveTab('reminders')}
          className={clsx(
            "flex-1 py-2.5 text-sm font-medium rounded-lg transition-all flex justify-center items-center",
            activeTab === 'reminders' ? "bg-white text-blue-700 shadow-sm" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/50"
          )}
        >
          Pending Reminders
          {pendingStudents.length > 0 && (
            <span className="ml-2 bg-rose-100 text-rose-600 py-0.5 px-2 rounded-full text-xs font-bold">
              {pendingStudents.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'registers' ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex-1 flex flex-col overflow-hidden print:border-none print:shadow-none">
          <div className="p-4 md:p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Filter Grade:</label>
              <select
                value={registerGrade}
                onChange={(e) => setRegisterGrade(e.target.value)}
                className="py-2.5 px-4 border border-gray-200 rounded-xl focus:ring-blue-500 focus:border-blue-500 bg-gray-50 cursor-pointer"
              >
                <option value="All">All Grades</option>
                {[5,6,7,8,9,10].map(g => <option key={g} value={g}>Grade {g}</option>)}
              </select>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handlePrint}
                className="inline-flex items-center px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <Printer className="w-4 h-4 mr-2" />
                Print Register
              </button>
              <button
                onClick={handleExportPDF}
                className="inline-flex items-center px-4 py-2.5 border border-transparent rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </button>
            </div>
          </div>

          <div className="overflow-x-auto" ref={printRef}>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 print:bg-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Student Name</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Grade</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Mobile</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Total Paid</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Pending</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider print:hidden">Status</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider print:hidden">Receipt</th>
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.fullName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.grade}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.mobileNumber}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">₹{student.totalPaid.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-rose-600">
                        {student.pendingBalance > 0 ? `₹${student.pendingBalance.toLocaleString()}` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap print:hidden">
                        <span className={clsx(
                          "px-2.5 py-1 text-xs font-bold rounded-full uppercase tracking-wider",
                          student.status === 'Fully Paid' && "bg-teal-100 text-teal-800",
                          student.status === 'Partial Paid' && "bg-amber-100 text-amber-800",
                          student.status === 'Pending' && "bg-rose-100 text-rose-800"
                        )}>
                          {student.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center print:hidden">
                        <button
                          onClick={() => generateReceiptPDF(student)}
                          className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pendingStudents.length === 0 ? (
            <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <Bell className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <p className="text-lg">No pending fees. Great job!</p>
            </div>
          ) : (
            pendingStudents.map(student => (
              <div key={student.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{student.fullName}</h3>
                    <p className="text-sm text-gray-500">Grade {student.grade} • {student.mobileNumber}</p>
                  </div>
                  <div className="bg-rose-50 text-rose-700 px-3 py-1.5 rounded-lg text-sm font-bold">
                    ₹{student.pendingBalance.toLocaleString()}
                  </div>
                </div>
                
                <div className="mt-auto pt-4 border-t border-gray-100">
                  <button
                    onClick={() => sendReminder(student.mobileNumber)}
                    className="w-full flex items-center justify-center px-4 py-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl text-sm font-bold transition-all shadow-sm hover:shadow-md"
                  >
                    <Bell className="w-4 h-4 mr-2" />
                    Send WhatsApp Reminder
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
