import React, { useState, useEffect } from 'react';
import { Expense, ExpenseCategory, Payer, User, SystemLog, Vendor } from '../types';
import { INITIAL_EXPENSES, INITIAL_VENDORS } from '../constants';
import Modal from '../components/Modal';
import { Plus, Search, Filter, Receipt, Calendar, Tag, UserCircle, Building2, RefreshCw, FileText, PieChart, StickyNote, Trash2, Edit, AlertCircle, CheckCircle, Clock, Building } from 'lucide-react';

interface ExpensesProps {
  currentUser: User;
}

const Expenses: React.FC<ExpensesProps> = ({ currentUser }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  
  // UI States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL'); 
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
    isPaid: true,
    vendorId: '', // Yeni: Firma seçimi için
  });

  // Load Data
  useEffect(() => {
    const storedExpenses = localStorage.getItem('emlak_expenses');
    if (storedExpenses) {
      setExpenses(JSON.parse(storedExpenses));
    } else {
      const initialWithStatus = INITIAL_EXPENSES.map(e => ({ ...e, isPaid: true }));
      setExpenses(initialWithStatus);
      localStorage.setItem('emlak_expenses', JSON.stringify(initialWithStatus));
    }

    const storedVendors = localStorage.getItem('emlak_vendors');
    setVendors(storedVendors ? JSON.parse(storedVendors) : INITIAL_VENDORS);
  }, []);

  // Save Data
  useEffect(() => {
    if (expenses.length > 0) {
      localStorage.setItem('emlak_expenses', JSON.stringify(expenses));
    }
  }, [expenses]);

  const logAction = (action: 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE', description: string) => {
    const newLog: SystemLog = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      user: currentUser.name,
      action: action,
      module: 'EXPENSE',
      description: description
    };
    const storedLogs = localStorage.getItem('emlak_logs');
    let logs = storedLogs ? JSON.parse(storedLogs) : [];
    localStorage.setItem('emlak_logs', JSON.stringify([newLog, ...logs]));
  };

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
    if (editingId) {
      setExpenses(prev => prev.map(exp => 
        exp.id === editingId ? {
          ...exp,
          description: formData.description,
          category: formData.category,
          amount: Number(formData.amount),
          date: formData.date,
          paidBy: formData.paidBy,
          notes: formData.notes,
          isPaid: formData.isPaid,
          vendorId: formData.vendorId || undefined,
        } : exp
      ));
      logAction('UPDATE', `Gider Düzenlendi: ${formData.description}`);
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
      setExpenses(prev => [newExpense, ...prev]);
      logAction('CREATE', `Yeni Gider: ${formData.description}`);
    }
    setIsModalOpen(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
  };

  const getVendorName = (vendorId?: string) => {
    if (!vendorId) return '-';
    return vendors.find(v => v.id === vendorId)?.name || 'Bilinmeyen Firma';
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

  const filteredExpenses = expenses.filter(e => {
    const matchesSearch = e.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'ALL' || e.category === filterCategory;
    const matchesStatus = filterStatus === 'ALL' || (filterStatus === 'PAID' ? e.isPaid : !e.isPaid);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gider Yönetimi</h1>
          <p className="text-slate-500">Ofis harcamalarını ve cari borçları takip edin.</p>
        </div>
        <button onClick={() => handleOpenModal()} className="flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 rounded-lg font-medium shadow-sm transition-colors">
          <Plus size={20} />
          <span>Yeni Gider Ekle</span>
        </button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 text-slate-400" size={20} />
          <input type="text" placeholder="Giderlerde ara..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-rose-500 shadow-sm" />
        </div>
        <button onClick={() => setShowFilters(!showFilters)} className={`px-4 py-2 border rounded-xl flex items-center gap-2 transition-colors ${showFilters ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-white border-slate-200 text-slate-600'}`}>
          <Filter size={20} />
          <span className="hidden sm:inline">Filtrele</span>
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 font-semibold text-slate-700">Tarih</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Firma / Cari</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Açıklama</th>
                <th className="px-6 py-4 font-semibold text-slate-700 text-right">Tutar</th>
                <th className="px-6 py-4 font-semibold text-slate-700 text-center">Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.map((expense) => (
                <tr key={expense.id} onClick={() => { setSelectedExpense(expense); setIsViewModalOpen(true); }} className="hover:bg-slate-50/50 transition-colors cursor-pointer">
                  <td className="px-6 py-4 text-slate-500">{new Date(expense.date).toLocaleDateString('tr-TR')}</td>
                  <td className="px-6 py-4 font-bold text-slate-800">{getVendorName(expense.vendorId)}</td>
                  <td className="px-6 py-4 text-slate-600">{expense.description}</td>
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
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Gider Düzenle' : 'Yeni Gider Kaydı'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Firma / Cari Seçimi (Opsiyonel)</label>
            <select value={formData.vendorId} onChange={e => setFormData({...formData, vendorId: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none bg-white">
              <option value="">Firma Seçilmedi (Genel Gider)</option>
              {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Açıklama</label>
            <input required type="text" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Kategori</label>
              <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as ExpenseCategory})} className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white">
                {Object.values(ExpenseCategory).map(cat => <option key={cat} value={cat}>{getCategoryLabel(cat)}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Tarih</label>
              <input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Tutar</label>
            <input required type="number" min="0" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none font-bold" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Ödeme Durumu</label>
            <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setFormData({...formData, isPaid: true})} className={`py-2 rounded-lg border text-sm font-bold ${formData.isPaid ? 'bg-emerald-600 text-white' : 'bg-white text-slate-500'}`}>Ödendi</button>
                <button type="button" onClick={() => setFormData({...formData, isPaid: false})} className={`py-2 rounded-lg border text-sm font-bold ${!formData.isPaid ? 'bg-orange-600 text-white' : 'bg-white text-slate-500'}`}>Borç Kaydet</button>
            </div>
          </div>
          <button type="submit" className="w-full px-4 py-3 bg-rose-600 text-white rounded-lg font-bold mt-4 shadow-lg active:scale-95 transition-transform">Gideri Kaydet</button>
        </form>
      </Modal>
    </div>
  );
};

export default Expenses;