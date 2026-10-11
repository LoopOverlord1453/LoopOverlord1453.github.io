---
layout: project
ref: arm-motion-control
lang: tr
title: ARM Motion Control
permalink: /tr/projects/arm-motion-control/
---

## Görev

2024 yaz stajımda, DC motorla mekanik bir kolu süren motor hareket kartının gömülü yazılımını ve
bilgisayar yazılımını geliştirdim. Operatör kolun her yöne kaç tur atacağını belirler; kartta
ayrıca hareket sensörü girişi ile LED, buzzer ve hoparlör çıkışları bulunur.

## Sistem özeti

| Bölüm | Gerçekleme |
|---|---|
| Denetleyici | Özel motor hareket kartı üzerinde STM32F030C8T6 (Cortex-M0) |
| Bilgisayar arayüzü | C# (WinForms) ile yazılmış Windows masaüstü uygulaması |
| Bağlantı | Yarı çift yönlü RS-485 fiziksel katmanı üzerinde UART |
| Bütünlük | Her pakette CRC16 |
| Kalıcılık | Parametreler dahili flash'ın son sayfasında saklanır |
| Girişler | RS-485 komutları, harici kesmede hareket sensörü |
| Çıkışlar | DC motor, iki LED, buzzer, hoparlör |
| Güç | 12 V DC besleme |

## Paket protokolü

Bilgisayar ile kart, sabit 10 baytlık paketler alışverişi yapar. Ayırıcılar, yakalanan bir akışın
lojik analizörde okunmasını kolaylaştırır; CRC kendinden önceki her şeyi kapsar.

![Paket biçimi]({{ '/assets/img/projects/arm-packet-format.png' | relative_url }})

| Bayt | Alan | Değer |
|---|---|---|
| 0 | Başlık | `$` |
| 1 | Ayırıcı | `,` |
| 2 | Komut | Alt sistem kimliği |
| 3 | Ayırıcı | `,` |
| 4–5 | Veri | İki veri baytı |
| 6 | Ayırıcı | `,` |
| 7 | Kuyruk | `!` |
| 8–9 | CRC16 | Önce yüksek, sonra düşük bayt |

Her alt sistemin kendi komut kimliği vardır: hoparlör, her bir LED, buzzer, motor durdurma, motor
elle kipi ve motor otomatik kipi. Motor komutlarında ileri ve geri tur sayıları tek bir veri
baytının üst ve alt dört bitine paketlenir.

İkinci bir komut grubu **öz sınama** yapar: LED testi, buzzer testi, hoparlör testi, motor testi
ve tam sistem testini başlatıp durduran komutlar. Bunlar, kartın montajdan sonra özel bir yazılım
derlemesi gerekmeden bilgisayardan denetlenmesini sağlar.

## Gömülü yazılımın yapısı

Yazılım, tek bir uygulama katmanının altında bağımsız sürücülere ayrılmıştır:

| Modül | Sorumluluk |
|---|---|
| `rs485` | Yön kontrolü, bayt alımı, paket ayrıştırıcı, CRC denetimi |
| `crc16` | Sağlama toplamı hesabı |
| `flash` | Saklanan parametreler için sayfa silme, yazma ve okuma |
| `main_app` | Komut dağıtımı, motor sıralaması, alt sistem kontrolü, öz sınamalar |

**Bloklamadan alım.** Baytlar UART alım kesmesiyle birer birer gelir. Hiçbir şey paketin tamamını
beklemez.

**Durum makinesi olarak kurulmuş ayrıştırıcı.** Alınan her bayt, küçük bir durum makinesini başlık,
komut, veri, kuyruk ve CRC durumlarında ilerletir ve biçimi adım adım denetler. Sağlama toplamı
ancak son CRC baytı geldikten sonra ilk sekiz bayt üzerinden hesaplanıp karşılaştırılır; yalnızca
hem biçim hem CRC denetimini geçen paket komut dağıtıcısına verilir.

**Yarı çift yönlü yön kontrolü.** RS-485 iki yön için tek bir tel çiftini paylaşır. Gönderim rutini
alıcı-vericinin yön pinini yükseltir, gönderir ve yeniden düşürür; kart hattı yalnızca gerçekten
gönderim yaparken sürer.

## Elektrik kesintisinden sonra toparlanma

Normalde böyle bir sistemin her kesintiden sonra bilgisayardan yeniden ayarlanması gerekir. Burada
geçerli kip ve parametreler her değiştiğinde ayrılmış bir flash sayfasına yazılır: motor otomatik
veya elle kipe girdiğinde, durduğunda ve çalışma sırasında yeni bir komut geldiğinde. Açılışta
yazılım bu sayfayı motor nesnesine geri okur ve operatör olmadan son bilinen durumdan devam eder.

Bunun için son flash sayfasının ayrılması, saklanan veriyi program imajından uzak tutar.

## Masaüstü arayüzü

C# uygulaması kullanılabilir seri portları listeler, seçileni istenen baud hızında açar ve her
paketi operatörün girdisinden kurar: sekiz yük baytını oluşturur, CRC16'yı hesaplar, sona ekler ve
on baytı porta yazar. Gelen veri bir günlük penceresinde gösterilir. Düğmeler her alt sistemi ve
iki motor kipini kapsar; kart ham bayt yazmadan sınanabilir.

Depodaki bir başvuru dosyası, CRC değerleri önceden hesaplanmış hazır paketleri listeler; bu,
gömülü yazılımdaki ayrıştırıcının herhangi bir seri terminalden sınanmasını sağlar.

## Kullanılan teknolojiler

C, STM32F030, STM32 HAL, UART, RS-485, CRC16, dahili flash, harici kesmeler, C#, WinForms,
Visual Studio.
