import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType, Consultant, PaymentStatus, User, SystemLog } from '../types';
import { INITIAL_TRANSACTIONS, INITIAL_CONSULTANTS } from '../constants';
import Modal from '../components/Modal';
import PaymentFormModal from '../components/PaymentFormModal';
import { Plus, Search, Filter, TrendingUp, Building, User as UserIcon, FileText, CheckCircle2, Clock } from 'lucide-react';

interface TransactionsProps {
  currentUser: User;
}

const Transactions: React.FC<TransactionsProps> = ({ currentUser }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  
  // UI States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form State
  const [formData, setFormData] = useState({
    propertyName: '',
    type: TransactionType.SALE,
    customerName: '',
    consultantId: '',
    date: new Date().toISOString().split('T')[0],
    totalRevenue: '',
  });

  // Load Data
  useEffect(() => {
    // Load Transactions
    const storedTransactions = localStorage.getItem('emlak_transactions');
    if (storedTransactions) {
      setTransactions(JSON.parse(storedTransactions));
    } else {
      setTransactions(INITIAL_TRANSACTIONS);
      localStorage.setItem('emlak_transactions', JSON.stringify(INITIAL_TRANSACTIONS));
    }

    // Load Consultants
    const storedConsultants = localStorage.getItem('emlak_consultants');
    if (storedConsultants) {
      setConsultants(JSON.parse(storedConsultants));
    } else {
      setConsultants(INITIAL_CONSULTANTS);
    }
  }, []);

  // Save Transactions
  useEffect(() => {
    if (transactions.length > 0) {
      localStorage.setItem('emlak_transactions', JSON.stringify(transactions));
    }
  }, [transactions]);

  // LOGGING HELPER (Safe Version)
  const logAction = (action: 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE', description: string) => {
    try {
      const newLog: SystemLog = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        user: currentUser.name,
        action: action,
        module: 'TRANSACTION',
        description: description
      };
      
      const storedLogs = localStorage.getItem('emlak_logs');
      let existingLogs: SystemLog[] = [];
      
      if (storedLogs) {
        try {
          const parsed = JSON.parse(storedLogs);
          if (Array.isArray(parsed)) {
            existingLogs = parsed;
          }
        } catch (e) {
          console.error("Log parse error", e);
        }
      }
      
      localStorage.setItem('emlak_logs', JSON.stringify([newLog, ...existingLogs]));
    } catch (error) {
      console.error("Logging failed:", error);
      // Fail silently to not block the user action
    }
  };

  const handleOpenModal = () => {
    setFormData({
      propertyName: '',
      type: TransactionType.SALE,
      customerName: '',
      consultantId: '',
      date: new Date().toISOString().split('T')[0],
      totalRevenue: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenPaymentForm = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsPaymentModalOpen(true);
  };

  const handleConfirmPayment = (id: string) => {
    // 1. Update List State (Functional Update for safety)
    setTransactions(prev => prev.map(t => 
      t.id === id ? { ...t, paymentStatus: PaymentStatus.PAID } : t
    ));

    // 2. Update Selected Item State (Immediately reflect changes)
    if (selectedTransaction && selectedTransaction.id === id) {
        setSelectedTransaction(prev => prev ? { ...prev, paymentStatus: PaymentStatus.PAID } : null);
    }

    // 3. Log Action
    const trans = transactions.find(t => t.id === id);
    if(trans) {
        logAction('APPROVE', `Hakediş Ödemesi Onaylandı: ${trans.propertyName} - Danışman Payı: ${trans.consultantShare} TL`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.consultantId) {
      alert("Lütfen bir danışman seçiniz.");
      return;
    }

    const selectedConsultant = consultants.find(c => c.id === formData.consultantId);
    if (!selectedConsultant) return;

    // --- AUTOMATIC CALCULATION LOGIC ---
    const revenue = Number(formData.totalRevenue);
    const consultantRate = selectedConsultant.commissionRate / 100;
    
    const consultantShare = revenue * consultantRate;
    const officeRevenue = revenue - consultantShare;
    const partnerShare = officeRevenue / 2; // Altan & Suat Share

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      propertyName: formData.propertyName,
      type: formData.type,
      customerName: formData.customerName,
      consultantId: formData.consultantId,
      date: formData.date,
      totalRevenue: revenue,
      officeRevenue: officeRevenue,
      consultantShare: consultantShare,
      partnerShareAltan: partnerShare,
      partnerShareSuat: partnerShare,
      paymentStatus: PaymentStatus.PENDING, // Default status for new transactions
    };

    setTransactions(prev => [newTransaction, ...prev]);
    logAction('CREATE', `Yeni Gelir Girişi: ${formData.propertyName} (${formData.type}) - Toplam Ciro: ${revenue} TL`);
    setIsModalOpen(false);
  };

  const getConsultantName = (id: string) => {
    const c = consultants.find(item => item.id === id);
    return c ? c.fullName : 'Bilinmiyor';
  };

  const getConsultantObj = (id: string) => {
    return consultants.find(item => item.id === id) || null;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
  };

  const filteredTransactions = transactions.filter(t => 
    t.propertyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalTurnover = filteredTransactions.reduce((acc, curr) => acc + curr.totalRevenue, 0);
  const totalOfficeRevenue = filteredTransactions.reduce((acc, curr) => acc + curr.officeRevenue, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gelir ve İşlemler</h1>
          <p className="text-slate-500">Satış ve kiralama işlemlerini kaydedin, hakediş formlarını oluşturun.</p>
        </div>
        <button
          onClick={handleOpenModal}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
        >
          <Plus size={20} />
          <span>Yeni İşlem Gir</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Toplam Ciro (Liste)</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(totalTurnover)}</p>
        </div>
        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 shadow-sm">
          <p className="text-sm font-medium text-indigo-600">Ofis Geliri (Net)</p>
          <p className="text-2xl font-bold text-indigo-900 mt-1">{formatCurrency(totalOfficeRevenue)}</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search size={20} />
          </div>
          <input
            type="text"
            placeholder="Mülk adı veya müşteri adı ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-shadow"
          />
        </div>
        <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 flex items-center gap-2">
          <Filter size={20} />
          <span className="hidden sm:inline">Filtrele</span>
        </button>
      </div>

      {/* Transactions Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 font-semibold text-slate-700">Tarih</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Mülk & Müşteri</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Danışman</th>
                <th className="px-6 py-4 font-semibold text-slate-700 text-right">Ciro</th>
                <th className="px-6 py-4 font-semibold text-indigo-700 text-right bg-indigo-50/50">Ofis Geliri</th>
                <th className="px-6 py-4 font-semibold text-slate-700 text-center">Hakediş</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                    {new Date(t.date).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-900">{t.propertyName}</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide border ${
                          t.type === TransactionType.SALE 
                            ? 'bg-blue-50 text-blue-700 border-blue-100' 
                            : 'bg-orange-50 text-orange-700 border-orange-100'
                        }`}>
                          {t.type === TransactionType.SALE ? 'Satış' : 'Kiralama'}
                        </span>
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <UserIcon size={12} /> {t.customerName}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                     <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">
                       {getConsultantName(t.consultantId)}
                     </span>
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-slate-900">
                    {formatCurrency(t.totalRevenue)}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-indigo-700 bg-indigo-50/30">
                    {formatCurrency(t.officeRevenue)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col items-center gap-2">
                       {/* Status Badge */}
                       {t.paymentStatus === PaymentStatus.PAID ? (
                         <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 border border-green-200 uppercase tracking-wide">
                            <CheckCircle2 size={10} /> İmzalandı
                         </span>
                       ) : (
                         <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-orange-50 text-orange-600 border border-orange-100 uppercase tracking-wide">
                            <Clock size={10} /> Bekliyor
                         </span>
                       )}
                       
                       {/* View Button */}
                       <button 
                        onClick={() => handleOpenPaymentForm(t)}
                        className="text-xs flex items-center gap-1 text-slate-500 hover:text-indigo-600 transition-colors font-medium border border-slate-200 rounded px-2 py-1 bg-white hover:border-indigo-300"
                       >
                         <FileText size={12} />
                         Formu Görüntüle
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    Kayıtlı işlem bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Transaction Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Yeni İşlem Kaydı"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Property Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Mülk Adı / Açıklama</label>
            <div className="relative">
                <Building className="absolute left-3 top-2.5 text-slate-400" size={18} />
                <input
                type="text"
                required
                value={formData.propertyName}
                onChange={e => setFormData({...formData, propertyName: e.target.value})}
                className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                placeholder="Örn: Menekşe Apt. No:4"
                />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Type */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">İşlem Türü</label>
              <select
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value as TransactionType})}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
              >
                <option value={TransactionType.SALE}>Satış</option>
                <option value={TransactionType.RENT}>Kiralama</option>
              </select>
            </div>
            
            {/* Date */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">İşlem Tarihi</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          {/* Customer */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Müşteri Adı</label>
            <div className="relative">
                <UserIcon className="absolute left-3 top-2.5 text-slate-400" size={18} />
                <input
                type="text"
                required
                value={formData.customerName}
                onChange={e => setFormData({...formData, customerName: e.target.value})}
                className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Örn: Ali Veli"
                />
            </div>
          </div>

          {/* Consultant Selection */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">İlgili Danışman</label>
            <select
                required
                value={formData.consultantId}
                onChange={e => setFormData({...formData, consultantId: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
            >
                <option value="">Seçiniz...</option>
                {consultants.filter(c => c.isActive).map(c => (
                    <option key={c.id} value={c.id}>
                        {c.fullName} (Oran: %{c.commissionRate})
                    </option>
                ))}
            </select>
            <p className="text-xs text-slate-500">Sadece aktif danışmanlar listelenir.</p>
          </div>

          {/* Revenue */}
          <div className="space-y-1.5 pt-2">
            <label className="text-sm font-bold text-slate-700">Toplam Ciro (Hizmet Bedeli)</label>
            <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-500 font-bold">₺</span>
                <input
                type="number"
                required
                min="0"
                value={formData.totalRevenue}
                onChange={e => setFormData({...formData, totalRevenue: e.target.value})}
                className="w-full pl-8 pr-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-lg text-slate-900"
                placeholder="0.00"
                />
            </div>
            <p className="text-xs text-orange-600 bg-orange-50 p-2 rounded flex items-start gap-2">
                <TrendingUp size={14} className="mt-0.5 shrink-0" />
                <span>
                    Bu tutar üzerinden danışman payı ve ofis geliri otomatik olarak hesaplanacaktır.
                </span>
            </p>
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
              className="flex-1 px-4 py-2 text-white bg-indigo-600 hover:bg-indigo-700 font-medium rounded-lg transition-colors"
            >
              Kaydet ve Hesapla
            </button>
          </div>
        </form>
      </Modal>

      {/* Payment Form View Modal */}
      {selectedTransaction && (
        <PaymentFormModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          transaction={selectedTransaction}
          consultant={getConsultantObj(selectedTransaction.consultantId)}
          onConfirmPayment={handleConfirmPayment}
        />
      )}
    </div>
  );
};

export default Transactions;