/*
 * PT Prima Armada Samudra - data situs: kotak masuk tamu + konten yang dikelola admin.
 * Disimpan di localStorage (kunci pas_data_v1). Koleksi: pesan, lamaran, berita, lowongan, blok.
 * Agar kiriman tamu juga diteruskan ke luar browser (email/Sheet), isi PAS_CONFIG.submitUrl
 * dengan alamat layanan formulir (Formspree, Web3Forms, Google Apps Script, dsb.).
 */
(function (g) {
  'use strict';
  var KEY = 'pas_data_v1';
  var CFG = g.PAS_CONFIG = g.PAS_CONFIG || { submitUrl: '' };
  var SEED = {"berita": [{"id": "b1", "kategori": "Sertifikat", "tanggal": "[Tanggal]", "gambar": "assets/img/tarikan-sungai.jpg", "judul_id": "Pembaruan sertifikat keselamatan HSSC armada", "judul_en": "HSSC safety certificate renewal across the fleet", "isi_id": "[Ringkas kegiatan pembaruan sertifikat keselamatan konstruksi, radio, dan perlengkapan.]", "isi_en": "[Summarise the renewal of hull, radio, and equipment safety certificates.]"}, {"id": "b2", "kategori": "Sertifikat", "tanggal": "[Tanggal]", "gambar": "assets/img/armada-dermaga.jpg", "judul_id": "Endorsement SNPP dan IOPP tahunan selesai", "judul_en": "Annual SNPP and IOPP endorsement completed", "isi_id": "[Ringkas proses endorsement sertifikat pencegahan pencemaran dan masa berlakunya yang baru.]", "isi_en": "[Summarise the pollution prevention endorsement and its new validity period.]"}, {"id": "b3", "kategori": "Operasional", "tanggal": "[Tanggal]", "gambar": "assets/img/kapal-tunda.jpg", "judul_id": "Docking terjadwal dan kembali beroperasi", "judul_en": "Scheduled docking completed, vessel back in service", "isi_id": "[Ringkas lingkup pekerjaan docking, lama pengerjaan, dan tanggal kapal kembali beroperasi.]", "isi_en": "[Summarise the docking scope, duration, and return-to-service date.]"}, {"id": "b4", "kategori": "Keselamatan", "tanggal": "[Tanggal]", "gambar": "assets/img/dek-keselamatan.jpg", "judul_id": "Pelatihan keselamatan dan latihan keadaan darurat kru", "judul_en": "Crew safety training and emergency drill", "isi_id": "[Tulis jenis pelatihan, jumlah peserta, dan materi yang dilatihkan.]", "isi_en": "[Note the training type, participants, and material covered.]"}, {"id": "b5", "kategori": "Klasifikasi", "tanggal": "[Tanggal]", "gambar": "assets/img/anjungan.jpg", "judul_id": "Survei berkala bersama surveyor badan klasifikasi", "judul_en": "Periodic survey with the classification society surveyor", "isi_id": "[Tulis pelaksanaan survei klas, temuan, dan tindak lanjutnya.]", "isi_en": "[Record the class survey, findings, and follow-up.]"}, {"id": "b6", "kategori": "Perusahaan", "tanggal": "[Tanggal]", "gambar": "assets/img/kru-kapal.jpg", "judul_id": "[Judul berita perusahaan]", "judul_en": "[Company news headline]", "isi_id": "[Misalnya penambahan armada, kerja sama baru, atau pencapaian perusahaan.]", "isi_en": "[For example a fleet addition, a new partnership, or a milestone.]"}], "lowongan": [{"id": "l1", "judul_id": "[Nama posisi]", "judul_en": "[Position title]", "penempatan": "[Penempatan]", "jenis": "[Jenis kerja]", "tutup": "[tanggal]", "status": "Aktif"}, {"id": "l2", "judul_id": "[Nama posisi]", "judul_en": "[Position title]", "penempatan": "[Penempatan]", "jenis": "[Jenis kerja]", "tutup": "[tanggal]", "status": "Aktif"}]};
  var st = document.querySelector('script[data-page]');
  var PAGE = st ? st.getAttribute('data-page') : '';          // mis. "id/media"
  var LANG = PAGE.split('/')[0], SLUG = PAGE.split('/')[1];
  var ROOT = LANG === 'id' ? '../' : '';

  function load() { try { return JSON.parse(g.localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function put(d) { g.localStorage.setItem(KEY, JSON.stringify(d)); }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
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
      if (sp[0]) sp[0].textContent = it.kategori || ''; if (sp[1]) sp[1].textContent = it.tanggal || '';
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
