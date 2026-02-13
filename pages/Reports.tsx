import React, { useState, useEffect, useMemo } from 'react';
import { Transaction, Expense, Consultant, UserRole, TransactionType, Payer } from '../types';
import { INITIAL_TRANSACTIONS, INITIAL_EXPENSES, INITIAL_CONSULTANTS, APP_NAME } from '../constants';
import { BarChart3, TrendingUp, TrendingDown, AlertTriangle, Wallet, Calendar, Printer, FileText, Activity } from 'lucide-react';

const Reports: React.FC = () => {
  // Data State
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  
  // Filter State
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(-1); // -1: All Months

  // Tab State
  const [activeTab, setActiveTab] = useState<'SUMMARY' | 'PARTNERS' | 'CONSULTANTS' | 'PORTFOLIO'>('SUMMARY');

  // Load Data
  useEffect(() => {
    const storedTrans = localStorage.getItem('emlak_transactions');
    const loadedTrans: Transaction[] = storedTrans ? JSON.parse(storedTrans) : INITIAL_TRANSACTIONS;
    setTransactions(loadedTrans);

    const storedExp = localStorage.getItem('emlak_expenses');
    const loadedExp: Expense[] = storedExp ? JSON.parse(storedExp) : INITIAL_EXPENSES;
    setExpenses(loadedExp);

    const storedCons = localStorage.getItem('emlak_consultants');
    setConsultants(storedCons ? JSON.parse(storedCons) : INITIAL_CONSULTANTS);
  }, []);

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    transactions.forEach(t => years.add(new Date(t.date).getFullYear()));
    expenses.forEach(e => years.add(new Date(e.date).getFullYear()));
    years.add(new Date().getFullYear());
    return Array.from(years).sort((a, b) => b - a);
  }, [transactions, expenses]);

  // --- FILTER LOGIC ---
  const filterByDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const yearMatch = date.getFullYear() === selectedYear;
    const monthMatch = selectedMonth === -1 || date.getMonth() === selectedMonth;
    return yearMatch && monthMatch;
  };

  const filteredTransactions = transactions.filter(t => filterByDate(t.date));
  const filteredExpenses = expenses.filter(e => filterByDate(e.date));

  // --- MONTHLY DATA FOR CHART ---
  const monthlyChartData = useMemo(() => {
    const months = ['Ocak', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
    return months.map((name, index) => {
      const rev = transactions
        .filter(t => {
          const d = new Date(t.date);
          return d.getFullYear() === selectedYear && d.getMonth() === index;
        })
        .reduce((acc, t) => acc + t.officeRevenue, 0);

      const exp = expenses
        .filter(e => {
          const d = new Date(e.date);
          return d.getFullYear() === selectedYear && d.getMonth() === index;
        })
        .reduce((acc, e) => acc + e.amount, 0);

      return { name, revenue: rev, expense: exp };
    });
  }, [transactions, expenses, selectedYear]);

  // --- CALCULATIONS ---
  const totalTurnover = filteredTransactions.reduce((acc, t) => acc + t.totalRevenue, 0);
  const totalOfficeRevenue = filteredTransactions.reduce((acc, t) => acc + t.officeRevenue, 0);
  const totalExpenses = filteredExpenses.reduce((acc, e) => acc + e.amount, 0);
  const netProfit = totalOfficeRevenue - totalExpenses;

  const calculatePartnerStats = (payerType: Payer) => {
    const incomeShare = filteredTransactions.reduce((acc, t) => {
        return acc + (payerType === Payer.ALTAN ? t.partnerShareAltan : t.partnerShareSuat);
    }, 0);
    const paidExpenses = filteredExpenses.filter(e => e.paidBy === payerType).reduce((acc, e) => acc + e.amount, 0);
    const shareOfExpenses = totalExpenses / 2;
    const netProfitShare = incomeShare - shareOfExpenses;
    return { grossShare: incomeShare, paidExpenses, shareOfExpenses, netProfitShare, totalBalance: netProfitShare + paidExpenses };
  };

  const altanStats = calculatePartnerStats(Payer.ALTAN);
  const suatStats = calculatePartnerStats(Payer.SUAT);

  const consultantPerformance = consultants.map(c => {
    const consTrans = filteredTransactions.filter(t => t.consultantId === c.id);
    const totalRev = consTrans.reduce((acc, t) => acc + t.totalRevenue, 0);
    const totalComm = consTrans.reduce((acc, t) => acc + t.consultantShare, 0);
    const count = consTrans.length;
    return { ...c, totalRev, totalComm, count };
  }).sort((a, b) => b.totalRev - a.totalRev);
  
  const maxConsultantRevenue = Math.max(...consultantPerformance.map(c => c.totalRev), 0);

  const salesCount = filteredTransactions.filter(t => t.type === TransactionType.SALE).length;
  const rentCount = filteredTransactions.filter(t => t.type === TransactionType.RENT).length;
  const totalCount = salesCount + rentCount;
  const salePercent = totalCount ? (salesCount / totalCount) * 100 : 0;
  const rentPercent = totalCount ? (rentCount / totalCount) * 100 : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
  };

  // --- SVG CHART COMPONENT ---
  const LineChart = ({ data }: { data: any[] }) => {
    const width = 800;
    const height = 300;
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const maxVal = Math.max(...data.map(d => Math.max(d.revenue, d.expense, 1000)));
    
    const getX = (index: number) => padding + (index * (chartWidth / (data.length - 1)));
    const getY = (val: number) => (height - padding) - (val / maxVal) * chartHeight;

    const createPath = (key: 'revenue' | 'expense') => {
      return data.reduce((path, d, i) => {
        const x = getX(i);
        const y = getY(d[key]);
        if (i === 0) return `M ${x} ${y}`;
        
        // Bezier curve points
        const prevX = getX(i - 1);
        const prevY = getY(data[i - 1][key]);
        const cp1x = prevX + (x - prevX) / 2;
        return `${path} C ${cp1x} ${prevY}, ${cp1x} ${y}, ${x} ${y}`;
      }, '');
    };

    return (
      <div className="w-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto drop-shadow-sm">
          {/* Grid Lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((p, i) => (
            <line 
              key={i} 
              x1={padding} y1={getY(maxVal * p)} 
              x2={width - padding} y2={getY(maxVal * p)} 
              stroke="#e2e8f0" strokeDasharray="4 4" 
            />
          ))}

          {/* Lines */}
          <path d={createPath('revenue')} fill="none" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" />
          <path d={createPath('expense')} fill="none" stroke="#f43f5e" strokeWidth="3" strokeLinecap="round" />

          {/* Area under curves (optional aesthetic) */}
          <path d={`${createPath('revenue')} L ${getX(data.length - 1)} ${height - padding} L ${padding} ${height - padding} Z`} fill="url(#gradRev)" opacity="0.1" />

          {/* Data Points */}
          {data.map((d, i) => (
            <React.Fragment key={i}>
              <circle cx={getX(i)} cy={getY(d.revenue)} r="4" fill="#6366f1" className="hover:r-6 cursor-pointer transition-all" />
              <circle cx={getX(i)} cy={getY(d.expense)} r="4" fill="#f43f5e" className="hover:r-6 cursor-pointer transition-all" />
              <text x={getX(i)} y={height - 10} textAnchor="middle" fontSize="10" className="fill-slate-400 font-medium">{d.name}</text>
            </React.Fragment>
          ))}

          <defs>
            <linearGradient id="gradRev" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  };

  const renderSummary = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
        <h2 className="hidden print:block text-xl font-bold text-slate-900 border-b border-slate-300 pb-2 mb-4">1. Finansal Özet</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-sm font-medium text-slate-500">Toplam Ciro</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(totalTurnover)}</h3>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-sm font-medium text-slate-500">Ofis Geliri (Brüt)</p>
                <h3 className="text-2xl font-bold text-indigo-600 mt-1">{formatCurrency(totalOfficeRevenue)}</h3>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-sm font-medium text-slate-500">Toplam Gider</p>
                <h3 className="text-2xl font-bold text-rose-600 mt-1">{formatCurrency(totalExpenses)}</h3>
            </div>
            <div className={`p-5 rounded-xl border shadow-sm ${netProfit >= 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
                <p className={`text-sm font-medium ${netProfit >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>Net Kâr (Dönem)</p>
                <h3 className={`text-2xl font-bold mt-1 ${netProfit >= 0 ? 'text-emerald-900' : 'text-red-900'}`}>{formatCurrency(netProfit)}</h3>
            </div>
        </div>

        {/* --- TREND CHART --- */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm print:break-inside-avoid">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Activity className="text-indigo-600" size={20} />
                    <h3 className="font-bold text-slate-800">Yıllık Gelir & Gider Trendi ({selectedYear})</h3>
                </div>
                <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-wider">
                    <div className="flex items-center gap-1.5 text-indigo-600">
                        <span className="w-3 h-3 rounded-full bg-indigo-600"></span>
                        Gelir
                    </div>
                    <div className="flex items-center gap-1.5 text-rose-600">
                        <span className="w-3 h-3 rounded-full bg-rose-600"></span>
                        Gider
                    </div>
                </div>
            </div>
            <LineChart data={monthlyChartData} />
            <p className="text-[10px] text-slate-400 mt-4 text-center italic">
              Grafik, seçilen yıla ait 12 aylık ofis geliri ve genel gider trendini göstermektedir.
            </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm print:break-inside-avoid">
            <h3 className="font-bold text-slate-800 mb-6">Gelir / Gider Dengesi</h3>
            <div className="space-y-4">
                <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                        <span className="font-medium text-slate-700">Ofis Geliri</span>
                        <span className="font-bold text-slate-900">{formatCurrency(totalOfficeRevenue)}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
                        <div className="bg-indigo-500 h-full rounded-full" style={{ width: '100%' }}></div>
                    </div>
                </div>
                <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                        <span className="font-medium text-slate-700">Giderler</span>
                        <span className="font-bold text-slate-900">{formatCurrency(totalExpenses)}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
                        <div 
                            className="bg-rose-500 h-full rounded-full" 
                            style={{ width: `${Math.min((totalExpenses / (totalOfficeRevenue || 1)) * 100, 100)}%` }}
                        ></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );

  const renderPartners = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300 print:block print:space-y-6">
        <h2 className="hidden print:block text-xl font-bold text-slate-900 border-b border-slate-300 pb-2 mb-4 col-span-2">2. Ortak Durumu (Cari)</h2>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden print:break-inside-avoid">
            <div className="bg-indigo-50 p-4 border-b border-indigo-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-700 font-bold">A</div>
                <div>
                    <h3 className="font-bold text-indigo-900">Altan (Ortak)</h3>
                    <p className="text-xs text-indigo-600">Hesap Özeti</p>
                </div>
            </div>
            <div className="p-6 space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-slate-50">
                    <span className="text-slate-600 text-sm">Brüt Gelir Payı</span>
                    <span className="font-medium text-slate-900">{formatCurrency(altanStats.grossShare)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-50">
                    <span className="text-rose-600 text-sm">Ofis Gider Payı</span>
                    <span className="font-medium text-rose-600">-{formatCurrency(altanStats.shareOfExpenses)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-50">
                    <span className="text-emerald-600 text-sm font-medium">Net Kâr Payı</span>
                    <span className="font-bold text-emerald-600">{formatCurrency(altanStats.netProfitShare)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-50 bg-slate-50/50 px-2 rounded">
                    <span className="text-slate-700 text-sm flex items-center gap-1"><Wallet size={14}/> Cepten Ödediği Gider</span>
                    <span className="font-bold text-slate-900">+{formatCurrency(altanStats.paidExpenses)}</span>
                </div>
                <div className="mt-4 pt-4 border-t-2 border-slate-100">
                    <p className="text-sm text-slate-500 text-center mb-1">Toplam Alacak Bakiye</p>
                    <p className="text-3xl font-bold text-center text-indigo-700">{formatCurrency(altanStats.totalBalance)}</p>
                </div>
            </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden print:break-inside-avoid">
            <div className="bg-violet-50 p-4 border-b border-violet-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-violet-200 flex items-center justify-center text-violet-700 font-bold">S</div>
                <div>
                    <h3 className="font-bold text-violet-900">Suat (Ortak)</h3>
                    <p className="text-xs text-violet-600">Hesap Özeti</p>
                </div>
            </div>
            <div className="p-6 space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-slate-50">
                    <span className="text-slate-600 text-sm">Brüt Gelir Payı</span>
                    <span className="font-medium text-slate-900">{formatCurrency(suatStats.grossShare)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-50">
                    <span className="text-rose-600 text-sm">Ofis Gider Payı</span>
                    <span className="font-medium text-rose-600">-{formatCurrency(suatStats.shareOfExpenses)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-50">
                    <span className="text-emerald-600 text-sm font-medium">Net Kâr Payı</span>
                    <span className="font-bold text-emerald-600">{formatCurrency(suatStats.netProfitShare)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-50 bg-slate-50/50 px-2 rounded">
                    <span className="text-slate-700 text-sm flex items-center gap-1"><Wallet size={14}/> Cepten Ödediği Gider</span>
                    <span className="font-bold text-slate-900">+{formatCurrency(suatStats.paidExpenses)}</span>
                </div>
                <div className="mt-4 pt-4 border-t-2 border-slate-100">
                    <p className="text-sm text-slate-500 text-center mb-1">Toplam Alacak Bakiye</p>
                    <p className="text-3xl font-bold text-center text-violet-700">{formatCurrency(suatStats.totalBalance)}</p>
                </div>
            </div>
        </div>
    </div>
  );

  const renderConsultants = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
         <h2 className="hidden print:block text-xl font-bold text-slate-900 border-b border-slate-300 pb-2 mb-4">3. Danışman Performansı</h2>
         <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm print:break-inside-avoid">
            <h3 className="font-bold text-slate-800 mb-6">Danışman Ciro Sıralaması</h3>
            <div className="space-y-4">
                {consultantPerformance.map((c) => (
                    <div key={c.id} className="space-y-1">
                        <div className="flex justify-between text-sm">
                            <span className="font-medium text-slate-700">{c.fullName}</span>
                            <span className="font-bold text-slate-900">{formatCurrency(c.totalRev)}</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                            <div 
                                className="bg-indigo-500 h-full rounded-full transition-all duration-500" 
                                style={{ width: `${maxConsultantRevenue > 0 ? (c.totalRev / maxConsultantRevenue) * 100 : 0}%` }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>
         </div>

         <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-slate-700">Sıra</th>
                            <th className="px-6 py-4 font-semibold text-slate-700">Danışman</th>
                            <th className="px-6 py-4 font-semibold text-slate-700 text-center">İşlem</th>
                            <th className="px-6 py-4 font-semibold text-slate-700 text-right">Ciro</th>
                            <th className="px-6 py-4 font-semibold text-slate-700 text-right">Hakediş</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {consultantPerformance.map((c, index) => (
                            <tr key={c.id} className="hover:bg-slate-50/50">
                                <td className="px-6 py-4 text-slate-500 font-mono">#{index + 1}</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                                            {c.fullName.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-medium text-slate-900">{c.fullName}</div>
                                            <div className="text-xs text-slate-500">Oran: %{c.commissionRate}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className="inline-flex items-center justify-center w-6 h-6 bg-slate-100 rounded-full text-xs font-bold text-slate-700">
                                        {c.count}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right font-bold text-slate-900">
                                    {formatCurrency(c.totalRev)}
                                </td>
                                <td className="px-6 py-4 text-right text-indigo-600 font-medium">
                                    {formatCurrency(c.totalComm)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
         </div>
    </div>
  );

  const renderPortfolio = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300 print:block print:space-y-6">
        <h2 className="hidden print:block text-xl font-bold text-slate-900 border-b border-slate-300 pb-2 mb-4 col-span-2">4. Portföy Analizi</h2>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center print:break-inside-avoid">
            <h3 className="font-bold text-slate-800 mb-6 w-full text-left">İşlem Dağılımı (Satış vs Kiralama)</h3>
            <div className="relative w-48 h-48 rounded-full mb-6" style={{
                background: `conic-gradient(#3b82f6 0% ${salePercent}%, #f97316 ${salePercent}% 100%)`
            }}>
                <div className="absolute inset-4 bg-white rounded-full flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-slate-900">{totalCount}</span>
                    <span className="text-xs text-slate-500 uppercase">Toplam İşlem</span>
                </div>
            </div>
            <div className="flex gap-8">
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                    <div>
                        <p className="text-xs text-slate-500 uppercase">Satış</p>
                        <p className="font-bold text-slate-900">{salesCount} Adet (%{Math.round(salePercent)})</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-orange-500"></span>
                    <div>
                        <p className="text-xs text-slate-500 uppercase">Kiralama</p>
                        <p className="font-bold text-slate-900">{rentCount} Adet (%{Math.round(rentPercent)})</p>
                    </div>
                </div>
            </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm print:break-inside-avoid">
                <h3 className="font-bold text-slate-800 mb-4">Ortalama Değerler</h3>
                <div className="space-y-4">
                    <div className="p-4 bg-slate-50 rounded-lg">
                        <p className="text-sm text-slate-600 mb-1">Ortalama İşlem Hacmi (Satış)</p>
                        <p className="text-xl font-bold text-slate-900">
                        {salesCount > 0 
                            ? formatCurrency(filteredTransactions.filter(t => t.type === TransactionType.SALE).reduce((a,b) => a + b.totalRevenue, 0) / salesCount)
                            : '0 ₺'}
                        </p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                        <p className="text-sm text-slate-600 mb-1">Ortalama İşlem Hacmi (Kiralama)</p>
                        <p className="text-xl font-bold text-slate-900">
                            {rentCount > 0 
                            ? formatCurrency(filteredTransactions.filter(t => t.type === TransactionType.RENT).reduce((a,b) => a + b.totalRevenue, 0) / rentCount)
                            : '0 ₺'}
                        </p>
                    </div>
                </div>
        </div>
    </div>
  );

  const currentUser = JSON.parse(localStorage.getItem('emlak_user') || '{}');
  if (currentUser.role !== UserRole.PARTNER) {
    return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center p-8">
            <div className="p-4 bg-red-100 text-red-600 rounded-full mb-4">
                <AlertTriangle size={48} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Yetkisiz Erişim</h2>
            <p className="text-slate-500">Bu sayfayı görüntülemek için "Ortak" yetkisine sahip olmalısınız.</p>
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="text-indigo-600" />
            Raporlar & Dashboard
          </h1>
          <p className="text-slate-500 text-sm">Finansal analizler ve performans raporları.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
             <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                <Calendar size={16} className="text-slate-400" />
                <select 
                    value={selectedMonth} 
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    className="bg-transparent outline-none text-sm font-medium text-slate-700"
                >
                    <option value={-1}>Tüm Yıl</option>
                    <option value={0}>Ocak</option>
                    <option value={1}>Şubat</option>
                    <option value={2}>Mart</option>
                    <option value={3}>Nisan</option>
                    <option value={4}>Mayıs</option>
                    <option value={5}>Haziran</option>
                    <option value={6}>Temmuz</option>
                    <option value={7}>Ağustos</option>
                    <option value={8}>Eylül</option>
                    <option value={9}>Ekim</option>
                    <option value={10}>Kasım</option>
                    <option value={11}>Aralık</option>
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

             <button 
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg font-medium transition-colors text-sm shadow-sm"
                onClick={() => window.print()}
             >
                <Printer size={16} />
                PDF / Yazdır
             </button>
        </div>
      </div>

      <div className="flex overflow-x-auto pb-2 gap-2 border-b border-slate-200 print:hidden">
        <button
            onClick={() => setActiveTab('SUMMARY')}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap rounded-t-lg border-b-2 transition-colors ${activeTab === 'SUMMARY' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
        >
            Finansal Özet
        </button>
        <button
            onClick={() => setActiveTab('PARTNERS')}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap rounded-t-lg border-b-2 transition-colors ${activeTab === 'PARTNERS' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
        >
            Ortak Durumu (Cari)
        </button>
        <button
            onClick={() => setActiveTab('CONSULTANTS')}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap rounded-t-lg border-b-2 transition-colors ${activeTab === 'CONSULTANTS' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
        >
            Danışman Performansı
        </button>
        <button
            onClick={() => setActiveTab('PORTFOLIO')}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap rounded-t-lg border-b-2 transition-colors ${activeTab === 'PORTFOLIO' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
        >
            Portföy Analizi
        </button>
      </div>

      <div className="print:hidden">
          {activeTab === 'SUMMARY' && renderSummary()}
          {activeTab === 'PARTNERS' && renderPartners()}
          {activeTab === 'CONSULTANTS' && renderConsultants()}
          {activeTab === 'PORTFOLIO' && renderPortfolio()}
      </div>

      <div className="hidden print:block space-y-8">
        <div className="border-b-2 border-slate-900 pb-4 mb-8">
             <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">{APP_NAME}</h1>
                    <p className="text-slate-500">Yönetim Raporları</p>
                </div>
                <div className="text-right">
                    <p className="font-medium text-slate-900">Dönem: {selectedYear} {selectedMonth !== -1 ? ` / ${selectedMonth + 1}. Ay` : ''}</p>
                    <p className="text-xs text-slate-500">Oluşturulma Tarihi: {new Date().toLocaleDateString('tr-TR')}</p>
                </div>
             </div>
        </div>
        {renderSummary()}
        <div className="break-before-page">{renderPartners()}</div>
        <div className="break-before-page">{renderConsultants()}</div>
        <div className="break-before-page">{renderPortfolio()}</div>
      </div>
    </div>
  );
};

export default Reports;