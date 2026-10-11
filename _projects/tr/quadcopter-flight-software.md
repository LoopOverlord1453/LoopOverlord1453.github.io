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

## Platform

| Öğe | Seçim |
|---|---|
| Mikrodenetleyici | STM32F407VG (Cortex-M4F) |
| İşletim sistemi | FreeRTOS |
| Ataletsel sensör | BMI160, 6 eksen ivmeölçer ve jiroskop |
| Barometre | BMP388 |
| Manyetometre | HMC5883L |
| Motor çıkışları | ESC'leri süren zamanlayıcı PWM kanalları |
| Bilgisayar bağlantısı | USB CDC sanal seri port |
| Araç zinciri | STM32CubeIDE, STM32 HAL |

## Mimari

Aracın her işlevi, kendi `Inc` ve `Src` klasörlerine sahip ayrı bir kütüphanedir. Uygulama katmanı
yalnızca bunları birbirine bağlar.

| Modül | İçerik |
|---|---|
| `SensorLibrary` | BMI160, BMP388 ve HMC5883L sürücüleri; her biri port katmanıyla |
| `SensorFusionLibrary` | Tamamlayıcı filtre, 1B Kalman filtresi, Madgwick AHRS, Mahony AHRS |
| `DigitalFilterLibrary` | FIR filtre ve birinci derece RC alçak geçiren filtre |
| `ControllerDriver` | Bağımsız test programıyla PID kontrolcü |
| `FlightInterfaceParser` | Uçuş komut bağlantısı için paket ve komut ayrıştırıcı |
| `FligthControl` | Sensörleri, ESC çıkışlarını ve komut arayüzünü bağlayan yapılar |
| `TaskHandles` | FreeRTOS görev gövdeleri |
| `QuadcopterModel` | Simulink'ten C kodu olarak dışa aktarılmış araç dinamik modeli |
| `SoundEffect` | Durum bildirimi için buzzer tonları |

### Görevler ve zamanlama

Periyodik görevler `vTaskDelay` yerine `vTaskDelayUntil` ile zamanlanır. Bu fark kontrol için
önemlidir: `vTaskDelay` görev gövdesi bittikten sonra sabit bir süre bekler, dolayısıyla periyot
yürütme süresiyle birlikte kayar; `vTaskDelayUntil` ise görevi sabit mutlak anlarda uyandırır.
Kontrol çevrimi ve kestirici sabit bir örnekleme süresi varsayar; bunu sağlayan da budur.

## Sensör katmanı

BMI160 ve BMP388 için Bosch'un resmî sürücüleri kullanılıyor. Üretici kodunu değiştirmek yerine her
sensörün, sürücünün beklediği veri yolu okuma, yazma ve gecikme işlevlerini; ayrıca ilklendirme,
kalibrasyon ve birleşik ivmeölçer-jiroskop okumasını sağlayan ince bir port katmanı vardır. Üretici
sürücüsünü güncellemek veya başka bir mikrodenetleyiciye geçmek yalnızca port dosyasını etkiler.
BMP388 kendi öz sınama (self-test) rutiniyle birlikte gelir.

## Yönelim kestirimi

Aynı donanımda karşılaştırılabilsinler diye dört yaklaşım yan yana gerçeklendi:

| Kestirici | Özelliği |
|---|---|
| Tamamlayıcı filtre | Tümlenmiş jiroskop açısı ile ivmeölçer açısı arasında tek bir karışım katsayısı; en ucuz olanı |
| 1B Kalman filtresi | Kestirim ve ölçüm hatasından hesaplanan kazançla skaler kestirim |
| Madgwick AHRS | İvmeölçer ve manyetometre hatası üzerinde gradyan inişi kullanan kuaterniyon filtresi |
| Mahony AHRS | Yönelim hatası üzerinde oransal-tümlevsel geri beslemeli kuaterniyon filtresi |

Tamamlayıcı filtre girdilerini denetler: boş işaretçi veya 0 ile 1 dışındaki bir karışım katsayısı,
sessizce yanlış açı üretmek yerine hata işleyicisini çağırır.

## Kontrol

PID kontrolcü ders kitabı formülü olarak değil, gerçek bir çevrimde kullanılmak üzere yazıldı:

| Özellik | Neden var |
|---|---|
| Ölçüm üzerinden türev | Referanstaki basamak, çıkışta sıçrama üretmez |
| Bant sınırlı türev | `tau` zaman sabitli alçak geçiren filtre, sensör gürültüsünü türev teriminden uzak tutar |
| Tümlev sınırlama | Anti-windup: çıkış doyduğunda tümlev büyümeyi bırakır |
| Çıkış sınırları | Komut her zaman eyleyicinin aralığında kalır |
| Açık örnekleme süresi | Kontrolcü görev periyoduna bağlıdır |

Ayrı bir test programı kontrolcüyü benzetilmiş birinci derece bir sisteme karşı çalıştırır; ayarlar
motora yaklaşmadan önce bilgisayarda denenebilir.

## Filtreleme

FIR filtre (10 katsayılı, dairesel tamponlu gerçekleme) ve RC alçak geçiren filtre (kesim frekansı
ve örnekleme süresiyle tanımlanır) sensörlerden bağımsızdır. Aynı kod jiroskop verisine, barometre
verisine veya başka herhangi bir sinyale uygulanabilir.

## Durum

Sürücüler, kestiriciler, filtreler, kontrolcü ve RTOS iskeleti hazır. Komut ayrıştırıcı ve uçuş
kontrol katmanı tanımlandı ama henüz tamamlanmadı; görev gövdeleri şimdilik yer tutucu. Hepsinin
kapalı çevrim bir uçuş kontrolcüsünde birleştirilmesi sürüyor; yazılım uçuşta denenmedi.

## Kullanılan teknolojiler

C, STM32F407, FreeRTOS, STM32 HAL, I2C, PWM, USB CDC, STM32CubeIDE.
