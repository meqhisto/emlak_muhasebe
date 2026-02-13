import React, { useState, useEffect } from 'react';
import { Expense, ExpenseCategory, Payer } from '../types';
import { INITIAL_EXPENSES } from '../constants';
import Modal from '../components/Modal';
import { Plus, Search, Filter, Receipt, Calendar, CreditCard, Tag, UserCircle, Wallet, Building2, X, RefreshCw, FileText, PieChart, StickyNote } from 'lucide-react';

const Expenses: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  
  // UI States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterPayer, setFilterPayer] = useState<string>('ALL');
  const [filterDateStart, setFilterDateStart] = useState('');
  const [filterDateEnd, setFilterDateEnd] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    description: '',
    category: ExpenseCategory.OTHER,
    amount: '',
    date: new Date().toISOString().split('T')[0],
    paidBy: Payer.OFFICE,
    notes: '',
  });

  // Load Data
  useEffect(() => {
    const storedExpenses = localStorage.getItem('emlak_expenses');
    if (storedExpenses) {
      setExpenses(JSON.parse(storedExpenses));
    } else {
      setExpenses(INITIAL_EXPENSES);
      localStorage.setItem('emlak_expenses', JSON.stringify(INITIAL_EXPENSES));
    }
  }, []);

  // Save Data
  useEffect(() => {
    if (expenses.length > 0) {
      localStorage.setItem('emlak_expenses', JSON.stringify(expenses));
    }
  }, [expenses]);

  const handleOpenModal = () => {
    setFormData({
      description: '',
      category: ExpenseCategory.OTHER,
      amount: '',
      date: new Date().toISOString().split('T')[0],
      paidBy: Payer.OFFICE,
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleRowClick = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsViewModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newExpense: Expense = {
      id: Date.now().toString(),
      description: formData.description,
      category: formData.category,
      amount: Number(formData.amount),
      date: formData.date,
      paidBy: formData.paidBy,
      notes: formData.notes,
    };

    setExpenses(prev => [newExpense, ...prev]);
    setIsModalOpen(false);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterCategory('ALL');
    setFilterPayer('ALL');
    setFilterDateStart('');
    setFilterDateEnd('');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
  };

  const getCategoryLabel = (cat: string) => {
    switch(cat) {
      case ExpenseCategory.RENT: return 'Kira';
      case ExpenseCategory.OFFICE_SUPPLIES: return 'Ofis Malzemeleri';
      case ExpenseCategory.MARKETING: return 'Pazarlama/İlan';
      case ExpenseCategory.UTILITIES: return 'Faturalar';
      case ExpenseCategory.FOOD: return 'Yemek/Temsil';
      case ExpenseCategory.PERSONNEL: return 'Personel Maaş';
      case ExpenseCategory.OTHER: return 'Diğer';
      default: return cat;
    }
  };

  // Kategori Renk Haritası
  const getCategoryStyle = (cat: ExpenseCategory) => {
    const styles: Record<ExpenseCategory, string> = {
      [ExpenseCategory.RENT]: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      [ExpenseCategory.UTILITIES]: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      [ExpenseCategory.OFFICE_SUPPLIES]: 'bg-stone-50 text-stone-700 border-stone-200',
      [ExpenseCategory.MARKETING]: 'bg-pink-50 text-pink-700 border-pink-200',
      [ExpenseCategory.FOOD]: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      [ExpenseCategory.PERSONNEL]: 'bg-orange-50 text-orange-700 border-orange-200',
      [ExpenseCategory.OTHER]: 'bg-slate-50 text-slate-600 border-slate-200',
    };
    return styles[cat] || styles[ExpenseCategory.OTHER];
  };

  const getPayerLabel = (payer: string) => {
    switch(payer) {
      case Payer.ALTAN: return { label: 'Altan', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case Payer.SUAT: return { label: 'Suat', color: 'bg-violet-50 text-violet-700 border-violet-200' };
      case Payer.OFFICE: return { label: 'Ofis Kasası', color: 'bg-slate-100 text-slate-700 border-slate-200' };
      default: return { label: payer, color: 'bg-slate-50' };
    }
  };

  // --- FILTER LOGIC ---
  const filteredExpenses = expenses.filter(e => {
    const matchesSearch = e.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'ALL' || e.category === filterCategory;
    const matchesPayer = filterPayer === 'ALL' || e.paidBy === filterPayer;
    
    let matchesDate = true;
    if (filterDateStart) {
      matchesDate = matchesDate && e.date >= filterDateStart;
    }
    if (filterDateEnd) {
      matchesDate = matchesDate && e.date <= filterDateEnd;
    }

    return matchesSearch && matchesCategory && matchesPayer && matchesDate;
  });

  // Totals Calculation based on FILTERED data
  const totalExpenses = filteredExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  
  // Breakdown Calculation based on FILTERED data
  const totalAltan = filteredExpenses.filter(e => e.paidBy === Payer.ALTAN).reduce((acc, e) => acc + e.amount, 0);
  const totalSuat = filteredExpenses.filter(e => e.paidBy === Payer.SUAT).reduce((acc, e) => acc + e.amount, 0);
  const totalOffice = filteredExpenses.filter(e => e.paidBy === Payer.OFFICE).reduce((acc, e) => acc + e.amount, 0);

  // Percentages Calculation
  const safeTotal = totalExpenses > 0 ? totalExpenses : 1;
  const altanPercent = Math.round((totalAltan / safeTotal) * 100);
  const suatPercent = Math.round((totalSuat / safeTotal) * 100);
  const officePercent = Math.round((totalOffice / safeTotal) * 100);

  const hasActiveFilters = filterCategory !== 'ALL' || filterPayer !== 'ALL' || filterDateStart !== '' || filterDateEnd !== '';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gider Yönetimi</h1>
          <p className="text-slate-500">Ofis harcamalarını ve ortak ödemelerini kaydedin.</p>
        </div>
        <button
          onClick={handleOpenModal}
          className="flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
        >
          <Plus size={20} />
          <span>Yeni Gider Ekle</span>
        </button>
      </div>

      {/* Unified Expense Distribution Card */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
        <div className="flex items-center justify-between mb-6">
             <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <PieChart size={20} className="text-indigo-600" />
                Harcama Dağılımı (Özet)
            </h2>
            {hasActiveFilters && (
                <span className="text-xs font-medium text-rose-600 bg-rose-50 px-2 py-1 rounded-full">
                    Filtrelenmiş Veri
                </span>
            )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 divide-y md:divide-y-0 md:divide-x divide-slate-100">
            {/* Total Column */}
            <div className="text-center md:text-left pt-4 md:pt-0">
                <p className="text-sm text-slate-500 font-medium mb-1">Toplam Gider</p>
                <div className="flex items-center justify-center md:justify-start gap-2">
                    <p className="text-3xl font-bold text-slate-900 tracking-tight">{formatCurrency(totalExpenses)}</p>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                    Toplam {filteredExpenses.length} işlem kaydı
                </p>
            </div>

            {/* Altan Breakdown */}
            <div className="pt-4 md:pt-0 md:pl-8">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                        <UserCircle size={16} className="text-indigo-500" /> Altan
                    </span>
                    <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">%{altanPercent}</span>
                </div>
                <p className="text-xl font-bold text-indigo-900 mb-2">{formatCurrency(totalAltan)}</p>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 transition-all duration-500 ease-out" style={{ width: `${altanPercent}%` }}></div>
                </div>
            </div>

            {/* Suat Breakdown */}
             <div className="pt-4 md:pt-0 md:pl-8">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                         <UserCircle size={16} className="text-violet-500" /> Suat
                    </span>
                    <span className="text-[10px] font-bold bg-violet-50 text-violet-700 px-2 py-0.5 rounded-full">%{suatPercent}</span>
                </div>
                <p className="text-xl font-bold text-violet-900 mb-2">{formatCurrency(totalSuat)}</p>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-violet-500 transition-all duration-500 ease-out" style={{ width: `${suatPercent}%` }}></div>
                </div>
            </div>

            {/* Office Breakdown */}
             <div className="pt-4 md:pt-0 md:pl-8">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                        <Building2 size={16} className="text-slate-500" /> Ofis Kasası
                    </span>
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">%{officePercent}</span>
                </div>
                <p className="text-xl font-bold text-slate-900 mb-2">{formatCurrency(totalOffice)}</p>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-500 transition-all duration-500 ease-out" style={{ width: `${officePercent}%` }}></div>
                </div>
            </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search size={20} />
            </div>
            <input
              type="text"
              placeholder="Açıklama veya kategori ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition-shadow"
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`
              px-4 py-2 border rounded-xl flex items-center gap-2 transition-colors
              ${showFilters || hasActiveFilters ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}
            `}
          >
            <Filter size={20} />
            <span className="hidden sm:inline">Filtrele</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-rose-600 ml-1"></span>
            )}
          </button>
        </div>

        {/* Expandable Filter Panel */}
        {showFilters && (
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              {/* Category Filter */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase">Kategori</label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none text-sm"
                >
                  <option value="ALL">Tümü</option>
                  {Object.values(ExpenseCategory).map(cat => (
                    <option key={cat} value={cat}>{getCategoryLabel(cat)}</option>
                  ))}
                </select>
              </div>

              {/* Payer Filter */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase">Ödeyen</label>
                <select
                  value={filterPayer}
                  onChange={(e) => setFilterPayer(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none text-sm"
                >
                  <option value="ALL">Tümü</option>
                  <option value={Payer.ALTAN}>Altan</option>
                  <option value={Payer.SUAT}>Suat</option>
                  <option value={Payer.OFFICE}>Ofis Kasası</option>
                </select>
              </div>

              {/* Date Start */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase">Başlangıç</label>
                <input
                  type="date"
                  value={filterDateStart}
                  onChange={(e) => setFilterDateStart(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none text-sm"
                />
              </div>

              {/* Date End */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase">Bitiş</label>
                <input
                  type="date"
                  value={filterDateEnd}
                  onChange={(e) => setFilterDateEnd(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none text-sm"
                />
              </div>
            </div>

            {/* Clear Button */}
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleClearFilters}
                className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-rose-600 transition-colors"
              >
                <RefreshCw size={14} />
                Filtreleri Temizle
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Expenses Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 font-semibold text-slate-700">Tarih</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Açıklama</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Kategori</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Ödeyen</th>
                <th className="px-6 py-4 font-semibold text-rose-700 text-right">Tutar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.map((expense) => {
                const payerStyle = getPayerLabel(expense.paidBy);
                const categoryClass = getCategoryStyle(expense.category);
                
                return (
                  <tr 
                    key={expense.id} 
                    onClick={() => handleRowClick(expense)}
                    className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                      {new Date(expense.date).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {expense.description}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border uppercase tracking-wide ${categoryClass}`}>
                        <Tag size={12} />
                        {getCategoryLabel(expense.category)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border uppercase tracking-wide ${payerStyle.color}`}>
                        <UserCircle size={12} />
                        {payerStyle.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-rose-600">
                      -{formatCurrency(expense.amount)}
                    </td>
                  </tr>
                );
              })}
              
              {filteredExpenses.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    Kriterlere uygun gider kaydı bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Expense Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Yeni Gider Kaydı"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Açıklama</label>
            <input
              type="text"
              required
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none"
              placeholder="Örn: Ekim Ayı İnternet Faturası"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Kategori</label>
              <select
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value as ExpenseCategory})}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none bg-white"
              >
                <option value={ExpenseCategory.RENT}>Kira</option>
                <option value={ExpenseCategory.UTILITIES}>Faturalar</option>
                <option value={ExpenseCategory.OFFICE_SUPPLIES}>Ofis Malzemeleri</option>
                <option value={ExpenseCategory.FOOD}>Yemek/Temsil</option>
                <option value={ExpenseCategory.MARKETING}>Pazarlama</option>
                <option value={ExpenseCategory.PERSONNEL}>Personel Maaş</option>
                <option value={ExpenseCategory.OTHER}>Diğer</option>
              </select>
            </div>
            
            {/* Date */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Harcama Tarihi</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none"
              />
            </div>
          </div>

          {/* Amount */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Tutar</label>
            <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-500 font-bold">₺</span>
                <input
                type="number"
                required
                min="0"
                value={formData.amount}
                onChange={e => setFormData({...formData, amount: e.target.value})}
                className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none font-bold text-slate-900"
                placeholder="0.00"
                />
            </div>
          </div>

          {/* Paid By */}
          <div className="space-y-2 pt-2">
            <label className="text-sm font-medium text-slate-700">Ödemeyi Yapan</label>
            <div className="grid grid-cols-3 gap-2">
                <button
                    type="button"
                    onClick={() => setFormData({...formData, paidBy: Payer.OFFICE})}
                    className={`p-2 text-sm font-medium rounded-lg border text-center transition-all ${
                        formData.paidBy === Payer.OFFICE 
                        ? 'bg-slate-800 text-white border-slate-800 shadow-md' 
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                >
                    Ofis Kasası
                </button>
                <button
                    type="button"
                    onClick={() => setFormData({...formData, paidBy: Payer.ALTAN})}
                    className={`p-2 text-sm font-medium rounded-lg border text-center transition-all ${
                        formData.paidBy === Payer.ALTAN 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-blue-50'
                    }`}
                >
                    Altan (Ortak)
                </button>
                <button
                    type="button"
                    onClick={() => setFormData({...formData, paidBy: Payer.SUAT})}
                    className={`p-2 text-sm font-medium rounded-lg border text-center transition-all ${
                        formData.paidBy === Payer.SUAT 
                        ? 'bg-purple-600 text-white border-purple-600 shadow-md' 
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-purple-50'
                    }`}
                >
                    Suat (Ortak)
                </button>
            </div>
            <p className="text-xs text-slate-500 mt-1">
                Ortakların ceplerinden yaptığı harcamalar, "Ortak Cari Hesabı"na alacak olarak işlenir.
            </p>
          </div>

          {/* Notes Input - NEW */}
          <div className="space-y-1.5 pt-2">
            <label className="text-sm font-medium text-slate-700">Notlar (Opsiyonel)</label>
            <div className="relative">
                 <StickyNote className="absolute left-3 top-2.5 text-slate-400" size={18} />
                <textarea
                  value={formData.notes}
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                  className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none resize-none h-20 text-sm"
                  placeholder="Ekstra detaylar, fiş no vb."
                />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 font-medium rounded-lg transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 text-white bg-rose-600 hover:bg-rose-700 font-medium rounded-lg transition-colors"
            >
              Kaydet
            </button>
          </div>
        </form>
      </Modal>

      {/* Detail View Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Gider Detayı"
      >
        {selectedExpense && (
          <div className="space-y-6">
            <div className="flex flex-col items-center justify-center py-6 bg-rose-50 rounded-xl border border-rose-100">
                <Receipt size={32} className="text-rose-500 mb-2" />
                <p className="text-sm text-rose-600 font-medium">Toplam Tutar</p>
                <h2 className="text-3xl font-bold text-slate-900">
                    {formatCurrency(selectedExpense.amount)}
                </h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2 text-slate-500 mb-1">
                        <Calendar size={16} />
                        <span className="text-xs font-semibold uppercase">Tarih</span>
                    </div>
                    <p className="font-medium text-slate-900">
                        {new Date(selectedExpense.date).toLocaleDateString('tr-TR')}
                    </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2 text-slate-500 mb-1">
                        <UserCircle size={16} />
                        <span className="text-xs font-semibold uppercase">Ödeyen</span>
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold border ${getPayerLabel(selectedExpense.paidBy).color}`}>
                        {getPayerLabel(selectedExpense.paidBy).label}
                    </span>
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex items-center gap-2 text-slate-500">
                    <Tag size={16} />
                    <span className="text-xs font-semibold uppercase">Kategori</span>
                </div>
                <div className="p-3 border border-slate-200 rounded-lg flex items-center gap-2 bg-white">
                    <span className={`w-3 h-3 rounded-full ${getCategoryStyle(selectedExpense.category).split(' ')[0]}`}></span>
                    <span className="font-medium text-slate-700">{getCategoryLabel(selectedExpense.category)}</span>
                </div>
            </div>

            <div className="space-y-2">
                 <div className="flex items-center gap-2 text-slate-500">
                    <FileText size={16} />
                    <span className="text-xs font-semibold uppercase">Açıklama</span>
                </div>
                <div className="p-4 border border-slate-200 rounded-lg bg-slate-50/50 text-slate-700 min-h-[80px]">
                    {selectedExpense.description}
                </div>
            </div>

            {/* Notes Display - NEW */}
            {selectedExpense.notes && (
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-slate-500">
                        <StickyNote size={16} />
                        <span className="text-xs font-semibold uppercase">Notlar</span>
                    </div>
                    <div className="p-4 border border-amber-200 rounded-lg bg-amber-50 text-slate-700 text-sm">
                        {selectedExpense.notes}
                    </div>
                </div>
            )}

            <div className="pt-4">
                <button
                    onClick={() => setIsViewModalOpen(false)}
                    className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors"
                >
                    Kapat
                </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Expenses;