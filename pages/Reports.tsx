import React, { useState, useEffect, useMemo } from 'react';
import { Transaction, Expense, Consultant, UserRole, TransactionType, Payer } from '../types';
import { INITIAL_TRANSACTIONS, INITIAL_EXPENSES, INITIAL_CONSULTANTS, APP_NAME } from '../constants';
import { BarChart3, TrendingUp, TrendingDown, AlertTriangle, Wallet, Calendar, Printer, FileText } from 'lucide-react';

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

  // Load Data & Smart Year Selection
  useEffect(() => {
    // 1. Load Data
    const storedTrans = localStorage.getItem('emlak_transactions');
    const loadedTrans: Transaction[] = storedTrans ? JSON.parse(storedTrans) : INITIAL_TRANSACTIONS;
    setTransactions(loadedTrans);

    const storedExp = localStorage.getItem('emlak_expenses');
    const loadedExp: Expense[] = storedExp ? JSON.parse(storedExp) : INITIAL_EXPENSES;
    setExpenses(loadedExp);

    const storedCons = localStorage.getItem('emlak_consultants');
    setConsultants(storedCons ? JSON.parse(storedCons) : INITIAL_CONSULTANTS);

    // 2. Smart Year Selection Logic
    const years = new Set<number>();
    loadedTrans.forEach(t => years.add(new Date(t.date).getFullYear()));
    loadedExp.forEach(e => years.add(new Date(e.date).getFullYear()));
    
    const dataYears = Array.from(years).sort((a, b) => b - a); // Descending order
    const currentYear = new Date().getFullYear();

    if (dataYears.length > 0 && !years.has(currentYear)) {
        setSelectedYear(dataYears[0]);
    }
  }, []);

  // Compute Available Years for Dropdown (Dynamic)
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    transactions.forEach(t => years.add(new Date(t.date).getFullYear()));
    expenses.forEach(e => years.add(new Date(e.date).getFullYear()));
    years.add(new Date().getFullYear()); // Always include current year
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

  // --- CALCULATIONS ---

  // 1. Summary
  const totalTurnover = filteredTransactions.reduce((acc, t) => acc + t.totalRevenue, 0);
  const totalOfficeRevenue = filteredTransactions.reduce((acc, t) => acc + t.officeRevenue, 0);
  const totalExpenses = filteredExpenses.reduce((acc, e) => acc + e.amount, 0);
  const netProfit = totalOfficeRevenue - totalExpenses;

  // 2. Partners
  const calculatePartnerStats = (payerType: Payer) => {
    // Gelir Payı: Transaction.partnerShareX (Net Ofis Geliri / 2)
    const incomeShare = filteredTransactions.reduce((acc, t) => {
        return acc + (payerType === Payer.ALTAN ? t.partnerShareAltan : t.partnerShareSuat);
    }, 0);

    // Expenses paid personally by this partner (Company owes them back)
    const paidExpenses = filteredExpenses.filter(e => e.paidBy === payerType).reduce((acc, e) => acc + e.amount, 0);

    // Share of Expenses: (Total Expenses / 2)
    // Net Position: (Gross Share) - (Share of Exp) + (Paid Exp)
    
    const grossShare = incomeShare; 
    const shareOfExpenses = totalExpenses / 2;
    const netProfitShare = grossShare - shareOfExpenses;
    
    const totalBalance = netProfitShare + paidExpenses;

    return {
        grossShare,
        paidExpenses,
        shareOfExpenses,
        netProfitShare,
        totalBalance
    };
  };

  const altanStats = calculatePartnerStats(Payer.ALTAN);
  const suatStats = calculatePartnerStats(Payer.SUAT);

  // 3. Consultants Performance
  const consultantPerformance = consultants.map(c => {
    const consTrans = filteredTransactions.filter(t => t.consultantId === c.id);
    const totalRev = consTrans.reduce((acc, t) => acc + t.totalRevenue, 0);
    const totalComm = consTrans.reduce((acc, t) => acc + t.consultantShare, 0);
    const count = consTrans.length;
    return { ...c, totalRev, totalComm, count };
  }).sort((a, b) => b.totalRev - a.totalRev);
  
  const maxConsultantRevenue = Math.max(...consultantPerformance.map(c => c.totalRev), 0);

  // 4. Portfolio
  const salesCount = filteredTransactions.filter(t => t.type === TransactionType.SALE).length;
  const rentCount = filteredTransactions.filter(t => t.type === TransactionType.RENT).length;
  const totalCount = salesCount + rentCount;
  const salePercent = totalCount ? (salesCount / totalCount) * 100 : 0;
  const rentPercent = totalCount ? (rentCount / totalCount) * 100 : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
  };

  const handlePrint = () => {
    window.print();
  };

  // --- RENDER HELPERS (Reusable for Screen & Print) ---

  const renderSummary = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
        <h2 className="hidden print:block text-xl font-bold text-slate-900 border-b border-slate-300 pb-2 mb-4">1. Finansal Özet</h2>
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm print:border print:border-slate-300 print:shadow-none">
                <p className="text-sm font-medium text-slate-500">Toplam Ciro</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(totalTurnover)}</h3>
                <div className="mt-2 text-xs text-green-600 flex items-center gap-1">
                    <TrendingUp size={12} /> İşlem Hacmi
                </div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm print:border print:border-slate-300 print:shadow-none">
                <p className="text-sm font-medium text-slate-500">Ofis Geliri (Brüt)</p>
                <h3 className="text-2xl font-bold text-indigo-600 mt-1">{formatCurrency(totalOfficeRevenue)}</h3>
                <div className="mt-2 text-xs text-slate-400">
                    Danışman payları hariç
                </div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm print:border print:border-slate-300 print:shadow-none">
                <p className="text-sm font-medium text-slate-500">Toplam Gider</p>
                <h3 className="text-2xl font-bold text-rose-600 mt-1">{formatCurrency(totalExpenses)}</h3>
                <div className="mt-2 text-xs text-rose-600 flex items-center gap-1">
                    <TrendingDown size={12} /> Harcamalar
                </div>
            </div>
            <div className={`p-5 rounded-xl border shadow-sm print:border print:border-slate-300 print:shadow-none ${netProfit >= 0 ? 'bg-emerald-50 border-emerald-100 print:bg-white' : 'bg-red-50 border-red-100 print:bg-white'}`}>
                <p className={`text-sm font-medium ${netProfit >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>Net Kâr (Dönem)</p>
                <h3 className={`text-2xl font-bold mt-1 ${netProfit >= 0 ? 'text-emerald-900' : 'text-red-900'}`}>{formatCurrency(netProfit)}</h3>
                <div className={`mt-2 text-xs ${netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    Ofis Geliri - Giderler
                </div>
            </div>
        </div>

        {/* Simple Bar Chart Simulation */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm print:border print:border-slate-300 print:shadow-none print:break-inside-avoid">
            <h3 className="font-bold text-slate-800 mb-6">Gelir / Gider Dengesi</h3>
            <div className="space-y-4">
                {/* Revenue Bar */}
                <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                        <span className="font-medium text-slate-700">Ofis Geliri</span>
                        <span className="font-bold text-slate-900">{formatCurrency(totalOfficeRevenue)}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden print:border print:border-slate-200">
                        <div className="bg-indigo-500 h-full rounded-full print:bg-slate-800" style={{ width: '100%' }}></div>
                    </div>
                </div>
                {/* Expense Bar */}
                <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                        <span className="font-medium text-slate-700">Giderler</span>
                        <span className="font-bold text-slate-900">{formatCurrency(totalExpenses)}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden print:border print:border-slate-200">
                        <div 
                            className="bg-rose-500 h-full rounded-full print:bg-slate-600" 
                            style={{ width: `${Math.min((totalExpenses / (totalOfficeRevenue || 1)) * 100, 100)}%` }}
                        ></div>
                    </div>
                </div>
                {/* Profit Bar */}
                <div className="space-y-1 pt-2">
                        <div className="flex justify-between text-sm">
                        <span className="font-medium text-slate-700">Net Kâr Marjı</span>
                        <span className="font-bold text-emerald-600">%{totalOfficeRevenue > 0 ? Math.round((netProfit / totalOfficeRevenue) * 100) : 0}</span>
                    </div>
                        <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden print:border print:border-slate-200">
                        <div 
                            className="bg-emerald-500 h-full rounded-full print:bg-slate-400" 
                            style={{ width: `${Math.max(0, Math.min((netProfit / (totalOfficeRevenue || 1)) * 100, 100))}%` }}
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
        {/* Altan Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden print:border print:border-slate-300 print:shadow-none print:break-inside-avoid">
            <div className="bg-indigo-50 p-4 border-b border-indigo-100 flex items-center gap-3 print:bg-slate-100 print:border-slate-200">
                <div className="w-10 h-10 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-700 font-bold print:bg-slate-300 print:text-black">A</div>
                <div>
                    <h3 className="font-bold text-indigo-900 print:text-black">Altan (Ortak)</h3>
                    <p className="text-xs text-indigo-600 print:text-slate-600">Hesap Özeti</p>
                </div>
            </div>
            <div className="p-6 space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-slate-50 print:border-slate-200">
                    <span className="text-slate-600 text-sm">Brüt Gelir Payı (Ofis Geliri / 2)</span>
                    <span className="font-medium text-slate-900">{formatCurrency(altanStats.grossShare)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-50 print:border-slate-200">
                    <span className="text-rose-600 text-sm">Ofis Gider Payı (-%50)</span>
                    <span className="font-medium text-rose-600">-{formatCurrency(altanStats.shareOfExpenses)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-50 print:border-slate-200">
                    <span className="text-emerald-600 text-sm font-medium">Net Kâr Payı</span>
                    <span className="font-bold text-emerald-600">{formatCurrency(altanStats.netProfitShare)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-50 bg-slate-50/50 px-2 rounded print:bg-transparent">
                    <span className="text-slate-700 text-sm flex items-center gap-1"><Wallet size={14}/> Cepten Ödediği Gider</span>
                    <span className="font-bold text-slate-900">+{formatCurrency(altanStats.paidExpenses)}</span>
                </div>
                
                <div className="mt-4 pt-4 border-t-2 border-slate-100 print:border-slate-200">
                    <p className="text-sm text-slate-500 text-center mb-1">Toplam Alacak Bakiye</p>
                    <p className="text-3xl font-bold text-center text-indigo-700 print:text-black">{formatCurrency(altanStats.totalBalance)}</p>
                    <p className="text-xs text-center text-slate-400 mt-1">Net Kâr Payı + Gider İadesi</p>
                </div>
            </div>
        </div>

        {/* Suat Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden print:border print:border-slate-300 print:shadow-none print:break-inside-avoid">
            <div className="bg-violet-50 p-4 border-b border-violet-100 flex items-center gap-3 print:bg-slate-100 print:border-slate-200">
                <div className="w-10 h-10 rounded-full bg-violet-200 flex items-center justify-center text-violet-700 font-bold print:bg-slate-300 print:text-black">S</div>
                <div>
                    <h3 className="font-bold text-violet-900 print:text-black">Suat (Ortak)</h3>
                    <p className="text-xs text-violet-600 print:text-slate-600">Hesap Özeti</p>
                </div>
            </div>
            <div className="p-6 space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-slate-50 print:border-slate-200">
                    <span className="text-slate-600 text-sm">Brüt Gelir Payı (Ofis Geliri / 2)</span>
                    <span className="font-medium text-slate-900">{formatCurrency(suatStats.grossShare)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-50 print:border-slate-200">
                    <span className="text-rose-600 text-sm">Ofis Gider Payı (-%50)</span>
                    <span className="font-medium text-rose-600">-{formatCurrency(suatStats.shareOfExpenses)}</span>
                </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-50 print:border-slate-200">
                    <span className="text-emerald-600 text-sm font-medium">Net Kâr Payı</span>
                    <span className="font-bold text-emerald-600">{formatCurrency(suatStats.netProfitShare)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-50 bg-slate-50/50 px-2 rounded print:bg-transparent">
                    <span className="text-slate-700 text-sm flex items-center gap-1"><Wallet size={14}/> Cepten Ödediği Gider</span>
                    <span className="font-bold text-slate-900">+{formatCurrency(suatStats.paidExpenses)}</span>
                </div>
                
                <div className="mt-4 pt-4 border-t-2 border-slate-100 print:border-slate-200">
                    <p className="text-sm text-slate-500 text-center mb-1">Toplam Alacak Bakiye</p>
                    <p className="text-3xl font-bold text-center text-violet-700 print:text-black">{formatCurrency(suatStats.totalBalance)}</p>
                        <p className="text-xs text-center text-slate-400 mt-1">Net Kâr Payı + Gider İadesi</p>
                </div>
            </div>
        </div>
        
        <div className="col-span-1 md:col-span-2 bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800 flex items-start gap-3 print:bg-white print:border-slate-300 print:text-slate-600">
            <AlertTriangle className="shrink-0 mt-0.5" size={18} />
            <p>
                <strong>Not:</strong> Bu hesaplamalar, seçilen dönemdeki ({selectedYear} {selectedMonth !== -1 ? `${selectedMonth + 1}. Ay` : 'Tümü'}) işlem ve gider kayıtlarına dayanır. 
                Ortakların kasadan para çekmesi (avans/kâr dağıtımı) henüz sisteme işlenmediği için bu rakamlar "içeride biriken" tutarı gösterir.
            </p>
        </div>
    </div>
  );

  const renderConsultants = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
         <h2 className="hidden print:block text-xl font-bold text-slate-900 border-b border-slate-300 pb-2 mb-4">3. Danışman Performansı</h2>
         
         {/* Bar Chart */}
         <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm print:border print:border-slate-300 print:shadow-none print:break-inside-avoid">
            <h3 className="font-bold text-slate-800 mb-6">Danışman Ciro Sıralaması</h3>
            <div className="space-y-4">
                {consultantPerformance.map((c) => (
                    <div key={c.id} className="space-y-1">
                        <div className="flex justify-between text-sm">
                            <span className="font-medium text-slate-700">{c.fullName}</span>
                            <span className="font-bold text-slate-900">{formatCurrency(c.totalRev)}</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden print:border print:border-slate-200">
                            <div 
                                className="bg-indigo-500 h-full rounded-full transition-all duration-500 print:bg-slate-700" 
                                style={{ width: `${maxConsultantRevenue > 0 ? (c.totalRev / maxConsultantRevenue) * 100 : 0}%` }}
                            ></div>
                        </div>
                    </div>
                ))}
                {consultantPerformance.length === 0 && (
                    <p className="text-sm text-slate-500 text-center py-4">Veri bulunamadı.</p>
                )}
            </div>
         </div>

         {/* Table */}
         <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden print:border print:border-slate-300 print:shadow-none">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200 print:bg-slate-100">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-slate-700">Sıra</th>
                            <th className="px-6 py-4 font-semibold text-slate-700">Danışman</th>
                            <th className="px-6 py-4 font-semibold text-slate-700 text-center">İşlem</th>
                            <th className="px-6 py-4 font-semibold text-slate-700 text-right">Ciro</th>
                            <th className="px-6 py-4 font-semibold text-slate-700 text-right">Hakediş</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 print:divide-slate-200">
                        {consultantPerformance.map((c, index) => (
                            <tr key={c.id} className="hover:bg-slate-50/50">
                                <td className="px-6 py-4 text-slate-500 font-mono">#{index + 1}</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 print:border print:border-slate-300">
                                            {c.fullName.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-medium text-slate-900">{c.fullName}</div>
                                            <div className="text-xs text-slate-500">Oran: %{c.commissionRate}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className="inline-flex items-center justify-center w-6 h-6 bg-slate-100 rounded-full text-xs font-bold text-slate-700 print:border print:border-slate-300">
                                        {c.count}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right font-bold text-slate-900">
                                    {formatCurrency(c.totalRev)}
                                </td>
                                <td className="px-6 py-4 text-right text-indigo-600 font-medium print:text-black">
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
        {/* Pie Chart Simulation */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center print:border print:border-slate-300 print:shadow-none print:break-inside-avoid">
            <h3 className="font-bold text-slate-800 mb-6 w-full text-left">İşlem Dağılımı (Satış vs Kiralama)</h3>
            
            <div className="relative w-48 h-48 rounded-full mb-6 print:hidden" style={{
                background: `conic-gradient(#3b82f6 0% ${salePercent}%, #f97316 ${salePercent}% 100%)`
            }}>
                <div className="absolute inset-4 bg-white rounded-full flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-slate-900">{totalCount}</span>
                    <span className="text-xs text-slate-500 uppercase">Toplam İşlem</span>
                </div>
            </div>

            {/* Print Fallback for Gradient Circle */}
            <div className="hidden print:flex flex-col items-center justify-center mb-6 p-4 border border-slate-200 rounded-full w-32 h-32">
                <span className="text-2xl font-bold text-black">{totalCount}</span>
                <span className="text-xs text-slate-500">Toplam</span>
            </div>

            <div className="flex gap-8">
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-500 print:bg-slate-700"></span>
                    <div>
                        <p className="text-xs text-slate-500 uppercase">Satış</p>
                        <p className="font-bold text-slate-900">{salesCount} Adet (%{Math.round(salePercent)})</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-orange-500 print:bg-slate-400"></span>
                    <div>
                        <p className="text-xs text-slate-500 uppercase">Kiralama</p>
                        <p className="font-bold text-slate-900">{rentCount} Adet (%{Math.round(rentPercent)})</p>
                    </div>
                </div>
            </div>
        </div>
        
        {/* Insights Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm print:border print:border-slate-300 print:shadow-none print:break-inside-avoid">
                <h3 className="font-bold text-slate-800 mb-4">Ortalama Değerler</h3>
                <div className="space-y-4">
                    <div className="p-4 bg-slate-50 rounded-lg print:bg-white print:border print:border-slate-200">
                        <p className="text-sm text-slate-600 mb-1">Ortalama İşlem Hacmi (Satış)</p>
                        <p className="text-xl font-bold text-slate-900">
                        {salesCount > 0 
                            ? formatCurrency(filteredTransactions.filter(t => t.type === TransactionType.SALE).reduce((a,b) => a + b.totalRevenue, 0) / salesCount)
                            : '0 ₺'}
                        </p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg print:bg-white print:border print:border-slate-200">
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

  // Check Role
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
      {/* --- SCREEN ONLY HEADER --- */}
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
                onClick={handlePrint}
             >
                <Printer size={16} />
                PDF / Yazdır
             </button>
        </div>
      </div>

      {/* --- SCREEN ONLY TABS --- */}
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

      {/* --- SCREEN ONLY CONTENT --- */}
      <div className="print:hidden">
          {activeTab === 'SUMMARY' && renderSummary()}
          {activeTab === 'PARTNERS' && renderPartners()}
          {activeTab === 'CONSULTANTS' && renderConsultants()}
          {activeTab === 'PORTFOLIO' && renderPortfolio()}
      </div>

      {/* --- PRINT ONLY CONTENT (ALL REPORTS) --- */}
      <div className="hidden print:block space-y-8">
        {/* Print Header */}
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

        {/* Section 1 */}
        {renderSummary()}
        
        {/* Section 2 - Page Break */}
        <div className="break-before-page">
            {renderPartners()}
        </div>

        {/* Section 3 - Page Break */}
        <div className="break-before-page">
            {renderConsultants()}
        </div>

        {/* Section 4 - Page Break */}
        <div className="break-before-page">
            {renderPortfolio()}
        </div>
        
        {/* Print Footer */}
        <div className="fixed bottom-0 left-0 w-full text-center text-xs text-slate-400 border-t border-slate-200 py-2">
            Bu belge {APP_NAME} tarafından otomatik oluşturulmuştur.
        </div>
      </div>
    </div>
  );
};

export default Reports;