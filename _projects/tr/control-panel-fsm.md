---
layout: project
ref: control-panel-fsm
lang: tr
title: Menü Tabanlı Kontrol Paneli
permalink: /tr/projects/control-panel-fsm/
---

## Hedef

Karakter LCD üzerinde, kullanıcının menüler arasında gezinerek birkaç cihazı çalıştırdığı küçük
bir kontrol paneli yapmak; bunu da yeni bir ekran eklemenin, çalışan ekranları yeniden yazmayı
gerektirmeyeceği biçimde kurmak.

## Tasarım: olay güdümlü durum makinesi

İç içe `if` bloklarıyla yazılan menü yazılımı kısa sürede yönetilemez hale gelir. Bu projede panel
düz (flat) bir sonlu durum makinesi olarak gerçeklendi.

**Durumlar.** Her ekran bir durumdur: ana menü; kalibrasyon, elle ve otomatik alt ekranlarıyla
servo ekranı; adım motoru ekranı; basınç sensörü ekranı; karartma, parlaklık ve aç/kapa kipleriyle
LED ekranı.

**Olaylar.** Kullanıcı girdisi küçük bir sinyal kümesine dönüştürülür: yukarı, aşağı, seç, görevi
çalıştır, görevi iptal et, menüden çık. Bunlara ek olarak her durum üç iç sinyal alır:

| Sinyal | Amaç |
|---|---|
| `ENTRY` | Duruma girildiğinde bir kez çalışır; örneğin ekranı çizer |
| `DO` | Durum etkinken tekrar tekrar çalışır |
| `EXIT` | Durumdan çıkılırken bir kez çalışır; örneğin motoru durdurur |

Çizim `ENTRY` içinde, temizlik `EXIT` içinde yapıldığı için bir geçiş, ekranda eski ekranın
yarısını veya kullanıcı başka yere geçtikten sonra dönen bir motoru asla bırakamaz.

## Neleri kontrol eder

| Cihaz | İşlevler |
|---|---|
| Servo motor | En küçük ve en büyük konum kalibrasyonu, elle kip, otomatik kip |
| Adım motoru | Kendi ekranından çalıştırma |
| LED'ler | Karartma, parlaklık ayarı, aç/kapa |
| BMP180 | Basınç sensörü okuma |
| Ekran | I2C üzerinden karakter LCD |

Servo kalibrasyon değerleri uygulama yapısında tutulur; elle ve otomatik kipler kullanıcının
gerçekten ayarladığı sınırları kullanır.

## İlgili proje

[UML Design Studio]({{ '/tr/projects/uml-design-studio/' | relative_url }}) bu tür durum makinesi
kodunu çizimden üretir.

## Kullanılan teknolojiler

C, STM32F407, STM32 HAL, I2C, STM32CubeIDE.
