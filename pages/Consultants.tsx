
import React, { useState, useEffect } from 'react';
import { Consultant, User, SystemLog } from '../types';
// import { useSystemLog } from '../hooks/useSystemLog';
import { INITIAL_CONSULTANTS } from '../constants';
import Modal from '../components/Modal';
import { Plus, Search, Edit2, Phone, Calendar, Percent, UserCheck, UserX } from 'lucide-react';

import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';

const Consultants: React.FC = () => {
  const { currentUser } = useAuth();
  const { consultants, addConsultant, updateConsultant } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState<Partial<Consultant>>({
    fullName: '',
    phoneNumber: '',
    commissionRate: 50,
    startDate: new Date().toISOString().split('T')[0],
    isActive: true,
  });

  // State logic replaced by DataContext

  // logAction function removed in favor of useSystemLog hook

  const handleOpenModal = (consultant?: Consultant) => {
    if (consultant) {
      setEditingId(consultant.id);
      setFormData({ ...consultant });
    } else {
      setEditingId(null);
      setFormData({ fullName: '', phoneNumber: '', commissionRate: 50, startDate: new Date().toISOString().split('T')[0], isActive: true });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      const updatedConsultant = { ...consultants?.find(c => c.id === editingId)!, ...formData } as Consultant;
      updateConsultant(updatedConsultant);
    } else {
      const newConsultant: Consultant = { id: Date.now().toString(), ...formData as Omit<Consultant, 'id'> };
      addConsultant(newConsultant);
    }
    setIsModalOpen(false);
  };

  const filteredConsultants = consultants?.filter(c => c.fullName.toLowerCase().includes(searchTerm.toLowerCase())) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Danışman Yönetimi</h1>
          <p className="text-slate-500">Ekip üyelerini yönetin.</p>
        </div>
        <button onClick={() => handleOpenModal()} className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg font-medium">
          <Plus size={20} />
          <span>Yeni Danışman</span>
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 text-slate-400" size={20} />
        <input
          type="text"
          placeholder="Ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white text-slate-900 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredConsultants.map(c => (
          <div key={c.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900">{c.fullName}</h3>
            <p className="text-sm text-slate-500 mt-1">{c.phoneNumber}</p>
            <div className="mt-4 pt-4 border-t flex justify-between items-center">
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">%{c.commissionRate} Pay</span>
              <button onClick={() => handleOpenModal(c)} className="text-slate-400 hover:text-indigo-600"><Edit2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Danışman Düzenle' : 'Yeni Danışman'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Ad Soyad</label>
            <input required type="text" value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Telefon</label>
              <input required type="tel" value={formData.phoneNumber} onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })} className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg outline-none" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Komisyon Oranı (%)</label>
              <input required type="number" value={formData.commissionRate} onChange={e => setFormData({ ...formData, commissionRate: Number(e.target.value) })} className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg outline-none" />
            </div>
          </div>
          <div className="pt-4 flex gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg">İptal</button>
            <button type="submit" className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold">Kaydet</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Consultants;
