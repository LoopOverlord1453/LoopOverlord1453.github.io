---
layout: project
ref: quadcopter-flight-software
lang: tr
title: Gerçek Zamanlı Quadcopter Uçuş Yazılımı
permalink: /tr/projects/quadcopter-flight-software/
---

## Hedef

Bir quadcopterin uçuş yazılımını sensör sürücülerinden başlayarak yazmak; bunu yaparken her
parçanın tek bir büyük `main.c` içinde değil, kendi başına geliştirilip sınanabildiği bir yapı kurmak.

## Mimari

Yazılım STM32F407 üzerinde FreeRTOS altında çalışır. Periyodik görevler `vTaskDelayUntil` ile
zamanlanır; böylece görev gövdesi ne kadar sürerse sürsün periyot sabit kalır. Aracın her işlevi
kendi başlık ve kaynak dosyalarına sahip ayrı bir kütüphanedir:

| Modül | İçerik |
|---|---|
| Sensör kütüphanesi | BMI160 IMU, BMP388 barometre, HMC5883L manyetometre |
| Sensör füzyon kütüphanesi | Tamamlayıcı filtre, 1B Kalman filtresi, Madgwick AHRS, Mahony AHRS |
| Sayısal filtre kütüphanesi | FIR filtre ve birinci derece RC alçak geçiren filtre |
| Kontrolcü sürücüsü | Bağımsız test dosyasıyla PID kontrolcü |
| Uçuş arayüzü ayrıştırıcısı | Gelen uçuş komutlarının ayrıştırılması |
| Uçuş kontrol | Sensörleri, ESC çıkışlarını ve komut arayüzünü bir araya getiren yapılar |
| Quadcopter modeli | Simulink'ten C kodu olarak dışa aktarılmış araç dinamik modeli |
| Ses efekti | Durum bildirimi için buzzer tonları |

Motor çıkışları zamanlayıcı PWM kanallarını kullanır; USB CDC aygıtı bilgisayarla bağlantı sağlar.

## Tasarım kararları

**Üretici sürücülerinin altında port katmanı.** BMI160 ve BMP388 için Bosch'un resmî sürücüleri
kullanılıyor. Bunları değiştirmek yerine veri yolu okuma, yazma ve gecikme işlevlerini sağlayan
ince bir port katmanı yazdım. Üretici sürücüsünü güncellemek veya başka bir mikrodenetleyiciye
geçmek yalnızca port dosyasını etkiler.

**Aynı amaç için birden çok kestirici.** Dört yönelim kestirimi yaklaşımı yan yana gerçeklendi.
Böylece basit bir tamamlayıcı filtre ile Madgwick ve Mahony aynı donanımda karşılaştırılabiliyor
ve seçim veriye dayanıyor.

**Filtreleme ayrı bir kütüphane.** FIR ve RC filtreler sensörlerden bağımsızdır; aynı kod jiroskop
verisine, barometre verisine veya başka herhangi bir sinyale uygulanabilir.

## Durum

Sürücüler, kestiriciler, filtreler, kontrolcü ve RTOS iskeleti hazır. Bunların eksiksiz bir kapalı
çevrim uçuş kontrolcüsünde birleştirilmesi sürüyor; yazılım henüz uçuşta denenmedi.

## Kullanılan teknolojiler

C, STM32F407, FreeRTOS, STM32 HAL, STM32CubeIDE.
