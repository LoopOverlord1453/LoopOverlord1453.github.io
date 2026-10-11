---
layout: project
ref: stm32f407-bare-metal
lang: tr
title: STM32F407 Bare-Metal Sürücü Kütüphanesi
permalink: /tr/projects/stm32f407-bare-metal/
---

## Zaten var olan sürücüleri neden yazdım

Üretici HAL'i bir çevre birimini hızla çalıştırır, ama donanımın ne yaptığını da gizler. Bu
kütüphaneyi, STM32F407'yi sorunların gerçekten ayıklandığı düzeyde öğrenmek için yazdım: başvuru
kılavuzu, saat ağacı ve tek tek yazmaç bitleri.

## İçerik

| Sürücü | Kapsam |
|---|---|
| RCC | Saat yapılandırması ve çevre birimi saat kontrolü |
| GPIO | Pin yapılandırması, okuma ve yazma |

Proje yalnızca CMSIS çekirdek ve aygıt başlıklarını kullanır; bunlar yazmaç tanımlarından başka bir
şey sağlamaz. Altında STM32 HAL veya LL katmanı yoktur. Depodaki örnek uygulamalar sürücüleri
kullanır; bunların arasında bir kesme örneği ve bir saat yapılandırma örneği bulunur.

## Yaklaşım

- Her sürücünün, yapılandırma yapılarını tanımlayan bir başlık dosyası ve yazmaçlara yazan bir
  kaynak dosyası vardır.
- Yazmaç erişimi CMSIS aygıt tanımları üzerinden yapılır; her satır başvuru kılavuzuyla karşılaştırılabilir.
- Başlangıç dosyası ve bağlayıcı betikleri projenin parçasıdır; sıfırlama vektöründen `main`'e
  uzanan yol görünürdür.

## Durum

RCC ve GPIO tamamlandı. Kütüphane bir öğrenme projesidir; yeni çevre birimlerine ihtiyaç duydukça
genişletiyorum.

## Kullanılan teknolojiler

C, STM32F407, CMSIS, STM32CubeIDE.
