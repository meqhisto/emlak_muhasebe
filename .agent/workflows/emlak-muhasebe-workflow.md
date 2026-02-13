---
description: Emlak Muhasebe Proje Kuralları ve Bağlam Akışı
---

Bu proje, Emlak Ofisi Muhasebe Yönetim Sistemi'dir. Yeni bir konuşma başlatıldığında veya geliştirme yapıldığında aşağıdaki kurallara ve mimariye sadık kalınmalıdır.

## 🛠 Teknoloji Yığını
- **Frontend:** React (v18.2.0), Vite, TailwindCSS (veya Vanilla CSS), Lucide Icons.
- **Backend:** Node.js, Express, TypeScript.
- **Veritabanı:** SQLite & Prisma ORM.
- **Altyapı:** Docker & Docker Compose, Nginx (Reverse Proxy).

## 📐 Mimari Kurallar
1. **Docker Yapısı:**
   - Frontend: `3005` portunda Nginx üzerinden sunulur.
   - Backend: `3006` portunda (Nginx proxy aracılığıyla `/api` yoluyla) erişilir.
   - Veritabanı: `/app/prisma/dev.db` yolunda volume olarak bağlanmıştır.
2. **Prisma & Alpine:** Docker imajı Alpine tabanlı olduğu için `schema.prisma` dosyasında `binaryTargets = ["native", "linux-musl-openssl-3.0.x"]` bulunmalıdır.
3. **Veri Tipleri:** Frontend'den gelen tarih dizileri (Date string), backend'de Prisma'ya gönderilmeden önce mutlaka `new Date()` ile objeye dönüştürülmelidir (`dataUtils.ts` kullanın).

## 🔑 Kullanıcı ve Yetkilendirme
- **Roller:** `ADMIN`, `ORTAK`, `MUHASEBE` (Mutlaka BÜYÜK harf kullanılmalıdır).
- **Seed:** Yeni kullanıcılar `backend/prisma/seed.ts` üzerinden eklenir.

## 🚀 Komutlar (Docker Üzerinde)
// turbo
1. **Güncelleme:** `git pull origin main && docker compose up --build -d`
// turbo
2. **Veritabanı Seed:** `docker exec -it emlak-muhasebe-backend npx prisma db seed`
// turbo
3. **Kullanıcı Kontrol:** `docker exec -it emlak-muhasebe-backend node dist/prisma/check_users.js`

## 🌍 Dil ve İletişim
- Tüm yazışmalar, hata mesajları ve değişken isimlendirmeleri (mantıklı olduğu sürece) **Türkçe** olmalıdır.
- Kullanıcıya karşı yardımsever ve çözüm odaklı bir "Yazılım Ortağı" (Pair Programmer) gibi davranılmalıdır.
