# 🐳 Emlak Muhasebe - Docker Kurulum ve Kullanım Kılavuzu

Bu proje, Frontend (React/Vite) ve Backend (Node/Express/Prisma) uygulamalarını Docker kullanarak çalıştırmak için yapılandırılmıştır.

## 🚀 Hızlı Başlangıç

Projeyi tek komutla ayağa kaldırmak için:

```bash
docker-compose up --build
```

Bu komut:
1. Backend ve Frontend imajlarını oluşturur (`--build` parametresi ile).
2. Veritabanı ve gerekli servisleri başlatır.
3. Uygulamayı yayına alır.

## 🌐 Erişim

- **Web Uygulaması**: [http://localhost:3000](http://localhost:3000)
- **API Erişimi**: Arkaplanda `localhost:3001` üzerinde çalışır ancak Nginx üzerinden `/api` yoluna yapılan istekler otomatik yönlendirilir.

## 💾 Veritabanı Kalıcılığı (Persistence)

Proje şu anda veritabanı olarak **SQLite** kullanmaktadır.
- Veritabanı dosyası (`dev.db`), container içinde `/app/prisma` dizininde tutulur.
- `docker-compose.yml` dosyasındaki volume ayarı sayesinde bu klasör host makinenizdeki `./backend/prisma` klasörü ile eşleşir.
- **Önemli:** Container'ı silseniz bile verileriniz kaybolmaz.

## 🛠️ Yararlı Komutlar

| İşlem | Komut |
|-------|-------|
| 🟢 Başlat (Detached) | `docker-compose up -d` |
| 🔴 Durdur | `docker-compose down` |
| 🔄 Yeniden Oluştur | `docker-compose up --build` |
| 📜 Logları İzle | `docker-compose logs -f` |
| 🧹 Temizle (Volume hariç) | `docker-compose down --rmi all` |

## ⚠️ Dikkat Edilmesi Gerekenler

1. **Port Çakışması:** Eğer 3000 veya 3001 portları doluysa `docker-compose.yml` dosyasından portları değiştirebilirsiniz.
2. **Environment Variables:** Backend için `.env` değişkenleri `docker-compose.yml` içinde tanımlanmıştır. Prodüksiyon ortamında bu değişkenleri `.env` dosyasından okuyacak şekilde güncelleyebilirsiniz.
3. **Veritabanı:** `prisma/dev.db` dosyası `.gitignore`'da olabilir, ancak volume sayesinde container çalıştıkça korunacaktır.

## 📂 Yapı

- `Dockerfile` (Ana dizin): Frontend (React) için Nginx tabanlı build.
- `nginx.conf`: Frontend ve Backend trafiğini yöneten ters vekil sunucu (Reverse Proxy).
- `backend/Dockerfile`: Node.js Backend servisi.
- `docker-compose.yml`: Tüm servisleri koordine eden dosya.
