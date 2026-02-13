import { User, UserRole, Consultant, Transaction, TransactionType, PaymentStatus, Expense, ExpenseCategory, Payer, Personnel, SalaryPayment } from './types';

// Mock Kullanıcılar (Veritabanı Simülasyonu)
export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    username: 'altan',
    name: 'Altan (Ortak)',
    role: UserRole.PARTNER,
  },
  {
    id: 'u2',
    username: 'suat',
    name: 'Suat (Ortak)',
    role: UserRole.PARTNER,
  },
  {
    id: 'u3',
    username: 'nalan',
    name: 'Nalan (Muhasebe)',
    role: UserRole.ACCOUNTANT,
  },
];

// Mock Danışmanlar (Başlangıç Verisi)
export const INITIAL_CONSULTANTS: Consultant[] = [
  {
    id: 'c1',
    fullName: 'Ahmet Yılmaz',
    phoneNumber: '0532 555 11 22',
    commissionRate: 50,
    startDate: '2023-01-15',
    isActive: true,
  },
  {
    id: 'c2',
    fullName: 'Zeynep Kaya',
    phoneNumber: '0533 444 33 21',
    commissionRate: 45,
    startDate: '2023-06-01',
    isActive: true,
  },
  {
    id: 'c3',
    fullName: 'Mehmet Demir',
    phoneNumber: '0542 111 22 33',
    commissionRate: 40,
    startDate: '2022-11-20',
    isActive: false, // Pasif örnek
  }
];

// Mock İşlemler (Başlangıç Verisi)
export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 't1',
    propertyName: 'Menekşe Apt. No:4',
    type: TransactionType.SALE,
    customerName: 'Ali Veli',
    consultantId: 'c1', // Ahmet Yılmaz (%50)
    date: '2023-10-05',
    totalRevenue: 40000,
    officeRevenue: 20000,
    consultantShare: 20000,
    partnerShareAltan: 10000,
    partnerShareSuat: 10000,
    paymentStatus: PaymentStatus.PAID,
  },
  {
    id: 't2',
    propertyName: 'Lale Sitesi B Blok D:12',
    type: TransactionType.RENT,
    customerName: 'Ayşe Fatma',
    consultantId: 'c2', // Zeynep Kaya (%45)
    date: '2023-10-12',
    totalRevenue: 10000,
    officeRevenue: 5500, // 10000 * 0.55
    consultantShare: 4500, // 10000 * 0.45
    partnerShareAltan: 2750,
    partnerShareSuat: 2750,
    paymentStatus: PaymentStatus.PENDING,
  }
];

// Mock Giderler (Başlangıç Verisi - Faz 4)
export const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'e1',
    category: ExpenseCategory.RENT,
    amount: 15000,
    date: '2023-10-01',
    description: 'Ekim Ayı Ofis Kirası',
    paidBy: Payer.OFFICE,
  },
  {
    id: 'e2',
    category: ExpenseCategory.FOOD,
    amount: 2500,
    date: '2023-10-03',
    description: 'Müşteri Yemeği (Leman Kültür)',
    paidBy: Payer.ALTAN, // Altan cebinden ödedi
  },
  {
    id: 'e3',
    category: ExpenseCategory.OFFICE_SUPPLIES,
    amount: 850,
    date: '2023-10-10',
    description: 'Kırtasiye ve Kağıt Alımı',
    paidBy: Payer.SUAT, // Suat cebinden ödedi
  }
];

// Mock Personel (Başlangıç Verisi - Faz 5)
export const INITIAL_PERSONNEL: Personnel[] = [
  {
    id: 'p1',
    fullName: 'Ayşe Yılmaz',
    role: 'Ofis Asistanı',
    monthlySalary: 12500,
    startDate: '2023-01-01',
    isActive: true,
  },
  {
    id: 'p2',
    fullName: 'Hüseyin Çelik',
    role: 'Çay / Temizlik',
    monthlySalary: 8000,
    startDate: '2023-03-15',
    isActive: true,
  }
];

export const INITIAL_SALARY_PAYMENTS: SalaryPayment[] = [
    {
        id: 'sp1',
        personnelId: 'p1',
        amount: 12500,
        date: '2023-09-30',
        period: '2023-09',
        isPaid: true
    }
];

// Uygulama Sabitleri
export const APP_NAME = "Emlak Ofisi YS";
export const CURRENCY_SYMBOL = "₺";

export const NAVIGATION_ITEMS = [
  {
    label: "Ana Sayfa",
    path: "/",
    icon: "LayoutDashboard",
    roles: [UserRole.PARTNER, UserRole.ACCOUNTANT]
  },
  {
    label: "Danışmanlar",
    path: "/consultants",
    icon: "Users",
    roles: [UserRole.PARTNER, UserRole.ACCOUNTANT]
  },
  {
    label: "Personel & Maaş",
    path: "/personnel",
    icon: "Briefcase",
    roles: [UserRole.PARTNER, UserRole.ACCOUNTANT]
  },
  {
    label: "Gelir / İşlemler",
    path: "/transactions",
    icon: "Banknote",
    roles: [UserRole.PARTNER, UserRole.ACCOUNTANT]
  },
  {
    label: "Giderler",
    path: "/expenses",
    icon: "Receipt",
    roles: [UserRole.PARTNER, UserRole.ACCOUNTANT]
  },
  {
    label: "Raporlar",
    path: "/reports",
    icon: "BarChart3",
    roles: [UserRole.PARTNER] // Sadece Ortaklar
  },
  {
    label: "Ayarlar",
    path: "/settings",
    icon: "Settings",
    roles: [UserRole.PARTNER]
  }
];