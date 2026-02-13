
import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { Building2, Lock, User as UserIcon, AlertCircle, LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);



  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login({ username, password });
    } catch (err: any) {
      if (err.response?.status === 400) { // Bad Request usually means invalid credentials
        setError('Kullanıcı adı veya şifre hatalı.');
      } else {
        setError('Giriş yapılırken bir hata oluştu. Sunucuya erişilemiyor olabilir.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        {/* Modern Header */}
        <div className="bg-slate-900 p-10 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500"></div>
          <div className="w-20 h-20 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl transform transition-transform hover:scale-105">
            <Building2 className="text-white w-10 h-10" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Emlak Ofisi YS</h1>
          <p className="text-slate-400 text-sm mt-2 font-medium">Kurumsal Muhasebe Yönetimi</p>
        </div>

        {/* Login Form Container */}
        <div className="p-10">
          <div className="flex items-center gap-2 mb-8 text-slate-800">
            <LogIn size={20} className="text-indigo-600" />
            <span className="font-bold text-lg">Yetkili Girişi</span>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-xs font-bold animate-in fade-in slide-in-from-top-2">
                <AlertCircle size={18} className="shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Kullanıcı Adı</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                  <UserIcon size={20} />
                </div>
                <input
                  type="text"
                  required
                  autoFocus
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-12 pr-4 py-4 bg-white text-slate-900 border-2 border-slate-100 rounded-2xl focus:border-indigo-600 focus:ring-0 outline-none transition-all font-medium placeholder:text-slate-300"
                  placeholder="Kullanıcı adınız"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Şifre</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                  <Lock size={20} />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-12 pr-4 py-4 bg-white text-slate-900 border-2 border-slate-100 rounded-2xl focus:border-indigo-600 focus:ring-0 outline-none transition-all font-medium placeholder:text-slate-300"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`
                w-full py-4 bg-slate-900 hover:bg-black text-white font-black rounded-2xl shadow-xl shadow-slate-200 transition-all active:scale-[0.98] mt-4 flex items-center justify-center gap-2 text-lg
                ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}
              `}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Giriş Yapılıyor...</span>
                </>
              ) : (
                'Sisteme Eriş'
              )}
            </button>
          </form>

          <div className="mt-10 pt-6 border-t border-slate-50">
            <p className="text-center text-[10px] text-slate-400 leading-relaxed font-bold uppercase tracking-tighter">
              Bu sistem sadece yetkili personel içindir. <br /> Tüm işlemler kayıt altına alınmaktadır.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
