
// --- KULLANICI & ROL ŞEMASI ---
export enum UserRole {
  ADMIN = 'ADMIN',
  PARTNER = 'ORTAK', // Altan, Suat
  ACCOUNTANT = 'MUHASEBE', // Nalan
}

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
}

// --- DANIŞMAN ŞEMASI ---
export interface Consultant {
  id: string;
  fullName: string;
  phoneNumber: string;
  commissionRate: number;
  startDate: string;
  isActive: boolean;
}

// --- TEDARİKÇİ / FİRMA ŞEMASI (Cari Takip) ---
export interface Vendor {
  id: string;
  name: string; // Firma Adı
  contactPerson?: string; // İlgili Kişi
  phone: string;
  email?: string;
  taxNumber?: string;
  taxOffice?: string;
  category: ExpenseCategory; // Ana faaliyet alanı
  notes?: string;
}

// --- İŞLEM & GELİR ŞEMASI ---
export enum TransactionType {
  SALE = 'SATIS',
  RENT = 'KIRALAMA',
}

export enum PropertyType {
  APARTMENT = 'DAIRE',
  VILLA = 'VILLA',
  LAND = 'ARSA',
  COMMERCIAL = 'TICARI',
}

export enum PaymentStatus {
  PENDING = 'BEKLIYOR',
  PAID = 'ODENDI',
}

export interface Transaction {
  id: string;
  propertyName: string;
  type: TransactionType;
  propertyType: PropertyType;
  customerName: string;
  customerPhone: string;
  consultantId: string;
  date: string;
  totalRevenue: number;
  officeRevenue: number;
  consultantShare: number;
  partnerShareAltan: number;
  partnerShareSuat: number;
  paymentStatus: PaymentStatus;
  description?: string;
}

// --- GİDER ŞEMASI ---
export enum ExpenseCategory {
  OFFICE_SUPPLIES = 'OFIS_MALZEMELERI',
  RENT = 'KIRA',
  MARKETING = 'PAZARLAMA',
  PERSONNEL = 'PERSONEL_MAAS',
  UTILITIES = 'FATURALAR',
  FOOD = 'YEMEK',
  OTHER = 'DIGER',
}

export enum Payer {
  ALTAN = 'ALTAN',
  SUAT = 'SUAT',
  OFFICE = 'OFIS_KASASI',
}

export interface Expense {
  id: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  description: string;
  paidBy: Payer;
  notes?: string;
  isPaid: boolean;
  vendorId?: string; // Yeni: Hangi firmaya ait olduğu (Cari bağlantısı)
}

// --- MAAŞ & PERSONEL ŞEMASI ---
export interface Personnel {
  id: string;
  fullName: string;
  role: string;
  monthlySalary: number;
  startDate: string;
  isActive: boolean;
}

export interface SalaryPayment {
  id: string;
  personnelId: string;
  amount: number;
  date: string;
  period: string;
  isPaid: boolean;
}

// --- LOG SİSTEMİ ---
export interface SystemLog {
  id: string;
  date: string;
  user: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE' | 'RESET';
  module: 'EXPENSE' | 'TRANSACTION' | 'SYSTEM' | 'PERSONNEL' | 'CONSULTANT' | 'VENDOR';
  details: string;
}
