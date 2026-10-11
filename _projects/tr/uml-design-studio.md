---
layout: project
ref: uml-design-studio
lang: tr
title: UML Design Studio
permalink: /tr/projects/uml-design-studio/
---

## Problem

Çoğu gömülü projede durum makinesi iki yerde yaşar: tasarım belgesindeki diyagramda ve yazılımdaki
elle yazılmış `switch` bloğunda. Birisi kodda bir hatayı düzelttiği anda diyagram yanlış hale gelir
ve onu okuyan bir sonraki kişi yanıltılır.

UML Design Studio ikinci kopyayı ortadan kaldırır. **Kaynak, diyagramın kendisidir.** Yazılım
diyagramdan belirlenimci biçimde üretilir; ikisi birbirinden kopamaz.

## Ne yapar

- Etkileşimli tuvalde UML 2.5.1 **durum makinesi** ve **sınıf diyagramı** çizimi
- Mikrodenetleyici projesine doğrudan eklenebilen **MISRA uyumlu C11 ve C++11** kod üretimi
- Üretilen kodla birlikte çalışan bir entegrasyon örneği
- Kod karta yüklenmeden önce durum makinesinin **benzetimi**
- Modelin UML kurallarına göre **doğrulanması** ve hataların raporlanması
- PlantUML'e dışa aktarma
- **Dahili sürüm kontrolü**: model, kaynak kod gibi karşılaştırılabilen bir metin dosyasıdır

## Zor kısım: anlambilimi doğru kurmak

Kutu çizmek işin kolay tarafıdır. Aracın değeri, üretilen kodun UML anlambilimini birebir
izlemesindedir; buna elle yazması zahmetli ve hataya açık durumlar da dahildir:

| Öğe | Gerçeklenen davranış |
|---|---|
| Hiyerarşik durumlar | Doğru giriş ve çıkış sırasıyla tamamlanana kadar çalıştırma (run-to-completion) |
| Junction | Durağan dallanma: koşullar kaynak durumdan çıkmadan önce değerlendirilir |
| Choice | Dinamik dallanma: koşullar geçişin etkisi çalıştıktan sonra değerlendirilir |
| History | Son etkin alt durumu geri yükler; bölge tamamlandığında temizlenir |
| Terminate | Makine hiçbir durumdan çıkmaz, çıkış eylemleri çalışmaz |
| Completion | Bileşik durum yalnızca kendi bölgesi son duruma ulaştığında tamamlanır |
| `else` | Verilen öncelik ne olursa olsun en son denenir |

Alt makineler ile dış, iç ve yerel geçişler de desteklenir.

## Nasıl kuruldu

Uygulama modeli, üreteçleri ve arayüzü birbirinden ayırır:

- **Çekirdek:** model, doğrulayıcı, koşul ifadesi ayrıştırıcısı, benzetici ve model karşılaştırma
- **Kod üretimi:** ayrı C, C++ ve PlantUML arka uçlarını besleyen bir ara gösterim
- **Arayüz:** çıktıyı diyagramın yanında gösteren kod paneline sahip PyQt6 tuvali

## Test

Test paketi üretilen C ve C++ kodunu `gcc` ve `g++` ile derler; derlenmeyen kod üreten bir üreteç
değişikliği hemen yakalanır.

## Dağıtım

Windows, Linux ve macOS'ta kaynaktan çalışır; PyInstaller ile tek dosyalık bağımsız bir
çalıştırılabilir dosyaya dönüştürülür. Uygulama telemetri göndermez; modeller ve üretilen kod
diskte kalır.

## Kullanılan teknolojiler

Python 3, PyQt6. İsteğe bağlı: depo sekmesi için git, test paketi için gcc.
