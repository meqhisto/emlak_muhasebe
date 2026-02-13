import React, { useState } from 'react';
import { Expense, ExpenseCategory, Payer } from '../types';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import Modal from '../components/Modal';
import { Plus, Search, Filter, CheckCircle, Clock, Receipt, Trash2 } from 'lucide-react';

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

  // Form State
  const [formData, setFormData] = useState({
    description: '',
    category: ExpenseCategory.OTHER,
    amount: '',
    date: new Date().toISOString().split('T')[0],
    paidBy: Payer.OFFICE,
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

    if (editingId) {
      const updatedExpense: Expense = {
        id: editingId,
        description: formData.description,
        category: formData.category,
        amount: Number(formData.amount),
        date: formData.date,
        paidBy: formData.paidBy,
        notes: formData.notes,
        isPaid: formData.isPaid,
        vendorId: formData.vendorId || undefined,
      };
      updateExpense(updatedExpense.id, updatedExpense);
    } else {
      const newExpense: Expense = {
        id: Date.now().toString(),
        description: formData.description,
        category: formData.category,
        amount: Number(formData.amount),
        date: formData.date,
        paidBy: formData.paidBy,
        notes: formData.notes,
        isPaid: formData.isPaid,
        vendorId: formData.vendorId || undefined,
      };
      addExpense(newExpense);
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
  const filteredExpenses = expenses?.filter(e => {
    const matchesSearch = e.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'ALL' || e.category === filterCategory;
    const matchesStatus = filterStatus === 'ALL' || (filterStatus === 'PAID' ? e.isPaid : !e.isPaid);
    return matchesSearch && matchesCategory && matchesStatus;
  }) || [];

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

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 text-slate-400" size={20} />
          <input type="text" placeholder="Giderlerde ara..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white text-slate-900 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-rose-500 shadow-sm" />
        </div>
        <button onClick={() => setShowFilters(!showFilters)} className={`px-4 py-2 border rounded-xl flex items-center gap-2 transition-colors ${showFilters ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-white border-slate-200 text-slate-600'}`}>
          <Filter size={20} />
          <span className="hidden sm:inline">Filtrele</span>
        </button>
      </div>

      {showFilters && (
        <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-200">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-xl bg-white text-slate-700 outline-none focus:ring-2 focus:ring-rose-500"
          >
            <option value="ALL">Tüm Kategoriler</option>
            {Object.values(ExpenseCategory).map(cat => (
              <option key={cat} value={cat}>{getCategoryLabel(cat)}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-xl bg-white text-slate-700 outline-none focus:ring-2 focus:ring-rose-500"
          >
            <option value="ALL">Tüm Durumlar</option>
            <option value="PAID">Ödenenler</option>
            <option value="UNPAID">Bekleyenler</option>
          </select>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 font-semibold text-slate-700">Tarih</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Ödeyen / Cari</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Açıklama</th>
                <th className="px-6 py-4 font-semibold text-slate-700 text-right">Tutar</th>
                <th className="px-6 py-4 font-semibold text-slate-700 text-center">Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.map((expense) => (
                <tr key={expense.id} onClick={() => handleOpenModal(expense)} className="hover:bg-slate-50/50 transition-colors cursor-pointer group">
                  <td className="px-6 py-4 text-slate-500">{new Date(expense.date).toLocaleDateString('tr-TR')}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter mb-0.5">{getPayerLabel(expense.paidBy)}</span>
                      <span className="font-bold text-slate-800">{getVendorName(expense.vendorId)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 bg-slate-100 text-[9px] font-bold text-slate-500 rounded uppercase">{getCategoryLabel(expense.category)}</span>
                      {expense.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-black text-rose-600">-{formatCurrency(expense.amount)}</td>
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
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
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
              <label className="text-sm font-medium text-slate-700">Firma / Cari</label>
              <select value={formData.vendorId} onChange={e => setFormData({ ...formData, vendorId: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none bg-white text-slate-900">
                <option value="">Firma Seçilmedi</option>
                {vendors?.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </div>
          </div>

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
