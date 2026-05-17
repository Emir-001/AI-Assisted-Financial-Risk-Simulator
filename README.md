# AI-Assisted Financial Risk Simulator
(Yapay Zeka Destekli Finansal Risk Simülatörü)

Yapay Zeka Destekli Finansal Risk Simülatörü, kullanıcıların kredi (konut, araç vb.) ve diğer finansal kararlarını almadan önce olası senaryoları analiz etmelerini sağlayan modern bir web uygulamasıdır. Google Gemini AI entegrasyonu ile kullanıcıların girdiği finansal verilere dayanarak gerçek zamanlı risk analizi, nakit akışı projeksiyonları ve risk azaltma stratejileri sunar.

## Özellikler 🚀

- **Yapay Zeka Destekli Senaryo Analizi:** Google Gemini AI ile kullanıcı girdilerine özel dinamik finansal analiz.
- **Detaylı Finansal Modüller:** Konut kredisi, araç finansmanı ve genel finansal durum senaryolarını destekleyen esnek yapı.
- **Görselleştirilmiş Veriler:** Nakit akışı projeksiyonları ve metrikler için Recharts ile oluşturulmuş interaktif grafikler.
- **Modern ve Duyarlı Arayüz:** Tailwind CSS ile tasarlanmış, tüm cihazlara uyumlu, kullanıcı dostu deneyim.
- **Güvenilir Altyapı:** Drizzle ORM ve PostgreSQL altyapısı ile sağlam veri katmanı.

## Kullanılan Teknolojiler 💻

- **Frontend:** Next.js (App Router), React, Tailwind CSS, Recharts, Lucide React
- **Backend & Veritabanı:** Next.js API Routes, Drizzle ORM, PostgreSQL
- **Yapay Zeka:** Google Generative AI (Gemini)
- **Dil:** TypeScript

## Canlı Demo 🌐

Uygulamayı yerel ortamınıza kurmanıza gerek kalmadan doğrudan tarayıcınız üzerinden deneyimleyebilirsiniz:
👉 **[Yapay Zeka Destekli Finansal Risk Simülatörü - Canlı Demo](https://ai-assisted-financial-risk-simulator-iq79s69q9-emir-hackathon.vercel.app)**

## Geliştiriciler İçin Kurulum ve Çalıştırma 🛠️

Projeyi geliştirmek veya yerel ortamınızda çalıştırmak isterseniz aşağıdaki adımları izleyebilirsiniz:

### Ön Koşullar

- Node.js (v18 veya üzeri önerilir)
- PostgreSQL veritabanı
- Google Gemini API Anahtarı

### Adımlar

1. **Gerekli Bağımlılıkları Yükleyin:**
   Kök dizinde terminali açıp aşağıdaki komutu çalıştırın:
   ```bash
   npm install
   ```

2. **Çevre Değişkenlerini Ayarlayın:**
   Proje kök dizininde bulunan `.env.local` dosyasına gerekli API anahtarlarını ve veritabanı bağlantı bilgilerini ekleyin (Aşağıdaki Çevre Değişkenleri bölümüne bakın).

3. **Geliştirme Sunucusunu Başlatın:**
   ```bash
   npm run dev
   ```

4. **Uygulamayı Görüntüleyin:**
   Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresine giderek uygulamaya erişebilirsiniz.

## Çevre Değişkenleri 🔐

Uygulamanın çalışması için `.env.local` dosyasında en azından aşağıdaki değişkenlerin bulunması gerekmektedir:

```env
# Google Gemini API Anahtarı (Yapay zeka simülasyonları için)
GEMINI_API_KEY=sizin_gemini_api_anahtariniz

# Veritabanı Bağlantı URL'si (PostgreSQL için)
DATABASE_URL=postgresql://kullanici:sifre@host:port/veritabani_adi
```

## Geliştirici Komutları ⌨️

- `npm run dev`: Geliştirme ortamını başlatır.
- `npm run build`: Projeyi prodüksiyona hazır hale getirip derler.
- `npm run start`: Derlenmiş projeyi başlatır.
- `npm run lint`: Projedeki kod standardı hatalarını tarar.
