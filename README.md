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
assets/js/            site-edit.js, site-search.js, site-ui.js (tombol WhatsApp & ke atas),
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
  Ganti di bagian atas `assets/js/admin.js` (`ADMIN_USER` dan `ADMIN_PASS`).
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

## Edit langsung di halaman website

Selain panel admin, setiap halaman kini bisa diedit langsung di tempat.

1. Buka `admin/index.html` lalu login.
2. Buka halaman mana saja di tab yang sama. Tombol **Edit halaman** muncul di pojok kiri bawah.
   Pengunjung biasa tidak melihat tombol ini.
3. Klik tombol itu. Bilah **MODE EDIT** muncul di atas, dan semua alat edit tampil:

| Yang diubah | Caranya |
|---|---|
| Teks | Klik teks bergaris putus-putus, ketik, tekan Enter. Esc membatalkan. |
| Foto | Arahkan ke foto, klik **Ganti foto**, pilih berkas dari laptop. Foto otomatis diperkecil. |
| Posisi foto | Klik **Posisi**. Geser slider Atas-Bawah / Kiri-Kanan, pilih cepat Atas / Tengah / Bawah, atau seret fotonya langsung. |
| Warna latar | Klik ikon palet di pojok kanan atas tiap bagian, tab **Latar**. Pilih dari 32 warna dasar, atau **Warna asli**. |
| Warna tulisan | Di panel yang sama, tab **Tulisan**. Pilih dari 32 warna, **Otomatis** (putih atau navy, mana yang paling terbaca), atau **Warna asli**. |

Tombol **Asli** di atas foto mengembalikan foto aslinya. **Kembalikan ke asli** di bilah atas
menghapus semua perubahan halaman itu.

Saat warna latar membuat tulisan sulit dibaca, panel menampilkan peringatan dengan tombol
**Sesuaikan tulisan otomatis**. Warna tulisan hanya mengubah teks yang langsung berada di atas
latar bagian itu; teks di dalam kartu putih dan tombol sengaja tidak ikut berubah agar tetap terbaca.

Selama mode edit aktif, tautan dan tombol di halaman sengaja tidak berfungsi supaya Anda tidak
berpindah halaman saat mengklik teks. Klik **Selesai edit** untuk kembali normal.

### Agar pengunjung ikut melihat perubahan

Perubahan tersimpan di browser Anda saja. Untuk menayangkannya:

1. Klik **Unduh halaman** di bilah atas. Berkas HTML yang sudah memuat perubahan akan terunduh.
2. Unggah berkas itu ke GitHub, menggantikan berkas lama dengan nama yang sama.
   Halaman bahasa Indonesia ke folder `id/`, halaman bahasa Inggris ke folder utama.
3. Setelah GitHub selesai memperbarui (satu sampai dua menit), semua pengunjung melihat versi baru.

Foto yang diganti ikut tertanam di dalam berkas HTML, jadi ukurannya bertambah sekitar
150-400 KB per foto.

### Batasan

- Ruang penyimpanan browser sekitar 5 MB, cukup untuk kira-kira 10-15 foto pengganti.
  Jika penuh, unduh halaman, unggah ke GitHub, lalu klik **Kembalikan ke asli** untuk mengosongkan ruang.
- Teks tidak boleh dikosongkan. Menghapus seluruh bagian perlu diubah langsung di berkas HTML.
- Kartu berita dan daftar lowongan diatur lewat panel admin (Kelola Konten), bukan lewat mode edit.
- Foto di menu atas (logo) tidak diberi tombol karena ikut bergerak saat halaman di-scroll.
  Ganti logo lewat panel admin.

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


## Peta wilayah operasi, sejarah, dan jumlah armada

- **Peta** (halaman Layanan): tiga foto peta, yaitu Peta 1 lokasi kantor, Peta 2 rute Samarinda, Peta 3 rute Banjarmasin.
  Berkasnya `assets/img/peta-indonesia-en|id.jpg`, `peta-rute-samarinda-en|id.jpg`, `peta-rute-banjarmasin-en|id.jpg` (versi EN dan ID berbeda).
  Ganti lewat Mode Edit: klik **Ganti foto** di atas peta, pilih gambar dari laptop. Foto peta tampil utuh (tidak dipotong).
- **Sejarah** (halaman Tentang Kami): garis waktu 2004, 2009, 2014, 2019, 2024, 2026. Angka `[x]` adalah tempat isian
  jumlah tug dan barge PAS dan LLJ; isi lewat Mode Edit (klik angkanya lalu ketik).
- **Jumlah armada** (pita angka di Tentang Kami): 18 kapal tunda dan 25 tongkang, sesuai data master armada sendiri.


## Menyimpan hasil Mode Edit ke berkas (penting)

Semua perubahan dari Mode Edit (teks, foto, posisi, warna, urutan bagian) tersimpan **di browser** yang dipakai saja,
bukan di berkas website. Agar ikut terunggah ke GitHub:

1. Login admin, buka **Dashboard**.
2. Klik **Unduh website + semua perubahan (.zip)**.
3. Ekstrak zip itu, salin isinya ke folder `situs-pas` (timpa berkas lama), lalu unggah ke GitHub.

Foto yang Anda ganti ikut tersimpan sebagai `assets/img/edit-*.jpg/png`. Tombol ini bekerja dari web Claude atau dari
website yang sudah dihosting; tidak dari berkas yang dibuka langsung di komputer.

## Login dan tombol Edit halaman

Tombol **Edit halaman** (kiri bawah) hanya muncul setelah login admin (`admin/index.html`).
Login berlaku di semua tab browser yang sama selama 12 jam.
