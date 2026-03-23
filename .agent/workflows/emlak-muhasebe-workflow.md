---
description: Emlak Muhasebe Proje Kuralları ve Bağlam Akışı
---

# Emlak Ofisi Muhasebe Yönetim Sistemi - Proje Bağlamı

## Son Güncelleme: 14 Şubat 2026

---

## 🏗️ Teknoloji Yığını
- **Frontend:** React 18, Vite, TailwindCSS, Lucide Icons, Axios
- **Backend:** Node.js, Express, TypeScript, Prisma ORM
- **Veritabanı:** SQLite (`/app/prisma/dev.db`)
- **Altyapı:** Docker & Docker Compose, Nginx (Frontend), Nginx Proxy Manager (Sunucu)
- **Domain:** `muhasebe.invecoproje.com`

## 👥 Kullanıcılar ve Roller
| Kullanıcı | Rol | Yetki |
|-----------|-----|-------|
| admin | ADMIN | Tam erişim (Dashboard, Raporlar dahil) |
| altan | ORTAK | Tam erişim (Net Kâr, Ofis Geliri görür) |
| suat | ORTAK | Tam erişim (Net Kâr, Ofis Geliri görür) |
| nalan | MUHASEBE | Operasyonel erişim (Kâr/zarar göremez) |

## 📁 Kritik Dosya Yapısı
```
├── pages/
│   ├── Dashboard.tsx      # Aylık filtre var, rol bazlı kartlar
│   ├── Reports.tsx        # SVG grafik, ortak cari, danışman performansı
│   ├── Transactions.tsx   # Hakediş onay/ödeme, otomatik gider YOK
│   ├── Expenses.tsx       # Gider yönetimi, COMMISSION kategorisi
│   ├── Personnel.tsx      # Personel + maaş ödemeleri
│   ├── Consultants.tsx    # Danışman yönetimi
│   └── Vendors.tsx        # Cari hesaplar
├── components/
│   ├── Layout.tsx         # Sidebar + bildirim badge'leri
│   └── PaymentFormModal.tsx # Hakediş belgesi yazdırma
├── contexts/
│   ├── AuthContext.tsx     # JWT auth
│   └── DataContext.tsx     # Promise.allSettled ile veri çekme
├── services/api.ts        # Axios interceptor
├── backend/
│   ├── src/index.ts       # Express routes kaydı
│   ├── src/controllers/   # CRUD controllers (+ salaryPaymentController)
│   ├── src/routes/        # Route tanımları (+ salaryPaymentRoutes)
│   ├── src/utils/logUtils.ts    # Audit logging
│   └── prisma/schema.prisma    # DB modelleri
└── docker-compose.yml     # internal + proxy_network ağları
```

## ✅ Tamamlanan Geliştirmeler (Bu Oturum)

### 1. Finansal Hesaplama Düzeltmeleri
- Danışman hakediş ödemesi artık ofis gideri olarak kaydedilMİYOR
- `ExpenseCategory.COMMISSION` eklendi
- Net Kâr = Ofis Geliri − Operasyonel Giderler (hakediş hariç)
- Eski "PERSONEL_MAAS" + "Hakediş" açıklamalı kayıtlar da filtreleniyor

### 2. Rol Bazlı Dashboard Erişimi
- MUHASEBE: Toplam Ciro + Toplam İşlem + Aktif Kadro görür
- ORTAK/ADMIN: Ofis Geliri + Net Kâr + Toplam Giderler + Gider Oranı görür

### 3. Dashboard Aylık Filtre
- Ay/yıl dropdown'ları eklendi
- Tüm istatistikler seçilen döneme göre filtreleniyor
- Performans hedefi seçilen aya uyumlu

### 4. Raporlar İyileştirmeleri
- Hakediş giderleri raporlardan da hariç tutuluyor
- ADMIN rolü artık raporlara erişebiliyor

### 5. Maaş Yönetimi Backend
- `SalaryPayment` API: GET/POST/DELETE `/api/salary-payments`
- DataContext backend'e bağlandı (artık kalıcı)

### 6. Bildirim Badge'leri
- Sidebar: Ödenmemiş gider sayısı (Giderler menüsü)
- Sidebar: Bekleyen hakediş sayısı (İşlemler menüsü)

### 7. Hakediş Yazdırma Düzeltmesi
- Yeni sekme açıp CSS'leri kopyalayan çözüm (SPA routing sorunu giderildi)

### 8. DataContext Dayanıklılık
- `Promise.all` → `Promise.allSettled` (tek API hatası tüm veriyi boş bırakmıyor)

### 9. Domain Konfigürasyonu
- `nginx.conf`: `server_name muhasebe.invecoproje.com`
- `docker-compose.yml`: `proxy_network` ile NPM bağlantısı

## 🔮 Gelecekte Eklenebilecek Özellikler
- [ ] PDF Rapor indirme (aylık mali rapor)
- [ ] Danışman Performans Detay Kartı

### İleri Seviye
- [ ] Ortak Kâr Paylaşım Raporu (Altan + Suat aylık net paylar)
- [ ] Takvim görünümü (işlem/gider takvimi)
- [ ] PWA desteği (telefona yüklenebilir)
- [ ] Otomatik veritabanı yedeği + download butonu
- [ ] Vergi hesaplama (KDV, stopaj)

## ⚠️ Bilinen Teknik Notlar
- **Prisma Alpine:** `binaryTargets = ["native", "linux-musl-openssl-3.0.x"]` gerekli
- **Tarih Dönüşümü:** Frontend'den gelen tarihler backend'de `new Date()` ile dönüştürülmeli (`dataUtils.ts`)
- **Deploy Komutu:** `git pull origin main && docker compose up --build -d`
- **Seed:** `docker exec -it emlak-muhasebe-backend npx prisma db seed`
- **DB Volume:** `/app/prisma/dev.db` → rebuild'de korunur