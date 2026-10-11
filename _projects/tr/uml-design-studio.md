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
diyagramdan belirlenimci biçimde üretilir; ikisi birbirinden kopamaz ve model, diğer kaynak
dosyaları gibi fark (diff) üzerinden gözden geçirilebilir.

## Mühendis nasıl kullanır

Araç yalnızca durum makinesi veya sınıf iskeletinin yerini alır. Yazılımın geri kalanı alışıldığı
gibi yazılır.

**1. Mantığı modelle.** Durumlar, geçişler, koşullar ve eylemler. Koşul ve eylem gövdeleri,
projenin kendi fonksiyonlarını çağıran düz C veya C++ ifadeleridir.

**2. Bağlamı göster.** Model ayarlarında bir bağlam tipi ve başlık dosyaları belirtilir. Her giriş,
çıkış, do, koşul ve etki gövdesinde `ctx` kullanıcının yapısıdır:

```c
entry   /  ctx->blink_count = 0U;
guard   [  ctx->error_count > 3U  ]
effect  /  ctx->error_count++;
```

**3. Derle (Build).** Araç bir başlık dosyası, bir kaynak dosyası ve bağlantıyı gösteren bir
entegrasyon şablonu yazar.

**4. Ana döngüden veya RTOS görevinden sür:**

```c
blinky_t sm;
blinky_ctx_t ctx = {0};

blinky_ctor(&sm, &ctx);
blinky_start(&sm);                          /* ilk geçiş ve giriş eylemi   */
blinky_dispatch(&sm, BLINKY_EVENT_BUTTON);  /* tamamlanana kadar çalıştır  */
blinky_do(&sm);                             /* do etkinlik zinciri         */
blinky_is_in(&sm, BLINKY_STATE_RUNNING);    /* üst durumları da kapsar     */
```

**5. Modeli kodun yanına işle.** Aynı model her zaman aynı baytları üretir; fark yalnızca gerçek
tasarım değişikliklerini gösterir.

Eylemlerin çağırdığı fonksiyonlar üretilmez. Başlık dosyasında listelenirler; böylece eksik bir
sürücü çağrısı sessiz bir boşluk değil, derleme hatası olur.

## Üretilen kodun güvenceleri

| Özellik | Ayrıntı |
|---|---|
| Bellek | Dinamik bellek yok, özyineleme yok |
| C++ | İstisna (exception) ve RTTI yok |
| Tablolar | `static const` veya `constexpr`; RAM'de değil flash'ta durur |
| Yeniden girilebilirlik | Aynı makinenin birden çok örneği yan yana çalışabilir |
| Uyarılar | `-Wall -Wextra -pedantic -Werror -Wconversion -Wshadow` altında uyarısız |
| MISRA | Her dosyanın başında MISRA C:2012 ve MISRA C++:2008 notları; bilinçli sapmalar dahil |
| Belgeleme | Her fonksiyonda Doxygen açıklaması |
| Tekrarlanabilirlik | Zaman damgası yok: aynı model aynı baytları verir |

## Durum makineleri: UML sözlüğünün tamamı

Düzenleyici durumları, bileşik durumları, başlangıç ve son sözde durumlarını, choice, junction,
sığ ve derin geçmiş (history) ile terminate öğelerini; dış, iç ve yerel geçişlerle birlikte
destekler. Bunlar tablo güdümlü hiyerarşik bir durum makinesine derlenir.

Elle yapıldığında en kolay hata yapılan kısımlar, üretecin üstlendiği kısımlardır:

| Öğe | Gerçeklenen davranış |
|---|---|
| Junction | Durağan dallanma: koşullar kaynak durumdan çıkmadan önce değerlendirilir |
| Choice | Dinamik dallanma: koşullar geçişin etkisi çalıştıktan sonra değerlendirilir |
| History | Son etkin alt durumu geri yükler; bölge son durum üzerinden tamamlandığında temizlenir |
| Terminate | Makine hiçbir durumdan çıkmaz; çıkış eylemleri çalışmaz, sonrasında hiçbir şey yürütülmez |
| Completion | Bileşik durum yalnızca kendi bölgesi son duruma ulaştığında tamamlanır |
| `else` | Verilen öncelik ne olursa olsun en son denenir |

Bunların her biri, dayandığı UML 2.5.1 maddesini alıntılayan bir testle sabitlenmiştir.

## Sınıf diyagramları

Sınıflar, soyut sınıflar ve arayüzler; ilişkilendirme, toplama (aggregation), bileşim
(composition), genelleme, gerçekleme ve bağımlılık ilişkileriyle. Çıktı, yapı ve fonksiyon tablosu
kullanan C ya da sanal çağrılı C++ olur.

![Sınıf diyagramı kipi]({{ '/assets/img/projects/uml-class-light.png' | relative_url }})

## Benzetim ve doğrulama

- **Koddan önce benzetim.** Benzetici, diyagramı kod üreteçleriyle aynı ara gösterimi ve aynı
  algoritmayı kullanarak çalıştırır. Eşdeğerlikleri her test çalıştırmasında yeniden denetlenir;
  tuvalde görülen, yazılımın yapacağı şeydir. Benzetim şeridinde olay başına bir düğme, canlı koşul
  anahtarları ve adım adım çalıştırma izi bulunur.
- **Sürekli doğrulama.** Sorunlar model düzenlenirken bildirilir. Her bulgu, dayandığı UML 2.5.1
  maddesini ve sayfasını belirtir; tıklandığında hatalı öğe seçilir.
- **Simgeleri bilen denetimler.** Doğrulayıcı, üretecin hangi tanımlayıcıları yazacağını bilir;
  aynı sabite dönüşecek iki ad, bozuk bir derleme yerine hata olarak bildirilir.

## Dahili sürüm kontrolü

Üçüncü sekme, çalışma alanına özgü bir git istemcisidir: dallar ve birleştirmelerle işleme
(commit) grafiği, hazırlama alanı ve birleşik fark görünümü. Model ile ondan üretilen yazılım
birlikte işlenir.

![Depo sekmesi]({{ '/assets/img/projects/uml-git-light.png' | relative_url }})

## Nasıl kuruldu

| Katman | İçerik |
|---|---|
| Çekirdek | Model, doğrulayıcı, koşul ifadesi ayrıştırıcısı, benzetici, model karşılaştırma, alt makine işleme, git arka ucu |
| Kod üretimi | Durum makineleri ve sınıflar için ayrı C, C++ ve PlantUML üreteçlerini besleyen tek bir ara gösterim |
| Arayüz | PyQt6 tuvali, özellik ve çalışma alanı panelleri, üretilen dosya başına bir sekmeli kod paneli, sorun listesi |

Kod diske yalnızca Build ile yazılır; öğeleri tuvalde taşımak dosya sistemine dokunmaz.

## Test

Test paketi kodun üretildiğini denetlemekle yetinmez. Kodu üretir, `-Werror` ile derler,
çalıştırır ve davranış izini hem Python başvurusuyla hem de rastgele sınama (fuzz) çalıştırmasıyla
karşılaştırır. Ayrıca UML 2.5.1 uyumunu madde madde denetler, özellikleri gerçek arayüz üzerinden
sınar ve git katmanını gerçek geçici depolara karşı test eder.

## Dağıtım ve gizlilik

Uygulama Windows, Linux ve macOS'ta kaynaktan çalışır; PyInstaller ile bağımsız çalıştırılabilir
dosyaya dönüştürülür. Telemetri, analiz veya çökme raporu göndermez; modeller ve üretilen kod
diskten çıkmaz.

## Kullanılan teknolojiler

Python 3, PyQt6. İsteğe bağlı: depo sekmesi için git, test paketi için gcc ve g++.
