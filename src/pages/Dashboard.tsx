import React, { useMemo } from 'react';
import { useStudents } from '../hooks/useStudents';
import { Users, IndianRupee, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import clsx from 'clsx';

const Dashboard: React.FC = () => {
  const { students, loading } = useStudents();

  const stats = useMemo(() => {
    let totalFees = 0;
    let pendingFees = 0;
    let fullyPaid = 0;
    let partialPaid = 0;

    students.forEach(student => {
      totalFees += student.totalPaid || 0;
      pendingFees += student.pendingBalance || 0;
      
      if (student.status === 'Fully Paid') fullyPaid++;
      else if (student.status === 'Partial Paid') partialPaid++;
    });

    return {
      totalStudents: students.length,
      totalFees,
      pendingFees,
      fullyPaid,
      partialPaid
    };
  }, [students]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const statCards = [
    { title: 'Total Students', value: stats.totalStudents, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Fees Collected', value: `₹${stats.totalFees.toLocaleString()}`, icon: IndianRupee, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Pending Fees', value: `₹${stats.pendingFees.toLocaleString()}`, icon: Clock, color: 'text-rose-600', bg: 'bg-rose-50' },
    { title: 'Fully Paid', value: stats.fullyPaid, icon: CheckCircle, color: 'text-teal-600', bg: 'bg-teal-50' },
    { title: 'Partial Paid', value: stats.partialPaid, icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard Overview</h1>
        <p className="text-gray-500 mt-1 text-lg">Tuition fee statistics and student summary.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center hover:shadow-md transition-all hover:-translate-y-1">
            <div className={clsx('p-4 rounded-xl mr-5', stat.bg)}>
              <stat.icon className={clsx('w-8 h-8', stat.color)} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{stat.title}</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Quick recent activity or info could go here, but omitted to prioritize simplicity as requested */}
      <div className="mt-8 bg-blue-50 rounded-2xl p-6 border border-blue-100 flex items-start">
         <div className="bg-blue-100 p-2 rounded-lg mr-4 mt-1">
            <Users className="w-5 h-5 text-blue-700" />
         </div>
         <div>
            <h3 className="font-semibold text-blue-900 text-lg">Achievers Academy System Ready</h3>
            <p className="text-blue-700 mt-1">Navigate to "Students & Fees" to add new admissions or process payments seamlessly. All entries are synced instantly and available across devices.</p>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;
