
import { User, UserRole, Consultant, Transaction, TransactionType, PaymentStatus, Expense, ExpenseCategory, Payer, Personnel, SalaryPayment, Vendor } from './types';

export const INITIAL_CONSULTANTS: Consultant[] = [
  { id: 'c1', fullName: 'Örnek Danışman', phoneNumber: '0500 000 00 00', commissionRate: 50, startDate: '2024-01-01', isActive: true },
];

export const INITIAL_VENDORS: Vendor[] = [
  { id: 'v1', name: 'Örnek Tedarikçi', contactPerson: 'Yetkili Kişi', phone: '0212 000 00 00', category: ExpenseCategory.OTHER },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [];

export const INITIAL_EXPENSES: Expense[] = [];

export const INITIAL_PERSONNEL: Personnel[] = [];

export const INITIAL_SALARY_PAYMENTS: SalaryPayment[] = [];

export const APP_NAME = "Emlak Ofisi YS";
export const CURRENCY_SYMBOL = "₺";

export const NAVIGATION_ITEMS = [
  { label: "Ana Sayfa", path: "/", icon: "LayoutDashboard", roles: [UserRole.ADMIN, UserRole.PARTNER, UserRole.ACCOUNTANT] },
  { label: "Danışmanlar", path: "/consultants", icon: "Users", roles: [UserRole.ADMIN, UserRole.PARTNER, UserRole.ACCOUNTANT] },
  { label: "Firmalar / Cariler", path: "/vendors", icon: "Building", roles: [UserRole.ADMIN, UserRole.PARTNER, UserRole.ACCOUNTANT] },
  { label: "Personel & Maaş", path: "/personnel", icon: "Briefcase", roles: [UserRole.ADMIN, UserRole.PARTNER, UserRole.ACCOUNTANT] },
  { label: "Gelir / İşlemler", path: "/transactions", icon: "Banknote", roles: [UserRole.ADMIN, UserRole.PARTNER, UserRole.ACCOUNTANT] },
  { label: "Giderler", path: "/expenses", icon: "Receipt", roles: [UserRole.ADMIN, UserRole.PARTNER, UserRole.ACCOUNTANT] },
  { label: "Raporlar", path: "/reports", icon: "BarChart3", roles: [UserRole.ADMIN, UserRole.PARTNER] },
  { label: "Ayarlar", path: "/settings", icon: "Settings", roles: [UserRole.ADMIN, UserRole.PARTNER] }
];
