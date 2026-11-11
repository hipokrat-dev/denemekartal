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
- Three.js ile modellenen çöl, kartal, ofis koltuğu, masa ve bilgisayar.
- Döndürme/yakınlaştırma, iki ışık modu, görünümü sıfırlama.
- Mobil düzen, klavye kontrolleri ve azaltılmış hareket tercihine uyum.

Gerçekçi sinematik bölüm referans videodan gelir. Etkileşimli bölüm prosedürel bir 3D sahnedir; fotogerçekçi taranmış bir kartal modeli değildir.

Video ve karelerin açık repoda ve Hostinger sitesinde yayımlanması kullanıcı tarafından onaylanmıştır.

Hostinger Express doğrudan `server.js` girişini çalıştırabildiğinden, üretim ön yüzü `dist/` içinde de sürümlenir. Kaynak değiştiğinde `npm run build` çalıştırıp güncel `dist/` dosyalarını da gönderin.
