---
layout: project
ref: arm-motion-control
lang: tr
title: ARM Motion Control
permalink: /tr/projects/arm-motion-control/
---

## Görev

2024 yaz stajımda, DC motorla sürülen mekanik bir kolun gömülü yazılımını ve bilgisayar yazılımını
geliştirdim. Operatör kolun her yöne kaç tur atacağını ve bir tam turun ne kadar süreceğini
belirler. Sistem bir hareket sensörüyle birlikte çalışır; elle ve otomatik olmak üzere iki kipi vardır.

## Sistem özeti

| Bölüm | Gerçekleme |
|---|---|
| Denetleyici | Özel motor hareket kartı üzerinde STM32F030C8T6 |
| Bilgisayar arayüzü | C# ile yazılmış Windows masaüstü uygulaması |
| Bağlantı | RS-485 fiziksel katmanı üzerinde UART çerçeveleme |
| Bütünlük | Her pakette CRC16 |
| Kalıcılık | Komutlar mikrodenetleyicinin dahili flash belleğinde saklanır |
| Çevre birimleri | DC motor, hareket sensörü, LED, buzzer, hoparlör |
| Güç | 12 V DC besleme |

## Neler yaptım

**Paket protokolü.** Bilgisayar ile kart, CRC16 ile korunan sabit biçimli paketler alışverişi
yapar. Arayüz ve gömülü yazılım aynı tanıma göre geliştirilsin diye paket düzenini belgeledim.

![Paket biçimi]({{ '/assets/img/projects/arm-packet-format.png' | relative_url }})

**Ayrı sürücülerden oluşan gömülü yazılım.** RS-485 iletimi, CRC hesabı ve flash saklama, `main.c`
içine karışmış kod değil, uygulama katmanının altında bağımsız modüllerdir.

**İki çalışma kipi.** Sistem, arayüzden sürülen elle kipi ve otomatik kipi destekler.

**Elektrik kesintisinden sonra toparlanma.** Normalde böyle bir sistemin her kesintiden sonra
bilgisayardan yeniden ayarlanması gerekir. Burada alınan her komut dahili flash belleğe yazılır;
elektrik geldiğinde yazılım saklanan komutları okur ve operatör olmadan son bilinen durumdan devam eder.

**Masaüstü arayüzü.** C# uygulaması yön, hız ve kipi ayarlar; ayrıca kartı sınamak için LED,
buzzer, hareket sensörü ve hoparlörü de kontrol eder.

## Kullanılan teknolojiler

C, STM32F030, STM32 HAL, RS-485, CRC16, dahili flash, C#, Visual Studio.
