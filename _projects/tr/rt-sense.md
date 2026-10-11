---
layout: project
ref: rt-sense
lang: tr
title: "RT-Sense: Quadcopter Sensör Kütüphanesi"
permalink: /tr/projects/rt-sense/
---

## Hedef

Bir uçuş kontrolcüsü ancak ölçümlerinin zamanlaması kadar iyidir. RT-Sense bu gereksinim için
yazılmış bir sensör sürücü takımıdır: her sensör veri hazır kesmesi üretir; yazılım örneği
yoklayarak değil, örnek oluştuğu anda okur.

## Sensörler ve yapılandırma

| Sensör | Görev | Yapılandırma |
|---|---|---|
| BMP388 | Barometrik basınç ve sıcaklık | 50 Hz çıkış, basınç aşırı örnekleme ×8, IIR filtre katsayısı 3, yaklaşık 11 cm RMS irtifa gürültüsü |
| BMI160 | 6 eksen ivmeölçer ve jiroskop | İvmeölçer ±16 g, 1600 Hz; jiroskop ±2000 °/s, 3200 Hz |
| HMC5883L | 3 eksen manyetometre | Aşırı örnekleme ×8, 160 Hz çıkış |

Üçü de veri hazır pinini kesme kaynağı olarak kullanır.

## Nasıl kuruldu

**Bağımlılıksız, taşınabilir C.** Sürücüler belirli bir HAL'e bağlı değildir. STM32 HAL ile veya
diğer ARM Cortex-M işlemcilerde bare-metal I2C ve SPI rutinleriyle kullanılabilir.

**Resmî sürücüler, temiz taşıma.** BMP388 ve BMI160 sürücüleri Bosch'un resmî kütüphaneleridir.
Üretici kodunu değiştirmek yerine ayrı bir port katmanı üzerinden STM32'ye taşıdım; bu, ilerideki
sürücü güncellemelerini kolaylaştırır.

**Varsayılan değil, seçilmiş ayarlar.** Tablodaki aşırı örnekleme, filtre ve çıkış hızı değerleri
quadcopter için seçildi: yönelim çevrimi için hızlı ataletsel veri, irtifa için daha yavaş ve iyi
filtrelenmiş barometre.

## Planlanan eklemeler

INA219 akım ölçer, BNO055 yönelim sensörü, BMP180 barometre ve HC-SR04 ultrasonik mesafe sensörü.

## Diğer projelerle ilişkisi

Bu kütüphane,
[quadcopter uçuş yazılımının]({{ '/tr/projects/quadcopter-flight-software/' | relative_url }})
sensör katmanını oluşturur.

## Kullanılan teknolojiler

C, STM32F4, I2C, SPI, STM32CubeIDE.
