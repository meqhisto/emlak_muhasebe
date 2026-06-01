import React, { useState, useEffect, useMemo } from 'react';
import { Transaction, Expense, Consultant, UserRole, TransactionType, Payer, ExpenseCategory } from '../types';
import { INITIAL_TRANSACTIONS, INITIAL_EXPENSES, INITIAL_CONSULTANTS, APP_NAME } from '../constants';
import { BarChart3, TrendingUp, TrendingDown, AlertTriangle, Wallet, Calendar, Printer, FileText, Activity, Scale, Landmark, TableProperties, Users, BookOpen, CheckCircle2 } from 'lucide-react';

import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';

const Reports: React.FC = () => {
    // Data State - now from Context
    const { transactions, expenses, consultants, payments, cashTransfers, addCashTransfer, deleteCashTransfer } = useData();
    const { currentUser } = useAuth();

    // Filter State
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState<number>(-1); // -1: All Months

    // Tab State
    const [activeTab, setActiveTab] = useState<'SUMMARY' | 'PARTNERS' | 'CONSULTANTS' | 'PORTFOLIO' | 'LEDGER'>('SUMMARY');

    // Transfer modal state
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [transferForm, setTransferForm] = useState({
        fromParty: 'OFIS_KASASI',
        toParty: 'ALTAN',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
    });

    // Load Data logic removed - Context handles it

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
    const filteredSalaryPayments = payments.filter(p => filterByDate(p.date));
    const totalSalaryExpenses = filteredSalaryPayments.reduce((acc, p) => acc + p.amount, 0);

    // --- MONTHLY DATA FOR CHART ---
    const monthlyChartData = useMemo(() => {
        const months = ['Ocak', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];

        // ⚡ Bolt: Optimize monthly chart data calculation.
        // Replaced O(12 * n) mapping with a single pass O(n) calculation.
        // This dramatically reduces CPU cycles, especially when transactions/expenses grow large.
        const chartData = months.map(name => ({ name, revenue: 0, expense: 0 }));

        transactions.forEach(t => {
            const d = new Date(t.date);
            if (d.getFullYear() === selectedYear) {
                chartData[d.getMonth()].revenue += t.officeRevenue;
            }
        });

        expenses.forEach(e => {
            const d = new Date(e.date);
            if (d.getFullYear() === selectedYear) {
                chartData[d.getMonth()].expense += e.amount;
            }
        });

        return chartData;
    }, [transactions, expenses, selectedYear]);

    // --- CALCULATIONS ---
    // Otomatik takip edilen kayıtları operasyonel giderlerden çıkar:
    // - Hakediş: işlem ODENDI olunca otomatik gider olarak işlenir (çift sayım önleme)
    // - Maaş: SalaryPayment tablosunda ayrıca toplanır (eski "Maaş Ödemesi" expense kayıtları için)
    const isAutoTrackedExpense = (e: Expense) => {
        const desc = e.description.toLowerCase();
        return e.category === ExpenseCategory.COMMISSION ||
            (e.category === ExpenseCategory.PERSONNEL && (desc.includes('hakediş') || desc.includes('maaş')));
    };
    // Cari ödemeler (paidToPartner) operasyonel gider DEĞİLDİR — kâr payı dağıtımı / mutabakattır
    const operationalExpenses = filteredExpenses.filter(e => !isAutoTrackedExpense(e) && !e.paidToPartner);

    const totalTurnover = filteredTransactions.reduce((acc, t) => acc + t.totalRevenue, 0);
    const totalOfficeRevenue = filteredTransactions.reduce((acc, t) => acc + t.officeRevenue, 0);
    // Maaş ödemeleri (SalaryPayment) de gider olarak dahil edilmeli
    const totalExpenses = operationalExpenses.reduce((acc, e) => acc + e.amount, 0) + totalSalaryExpenses;
    const netProfit = totalOfficeRevenue - totalExpenses;

    const calculatePartnerStats = (payerType: Payer) => {
        const incomeShare = filteredTransactions.reduce((acc, t) => {
            return acc + (payerType === Payer.ALTAN ? t.partnerShareAltan : t.partnerShareSuat);
        }, 0);
        // BUG FIX: operationalExpenses kullanarak hakediş giderlerini hariç tut
        const paidExpenses = operationalExpenses.filter(e => e.paidBy === payerType).reduce((acc, e) => acc + e.amount, 0);
        const shareOfExpenses = totalExpenses / 2;
        const netProfitShare = incomeShare - shareOfExpenses;
        return { grossShare: incomeShare, paidExpenses, shareOfExpenses, netProfitShare, totalBalance: netProfitShare + paidExpenses };
    };

    const altanStats = calculatePartnerStats(Payer.ALTAN);
    const suatStats = calculatePartnerStats(Payer.SUAT);

    // --- ORTAKLAR ARASI MUTABAKAT ---
    const expenseDiff = altanStats.paidExpenses - suatStats.paidExpenses;
    const settlementAmount = Math.abs(expenseDiff) / 2;
    const settlementCreditor = expenseDiff > 0 ? 'Altan' : 'Suat';
    const settlementDebtor = expenseDiff > 0 ? 'Suat' : 'Altan';

    // --- OFİS KASASI BAKİYESİ ---
    const officePaidExpenses = operationalExpenses.filter(e => e.paidBy === Payer.OFFICE).reduce((acc, e) => acc + e.amount, 0);
    // Kasadan çıkan: ofis giderleri + maaş ödemeleri
    const cashOutFromOffice = officePaidExpenses + totalSalaryExpenses;
    // Kasada kalan nakit (dağıtılmayı bekleyen ortak payları bu tutara eşittir)
    const cashInBox = totalOfficeRevenue - cashOutFromOffice;

    // --- NAKİT TRANSFER HESAPLAMALARI ---
    const filteredTransfers = cashTransfers.filter(t => filterByDate(t.date));

    // CashTransfer tablosundan (geriye uyumlu)
    const officePaidToAltanViaTransfer = filteredTransfers
        .filter(t => t.fromParty === Payer.OFFICE && t.toParty === Payer.ALTAN)
        .reduce((acc, t) => acc + t.amount, 0);
    const officePaidToSuatViaTransfer = filteredTransfers
        .filter(t => t.fromParty === Payer.OFFICE && t.toParty === Payer.SUAT)
        .reduce((acc, t) => acc + t.amount, 0);
    const altanPaidToSuatViaTransfer = filteredTransfers
        .filter(t => t.fromParty === Payer.ALTAN && t.toParty === Payer.SUAT)
        .reduce((acc, t) => acc + t.amount, 0);
    const suatPaidToAltanViaTransfer = filteredTransfers
        .filter(t => t.fromParty === Payer.SUAT && t.toParty === Payer.ALTAN)
        .reduce((acc, t) => acc + t.amount, 0);

    // Ofis kasasından ortaklara yapılan cari ödemeler (Expense tablosundan).
    // NOT: Bu kayıtlar operationalExpenses'e DAHİL DEĞİL — kasadan çıkışları yalnızca burada sayılır.
    const officeExpensesToAltan = filteredExpenses
        .filter(e => e.paidBy === Payer.OFFICE && e.paidToPartner === Payer.ALTAN)
        .reduce((acc, e) => acc + e.amount, 0);
    const officeExpensesToSuat = filteredExpenses
        .filter(e => e.paidBy === Payer.OFFICE && e.paidToPartner === Payer.SUAT)
        .reduce((acc, e) => acc + e.amount, 0);

    // Toplam her ortağa ofisten ödenen (Expense cari + CashTransfer)
    const officePaidToAltan = officePaidToAltanViaTransfer + officeExpensesToAltan;
    const officePaidToSuat = officePaidToSuatViaTransfer + officeExpensesToSuat;

    // Ödemeler sonrası güncel bakiyeler — cari ödeme kasadan ve ortak bakiyesinden TEK kez düşer
    const netCashInBox = cashInBox - officePaidToAltan - officePaidToSuat;
    const altanRemainingBalance = altanStats.totalBalance - officePaidToAltan;
    const suatRemainingBalance = suatStats.totalBalance - officePaidToSuat;

    // Mutabakat: cepten ödenen giderleri + ortak arası ödemeleri netleştir
    const altanPaidToSuat = altanPaidToSuatViaTransfer
        + filteredExpenses.filter(e => e.paidBy === Payer.ALTAN && e.paidToPartner === Payer.SUAT).reduce((acc, e) => acc + e.amount, 0);
    const suatPaidToAltan = suatPaidToAltanViaTransfer
        + filteredExpenses.filter(e => e.paidBy === Payer.SUAT && e.paidToPartner === Payer.ALTAN).reduce((acc, e) => acc + e.amount, 0);

    const altanNetExpensePaid = altanStats.paidExpenses + suatPaidToAltan - altanPaidToSuat;
    const suatNetExpensePaid = suatStats.paidExpenses + altanPaidToSuat - suatPaidToAltan;
    const netExpenseDiffAdjusted = altanNetExpensePaid - suatNetExpensePaid;
    const settlementAmountAdjusted = Math.abs(netExpenseDiffAdjusted) / 2;
    const settlementCreditorAdjusted = netExpenseDiffAdjusted > 0 ? 'Altan' : 'Suat';
    const settlementDebtorAdjusted = netExpenseDiffAdjusted > 0 ? 'Suat' : 'Altan';

    // --- GİDER DETAY TABLOSU ---
    const expenseCategoryLabels: Record<string, string> = {
        [ExpenseCategory.OFFICE_SUPPLIES]: 'Ofis Malzemeleri',
        [ExpenseCategory.RENT]: 'Kira',
        [ExpenseCategory.MARKETING]: 'Pazarlama',
        [ExpenseCategory.PERSONNEL]: 'Personel / Maaş',
        [ExpenseCategory.UTILITIES]: 'Faturalar',
        [ExpenseCategory.FOOD]: 'Yemek',
        [ExpenseCategory.OTHER]: 'Diğer',
    };

    const expenseBreakdown = useMemo(() => {
        const categories = Object.values(ExpenseCategory).filter(c => c !== ExpenseCategory.COMMISSION);
        return categories.map(cat => {
            const catExpenses = operationalExpenses.filter(e => e.category === cat);
            const altanAmount = catExpenses.filter(e => e.paidBy === Payer.ALTAN).reduce((a, e) => a + e.amount, 0);
            const suatAmount = catExpenses.filter(e => e.paidBy === Payer.SUAT).reduce((a, e) => a + e.amount, 0);
            const officeAmount = catExpenses.filter(e => e.paidBy === Payer.OFFICE).reduce((a, e) => a + e.amount, 0);
            const total = altanAmount + suatAmount + officeAmount;
            return { category: cat, label: expenseCategoryLabels[cat] || cat, altanAmount, suatAmount, officeAmount, total };
        }).filter(row => row.total > 0);
    }, [operationalExpenses]);

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

    // ─── Feature 4: Sanal Muhasebe Defteri (Virtual Double-Entry Ledger) ───────
    // Hesap kodları:
    // 1000 Kasa | 2000 Altan Cari | 2001 Suat Cari | 3000 Danışman Borç
    // 4000 Gelir | 5000 Giderler | 5001 Maaşlar
    const ledgerEntries = useMemo(() => {
        const entries: { date: string; desc: string; account: string; dr: number; cr: number; sourceType: string }[] = [];

        const add = (date: string, desc: string, account: string, dr: number, cr: number, src: string) =>
            entries.push({ date, desc, account, dr, cr, sourceType: src });

        // İşlemler (seçili döneme göre filtreli)
        filteredTransactions.forEach(t => {
            const d = t.date.toString().split('T')[0];
            add(d, `${t.propertyName} — ${t.customerName}`, '1000 Kasa', t.totalRevenue, 0, 'İşlem');
            add(d, `${t.propertyName} — ${t.customerName}`, '2000 Altan Cari', 0, t.partnerShareAltan, 'İşlem');
            add(d, `${t.propertyName} — ${t.customerName}`, '2001 Suat Cari', 0, t.partnerShareSuat, 'İşlem');
            add(d, `${t.propertyName} — ${t.customerName}`, '3000 Danışman Borç', 0, t.consultantShare, 'İşlem');
            // Hakediş ödenince
            if (t.paymentStatus === 'ODENDI') {
                add(d, `Hakediş: ${t.propertyName}`, '3000 Danışman Borç', t.consultantShare, 0, 'Hakediş');
                add(d, `Hakediş: ${t.propertyName}`, '1000 Kasa', 0, t.consultantShare, 'Hakediş');
            }
        });

        // Giderler (hakediş ve eski maaş kayıtları ayrı bloklarda işlendiği için atlanır)
        filteredExpenses.forEach(e => {
            if (isAutoTrackedExpense(e)) return;
            const d = e.date.toString().split('T')[0];
            const acct5000 = '5000 Giderler';
            if (e.paidToPartner) {
                // Ortağa doğrudan ödeme
                const partnerAcct = e.paidToPartner === Payer.ALTAN ? '2000 Altan Cari' : '2001 Suat Cari';
                if (e.paidBy === Payer.OFFICE) {
                    add(d, e.description, partnerAcct, e.amount, 0, 'Gider/Cari');
                    add(d, e.description, '1000 Kasa', 0, e.amount, 'Gider/Cari');
                } else {
                    // Ortak → diğer ortak mutabakat
                    const fromAcct = e.paidBy === Payer.ALTAN ? '2000 Altan Cari' : '2001 Suat Cari';
                    add(d, e.description, partnerAcct, e.amount, 0, 'Gider/Mutabakat');
                    add(d, e.description, fromAcct, 0, e.amount, 'Gider/Mutabakat');
                }
            } else if (e.paidBy === Payer.OFFICE) {
                add(d, e.description, acct5000, e.amount, 0, 'Gider');
                add(d, e.description, '1000 Kasa', 0, e.amount, 'Gider');
            } else {
                const partnerAcct = e.paidBy === Payer.ALTAN ? '2000 Altan Cari' : '2001 Suat Cari';
                add(d, e.description, acct5000, e.amount, 0, 'Gider');
                add(d, e.description, partnerAcct, 0, e.amount, 'Gider');
            }
        });

        // Maaş ödemeleri (seçili döneme göre filtreli)
        filteredSalaryPayments.forEach(p => {
            const d = p.date.toString().split('T')[0];
            const payerAcct = p.paidBy === Payer.ALTAN ? '2000 Altan Cari' : p.paidBy === Payer.SUAT ? '2001 Suat Cari' : '1000 Kasa';
            add(d, `Maaş — ${p.period}`, '5001 Maaşlar', p.amount, 0, 'Maaş');
            add(d, `Maaş — ${p.period}`, payerAcct, 0, p.amount, 'Maaş');
        });

        // CashTransfer (seçili döneme göre filtreli)
        filteredTransfers.forEach(t => {
            const d = t.date.toString().split('T')[0];
            const fromAcct = t.fromParty === Payer.ALTAN ? '2000 Altan Cari' : t.fromParty === Payer.SUAT ? '2001 Suat Cari' : '1000 Kasa';
            const toAcct   = t.toParty   === Payer.ALTAN ? '2000 Altan Cari' : t.toParty   === Payer.SUAT ? '2001 Suat Cari' : '1000 Kasa';
            add(d, t.description || 'Nakit Transfer', toAcct, t.amount, 0, 'Transfer');
            add(d, t.description || 'Nakit Transfer', fromAcct, 0, t.amount, 'Transfer');
        });

        return entries.sort((a, b) => a.date.localeCompare(b.date));
    }, [filteredTransactions, filteredExpenses, filteredSalaryPayments, filteredTransfers]);

    // Mizan (Trial Balance) — hesap bakiyeleri
    const trialBalance = useMemo(() => {
        const accounts: Record<string, { dr: number; cr: number }> = {};
        ledgerEntries.forEach(e => {
            if (!accounts[e.account]) accounts[e.account] = { dr: 0, cr: 0 };
            accounts[e.account].dr += e.dr;
            accounts[e.account].cr += e.cr;
        });
        return Object.entries(accounts)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([account, { dr, cr }]) => ({ account, dr, cr, balance: dr - cr }));
    }, [ledgerEntries]);

    const totalDR = trialBalance.reduce((s, r) => s + r.dr, 0);
    const totalCR = trialBalance.reduce((s, r) => s + r.cr, 0);
    const isBalanced = Math.abs(totalDR - totalCR) < 0.01;
    // ─────────────────────────────────────────────────────────────────────────

    const handleTransferSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (transferForm.fromParty === transferForm.toParty) {
            alert('Gönderen ve alıcı aynı olamaz.');
            return;
        }
        await addCashTransfer({
            fromParty: transferForm.fromParty as any,
            toParty: transferForm.toParty as any,
            amount: Number(transferForm.amount),
            date: transferForm.date,
            description: transferForm.description || undefined,
        });
        setIsTransferModalOpen(false);
        setTransferForm({ fromParty: 'OFIS_KASASI', toParty: 'ALTAN', amount: '', date: new Date().toISOString().split('T')[0], description: '' });
    };

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
                    Grafik her zaman seçilen yılın tüm 12 ayını göstermektedir.
                    {selectedMonth !== -1 && <span className="text-amber-500 font-medium"> Özet kartlar "{['Ocak','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'][selectedMonth]}" ayına göre filtreli; grafik değil.</span>}
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
        <div className="space-y-6 animate-in fade-in duration-300">
            <h2 className="hidden print:block text-xl font-bold text-slate-900 border-b border-slate-300 pb-2 mb-4">2. Ortak Durumu (Cari)</h2>

            {/* --- ORTAK KARTLARI --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:block print:space-y-6">
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
                            <span className="text-rose-600 text-sm">Ofis Gider Payı (%50)</span>
                            <span className="font-medium text-rose-600">-{formatCurrency(altanStats.shareOfExpenses)}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-slate-50">
                            <span className="text-emerald-600 text-sm font-medium">Net Kâr Payı</span>
                            <span className="font-bold text-emerald-600">{formatCurrency(altanStats.netProfitShare)}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-slate-50 bg-slate-50/50 px-2 rounded">
                            <span className="text-slate-700 text-sm flex items-center gap-1"><Wallet size={14} /> Cepten Ödediği Gider</span>
                            <span className="font-bold text-slate-900">+{formatCurrency(altanStats.paidExpenses)}</span>
                        </div>
                        <div className="mt-4 pt-4 border-t-2 border-slate-100 space-y-2">
                            {officePaidToAltan > 0 && (
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500">Kasadan Alınan</span>
                                    <span className="text-rose-500 font-medium">-{formatCurrency(officePaidToAltan)}</span>
                                </div>
                            )}
                            <p className="text-sm text-slate-500 text-center mb-1">Kalan Alacak Bakiye</p>
                            <p className={`text-3xl font-bold text-center ${altanRemainingBalance >= 0 ? 'text-indigo-700' : 'text-red-600'}`}>{formatCurrency(altanRemainingBalance)}</p>
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
                            <span className="text-rose-600 text-sm">Ofis Gider Payı (%50)</span>
                            <span className="font-medium text-rose-600">-{formatCurrency(suatStats.shareOfExpenses)}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-slate-50">
                            <span className="text-emerald-600 text-sm font-medium">Net Kâr Payı</span>
                            <span className="font-bold text-emerald-600">{formatCurrency(suatStats.netProfitShare)}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-slate-50 bg-slate-50/50 px-2 rounded">
                            <span className="text-slate-700 text-sm flex items-center gap-1"><Wallet size={14} /> Cepten Ödediği Gider</span>
                            <span className="font-bold text-slate-900">+{formatCurrency(suatStats.paidExpenses)}</span>
                        </div>
                        <div className="mt-4 pt-4 border-t-2 border-slate-100 space-y-2">
                            {officePaidToSuat > 0 && (
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500">Kasadan Alınan</span>
                                    <span className="text-rose-500 font-medium">-{formatCurrency(officePaidToSuat)}</span>
                                </div>
                            )}
                            <p className="text-sm text-slate-500 text-center mb-1">Kalan Alacak Bakiye</p>
                            <p className={`text-3xl font-bold text-center ${suatRemainingBalance >= 0 ? 'text-violet-700' : 'text-red-600'}`}>{formatCurrency(suatRemainingBalance)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- ORTAKLAR ARASI MUTABAKAT --- */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden print:break-inside-avoid">
                <div className="bg-amber-50 p-4 border-b border-amber-100 flex items-center gap-3">
                    <div className="p-2 bg-amber-200 rounded-lg">
                        <Scale size={20} className="text-amber-700" />
                    </div>
                    <div>
                        <h3 className="font-bold text-amber-900">Ortaklar Arası Mutabakat</h3>
                        <p className="text-xs text-amber-600">Cepten ödenen giderlerin dengelenmesi</p>
                    </div>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 text-center">
                            <p className="text-xs text-indigo-600 font-medium mb-1">Altan Cepten Ödediği</p>
                            <p className="text-lg font-bold text-indigo-700">{formatCurrency(altanStats.paidExpenses)}</p>
                        </div>
                        <div className="bg-violet-50 p-4 rounded-lg border border-violet-100 text-center">
                            <p className="text-xs text-violet-600 font-medium mb-1">Suat Cepten Ödediği</p>
                            <p className="text-lg font-bold text-violet-700">{formatCurrency(suatStats.paidExpenses)}</p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-center">
                            <p className="text-xs text-slate-500 font-medium mb-1">Fark</p>
                            <p className="text-lg font-bold text-slate-900">{formatCurrency(Math.abs(expenseDiff))}</p>
                        </div>
                    </div>
                    {netExpenseDiffAdjusted !== 0 ? (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
                            <p className="text-sm text-amber-800">
                                <span className="font-bold">{settlementCreditorAdjusted}</span>, gider paylaşımında net fazla ödeme yaptığı için{' '}
                                <span className="font-bold">{settlementDebtorAdjusted}</span>'dan{' '}
                                <span className="text-lg font-black text-amber-900">{formatCurrency(settlementAmountAdjusted)}</span>{' '}
                                alacaklıdır.
                            </p>
                            <p className="text-[10px] text-amber-600 mt-2 italic">Ortak arası transferler hesaba katılmıştır.</p>
                        </div>
                    ) : (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-center">
                            <p className="text-sm font-medium text-emerald-700">✓ Ortaklar arası gider dengesi eşit. Mutabakat gerekmez.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* --- OFİS KASASI BAKİYESİ --- */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden print:break-inside-avoid">
                <div className="bg-slate-800 p-4 border-b border-slate-700 flex items-center gap-3">
                    <div className="p-2 bg-slate-600 rounded-lg">
                        <Landmark size={20} className="text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white">Ofis Kasası Bakiyesi</h3>
                        <p className="text-xs text-slate-400">Kasadaki nakit akışı özeti</p>
                    </div>
                </div>
                <div className="p-6 space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-slate-50">
                        <span className="text-emerald-600 text-sm font-medium">Toplam Ofis Geliri</span>
                        <span className="font-bold text-emerald-600">+{formatCurrency(totalOfficeRevenue)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-50">
                        <span className="text-rose-600 text-sm">Kasadan Ödenen Giderler</span>
                        <span className="font-medium text-rose-600">-{formatCurrency(officePaidExpenses)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-50">
                        <span className="text-rose-600 text-sm">Maaş Ödemeleri</span>
                        <span className="font-medium text-rose-600">-{formatCurrency(totalSalaryExpenses)}</span>
                    </div>
                    {(officePaidToAltan + officePaidToSuat) > 0 && (
                        <div className="flex justify-between items-center py-2 border-b border-slate-50">
                            <span className="text-indigo-600 text-sm">Ortaklara Yapılan Ödemeler</span>
                            <span className="font-medium text-indigo-600">-{formatCurrency(officePaidToAltan + officePaidToSuat)}</span>
                        </div>
                    )}
                    <div className="mt-4 pt-4 border-t-2 border-slate-200">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-bold text-slate-700">Net Kasa Bakiyesi</span>
                            <span className={`text-2xl font-black ${netCashInBox >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                {formatCurrency(netCashInBox)}
                            </span>
                        </div>
                        {netCashInBox < 0 ? (
                            <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                                <AlertTriangle size={16} className="text-red-600 flex-shrink-0" />
                                <p className="text-xs text-red-700">Kasada yeterli fon bulunmamaktadır.</p>
                            </div>
                        ) : (
                            <p className="text-[10px] text-slate-400 mt-2 italic">
                                Kalan bakiye: Altan {formatCurrency(altanRemainingBalance)} / Suat {formatCurrency(suatRemainingBalance)} alacaklı.
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* --- NAKİT TRANSFER GEÇMİŞİ --- */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden print:break-inside-avoid print:hidden">
                <div className="bg-slate-50 p-4 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 rounded-lg">
                            <TrendingDown size={20} className="text-emerald-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800">Nakit Transferler</h3>
                            <p className="text-xs text-slate-500">Kasa→Ortak ve Ortak→Ortak ödemeler</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsTransferModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                    >
                        <FileText size={14} /> Yeni Transfer
                    </button>
                </div>
                {filteredTransfers.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-sm">Seçilen dönemde kayıtlı transfer yok.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-3 font-semibold text-slate-700">Tarih</th>
                                    <th className="px-6 py-3 font-semibold text-slate-700">Gönderen</th>
                                    <th className="px-6 py-3 font-semibold text-slate-700">Alıcı</th>
                                    <th className="px-6 py-3 font-semibold text-slate-700 text-right">Tutar</th>
                                    <th className="px-6 py-3 font-semibold text-slate-700">Açıklama</th>
                                    <th className="px-6 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredTransfers.map(t => {
                                    const partyLabel: Record<string, string> = { OFIS_KASASI: 'Ofis Kasası', ALTAN: 'Altan', SUAT: 'Suat' };
                                    return (
                                        <tr key={t.id} className="hover:bg-slate-50/50">
                                            <td className="px-6 py-3 text-slate-500 whitespace-nowrap">{new Date(t.date).toLocaleDateString('tr-TR')}</td>
                                            <td className="px-6 py-3 font-medium text-slate-700">{partyLabel[t.fromParty] ?? t.fromParty}</td>
                                            <td className="px-6 py-3 font-medium text-slate-700">{partyLabel[t.toParty] ?? t.toParty}</td>
                                            <td className="px-6 py-3 text-right font-bold text-slate-900">{formatCurrency(t.amount)}</td>
                                            <td className="px-6 py-3 text-slate-500 text-xs">{t.description || '—'}</td>
                                            <td className="px-6 py-3 text-right">
                                                <button
                                                    onClick={() => { if (window.confirm('Bu transfer kaydını silmek istediğinize emin misiniz?')) deleteCashTransfer(t.id); }}
                                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path><path d="M10 11v6"></path><path d="M14 11v6"></path><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path></svg>
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* --- GİDER DETAY TABLOSU --- */}
            {expenseBreakdown.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden print:break-inside-avoid">
                    <div className="bg-slate-50 p-4 border-b border-slate-200 flex items-center gap-3">
                        <div className="p-2 bg-slate-200 rounded-lg">
                            <TableProperties size={20} className="text-slate-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800">Gider Detay Tablosu</h3>
                            <p className="text-xs text-slate-500">Kategoriye ve ödeyene göre gider kırılımı</p>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-3 font-semibold text-slate-700">Kategori</th>
                                    <th className="px-6 py-3 font-semibold text-indigo-700 text-right">Altan</th>
                                    <th className="px-6 py-3 font-semibold text-violet-700 text-right">Suat</th>
                                    <th className="px-6 py-3 font-semibold text-slate-700 text-right">Ofis Kasası</th>
                                    <th className="px-6 py-3 font-semibold text-slate-900 text-right">Toplam</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {expenseBreakdown.map(row => (
                                    <tr key={row.category} className="hover:bg-slate-50/50">
                                        <td className="px-6 py-3 font-medium text-slate-700">{row.label}</td>
                                        <td className="px-6 py-3 text-right text-indigo-600">{row.altanAmount > 0 ? formatCurrency(row.altanAmount) : '-'}</td>
                                        <td className="px-6 py-3 text-right text-violet-600">{row.suatAmount > 0 ? formatCurrency(row.suatAmount) : '-'}</td>
                                        <td className="px-6 py-3 text-right text-slate-600">{row.officeAmount > 0 ? formatCurrency(row.officeAmount) : '-'}</td>
                                        <td className="px-6 py-3 text-right font-bold text-slate-900">{formatCurrency(row.total)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            {totalSalaryExpenses > 0 && (
                                <tbody className="border-t border-slate-200">
                                    <tr className="bg-amber-50/50">
                                        <td className="px-6 py-3 font-medium text-slate-700 flex items-center gap-2">
                                            <Users size={14} className="text-amber-600" /> Personel Maaşları
                                        </td>
                                        <td className="px-6 py-3 text-right text-slate-400">—</td>
                                        <td className="px-6 py-3 text-right text-slate-400">—</td>
                                        <td className="px-6 py-3 text-right text-amber-600">{formatCurrency(totalSalaryExpenses)}</td>
                                        <td className="px-6 py-3 text-right font-bold text-slate-900">{formatCurrency(totalSalaryExpenses)}</td>
                                    </tr>
                                </tbody>
                            )}
                            <tfoot className="bg-slate-100 border-t-2 border-slate-200">
                                <tr>
                                    <td className="px-6 py-3 font-bold text-slate-900">TOPLAM</td>
                                    <td className="px-6 py-3 text-right font-bold text-indigo-700">{formatCurrency(altanStats.paidExpenses)}</td>
                                    <td className="px-6 py-3 text-right font-bold text-violet-700">{formatCurrency(suatStats.paidExpenses)}</td>
                                    <td className="px-6 py-3 text-right font-bold text-slate-700">{formatCurrency(officePaidExpenses + totalSalaryExpenses)}</td>
                                    <td className="px-6 py-3 text-right font-black text-slate-900">{formatCurrency(totalExpenses)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            )}
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
                                ? formatCurrency(filteredTransactions.filter(t => t.type === TransactionType.SALE).reduce((a, b) => a + b.totalRevenue, 0) / salesCount)
                                : '0 ₺'}
                        </p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                        <p className="text-sm text-slate-600 mb-1">Ortalama İşlem Hacmi (Kiralama)</p>
                        <p className="text-xl font-bold text-slate-900">
                            {rentCount > 0
                                ? formatCurrency(filteredTransactions.filter(t => t.type === TransactionType.RENT).reduce((a, b) => a + b.totalRevenue, 0) / rentCount)
                                : '0 ₺'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderLedger = () => (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Mizan */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <BookOpen size={20} className="text-indigo-600" />
                        <h3 className="font-bold text-slate-800">Mizan (Trial Balance)</h3>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${isBalanced ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {isBalanced ? <><CheckCircle2 size={14} /> Dengede</> : <><AlertTriangle size={14} /> Fark Var</>}
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-3 text-left font-semibold text-slate-700">Hesap</th>
                                <th className="px-6 py-3 text-right font-semibold text-indigo-700">Borç (DR)</th>
                                <th className="px-6 py-3 text-right font-semibold text-rose-600">Alacak (CR)</th>
                                <th className="px-6 py-3 text-right font-semibold text-slate-700">Bakiye</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {trialBalance.map(row => (
                                <tr key={row.account} className="hover:bg-slate-50/50">
                                    <td className="px-6 py-3 font-medium text-slate-800">{row.account}</td>
                                    <td className="px-6 py-3 text-right text-indigo-600">{row.dr > 0 ? formatCurrency(row.dr) : '—'}</td>
                                    <td className="px-6 py-3 text-right text-rose-600">{row.cr > 0 ? formatCurrency(row.cr) : '—'}</td>
                                    <td className={`px-6 py-3 text-right font-bold ${row.balance >= 0 ? 'text-slate-900' : 'text-red-600'}`}>
                                        {formatCurrency(Math.abs(row.balance))} {row.balance < 0 ? '(CR)' : '(DR)'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-slate-100 border-t-2 border-slate-200">
                            <tr>
                                <td className="px-6 py-3 font-black text-slate-900">TOPLAM</td>
                                <td className="px-6 py-3 text-right font-black text-indigo-700">{formatCurrency(totalDR)}</td>
                                <td className="px-6 py-3 text-right font-black text-rose-600">{formatCurrency(totalCR)}</td>
                                <td className={`px-6 py-3 text-right font-black ${isBalanced ? 'text-emerald-600' : 'text-red-600'}`}>
                                    {isBalanced ? '✓ 0' : formatCurrency(Math.abs(totalDR - totalCR))}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            {/* Yevmiye (Journal) */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                    <FileText size={20} className="text-slate-600" />
                    <h3 className="font-bold text-slate-800">Yevmiye Defteri</h3>
                    <span className="ml-auto text-xs text-slate-400">{ledgerEntries.length} kayıt</span>
                </div>
                <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                    <table className="w-full text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                            <tr>
                                <th className="px-4 py-2 text-left font-semibold text-slate-700">Tarih</th>
                                <th className="px-4 py-2 text-left font-semibold text-slate-700">Kaynak</th>
                                <th className="px-4 py-2 text-left font-semibold text-slate-700">Açıklama</th>
                                <th className="px-4 py-2 text-left font-semibold text-slate-700">Hesap</th>
                                <th className="px-4 py-2 text-right font-semibold text-indigo-600">Borç</th>
                                <th className="px-4 py-2 text-right font-semibold text-rose-600">Alacak</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {ledgerEntries.map((e, i) => (
                                <tr key={i} className="hover:bg-slate-50/50">
                                    <td className="px-4 py-2 text-slate-400 whitespace-nowrap">{e.date}</td>
                                    <td className="px-4 py-2"><span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[9px] font-bold uppercase">{e.sourceType}</span></td>
                                    <td className="px-4 py-2 text-slate-600 max-w-[200px] truncate">{e.desc}</td>
                                    <td className="px-4 py-2 font-medium text-slate-700">{e.account}</td>
                                    <td className="px-4 py-2 text-right text-indigo-600">{e.dr > 0 ? formatCurrency(e.dr) : ''}</td>
                                    <td className="px-4 py-2 text-right text-rose-600">{e.cr > 0 ? formatCurrency(e.cr) : ''}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    if (!currentUser || (currentUser.role !== UserRole.PARTNER && currentUser.role !== UserRole.ADMIN)) {
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
        <>
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
                <button
                    onClick={() => setActiveTab('LEDGER')}
                    className={`px-4 py-2 text-sm font-medium whitespace-nowrap rounded-t-lg border-b-2 transition-colors flex items-center gap-1 ${activeTab === 'LEDGER' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                >
                    <BookOpen size={14} /> Muhasebe Defteri
                </button>
            </div>

            <div className="print:hidden">
                {activeTab === 'SUMMARY' && renderSummary()}
                {activeTab === 'PARTNERS' && renderPartners()}
                {activeTab === 'CONSULTANTS' && renderConsultants()}
                {activeTab === 'PORTFOLIO' && renderPortfolio()}
                {activeTab === 'LEDGER' && renderLedger()}
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

        {/* --- NAKİT TRANSFER MODALI --- */}
        {isTransferModalOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                    <div className="flex items-center justify-between p-6 border-b border-slate-200">
                        <h2 className="text-lg font-bold text-slate-900">Yeni Nakit Transfer</h2>
                        <button onClick={() => setIsTransferModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-700 rounded-lg">✕</button>
                    </div>
                    <form onSubmit={handleTransferSubmit} className="p-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-700">Gönderen</label>
                                <select
                                    value={transferForm.fromParty}
                                    onChange={e => setTransferForm({ ...transferForm, fromParty: e.target.value })}
                                    className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="OFIS_KASASI">Ofis Kasası</option>
                                    <option value="ALTAN">Altan</option>
                                    <option value="SUAT">Suat</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-700">Alıcı</label>
                                <select
                                    value={transferForm.toParty}
                                    onChange={e => setTransferForm({ ...transferForm, toParty: e.target.value })}
                                    className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="ALTAN">Altan</option>
                                    <option value="SUAT">Suat</option>
                                    <option value="OFIS_KASASI">Ofis Kasası</option>
                                </select>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-700">Tutar (TL)</label>
                            <input
                                required type="number" min="1" step="0.01"
                                value={transferForm.amount}
                                onChange={e => setTransferForm({ ...transferForm, amount: e.target.value })}
                                className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-lg font-bold"
                                placeholder="0.00"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-700">Tarih</label>
                            <input
                                required type="date"
                                value={transferForm.date}
                                onChange={e => setTransferForm({ ...transferForm, date: e.target.value })}
                                className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg outline-none"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-700">Açıklama (opsiyonel)</label>
                            <input
                                type="text"
                                value={transferForm.description}
                                onChange={e => setTransferForm({ ...transferForm, description: e.target.value })}
                                placeholder="Örn: Mayıs kâr payı, gider iadesi..."
                                className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div className="pt-2 flex gap-3">
                            <button type="button" onClick={() => setIsTransferModalOpen(false)} className="flex-1 py-2.5 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors">İptal</button>
                            <button type="submit" className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition-colors">Kaydet</button>
                        </div>
                    </form>
                </div>
            </div>
        )}
        </>
    );
};

export default Reports;
