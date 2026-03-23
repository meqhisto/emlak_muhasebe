
import React, { useState, useEffect, useCallback } from 'react';
import { Trash2, Download, Save, RefreshCw, Database, Info, ShieldAlert, History, Upload, AlertTriangle } from 'lucide-react';
import { APP_NAME } from '../constants';
import { User, UserRole, SystemLog, Consultant, Transaction, TransactionType, PaymentStatus, Expense, ExpenseCategory, Payer, Personnel, SalaryPayment, Vendor } from '../types';
import Modal from '../components/Modal';

interface SettingsProps {
  currentUser: User;
}

const Settings: React.FC<SettingsProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<'GENERAL' | 'SECURITY'>('GENERAL');
  const [logs, setLogs] = useState<SystemLog[]>([]);
  
  // Modal States
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isLoadSampleModalOpen, setIsLoadSampleModalOpen] = useState(false);

  const loadLogs = useCallback(() => {
    try {
      const storedLogs = localStorage.getItem('emlak_logs');
      if (storedLogs) {
        const parsedLogs = JSON.parse(storedLogs);
        if (Array.isArray(parsedLogs)) {
          const sorted = parsedLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setLogs(sorted);
        } else {
          setLogs([]);
        }
      } else {
        setLogs([]);
      }
    } catch (e) {
      console.error("Failed to load logs", e);
      setLogs([]);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'SECURITY') {
      loadLogs();
    }
  }, [activeTab, loadLogs]);
  
  const handleResetData = () => {
    setIsResetModalOpen(true);
  };

  const confirmResetData = () => {
    localStorage.removeItem('emlak_consultants');
    localStorage.removeItem('emlak_transactions');
    localStorage.removeItem('emlak_expenses');
    localStorage.removeItem('emlak_personnel');
    localStorage.removeItem('emlak_salary_payments');
    localStorage.removeItem('emlak_vendors');
    localStorage.removeItem('emlak_logs');
    localStorage.removeItem('emlak_auth_users'); // Kullanıcıları da siliyoruz
    localStorage.removeItem('emlak_user'); // Mevcut oturumu kapatıyoruz
    
    window.location.reload();
  };

  const handleLoadSampleData = () => {
    setIsLoadSampleModalOpen(true);
  };

  const confirmLoadSampleData = () => {
    const sampleConsultants: Consultant[] = [
      { id: 'c1', fullName: 'Ahmet Yılmaz', phoneNumber: '0532 111 22 33', commissionRate: 50, startDate: '2023-01-15', isActive: true },
      { id: 'c2', fullName: 'Ayşe Demir', phoneNumber: '0533 222 33 44', commissionRate: 45, startDate: '2023-03-10', isActive: true },
      { id: 'c3', fullName: 'Mehmet Kaya', phoneNumber: '0534 333 44 55', commissionRate: 60, startDate: '2022-11-01', isActive: true },
      { id: 'c4', fullName: 'Zeynep Çelik', phoneNumber: '0535 444 55 66', commissionRate: 40, startDate: '2024-01-05', isActive: false }
    ];

    const sampleVendors: Vendor[] = [
      { id: 'v1', name: 'Sahibinden.com', contactPerson: 'Müşteri Hizmetleri', phone: '0850 222 44 44', category: ExpenseCategory.MARKETING },
      { id: 'v2', name: 'Enerjisa', phone: '444 4 372', category: ExpenseCategory.UTILITIES },
      { id: 'v3', name: 'Ofis Kırtasiye', contactPerson: 'Ali Bey', phone: '0212 555 66 77', category: ExpenseCategory.OFFICE_SUPPLIES },
      { id: 'v4', name: 'Temizlik Şirketi', contactPerson: 'Fatma Hanım', phone: '0532 999 88 77', category: ExpenseCategory.OTHER }
    ];

    const samplePersonnel: Personnel[] = [
      { id: 'p1', fullName: 'Nalan Hanım', role: 'Muhasebe', monthlySalary: 25000, startDate: '2022-05-01', isActive: true },
      { id: 'p2', fullName: 'Canan Asistan', role: 'Asistan', monthlySalary: 18000, startDate: '2023-08-15', isActive: true },
      { id: 'p3', fullName: 'Eski Çalışan', role: 'Sekreter', monthlySalary: 15000, startDate: '2021-01-01', isActive: false }
    ];

    const sampleTransactions: Transaction[] = [
      { id: 't1', date: '2026-03-01', type: TransactionType.SALE, propertyName: 'Kadıköy 3+1 Daire', customerName: 'Hasan Bey', consultantId: 'c1', totalRevenue: 150000, officeRevenue: 75000, consultantShare: 75000, partnerShareAltan: 37500, partnerShareSuat: 37500, paymentStatus: PaymentStatus.PAID },
      { id: 't2', date: '2026-03-05', type: TransactionType.RENT, propertyName: 'Ataşehir 2+1 Eşyalı', customerName: 'Selin Hanım', consultantId: 'c2', totalRevenue: 25000, officeRevenue: 13750, consultantShare: 11250, partnerShareAltan: 6875, partnerShareSuat: 6875, paymentStatus: PaymentStatus.PAID },
      { id: 't3', date: '2026-03-10', type: TransactionType.SALE, propertyName: 'Beşiktaş Boğaz Manzaralı', customerName: 'Kemal Bey', consultantId: 'c3', totalRevenue: 400000, officeRevenue: 160000, consultantShare: 240000, partnerShareAltan: 80000, partnerShareSuat: 80000, paymentStatus: PaymentStatus.PENDING },
      { id: 't4', date: '2026-03-15', type: TransactionType.RENT, propertyName: 'Şişli 1+1 Ofis', customerName: 'ABC Ltd.', consultantId: 'c1', totalRevenue: 30000, officeRevenue: 15000, consultantShare: 15000, partnerShareAltan: 7500, partnerShareSuat: 7500, paymentStatus: PaymentStatus.PAID },
      { id: 't5', date: '2026-03-20', type: TransactionType.SALE, propertyName: 'Sıfır Komisyon Test', customerName: 'Test Müşteri', consultantId: 'c4', totalRevenue: 0, officeRevenue: 0, consultantShare: 0, partnerShareAltan: 0, partnerShareSuat: 0, paymentStatus: PaymentStatus.PENDING }
    ];

    const sampleExpenses: Expense[] = [
      { id: 'e1', description: 'Mart Ayı İlan Gideri', category: ExpenseCategory.MARKETING, amount: 15000, date: '2026-03-02', paidBy: Payer.OFFICE, isPaid: true, vendorId: 'v1' },
      { id: 'e2', description: 'Şubat Elektrik Faturası', category: ExpenseCategory.UTILITIES, amount: 2500, date: '2026-03-05', paidBy: Payer.OFFICE, isPaid: true, vendorId: 'v2' },
      { id: 'e3', description: 'A4 Kağıt ve Dosya', category: ExpenseCategory.OFFICE_SUPPLIES, amount: 1200, date: '2026-03-12', paidBy: Payer.ALTAN, isPaid: false, vendorId: 'v3' },
      { id: 'e4', description: 'Haftalık Temizlik', category: ExpenseCategory.OTHER, amount: 1500, date: '2026-03-15', paidBy: Payer.OFFICE, isPaid: true, vendorId: 'v4' },
      { id: 'e5', description: 'İsimsiz Gider Testi', category: ExpenseCategory.FOOD, amount: 500, date: '2026-03-18', paidBy: Payer.SUAT, isPaid: true }
    ];

    const sampleSalaryPayments: SalaryPayment[] = [
      { id: 'sp1', personnelId: 'p1', amount: 25000, date: '2026-03-01', period: '2026-02', isPaid: true },
      { id: 'sp2', personnelId: 'p2', amount: 18000, date: '2026-03-01', period: '2026-02', isPaid: true },
      { id: 'sp3', personnelId: 'p1', amount: 25000, date: '2026-04-01', period: '2026-03', isPaid: false }
    ];

    localStorage.setItem('emlak_consultants', JSON.stringify(sampleConsultants));
    localStorage.setItem('emlak_vendors', JSON.stringify(sampleVendors));
    localStorage.setItem('emlak_personnel', JSON.stringify(samplePersonnel));
    localStorage.setItem('emlak_transactions', JSON.stringify(sampleTransactions));
    localStorage.setItem('emlak_expenses', JSON.stringify(sampleExpenses));
    localStorage.setItem('emlak_salary_payments', JSON.stringify(sampleSalaryPayments));
    
    window.location.reload();
  };

  const handleExportData = () => {
    const data = {
      consultants: JSON.parse(localStorage.getItem('emlak_consultants') || '[]'),
      transactions: JSON.parse(localStorage.getItem('emlak_transactions') || '[]'),
      expenses: JSON.parse(localStorage.getItem('emlak_expenses') || '[]'),
      personnel: JSON.parse(localStorage.getItem('emlak_personnel') || '[]'),
      salaryPayments: JSON.parse(localStorage.getItem('emlak_salary_payments') || '[]'),
      logs: JSON.parse(localStorage.getItem('emlak_logs') || '[]'),
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `emlak-yedek-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getActionBadge = (action: string) => {
    switch(action) {
      case 'CREATE': return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700">YENİ KAYIT</span>;
      case 'UPDATE': return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700">DÜZENLEME</span>;
      case 'DELETE': return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700">SİLME</span>;
      case 'APPROVE': return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700">ONAY</span>;
      default: return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-700">{action}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
            <h1 className="text-2xl font-bold text-slate-900">Ayarlar</h1>
            <p className="text-slate-500">Uygulama yapılandırması ve veri yönetimi.</p>
        </div>
        <div className="flex bg-white rounded-lg p-1 border border-slate-200">
             <button
                onClick={() => setActiveTab('GENERAL')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'GENERAL' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
             >
                Genel Ayarlar
             </button>
             {currentUser.role === UserRole.PARTNER && (
                <button
                    onClick={() => setActiveTab('SECURITY')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'SECURITY' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                >
                    <ShieldAlert size={14} />
                    Güvenlik & Log
                </button>
             )}
        </div>
      </div>

      {activeTab === 'GENERAL' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                <Database size={20} className="text-indigo-600" />
                <h3 className="font-semibold text-slate-800">Veri Yönetimi</h3>
            </div>
            <div className="p-6 space-y-6">
                <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                    <Download size={24} />
                </div>
                <div className="flex-1">
                    <h4 className="font-medium text-slate-900">Veri Yedekleme</h4>
                    <p className="text-sm text-slate-500 mb-3">
                    Tüm verileri (danışmanlar, işlemler, giderler) JSON formatında yedekleyin.
                    </p>
                    <button 
                    onClick={handleExportData}
                    className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 hover:text-blue-600 transition-colors text-sm flex items-center gap-2 shadow-sm"
                    >
                    <Save size={16} />
                    Yedeği İndir
                    </button>
                </div>
                </div>

                <div className="border-t border-slate-100 my-4"></div>

                <div className="flex items-start gap-4">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                    <Upload size={24} />
                </div>
                <div className="flex-1">
                    <h4 className="font-medium text-slate-900">Örnek Veri Yükle</h4>
                    <p className="text-sm text-slate-500 mb-3">
                    Sistemi test etmek için örnek danışman, işlem ve gider verileri yükler. (Mevcut veriler silinir)
                    </p>
                    <button 
                    onClick={handleLoadSampleData}
                    className="px-4 py-2 bg-emerald-50 border border-emerald-100 text-emerald-700 font-medium rounded-lg hover:bg-emerald-100 transition-colors text-sm flex items-center gap-2 shadow-sm"
                    >
                    <Upload size={16} />
                    Örnek Verileri Yükle
                    </button>
                </div>
                </div>

                <div className="border-t border-slate-100 my-4"></div>

                <div className="flex items-start gap-4">
                <div className="p-3 bg-red-50 text-red-600 rounded-lg">
                    <Trash2 size={24} />
                </div>
                <div className="flex-1">
                    <h4 className="font-medium text-slate-900">Sistemi Sıfırla</h4>
                    <p className="text-sm text-slate-500 mb-3">
                    Tüm kayıtlı verileri ve kullanıcı hesaplarını siler.
                    </p>
                    <button 
                    onClick={handleResetData}
                    className="px-4 py-2 bg-red-50 border border-red-100 text-red-700 font-medium rounded-lg hover:bg-red-100 transition-colors text-sm flex items-center gap-2 shadow-sm"
                    >
                    <RefreshCw size={16} />
                    Fabrika Ayarlarına Dön
                    </button>
                </div>
                </div>
            </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-fit">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                <Info size={20} className="text-slate-600" />
                <h3 className="font-semibold text-slate-800">Sistem Bilgisi</h3>
            </div>
            <div className="p-6 space-y-4">
                <div className="flex justify-between py-2 border-b border-slate-50">
                    <span className="text-slate-500 text-sm">Uygulama</span>
                    <span className="font-medium text-slate-900">{APP_NAME}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-50">
                    <span className="text-slate-500 text-sm">Sürüm</span>
                    <span className="font-mono text-sm font-bold text-slate-700">v1.0.1 (Production)</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-50">
                    <span className="text-slate-500 text-sm">Veri Saklama</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">
                        Local Browser Storage
                    </span>
                </div>
            </div>
            </div>
        </div>
      )}

      {activeTab === 'SECURITY' && (
         <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-300">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <History size={20} className="text-rose-600" />
                    <h3 className="font-semibold text-slate-800">Audit Logs</h3>
                </div>
                <button onClick={loadLogs} className="p-1.5 text-slate-500 hover:text-indigo-600 transition-all"><RefreshCw size={16} /></button>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-200">
                            <th className="px-6 py-3 font-semibold text-slate-700 whitespace-nowrap">Tarih</th>
                            <th className="px-6 py-3 font-semibold text-slate-700 whitespace-nowrap">Kullanıcı</th>
                            <th className="px-6 py-3 font-semibold text-slate-700 whitespace-nowrap">Eylem</th>
                            <th className="px-6 py-3 font-semibold text-slate-700 whitespace-nowrap">Açıklama</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {logs.length > 0 ? (
                            logs.map(log => (
                                <tr key={log.id} className="hover:bg-slate-50/50">
                                    <td className="px-6 py-3 text-slate-500 text-xs font-mono">{new Date(log.date).toLocaleString('tr-TR')}</td>
                                    <td className="px-6 py-3 font-medium text-slate-900">{log.user}</td>
                                    <td className="px-6 py-3">{getActionBadge(log.action)}</td>
                                    <td className="px-6 py-3 text-slate-600">{log.description}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-slate-500 italic">Kayıt bulunamadı.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
         </div>
      )}

      {/* Modals */}
      <Modal isOpen={isResetModalOpen} onClose={() => setIsResetModalOpen(false)} title="Sistemi Sıfırla">
        <div className="space-y-4">
          <div className="p-4 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3 text-red-800">
            <AlertTriangle size={24} className="shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold mb-1">DİKKAT: Geri Alınamaz İşlem</h4>
              <p className="text-sm">Tüm veriler (işlemler, danışmanlar, giderler vb.) VE KULLANICI HESAPLARI kalıcı olarak silinecektir. Sistemden çıkış yapılacaktır.</p>
            </div>
          </div>
          <p className="text-slate-600">Emin misiniz?</p>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={() => setIsResetModalOpen(false)}
              className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
            >
              İptal
            </button>
            <button
              onClick={confirmResetData}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-bold shadow-md transition-all active:scale-95 flex items-center gap-2"
            >
              <Trash2 size={18} />
              Evet, Tüm Verileri Sil
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isLoadSampleModalOpen} onClose={() => setIsLoadSampleModalOpen(false)} title="Örnek Veri Yükle">
        <div className="space-y-4">
          <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg flex items-start gap-3 text-amber-800">
            <AlertTriangle size={24} className="shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold mb-1">DİKKAT: Veri Kaybı Riski</h4>
              <p className="text-sm">Mevcut verileriniz silinecek ve yerine örnek veriler yüklenecektir. Bu işlem geri alınamaz.</p>
            </div>
          </div>
          <p className="text-slate-600">Emin misiniz?</p>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={() => setIsLoadSampleModalOpen(false)}
              className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
            >
              İptal
            </button>
            <button
              onClick={confirmLoadSampleData}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-bold shadow-md transition-all active:scale-95 flex items-center gap-2"
            >
              <Upload size={18} />
              Evet, Örnek Verileri Yükle
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Settings;
