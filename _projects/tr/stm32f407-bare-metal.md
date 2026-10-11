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

Proje yalnızca CMSIS çekirdek ve aygıt başlıklarını kullanır; bunlar yazmaç tanımlarından başka bir
şey sağlamaz. Altında STM32 HAL veya LL katmanı yoktur.

| Sürücü | Kapsam |
|---|---|
| RCC | Osilatör seçimi, PLL yapılandırması, sistem saati geçişi, veri yolu bölücüleri, saat çıkışı |
| GPIO | İlklendirme yapısı üzerinden pin yapılandırması |

## Saat sürücüsü

RCC sürücüsü ikisinin büyük olanıdır, çünkü saati doğru kurulmadan çipte başka hiçbir şey çalışmaz.

| Bölüm | Ne yapar |
|---|---|
| Osilatör kontrolü | Dahili (HSI) ve harici (HSE) osilatörleri bypass'lı veya bypass'sız açar, kapatır |
| PLL | Kaynağı ve M, N, P, Q çarpanlarını ayarlar |
| Sistem saati | Sistem saat kaynağı olarak HSI, HSE veya PLL'i seçer |
| Veri yolu bölücüleri | AHB, APB1 ve APB2 bölücülerini ayarlar |
| Saat çıkışı | Dahili bir saati ölçüm için MCO pinine yönlendirir |
| Durum | Her yapılandırma adımı bir durum bayrağı döndürür; hata ele alınabilir |

Örnek uygulama çipi sıfırlamadan tam hızına getirir:

```c
osc->sys_clk_src = SYS_CLK_SRC_PLL;
osc->hse_state   = HSE_ON;
osc->hsi_state   = HSI_OFF;
osc->pll.pll_src = PLL_SRC_HSE;
osc->pll.pll_M   = 4;
osc->pll.pll_N   = 168;
osc->pll.pll_P   = PLL_P_2;

osc->prescaler.ahb_pres  = AHB_PRESCALER_1;
osc->prescaler.apb1_pres = APB1_PRESCALER_4;
osc->prescaler.apb2_pres = APB2_PRESCALER_2;
```

8 MHz kristalle bu ayar 2 MHz PLL girişi, 336 MHz VCO ve 168 MHz sistem saati verir; APB1 42 MHz,
APB2 84 MHz olur ve bunlar o veri yollarının üst sınırlarıdır.

Saati MCO pinine yönlendirmek göründüğünden önemlidir: çipin, kodun sandığı frekansta gerçekten
çalıştığını osiloskopla doğrulamanın yolu budur.

## Yaklaşım

- **İlklendirme yapıları.** Her sürücü, bir yapıyı doldurup ilklendirme fonksiyonuna vererek
  yapılandırılır; üretici kütüphanelerinin kullandığı kalıpla aynıdır, kod tanıdık okunur.
- **Kılavuzla karşılaştırılabilir.** Yazmaç erişimi CMSIS aygıt tanımları üzerinden yapılır; her
  satır başvuru kılavuzuyla karşılaştırılabilir.
- **Gizli bir şey yok.** Başlangıç dosyası ve bağlayıcı betikleri projenin parçasıdır; sıfırlama
  vektöründen `main`'e uzanan yol görünürdür.
- **Örnekler dahil.** Depoda sürücülerin yanında bir saat yapılandırma örneği ve bir kesme örneği bulunur.

## Durum

RCC ve GPIO tamamlandı. Kütüphane bir öğrenme projesidir; yeni çevre birimlerine ihtiyaç duyuldukça
genişletiliyor.

## Kullanılan teknolojiler

C, STM32F407VG, CMSIS, STM32CubeIDE.
