import React, { useEffect, useState } from 'react';
import { Transaction, Consultant, TransactionType, PaymentStatus } from '../types';
import { APP_NAME, INITIAL_TRANSACTIONS, INITIAL_CONSULTANTS } from '../constants';

const PrintTransaction: React.FC = () => {
    const [transaction, setTransaction] = useState<Transaction | null>(null);
    const [consultant, setConsultant] = useState<Consultant | null>(null);

    useEffect(() => {
        // URL'den ID al
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');

        if (id) {
            // LocalStorage'dan verileri çek
            const storedTrans = localStorage.getItem('emlak_transactions');
            const transactions: Transaction[] = storedTrans ? JSON.parse(storedTrans) : INITIAL_TRANSACTIONS;
            const foundTrans = transactions.find(t => t.id === id);

            if (foundTrans) {
                setTransaction(foundTrans);

                const storedCons = localStorage.getItem('emlak_consultants');
                const consultants: Consultant[] = storedCons ? JSON.parse(storedCons) : INITIAL_CONSULTANTS;
                const foundCons = consultants.find(c => c.id === foundTrans.consultantId);
                setConsultant(foundCons || null);

                // Veri yüklendikten kısa bir süre sonra yazdır
                setTimeout(() => {
                    window.print();
                }, 500);
            }
        }
    }, []);

    if (!transaction || !consultant) {
        return <div className="p-8 text-center">Yükleniyor veya işlem bulunamadı...</div>;
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
    };

    const isPaid = transaction.paymentStatus === PaymentStatus.PAID;

    return (
        <div className="bg-white p-8 max-w-[210mm] mx-auto min-h-screen">
            <style>{`
        @media print {
            @page { margin: 0; size: auto; }
            body { margin: 0; padding: 0; }
            .no-print { display: none !important; }
        }
       `}</style>

            {/* Watermark */}
            {isPaid ? (
                <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -rotate-45 pointer-events-none opacity-[0.08] border-8 border-green-600 text-green-600 text-8xl font-black uppercase p-8 rounded-3xl print:opacity-[0.15]">
                    ÖDENDİ
                </div>
            ) : (
                <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -rotate-45 pointer-events-none opacity-[0.03] border-8 border-slate-400 text-slate-400 text-8xl font-black uppercase p-8 rounded-3xl">
                    ÖNİZLEME
                </div>
            )}

            {/* Header */}
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

            {/* Consultant Info */}
            <div className="mb-8 bg-slate-50 p-6 rounded-lg border border-slate-200">
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

            {/* Transaction Details */}
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

            {/* Totals */}
            <div className="flex justify-end mb-16">
                <div className="w-full sm:w-2/3 space-y-3 bg-slate-50 p-6 rounded-xl border border-slate-200">
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

            {/* Signatures */}
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

            <div className="fixed bottom-6 left-0 right-0 text-center text-[9px] text-slate-300 uppercase font-bold tracking-widest">
                Bu belge dijital olarak oluşturulmuştur ve mali değeri yoktur. {new Date().toLocaleString('tr-TR')}
            </div>
        </div>
    );
};

export default PrintTransaction;
