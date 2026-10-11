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
ayrılabileceği bir noktadır.

Sinyal İşleme Stüdyosu bu üç adımı tek pencerede toplar: karttan gelen gerçek sinyali izle,
filtreyi, kestiriciyi veya kontrolcüyü bu veri üzerinde tasarla ve tasarımla birebir örtüşen C
kodunu dışa aktar.

## Ne yapar

| Bölüm | Yetenek |
|---|---|
| Canlı izleme | Çok akışlı UDP alıcı, zaman ve spektrum grafikleri, kesin örnek kaybı sayımı, kayıt ve oynatma |
| Filtre tasarımcısı | IIR, FIR ve özel filtreler; genlik, faz, grup gecikmesi ve kutup-sıfır görünümleri; canlı akışa uygulama |
| Sensör füzyonu | Mahony, Madgwick, Kalman, EKF, UKF ve parçacık filtresi yan yana, referansa göre puanlanır |
| Sinyal üreteci | DAC için dalga şekli tasarımı ve nicemleme analizi: THD, SNR, ENOB |
| Kontrol tasarımı | Model çalışma alanı, sistem tanımlama, analiz, PID, kompansatör, durum geri beslemesi, MPC |
| Blok diyagram | Sürükle-bırak benzetim, doğrusallaştırma, quadrotor ve sabit kanat otopilot şablonları |
| Kod üretimi | Filtre, füzyon, kontrolcü ve MPC için C kodu; mikrodenetleyiciye göre maliyet tahmini |

![Filtre tasarımcısı]({{ '/assets/img/projects/sps-filter.png' | relative_url }})

## Nasıl kuruldu

**Kendini tanımlayan bir veri protokolü.** Aracın yeni bir cihaz için yapılandırma istememesi
amacıyla SPTF adında ikili bir çerçeve formatı tasarladım. Her akış kendi örnekleme hızını, kanal
sayısını, veri tipini, birimini ve ölçeğini bildirir. Sabit 32 baytlık başlık yükü düşük tutar;
17 veri tipi 8 bit tam sayıdan 24 bit paketli sese ve karmaşık I/Q verisine kadar her şeyi kapsar;
64 bitlik örnek sayacı sayesinde alıcı kaç örneğin kaybolduğunu tahmin etmez, tam olarak bildirir.

**Arayüzü kilitleyemeyen bir alıcı.** UDP alıcısı ayrı bir süreçte çalışır ve örnekleri paylaşımlı
bellekteki halka tamponlara yazar. Arayüz bu tamponları saniyede yaklaşık otuz kez okur. Böylece
yavaş bir çizim paket düşürmez ve Python'ın genel yorumlayıcı kilidi veri yolunda yer almaz.

**Durum taşıyan filtreler.** Canlı filtreler iç durumlarını bloklar arasında korur; çalışan bir
akışa filtre uygulandığında blok sınırlarında süreksizlik oluşmaz.

![Sensör füzyonu]({{ '/assets/img/projects/sps-fusion.png' | relative_url }})

## Sensör füzyonu

Altı yönelim algoritması aynı kayıt üzerinde aynı anda çalışır. Kayıtta referans yönelim varsa
araç her algoritmanın RMS hatasını verir; böylece "hangi filtreyi kullanmalıyım?" sorusu bir
ölçüme dönüşür. Yönelimin ötesinde irtifa (barometre ve ivmeölçer), 2B konum (GNSS, jiroskop ve
odometri) ve genel doğrusal çok sensörlü Kalman filtresi senaryoları vardır. Seçilen algoritma C
kodu olarak dışa aktarılır.

## Kontrol tasarımı

Kontrol çalışma alanı alışılmış mühendislik sırasını izler: modeli kur veya tanımla, analiz et,
kontrolcüyü tasarla, benzetimini yap.

- **Sistem tanımlama:** ARX, ARMAX, çıkış hatası, Box-Jenkins, alt uzay ve doğrusal olmayan modeller
- **Klasik tasarım:** kök yer eğrisi, Bode, Nyquist, kararlılık payları, otomatik PID ayarı
- **Modern tasarım:** LQR, LQI, kutup yerleştirme, Kalman filtresi, LQG
- **Model öngörülü kontrol:** kendi QP çözücüsüyle kısıtlı doğrusal MPC
- **Blok diyagram:** sabit ve değişken adımlı çözücüler, seçilen noktalar arasında doğrusallaştırma

![Kontrolcü tasarımı]({{ '/assets/img/projects/sps-control.png' | relative_url }})

![Blok diyagram düzenleyici]({{ '/assets/img/projects/sps-diagram.png' | relative_url }})

## Kod üretimi

Üretilen C kodu doğrudan mikrodenetleyicileri hedefler. Araç, kodla birlikte seçilen çekirdekte
(Cortex-M0+'tan Cortex-M7'ye) bir güncelleme adımının maliyetini, algoritmanın yaptığı kayan nokta
işlemlerini sayarak tahmin eder. Bu değerler arayüzde tahmin olarak etiketlenir.

## Test

Sayısal çekirdek, kırktan fazla modülden oluşan bir pytest paketiyle sınanır: LTI analizi,
ayrıklaştırma, frekans ve zaman cevabı, sistem tanımlama, MPC ve QP çözücüsü, blok diyagram motoru,
İHA modelleri ve üretilen C kodu.

## Kullanılan teknolojiler

Python 3.14, PyQt6, pyqtgraph, NumPy, SciPy. LGPL 2.1 lisanslıdır.
