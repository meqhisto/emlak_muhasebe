
import React, { useState, useEffect } from 'react';
// import { useSystemLog } from '../hooks/useSystemLog';
import { Transaction, TransactionType, PropertyType, Consultant, PaymentStatus, User, SystemLog, Expense, ExpenseCategory, Payer } from '../types';
import { INITIAL_TRANSACTIONS, INITIAL_CONSULTANTS } from '../constants';
import Modal from '../components/Modal';
import PaymentFormModal from '../components/PaymentFormModal';
import { Plus, Search, Filter, TrendingUp, Building, User as UserIcon, FileText, CheckCircle2, Clock, Trash2, AlertCircle, Banknote } from 'lucide-react';

import { useData } from '../contexts/DataContext';

import { useAuth } from '../contexts/AuthContext';

const Transactions: React.FC = () => {
  const { currentUser } = useAuth();
  const { transactions, consultants, addTransaction, updateTransaction, deleteTransaction, addExpense } = useData();

  // UI States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Selection States for Actions
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [selectedConsultant, setSelectedConsultant] = useState<Consultant | null>(null);

  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    propertyName: '',
    type: TransactionType.SALE,
    propertyType: PropertyType.APARTMENT,
    customerName: '',
    customerPhone: '',
    consultantId: '',
    date: new Date().toISOString().split('T')[0],
    totalRevenue: '',
    description: '',
  });

  // State logic replaced by DataContext

  // logAction function removed in favor of useSystemLog hook

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const c = consultants.find(item => item.id === formData.consultantId);
    if (!c) {
      alert("Lütfen geçerli bir danışman seçiniz.");
      return;
    }

    const revenue = Number(formData.totalRevenue);
    const consultantShare = revenue * (c.commissionRate / 100);
    const officeRevenue = revenue - consultantShare;

    const newTransaction: any = {
      propertyName: formData.propertyName,
      type: formData.type,
      propertyType: formData.propertyType,
      customerName: formData.customerName,
      customerPhone: formData.customerPhone,
      consultantId: formData.consultantId,
      date: formData.date,
      totalRevenue: revenue,
      officeRevenue: officeRevenue,
      consultantShare: consultantShare,
      partnerShareAltan: officeRevenue / 2,
      partnerShareSuat: officeRevenue / 2,
      paymentStatus: PaymentStatus.PENDING,
      description: formData.description,
    };

    addTransaction(newTransaction);
    setIsModalOpen(false);

    // Form reset
    setFormData({
      propertyName: '',
      type: TransactionType.SALE,
      propertyType: PropertyType.APARTMENT,
      customerName: '',
      customerPhone: '',
      consultantId: '',
      date: new Date().toISOString().split('T')[0],
      totalRevenue: '',
      description: '',
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Bu işlemi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) {
      deleteTransaction(id);
    }
  };

  const handleOpenPaymentModal = (transaction: Transaction) => {
    const consultant = consultants.find(c => c.id === transaction.consultantId);
    if (consultant) {
      setSelectedTransaction(transaction);
      setSelectedConsultant(consultant);
      setIsPaymentModalOpen(true);
    } else {
      alert('Bu işlemin danışmanı sistemde bulunamadı.');
    }
  };

  const handleConfirmPayment = (transactionId: string) => {
    // 1. İşlemi Güncelle (ÖDENDİ Yap)
    const transaction = transactions?.find(t => t.id === transactionId);
    if (!transaction) return;

    const updatedTransaction = { ...transaction, paymentStatus: PaymentStatus.PAID };
    updateTransaction(updatedTransaction.id, updatedTransaction);

    // 2. Gider Kaydı Oluştur (Otomatik)
    const consultant = consultants?.find(c => c.id === transaction.consultantId);

    if (consultant) {
      const newExpense: Expense = {
        id: `auto-exp-${Date.now()}`,
        category: ExpenseCategory.COMMISSION, // Prim/Hakediş ödemesi
        amount: transaction.consultantShare,
        date: new Date().toISOString().split('T')[0],
        description: `Hakediş Ödemesi: ${transaction.propertyName} - ${consultant.fullName}`,
        paidBy: Payer.OFFICE, // Ödemeyi ofis yaptı varsayıyoruz
        isPaid: true,
        notes: `Ref İşlem ID: ${transaction.id}`
      };
      addExpense(newExpense);
    }

    setIsPaymentModalOpen(false);
    alert('Hakediş ödemesi başarıyla onaylandı ve Giderler tablosuna işlendi.');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
  };

  const filteredTransactions = transactions?.filter(t =>
    t.propertyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">İşlemler & Gelirler</h1>
          <p className="text-slate-500">Satış ve kiralama işlemlerini kaydedin, hakedişleri yönetin.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg font-medium shadow-sm transition-colors">
          <Plus size={20} />
          <span>Yeni İşlem Ekle</span>
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 text-slate-400" size={20} />
        <input
          type="text"
          placeholder="Mülk adı veya müşteri ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white text-slate-900 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
        />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 font-semibold text-slate-700">Tarih</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Mülk / Müşteri</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Danışman</th>
                <th className="px-6 py-4 font-semibold text-slate-700 text-right">Toplam Ciro</th>
                <th className="px-6 py-4 font-semibold text-slate-700 text-right">Ofis Payı</th>
                <th className="px-6 py-4 font-semibold text-slate-700 text-center">Durum</th>
                <th className="px-6 py-4 font-semibold text-slate-700 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.map(t => {
                const consultant = consultants.find(c => c.id === t.consultantId);
                return (
                  <tr key={t.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                      {new Date(t.date).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{t.propertyName}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${t.type === TransactionType.SALE ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                            {t.type === TransactionType.SALE ? 'Satış' : 'Kiralama'}
                          </span>
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <UserIcon size={10} /> {t.customerName}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {consultant?.fullName || 'Silinmiş Danışman'}
                    </td>
                    <td className="px-6 py-4 text-right font-black text-slate-900 text-base">
                      {formatCurrency(t.totalRevenue)}
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-indigo-700">
                      {formatCurrency(t.officeRevenue)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {t.paymentStatus === PaymentStatus.PAID ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold uppercase border border-emerald-200">
                          <CheckCircle2 size={12} /> Hakediş Ödendi
                        </span>
                      ) : (
                        <button
                          onClick={() => handleOpenPaymentModal(t)}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 hover:bg-amber-200 rounded-lg text-xs font-bold uppercase border border-amber-200 transition-colors"
                          title="Hakediş Ödemesi Yap"
                        >
                          <Clock size={12} /> Bekliyor
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenPaymentModal(t)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Hakediş Formunu Görüntüle"
                        >
                          <FileText size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(t.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="İşlemi Sil"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <Banknote size={32} className="text-slate-300" />
                      <p>Henüz kayıtlı bir işlem bulunamadı.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Yeni İşlem Kaydı">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Mülk Adı / Tanımı</label>
            <input required placeholder="Örn: Vadi İstanbul 3+1 Daire" type="text" value={formData.propertyName} onChange={e => setFormData({ ...formData, propertyName: e.target.value })} className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Müşteri Adı Soyadı</label>
              <input required placeholder="Müşteri Adı" type="text" value={formData.customerName} onChange={e => setFormData({ ...formData, customerName: e.target.value })} className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Müşteri Telefon</label>
              <input required placeholder="05xx xxx xx xx" type="text" value={formData.customerPhone} onChange={e => setFormData({ ...formData, customerPhone: e.target.value })} className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">İşlem Türü</label>
              <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value as TransactionType })} className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg outline-none">
                <option value={TransactionType.SALE}>Satış</option>
                <option value={TransactionType.RENT}>Kiralama</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Mülk Tipi</label>
              <select value={formData.propertyType} onChange={e => setFormData({ ...formData, propertyType: e.target.value as PropertyType })} className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg outline-none">
                <option value={PropertyType.APARTMENT}>Daire</option>
                <option value={PropertyType.VILLA}>Villa</option>
                <option value={PropertyType.LAND}>Arsa</option>
                <option value={PropertyType.COMMERCIAL}>Ticari</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">İşlem Tarihi</label>
              <input required type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg outline-none" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">İlgili Danışman</label>
            <select required value={formData.consultantId} onChange={e => setFormData({ ...formData, consultantId: e.target.value })} className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg outline-none">
              <option value="">Seçiniz...</option>
              {consultants.map(c => <option key={c.id} value={c.id}>{c.fullName} (Komisyon: %{c.commissionRate})</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Toplam Hizmet Bedeli (KDV Dahil)</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-500 font-bold">₺</span>
              <input required type="number" min="0" value={formData.totalRevenue} onChange={e => setFormData({ ...formData, totalRevenue: e.target.value })} className="w-full pl-8 pr-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg outline-none text-lg font-bold" placeholder="0.00" />
            </div>
            <p className="text-[10px] text-slate-500 pt-1">Bu tutar üzerinden danışman hakedişi ve ofis payı otomatik hesaplanacaktır.</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Açıklama / Notlar</label>
            <textarea placeholder="Ekstra bilgiler..." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" rows={2} />
          </div>

          <div className="pt-2">
            <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-lg shadow-indigo-200 transition-all active:scale-95">Kaydı Tamamla</button>
          </div>
        </form>
      </Modal>

      <PaymentFormModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        transaction={selectedTransaction}
        consultant={selectedConsultant}
        onConfirmPayment={handleConfirmPayment}
      />
    </div>
  );
};

export default Transactions;
