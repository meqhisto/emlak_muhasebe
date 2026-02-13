// --- KULLANICI & ROL ŞEMASI ---
export enum UserRole {
  PARTNER = 'ORTAK', // Altan, Suat
  ACCOUNTANT = 'MUHASEBE', // Nalan
}

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
}

// --- DANIŞMAN ŞEMASI (Faz 1) ---
export interface Consultant {
  id: string;
  fullName: string;
  phoneNumber: string;
  commissionRate: number; // Yüzde olarak (örn: 50)
  startDate: string; // ISO Date
  isActive: boolean;
}

// --- İŞLEM & GELİR ŞEMASI (Faz 2 & 3) ---
export enum TransactionType {
  SALE = 'SATIS',
  RENT = 'KIRALAMA',
}

export enum PaymentStatus {
  PENDING = 'BEKLIYOR',
  PAID = 'ODENDI', // İmzalandı / Kapandı
}

export interface Transaction {
  id: string;
  propertyName: string; // Serbest metin
  type: TransactionType;
  customerName: string;
  consultantId: string; // Consultant FK
  date: string; // ISO Date
  totalRevenue: number; // Toplam Ciro
  
  // Otomatik Hesaplanan Alanlar
  officeRevenue: number; // Ciro * (1 - Danışman Oranı) veya direkt Ofise Kalan
  consultantShare: number; // Ciro * Danışman Oranı
  partnerShareAltan: number; // Ofise Kalan / 2
  partnerShareSuat: number; // Ofise Kalan / 2

  // Faz 3: Hakediş Durumu
  paymentStatus: PaymentStatus;
}

// --- GİDER ŞEMASI (Faz 4) ---
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
}

// --- MAAŞ & PERSONEL ŞEMASI (Faz 5) ---
export interface Personnel {
  id: string;
  fullName: string;
  role: string; // Örn: Ofis Asistanı, Çaycı, Temizlik
  monthlySalary: number;
  startDate: string;
  isActive: boolean;
}

export interface SalaryPayment {
  id: string;
  personnelId: string;
  amount: number;
  date: string;
  period: string; // "2023-10" (Yıl-Ay)
  isPaid: boolean;
}