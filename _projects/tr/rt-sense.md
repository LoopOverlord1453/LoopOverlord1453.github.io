---
layout: project
ref: rt-sense
lang: tr
title: "RT-Sense: Quadcopter Sensör Kütüphanesi"
permalink: /tr/projects/rt-sense/
---

## Hedef

Bir uçuş kontrolcüsü ancak ölçümlerinin zamanlaması kadar iyidir. Kestirici, jiroskop örneklerini
eşit aralıklı varsayarak tümler; bir örnek geç okunursa veya iki kez okunursa, tek tek sayıların
hepsi doğru olsa bile yönelim kestirimi yanlış çıkar.

RT-Sense bu gereksinim için yazılmış bir sensör sürücü takımıdır. Her sensör veri hazır kesmesi
üretir; yazılım örneği yoklayarak değil, örnek oluştuğu anda okur.

## Sensörler ve yapılandırma

| Sensör | Görev | Yapılandırma |
|---|---|---|
| BMP388 | Barometrik basınç ve sıcaklık | 50 Hz çıkış, basınç aşırı örnekleme ×8, sıcaklık aşırı örnekleme ×1, IIR filtre katsayısı 3, yaklaşık 11 cm RMS irtifa gürültüsü |
| BMI160 | 6 eksen ivmeölçer ve jiroskop | İvmeölçer ±16 g, 1600 Hz; jiroskop ±2000 °/s, 3200 Hz |
| HMC5883L | 3 eksen manyetometre | Aşırı örnekleme ×8, 160 Hz çıkış |

Üçü de veri hazır pinini kesme kaynağı olarak kullanır.

### Bu ayarlar neden seçildi

Değerler varsayılanda bırakılmadı, quadcopter için seçildi:

- **Ataletsel veri hızlıdır.** Yönelim çevrimi açısal hızı olabildiğince az gecikmeyle ister; bu
  yüzden jiroskop 3200 Hz, ivmeölçer 1600 Hz çalışır ve sert manevralarla titreşim sensörü
  doyurmasın diye en geniş aralıklar kullanılır.
- **Barometre yavaş ve düzgündür.** İrtifa yavaş değişir, ham basınç ise gürültülüdür. Sekiz kat
  aşırı örnekleme ve sensörün dahili IIR filtresi, 50 Hz güncelleme hızında irtifa gürültüsünü
  yaklaşık 11 cm'ye indirir; irtifa çevrimi için fazlasıyla yeterlidir.
- **Manyetometre ortalama alır.** Baş açısı yavaş düzeltilir; sekiz örnekli ortalama, bant
  genişliğinden vererek daha temiz bir alan ölçümü sağlar.

## Nasıl kuruldu

**Bağımlılıksız, taşınabilir C.** Sürücüler belirli bir HAL'e bağlı değildir. STM32 HAL ile veya
diğer ARM Cortex-M işlemcilerde bare-metal I2C ve SPI rutinleriyle kullanılabilir.

**Resmî sürücüler, temiz taşıma.** BMP388 ve BMI160 sürücüleri Bosch'un resmî kütüphaneleridir.
Üretici kodu değiştirilmeden, ayrı bir port katmanı üzerinden STM32'ye taşındı. BMI160 için port
katmanı şunları sağlar:

| İşlev | Amaç |
|---|---|
| Veri yolu okuma ve yazma | Bosch sürücüsüne verilen I2C bellek erişim rutinleri |
| Gecikme | Milisaniye gecikme geri çağrısı |
| Arayüz ilklendirme | Cihazın yanıt verdiğini denetler, ardından aralık, hız ve bant genişliği ayarlarını uygular |
| Kalibrasyon | Ofsetleri gidermek için seçilen süre boyunca örneklerin ortalamasını alır |
| Birleşik okuma | İvmeölçer ve jiroskop verisini tek çağrıda getirir |

Bunların tek dosyada toplanması, üreticinin yeni sürücü sürümünün uygulama koduna dokunmadan
eklenebilmesini sağlar.

**Sensör başına bir proje.** Her sensörün kendi STM32CubeIDE projesi vardır; sürücü diğerleriyle
birleştirilmeden önce masada tek başına çalıştırılıp doğrulanabilir, okumalar USB CDC üzerinden
bilgisayara aktarılır.

## Planlanan eklemeler

INA219 akım ölçer, BNO055 yönelim sensörü, BMP180 barometre ve HC-SR04 ultrasonik mesafe sensörü.

## Diğer projelerle ilişkisi

Bu kütüphane,
[quadcopter uçuş yazılımının]({{ '/tr/projects/quadcopter-flight-software/' | relative_url }})
sensör katmanını oluşturur.

## Kullanılan teknolojiler

C, STM32F407, STM32 HAL, I2C, SPI, harici kesmeler, USB CDC, STM32CubeIDE.
