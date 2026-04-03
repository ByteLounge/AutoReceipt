import React, { useState } from 'react';
import { useStudents } from '../hooks/useStudents';
import { X, Receipt, CheckCircle, Smartphone } from 'lucide-react';
import type { Student, PaymentReceipt } from '../types';
import { format } from 'date-fns';
import { generateReceiptPDF } from '../utils/generateReceipt';

interface Props {
  student: Student;
  onClose: () => void;
}

const PaymentModal: React.FC<Props> = ({ student, onClose }) => {
  const { updateStudent } = useStudents();
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [success, setSuccess] = useState(false);

  // Determine next installment
  const nextInstallmentNum = student.paymentHistory.length === 0 
      ? student.joiningInstallment 
      : Math.max(...student.paymentHistory.map(p => p.installmentNumber)) + 1;

  // We should make sure we don't go out of bounds of the array
  const installmentIndex = nextInstallmentNum - 1;
  const isFullyPaid = installmentIndex >= student.feeStructure.installments.length;
  
  const amountToPay = !isFullyPaid ? student.feeStructure.installments[installmentIndex] : 0;

  const handlePayment = async () => {
    if (isFullyPaid) return;
    setLoading(true);

    try {
      const receiptId = `AA-${format(new Date(), 'yyMM')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
      
      const newPayment: PaymentReceipt = {
        receiptId,
        installmentNumber: nextInstallmentNum,
        datePaid: new Date(date).toISOString(),
        amount: amountToPay
      };

      const updatedHistory = [...student.paymentHistory, newPayment];
      const newTotalPaid = student.totalPaid + amountToPay;
      const newPendingBalance = Math.max(0, student.pendingBalance - amountToPay);
      const newStatus = newPendingBalance === 0 ? 'Fully Paid' : 'Partial Paid';

      const updateData: Partial<Student> = {
        paymentHistory: updatedHistory,
        totalPaid: newTotalPaid,
        pendingBalance: newPendingBalance,
        status: newStatus
      };

      await updateStudent(student.id!, updateData);
      
      const completedStudent = { ...student, ...updateData } as Student;
      generateReceiptPDF(completedStudent);
      
      setSuccess(true);
    } catch (err) {
      console.error(err);
      alert('Failed to process payment.');
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(`Your Achievers Academy fee receipt is attached.`);
    window.open(`https://wa.me/91${student.mobileNumber}?text=${text}`, '_blank');
    onClose();
  };

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white rounded-t-3xl sm:rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-300 p-8 text-center">
           <div className="bg-emerald-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-emerald-600" />
           </div>
           <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
           <p className="text-gray-500 mb-8">Receipt has been automatically downloaded.</p>
           
           <div className="space-y-3">
             <button
               onClick={handleWhatsApp}
               className="w-full py-4 px-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-2xl transition-all shadow-md flex items-center justify-center active:scale-[0.98]"
             >
               <Smartphone className="w-5 h-5 mr-2" />
               Send via WhatsApp
             </button>
             <button
               onClick={onClose}
               className="w-full py-4 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl transition-all active:scale-[0.98]"
             >
               Close
             </button>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-t-3xl sm:rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-300">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center">
            <div className="bg-blue-100 p-2 rounded-lg mr-3 shrink-0">
              <Receipt className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-lg md:text-xl font-bold text-gray-900 tracking-tight">Process Payment</h2>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors active:scale-90">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <h3 className="font-bold text-lg text-gray-900 leading-tight truncate">{student.fullName}</h3>
            <p className="text-sm text-gray-500 mt-1 font-medium">Grade {student.grade} • Installment {nextInstallmentNum}</p>
          </div>

          <div className="bg-blue-600 rounded-2xl p-5 mb-6 shadow-lg shadow-blue-100 text-white">
            <div className="flex justify-between items-center mb-1">
              <span className="text-blue-100 font-bold text-xs uppercase tracking-widest">Amount Due</span>
              <span className="text-2xl font-black">₹{amountToPay.toLocaleString()}</span>
            </div>
            <p className="text-blue-200/80 text-[10px] font-bold text-right uppercase tracking-widest">Installment {nextInstallmentNum} Payment</p>
          </div>

          <div className="mb-8">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Payment Date</label>
            <input
              type="date"
              className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-base font-semibold"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={onClose}
              className="flex-1 py-4 border-2 border-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-50 transition-colors active:scale-[0.98]"
            >
              Cancel
            </button>
            <button
              onClick={handlePayment}
              disabled={loading || isFullyPaid}
              className="flex-[1.5] py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 shadow-md shadow-blue-200 transition-all hover:shadow-lg disabled:opacity-70 flex items-center justify-center active:scale-[0.98]"
            >
              {loading ? (
                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Pay & Receipt'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
