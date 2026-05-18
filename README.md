# Bu web uygulamam şuanlık bilgisayar için geliştirilmiş olup ileride mobil versiyonları için iyileştirmeler yapılacaktır

# 🚀 AI-Assisted Financial Risk Simulator
### (Yapay Zeka Destekli Çoklu Ajan Finansal Risk Simülatörü)

Yapay Zeka Destekli Finansal Risk Simülatörü; kullanıcıların bireysel finansal verilerini, borç yapılarını ve birikim hedeflerini derinlemesine analiz eden, **canlı ekonomik verilere (RAG)** dayanan ve **çoklu-ajan (Multi-Agent) mimarisi** kullanan yeni nesil bir finansal karar destek platformudur. 

Google Gemini AI'ın gelişmiş akıl yürütme yetenekleri ile donatılan bu simülatör; sadece statik kurallar uygulamakla kalmaz, Türkiye ve dünya ekonomisinden anlık olarak beslenen resmi makroekonomik verileri sentezleyerek kullanıcıya özel dinamik risk raporları, 12 aylık birikim projeksiyonları ve aksiyon planları üretir.

---

## 🌟 Öne Çıkan Gelişmiş Özellikler

### 1. Çoklu-Ajan (Multi-Agent) Yapay Zeka Orkestrasyonu 🧠
Uygulama, tek bir yapay zeka modeline sorup cevap almak yerine, her biri kendi alanında uzmanlaşmış **4 farklı AI Ajanı** paralel olarak çalıştırır ve ortak bir karara varır:
*   **Makroekonomik Ajan (Macro Agent):** Güncel enflasyon, TCMB politika faizleri ve kur risklerinin kullanıcının birikim ve borç yapısına etkisini analiz eder.
*   **Kredi ve Borç Risk Ajanı (Credit Agent):** Borç-Gelir Oranı (DTI), acil durum fonu yeterliliği (3-6 aylık standart) ve finansal sürdülebilirlik süresini değerlendirir.
*   **Sektörel Risk Ajanı (Sector Agent):** Mevcut piyasa koşullarında gayrimenkul, döviz, emtia ve iş gücü gibi sektörlerin kullanıcı profiline getirdiği risk ve fırsatları listeler.
*   **Stratejist Baş Ajan (Supervisor Agent):** Diğer 3 uzmanın raporlarını sentezleyerek **Finansal Sağlık Skoru (0-100)** üretir, **12 aylık birikim projeksiyonu** çıkarır ve aciliyet seviyelerine göre sıralanmış **Öncelikli Eylem Planı** hazırlar.

### 2. Canlı RAG (Retrieval-Augmented Generation) Bilgi Hattı 📡
Kullanıcılardan hiçbir dosya yüklemesi talep edilmeden, sistem arka planda resmi ekonomik kaynaklardan canlı veri çeken akıllı bir RAG entegrasyonuna sahiptir:
*   **TCMB (Türkiye Cumhuriyet Merkez Bankası):** Günlük XML kur bülteni üzerinden canlı döviz kurları (USD, EUR, GBP, JPY).
*   **Dünya Bankası (World Bank API):** Türkiye için son 3 yıllık TÜFE enflasyonu ve son 2 yıllık GSYİH büyüme göstergeleri.
*   **St. Louis Fed (FRED):** Federal Rezerv sisteminden anlık ve geçmiş USD/TRY kur trendleri.
*   **OECD Veritabanı:** Türkiye çeyreklik büyüme performansları ve para politikası bağlamı.
*   *Optimizasyon:* API kotalarını aşmamak ve milisaniyeler seviyesinde hızlı çalışmak için tüm veriler **1 saatlik in-memory önbellekleme (caching)** sistemi ile yönetilir.

### 3. Gemini Model Cascade (Akıllı Hata Toleransı) 🛡️
Yapay zeka çağrılarının kotaya takılmasına (`Rate Limit 429` veya `RESOURCE_EXHAUSTED`) veya model erişim hatalarına karşı **Model Cascade** mimarisi uygulanmıştır. Hata durumunda sistem, kullanıcıya hiçbir kesinti yansıtmadan hiyerarşik olarak bir alt modeli otomatik devreye sokar:
1.  `gemini-3.1-flash-lite` (En yeni, ultra hızlı ve hafif model)
2.  `gemini-2.5-flash`
3.  `gemini-2.0-flash`
4.  `gemini-flash-latest`
5.  `gemini-flash-lite-latest`
6.  `gemini-3-flash-preview`

### 4. Profesyonel PDF Raporu İhracı 📄
Kullanıcının finansal sağlığını özetleyen, tamamen tarayıcı tarafında (`jspdf` ve `html-to-image` ile) dinamik olarak oluşturulan profesyonel, çok sayfalı A4 PDF Raporu:
*   **Finansal Profil:** Gelir, gider, birikim, borç, DTI ve acil durum fonu metrikleri.
*   **Finansal Sağlık Skor Kartı:** Dinamik renk kodlu göstergeler.
*   **Öncelikli Eylem Planları:** `Acil`, `Önemli` ve `Uzun Vadeli` etiketleri ile kategorize edilmiş matris.
*   **Ajan Analiz Detayları:** Makro, Kredi ve Sektör ajanlarının detaylı paragrafları.
*   **Sektörel Risk Matrisi:** Şiddet derecelerine (yüksek, orta, düşük) göre yapılandırılmış tablo.

### 5. Premium UI/UX ve Mikro Animasyonlar 🎨
*   **Etkileşimli Borsa Arka Planı (StockBackground):** Canlı borsa hareketlerini simüle eden, basit hareketli grafiklerden öte, gerçek zamanlı Candle (Mum) grafiği çizimi, 7 günlük Basit Hareketli Ortalama (SMA) eğrisi, dinamik Destek & Direnç seviyeleri, anlık fiyat puls ringleri ve ışımaları içeren HTML5 Canvas animasyonu.
*   **Oransal Harcama Slider'ı:** Kullanıcı toplam harcama miktarını değiştirdiğinde, bütçe alt kategorilerini (kira, fatura, gıda vb.) oransal olarak koruyarak otomatik güncelleyen akıllı form.
*   **Modern Animasyonlar:** Karanlık/Aydınlık tema geçişleri için `AnimatedThemeToggler`, göz alıcı başlık geçişleri için `DiaTextReveal` ve Framer Motion geçişleri.

---

## 💻 Kullanılan Teknolojiler

*   **Frontend:** Next.js (App Router, React 19), Tailwind CSS, Framer Motion, Recharts, Lucide React
*   **Tasarım & Animasyon:** Radix UI, `@wrksz/themes` (Tema yönetimi), Magic UI (`DiaTextReveal`)
*   **Yapay Zeka & RAG:** `@google/generative-ai` (Gemini SDK), TCMB & World Bank API Entegrasyonları
*   **Veri Katmanı:** Drizzle ORM, PostgreSQL (pg)
*   **Raporlama:** jsPDF, html2canvas, html-to-image

---

## 🛠️ Kurulum ve Çalıştırma

### Ön Koşullar
*   Node.js (v18 veya üzeri)
*   PostgreSQL veritabanı
*   Google Gemini API Anahtarı

### Adımlar

1.  **Bağımlılıkları Yükleyin:**
    ```bash
    npm install
    ```

2.  **Çevre Değişkenlerini Tanımlayın (`.env.local`):**
    ```env
    # Google Gemini API Anahtarı
    GEMINI_API_KEY=sizin_gemini_api_anahtariniz

    # PostgreSQL Bağlantı Adresi
    DATABASE_URL=postgresql://kullanici:sifre@host:port/veritabani_adi
    ```

3.  **Geliştirme Sunucusunu Başlatın:**
    ```bash
    npm run dev
    ```

4.  **Uygulamaya Bağlanın:**
    [http://localhost:3000](http://localhost:3000)

---

## 🌐 Canlı Demo
Kurulum yapmadan tarayıcınızda denemek için:
👉 **[Yapay Zeka Destekli Finansal Risk Simülatörü - Canlı Demo](Linki sayfanın sağ üst kısmında bulunmaktadır)**
