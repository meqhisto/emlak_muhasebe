import React from 'react';
import { Trash2, Download, Save, RefreshCw, Database, Info, ShieldAlert } from 'lucide-react';
import { APP_NAME } from '../constants';

const Settings: React.FC = () => {
  
  const handleResetData = () => {
    if (window.confirm('DİKKAT: Tüm veriler silinecek ve uygulama varsayılan (demo) ayarlara dönecektir. Bu işlem geri alınamaz. Emin misiniz?')) {
      // Clear all specific keys
      localStorage.removeItem('emlak_consultants');
      localStorage.removeItem('emlak_transactions');
      localStorage.removeItem('emlak_expenses');
      localStorage.removeItem('emlak_personnel');
      localStorage.removeItem('emlak_salary_payments');
      // Do not clear 'emlak_user' to keep session active, or clear it to force relogin. 
      // Let's keep session for better UX.
      
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Ayarlar</h1>
        <p className="text-slate-500">Uygulama yapılandırması ve veri yönetimi.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Data Management Card */}
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

        {/* App Info Card */}
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
              Bu uygulama, emlak ofisi muhasebe süreçlerini dijitalleştirmek amacıyla geliştirilmiştir. Veriler tarayıcınızın yerel hafızasında (LocalStorage) saklanmaktadır. Tarayıcı geçmişini temizlemeniz durumunda veriler kaybolabilir. Lütfen düzenli yedek alınız.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;