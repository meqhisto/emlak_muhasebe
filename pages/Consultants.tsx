import React, { useState, useEffect } from 'react';
import { Consultant } from '../types';
import { INITIAL_CONSULTANTS } from '../constants';
import Modal from '../components/Modal';
import { Plus, Search, Edit2, Phone, Calendar, Percent, UserCheck, UserX } from 'lucide-react';

const Consultants: React.FC = () => {
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [formData, setFormData] = useState<Partial<Consultant>>({
    fullName: '',
    phoneNumber: '',
    commissionRate: 50,
    startDate: new Date().toISOString().split('T')[0],
    isActive: true,
  });

  // Load data on mount
  useEffect(() => {
    const stored = localStorage.getItem('emlak_consultants');
    if (stored) {
      setConsultants(JSON.parse(stored));
    } else {
      setConsultants(INITIAL_CONSULTANTS);
      localStorage.setItem('emlak_consultants', JSON.stringify(INITIAL_CONSULTANTS));
    }
  }, []);

  // Save data on change
  useEffect(() => {
    if (consultants.length > 0) {
      localStorage.setItem('emlak_consultants', JSON.stringify(consultants));
    }
  }, [consultants]);

  const handleOpenModal = (consultant?: Consultant) => {
    if (consultant) {
      setEditingId(consultant.id);
      setFormData({ ...consultant });
    } else {
      setEditingId(null);
      setFormData({
        fullName: '',
        phoneNumber: '',
        commissionRate: 50,
        startDate: new Date().toISOString().split('T')[0],
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      // Update existing
      setConsultants(prev => prev.map(c => 
        c.id === editingId ? { ...c, ...formData } as Consultant : c
      ));
    } else {
      // Create new
      const newConsultant: Consultant = {
        id: Date.now().toString(),
        ...formData as Omit<Consultant, 'id'>
      };
      setConsultants(prev => [...prev, newConsultant]);
    }
    handleCloseModal();
  };

  const filteredConsultants = consultants.filter(c => 
    c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phoneNumber.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Danışman Yönetimi</h1>
          <p className="text-slate-500">Ekip üyelerini ve komisyon oranlarını yönetin.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
        >
          <Plus size={20} />
          <span>Yeni Danışman</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <Search size={20} />
        </div>
        <input
          type="text"
          placeholder="İsim veya telefon ile ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-shadow"
        />
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredConsultants.map((consultant) => (
          <div 
            key={consultant.id} 
            className={`
              group relative bg-white rounded-xl border transition-all duration-200 hover:shadow-md
              ${consultant.isActive ? 'border-slate-200' : 'border-slate-100 bg-slate-50 opacity-75'}
            `}
          >
            {/* Status Badge */}
            <div className="absolute top-4 right-4">
              <span className={`
                inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                ${consultant.isActive 
                  ? 'bg-green-50 text-green-700 border-green-100' 
                  : 'bg-slate-100 text-slate-600 border-slate-200'}
              `}>
                {consultant.isActive ? 'Aktif' : 'Pasif'}
              </span>
            </div>

            <div className="p-6">
              {/* Profile Header */}
              <div className="flex items-start gap-4 mb-6">
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold
                  ${consultant.isActive 
                    ? 'bg-indigo-50 text-indigo-600' 
                    : 'bg-slate-200 text-slate-500'}
                `}>
                  {consultant.fullName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 line-clamp-1">{consultant.fullName}</h3>
                  <div className="flex items-center gap-1.5 text-slate-500 text-sm mt-1">
                    <Calendar size={14} />
                    <span>{new Date(consultant.startDate).toLocaleDateString('tr-TR')}</span>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone size={16} className="text-slate-400" />
                    <span>Telefon</span>
                  </div>
                  <span className="font-medium text-slate-900">{consultant.phoneNumber}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Percent size={16} className="text-slate-400" />
                    <span>Komisyon Oranı</span>
                  </div>
                  <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                    %{consultant.commissionRate}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-6 pt-4 border-t border-slate-100">
                <button
                  onClick={() => handleOpenModal(consultant)}
                  className="w-full flex items-center justify-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600 py-2 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <Edit2 size={16} />
                  Profili Düzenle
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Empty State */}
        {filteredConsultants.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <UserX size={48} className="text-slate-300 mb-4" />
            <p className="font-medium">Kayıtlı danışman bulunamadı.</p>
            <p className="text-sm mt-1">Yeni bir danışman ekleyerek başlayın.</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingId ? 'Danışman Düzenle' : 'Yeni Danışman Ekle'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Ad Soyad</label>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={e => setFormData({...formData, fullName: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              placeholder="Örn: Ahmet Yılmaz"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Telefon</label>
              <input
                type="tel"
                required
                value={formData.phoneNumber}
                onChange={e => setFormData({...formData, phoneNumber: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                placeholder="05XX XXX XX XX"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Komisyon Oranı (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                required
                value={formData.commissionRate}
                onChange={e => setFormData({...formData, commissionRate: Number(e.target.value)})}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">İşe Başlama Tarihi</label>
            <input
              type="date"
              required
              value={formData.startDate}
              onChange={e => setFormData({...formData, startDate: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            />
          </div>

          {editingId && (
            <div className="pt-2">
              <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                <div className={`
                  w-5 h-5 rounded flex items-center justify-center border
                  ${formData.isActive ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 bg-white'}
                `}>
                  {formData.isActive && <UserCheck size={14} className="text-white" />}
                </div>
                <input
                  type="checkbox"
                  className="hidden"
                  checked={formData.isActive}
                  onChange={e => setFormData({...formData, isActive: e.target.checked})}
                />
                <div className="flex-1">
                  <span className="text-sm font-medium text-slate-700">Danışman Aktif</span>
                  <p className="text-xs text-slate-500">Pasif duruma alınan danışmanlar yeni işlemlerde seçilemez.</p>
                </div>
              </label>
            </div>
          )}

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={handleCloseModal}
              className="flex-1 px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 font-medium rounded-lg transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 text-white bg-indigo-600 hover:bg-indigo-700 font-medium rounded-lg transition-colors"
            >
              {editingId ? 'Değişiklikleri Kaydet' : 'Danışmanı Ekle'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Consultants;