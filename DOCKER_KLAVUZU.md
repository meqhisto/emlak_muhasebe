# 🐳 Emlak Muhasebe - Docker Kurulum ve Kullanım Kılavuzu

Bu proje, Frontend (React/Vite) ve Backend (Node/Express/Prisma) uygulamalarını Docker kullanarak çalıştırmak için yapılandırılmıştır.

## � Linux / Ubuntu Sunucu Kurulumu

Eğer sunucunuzda Docker kurulu değilse (`docker-compose not found` hatası alıyorsanız), aşağıdaki komutlarla kurabilirsiniz:

1. **Docker'ı Kurun:**
   ```bash
   # Sistem paketlerini güncelleyin
   sudo apt-get update

   # Docker'ı kurun
   sudo apt-get install -y docker.io

   # Docker Compose plugin'ini kurun (V2)
   sudo apt-get install -y docker-compose-v2

   # Veya klasik docker-compose (V1)
   sudo apt-get install -y docker-compose
   ```

2. **Servisi Başlatın:**
   ```bash
   sudo systemctl start docker
   sudo systemctl enable docker
   ```

## 🚀 Başlangıç

Projeyi tek komutla ayağa kaldırmak için (V2 syntax):

```bash
docker compose up --build
```

*Not: Eğer eski versiyon kullanıyorsanız tire işareti ile `docker-compose up --build` kullanın.*

Bu komut:
1. Backend ve Frontend imajlarını oluşturur (`--build` parametresi ile).
2. Veritabanı ve gerekli servisleri başlatır.
3. Uygulamayı yayına alır.

## 🌐 Erişim

- **Web Uygulaması**: [http://localhost:3005](http://localhost:3005) (Sunucu IP'niz:3005)
- **API Erişimi**: Arkaplanda `3006` üzerinde çalışır.

## 💾 Veritabanı Kalıcılığı (Persistence)

Proje şu anda veritabanı olarak **SQLite** kullanmaktadır.
- Veritabanı dosyası (`dev.db`), container içinde `/app/prisma` dizininde tutulur.
- `docker-compose.yml` dosyasındaki volume ayarı sayesinde bu klasör host makinenizdeki `./backend/prisma` klasörü ile eşleşir.
- **Önemli:** Container'ı silseniz bile verileriniz kaybolmaz.

## 🛠️ Yararlı Komutlar

| İşlem | Komut (V2) |
|-------|-------|
| 🟢 Başlat (Detached) | `docker compose up -d` |
| 🔴 Durdur | `docker compose down` |
| 🔄 Yeniden Oluştur | `docker compose up --build` |
| 📜 Logları İzle | `docker compose logs -f` |
| 🧹 Temizle (Volume hariç) | `docker compose down --rmi all` |

## 📂 Sunucuya Dosya Aktarımı

Projeyi kendi bilgisayarınızda hazırladınız, ancak sunucuda çalıştırmak için dosyaları oraya göndermelisiniz.

Klasik yöntem (SCP) ile dosyaları sunucuya kopyalamak için:

1. **Backend ve Frontend dosyalarını ziplemek en kolay yoldur:**
   (Windows'ta dosyaları seçip "Sıkıştır" diyebilirsiniz)

2. **Sunucuya Gönderim (Powershell veya Terminal):**
   ```bash
   scp -r C:\Users\altanbariscomert\OneDrive\Masaüstü\emlak_muhasebe root@sunucu_ip_adresiniz:/root/
   ```
   *Not: `sunucu_ip_adresiniz` kısmını kendi sunucunuzun IP'si ile değiştirin.*

3. **Alternatif: Dosyaları Elle Oluşturma**
   Eğer Git kullanıyorsanız sunucuda `git clone` yapıp, benim yaptığım değişiklikleri (Dockerfile, docker-compose.yml vb.) sunucuya çekmeniz gerekir.

## 🐛 Sorun Giderme

### "Attaching to nextcloud" veya Yanlış Proje Başlıyor?
Eğer `docker compose up` komutunu çalıştırdığınızda `nextcloud` gibi alakasız bir servis görüyorsanız, **yanlış klasördesiniz** veya bu klasörde `docker-compose.yml` dosyası yok.
Docker, mevcut klasörde dosya bulamazsa üst klasörlere bakar (`/root/docker-compose.yml` gibi).

**Adım Adım Kontrol:**

1. **Klasöre Girin:** `cd ~/emlak_muhasebe`
2. **Dosyaları Listeyelin:** `ls -la`
3. **Şunları KONTROL EDİN:**
   - [ ] `docker-compose.yml` dosyası var mı? (Sizde YOKDU)
   - [ ] `Dockerfile` dosyası DOLU mu? (Sizde 0 byte görünüyor, hata!)
   - [ ] `backend` klasörü var mı? (Sizde YOKDU)
   - [ ] `nginx.conf` dosyası var mı?

**Eğer yukarıdakilerden biri EKSİKSE:**
Dosyaları sunucuya göndermemişsiniz. Lütfen **Sunucuya Dosya Aktarımı** başlığındaki adımları uygulayın.

### "error: The following untracked working tree files would be overwritten by merge"
Eğer `git pull` yaparken "package-lock.json" gibi dosyalarla ilgili hata alırsanız, sunucudaki yerel dosyaları ezmek ve GitHub'daki versiyonu almak için şu komutu çalıştırın:

```bash
git fetch --all
git reset --hard origin/main
```

Bu komut, sunucudaki tüm değişiklikleri siler ve GitHub'daki son hali ile değiştirir.

## 📊 Sunucu Bilgilerini Öğrenme

Sunucunuzun IP adresi, disk durumu ve Docker servislerinin çalışıp çalışmadığını tek komutla öğrenmek için hazırladığım scripti kullanabilirsiniz:

```bash
# Scripti çalıştırılabilir yapın (ilk sefer için)
chmod +x server_check.sh

# Çalıştırın
./server_check.sh
```

Bu komut size sunucu IP adresinizi, disk doluluk oranını ve çalışan servisleri renkli bir rapor olarak sunacaktır.
