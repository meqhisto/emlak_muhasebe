import React, { useEffect, useState } from 'react';
import { User, UserRole, Consultant, Transaction, Expense } from '../types';
import { INITIAL_CONSULTANTS, INITIAL_TRANSACTIONS, INITIAL_EXPENSES, CURRENCY_SYMBOL } from '../constants';
import { ShieldCheck, Users, Banknote, AlertTriangle, CheckCircle2, TrendingUp, ArrowRight, Building2, Receipt, FileSignature, Briefcase, BarChart3, Rocket } from 'lucide-react';

interface DashboardProps {
  user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [activeConsultantCount, setActiveConsultantCount] = useState<number>(0);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [officeRevenue, setOfficeRevenue] = useState<number>(0);
  const [totalExpenses, setTotalExpenses] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. DANIŞMAN VERİLERİ
    const storedConsultants = localStorage.getItem('emlak_consultants');
    let consultants: Consultant[] = storedConsultants 
      ? JSON.parse(storedConsultants) 
      : INITIAL_CONSULTANTS;

    setActiveConsultantCount(consultants.filter(c => c.isActive).length);

    // 2. İŞLEM/GELİR VERİLERİ
    const storedTransactions = localStorage.getItem('emlak_transactions');
    let transactions: Transaction[] = storedTransactions
      ? JSON.parse(storedTransactions)
      : INITIAL_TRANSACTIONS;

    const totalRev = transactions.reduce((acc, t) => acc + t.totalRevenue, 0);
    const officeRev = transactions.reduce((acc, t) => acc + t.officeRevenue, 0);

    setTotalRevenue(totalRev);
    setOfficeRevenue(officeRev);

    // 3. GİDER VERİLERİ
    const storedExpenses = localStorage.getItem('emlak_expenses');
    let expenses: Expense[] = storedExpenses
      ? JSON.parse(storedExpenses)
      : INITIAL_EXPENSES;
    
    const totalExp = expenses.reduce((acc, e) => acc + e.amount, 0);
    setTotalExpenses(totalExp);

    setLoading(false);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Hoş Geldiniz, {user.name}</h1>
          <p className="text-slate-500">Finansal durum ve operasyon özeti.</p>
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium border border-indigo-100">
          <ShieldCheck size={16} />
          Yetki: {user.role}
        </div>
      </div>

      {/* Proje Durum Kartları */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl shadow-lg text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10">
              <Rocket size={120} />
          </div>
          <div className="p-6 relative z-10">
              <div className="flex items-center gap-3 mb-2">
                  <span className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                      <CheckCircle2 size={20} className="text-white" />
                  </span>
                  <h3 className="font-bold text-lg">Sistem Aktif - Faz 7 (Final)</h3>
              </div>
              <p className="text-emerald-50 max-w-2xl mb-4">
                  Tüm modüller (Danışman, Gelir, Gider, Hakediş, Personel, Raporlama) başarıyla entegre edildi ve test edildi. 
                  Sistem canlı kullanıma hazırdır. Veri güvenliği için "Ayarlar" menüsünden düzenli yedek almayı unutmayın.
              </p>
              <div className="flex gap-4">
                  <div className="text-xs bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/10">
                      v1.0.0 Release
                  </div>
              </div>
          </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Aktif Danışmanlar */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Users size={64} className="text-slate-600" />
          </div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-500">Danışman</h3>
            <Users className="text-slate-400" size={20} />
          </div>
          <div className="text-3xl font-bold text-slate-900">
            {loading ? '...' : activeConsultantCount}
          </div>
        </div>

        {/* Toplam Ciro */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Banknote size={64} className="text-emerald-600" />
          </div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-500">Toplam Ciro</h3>
            <Banknote className="text-emerald-500" size={20} />
          </div>
          <div className="text-2xl font-bold text-slate-900 truncate" title={formatCurrency(totalRevenue)}>
            {loading ? '...' : formatCurrency(totalRevenue)}
          </div>
        </div>

        {/* Toplam Gider */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Receipt size={64} className="text-rose-600" />
          </div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-500">Toplam Gider</h3>
            <Receipt className="text-rose-500" size={20} />
          </div>
          <div className="text-2xl font-bold text-slate-900 truncate text-rose-600" title={formatCurrency(totalExpenses)}>
            {loading ? '...' : `-${formatCurrency(totalExpenses)}`}
          </div>
        </div>

        {/* Ofis Geliri (Net) */}
        <div className="bg-indigo-600 p-6 rounded-xl border border-indigo-700 shadow-sm relative overflow-hidden text-white">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Building2 size={64} className="text-white" />
          </div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-indigo-100">Net Ofis Geliri</h3>
            <Building2 className="text-indigo-200" size={20} />
          </div>
          <div className="text-2xl font-bold text-white truncate" title={formatCurrency(officeRevenue)}>
            {loading ? '...' : formatCurrency(officeRevenue)}
          </div>
           <p className="text-xs text-indigo-200 mt-2 opacity-80">
            Danışman payları hariç
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;