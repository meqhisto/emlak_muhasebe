
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    propertyName: '',
    type: TransactionType.SALE,
    customerName: '',
    consultantId: '',
    date: new Date().toISOString().split('T')[0],
    totalRevenue: '',
  });

  useEffect(() => {
    const stored = localStorage.getItem('emlak_transactions');
    setTransactions(stored ? JSON.parse(stored) : INITIAL_TRANSACTIONS);
    const storedC = localStorage.getItem('emlak_consultants');
    setConsultants(storedC ? JSON.parse(storedC) : INITIAL_CONSULTANTS);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const c = consultants.find(item => item.id === formData.consultantId);
    if (!c) return;

    const revenue = Number(formData.totalRevenue);
    const consultantShare = revenue * (c.commissionRate / 100);
    const officeRevenue = revenue - consultantShare;

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
      partnerShareAltan: officeRevenue / 2,
      partnerShareSuat: officeRevenue / 2,
      paymentStatus: PaymentStatus.PENDING,
    };

    setTransactions(prev => [newTransaction, ...prev]);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">İşlemler</h1>
        <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2">
          <Plus size={20} /> Yeni İşlem
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Ara..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          className="w-full pl-10 pr-4 py-3 bg-white text-slate-900 border border-slate-200 rounded-xl outline-none" 
        />
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Yeni İşlem Kaydı">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Mülk Adı</label>
            <input required type="text" value={formData.propertyName} onChange={e => setFormData({...formData, propertyName: e.target.value})} className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">İşlem Türü</label>
              <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as TransactionType})} className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg outline-none">
                <option value={TransactionType.SALE}>Satış</option>
                <option value={TransactionType.RENT}>Kiralama</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Danışman</label>
              <select required value={formData.consultantId} onChange={e => setFormData({...formData, consultantId: e.target.value})} className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg outline-none">
                <option value="">Seçiniz</option>
                {consultants.map(c => <option key={c.id} value={c.id}>{c.fullName}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Hizmet Bedeli</label>
            <input required type="number" value={formData.totalRevenue} onChange={e => setFormData({...formData, totalRevenue: e.target.value})} className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg outline-none text-lg font-bold" />
          </div>
          <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-lg font-bold">Kaydet</button>
        </form>
      </Modal>
    </div>
  );
};

export default Transactions;
