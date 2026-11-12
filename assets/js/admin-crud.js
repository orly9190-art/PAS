/* Panel admin: menu Kotak Masuk & Kelola Konten dengan Tambah / Ubah / Hapus. Bergantung pada admin.js (window.PASAdmin) dan pas-data.js. */
(function () {
  'use strict';
  var A = window.PASAdmin, h = A.h, D = window.PASData;
  var ST = ['Baru', 'Dibaca', 'Selesai'];
  var SLUGS = [['index', 'Tentang Kami'], ['layanan', 'Layanan'], ['keberlanjutan', 'Keberlanjutan'], ['media', 'Media'], ['karir', 'Karir'], ['kontak', 'Kontak'], ['legal', 'Legal']];
  var CFG = {
    pesan: { group: 'Kotak Masuk', title: 'Permintaan Penawaran', sub: 'Masuk dari formulir di halaman Kontak.', cols: ['nama', 'perusahaan', 'muatan', 'status', 'dibuat'],
      fields: [['nama', 'Nama'], ['perusahaan', 'Perusahaan'], ['email', 'Email'], ['hp', 'HP / WhatsApp'], ['muat', 'Pelabuhan muat'], ['bongkar', 'Pelabuhan bongkar'], ['muatan', 'Jenis muatan'], ['volume', 'Volume (MT)'], ['tanggal', 'Tanggal muat'], ['pesan', 'Keterangan', 'area'], ['status', 'Status', 'sel', ST]] },
    lamaran: { group: 'Kotak Masuk', title: 'Lamaran Kerja', sub: 'Masuk dari tombol Lamar di halaman Karir.', cols: ['nama', 'posisi', 'email', 'status', 'dibuat'],
      fields: [['nama', 'Nama'], ['posisi', 'Posisi'], ['email', 'Email'], ['hp', 'HP / WhatsApp'], ['tautan_cv', 'Tautan CV'], ['pesan', 'Pesan', 'area'], ['status', 'Status', 'sel', ST]] },
    berita: { group: 'Kelola Konten', title: 'Berita (Media)', sub: 'Kartu berita di halaman Media.', cols: ['gambar', 'judul_id', 'kategori', 'tanggal'],
      fields: [['kategori', 'Kategori'], ['tanggal', 'Tanggal'], ['gambar', 'Gambar', 'img'], ['judul_id', 'Judul (ID)'], ['judul_en', 'Judul (EN)'], ['isi_id', 'Ringkasan (ID)', 'area'], ['isi_en', 'Ringkasan (EN)', 'area']] },
    lowongan: { group: 'Kelola Konten', title: 'Lowongan (Karir)', sub: 'Daftar lowongan di halaman Karir. Yang berstatus Nonaktif tidak tampil.', cols: ['judul_id', 'penempatan', 'jenis', 'tutup', 'status'],
      fields: [['judul_id', 'Posisi (ID)'], ['judul_en', 'Posisi (EN)'], ['penempatan', 'Penempatan'], ['jenis', 'Jenis kerja'], ['tutup', 'Tanggal tutup'], ['status', 'Status', 'sel', ['Aktif', 'Nonaktif']]] },
    blok: { group: 'Kelola Konten', title: 'Konten Halaman', sub: 'Konten tambahan (paragraf berformat dan gambar) untuk halaman mana pun; tampil sebelum footer.', cols: ['halaman', 'bahasa', 'judul'],
      fields: [['halaman', 'Halaman', 'sel', SLUGS.map(function (s) { return s[0]; })], ['bahasa', 'Bahasa', 'sel', ['semua', 'id', 'en']], ['judul', 'Judul'], ['isi', 'Isi (pisahkan paragraf dengan baris kosong)', 'area'], ['gambar', 'Gambar (opsional)', 'img']] }
  };
  var LBL = { dibuat: 'Masuk', halaman: 'Halaman', bahasa: 'Bahasa', judul: 'Judul' };
  function lbl(c, k) { var f = c.fields.filter(function (x) { return x[0] === k; })[0]; return f ? f[1] : (LBL[k] || k); }

  var css = document.createElement('style');
  css.textContent = '.tbl{width:100%;border-collapse:collapse;background:#fff;border:1px solid var(--line);margin-top:14px}.tbl th,.tbl td{padding:10px 12px;text-align:left;border-bottom:1px solid var(--line);font-size:14.5px;vertical-align:middle}.tbl th{background:var(--bg);color:var(--navy);font-size:12.5px;letter-spacing:1px;text-transform:uppercase}.tbl td.act{white-space:nowrap;text-align:right}.tbl img{height:38px;width:60px;object-fit:cover;border-radius:2px;display:block}.tw{overflow-x:auto}.pill{padding:2px 9px;border-radius:10px;background:var(--bg);font-weight:700;font-size:12.5px}.pill.Baru,.pill.Aktif{background:#FBEBD0;color:#7A4F10}.pill.Selesai{background:#DDF1E6;color:var(--ok)}.mov{position:fixed;inset:0;background:rgba(10,34,64,.55);z-index:90;display:flex;align-items:center;justify-content:center;padding:16px}.mbox{background:#fff;border-radius:3px;max-width:560px;width:100%;max-height:92vh;overflow:auto;padding:24px}.mbox h2{margin:0 0 14px;color:var(--navy)}.mbox label{display:block;font-weight:600;font-size:14px;margin:12px 0 4px;color:var(--navy)}.mbox input,.mbox textarea,.mbox select{width:100%;padding:9px 12px;border:1px solid #BCCBDA;border-radius:2px;background:#fff}.mbox .bar{display:flex;gap:8px;margin-top:18px;justify-content:flex-end}.mbox .pv{max-height:110px;display:block;margin:8px 0}';
  document.head.appendChild(css);

  function fmt(c, it, k) {
    var v = it[k]; if (v == null || v === '') return '—';
    if (k === 'dibuat') return new Date(v).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
    if (k === 'gambar') return h('img', { src: /^(data:|https?:)/.test(v) ? v : '../' + v, alt: '' });
    if (k === 'status') return h('span', { class: 'pill ' + v, text: v });
    v = String(v); return v.length > 70 ? v.slice(0, 67) + '…' : v;
  }

  function form(key, it, done) {
    var c = CFG[key], vals = {}, ctl = {}, isNew = !it; it = it || { status: key === 'lowongan' ? 'Aktif' : (c.fields.some(function (f) { return f[0] === 'status'; }) ? 'Baru' : undefined), bahasa: 'semua', halaman: 'index' };
    var box = h('div', { class: 'mbox', role: 'dialog', 'aria-modal': 'true' }, h('h2', { text: (isNew ? 'Tambah ' : 'Ubah ') + c.title }));
    c.fields.forEach(function (f) {
      var k = f[0], v = it[k] || '', e;
      vals[k] = v; box.appendChild(h('label', { text: f[1] }));
      if (f[2] === 'area') { e = h('textarea', { rows: 4 }); e.value = v; }
      else if (f[2] === 'sel') { e = h('select', null, f[3].map(function (o) { return h('option', { value: o, text: o, selected: o === v }); })); }
      else if (f[2] === 'img') {
        vals[k + '_f'] = it[k + '_f'] || '';
        var fw = window.PASAdminEdit.focal(v, vals[k + '_f'], function (p) { vals[k + '_f'] = p; });
        e = h('input', { type: 'file', accept: 'image/*', onchange: function () {
          if (!e.files[0]) return; A.fileToDataURL(e.files[0]).then(function (u) { vals[k] = u; fw.setSrc(u); }, function (er) { A.toast(er.message); });
        } });
        box.appendChild(e); e = fw.el;
      } else { e = h('input', { type: 'text' }); e.value = v; }
      if (f[2] !== 'img') e.addEventListener('input', function () { vals[k] = e.value; });
      if (f[2] === 'sel') e.addEventListener('change', function () { vals[k] = e.value; });
      box.appendChild(e);
    });
    var ov = h('div', { class: 'mov' }, box);
    function close() { ov.remove(); }
    box.appendChild(h('div', { class: 'bar' },
      h('button', { type: 'button', class: 'btn btn-line', text: 'Batal', onclick: close }),
      h('button', { type: 'button', class: 'btn btn-gold', text: 'Simpan', onclick: function () {
        try { if (isNew) D.add(key, vals); else D.update(key, it.id, vals); } catch (e) { A.toast('Gagal menyimpan (penyimpanan penuh?): ' + e.message); return; }
        close(); A.toast(isNew ? 'Data ditambahkan.' : 'Perubahan disimpan.'); done();
      } })));
    ov.addEventListener('mousedown', function (e) { if (e.target === ov) close(); });
    document.body.appendChild(ov);
  }

  function view(key) {
    var c = CFG[key]; if (!c) { location.hash = '#dashboard'; return; }
    if (key === 'blok' && window.PASBlocks) return window.PASBlocks.view();   // pembangun konten dengan editor teks kaya
    var q = '', body = h('div');
    var search = h('input', { type: 'search', class: 'search', placeholder: 'Cari…', 'aria-label': 'Cari', oninput: function () { q = search.value.toLowerCase(); draw(); } });
    function draw() {
      body.textContent = '';
      var all = D.list(key), rows = all.filter(function (it) { return !q || JSON.stringify(it).toLowerCase().indexOf(q) > -1; });
      if (!rows.length) { body.appendChild(h('div', { class: 'empty', text: all.length ? 'Tidak ada yang cocok.' : 'Belum ada data. Klik “Tambah”.' })); return; }
      body.appendChild(h('div', { class: 'tw' }, h('table', { class: 'tbl' },
        h('thead', null, h('tr', null, c.cols.map(function (k) { return h('th', { text: lbl(c, k) }); }), h('th'))),
        h('tbody', null, rows.map(function (it) {
          return h('tr', null, c.cols.map(function (k) { return h('td', null, fmt(c, it, k)); }),
            h('td', { class: 'act' },
              h('button', { type: 'button', class: 'btn btn-line btn-sm', text: 'Ubah', onclick: function () { form(key, it, refresh); } }), ' ',
              h('button', { type: 'button', class: 'btn btn-danger btn-sm', text: 'Hapus', onclick: function () {
                if (confirm('Hapus data ini? Tindakan tidak bisa dibatalkan.')) { D.remove(key, it.id); A.toast('Data dihapus.'); refresh(); }
              } })));
        })))));
    }
    function refresh() { view(key); }
    function exportJson() {
      var u = URL.createObjectURL(new Blob([JSON.stringify(D.list(key), null, 2)], { type: 'application/json' })), a = h('a', { href: u, download: 'pas-' + key + '.json' });
      document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(u); }, 1000);
    }
    A.shell('k/' + key, c.title, h('div', null,
      h('h1', { class: 'pt', text: c.title }), h('p', { class: 'meta', text: c.sub + ' Total: ' + D.list(key).length + '.' }),
      h('div', { class: 'ehead', style: 'position:static;border:0;padding:8px 0 0;margin:0;background:none' }, h('div', { class: 'row2' }, search,
        h('button', { type: 'button', class: 'btn btn-line', text: 'Ekspor JSON', onclick: exportJson }),
        h('button', { type: 'button', class: 'btn btn-gold', text: '+ Tambah', onclick: function () { form(key, null, refresh); } }))),
      body));
    draw();
  }
  window.PASAdminCrud = { view: view, cfg: CFG, newCount: function () { return D.list('pesan').concat(D.list('lamaran')).filter(function (x) { return x.status === 'Baru'; }).length; } };
  window.dispatchEvent(new Event('hashchange')); // gambar ulang menu setelah modul ini siap
})();
