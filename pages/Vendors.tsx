
import React, { useState, useEffect } from 'react';
import { Vendor, Expense, User, SystemLog, ExpenseCategory } from '../types';
// import { useSystemLog } from '../hooks/useSystemLog';
import { INITIAL_VENDORS } from '../constants';
import Modal from '../components/Modal';
import { Building, Plus, Search, Phone, Mail, FileText, User as UserIcon, AlertCircle, Calendar, Receipt, ChevronDown, ChevronUp } from 'lucide-react';

import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';

const Vendors: React.FC = () => {
  const { currentUser } = useAuth();
  const { vendors, expenses, addVendor, updateVendor } = useData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedVendorId, setExpandedVendorId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<Vendor>>({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    taxNumber: '',
    taxOffice: '',
    category: ExpenseCategory.OTHER,
  });

  // State logic replaced by DataContext

  // logAction function removed in favor of useSystemLog hook

  const getUnpaidExpensesByVendor = (vendorId: string) => {
    return (expenses || []).filter(e => e.vendorId === vendorId && !e.isPaid);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
  };

  const handleOpenModal = (vendor?: Vendor) => {
    if (vendor) {
      setEditingId(vendor.id);
      setFormData({ ...vendor });
    } else {
      setEditingId(null);
      setFormData({ name: '', contactPerson: '', phone: '', email: '', category: ExpenseCategory.OTHER });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      const updatedVendor = { ...vendors?.find(v => v.id === editingId)!, ...formData } as Vendor;
      updateVendor(updatedVendor.id, updatedVendor);
    } else {
      const newVendor: Vendor = { id: Date.now().toString(), ...formData as Omit<Vendor, 'id'> };
      addVendor(newVendor);
    }
    setIsModalOpen(false);
  };

  const toggleExpand = (vendorId: string) => {
    setExpandedVendorId(expandedVendorId === vendorId ? null : vendorId);
  };

  const filteredVendors = (vendors || []).filter(v => v.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Firmalar & Cariler</h1>
          <p className="text-slate-500">Hizmet alınan tedarikçileri ve borç bakiyelerini yönetin.</p>
        </div>
        <button onClick={() => handleOpenModal()} className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg font-medium shadow-sm transition-colors">
          <Plus size={20} />
          <span>Firma Ekle</span>
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 text-slate-400" size={20} />
        <input
          type="text"
          placeholder="Firma adı ile ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white text-slate-900 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
        {filteredVendors.map(vendor => {
          const unpaidItems = getUnpaidExpensesByVendor(vendor.id);
          const balance = unpaidItems.reduce((acc, curr) => acc + curr.amount, 0);
          const isExpanded = expandedVendorId === vendor.id;

          return (
            <div key={vendor.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col">
              <div className="p-6 pb-4">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-slate-50 rounded-xl text-slate-600">
                    <Building size={24} />
                  </div>
                  {balance > 0 && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-full border border-orange-100 uppercase tracking-tighter">
                      <AlertCircle size={12} /> {unpaidItems.length} Bekleyen Fatura
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-slate-900 truncate mb-1">{vendor.name}</h3>
                <p className="text-xs text-slate-500 flex items-center gap-1 mb-4">
                  <UserIcon size={12} /> {vendor.contactPerson || 'Yetkili belirtilmedi'}
                </p>

                <div className="space-y-2 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-slate-400" />
                    <span>{vendor.phone}</span>
                  </div>
                  {vendor.email && (
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="text-slate-400" />
                      <span>{vendor.email}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Açık Hesap Detayları Bölümü */}
              {balance > 0 && (
                <div className="px-6 py-2">
                  <button
                    onClick={() => toggleExpand(vendor.id)}
                    className="w-full flex items-center justify-between py-2 px-3 bg-slate-50 hover:bg-slate-100 rounded-lg text-xs font-bold text-slate-600 transition-colors"
                  >
                    <span className="flex items-center gap-2"><Receipt size={14} className="text-orange-500" /> AÇIK HESAP DETAYI</span>
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>

                  {isExpanded && (
                    <div className="mt-2 space-y-2 animate-in slide-in-from-top-2 duration-200 overflow-hidden">
                      <div className="bg-slate-50/50 rounded-lg border border-slate-100 overflow-hidden">
                        <table className="w-full text-[11px] text-left">
                          <thead className="bg-slate-100/50 text-slate-400 uppercase font-black">
                            <tr>
                              <th className="px-3 py-2">Tarih</th>
                              <th className="px-3 py-2">Açıklama</th>
                              <th className="px-3 py-2 text-right">Tutar</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {unpaidItems.map(item => (
                              <tr key={item.id} className="text-slate-600">
                                <td className="px-3 py-2 whitespace-nowrap">{new Date(item.date).toLocaleDateString('tr-TR')}</td>
                                <td className="px-3 py-2 truncate max-w-[120px]">{item.description}</td>
                                <td className="px-3 py-2 text-right font-bold text-slate-900">{formatCurrency(item.amount)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between mt-auto">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Toplam Bakiye</p>
                  <p className={`text-xl font-black ${balance > 0 ? 'text-orange-600' : 'text-slate-400'}`}>
                    {formatCurrency(balance)}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleOpenModal(vendor)}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent hover:border-indigo-100"
                    title="Firma Bilgilerini Düzenle"
                  >
                    <FileText size={20} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Firma Düzenle' : 'Yeni Firma Kaydı'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Firma Adı</label>
            <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Yetkili Kişi</label>
              <input type="text" value={formData.contactPerson} onChange={e => setFormData({ ...formData, contactPerson: e.target.value })} className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Telefon</label>
              <input required type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">E-Posta</label>
            <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Vergi No</label>
              <input type="text" value={formData.taxNumber} onChange={e => setFormData({ ...formData, taxNumber: e.target.value })} className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Vergi Dairesi</label>
              <input type="text" value={formData.taxOffice} onChange={e => setFormData({ ...formData, taxOffice: e.target.value })} className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          <div className="pt-4 flex gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium">İptal</button>
            <button type="submit" className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold">Kaydet</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Vendors;
