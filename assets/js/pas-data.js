/*
 * PT Prima Armada Samudra - data situs: kotak masuk tamu + konten yang dikelola admin.
 * Disimpan di localStorage (kunci pas_data_v1). Koleksi: pesan, lamaran, berita, lowongan, blok.
 * Agar kiriman tamu juga diteruskan ke luar browser (email/Sheet), isi PAS_CONFIG.submitUrl
 * dengan alamat layanan formulir (Formspree, Web3Forms, Google Apps Script, dsb.).
 */
(function (g) {
  'use strict';
  var KEY = 'pas_data_v1';
  var CFG = g.PAS_CONFIG = g.PAS_CONFIG || {};
  if (CFG.submitUrl === undefined) CFG.submitUrl = '';   // alamat layanan formulir (Formspree/Web3Forms/Apps Script)
  if (CFG.waNumber === undefined) CFG.waNumber = '';     // nomor WhatsApp, mis. '628123456789'. Kosong = tombol tidak muncul.
  var SEED = {"berita": [{"id": "b1", "kategori": "Armada", "kategori_en": "Fleet", "tanggal": "Januari – Juni 2026", "tanggal_en": "January – June 2026", "gambar": "assets/img/berita-armada-2026-1.jpg", "judul_id": "Sembilan kapal baru bergabung dengan armada", "judul_en": "Nine new vessels join the fleet", "isi_id": "Tiga tug (Seal 1603, Cahaya 1602, Cahaya 1603) dan enam barge (Sea Lion 2701, 2702, 2703 serta Cahaya Prima 2701, 2702, 2703) bergabung dengan armada antara Januari dan Mei 2026.", "isi_en": "Three tugs (Seal 1603, Cahaya 1602, Cahaya 1603) and six barges (Sea Lion 2701, 2702, 2703 and Cahaya Prima 2701, 2702, 2703) joined the fleet between January and May 2026."}, {"id": "b2", "kategori": "Klasifikasi", "kategori_en": "Classification", "tanggal": "[Tanggal]", "tanggal_en": "[Date]", "gambar": "assets/img/kapal-tunda.jpg", "judul_id": "Survei kelas RINA untuk armada", "judul_en": "RINA class survey across the fleet", "isi_id": "[Ringkas survei tahunan RINA: kapal yang diperiksa, jenis survei, dan hasilnya.]", "isi_en": "[Summarise the RINA annual survey: vessels inspected, survey type, and result.]"}, {"id": "b3", "kategori": "Armada", "kategori_en": "Fleet", "tanggal": "Juli – Desember 2025", "tanggal_en": "July – December 2025", "gambar": "assets/img/berita-armada-2025-2.jpg", "judul_id": "Lima kapal baru bergabung dengan armada", "judul_en": "Five new vessels join the fleet", "isi_id": "Tug WHA 1602 (Agustus), Cahaya 1601 (Oktober), Dolphin 1602 (November), dan WHA 1601 (Desember) bergabung dengan armada, bersama barge Prima 2702 (Desember 2025).", "isi_en": "Tugs WHA 1602 (August), Cahaya 1601 (October), Dolphin 1602 (November), and WHA 1601 (December) joined the fleet, together with barge Prima 2702 (December 2025)."}, {"id": "b4", "kategori": "Klasifikasi", "kategori_en": "Classification", "tanggal": "[Tanggal]", "tanggal_en": "[Date]", "gambar": "assets/img/anjungan.jpg", "judul_id": "Survei antara dan pembaruan kelas RINA", "judul_en": "RINA intermediate survey and class renewal", "isi_id": "[Catat kapal yang disurvei RINA, temuan, dan tindak lanjutnya.]", "isi_en": "[Record the vessels surveyed by RINA, the findings, and the follow-up.]"}, {"id": "b5", "kategori": "Armada", "kategori_en": "Fleet", "tanggal": "Januari – Juni 2025", "tanggal_en": "January – June 2025", "gambar": "assets/img/berita-armada-2025-1.jpg", "judul_id": "Barge baru Prima 2701 dan tug Dolphin 1601", "judul_en": "New barge Prima 2701 and tug Dolphin 1601", "isi_id": "Barge Prima 2701 (270 ft) bergabung dengan armada pada Maret 2025, disusul tug 26 meter Dolphin 1601 pada Juni 2025.", "isi_en": "Barge Prima 2701 (270 ft) joined the fleet in March 2025, followed by the 26-metre tug Dolphin 1601 in June 2025."}], "lowongan": [{"id": "l1", "judul_id": "[Nama posisi]", "judul_en": "[Position title]", "penempatan": "[Penempatan]", "jenis": "[Jenis kerja]", "tutup": "[tanggal]", "status": "Aktif"}, {"id": "l2", "judul_id": "[Nama posisi]", "judul_en": "[Position title]", "penempatan": "[Penempatan]", "jenis": "[Jenis kerja]", "tutup": "[tanggal]", "status": "Aktif"}]};
  var st = document.querySelector('script[data-page]');
  var PAGE = st ? st.getAttribute('data-page') : '';          // mis. "id/media"
  var LANG = PAGE.split('/')[0], SLUG = PAGE.split('/')[1];
  var ROOT = LANG === 'id' ? '../' : '';

  function load() { try { return JSON.parse(g.localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function put(d) { g.localStorage.setItem(KEY, JSON.stringify(d)); }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  (function () { try { var d = load(); if (d.berita && d.berita.length === 6 && d.berita.some(function (x) { return x.judul_en === '[Company news headline]'; })) { delete d.berita; put(d); } } catch (e) {} })();
  function list(c) { var d = load(); return d[c] !== undefined ? d[c] : JSON.parse(JSON.stringify(SEED[c] || [])); }
  function write(c, l) { var d = load(); d[c] = l; put(d); }
  var D = g.PASData = {
    list: list,
    add: function (c, it) { it.id = uid(); it.dibuat = new Date().toISOString(); var l = list(c); l.unshift(it); write(c, l); return it; },
    update: function (c, id, p) { var l = list(c); l.forEach(function (x) { if (x.id === id) Object.keys(p).forEach(function (k) { x[k] = p[k]; }); }); write(c, l); },
    remove: function (c, id) { write(c, list(c).filter(function (x) { return x.id !== id; })); },
    submit: function (c, data) {
      data.status = 'Baru'; var it = D.add(c, data);
      if (CFG.submitUrl) { try { fetch(CFG.submitUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jenis: c, data: it }) }); } catch (e) {} }
      return it;
    },
    all: load, replaceAll: put, seed: SEED
  };

  function img(s) { return !s || /^(data:|https?:|\/)/.test(s) ? s : ROOT + s; }
  function pick(it, f) { return it[f + '_' + LANG] || it[f + '_id'] || it[f + '_en'] || ''; }
  function el(t, css, txt) { var e = document.createElement(t); if (css) e.style.cssText = css; if (txt != null) e.textContent = txt; return e; }

  /* ---- halaman Media: kartu berita ---- */
  function renderBerita() {
    var first = document.querySelector('main article, section article'); if (!first) return;
    var box = first.parentNode, items = list('berita');
    var tpl = first.cloneNode(true);
    box.querySelectorAll(':scope > article').forEach(function (a) { a.remove(); });
    items.forEach(function (it) {
      var a = tpl.cloneNode(true), im = a.querySelector('img'), sp = a.querySelectorAll('span');
      if (im) { im.setAttribute('src', img(it.gambar)); im.setAttribute('alt', ''); }
      var en = LANG === 'en'; if (sp[0]) sp[0].textContent = (en && it.kategori_en) || it.kategori || ''; if (sp[1]) sp[1].textContent = (en && it.tanggal_en) || it.tanggal || '';
      a.querySelector('h3').textContent = pick(it, 'judul'); a.querySelector('p').textContent = pick(it, 'isi');
      box.appendChild(a);
    });
  }

  /* ---- halaman Karir: daftar lowongan + formulir lamaran ---- */
  function renderLowongan() {
    var a0 = document.querySelector('a[href$="kontak.html"].tautan'); var link = null;
    document.querySelectorAll('section a.tautan').forEach(function (a) { if (/kontak\.html$/.test(a.getAttribute('href')) && a.parentNode.querySelector('h3')) link = link || a; });
    if (!link) return;
    var row = link.parentNode, box = row.parentNode, tpl = row.cloneNode(true);
    box.querySelectorAll(':scope > *').forEach(function (r) { r.remove(); });
    var en = LANG === 'en';
    var items = list('lowongan').filter(function (x) { return x.status !== 'Nonaktif'; });
    if (!items.length) box.appendChild(el('p', 'color:#56697E', en ? 'No open positions at the moment.' : 'Belum ada lowongan saat ini.'));
    items.forEach(function (it) {
      var r = tpl.cloneNode(true), t = pick(it, 'judul');
      r.querySelector('h3').textContent = t;
      r.querySelector('p').textContent = [it.penempatan, it.jenis, it.tutup ? (en ? 'Closes ' : 'Ditutup ') + it.tutup : ''].filter(Boolean).join(' · ');
      var a = r.querySelector('a'); a.setAttribute('href', '#lamar'); a.addEventListener('click', function (e) { e.preventDefault(); lamarModal(t); });
      box.appendChild(r);
    });
  }
  function lamarModal(posisi) {
    var en = LANG === 'en', ov = el('div', 'position:fixed;inset:0;background:rgba(10,34,64,.6);z-index:200;display:flex;align-items:center;justify-content:center;padding:16px');
    var box = el('div', 'background:#fff;max-width:480px;width:100%;max-height:92vh;overflow:auto;padding:26px;border-radius:4px');
    box.appendChild(el('h3', 'margin:0 0 4px;color:#0A2240;font-size:22px', en ? 'Apply' : 'Kirim lamaran'));
    box.appendChild(el('p', 'margin:0 0 16px;color:#56697E', posisi));
    var F = [['nama', en ? 'Full name' : 'Nama lengkap'], ['email', 'Email'], ['hp', en ? 'Phone / WhatsApp' : 'Nomor HP / WhatsApp'], ['tautan_cv', en ? 'CV link (Drive, etc.)' : 'Tautan CV (Drive, dll.)']], ins = {};
    F.forEach(function (f) { box.appendChild(el('label', 'display:block;font-weight:600;font-size:14px;margin:10px 0 4px', f[1])); ins[f[0]] = el('input', 'width:100%;min-height:42px;border:1px solid #A9BACB;border-radius:3px;padding:0 12px;font:inherit'); box.appendChild(ins[f[0]]); });
    box.appendChild(el('label', 'display:block;font-weight:600;font-size:14px;margin:10px 0 4px', en ? 'Message' : 'Pesan'));
    var ta = el('textarea', 'width:100%;border:1px solid #A9BACB;border-radius:3px;padding:10px 12px;font:inherit'); ta.rows = 3; box.appendChild(ta);
    var msg = el('p', 'margin:12px 0 0;font-weight:600;color:#B3261E'); box.appendChild(msg);
    var bar = el('div', 'display:flex;gap:10px;margin-top:14px');
    var ok = el('button', 'min-height:44px;padding:0 20px;border:0;background:#C9872F;color:#fff;font:inherit;font-weight:700;cursor:pointer', en ? 'Send application' : 'Kirim');
    var no = el('button', 'min-height:44px;padding:0 20px;border:1px solid #A9BACB;background:#fff;font:inherit;font-weight:600;cursor:pointer', en ? 'Close' : 'Tutup');
    ok.type = no.type = 'button'; no.onclick = function () { ov.remove(); };
    ok.onclick = function () {
      if (!ins.nama.value.trim() || !(ins.email.value.trim() || ins.hp.value.trim())) { msg.textContent = en ? 'Please fill in your name and an email or phone.' : 'Isi nama dan minimal email atau nomor HP.'; return; }
      var d = { posisi: posisi, pesan: ta.value.trim() }; Object.keys(ins).forEach(function (k) { d[k] = ins[k].value.trim(); });
      try { D.submit('lamaran', d); } catch (e) { msg.textContent = 'Gagal menyimpan: ' + e.message; return; }
      box.innerHTML = ''; box.appendChild(el('h3', 'color:#1E7A4C;margin:0 0 8px', en ? 'Application received' : 'Lamaran diterima'));
      box.appendChild(el('p', '', en ? 'Thank you. Our HR team will review it.' : 'Terima kasih. Tim SDM kami akan memeriksanya.')); box.appendChild(no);
    };
    bar.appendChild(ok); bar.appendChild(no); box.appendChild(bar); ov.appendChild(box); document.body.appendChild(ov); ins.nama.focus();
  }

  /* ---- halaman Kontak: formulir permintaan penawaran ---- */
  function wireKontak() {
    var nm = document.getElementById('f-nama'); if (!nm) return;
    var map = { nama: 'f-nama', perusahaan: 'f-pt', email: 'f-email', hp: 'f-hp', muat: 'f-asal', bongkar: 'f-tujuan', muatan: 'f-muatan', volume: 'f-volume', tanggal: 'f-tgl', pesan: 'f-pesan' };
    var btn = nm.closest('section').querySelector('button'), en = LANG === 'en';
    var msg = el('p', 'margin:12px 0 0;font-weight:600'); btn.parentNode.appendChild(msg);
    btn.addEventListener('click', function () {
      var d = {}; Object.keys(map).forEach(function (k) { d[k] = document.getElementById(map[k]).value.trim(); });
      if (!d.nama || !(d.email || d.hp)) { msg.style.color = '#B3261E'; msg.textContent = en ? 'Please fill in your name and an email or phone number.' : 'Isi nama lengkap dan minimal email atau nomor HP.'; return; }
      try { D.submit('pesan', d); } catch (e) { msg.style.color = '#B3261E'; msg.textContent = 'Gagal menyimpan: ' + e.message; return; }
      Object.keys(map).forEach(function (k) { document.getElementById(map[k]).value = ''; });
      msg.style.color = '#1E7A4C'; msg.textContent = en ? 'Thank you. Your request has been received.' : 'Terima kasih. Permintaan Anda sudah kami terima.';
    });
  }

  /* ---- blok tambahan (semua halaman) ---- */
  function renderBlok() {
    var ft = document.querySelector('footer'); if (!ft) return;
    list('blok').forEach(function (b) {
      if (b.halaman !== SLUG || (b.bahasa && b.bahasa !== 'semua' && b.bahasa !== LANG)) return;
      var s = el('section', 'background:#F3F7FA'), w = el('div', 'max-width:1200px;margin:0 auto;padding:56px 32px');
      if (b.judul) w.appendChild(el('h2', 'margin:0 0 14px;color:#0A2240;font-size:32px;line-height:1.2', b.judul));
      if (b.gambar) { var im = el('img', 'max-width:100%;max-height:420px;display:block;margin:0 0 16px;border-radius:3px'); im.src = img(b.gambar); im.alt = b.judul || ''; w.appendChild(im); }
      (b.isi || '').split(/\n\s*\n/).forEach(function (p) { if (p.trim()) w.appendChild(el('p', 'margin:0 0 12px;max-width:820px', p.trim())); });
      s.appendChild(w); ft.parentNode.insertBefore(s, ft);
    });
  }

  function init() {
    if (!SLUG) return;
    if (SLUG === 'media') renderBerita();
    if (SLUG === 'karir') renderLowongan();
    if (SLUG === 'kontak') wireKontak();
    renderBlok();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})(window);
