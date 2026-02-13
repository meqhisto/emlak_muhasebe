import React, { useEffect, useState, useMemo } from 'react';
import { User, Consultant, Transaction, Expense, ExpenseCategory } from '../types';
import { INITIAL_CONSULTANTS, INITIAL_TRANSACTIONS, INITIAL_EXPENSES } from '../constants';
import { ShieldCheck, Users, Banknote, CheckCircle2, TrendingUp, Building2, Receipt, Target, AlertTriangle, Calendar } from 'lucide-react';

import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';

const MONTHS = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

const Dashboard: React.FC = () => {
  const { currentUser: user } = useAuth();
  const { consultants, transactions, expenses } = useData();
  const isPartner = user?.role === 'ORTAK' || user?.role === 'ADMIN';

  // Filter State
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth()); // 0-11

  // Goal State
  const [monthlyGoal] = useState<number>(100000);

  // Available years from data
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    transactions?.forEach(t => years.add(new Date(t.date).getFullYear()));
    expenses?.forEach(e => years.add(new Date(e.date).getFullYear()));
    years.add(new Date().getFullYear());
    return Array.from(years).sort((a, b) => b - a);
  }, [transactions, expenses]);

  // Hakediş filtresi
  const isCommissionExpense = (e: Expense) =>
    e.category === ExpenseCategory.COMMISSION ||
    (e.category === ExpenseCategory.PERSONNEL && e.description.toLowerCase().includes('hakediş'));

  // Filtered data by selected period
  const filteredTransactions = useMemo(() => {
    if (!transactions) return [];
    return transactions.filter(t => {
      const d = new Date(t.date);
      return d.getFullYear() === selectedYear && d.getMonth() === selectedMonth;
    });
  }, [transactions, selectedYear, selectedMonth]);

  const filteredExpenses = useMemo(() => {
    if (!expenses) return [];
    return expenses.filter(e => {
      const d = new Date(e.date);
      return d.getFullYear() === selectedYear && d.getMonth() === selectedMonth && !isCommissionExpense(e);
    });
  }, [expenses, selectedYear, selectedMonth]);

  const stats = useMemo(() => {
    if (!consultants) return {
      activeConsultants: 0,
      totalRevenue: 0,
      officeRevenue: 0,
      totalExpenses: 0,
      unpaidDebts: 0,
      netProfit: 0,
      transactionCount: 0,
    };

    const totalRev = filteredTransactions.reduce((acc, t) => acc + t.totalRevenue, 0);
    const officeRev = filteredTransactions.reduce((acc, t) => acc + t.officeRevenue, 0);
    const totalExp = filteredExpenses.reduce((acc, e) => acc + e.amount, 0);
    const totalUnpaid = filteredExpenses.filter(e => !e.isPaid).reduce((acc, e) => acc + e.amount, 0);

    return {
      activeConsultants: consultants.filter(c => c.isActive).length,
      totalRevenue: totalRev,
      officeRevenue: officeRev,
      totalExpenses: totalExp,
      unpaidDebts: totalUnpaid,
      netProfit: officeRev - totalExp,
      transactionCount: filteredTransactions.length,
    };
  }, [consultants, filteredTransactions, filteredExpenses]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
  };

  const goalProgress = Math.min((stats.totalRevenue / monthlyGoal) * 100, 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Hoş Geldiniz, {user?.name}</h1>
          <p className="text-slate-500">Ofisinizin güncel finansal durumuna göz atın.</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Period Filter */}
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm">
            <Calendar size={16} className="text-slate-400" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="bg-transparent outline-none text-sm font-medium text-slate-700"
            >
              {MONTHS.map((name, index) => (
                <option key={index} value={index}>{name}</option>
              ))}
            </select>
            <span className="text-slate-300">|</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-transparent outline-none text-sm font-medium text-slate-700"
            >
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium border border-indigo-100">
            <ShieldCheck size={16} />
            {user?.role}
          </div>
        </div>
      </div>

      {/* Debt Warning Alert */}
      {stats.unpaidDebts > 0 && (
        <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-orange-600" size={24} />
            <div>
              <h3 className="font-bold text-orange-900 text-sm">Bekleyen Ödemeleriniz Var!</h3>
              <p className="text-orange-700 text-xs">Toplam <strong>{formatCurrency(stats.unpaidDebts)}</strong> tutarında ödenmemiş gider kaydı mevcut.</p>
            </div>
          </div>
          <button onClick={() => window.location.hash = '/expenses'} className="text-xs font-bold text-orange-600 bg-white px-3 py-1.5 rounded-lg border border-orange-200 hover:bg-orange-100 transition-colors">Giderlere Git</button>
        </div>
      )}

      {/* Period Badge */}
      <div className="text-center">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-wider border border-indigo-100">
          <Calendar size={14} />
          {MONTHS[selectedMonth]} {selectedYear} Dönemi
        </span>
      </div>

      {/* Main Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Banknote size={64} className="text-emerald-600" />
          </div>
          <p className="text-sm font-medium text-slate-500">Toplam Ciro</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{formatCurrency(stats.totalRevenue)}</p>
          <div className="mt-4 flex items-center gap-1 text-xs font-bold text-emerald-600">
            <TrendingUp size={14} />
            <span>{stats.transactionCount} İşlem</span>
          </div>
        </div>

        {isPartner && (
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden text-white">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Building2 size={64} className="text-white" />
            </div>
            <p className="text-sm font-medium text-slate-400">Ofis Geliri (Brüt)</p>
            <p className="text-3xl font-bold text-white mt-1">{formatCurrency(stats.officeRevenue)}</p>
            <div className="mt-4 flex items-center gap-1 text-xs font-bold text-indigo-400 uppercase">
              Pay: %{Math.round((stats.officeRevenue / (stats.totalRevenue || 1)) * 100)}
            </div>
          </div>
        )}

        {isPartner ? (
          <div className={`p-6 rounded-2xl shadow-lg relative overflow-hidden text-white ${stats.netProfit >= 0 ? 'bg-emerald-600 shadow-emerald-900/10' : 'bg-red-600 shadow-red-900/10'}`}>
            <div className="absolute top-0 right-0 p-4 opacity-20">
              <CheckCircle2 size={64} className="text-white" />
            </div>
            <p className="text-sm font-medium text-white/80">Net Kâr</p>
            <p className="text-3xl font-bold text-white mt-1">{formatCurrency(stats.netProfit)}</p>
            <p className="text-xs text-white/70 mt-4 italic">Giderler sonrası kalan tutar</p>
          </div>
        ) : (
          <>
            <div className="bg-indigo-600 p-6 rounded-2xl shadow-lg shadow-indigo-900/10 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-20">
                <Building2 size={64} className="text-white" />
              </div>
              <p className="text-sm font-medium text-indigo-100">Toplam İşlem</p>
              <p className="text-3xl font-bold text-white mt-1">{stats.transactionCount}</p>
              <p className="text-xs text-indigo-100 mt-4 italic">Bu dönemde kayıtlı işlem</p>
            </div>
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden text-white">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Users size={64} className="text-white" />
              </div>
              <p className="text-sm font-medium text-slate-400">Aktif Kadro</p>
              <p className="text-3xl font-bold text-white mt-1">{stats.activeConsultants} Danışman</p>
              <div className="mt-4 flex items-center gap-1 text-xs font-bold text-indigo-400 uppercase">
                Ekip Aktif
              </div>
            </div>
          </>
        )}
      </div>

      {/* Goal Tracker */}
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-rose-50 text-rose-500 rounded-xl">
              <Target size={28} />
            </div>
            <div>
              <h3 className="font-bold text-xl text-slate-800">Aylık Performans Hedefi</h3>
              <p className="text-sm text-slate-500">{MONTHS[selectedMonth]} {selectedYear} ciro hedefine olan ilerleme</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400 uppercase font-bold mb-1">Hedef</p>
            <p className="text-lg font-bold text-slate-700 bg-slate-100 px-4 py-1.5 rounded-lg border border-slate-200">
              {formatCurrency(monthlyGoal)}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex justify-between items-end">
            <span className="text-sm font-bold text-slate-600 uppercase tracking-wider">Mevcut Durum</span>
            <span className={`text-2xl font-black ${goalProgress >= 100 ? "text-emerald-600" : "text-indigo-600"}`}>
              %{Math.round(goalProgress)}
            </span>
          </div>
          <div className="w-full bg-slate-100 h-6 rounded-full overflow-hidden border border-slate-200 p-1">
            <div
              className={`h-full rounded-full transition-all duration-1000 ease-out shadow-sm relative ${goalProgress >= 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-indigo-500 to-indigo-600'}`}
              style={{ width: `${goalProgress}%` }}
            >
              {goalProgress > 10 && (
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              )}
            </div>
          </div>
          <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
            <p className="text-sm text-slate-600">
              Kalan İhtiyaç: <span className="font-bold text-slate-900">{formatCurrency(Math.max(0, monthlyGoal - stats.totalRevenue))}</span>
            </p>
            {goalProgress >= 100 && (
              <span className="flex items-center gap-2 text-sm font-bold text-emerald-600">
                <CheckCircle2 size={18} /> Tebrikler, Aylık Hedef Yakalandı!
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Secondary Info Grid - Only for Partners */}
      {isPartner && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
                <Receipt size={24} />
              </div>
              <div>
                <h4 className="font-bold text-slate-800">Toplam Giderler</h4>
                <p className="text-2xl font-bold text-rose-600">{formatCurrency(stats.totalExpenses)}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-400 uppercase font-bold">Gider Oranı</p>
              <p className="text-sm font-bold text-slate-600">%{Math.round((stats.totalExpenses / (stats.officeRevenue || 1)) * 100)}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <Users size={24} />
              </div>
              <div>
                <h4 className="font-bold text-slate-800">Aktif Kadro</h4>
                <p className="text-2xl font-bold text-slate-900">{stats.activeConsultants} Danışman</p>
              </div>
            </div>
            <div className="bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
              <span className="text-xs font-bold text-indigo-600">Ekip Aktif</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;