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

## Bilgisayar ekranı

Kullanıcının HippocratesDaily görseli, ekrana perspektif dönüşümüyle yerleştirilir. Görsel dosyası değiştirilmeden korunur. 24 fps filmdeki LCD köşeleri `src/screen-track.json` içinde tutulur; kanat örtüşmeleri görünür alan maskeleriyle işlenir. `requestVideoFrameCallback` görüntüyü oynatma ve geri sarma sırasında gerçek video karesine eşler. Son yakın çekimde de aynı görsel görünür.

Takibi yeniden çıkarmak için OpenCV ve NumPy bulunan bir Python ortamında `python scripts/track-screen.py` çalıştırılır. Tarayıcı bu paketlere ihtiyaç duymaz.

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
