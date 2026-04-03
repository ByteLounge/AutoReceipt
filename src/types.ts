export type PaymentStatus = 'Fully Paid' | 'Partial Paid' | 'Pending';

export interface PaymentReceipt {
  receiptId: string;
  installmentNumber: number;
  datePaid: string;
  amount: number;
}

export interface Student {
  id?: string;
  fullName: string;
  mobileNumber: string;
  grade: number; 
  academicYear: string; 
  joiningInstallment: number; 
  admissionDate: string; // New field for Date of Admission
  
  feeStructure: {
    annualFees: number;
    installments: number[]; 
  };
  
  paymentHistory: PaymentReceipt[];
  
  status: PaymentStatus;
  pendingBalance: number;
  totalPaid: number;
  
  remarks?: string;
  createdAt: number;
}
