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
      
      // Update local student object to pass to generateReceiptPDF without needing to fetch from hook again
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 p-8 text-center">
           <div className="bg-emerald-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-emerald-600" />
           </div>
           <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
           <p className="text-gray-500 mb-8">Receipt has been automatically downloaded to your device.</p>
           
           <div className="space-y-3">
             <button
               onClick={handleWhatsApp}
               className="w-full py-3.5 px-4 bg-green-500 hover:bg-green-600 text-white font-medium rounded-xl transition-colors shadow-sm flex items-center justify-center"
             >
               <Smartphone className="w-5 h-5 mr-2" />
               Send Receipt via WhatsApp
             </button>
             <button
               onClick={onClose}
               className="w-full py-3.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors"
             >
               Close
             </button>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center">
            <div className="bg-blue-100 p-2 rounded-lg mr-3">
              <Receipt className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Process Payment</h2>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <h3 className="font-bold text-lg text-gray-900">{student.fullName}</h3>
            <p className="text-sm text-gray-500 mt-1">Grade {student.grade} • Next Installment: {nextInstallmentNum}</p>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
            <div className="flex justify-between items-center mb-1">
              <span className="text-blue-700 font-medium text-sm">Amount Due</span>
              <span className="text-blue-700 font-bold text-xl">₹{amountToPay.toLocaleString()}</span>
            </div>
            <p className="text-blue-500/80 text-xs text-right">for Installment {nextInstallmentNum}</p>
          </div>

          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Date</label>
            <input
              type="date"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={onClose}
              className="flex-1 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handlePayment}
              disabled={loading || isFullyPaid}
              className="flex-1 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 shadow-sm transition-all hover:shadow-md disabled:opacity-70 flex items-center justify-center"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Generate Receipt'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
