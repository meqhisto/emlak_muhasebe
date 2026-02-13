import React, { useState, useEffect } from 'react';
import { Personnel, SalaryPayment, Expense, ExpenseCategory, Payer, User as UserType, SystemLog } from '../types';
import { INITIAL_PERSONNEL, INITIAL_SALARY_PAYMENTS, INITIAL_EXPENSES } from '../constants';
import Modal from '../components/Modal';
import { Plus, Search, User, Briefcase, Calendar, DollarSign, Wallet, History, AlertCircle, CheckCircle2 } from 'lucide-react';

interface PersonnelProps {
  currentUser: UserType;
}

const PersonnelPage: React.FC<PersonnelProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<'EMPLOYEES' | 'PAYROLL'>('EMPLOYEES');
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [payments, setPayments] = useState<SalaryPayment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  // Modal States
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Personnel | null>(null);

  // Filter State
  const [searchTerm, setSearchTerm] = useState('');

  // Form States
  const [employeeForm, setEmployeeForm] = useState<Partial<Personnel>>({
    fullName: '',
    role: '',
    monthlySalary: 0,
    startDate: new Date().toISOString().split('T')[0],
    isActive: true,
  });

  const [paymentForm, setPaymentForm] = useState({
    personnelId: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    period: new Date().toISOString().slice(0, 7), // "YYYY-MM"
  });

  // Load Data
  useEffect(() => {
    const storedPersonnel = localStorage.getItem('emlak_personnel');
    if (storedPersonnel) {
      setPersonnel(JSON.parse(storedPersonnel));
    } else {
      setPersonnel(INITIAL_PERSONNEL);
      localStorage.setItem('emlak_personnel', JSON.stringify(INITIAL_PERSONNEL));
    }

    const storedPayments = localStorage.getItem('emlak_salary_payments');
    if (storedPayments) {
      setPayments(JSON.parse(storedPayments));
    } else {
      setPayments(INITIAL_SALARY_PAYMENTS);
      localStorage.setItem('emlak_salary_payments', JSON.stringify(INITIAL_SALARY_PAYMENTS));
    }

    const storedExpenses = localStorage.getItem('emlak_expenses');
    if (storedExpenses) {
      setExpenses(JSON.parse(storedExpenses));
    } else {
      setExpenses(INITIAL_EXPENSES);
    }
  }, []);

  // Save Data
  useEffect(() => {
    if (personnel.length > 0) localStorage.setItem('emlak_personnel', JSON.stringify(personnel));
  }, [personnel]);

  useEffect(() => {
    if (payments.length > 0) localStorage.setItem('emlak_salary_payments', JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    if (expenses.length > 0) localStorage.setItem('emlak_expenses', JSON.stringify(expenses));
  }, [expenses]);

  // LOGGING HELPER
  const logAction = (action: 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE', description: string) => {
    try {
      const newLog: SystemLog = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        user: currentUser.name,
        action: action,
        module: 'PERSONNEL',
        description: description
      };
      const storedLogs = localStorage.getItem('emlak_logs');
      let logs = storedLogs ? JSON.parse(storedLogs) : [];
      if (!Array.isArray(logs)) logs = [];
      localStorage.setItem('emlak_logs', JSON.stringify([newLog, ...logs]));
    } catch (e) {
      console.error("Logging failed", e);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
  };

  const handleOpenEmployeeModal = (emp?: Personnel) => {
    if (emp) {
      setEditingEmployee(emp);
      setEmployeeForm({ ...emp });
    } else {
      setEditingEmployee(null);
      setEmployeeForm({
        fullName: '',
        role: '',
        monthlySalary: 0,
        startDate: new Date().toISOString().split('T')[0],
        isActive: true,
      });
    }
    setIsEmployeeModalOpen(true);
  };

  const handleEmployeeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEmployee) {
      setPersonnel(prev => prev.map(p => p.id === editingEmployee.id ? { ...p, ...employeeForm } as Personnel : p));
      logAction('UPDATE', `Personel Bilgisi Güncellendi: ${employeeForm.fullName}`);
    } else {
      const newEmp: Personnel = {
        id: Date.now().toString(),
        ...employeeForm as Omit<Personnel, 'id'>
      };
      setPersonnel(prev => [...prev, newEmp]);
      logAction('CREATE', `Yeni Personel Eklendi: ${newEmp.fullName} (${newEmp.role})`);
    }
    setIsEmployeeModalOpen(false);
  };

  const handleOpenPaymentModal = () => {
    const firstEmp = personnel.find(p => p.isActive);
    setPaymentForm({
      personnelId: firstEmp ? firstEmp.id : '',
      amount: firstEmp ? firstEmp.monthlySalary : 0,
      date: new Date().toISOString().split('T')[0],
      period: new Date().toISOString().slice(0, 7),
    });
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedEmp = personnel.find(p => p.id === paymentForm.personnelId);
    if (!selectedEmp) return;

    const newPayment: SalaryPayment = {
        id: `sp-${Date.now()}`,
        personnelId: paymentForm.personnelId,
        amount: Number(paymentForm.amount),
        date: paymentForm.date,
        period: paymentForm.period,
        isPaid: true
    };
    setPayments(prev => [newPayment, ...prev]);

    const newExpense: Expense = {
        id: `exp-${Date.now()}`,
        category: ExpenseCategory.PERSONNEL,
        amount: Number(paymentForm.amount),
        date: paymentForm.date,
        description: `${paymentForm.period} Maaş Ödemesi - ${selectedEmp.fullName}`,
        paidBy: Payer.OFFICE,
        // Fix: Added missing required isPaid property
        isPaid: true
    };
    setExpenses(prev => [newExpense, ...prev]);

    logAction('APPROVE', `Maaş Ödemesi Yapıldı: ${selectedEmp.fullName} (${paymentForm.period} Dönemi)`);
    setIsPaymentModalOpen(false);
    alert('Maaş ödemesi kaydedildi ve giderlere işlendi.');
  };

  const handlePaymentPersonnelChange = (id: string) => {
    const emp = personnel.find(p => p.id === id);
    setPaymentForm(prev => ({
        ...prev, 
        personnelId: id,
        amount: emp ? emp.monthlySalary : 0
    }));
  };

  const filteredPersonnel = personnel.filter(p => p.fullName.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Personel & Maaş</h1>
          <p className="text-slate-500">Çalışanları yönetin ve maaş ödemelerini takip edin.</p>
        </div>
        <div className="flex gap-2">
           <button
             onClick={() => setActiveTab('EMPLOYEES')}
             className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${activeTab === 'EMPLOYEES' ? 'bg-indigo-600 text-white shadow' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}
           >
             Çalışan Listesi
           </button>
           <button
             onClick={() => setActiveTab('PAYROLL')}
             className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${activeTab === 'PAYROLL' ? 'bg-indigo-600 text-white shadow' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}
           >
             Maaş Ödemeleri
           </button>
        </div>
      </div>

      {activeTab === 'EMPLOYEES' && (
        <div className="space-y-6 animate-in fade-in duration-300">
           <div className="flex justify-between items-center">
              <div className="relative w-full max-w-xs">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Search size={20} />
                 </div>
                 <input
                    type="text"
                    placeholder="Personel ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                 />
              </div>
              <button
                onClick={() => handleOpenEmployeeModal()}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
              >
                <Plus size={20} />
                <span className="hidden sm:inline">Personel Ekle</span>
              </button>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPersonnel.map(p => (
                  <div key={p.id} className={`group bg-white rounded-xl border transition-all duration-200 hover:shadow-md ${p.isActive ? 'border-slate-200' : 'border-slate-100 bg-slate-50 opacity-75'}`}>
                      <div className="p-6">
                          <div className="flex justify-between items-start mb-4">
                             <div className="flex items-center gap-3">
                                 <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${p.isActive ? 'bg-slate-800' : 'bg-slate-400'}`}>
                                     {p.fullName.charAt(0)}
                                 </div>
                                 <div>
                                     <h3 className="font-bold text-slate-900">{p.fullName}</h3>
                                     <p className="text-xs text-slate-500">{p.role}</p>
                                 </div>
                             </div>
                             <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${p.isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                 {p.isActive ? 'Aktif' : 'Ayrıldı'}
                             </span>
                          </div>
                          
                          <div className="space-y-3 border-t border-slate-100 pt-4">
                              <div className="flex justify-between text-sm">
                                  <span className="text-slate-500 flex items-center gap-2"><DollarSign size={14} /> Maaş</span>
                                  <span className="font-bold text-slate-900">{formatCurrency(p.monthlySalary)}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                  <span className="text-slate-500 flex items-center gap-2"><Calendar size={14} /> Başlangıç</span>
                                  <span className="font-medium text-slate-900">{new Date(p.startDate).toLocaleDateString('tr-TR')}</span>
                              </div>
                          </div>

                          <div className="mt-6">
                              <button 
                                onClick={() => handleOpenEmployeeModal(p)}
                                className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 font-medium text-sm rounded-lg transition-colors border border-slate-200"
                              >
                                  Düzenle
                              </button>
                          </div>
                      </div>
                  </div>
              ))}
           </div>
        </div>
      )}

      {activeTab === 'PAYROLL' && (
        <div className="space-y-6 animate-in fade-in duration-300">
           <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-xl flex items-center justify-between">
              <div>
                  <h2 className="text-lg font-bold text-indigo-900 mb-1">Maaş Ödemesi Yap</h2>
                  <p className="text-indigo-600 text-sm">Ödeme yapıldığında otomatik olarak "Giderler" tablosuna işlenir.</p>
              </div>
              <button
                onClick={handleOpenPaymentModal}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-lg font-bold shadow-md transition-transform active:scale-95"
              >
                <Wallet size={20} />
                Ödeme Oluştur
              </button>
           </div>

           <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
             <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex items-center gap-2">
                <History size={18} className="text-slate-400" />
                <h3 className="font-semibold text-slate-700">Ödeme Geçmişi</h3>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-left text-sm">
                 <thead>
                   <tr className="bg-slate-50 border-b border-slate-200">
                     <th className="px-6 py-3 font-semibold text-slate-700">Dönem</th>
                     <th className="px-6 py-3 font-semibold text-slate-700">Personel</th>
                     <th className="px-6 py-3 font-semibold text-slate-700">Ödeme Tarihi</th>
                     <th className="px-6 py-3 font-semibold text-slate-700 text-right">Tutar</th>
                     <th className="px-6 py-3 font-semibold text-slate-700 text-center">Durum</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                    {payments.sort((a,b) => b.date.localeCompare(a.date)).map(pay => {
                        const emp = personnel.find(p => p.id === pay.personnelId);
                        return (
                            <tr key={pay.id} className="hover:bg-slate-50/50">
                                <td className="px-6 py-4 font-mono font-medium text-slate-600">
                                    {pay.period}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-medium text-slate-900">{emp?.fullName || 'Bilinmiyor'}</div>
                                    <div className="text-xs text-slate-500">{emp?.role}</div>
                                </td>
                                <td className="px-6 py-4 text-slate-600">
                                    {new Date(pay.date).toLocaleDateString('tr-TR')}
                                </td>
                                <td className="px-6 py-4 text-right font-bold text-slate-900">
                                    {formatCurrency(pay.amount)}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 border border-green-200 rounded text-xs font-bold uppercase">
                                        <CheckCircle2 size={12} /> Ödendi
                                    </span>
                                </td>
                            </tr>
                        );
                    })}
                    {payments.length === 0 && (
                        <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                Henüz maaş ödemesi yapılmamış.
                            </td>
                        </tr>
                    )}
                 </tbody>
               </table>
             </div>
           </div>
        </div>
      )}

      <Modal
        isOpen={isEmployeeModalOpen}
        onClose={() => setIsEmployeeModalOpen(false)}
        title={editingEmployee ? 'Personel Düzenle' : 'Yeni Personel Ekle'}
      >
        <form onSubmit={handleEmployeeSubmit} className="space-y-4">
            <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Ad Soyad</label>
                <div className="relative">
                    <User className="absolute left-3 top-2.5 text-slate-400" size={18} />
                    <input
                        type="text"
                        required
                        value={employeeForm.fullName}
                        onChange={e => setEmployeeForm({...employeeForm, fullName: e.target.value})}
                        className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Görevi</label>
                    <div className="relative">
                        <Briefcase className="absolute left-3 top-2.5 text-slate-400" size={18} />
                        <input
                            type="text"
                            required
                            placeholder="Örn: Ofis Asistanı"
                            value={employeeForm.role}
                            onChange={e => setEmployeeForm({...employeeForm, role: e.target.value})}
                            className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                </div>
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">İşe Başlama</label>
                    <input
                        type="date"
                        required
                        value={employeeForm.startDate}
                        onChange={e => setEmployeeForm({...employeeForm, startDate: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </div>
            </div>

            <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Aylık Maaş (Net)</label>
                <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-500 font-bold">₺</span>
                    <input
                        type="number"
                        required
                        min="0"
                        value={employeeForm.monthlySalary}
                        onChange={e => setEmployeeForm({...employeeForm, monthlySalary: Number(e.target.value)})}
                        className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-900"
                    />
                </div>
            </div>

            {editingEmployee && (
                <div className="pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={employeeForm.isActive}
                            onChange={e => setEmployeeForm({...employeeForm, isActive: e.target.checked})}
                            className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
                        />
                        <span className="text-sm text-slate-700">Personel Aktif Çalışıyor</span>
                    </label>
                </div>
            )}

            <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsEmployeeModalOpen(false)} className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200">İptal</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Kaydet</button>
            </div>
        </form>
      </Modal>

      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="Maaş Ödemesi Oluştur"
      >
        <form onSubmit={handlePaymentSubmit} className="space-y-4">
             <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-3 text-amber-800 text-sm mb-4">
                 <AlertCircle size={20} className="shrink-0" />
                 <p>Bu işlem hem maaş geçmişine kayıt atacak hem de <strong>Giderler</strong> modülüne otomatik olarak "Personel Maaş" gideri ekleyecektir.</p>
             </div>

             <div className="space-y-1.5">
                 <label className="text-sm font-medium text-slate-700">Personel Seçimi</label>
                 <select
                    required
                    value={paymentForm.personnelId}
                    onChange={e => handlePaymentPersonnelChange(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                 >
                     <option value="">Seçiniz...</option>
                     {personnel.filter(p => p.isActive).map(p => (
                         <option key={p.id} value={p.id}>{p.fullName} - {formatCurrency(p.monthlySalary)}</option>
                     ))}
                 </select>
             </div>

             <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1.5">
                     <label className="text-sm font-medium text-slate-700">Ödeme Dönemi</label>
                     <input
                        type="month"
                        required
                        value={paymentForm.period}
                        onChange={e => setPaymentForm({...paymentForm, period: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                     />
                 </div>
                 <div className="space-y-1.5">
                     <label className="text-sm font-medium text-slate-700">Ödeme Tarihi</label>
                     <input
                        type="date"
                        required
                        value={paymentForm.date}
                        onChange={e => setPaymentForm({...paymentForm, date: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                     />
                 </div>
             </div>

             <div className="space-y-1.5">
                 <label className="text-sm font-medium text-slate-700">Ödenecek Tutar</label>
                 <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-500 font-bold">₺</span>
                    <input
                        type="number"
                        required
                        min="0"
                        value={paymentForm.amount}
                        onChange={e => setPaymentForm({...paymentForm, amount: Number(e.target.value)})}
                        className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-900"
                    />
                 </div>
             </div>

             <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsPaymentModalOpen(false)} className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200">İptal</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold">Ödemeyi Tamamla</button>
            </div>
        </form>
      </Modal>
    </div>
  );
};

export default PersonnelPage;