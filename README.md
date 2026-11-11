# KARTAL

Referans filmin ilk karesinden son karesine, klavyeyle kontrol edilen tam ekran sinematik yolculuk. Ana ekranda metin ve sayfa kaydırma yoktur.

## Deneyim

- İleri ok, sağ ok veya W: kısa basışta 0.75 saniyelik adım; basılı tutunca kesintisiz ilerleme.
- Geri ok, sol ok veya S: geri hareket.
- Ekrandaki oklar fare ve dokunmatik ekranla aynı şekilde çalışır.
- Uzun basış bırakıldığında, pencere odağı kaybolduğunda veya sekme gizlendiğinde hareket durur.
- Başa dön, isteğe bağlı ses ve tam ekran için yalnızca simgeler bulunur.
- İlk karede bekler; son karede durur, kendiliğinden tekrar başlamaz.
- Görüntüler, kullanıcının yayımlama izni verdiği referans videonun tamamıdır. Bu sürüm gerçek zamanlı 3D uçuş değil, video tabanlı etkileşimli sinematik akıştır.
- 1080p/24 fps H.264, yüksek kaliteli kodlama ve 0.5 saniyelik anahtar kare aralığı geri sarma için kullanılır.
- Önceki 3D sahnenin kaynakları ve model atıfları repoda korunmuştur; açılışta indirilmez.

## Hostinger

- Repo: `hipokrat-dev/denemekartal`, branch: `main`
- Framework: Express, Node.js: 22+, root: `./`
- Install: `npm ci`, build: `npm run build`, start: `npm start`
- Entry: `server.js`, output: `dist`
- Sunucu platformun `PORT` değişkenini kullanır. `/health` sağlık kontrolüdür.

## Yerel doğrulama

`npm ci`, `npm run dev`. Üretim: `npm run build && npm start`.
`npm run check` sözdizimini; `npm test` hareket kontrolünün kısa/uzun basış, geri hareket ve sınır davranışını kontrol eder.

Hostinger için `dist/` de sürümlenir. Kaynak değişikliklerinden sonra build alın ve güncel çıktıyı gönderin.
