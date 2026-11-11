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
assets/js/            site-edit.js, admin.js, admin-data.js, pas-data.js (data tamu + konten), admin-crud.js (Tambah/Ubah/Hapus), admin-editor.js (editor dua bahasa + fokus gambar), site-search.js (pencarian navbar)
tools/                Skrip pembuat ulang admin-data.js (opsional, perlu Node)
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


## Editor halaman dua bahasa, fokus gambar, dan menu dropdown

- **Dua bahasa sekaligus:** satu bidang menampilkan kolom ID dan EN berdampingan. Tombol **Simpan perubahan** menyimpan keduanya.
  Terjemahan tidak otomatis (isi tiap bahasa tetap Anda tulis sendiri); yang otomatis sama untuk kedua bahasa adalah **gambar** dan pengaturan fokusnya.
- **Dropdown bahasa tampilan** di sisi kiri atas: *Indonesia + Inggris* (bawaan), *Indonesia saja*, atau *Inggris saja*.
- **Dropdown bagian:** setiap menu halaman punya panah ▾ berisi daftar judul bagian. Klik judulnya untuk langsung loncat ke bagian itu (misalnya Keberlanjutan, Bagaimana kami menjalankannya).
- **Fokus gambar:** pada setiap gambar, klik atau geser di atas gambar untuk memilih bagian yang difokuskan. Kotak pratinjau di sebelahnya menunjukkan hasil potongan.
  Berlaku juga untuk gambar di menu Berita dan Blok Halaman. Fokus hanya terlihat pada gambar yang ditampilkan dengan potongan (*cover*), bukan pada logo.

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
