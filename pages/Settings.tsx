
import React, { useState, useEffect, useCallback } from 'react';
import { Trash2, Download, Save, RefreshCw, Database, Info, ShieldAlert, History, Lock, FileText } from 'lucide-react';
import { APP_NAME } from '../constants';
import { User, UserRole, SystemLog } from '../types';

import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';

const Settings: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { logs, refreshLogs } = useData();
  const [activeTab, setActiveTab] = useState<'GENERAL' | 'SECURITY'>('GENERAL');

  useEffect(() => {
    if (activeTab === 'SECURITY') {
      refreshLogs();
    }
  }, [activeTab, refreshLogs]);

  const handleResetData = () => {
    if (window.confirm('DİKKAT: Tüm veriler VE KULLANICI HESAPLARI silinecektir. Sistemden çıkış yapılacaktır. Emin misiniz?')) {
      localStorage.removeItem('emlak_consultants');
      localStorage.removeItem('emlak_transactions');
      localStorage.removeItem('emlak_expenses');
      localStorage.removeItem('emlak_personnel');
      localStorage.removeItem('emlak_salary_payments');
      localStorage.removeItem('emlak_logs');
      localStorage.removeItem('emlak_auth_users'); // Kullanıcıları da siliyoruz
      localStorage.removeItem('emlak_logs');
      localStorage.removeItem('emlak_user'); // Mevcut oturumu kapatıyoruz

      logout(); // Context logout temizliği de yapsın

      alert('Tüm veriler temizlendi. Uygulama yeniden başlatılıyor...');
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
    a.download = `emlak-yedek-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getActionBadge = (action: string) => {
    switch (action) {
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
          {currentUser?.role === UserRole.PARTNER && (
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
            <button onClick={refreshLogs} className="p-1.5 text-slate-500 hover:text-indigo-600 transition-all"><RefreshCw size={16} /></button>
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
                      <td className="px-6 py-3 text-slate-600">{log.details}</td>
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
    </div>
  );
};

export default Settings;
