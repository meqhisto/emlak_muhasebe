import React from 'react';
import { X, Printer, CheckCircle, FileSignature } from 'lucide-react';
import { Transaction, Consultant, PaymentStatus, TransactionType } from '../types';
import { APP_NAME } from '../constants';

interface PaymentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  consultant: Consultant | null;
  onConfirmPayment: (id: string) => void;
}

const PaymentFormModal: React.FC<PaymentFormModalProps> = ({ 
  isOpen, 
  onClose, 
  transaction, 
  consultant,
  onConfirmPayment 
}) => {
  if (!isOpen || !transaction || !consultant) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
  };

  const handlePrint = () => {
    window.print();
  };

  const isPaid = transaction.paymentStatus === PaymentStatus.PAID;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white w-full max-w-3xl shadow-2xl rounded-xl overflow-hidden animate-in zoom-in-95 duration-200 print:shadow-none print:w-full print:max-w-none print:rounded-none">
        
        {/* Modal Controls - Hidden when printing */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50 print:hidden">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <FileSignature size={18} className="text-indigo-600" />
            Hakediş Formu Görüntüleme
          </h3>
          <div className="flex items-center gap-2">
            <button 
              onClick={handlePrint}
              className="px-3 py-1.5 text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 text-sm font-medium flex items-center gap-2 transition-colors"
            >
              <Printer size={16} /> Yazdır
            </button>
            <button 
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* --- THE A4 FORM CONTENT --- */}
        <div className="p-8 sm:p-12 print:p-0">
          <div className="border-2 border-slate-800 p-8 min-h-[800px] relative flex flex-col justify-between print:border-none print:min-h-0">
            
            {/* Watermark for Status */}
            {isPaid ? (
               <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -rotate-45 pointer-events-none opacity-10 border-4 border-green-600 text-green-600 text-8xl font-black uppercase p-4 rounded-xl print:opacity-5">
                 ÖDENDİ
               </div>
            ) : (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -rotate-45 pointer-events-none opacity-5 border-4 border-slate-400 text-slate-400 text-6xl font-black uppercase p-4 rounded-xl">
                 ÖNİZLEME
               </div>
            )}

            {/* Header */}
            <div>
              <div className="flex justify-between items-start border-b-2 border-slate-800 pb-6 mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{APP_NAME}</h1>
                  <p className="text-slate-500 text-sm mt-1">Emlak Danışmanlığı ve Yatırım Hizmetleri</p>
                </div>
                <div className="text-right">
                  <h2 className="text-xl font-bold text-slate-800 uppercase tracking-widest">Hakediş Formu</h2>
                  <p className="text-slate-500 text-sm mt-1">No: #{transaction.id}</p>
                  <p className="text-slate-500 text-sm">Tarih: {new Date().toLocaleDateString('tr-TR')}</p>
                </div>
              </div>

              {/* Consultant Info Section */}
              <div className="mb-8 bg-slate-50 p-6 rounded-lg border border-slate-200 print:bg-white print:border-slate-300">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">Danışman Bilgileri</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <span className="block text-xs text-slate-500 uppercase">Ad Soyad</span>
                    <span className="block text-lg font-bold text-slate-900">{consultant.fullName}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-slate-500 uppercase">Hakediş Oranı</span>
                    <span className="block text-lg font-bold text-indigo-600">%{consultant.commissionRate}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-slate-500 uppercase">İletişim</span>
                    <span className="block text-slate-900">{consultant.phoneNumber}</span>
                  </div>
                </div>
              </div>

              {/* Transaction Details Section */}
              <div className="mb-8">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">İşlem Detayları</h3>
                <table className="w-full text-left">
                  <thead className="bg-slate-100 text-slate-600 text-sm uppercase print:bg-gray-100">
                    <tr>
                      <th className="px-4 py-3">Açıklama</th>
                      <th className="px-4 py-3">Tür</th>
                      <th className="px-4 py-3 text-right">Tutar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="px-4 py-4">
                        <p className="font-bold text-slate-900">{transaction.propertyName}</p>
                        <p className="text-sm text-slate-500">Müşteri: {transaction.customerName}</p>
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-block px-2 py-1 bg-slate-100 rounded text-xs font-semibold uppercase">
                          {transaction.type === TransactionType.SALE ? 'Satış' : 'Kiralama'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right font-medium text-slate-900">
                        {formatCurrency(transaction.totalRevenue)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Calculation Breakdown */}
              <div className="flex justify-end mb-12">
                <div className="w-1/2 space-y-3">
                  <div className="flex justify-between text-slate-600">
                    <span>Toplam Hizmet Bedeli (Ciro):</span>
                    <span className="font-medium">{formatCurrency(transaction.totalRevenue)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Ofis Payı (%{100 - consultant.commissionRate}):</span>
                    <span>{formatCurrency(transaction.officeRevenue)}</span>
                  </div>
                  <div className="border-t-2 border-slate-800 pt-3 flex justify-between items-center text-lg">
                    <span className="font-bold text-slate-900">Ödenecek Tutar:</span>
                    <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded print:bg-transparent print:text-black">
                      {formatCurrency(transaction.consultantShare)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Signature Section */}
            <div className="mt-12 pt-8 border-t border-slate-200">
              <div className="grid grid-cols-2 gap-12 text-center">
                <div>
                  <p className="font-bold text-slate-900 mb-16">Danışman</p>
                  <div className="border-t border-slate-400 w-2/3 mx-auto pt-2">
                    <p className="text-sm text-slate-500">{consultant.fullName}</p>
                    <p className="text-xs text-slate-400">İmza</p>
                  </div>
                </div>
                <div>
                  <p className="font-bold text-slate-900 mb-16">Emlak Ofisi Yetkilisi</p>
                  <div className="border-t border-slate-400 w-2/3 mx-auto pt-2">
                    <p className="text-sm text-slate-500">{APP_NAME}</p>
                    <p className="text-xs text-slate-400">Kaşe / İmza</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Print Footer */}
            <div className="mt-8 text-center text-[10px] text-slate-400 print:block hidden">
              Bu belge {APP_NAME} sisteminden otomatik olarak {new Date().toLocaleString('tr-TR')} tarihinde oluşturulmuştur.
            </div>

          </div>
        </div>

        {/* Footer Actions (Screen Only) */}
        {!isPaid && (
          <div className="bg-slate-50 border-t border-slate-100 p-4 flex justify-end print:hidden">
            <button
              onClick={() => {
                if(window.confirm('Bu ödemeyi onaylıyor musunuz? Durum "Ödendi" olarak güncellenecektir.')) {
                  onConfirmPayment(transaction.id);
                  onClose();
                }
              }}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg font-medium shadow-sm transition-colors flex items-center gap-2"
            >
              <CheckCircle size={18} />
              Ödemeyi Onayla ve Kapat
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentFormModal;