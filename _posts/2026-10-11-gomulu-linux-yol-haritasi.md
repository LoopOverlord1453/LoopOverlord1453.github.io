---
layout: post
title: "BeagleBone Green ile Gömülü Linux Öğrenmek: Yol Haritası"
date: 2026-10-11
categories: embedded-linux
lang: tr
permalink: /tr/2026/10/embedded-linux-roadmap/
---

Hedef kart olarak BeagleBone Green kullanacağım bir gömülü Linux serisine başlıyorum. Bu ilk yazı
planı ortaya koyuyor. Aşağıdaki her adım, üzerinde çalışıp tamamladıkça ayrı bir yazıya dönüşecek.

## Neden BeagleBone Green

Kart, eski bir Cortex-A8 işlemci olan TI AM335x üzerine kurulu. Öğrenmek için bu yaş bir avantaj:
donanım baştan sona belgelenmiş, ana hat çekirdek desteği olgun ve karşılaşacağım sorunların
neredeyse tamamı daha önce yazılmış.

## Plan

1. **İlk açılış**: hazır imajı yazmak, seri konsol ve SSH ile bağlanmak, bilgisayarda çapraz
   derleme araç zincirini kurmak.
2. **Kullanıcı alanından çevre birimleri**: GPIO, I2C, SPI ve UART'ı sürmek, birkaç Grove sensörü okumak.
3. **Aygıt ağacı**: kartın aygıt ağacını okumak, ardından bir çevre birimini açan bindirme (overlay) yazmak.
4. **Çekirdek**: çekirdeği kaynaktan derlemek, açmak ve basit bir karakter sürücüsü yazmak.
5. **Önyükleyici**: U-Boot'u derlemek ve güç verilmesinden giriş ekranına kadar açılış sırasını izlemek.
6. **Derleme sistemleri**: Buildroot ile küçük bir özel imaj üretmek, sonra aynısını Yocto ile yapmak.

## Yazıların yapısı

Her yazı aynı düzeni izleyecek:

- **Hedef**: ne yapmak istediğim
- **Adımlar**: çalıştırdığım komutların kendisi
- **Ne ters gitti**: aldığım hatalar, gerçek çıktılarıyla
- **Çözüm**: neyin işe yaradığı ve nedeni

Asıl işe yarayan kısım hatalar olduğu için onları yazıdan çıkarmayacağım.
