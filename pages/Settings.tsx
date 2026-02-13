import React, { useState, useEffect, useCallback } from 'react';
import { Trash2, Download, Save, RefreshCw, Database, Info, ShieldAlert, History, Lock, FileText } from 'lucide-react';
import { APP_NAME } from '../constants';
import { User, UserRole, SystemLog } from '../types';

interface SettingsProps {
  currentUser: User;
}

const Settings: React.FC<SettingsProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<'GENERAL' | 'SECURITY'>('GENERAL');
  const [logs, setLogs] = useState<SystemLog[]>([]);

  const loadLogs = useCallback(() => {
    try {
      const storedLogs = localStorage.getItem('emlak_logs');
      if (storedLogs) {
        const parsedLogs = JSON.parse(storedLogs);
        if (Array.isArray(parsedLogs)) {
          // Newest first
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
    if (window.confirm('DİKKAT: Tüm veriler silinecek ve uygulama varsayılan (demo) ayarlara dönecektir. Bu işlem geri alınamaz. Emin misiniz?')) {
      localStorage.removeItem('emlak_consultants');
      localStorage.removeItem('emlak_transactions');
      localStorage.removeItem('emlak_expenses');
      localStorage.removeItem('emlak_personnel');
      localStorage.removeItem('emlak_salary_payments');
      localStorage.removeItem('emlak_logs');
      
      alert('Veriler başarıyla sıfırlandı. Sayfa yenileniyor...');
      window.location.reload();
    }
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
    a.download = `emlak-ofisi-yedek-${new Date().toISOString().split('T')[0]}.json`;
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
      {/* Header */}
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
                    Tüm veritabanını (danışmanlar, işlemler, giderler, personel) JSON formatında bilgisayarınıza indirin.
                    </p>
                    <button 
                    onClick={handleExportData}
                    className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 hover:text-blue-600 transition-colors text-sm flex items-center gap-2"
                    >
                    <Save size={16} />
                    Yedeği İndir
                    </button>
                </div>
                </div>

                <div className="border-t border-slate-100 my-4"></div>

                <div className="flex items-start gap-4">
                <div className="p-3 bg-red-50 text-red-600 rounded-lg">
                    <Trash2 size={24} />
                </div>
                <div className="flex-1">
                    <h4 className="font-medium text-slate-900">Fabrika Ayarlarına Dön</h4>
                    <p className="text-sm text-slate-500 mb-3">
                    Tüm kayıtlı verileri siler ve uygulamayı ilk yüklenen demo verilerine döndürür. Bu işlem geri alınamaz.
                    </p>
                    <button 
                    onClick={handleResetData}
                    className="px-4 py-2 bg-red-50 border border-red-100 text-red-700 font-medium rounded-lg hover:bg-red-100 transition-colors text-sm flex items-center gap-2"
                    >
                    <RefreshCw size={16} />
                    Verileri Sıfırla
                    </button>
                </div>
                </div>
            </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-fit">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                <Info size={20} className="text-slate-600" />
                <h3 className="font-semibold text-slate-800">Uygulama Hakkında</h3>
            </div>
            <div className="p-6 space-y-4">
                <div className="flex justify-between py-2 border-b border-slate-50">
                    <span className="text-slate-500 text-sm">Uygulama Adı</span>
                    <span className="font-medium text-slate-900">{APP_NAME}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-50">
                    <span className="text-slate-500 text-sm">Sürüm</span>
                    <span className="font-mono text-sm font-bold text-slate-700">v1.0.0 (Faz 7 Release)</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-50">
                    <span className="text-slate-500 text-sm">Durum</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">
                        Canlı (Production)
                    </span>
                </div>
                <div className="mt-4 p-4 bg-slate-50 rounded-lg text-xs text-slate-500 leading-relaxed">
                <p className="font-bold text-slate-700 mb-1">Geliştirici Notu:</p>
                Bu uygulama, emlak ofisi muhasebe süreçlerini dijitalleştirmek amacıyla geliştirilmiştir. Veriler tarayıcınızın yerel hafızasında (LocalStorage) saklanmaktadır.
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
                    <h3 className="font-semibold text-slate-800">İşlem Kütüğü (Audit Logs)</h3>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                      onClick={loadLogs}
                      className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all"
                      title="Logları Yenile"
                    >
                      <RefreshCw size={16} />
                    </button>
                    <div className="flex items-center gap-2 text-xs text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">
                        <Lock size={12} />
                        Salt Okunur
                    </div>
                </div>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-200">
                            <th className="px-6 py-3 font-semibold text-slate-700 w-32">Tarih</th>
                            <th className="px-6 py-3 font-semibold text-slate-700 w-32">Kullanıcı</th>
                            <th className="px-6 py-3 font-semibold text-slate-700 w-24">Eylem</th>
                            <th className="px-6 py-3 font-semibold text-slate-700 w-24">Modül</th>
                            <th className="px-6 py-3 font-semibold text-slate-700">Açıklama</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {logs.length > 0 ? (
                            logs.map(log => (
                                <tr key={log.id} className="hover:bg-slate-50/50">
                                    <td className="px-6 py-3 text-slate-500 text-xs font-mono whitespace-nowrap">
                                        {new Date(log.date).toLocaleString('tr-TR')}
                                    </td>
                                    <td className="px-6 py-3 font-medium text-slate-900">
                                        <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                                                {log.user.charAt(0).toUpperCase()}
                                            </div>
                                            {log.user}
                                        </div>
                                    </td>
                                    <td className="px-6 py-3">
                                        {getActionBadge(log.action)}
                                    </td>
                                    <td className="px-6 py-3 text-xs font-medium text-slate-500 uppercase">
                                        {log.module}
                                    </td>
                                    <td className="px-6 py-3 text-slate-600">
                                        {log.description}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                    <FileText size={48} className="mx-auto text-slate-200 mb-2" />
                                    <p>Henüz kayıtlı bir sistem logu bulunmamaktadır.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
         </div>
      )}
    </div>
  );
};

export default Settings;