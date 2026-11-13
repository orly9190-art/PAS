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
      if (im) { im.setAttribute('src', img(it.gambar)); im.setAttribute('alt', ''); if (it.gambar_f) im.style.objectPosition = it.gambar_f; }
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

  /* ---- blok konten halaman: teks kaya (HTML disaring) + gambar ---- */
  var RICH_CSS = '.pas-rich{color:#1C2733;font-size:16.5px;line-height:1.7;overflow-wrap:anywhere}' +
    '.pas-rich>*:first-child{margin-top:0}.pas-rich>*:last-child{margin-bottom:0}' +
    '.pas-rich h1,.pas-rich h2,.pas-rich h3,.pas-rich h4,.pas-rich h5,.pas-rich h6{color:#0A2240;line-height:1.25;margin:22px 0 12px;font-weight:700}' +
    '.pas-rich h1{font-size:40px}.pas-rich h2{font-size:32px}.pas-rich h3{font-size:26px}.pas-rich h4{font-size:21px}' +
    '.pas-rich h5{font-size:18px}.pas-rich h6{font-size:15px;letter-spacing:1.4px;text-transform:uppercase;color:#13508C}' +
    '.pas-rich p{margin:0 0 12px}.pas-rich ul,.pas-rich ol{margin:0 0 14px;padding-left:26px}.pas-rich li{margin:0 0 4px}' +
    '.pas-rich blockquote{margin:0 0 14px;padding:4px 0 4px 18px;border-left:4px solid #C9872F;color:#3C4F63}' +
    '.pas-rich a{color:#13508C;text-decoration:underline}.pas-rich hr{border:0;border-top:1px solid #DEE6EE;margin:20px 0}';
  var OK_TAG = { p: 1, br: 1, h1: 1, h2: 1, h3: 1, h4: 1, h5: 1, h6: 1, strong: 1, em: 1, u: 1, s: 1, sub: 1, sup: 1, ul: 1, ol: 1, li: 1, blockquote: 1, a: 1, hr: 1 };
  var ALIGNABLE = { p: 1, h1: 1, h2: 1, h3: 1, h4: 1, h5: 1, h6: 1, blockquote: 1, li: 1 };
  var TAG_MAP = { b: 'strong', i: 'em', strike: 's', del: 's' };
  var DROP = /^(script|style|iframe|object|embed|noscript|template|svg|math|form|input|button|textarea|select|link|meta|title|head|img|video|audio|canvas)$/;
  var BLOCKY = /^(p|div|h[1-6]|ul|ol|li|blockquote|hr|table|section|article)$/;
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function safeUrl(u) { u = (u || '').trim(); return /^(https?:\/\/|mailto:|tel:|#|\/)/i.test(u) ? u : ''; }
  function hasBlock(n) { return Array.prototype.some.call(n.children, function (c) { return BLOCKY.test(c.nodeName.toLowerCase()); }); }
  function walk(src, dst) {
    Array.prototype.forEach.call(src.childNodes, function (n) {
      if (n.nodeType === 3) { dst.appendChild(document.createTextNode(n.nodeValue)); return; }
      if (n.nodeType !== 1) return;
      var t = n.nodeName.toLowerCase();
      if (DROP.test(t)) return;
      if (t === 'span' || t === 'font') {                       // tempelan dari Word/web: ubah gaya jadi tag aman
        var st = (n.getAttribute('style') || '').toLowerCase(), box = dst, wrap = [];
        if (/font-weight:\s*(bold|[6-9]00)/.test(st)) wrap.push('strong');
        if (/font-style:\s*italic/.test(st)) wrap.push('em');
        if (/text-decoration[^;]*underline/.test(st)) wrap.push('u');
        wrap.forEach(function (w) { var e = document.createElement(w); box.appendChild(e); box = e; });
        walk(n, box); return;
      }
      if (t === 'div' && hasBlock(n)) { walk(n, dst); return; }
      var out = t === 'div' ? 'p' : (TAG_MAP[t] || t);
      if (!OK_TAG[out]) { walk(n, dst); return; }               // tag tak dikenal: buang tag, simpan isinya
      var e = document.createElement(out);
      if (out === 'a') {
        var href = safeUrl(n.getAttribute('href'));
        if (!href) { walk(n, dst); return; }
        e.setAttribute('href', href);
        if (/^https?:/i.test(href)) { e.setAttribute('target', '_blank'); e.setAttribute('rel', 'noopener noreferrer'); }
      }
      if (ALIGNABLE[out]) {
        var m = /text-align:\s*(left|center|right|justify)/i.exec(n.getAttribute('style') || '') || /^(left|center|right|justify)$/i.exec(n.getAttribute('align') || '');
        if (m && m[1].toLowerCase() !== 'left') e.setAttribute('style', 'text-align:' + m[1].toLowerCase());
      }
      if (out !== 'br' && out !== 'hr') walk(n, e);
      dst.appendChild(e);
    });
  }
  // Teks lepas di level atas (belum di dalam tag blok) dibungkus <p> supaya jarak antarparagraf konsisten.
  function wrapLoose(box) {
    var run = [];
    function flush(before) {
      if (!run.length) return;
      var txt = run.map(function (n) { return n.textContent; }).join('').trim();
      if (txt || run.some(function (n) { return n.nodeName === 'A' || n.nodeName === 'STRONG' || n.nodeName === 'EM'; })) {
        var p = document.createElement('p'); box.insertBefore(p, run[0]);
        run.forEach(function (n) { p.appendChild(n); });
      } else run.forEach(function (n) { box.removeChild(n); });
      run = [];
    }
    Array.prototype.slice.call(box.childNodes).forEach(function (n) {
      if (n.nodeType === 1 && /^(P|H[1-6]|UL|OL|BLOCKQUOTE|HR)$/.test(n.nodeName)) flush(); else run.push(n);
    });
    flush();
  }
  // Menyaring HTML (daftar putih tag & atribut) sebelum disimpan dan sebelum tampil di halaman publik.
  function clean(html) {
    if (!html) return '';
    var doc = new DOMParser().parseFromString('<body>' + html, 'text/html'), box = document.createElement('div');
    walk(doc.body, box);
    wrapLoose(box);
    Array.prototype.slice.call(box.querySelectorAll('p, h1, h2, h3, h4, h5, h6, blockquote, li')).forEach(function (n) {   // buang blok kosong
      if (!n.textContent.replace(/\u00A0/g, ' ').trim() && !n.querySelector('ul, ol, hr') && n.parentNode) n.parentNode.removeChild(n);
    });
    var out = box.innerHTML.replace(/\u200B/g, '');
    return box.textContent.trim() === '' && !/<(hr|ul|ol)/.test(out) ? '' : out;
  }
  function safeImg(s) { s = (s || '').trim(); return /^(data:image\/(png|jpe?g|gif|webp);base64,|https?:\/\/|\/)/i.test(s) || /^[\w\-./ ]+\.(png|jpe?g|gif|webp|svg)$/i.test(s) ? s : ''; }
  function ytId(u) { var m = /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?(?:[^#\s]*&)?v=|embed\/|shorts\/|live\/|v\/))([\w-]{11})/i.exec((u || '').trim()); return m ? m[1] : ''; }
  function ytStart(u) { var m = /[?&#](?:t|start)=(\d+)/i.exec(u || ''); return m ? +m[1] : 0; }
  function safeVideo(s) { s = (s || '').trim(); return /^data:video\/(mp4|webm|ogg);base64,/i.test(s) || /^https?:\/\/[^\s"'<>]+\.(mp4|webm|ogg)(\?[^\s"'<>]*)?$/i.test(s) ? s : ''; }
  function elemen(b) {
    if (Array.isArray(b.elemen)) return b.elemen;
    var out = [];                                                // data lama: satu gambar + teks biasa
    if (b.gambar) out.push({ tipe: 'gambar', src: b.gambar, f: b.gambar_f || '', alt: b.judul || '', potong: !!b.gambar_f, ukuran: 'sedang', posisi: 'kiri' });
    if (b.isi) out.push({ tipe: 'teks', html: String(b.isi).split(/\n\s*\n/).filter(function (p) { return p.trim(); }).map(function (p) { return '<p>' + esc(p.trim()) + '</p>'; }).join('') });
    return out;
  }
  D.clean = clean; D.elemen = elemen; D.ytId = ytId; D.richCss = RICH_CSS; D.setList = function (c, l) { write(c, l); };

  function renderBlok() {
    var ft = document.querySelector('footer'); if (!ft) return;
    var css = document.createElement('style'); css.textContent = RICH_CSS; document.head.appendChild(css);
    var WIDTH = { penuh: '100%', sedang: '640px', kecil: '340px' };
    list('blok').forEach(function (b) {
      if (b.halaman !== SLUG || b.tampil === false || (b.bahasa && b.bahasa !== 'semua' && b.bahasa !== LANG)) return;
      var els = elemen(b); if (!els.length && !b.judul) return;
      var s = el('section', 'background:#F3F7FA'), w = el('div', 'max-width:1200px;margin:0 auto;padding:56px 32px');
      s.setAttribute('data-blok', b.id || '');
      if (b.judul) w.appendChild(el('h2', 'margin:0 0 18px;color:#0A2240;font-size:32px;line-height:1.2', b.judul));
      els.forEach(function (it) {
        if (it.tipe === 'teks') {
          var html = clean(it.html); if (!html) return;
          var d = el('div', 'max-width:820px;margin:0 0 18px'); d.className = 'pas-rich'; d.innerHTML = html; w.appendChild(d);
        } else if (it.tipe === 'gambar') {
          var src = safeImg(it.src); if (!src) return;
          var fg = el('figure', 'margin:0 0 22px;max-width:' + (WIDTH[it.ukuran] || '100%') + (it.posisi === 'tengah' ? ';margin-left:auto;margin-right:auto' : it.posisi === 'kanan' ? ';margin-left:auto' : ''));
          var im = el('img', 'width:100%;height:auto;display:block;border-radius:3px'); im.src = img(src); im.alt = it.alt || '';
          if (it.potong) { im.style.height = '360px'; im.style.objectFit = 'cover'; if (it.f) im.style.objectPosition = it.f; }
          fg.appendChild(im);
          if (it.caption) fg.appendChild(el('figcaption', 'margin-top:8px;font-size:14px;color:#56697E;line-height:1.5', it.caption));
          w.appendChild(fg);
        } else if (it.tipe === 'video') {
          var yid = it.sumber === 'file' ? '' : ytId(it.url), vs = it.sumber === 'file' ? safeVideo(it.src) : '';
          if (!yid && !vs) return;
          var fv = el('figure', 'margin:0 0 22px;max-width:' + (WIDTH[it.ukuran] || '100%') + (it.posisi === 'tengah' ? ';margin-left:auto;margin-right:auto' : it.posisi === 'kanan' ? ';margin-left:auto' : ''));
          var fr = el('div', 'position:relative;aspect-ratio:16/9;background:#0A2240;border-radius:3px;overflow:hidden');
          if (yid) {
            var ifr = el('iframe', 'position:absolute;inset:0;width:100%;height:100%;border:0'), st0 = ytStart(it.url);
            ifr.src = 'https://www.youtube-nocookie.com/embed/' + yid + (st0 ? '?start=' + st0 : ''); ifr.title = it.caption || 'Video';
            ifr.allow = 'accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen'; ifr.setAttribute('allowfullscreen', ''); ifr.loading = 'lazy'; fr.appendChild(ifr);
          } else {
            var vd = el('video', 'width:100%;height:100%;display:block;background:#000'); vd.controls = true; vd.preload = 'metadata'; vd.setAttribute('playsinline', ''); vd.src = vs; fr.appendChild(vd);
          }
          fv.appendChild(fr);
          if (it.caption) fv.appendChild(el('figcaption', 'margin-top:8px;font-size:14px;color:#56697E;line-height:1.5', it.caption));
          w.appendChild(fv);
        }
      });
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
