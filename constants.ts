import { User, UserRole, Consultant, Transaction, TransactionType, PaymentStatus, Expense, ExpenseCategory, Payer, Personnel, SalaryPayment, Vendor } from './types';

export const MOCK_USERS: User[] = [
  { id: 'u1', username: 'altan', name: 'Altan (Ortak)', role: UserRole.PARTNER },
  { id: 'u2', username: 'suat', name: 'Suat (Ortak)', role: UserRole.PARTNER },
  { id: 'u3', username: 'nalan', name: 'Nalan (Muhasebe)', role: UserRole.ACCOUNTANT },
];

export const INITIAL_CONSULTANTS: Consultant[] = [
  { id: 'c1', fullName: 'Ahmet Yılmaz', phoneNumber: '0532 555 11 22', commissionRate: 50, startDate: '2023-01-15', isActive: true },
  { id: 'c2', fullName: 'Zeynep Kaya', phoneNumber: '0533 444 33 21', commissionRate: 45, startDate: '2023-06-01', isActive: true },
];

export const INITIAL_VENDORS: Vendor[] = [
  { id: 'v1', name: 'Menekşe Temizlik Hizmetleri', contactPerson: 'Hüseyin Bey', phone: '0212 555 00 00', category: ExpenseCategory.OTHER },
  { id: 'v2', name: 'Sahibinden.com', phone: '0850 222 44 44', category: ExpenseCategory.MARKETING },
  { id: 'v3', name: 'Lale Kırtasiye', contactPerson: 'Merve Hanım', phone: '0216 444 11 11', category: ExpenseCategory.OFFICE_SUPPLIES },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: 't1', propertyName: 'Menekşe Apt. No:4', type: TransactionType.SALE, customerName: 'Ali Veli', consultantId: 'c1', date: '2023-10-05', totalRevenue: 40000, officeRevenue: 20000, consultantShare: 20000, partnerShareAltan: 10000, partnerShareSuat: 10000, paymentStatus: PaymentStatus.PAID },
];

export const INITIAL_EXPENSES: Expense[] = [
  { id: 'e1', category: ExpenseCategory.RENT, amount: 15000, date: '2023-10-01', description: 'Ekim Ayı Ofis Kirası', paidBy: Payer.OFFICE, isPaid: true },
  { id: 'e2', category: ExpenseCategory.MARKETING, amount: 2000, date: '2023-10-15', description: 'İlan Paket Ödemesi', paidBy: Payer.OFFICE, isPaid: false, vendorId: 'v2' },
];

export const INITIAL_PERSONNEL: Personnel[] = [
  { id: 'p1', fullName: 'Ayşe Yılmaz', role: 'Ofis Asistanı', monthlySalary: 12500, startDate: '2023-01-01', isActive: true },
];

export const INITIAL_SALARY_PAYMENTS: SalaryPayment[] = [];

export const APP_NAME = "Emlak Ofisi YS";
export const CURRENCY_SYMBOL = "₺";

export const NAVIGATION_ITEMS = [
  { label: "Ana Sayfa", path: "/", icon: "LayoutDashboard", roles: [UserRole.PARTNER, UserRole.ACCOUNTANT] },
  { label: "Danışmanlar", path: "/consultants", icon: "Users", roles: [UserRole.PARTNER, UserRole.ACCOUNTANT] },
  { label: "Firmalar / Cariler", path: "/vendors", icon: "Building", roles: [UserRole.PARTNER, UserRole.ACCOUNTANT] },
  { label: "Personel & Maaş", path: "/personnel", icon: "Briefcase", roles: [UserRole.PARTNER, UserRole.ACCOUNTANT] },
  { label: "Gelir / İşlemler", path: "/transactions", icon: "Banknote", roles: [UserRole.PARTNER, UserRole.ACCOUNTANT] },
  { label: "Giderler", path: "/expenses", icon: "Receipt", roles: [UserRole.PARTNER, UserRole.ACCOUNTANT] },
  { label: "Raporlar", path: "/reports", icon: "BarChart3", roles: [UserRole.PARTNER] },
  { label: "Ayarlar", path: "/settings", icon: "Settings", roles: [UserRole.PARTNER] }
];
