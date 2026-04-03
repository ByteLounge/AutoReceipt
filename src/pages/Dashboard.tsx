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
    { title: 'Students', value: stats.totalStudents, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Collected', value: `₹${stats.totalFees.toLocaleString()}`, icon: IndianRupee, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Pending', value: `₹${stats.pendingFees.toLocaleString()}`, icon: Clock, color: 'text-rose-600', bg: 'bg-rose-50' },
    { title: 'Fully Paid', value: stats.fullyPaid, icon: CheckCircle, color: 'text-teal-600', bg: 'bg-teal-50' },
    { title: 'Partial', value: stats.partialPaid, icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
      <div className="px-1 md:px-0">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
        <p className="text-gray-500 mt-1 text-base md:text-lg">Tuition fee summary and statistics.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {statCards.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-gray-100 flex items-center hover:shadow-md transition-all active:scale-[0.98]">
            <div className={clsx('p-3 md:p-4 rounded-xl mr-4 md:mr-5 shrink-0', stat.bg)}>
              <stat.icon className={clsx('w-6 h-6 md:w-8 md:h-8', stat.color)} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] md:text-sm font-bold text-gray-400 uppercase tracking-widest truncate">{stat.title}</p>
              <p className="text-xl md:text-2xl font-bold text-gray-900 mt-0.5 truncate">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 md:mt-8 bg-blue-600 rounded-2xl p-6 md:p-8 text-white relative overflow-hidden shadow-lg shadow-blue-200">
         <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
         <div className="relative z-10">
            <h3 className="font-extrabold text-xl md:text-2xl">Achievers Academy System</h3>
            <p className="text-blue-100 mt-2 text-sm md:text-base leading-relaxed max-w-xl">
              Manage admissions and process payments seamlessly from your mobile device. All data is synced instantly across all your screens.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
               <div className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider">Cloud Synced</div>
               <div className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider">Mobile Ready</div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;
