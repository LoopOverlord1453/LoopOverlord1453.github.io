---
layout: project
ref: signal-processing-studio
lang: tr
title: Sinyal İşleme Stüdyosu
permalink: /tr/projects/signal-processing-studio/
---

## Problem

Gömülü projelerde algoritma genellikle bir araçta tasarlanır, canlı veri başka bir araçla izlenir,
C kodu ise en sonda elle yazılır. Her geçiş, tasarım ile yazılımın fark edilmeden birbirinden
ayrılabileceği bir noktadır: bir katsayı farklı yuvarlanır, bir örnekleme hızı varsayılır, bir
işaret kuralı ters çevrilir.

Sinyal İşleme Stüdyosu bu yolun tamamını tek pencerede toplar. Karttan gelen gerçek sinyali
izlersiniz, filtreyi, kestiriciyi veya kontrolcüyü bu veri üzerinde tasarlarsınız ve geldiği
tasarımla karşılaştırılarak doğrulanmış C kodunu dışa aktarırsınız.

## Genel bakış

| Bölüm | Yetenek |
|---|---|
| Canlı izleme | Çok akışlı UDP alıcı, zaman ve spektrum grafikleri, kesin örnek kaybı sayımı |
| Kayıt | `.sptr` dosyasına kayıpsız kayıt; 0,25× ile 10× arası hızda, sarma ve döngüyle oynatma |
| İnceleme | Canlı akışı dondurup, alım sürerken anlık görüntü üzerinde analiz |
| Filtre tasarımcısı | IIR, FIR ve özel amaçlı filtreler; genlik, faz, grup gecikmesi, kutup-sıfır |
| Sensör füzyonu | Yönelim, irtifa, 2B konum ve genel çok sensörlü Kalman senaryoları |
| Sinyal üreteci | DAC için dalga şekli tasarımı ve nicemleme analizi |
| Kontrol tasarımı | Modeller, sistem tanımlama, analiz, kontrolcü tasarımı, MPC, blok diyagram |
| Kod üretimi | Filtre, füzyon, kontrolcü, MPC ve DAC tabloları için C kodu; ölçülmüş bellek kullanımı |

![Filtre tasarımcısı]({{ '/assets/img/projects/sps-filter.png' | relative_url }})

## Veri protokolü: SPTF

Böyle bir araç ancak yeni bir cihaz hiçbir ayar yapmadan bağlanabiliyorsa işe yarar. Bu yüzden
akışın kendini tanımladığı ikili bir çerçeve formatı, SPTF'yi tasarladım.

| Özellik | Tasarım |
|---|---|
| Çerçeve türleri | `DESCRIPTOR` (akış yapısı), `DATA` (örnekler), `MARKER` (kod ve metinli hata ayıklama olayı) |
| Başlık | Sabit 32 bayt, little-endian, hizalama dolgusu yok |
| Kendini tanımlama | Örnekleme hızı, kanal sayısı, veri tipi, kanal adları, birimler, ölçek ve ofset |
| Veri tipleri | 17 tip: 8–64 bit tam sayı, 24 bit paketli, float16/32/64, karmaşık I/Q |
| Yerleşim | Sıralı (interleaved) veya düzlemsel (planar) kanallar |
| Kayıp tespiti | 64 bitlik `first_sample` sayacı eksik örnek sayısını tam olarak verir |
| Bütünlük | İsteğe bağlı CRC-32 |
| Verimlilik | Standart 1472 baytlık datagramda %96,5 yararlı yük |
| Ortadan katılma | Tanımlayıcı saniyede en az bir kez tekrarlanır; alıcı akışın ortasında bağlanabilir |
| Taşıma | Aynı çerçeve UDP'de ve kayıt dosyasında değiştirilmeden kullanılır |

Bir cihaz, her biri kendi hızında ve tipinde birden çok akış gönderebilir; 25,6 kHz'lik titreşim
kanalı ile 10 Hz'lik sıcaklık kanalı aynı bağlantıyı bu sayede paylaşır.

## Mimari: arayüzü kilitleyemeyen alıcı

Gigabit hızında standart MTU'lu bir hat saniyede yaklaşık 80.000 datagram getirir. Alım ile arayüz
aynı Python sürecinde olursa yorumlayıcı kilidini de paylaşır ve arayüz meşgul olduğunda alım
takılır. Bu yüzden ayrı süreçlerde çalışırlar.

```
UDP / .sptr dosyası ──► alıcı süreci ──► paylaşımlı bellek (akış başına halka tampon)
                        doğrulama, kayıp          ▲
                        sayımı, kayıt             │ kopyasız okuma, ~30 kare/s
                              │ olay kuyruğu      │
                              └─────────────► arayüz süreci (paneller, grafikler)
```

- Alıcı, sıcak yolda NumPy nesnesi oluşturmadan baytları doğrudan paylaşımlı belleğe kopyalar;
  paket başına yaklaşık 4 µs.
- Kayıt oynatma canlı alımla aynı saklama katmanından geçer; kayıttan analiz, canlı analizle
  birebir aynı davranır.
- Grafikler tepe korumalı en küçük/en büyük seyreltmeyle piksel sayısına indirgenir; daha az nokta
  çizildiği için bir sıçrama kaybolmaz.

**8 çekirdekli Windows 11 makinede ölçülen değerler:**

| Senaryo | Alınan | Kayıp |
|---|---|---|
| 115 MB/s, 1472 baytlık datagramlar, saniyede yaklaşık 77.000 datagram | 113,3 MB/s | 115 milyon örnekte 0 |
| 115 MB/s, 8972 baytlık jumbo çerçeveler | 113,5 MB/s | 0 |
| 115 MB/s, 65.507 baytlık datagramlar | 113,5 MB/s | 0 |

Gigabit testinde darboğaz alıcı değil, Python göndericisiydi: hattı doldurmak için üç göndericiyi
paralel çalıştırmak gerekti.

## Filtre tasarımı

- Alışılmış yöntem ve bant tipleriyle **IIR ve FIR tasarımı**, ayrıca özel amaçlı filtreler.
- **Analiz görünümleri:** genlik, faz, grup gecikmesi ve kutup-sıfır haritası; parametre değiştikçe güncellenir.
- **Canlı uygulama:** filtreler durumlarını bloklar arasında korur; blok sınırlarında süreksizlik
  olmaz. Ham ve filtrelenmiş eğriler birlikte gösterilir.
- **İşlem zinciri:** art arda birkaç aşama, sırası değiştirilebilir, geri al ve yinele destekli.
- **Sabit noktalı dışa aktarma:** katsayılar float64, float32, Q31 veya Q15 olarak; CSV ya da
  CMSIS-DSP'nin beklediği düzende C başlık dosyası. Elle yapıldığında kolayca karıştırılan işaret
  ve sıralama kuralları araç tarafından uygulanır.
- **Nicemlemenin görünür olması:** tasarımcı, nicemlenmiş katsayıların cevabını ideal cevabın
  üzerine çizer. Q31'de 1e-4 dB doğruluktaki 8. derece eliptik filtre Q15'te gözle görülür biçimde
  sapar; araç bunu filtre donanıma ulaşmadan gösterir.

## Sensör füzyonu

![Sensör füzyonu]({{ '/assets/img/projects/sps-fusion.png' | relative_url }})

Dört hazır senaryo vardır; her birinde birkaç algoritma aynı veri üzerinde yan yana çalışır:

| Senaryo | Girdiler | Algoritmalar |
|---|---|---|
| Yönelim | Jiroskop, ivmeölçer, isteğe bağlı manyetometre | Mahony, Madgwick, eksen başına Kalman, çarpımsal EKF, UKF, parçacık filtresi |
| İrtifa | Barometre, dikey ivme | Tamamlayıcı, doğrusal KF, basınç ölçüm modelli EKF, UKF, parçacık filtresi |
| 2B konum | GNSS, sapma hızı, odometri hızı | Ölü hesap, EKF, UKF, parçacık filtresi |
| Doğrusal çok sensörlü | Bir ile altı arası konum, hız veya ivme sensörü | Ağırlıklı ortalama, Kalman filtresi, parçacık filtresi |

Kanallar adlarından ve birimlerinden otomatik eşlenir. 100 Hz'lik akıştaki 5 Hz'lik GNSS gibi
seyrek sensörler eksik ölçüm olarak ele alınır. Kayıtta referans varsa araç her algoritma için
çıktı başına RMS ve en büyük hatayı verir; "hangi filtreyi kullanmalıyım?" sorusu böylece bir
ölçüme dönüşür. Yönelim için kestirilen duruşun üç boyutlu görünümü de vardır.

## Sinyal üreteci

DAC'ın üreteceği dalga şeklini tasarlar: standart şekiller, chirp ve kullanıcı tanımlı formüller.
Araç DAC çözünürlüğünü ve sıfır dereceli tutucuyu modeller, frekans hatasını en aza indiren tablo
uzunluğunu seçer, STM32 zamanlayıcısının ön bölücü ve yeniden yükleme değerlerini hesaplar ve
nicemlenmiş çıkışın THD, SFDR, SNR, SINAD ve ENOB değerlerini bildirir. Sonuç C tablosu olarak
dışa aktarılır.

## Kontrol tasarımı

![Kontrolcü tasarımı]({{ '/assets/img/projects/sps-control.png' | relative_url }})

Çalışma alanı mühendislik sırasını izler: modeli elde et, analiz et, kontrolcüyü tasarla, benzetimini yap.

- **Modeller:** transfer fonksiyonu, sıfır-kutup-kazanç ve durum uzayı biçimleri; dönüşüm ve ayrıklaştırma.
- **Sistem tanımlama:** kayıtlı veya canlı veriden ARX, ARMAX, çıkış hatası, Box-Jenkins, alt uzay
  ve doğrusal olmayan ARX kestirimi.
- **Analiz:** adım cevabı, Bode, Nyquist, kutup-sıfır haritası, kararlılık payları, adım ölçütleri.
- **Klasik tasarım:** hedef geçiş frekansı ve faz payına göre PID ayarı, ileri-geri ve çentik
  kompansatörler, kök yer eğrisi.
- **Modern tasarım:** LQR, LQI, kutup yerleştirme, Kalman filtresi, LQG.
- **Model öngörülü kontrol:** kendi QP çözücüsüyle kısıtlı doğrusal MPC.
- **Blok diyagram:** sabit ve değişken adımlı çözücülere sahip sürükle-bırak düzenleyici; seçilen
  noktalar arasında doğrusallaştırma.
- **İHA şablonları:** kademeli quadrotor otopilotu, quadrotor için LQR ve MPC, ardışık döngü
  kapamayla sabit kanat otopilotu.

![Blok diyagram düzenleyici]({{ '/assets/img/projects/sps-diagram.png' | relative_url }})

### Sayılara nasıl güveniliyor

Biraz yanlış sonuç veren kontrol yazılımı, hiç olmamasından kötüdür. Bu yüzden her belirlenimci
hesap MATLAB ile karşılaştırılır. Yardımcı bir betik MATLAB'i toplu kipte çalıştırıp sonuçları JSON
olarak saklar; testler bu dosyaları okur, böylece test paketi MATLAB kurulu olmadan da çalışır.

- Kapalı biçimli sonuçlar (ayrıklaştırma, paylar, LQR, kutup yerleştirme, adım ve Bode cevapları)
  1e-8 göreli toleransla eşleşmelidir.
- Yinelemeli kestiriciler (ARMAX, çıkış hatası, Box-Jenkins, MPC'nin QP'si) aynı en iyi noktaya
  1e-5 ile 1e-4 arasında ulaşmalıdır.
- MATLAB'in yöntemi yayımlanmamışsa (otomatik PID ayarı gibi) test, birebir aynı çıktıyı iddia
  etmek yerine belirtilen hedefin tutturulduğunu denetler; belgede de bu açıkça yazılıdır.

## Kod üretimi

Üretilen C kodu doğrudan mikrodenetleyicileri hedefler ve dinamik bellek kullanmaz. Pencere
çekirdeği (Cortex-M0+, M3, M4F, M7, M33F, ESP32 veya RISC-V), derleyiciyi, optimizasyon düzeyini ve
float ya da double seçimini sorar; ardından başlık ve kaynak dosyalarını, örnek ana döngüyü ve
kullanım kılavuzunu üretir.

Onu farklı kılan, kaynak değerlerinin tahmin değil ölçüm olmasıdır:

- **Flash ve RAM:** üretilen kod bilgisayarda `arm-none-eabi-gcc` ve `clang` ile derlenir, nesne
  boyutu geri okunur. RAM, durum yapısının boyutudur.
- **Yığın:** en kötü çağrı yolu, bağlanmış imajın makine kodu dökümünden çıkarılır.
- **İşlemci maliyeti:** adım başına işlem sayıları, aynı C kodunun sayan bir sayı tipiyle
  derlenmesiyle ölçülür; seçilen çekirdek ve saat için mikrosaniyeye çevrilir.
- **Eşdeğerlik:** testler C çıktısının Python başvurusuyla örtüştüğünü doğrular; yönelimde çift
  duyarlıkta yaklaşık 1e-14 rad.
- **Uyarılar:** kod, desteklenen çekirdeklerde ve iki derleyicide `-Wall -Wextra -pedantic -Werror`
  altında uyarısız derlenir.

Derleyicisi kurulu olmayan çekirdeklerin değerleri arayüzde tahmin olarak etiketlenir.

## Test

Projede kırktan fazla test modülünden oluşan bir pytest paketi vardır: protokol (bayt bayt eşleşen
test vektörü ve bozuk çerçeveler dahil), filtreler, canlı filtreleme, sensör füzyonu, sinyal
üreteci, kontrol kütüphanesi, MPC, blok diyagram motoru, İHA modelleri, üretilen C kodu ve gerçek
UDP soketleri üzerinden uçtan uca çalıştırmalar. Şebeke ölçümünden I/Q verisine ve referanslı IMU
kayıtlarına uzanan on üç örnek kayıt, her şeyin donanım olmadan denenmesini sağlar.

## Kullanılan teknolojiler

Python 3.14, PyQt6, pyqtgraph, NumPy, SciPy. LGPL 2.1 lisanslıdır.
