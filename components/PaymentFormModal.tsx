
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
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm print:static print:p-0 print:bg-white print:block">
      {/* Explicit print styles to hide everything else and ensure exact A4 dimensions */}
      <style>{`
        @media print {
          @page {
            margin: 0;
            size: auto;
          }
          body {
            visibility: hidden;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            margin: 0;
            padding: 0;
          }
          #hakedis-modal-content {
            visibility: visible;
            position: absolute;
            left: 0;
            top: 0;
            width: 210mm; /* Fixed A4 Width */
            margin: 0;
            padding: 0;
            box-shadow: none;
            transform: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
      `}</style>

      <div 
        id="hakedis-modal-content"
        className="bg-white w-full max-w-3xl max-h-[90vh] shadow-2xl rounded-xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 print:max-h-none print:rounded-none print:shadow-none print:w-[210mm]"
      >
        
        {/* Modal Controls - Hidden when printing */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50 no-print">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <FileSignature size={18} className="text-indigo-600" />
            Hakediş Formu Görüntüleme
          </h3>
          <div className="flex items-center gap-2">
            <button 
              onClick={handlePrint}
              className="px-3 py-1.5 text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 text-sm font-medium flex items-center gap-2 transition-colors shadow-sm"
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

        {/* Scrollable Form Container */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-8 bg-slate-100/30 print:overflow-visible print:p-0 print:bg-white">
          
          {/* --- THE A4 FORM CONTENT --- */}
          <div className="bg-white border border-slate-300 shadow-sm mx-auto p-8 relative print:p-10 print:border-none print:shadow-none" 
               style={{ minHeight: '297mm', width: '100%', maxWidth: '210mm' }}>
            
            {/* Watermark for Status */}
            {isPaid ? (
               <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -rotate-45 pointer-events-none opacity-[0.08] border-8 border-green-600 text-green-600 text-8xl font-black uppercase p-8 rounded-3xl print:opacity-[0.15]">
                 ÖDENDİ
               </div>
            ) : (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -rotate-45 pointer-events-none opacity-[0.03] border-8 border-slate-400 text-slate-400 text-8xl font-black uppercase p-8 rounded-3xl">
                 ÖNİZLEME
               </div>
            )}

            {/* Header */}
            <div>
              <div className="flex justify-between items-start border-b-2 border-slate-800 pb-6 mb-8">
                <div>
                  <h1 className="text-3xl font-black text-slate-900 tracking-tight">{APP_NAME}</h1>
                  <p className="text-slate-500 text-sm mt-1 font-medium">Gayrimenkul Muhasebe Sistemi</p>
                </div>
                <div className="text-right">
                  <h2 className="text-xl font-bold text-slate-800 uppercase tracking-widest">Hakediş Belgesi</h2>
                  <p className="text-slate-500 text-sm mt-1">Ref: #{transaction.id}</p>
                  <p className="text-slate-500 text-sm">Düzenleme: {new Date().toLocaleDateString('tr-TR')}</p>
                </div>
              </div>

              {/* Consultant Info Section */}
              <div className="mb-8 bg-slate-50 p-6 rounded-lg border border-slate-200 print:bg-white">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">Danışman & Hakediş Bilgileri</h3>
                <div className="grid grid-cols-2 gap-y-6">
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase font-black mb-1">Ad Soyad</span>
                    <span className="block text-lg font-bold text-slate-900">{consultant.fullName}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase font-black mb-1">Hakediş Yüzdesi</span>
                    <span className="block text-lg font-bold text-indigo-700">%{consultant.commissionRate}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase font-black mb-1">Telefon</span>
                    <span className="block text-slate-900 font-bold">{consultant.phoneNumber}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase font-black mb-1">Ödeme Durumu</span>
                    <span className={`font-bold ${isPaid ? 'text-emerald-600' : 'text-orange-600'}`}>
                        {isPaid ? 'ÖDENDİ / KAPALI' : 'BEKLEMEDE / AÇIK'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Transaction Details Section */}
              <div className="mb-8">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">İşlem Detayları</h3>
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-900 text-white text-[10px] uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3 font-bold">Açıklama / Gayrimenkul</th>
                      <th className="px-4 py-3 font-bold">İşlem</th>
                      <th className="px-4 py-3 font-bold text-right">Hizmet Bedeli</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 border-b border-slate-200">
                    <tr>
                      <td className="px-4 py-5">
                        <p className="font-bold text-slate-900">{transaction.propertyName}</p>
                        <p className="text-xs text-slate-500 mt-1">Müşteri: {transaction.customerName}</p>
                      </td>
                      <td className="px-4 py-5">
                        <span className="inline-block px-2 py-1 bg-slate-100 rounded text-[10px] font-bold uppercase text-slate-700">
                          {transaction.type === TransactionType.SALE ? 'SATIŞ' : 'KİRALAMA'}
                        </span>
                      </td>
                      <td className="px-4 py-5 text-right font-black text-slate-900">
                        {formatCurrency(transaction.totalRevenue)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Calculation Breakdown */}
              <div className="flex justify-end mb-16">
                <div className="w-full sm:w-2/3 space-y-3 bg-slate-50 p-6 rounded-xl border border-slate-200 print:bg-white print:border-slate-300">
                  <div className="flex justify-between text-slate-600 text-sm">
                    <span>Brüt Ciro (KDV Dahil):</span>
                    <span className="font-bold">{formatCurrency(transaction.totalRevenue)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 text-sm">
                    <span>Ofis Payı (%{100 - consultant.commissionRate}):</span>
                    <span>{formatCurrency(transaction.officeRevenue)}</span>
                  </div>
                  <div className="border-t-2 border-slate-900 pt-4 mt-2 flex justify-between items-center">
                    <span className="font-black text-slate-900 text-lg uppercase">Danışman Hakediş:</span>
                    <span className="font-black text-3xl text-indigo-700">
                      {formatCurrency(transaction.consultantShare)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Signature Section */}
            <div className="mt-auto pt-12">
              <div className="grid grid-cols-2 gap-12 text-center">
                <div className="space-y-20">
                  <p className="font-bold text-slate-900 text-sm uppercase tracking-widest">Teslim Eden (Ofis)</p>
                  <div className="border-t border-slate-400 w-3/4 mx-auto pt-4">
                    <p className="text-sm font-bold text-slate-800">{APP_NAME}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-black mt-1">Kaşe / İmza</p>
                  </div>
                </div>
                <div className="space-y-20">
                  <p className="font-bold text-slate-900 text-sm uppercase tracking-widest">Teslim Alan (Danışman)</p>
                  <div className="border-t border-slate-400 w-3/4 mx-auto pt-4">
                    <p className="text-sm font-bold text-slate-800">{consultant.fullName}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-black mt-1">İmza</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Print Footer */}
            <div className="absolute bottom-6 left-8 right-8 text-center text-[9px] text-slate-300 print:block hidden uppercase font-bold tracking-widest">
              Bu belge dijital olarak oluşturulmuştur ve mali değeri yoktur. {new Date().toLocaleString('tr-TR')}
            </div>

          </div>
        </div>

        {/* Footer Actions (Screen Only) */}
        {!isPaid && (
          <div className="bg-slate-50 border-t border-slate-100 p-4 flex justify-end gap-3 no-print">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
            >
              İptal
            </button>
            <button
              type="button"
              onClick={() => {
                if(window.confirm('Bu hakediş ödemesini onaylıyor musunuz?')) {
                  onConfirmPayment(transaction.id);
                }
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg font-bold shadow-md transition-all active:scale-95 flex items-center gap-2"
            >
              <CheckCircle size={18} />
              Hakedişi Öde ve Kapat
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentFormModal;
