# KARTAL

Videodan esinlenen sinematik web deneyimi. Node.js + Express + Vite + Three.js.

## Hostinger

- Repository: `hipokrat-dev/denemekartal`
- Branch: `main`
- Framework: Express
- Node.js: 22 veya üzeri
- Root: `./`
- Install: `npm ci`
- Build: `npm run build`
- Start: `npm start`
- Entry: `server.js`
- Build output: `dist`

Sunucu Hostinger tarafından verilen `PORT` değişkenini kullanır. `/health` sağlık kontrolüdür.

## Yerel

`npm ci` ardından `npm run dev`. Üretim kontrolü: `npm run build && npm start`.

## Deneyim

- Referans videoyu kaydırmayla ilerleten üç bölümlü anlatım.
- Tam ekran film penceresi, orijinal ses ve oynatıcı kontrolleri.
- Three.js çöl sahnesi, taranmış altın kartal, ofis koltuğu, masa ve bilgisayar.
- Döndürme/yakınlaştırma, kartala yakın çekim, iki ışık modu, görünümü sıfırlama.
- Mobil düzen, klavye kontrolleri ve azaltılmış hareket tercihine uyum.

Sinematik bölüm referans videodan gelir. Etkileşimli kartal, Museum of Malopolska tarafından taranmış Golden Eagle modelidir: yaklaşık 181 bin üçgen, 4K renk/normal/yansıma dokuları, Meshopt ve WebP ile 6.5 MB GLB. Model sabit pozludur; uçuş animasyonu veya canlı hayvan hareketi içermez. Kaynak, CC BY 4.0 atıf bilgileri ve uygulanan dönüşümler: [public/models/ATTRIBUTION.md](public/models/ATTRIBUTION.md).

Video ve karelerin açık repoda ve Hostinger sitesinde yayımlanması kullanıcı tarafından onaylanmıştır.

Hostinger Express doğrudan `server.js` girişini çalıştırabildiğinden, üretim ön yüzü `dist/` içinde de sürümlenir. Kaynak değiştiğinde `npm run build` çalıştırıp güncel `dist/` dosyalarını da gönderin.
