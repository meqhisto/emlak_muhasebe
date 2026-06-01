import React, { useState, useMemo } from 'react';
import { Expense, ExpenseCategory, Payer } from '../types';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import Modal from '../components/Modal';
import { Plus, Search, Filter, CheckCircle, Clock, Receipt, Trash2, Calendar, Wallet } from 'lucide-react';

const MONTHS = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

const Expenses: React.FC = () => {
  const { currentUser } = useAuth();
  const { expenses, vendors, addExpense, updateExpense, deleteExpense } = useData();

  // UI States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterPayer, setFilterPayer] = useState<string>('ALL');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(-1); // -1: Tüm Aylar

  // Available years from expense data
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    expenses?.forEach(e => years.add(new Date(e.date).getFullYear()));
    years.add(new Date().getFullYear());
    return Array.from(years).sort((a, b) => b - a);
  }, [expenses]);

  // Form State
  const [formData, setFormData] = useState({
    description: '',
    category: ExpenseCategory.OTHER,
    amount: '',
    date: new Date().toISOString().split('T')[0],
    paidBy: Payer.OFFICE,
    paidToPartner: '' as Payer | '',
    notes: '',
    isPaid: true,
    vendorId: '',
  });

  // Helpers
  const getVendorName = (vendorId?: string) => {
    if (!vendorId) return '-';
    return vendors?.find(v => v.id === vendorId)?.name || 'Bilinmeyen Firma';
  };

  const getCategoryLabel = (cat: string) => {
    const labels: any = {
      [ExpenseCategory.RENT]: 'Kira',
      [ExpenseCategory.OFFICE_SUPPLIES]: 'Ofis Malzemeleri',
      [ExpenseCategory.MARKETING]: 'Pazarlama/İlan',
      [ExpenseCategory.UTILITIES]: 'Faturalar',
      [ExpenseCategory.FOOD]: 'Yemek/Temsil',
      [ExpenseCategory.PERSONNEL]: 'Personel Maaş',
      [ExpenseCategory.COMMISSION]: 'Danışman Hakediş',
      [ExpenseCategory.OTHER]: 'Diğer',
    };
    return labels[cat] || cat;
  };

  const getPayerLabel = (payer: Payer) => {
    switch (payer) {
      case Payer.ALTAN: return 'Altan';
      case Payer.SUAT: return 'Suat';
      case Payer.OFFICE: return 'Ofis Kasası';
      default: return payer;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
  };

  // Actions
  const handleOpenModal = (expenseToEdit?: Expense) => {
    if (expenseToEdit) {
      setEditingId(expenseToEdit.id);
      setFormData({
        description: expenseToEdit.description,
        category: expenseToEdit.category,
        amount: expenseToEdit.amount.toString(),
        date: expenseToEdit.date,
        paidBy: expenseToEdit.paidBy,
        paidToPartner: (expenseToEdit.paidToPartner as Payer | '') || '',
        notes: expenseToEdit.notes || '',
        isPaid: expenseToEdit.isPaid,
        vendorId: expenseToEdit.vendorId || '',
      });
    } else {
      setEditingId(null);
      setFormData({
        description: '',
        category: ExpenseCategory.OTHER,
        amount: '',
        date: new Date().toISOString().split('T')[0],
        paidBy: Payer.OFFICE,
        paidToPartner: '',
        notes: '',
        isPaid: true,
        vendorId: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const expenseBase = {
      description: formData.description,
      category: formData.category,
      amount: Number(formData.amount),
      date: formData.date,
      paidBy: formData.paidBy,
      paidToPartner: formData.paidToPartner || undefined,
      notes: formData.notes,
      isPaid: formData.isPaid,
      vendorId: formData.vendorId || undefined,
    };

    if (editingId) {
      updateExpense(editingId, expenseBase);
    } else {
      addExpense({ ...expenseBase, id: Date.now().toString() } as any);
    }
    setIsModalOpen(false);
  };

  const handleDeleteExpense = (id: string) => {
    if (!currentUser) return;

    if (window.confirm('Bu gideri silmek istediğinize emin misiniz?')) {
      deleteExpense(id);
      setIsModalOpen(false); // Close modal after deletion
    }
  };

  // Filtering
  const filteredExpenses = useMemo(() => {
    return expenses?.filter(e => {
      const matchesSearch = e.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'ALL' || e.category === filterCategory;
      const matchesStatus = filterStatus === 'ALL' || (filterStatus === 'PAID' ? e.isPaid : !e.isPaid);
      const matchesPayer = filterPayer === 'ALL' || e.paidBy === filterPayer;
      const expDate = new Date(e.date);
      const matchesYear = expDate.getFullYear() === selectedYear;
      const matchesMonth = selectedMonth === -1 || expDate.getMonth() === selectedMonth;
      return matchesSearch && matchesCategory && matchesStatus && matchesPayer && matchesYear && matchesMonth;
    }) || [];
  }, [expenses, searchTerm, filterCategory, filterStatus, filterPayer, selectedYear, selectedMonth]);

  // Filtered summary stats
  const filteredTotal = filteredExpenses.reduce((acc, e) => acc + e.amount, 0);
  const filteredByAltan = filteredExpenses.filter(e => e.paidBy === Payer.ALTAN).reduce((acc, e) => acc + e.amount, 0);
  const filteredBySuat = filteredExpenses.filter(e => e.paidBy === Payer.SUAT).reduce((acc, e) => acc + e.amount, 0);
  const filteredByOffice = filteredExpenses.filter(e => e.paidBy === Payer.OFFICE).reduce((acc, e) => acc + e.amount, 0);

  // Cari özet: Her ortağın net alacağı (ödediği − kendisine yapılan ödemeler)
  const altanPaidToPartner = filteredExpenses.filter(e => e.paidToPartner === Payer.ALTAN).reduce((acc, e) => acc + e.amount, 0);
  const suatPaidToPartner = filteredExpenses.filter(e => e.paidToPartner === Payer.SUAT).reduce((acc, e) => acc + e.amount, 0);
  const altanNetReceivable = filteredByAltan - altanPaidToPartner;
  const suatNetReceivable = filteredBySuat - suatPaidToPartner;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gider Yönetimi</h1>
          <p className="text-slate-500">Ofis harcamalarını ve ortakların yaptığı ödemeleri takip edin.</p>
        </div>
        <button onClick={() => handleOpenModal()} className="flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 rounded-lg font-medium shadow-sm transition-colors">
          <Plus size={20} />
          <span>Yeni Gider Ekle</span>
        </button>
      </div>

      {/* --- DATE FILTER BAR --- */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
          <Calendar size={16} className="text-slate-400" />
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="bg-transparent outline-none text-sm font-medium text-slate-700"
          >
            <option value={-1}>Tüm Aylar</option>
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
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input type="text" placeholder="Giderlerde ara..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-slate-50 text-slate-900 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-rose-500 text-sm" />
        </div>
        <button onClick={() => setShowFilters(!showFilters)} className={`px-3 py-2 border rounded-lg flex items-center gap-2 transition-colors text-sm ${showFilters ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
          <Filter size={16} />
          <span className="hidden sm:inline">Filtrele</span>
        </button>
      </div>

      {showFilters && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm animate-in slide-in-from-top-2 duration-200">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kategori</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-700 outline-none focus:ring-2 focus:ring-rose-500 text-sm"
            >
              <option value="ALL">Tüm Kategoriler</option>
              {Object.values(ExpenseCategory).map(cat => (
                <option key={cat} value={cat}>{getCategoryLabel(cat)}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ödeyen</label>
            <select
              value={filterPayer}
              onChange={(e) => setFilterPayer(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-700 outline-none focus:ring-2 focus:ring-rose-500 text-sm"
            >
              <option value="ALL">Tüm Ödeyenler</option>
              <option value={Payer.OFFICE}>Ofis Kasası</option>
              <option value={Payer.ALTAN}>Altan</option>
              <option value={Payer.SUAT}>Suat</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Durum</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-700 outline-none focus:ring-2 focus:ring-rose-500 text-sm"
            >
              <option value="ALL">Tüm Durumlar</option>
              <option value="PAID">Ödenenler</option>
              <option value="UNPAID">Bekleyenler</option>
            </select>
          </div>
        </div>
      )}

      {/* --- ÖZET BAR --- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Toplam ({filteredExpenses.length} kayıt)</p>
          <p className="text-lg font-black text-rose-600">{formatCurrency(filteredTotal)}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-1">Altan Ödediği</p>
          <p className="text-lg font-bold text-indigo-700">{formatCurrency(filteredByAltan)}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-bold text-violet-400 uppercase tracking-wider mb-1">Suat Ödediği</p>
          <p className="text-lg font-bold text-violet-700">{formatCurrency(filteredBySuat)}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Ofis Kasası</p>
          <p className="text-lg font-bold text-slate-700">{formatCurrency(filteredByOffice)}</p>
        </div>
      </div>

      {/* --- CARİ ÖZET --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Altan Cari */}
        <div className="bg-white rounded-xl border border-indigo-100 shadow-sm overflow-hidden">
          <div className="bg-indigo-50 px-5 py-3 border-b border-indigo-100 flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-sm">A</div>
            <span className="font-bold text-indigo-900 text-sm">Altan — Cari Durumu</span>
          </div>
          <div className="px-5 py-4 space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Cepten Ödediği</span>
              <span className="font-semibold text-indigo-700">+{formatCurrency(filteredByAltan)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Kendisine Yapılan Ödemeler</span>
              <span className="font-semibold text-rose-600">-{formatCurrency(altanPaidToPartner)}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <span className="font-bold text-slate-700">Net Cari Alacak</span>
              <span className={`text-lg font-black ${altanNetReceivable >= 0 ? 'text-indigo-700' : 'text-red-600'}`}>
                {formatCurrency(altanNetReceivable)}
              </span>
            </div>
          </div>
        </div>
        {/* Suat Cari */}
        <div className="bg-white rounded-xl border border-violet-100 shadow-sm overflow-hidden">
          <div className="bg-violet-50 px-5 py-3 border-b border-violet-100 flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-violet-200 flex items-center justify-center text-violet-700 font-bold text-sm">S</div>
            <span className="font-bold text-violet-900 text-sm">Suat — Cari Durumu</span>
          </div>
          <div className="px-5 py-4 space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Cepten Ödediği</span>
              <span className="font-semibold text-violet-700">+{formatCurrency(filteredBySuat)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Kendisine Yapılan Ödemeler</span>
              <span className="font-semibold text-rose-600">-{formatCurrency(suatPaidToPartner)}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <span className="font-bold text-slate-700">Net Cari Alacak</span>
              <span className={`text-lg font-black ${suatNetReceivable >= 0 ? 'text-violet-700' : 'text-red-600'}`}>
                {formatCurrency(suatNetReceivable)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 font-semibold text-slate-700">Tarih</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Ödeyen</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Alıcı</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Açıklama</th>
                <th className="px-6 py-4 font-semibold text-slate-700 text-right">Tutar</th>
                <th className="px-6 py-4 font-semibold text-slate-700 text-center">Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.map((expense) => (
                <tr key={expense.id} onClick={() => handleOpenModal(expense)} className={`hover:bg-slate-50/50 transition-colors cursor-pointer group ${expense.paidToPartner ? 'bg-blue-50/30' : ''}`}>
                  <td className="px-6 py-4 text-slate-500 whitespace-nowrap">{new Date(expense.date).toLocaleDateString('tr-TR')}</td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold text-slate-600">{getPayerLabel(expense.paidBy)}</span>
                  </td>
                  <td className="px-6 py-4">
                    {expense.paidToPartner ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold">
                        → {getPayerLabel(expense.paidToPartner as Payer)}
                      </span>
                    ) : (
                      <span className="text-slate-500 text-xs">{getVendorName(expense.vendorId)}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 bg-slate-100 text-[9px] font-bold text-slate-500 rounded uppercase">{getCategoryLabel(expense.category)}</span>
                      {expense.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-black text-rose-600 whitespace-nowrap">-{formatCurrency(expense.amount)}</td>
                  <td className="px-6 py-4 text-center">
                    {expense.isPaid ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[10px] uppercase"><CheckCircle size={14} /> Ödendi</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-orange-600 font-bold text-[10px] uppercase"><Clock size={14} /> Bekliyor</span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredExpenses.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <Receipt size={32} className="text-slate-300" />
                      <p>Kayıtlı gider bulunamadı.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Gider Düzenle' : 'Yeni Gider Kaydı'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Ödemeyi Yapan</label>
              <select
                value={formData.paidBy}
                onChange={e => setFormData({ ...formData, paidBy: e.target.value as Payer })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none bg-white text-slate-900 font-semibold"
              >
                <option value={Payer.OFFICE}>Ofis Kasası</option>
                <option value={Payer.ALTAN}>Altan (Ortak)</option>
                <option value={Payer.SUAT}>Suat (Ortak)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Kime Ödendi</label>
              <select
                value={formData.paidToPartner}
                onChange={e => setFormData({ ...formData, paidToPartner: e.target.value as Payer | '' })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none bg-white text-slate-900"
              >
                <option value="">— Tedarikçi / Genel</option>
                <option value={Payer.ALTAN}>Altan</option>
                <option value={Payer.SUAT}>Suat</option>
              </select>
            </div>
          </div>

          {!formData.paidToPartner && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Firma / Cari</label>
              <select value={formData.vendorId} onChange={e => setFormData({ ...formData, vendorId: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none bg-white text-slate-900">
                <option value="">Firma Seçilmedi</option>
                {vendors?.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Açıklama</label>
            <input required type="text" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-rose-500" placeholder="Örn: Ekim Ayı Elektrik Faturası" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Kategori</label>
              <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value as ExpenseCategory })} className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900">
                {Object.values(ExpenseCategory).map(cat => <option key={cat} value={cat}>{getCategoryLabel(cat)}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Tarih</label>
              <input required type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg outline-none" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Tutar</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400 font-bold">₺</span>
              <input required type="number" min="0" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} className="w-full pl-8 pr-3 py-2 bg-white text-rose-600 border border-slate-300 rounded-lg outline-none font-bold text-lg" placeholder="0.00" />
            </div>
          </div>

          <div className="space-y-1.5 pt-2">
            <label className="text-sm font-medium text-slate-700">Ödeme Durumu</label>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setFormData({ ...formData, isPaid: true })} className={`py-2 rounded-lg border text-sm font-bold transition-all ${formData.isPaid ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-400 border-slate-200'}`}>Ödendi / Kapalı</button>
              <button type="button" onClick={() => setFormData({ ...formData, isPaid: false })} className={`py-2 rounded-lg border text-sm font-bold transition-all ${!formData.isPaid ? 'bg-orange-600 text-white border-orange-600' : 'bg-white text-slate-400 border-slate-200'}`}>Borç Kaydet / Açık</button>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            {editingId && (
              <button type="button" onClick={() => handleDeleteExpense(editingId)} className="px-4 py-3 bg-red-50 text-red-600 font-bold rounded-lg hover:bg-red-100 transition-colors">
                <Trash2 size={20} />
              </button>
            )}
            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-slate-600 font-medium hover:bg-slate-50 rounded-lg">İptal</button>
            <button type="submit" className="flex-[2] py-3 bg-rose-600 text-white rounded-lg font-bold shadow-lg shadow-rose-900/20 active:scale-95 transition-transform">
              {editingId ? 'Güncelle' : 'Gideri Kaydet'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Expenses;
