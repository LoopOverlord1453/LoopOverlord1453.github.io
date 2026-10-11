---
layout: project
ref: control-panel-fsm
lang: tr
title: Menü Tabanlı Kontrol Paneli
permalink: /tr/projects/control-panel-fsm/
---

## Hedef

Karakter LCD üzerinde, kullanıcının dört düğmeyle menüler arasında gezinerek birkaç cihazı
çalıştırdığı küçük bir kontrol paneli yapmak; bunu da yeni bir ekran eklemenin, çalışan ekranları
yeniden yazmayı gerektirmeyeceği biçimde kurmak.

## Donanım

| Öğe | Görev |
|---|---|
| STM32F407 | Denetleyici |
| I2C üzerinden karakter LCD | Menü ekranı |
| Dört düğme | Gezinme ve seçim |
| ADC'de potansiyometre | Kalibrasyon ve ayar için analog giriş |
| Zamanlayıcı PWM çıkışları | Servo ve LED sürme |
| Buzzer | Tuş basışlarında sesli geri bildirim |

## Tasarım: olay güdümlü durum makinesi

İç içe `if` bloklarıyla yazılan menü yazılımı kısa sürede yönetilemez hale gelir: her yeni ekran,
var olan her ekrana dal ekler. Bu projede panel düz (flat) bir sonlu durum makinesi olarak gerçeklendi.

### Durumlar

Her ekran bir durumdur.

| Durum | Ekran |
|---|---|
| `MENU_SCREEN` | Ana menü |
| `SERVO_SCREEN` | Servo menüsü |
| `SERVO_MIN_CALIB`, `SERVO_MAX_CALIB` | Servo uç nokta kalibrasyonu |
| `SERVO_MANUEL`, `SERVO_AUTO` | Servo çalışma kipleri |
| `STEP_SCREEN` | Adım motoru |
| `BMP180_SCREEN` | Basınç sensörü |
| `LED_SCREEN` | LED menüsü |
| `LED_DIMMER`, `LED_BRIGHTNESS`, `LED_ON_OFF` | LED kipleri |

### Olaylar

Kullanıcı girdisi küçük bir sinyal kümesine dönüştürülür: `INC_MENU`, `DEC_MENU`, `SELECT_ID`,
`DO_TASK`, `ABORT_TASK` ve `ABORT_MENU`. Bunlara ek olarak her durum üç iç sinyal alır:

| Sinyal | Amaç |
|---|---|
| `ENTRY` | Duruma girildiğinde bir kez çalışır; örneğin ekranı çizer |
| `DO` | Durum etkinken tekrar tekrar çalışır |
| `EXIT` | Durumdan çıkılırken bir kez çalışır; örneğin ekranı temizler |

### Dağıtım

Tek bir fonksiyon, durum makinesi dağıtıcısı, her olayı alır ve etkin durumun işleyicisini çağırır.
İşleyici dört sonuçtan birini bildirir: olay işlendi, yok sayıldı, geçişe yol açtı veya `DO`
eylemi sürmeli. Geçişte dağıtıcı eski duruma `EXIT`, yenisine `ENTRY` gönderir.

Çizim `ENTRY` içinde, temizlik `EXIT` içinde yapıldığı için bir geçiş ekranda eski ekranın bir
parçasını asla bırakamaz. Her ekran tek bir işleyici fonksiyon olduğu için de ekran eklemek,
diğerlerine dokunmadan bir fonksiyon ve bir durum eklemek demektir.

## Girdi işleme

**Yazılımla titreşim giderme (debounce).** Dört düğme ana döngüde örneklenir ve üç durumlu bir
titreşim gidericiden (basılı değil, titreşiyor, basılı) geçirilir. Kontaklar nasıl titrerse
titresin bir basış tam olarak bir olay üretir.

**Filtrelenmiş analog giriş.** Potansiyometre ADC üzerinden okunur ve hareketli ortalama filtresiyle
düzgünleştirilir; ekrandaki değer ve servo konumu titremez. Filtrelenmiş okuma ardından ADC
aralığından kalibre edilmiş çıkış aralığına eşlenir.

## Servo kalibrasyonu

Servonun en küçük ve en büyük konumları panelden ayarlanır ve uygulama nesnesinde saklanır. Sonraki
konumlama, yazılıma gömülü sabitleri değil, kullanıcının gerçekten kalibre ettiği sınırları
kullanır. Ayar sırasında geçerli doluluk (duty) değeri ekranda gösterilir.

## Durum

Durum makinesi çatısı, ana menü, iki kalibrasyon ekranıyla servo menüsü ve LED menüsü; titreşim
giderme, analog giriş yolu ve buzzer ile birlikte tamamlandı. Servo çalışma kipleri, adım motoru,
basınç sensörü ve tek tek LED kipleri için işleyiciler durum olarak tanımlandı ama henüz doldurulmadı.

## İlgili proje

[UML Design Studio]({{ '/tr/projects/uml-design-studio/' | relative_url }}) bu tür durum makinesi
kodunu çizimden üretir.

## Kullanılan teknolojiler

C, STM32F407, STM32 HAL, I2C, ADC, zamanlayıcılar ve PWM, STM32CubeIDE.
