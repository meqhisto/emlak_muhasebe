#!/bin/bash
clear
echo "========================================================"
echo "          🖥️  EMLAK MUHASEBE - SUNUCU RAPORU 🖥️"
echo "========================================================"
echo "📅 Tarih: $(date)"
echo "--------------------------------------------------------"
echo "🌐 [1] IP VE AĞ BİLGİLERİ"
echo "--------------------------------------------------------"
echo "Yerel IP (LAN): $(hostname -I | awk '{print $1}')"
echo "Dış IP (WAN):   $(curl -s ifconfig.me)"
echo "--------------------------------------------------------"
echo "💾 [2] DİSK DURUMU (Boş Alan)"
echo "--------------------------------------------------------"
df -h / | awk 'NR==2 {print "Toplam: " $2 ", Dolu: " $3 ", Boş: " $4 " (" $5 ")"}'
echo "--------------------------------------------------------"
echo "🐳 [3] DOCKER KONTEYNER DURUMLARI"
echo "--------------------------------------------------------"
if command -v docker &> /dev/null; then
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
else
    echo "❌ Docker bulunamadı veya çalışmıyor."
fi
echo "--------------------------------------------------------"
echo "📂 [4] MEVCUT KLASÖR"
echo "--------------------------------------------------------"
pwd
echo "========================================================"
echo "Komut tamamlandı."
