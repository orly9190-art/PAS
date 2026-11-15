# Website PT Prima Armada Samudra

Website statis (HTML + CSS, tanpa framework). Tidak perlu Node, tidak perlu build.
Cukup unggah seluruh isi folder ini ke repositori GitHub.

## Isi folder

```
index.html            Tentang Kami  (halaman depan, bahasa Inggris)
layanan.html          Layanan Kami + wilayah operasi + armada + sertifikat
keberlanjutan.html    QHSE / Sustainability
media.html            Berita & galeri
karir.html            Karir & rekrutmen
kontak.html           Formulir penawaran & alamat kantor
legal.html            Legal Notice

id/                   Tujuh halaman yang sama dalam bahasa Indonesia
admin/index.html      Login + panel admin untuk mengubah isi halaman
assets/css/style.css  Gaya dasar, responsif, dan aturan cetak
assets/img/           Foto kapal dan logo
assets/js/            live-editor.js (editor tampilan langsung, navigasi, font, simulasi), pas-auth.js (login), site-edit.js, site-search.js, site-ui.js (tombol WhatsApp & ke atas),
                      admin.js, admin-data.js, pas-data.js (data tamu + konten), admin-crud.js
tools/                Skrip pembuat ulang admin-data.js (opsional, perlu Node)
404.html              Halaman "tidak ditemukan" dua bahasa
sitemap.xml           Daftar alamat halaman untuk mesin pencari
robots.txt            Aturan perayapan; folder /admin/ dikecualikan
```

Bahasa Inggris ada di akar folder, bahasa Indonesia di folder `id/`.
Tombol ID/EN di pojok kanan atas berpindah antara keduanya.

## Cara pasang di GitHub Pages

1. Buat repositori baru di GitHub, misalnya `website-pas`.
2. Unggah seluruh isi folder ini ke repositori tersebut
   (file `index.html` harus berada di akar repositori, bukan di dalam subfolder).
3. Buka **Settings** pada repositori, lalu menu **Pages**.
4. Pada bagian **Source**, pilih **Deploy from a branch**.
5. Pilih branch `main` dan folder `/ (root)`, lalu **Save**.
6. Tunggu satu sampai dua menit. Alamat website akan muncul di halaman itu,
   berbentuk `https://<nama-akun>.github.io/website-pas/`.

### Memakai domain perusahaan

Jika ingin memakai domain sendiri, misalnya `primaarmadasamudra.co.id`:

1. Buat file bernama `CNAME` di akar repositori, isinya satu baris: nama domain tersebut.
2. Di panel penyedia domain, arahkan record DNS ke GitHub Pages.
3. Kembali ke **Settings → Pages**, isi kolom **Custom domain**, lalu centang
   **Enforce HTTPS**.

## Login dan panel admin

Tombol **Login** ada di pojok kanan atas setiap halaman dan membuka `admin/index.html`.

- Nama pengguna dan kata sandi bawaan: `admin` / `admin123`.
  Ganti di `assets/js/pas-auth.js`.
- Menu di sisi kiri berisi Dashboard dan satu menu untuk setiap halaman
  (Tentang Kami, Layanan, Keberlanjutan, Media, Karir, Kontak, Legal).
- Setiap halaman bisa diedit dalam versi EN maupun ID. Semua teks, judul tab browser,
  dan gambar tampil sebagai kolom isian, dikelompokkan per bagian halaman.
  Ada kolom pencarian dan tombol Kembalikan / Reset halaman.
- **Simpan perubahan:** setiap halaman punya tombol **Simpan perubahan** (atau tekan Ctrl+S).
  Sebelum ditekan, perubahan hanya draf. Jika Anda pindah halaman atau menutup tab
  dengan draf yang belum disimpan, Anda akan diperingatkan.
- **Ekspor JSON / Impor JSON:** ada di menu kiri bawah pada setiap halaman dan di Dashboard.
  Ekspor menyimpan semua perubahan (semua halaman, EN dan ID) ke satu file JSON.
  Jika data browser terhapus atau semua perubahan di-reset, login lagi lalu klik
  **Impor JSON** dan pilih file tadi untuk memulihkan semuanya.
- Gambar yang diunggah diperkecil otomatis (maks. 1400 px) agar muat di penyimpanan browser.

### Hal yang perlu dipahami

- Perubahan disimpan di **localStorage browser** yang dipakai mengedit. Pengunjung lain,
  browser lain, dan perangkat lain tetap melihat isi aslinya. Pakai **Ekspor JSON**
  untuk menyimpan atau memindahkan perubahan (dan **Impor JSON** untuk memulihkan).
  Membersihkan data browser akan menghapus perubahan.
- Agar perubahan tampil untuk semua pengunjung, salin teks baru langsung ke file HTML.
- Login hanyalah penghalang tampilan. Website statis tidak punya server, sehingga
  kata sandi terbaca oleh siapa pun yang membuka `admin.js`. Jangan pakai kata sandi
  yang sama dengan akun lain.
- Batas penyimpanan localStorage sekitar 5 MB. Ukuran terpakai terlihat di Dashboard.
- Daftar kolom di panel admin dibuat dari isi halaman HTML saat ini (`assets/js/admin-data.js`).
  Jika Anda mengubah teks di file HTML secara langsung, jalankan ulang `tools/buat-manifest.js`.
  Perubahan admin yang teks aslinya sudah tidak cocok akan dilewati, bukan menimpa teks lain.


## Kotak masuk tamu dan kelola konten (Tambah / Ubah / Hapus)

Menu admin sekarang punya dua kelompok tambahan. Semuanya mendukung **+ Tambah, Ubah, Hapus**, pencarian, dan Ekspor JSON.

**Kotak Masuk** (data dari pengunjung)
- **Permintaan Penawaran** : terisi saat tamu menekan tombol kirim di halaman Kontak (EN dan ID).
- **Lamaran Kerja** : terisi saat tamu menekan **Lamar** pada lowongan di halaman Karir (muncul formulir).
- Tiap data punya status Baru / Dibaca / Selesai. Jumlah yang masih Baru tampil di menu.

**Kelola Konten**
- **Berita (Media)** : kartu berita di halaman Media (judul/ringkasan EN dan ID, kategori, tanggal, gambar).
- **Lowongan (Karir)** : daftar lowongan; status Nonaktif menyembunyikannya dari halaman publik.
- **Blok Halaman** : bagian tambahan (judul, teks, gambar) untuk halaman mana pun (Tentang, Layanan, Keberlanjutan, Media, Karir, Kontak, Legal), tampil sebelum footer.
- Teks bawaan halaman lain tetap diubah lewat menu halaman seperti sebelumnya.

### Batasan penting: tanpa server
Data disimpan di **localStorage browser**. Artinya kiriman tamu dari perangkat lain **tidak otomatis sampai** ke browser admin;
hanya tampil jika tamu dan admin memakai browser yang sama (cocok untuk uji coba). Agar kiriman tamu benar-benar diterima:
1. Isi `PAS_CONFIG.submitUrl` di bagian atas `assets/js/pas-data.js` dengan alamat layanan formulir (Formspree, Web3Forms, Google Apps Script).
   Setiap kiriman tamu akan diteruskan ke sana (email/Sheet) selain disimpan lokal.
2. Atau pindahkan penyimpanan ke backend sungguhan (mis. Supabase/Firebase) dengan mengganti fungsi `list/add/update/remove` di `pas-data.js`.
Daftar Berita dan Lowongan memakai data di `pas-data.js` (bukan HTML lagi), jadi ubah lewat admin, bukan lewat file HTML.

## Edit tampilan langsung di halaman pengunjung

Semua pengaturan tampilan dilakukan **langsung di halaman website**, bukan di panel admin.

### Cara membuka
1. Buka halaman mana pun, lalu tekan **Ctrl + Shift + E** (atau tambahkan `#edit` di akhir alamat).
2. Masuk dengan nama pengguna dan kata sandi (ada di `assets/js/pas-auth.js`, bawaan `admin` / `admin123`).
3. Bilah **MODE EDIT** muncul di bawah dan panel **Pengaturan elemen** di kanan.
   Setelah login, tombol **Edit tampilan** juga muncul di pojok kiri bawah (hanya di tab yang sama).
   Pengunjung biasa tidak melihat apa pun.

### Draf dan Simpan perubahan
Semua perubahan hanya **draf** sampai Anda klik **Simpan perubahan** (atau Ctrl+S).
Draf bisa **Urungkan / Ulangi** (Ctrl+Z / Ctrl+Y) atau **Buang draf**. Menutup tab dengan draf
yang belum disimpan akan diperingatkan.

### Yang bisa diubah (klik elemennya, lalu atur di panel kanan)
| Kebutuhan | Cara |
|---|---|
| Warna navbar sampai footer | Klik elemen mana pun (header, menu, tombol, kartu, bagian, footer). Atur **Latar**, **Tulisan**, **Garis tepi**: pilih warna bebas atau 16 warna cepat. Centang *Termasuk semua teks di dalamnya* agar teks anak ikut berubah. **↑ Induk** / **Bagian** untuk memilih kotak yang lebih besar. |
| Zoom foto | Pilih foto, geser **Zoom** (100-400%). Seret fotonya untuk menggeser bagian yang tampil. |
| Perbesar / perkecil foto | **Lebar gambar** dan **Tinggi gambar**. **Ganti gambar** untuk mengunggah foto baru. |
| Perluas / persempit bagian | Pilih bagian: **Tinggi** (jarak atas-bawah) dan **Lebar isi**. |
| Tambah konten | Pilih bagian atau footer, lalu **+ Judul, Paragraf, Poin-poin, Gambar, Video, Tombol, Kotak sorotan, Garis, Jarak kosong**. Konten tambahan bisa dinaik-turunkan, dihapus (atau tombol Delete), dan diberi warna/ukuran sendiri. |
| Ubah teks | Klik dua kali teks lalu ketik, Enter untuk selesai, Esc membatalkan. Untuk tombol berikon, muncul kotak isian. |

Video: tempel tautan YouTube, Vimeo, atau MP4. Berkas MP4 yang diunggah langsung dibatasi 3 MB.
Selama mode edit aktif, tautan dan tombol sengaja tidak berfungsi.

### Agar pengunjung ikut melihat perubahan
Perubahan tersimpan di browser Anda saja (localStorage). Untuk menayangkannya:
1. Klik **Unduh halaman**. Berkas HTML yang sudah memuat perubahan terunduh.
2. Unggah ke GitHub menggantikan berkas lama (halaman Indonesia ke folder `id/`).
3. Setelah GitHub memperbarui (1-2 menit), semua pengunjung melihat versi baru.

### Batasan
- Ruang penyimpanan browser sekitar 5 MB (10-15 foto). Jika penuh, unduh halaman, unggah ke GitHub,
  lalu klik **Kembalikan ke asli**.
- Elemen bawaan HTML tidak bisa dihapus lewat editor; hanya konten tambahan yang bisa dihapus.
- Perubahan dikenali dari urutan elemen. Jika HTML diubah langsung setelah Anda menyimpan,
  perubahan lama yang tidak cocok akan dilewati.
- Login hanya penghalang tampilan (website statis tidak punya server). Ganti kata sandi di
  `assets/js/pas-auth.js`.

### Jika berkas HTML diubah langsung

Panel admin dan mode edit mengenali teks dari urutannya. Setelah Anda menambah atau menghapus
teks langsung di berkas HTML, buat ulang manifest admin:

```
npm i jsdom
node tools/buat-manifest-ringan.js
```

Versi ringan ini tidak memerlukan Chromium dan hasilnya identik dengan `buat-manifest.js`.

## Nomor WhatsApp dan tombol melayang

Buka `assets/js/pas-data.js`, cari bagian paling atas:

```js
if (CFG.waNumber === undefined) CFG.waNumber = '';
```

Isi dengan nomor WhatsApp perusahaan dalam format internasional tanpa tanda plus,
contoh `'628123456789'`. Tombol WhatsApp hijau akan muncul di pojok kanan bawah
setiap halaman. Selama masih kosong, tombolnya sengaja tidak ditampilkan agar
pengunjung tidak menekan tautan mati.

Tombol bundar **kembali ke atas** muncul sendiri setelah halaman di-scroll,
tidak perlu diatur.

## Sebelum dipublikasikan ke domain

Dua berkas memuat alamat contoh yang harus diganti:

- `sitemap.xml` — ganti semua `CONTOH-DOMAIN.co.id` dengan domain perusahaan.
- `robots.txt` — ganti alamat `Sitemap:` di baris terakhir.

Setelah domain aktif, daftarkan `sitemap.xml` di Google Search Console agar
halaman lebih cepat terindeks.

Catatan: `404.html` dan `robots.txt` memakai alamat yang dimulai dari akar domain
(`/assets/...`). Keduanya bekerja penuh jika website dipasang di domain sendiri.
Pada alamat GitHub Pages berbentuk subfolder (`github.io/website-pas/`),
halaman 404 tetap tampil tetapi logonya tidak muncul.

## Yang masih perlu dilengkapi

Teks di dalam kurung siku `[ ]` adalah tempat isian yang belum terisi:

- Nomor telepon kantor, nomor WhatsApp, dan alamat email
- Tanggal dan isi berita di `media.html` (saat ini masih kerangka, bukan kejadian nyata)
- Nama posisi dan tanggal penutupan lowongan di `karir.html`
- Tanggal pembaruan dan email resmi di `legal.html`
- Beberapa jenis komoditas di `layanan.html`

Angka **± 1.450 tarikan per tahun** di halaman depan masih perkiraan.
Ganti dengan angka dari laporan internal sebelum website dipublikasikan.

## Formulir belum berfungsi

Formulir di `kontak.html` kini menyimpan ke Kotak Masuk admin (lihat bagian di atas), tetapi belum mengirim email.
Website statis tidak bisa mengirim email sendiri. Tiga pilihan untuk mengaktifkannya:

1. **Paling cepat** — ganti formulir dengan tautan `mailto:` atau tombol WhatsApp.
2. **Gratis dan mudah** — daftar layanan formulir seperti Formspree atau Web3Forms,
   lalu tambahkan `action` dan `method="POST"` pada elemen formulirnya.
3. **Paling fleksibel** — pindah ke hosting yang mendukung PHP atau Node.

## Mengganti foto

Ganti file di `assets/img/` dengan nama yang sama persis, maka seluruh halaman
ikut berubah. Ukuran yang disarankan minimal 1600 piksel pada sisi terpanjang.

## Catatan

Isi halaman `legal.html` adalah kerangka umum, bukan nasihat hukum.
Mintalah bagian legal atau penasihat hukum perusahaan meninjaunya sebelum
website dipublikasikan.

## Daftar periksa sebelum tayang

- [ ] Nomor telepon, WhatsApp, dan email diisi di seluruh halaman (EN dan ID)
- [ ] `CFG.waNumber` di `pas-data.js` diisi
- [ ] Berita di halaman Media diganti peristiwa yang benar-benar terjadi
- [ ] Lowongan diisi atau dinonaktifkan lewat panel admin
- [ ] Angka tarikan per tahun diganti angka laporan internal
- [ ] Domain diganti di `sitemap.xml` dan `robots.txt`
- [ ] Kata sandi admin diganti di `assets/js/admin.js`
- [ ] Halaman `legal.html` ditinjau bagian legal perusahaan
- [ ] Formulir kontak dihubungkan ke layanan pengiriman (lihat bagian di atas)
- [ ] Logo pelanggan dipasang setelah izin tertulis diperoleh
- [ ] Semua foto yang dipasang adalah milik perusahaan sendiri atau sudah berlisensi

## Pembaruan editor tampilan langsung (v11)

Semua ada di bilah **MODE EDIT** (baris kedua bernama ALAT) dan panel **Pengaturan elemen**.

**Loncat ke bagian dan kembali**
- Pilih bagian dari menu **⤓ Loncat ke bagian…** (atau dari daftar di panel saat belum ada yang dipilih). Halaman bergulir ke sana.
- **↩ Kembali** (juga tombol biru melayang **Kembali ke posisi tadi**, atau tombol `[` di papan ketik) membawa Anda ke posisi dan pilihan sebelumnya. **↪ Maju** (atau `]`) mengulang. Riwayat menyimpan 30 loncatan.

**Perubahan hanya di area yang ditunjuk pointer**
- Arahkan pointer ke sebuah area: muncul garis putus-putus dan label **Area: …**. Diamkan 0,5 detik, area itu terpilih (tombol **Hover = pilih**; matikan jika ingin memilih lewat klik saja).
- Semua pengaturan di panel (warna, font, ukuran, geser) hanya mengubah area terpilih. Teks di dalamnya ikut berubah hanya jika kotak "termasuk teks di dalamnya" dicentang.
- **Fokus area** meredupkan semua yang di luar area terpilih. **🔒 Kunci pilihan** menahan pilihan agar pointer yang lewat tidak menggantinya.
- **Pilih: Tepat / Seluruh bagian**: Tepat = elemen yang ditunjuk; Seluruh bagian = bagian halaman (section, menu, footer) yang ditunjuk.

**Teks & font** (panel, untuk teks, tombol, judul, kartu, dan bagian)
- Jenis huruf (Barlow, Arial, Verdana, Georgia, Times, Courier, serta Poppins, Roboto, Montserrat, Open Sans, Lato, Playfair Display, Merriweather dari Google Fonts), ukuran, ketebalan, miring, garis bawah, HURUF BESAR, rata teks, jarak baris, jarak huruf, dan **Reset teks & font**.
- Font Google dimuat dari internet saat halaman dibuka. Ukuran huruf yang diatur berupa piksel tetap, jadi di ponsel ukurannya sama dengan di desktop; cek lewat Simulasi.

**Naik / turun / kiri / kanan / induk**
- Panel punya enam tombol pilihan: **← Sebelum**, **Sesudah →** (pendamping), **↑ Induk**, **↓ Anak**, **⌂ Bagian**, **✕ Lepas**. Papan ketik: **Shift + panah**.
- **Geser posisi**: tombol ↑ ↓ ← → menggeser elemen terpilih (1 sampai 50 px per tekan, tahan untuk terus bergeser, ⟲ mengembalikan).
- Konten tambahan: **↑ Naik / ↓ Turun / ⇈ Paling atas / ⇊ Paling bawah**, posisi **Kiri / Tengah / Kanan**, dan **Pindahkan ke bagian lain**.
- Elemen bawaan HTML bisa digeser posisinya, tetapi urutannya tidak diubah (hanya konten tambahan yang bisa diurutkan).

**Simulasi website** (tombol **▶ Simulasi website**)
- Membuka halaman ini di jendela perangkat: Ponsel kecil 360, Ponsel 390, Tablet 768, Laptop 1280, Desktop 1440, atau ukuran bebas; **Putar**, skala pas layar / 50 / 75 / 100%.
- **Tampilkan**: draf saat ini (termasuk yang belum disimpan), versi tersimpan, atau tanpa perubahan editor.
- Tombol **ID / EN**, **◀ ▶**, **Muat ulang**, **Tampilan cetak** (menyembunyikan header, menu, footer). Tautan di dalamnya bisa diklik seperti pengunjung.
- Formulir (penawaran, lamaran) di simulasi tampil berhasil tetapi **tidak menyimpan data** ke kotak masuk dan tidak dikirim ke `submitUrl`. Tutup dengan **Tutup simulasi** atau Esc.
