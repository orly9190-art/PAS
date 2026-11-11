/*
 * Panel admin PT Prima Armada Samudra.
 * Semua perubahan disimpan di localStorage browser ini (lihat site-edit.js).
 *
 * CATATAN KEAMANAN: login di bawah hanya penghalang tampilan. Website statis
 * tidak punya server, jadi kata sandi ini terlihat oleh siapa pun yang membuka
 * file ini. Karena perubahan hanya tersimpan di browser pembuatnya, risikonya
 * terbatas, tetapi jangan pakai kata sandi yang Anda pakai di tempat lain.
 */
(function () {
  'use strict';

  // ====== GANTI DI SINI ======
  var ADMIN_USER = 'admin';
  var ADMIN_PASS = 'admin123';
  // ===========================

  var SESSION = 'pas_admin_session';
  var QUOTA_CHARS = 5000000; // perkiraan batas localStorage (±5 MB)

  var PAGES = [
    { slug: 'index',         name: 'Tentang Kami',  file: 'index.html' },
    { slug: 'layanan',       name: 'Layanan',       file: 'layanan.html' },
    { slug: 'keberlanjutan', name: 'Keberlanjutan', file: 'keberlanjutan.html' },
    { slug: 'media',         name: 'Media',         file: 'media.html' },
    { slug: 'karir',         name: 'Karir',         file: 'karir.html' },
    { slug: 'kontak',        name: 'Kontak',        file: 'kontak.html' },
    { slug: 'legal',         name: 'Legal',         file: 'legal.html' }
  ];
  var LANGS = { en: 'Bahasa Inggris', id: 'Bahasa Indonesia' };
  var TAGS = {
    h1: 'Judul', h2: 'Judul', h3: 'Sub-judul', h4: 'Sub-judul', h5: 'Sub-judul', h6: 'Sub-judul',
    p: 'Paragraf', li: 'Daftar', a: 'Tautan / tombol', button: 'Tombol', td: 'Tabel', th: 'Tabel',
    label: 'Label', option: 'Pilihan', strong: 'Teks tebal', b: 'Teks tebal', em: 'Teks miring', small: 'Catatan kecil'
  };
  var KINDS = { header: 'Bagian atas', footer: 'Bagian bawah', other: 'Lainnya' };

  var M = window.PAS_MANIFEST || {};
  var app = document.getElementById('app');
  var lastLang = 'en';
  var activeEditor = null; // { isDirty, save } milik halaman editor yang sedang terbuka
  var statusTimer = null;

  /* ---------- util ---------- */
  function h(tag, attrs) {
    var el = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v == null || v === false) return;
      if (k === 'class') el.className = v;
      else if (k === 'text') el.textContent = v;
      else if (k.slice(0, 2) === 'on') el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? '' : v);
    });
    for (var i = 2; i < arguments.length; i++) add(el, arguments[i]);
    return el;
  }
  function add(el, c) {
    if (c == null || c === false) return;
    if (Array.isArray(c)) c.forEach(function (x) { add(el, x); });
    else el.appendChild(typeof c === 'object' ? c : document.createTextNode(c));
  }
  function clear(el) { while (el.firstChild) el.removeChild(el.firstChild); }
  function isEmpty(o) { return !(o.t && Object.keys(o.t).length) && !(o.im && Object.keys(o.im).length) && !o.title; }
  function countEdits(o) {
    if (!o) return 0;
    return (o.t ? Object.keys(o.t).length : 0) + (o.im ? Object.keys(o.im).length : 0) + (o.title ? 1 : 0);
  }
  function pageOf(slug) { return PAGES.filter(function (p) { return p.slug === slug; })[0]; }
  function toast(msg) {
    var t = h('div', { class: 'toast', role: 'status', text: msg });
    document.body.appendChild(t);
    setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 3200);
  }
  // Dipanggil sebelum pindah halaman: tawarkan menyimpan perubahan yang belum disimpan.
  function leaveGuard() {
    if (activeEditor && activeEditor.isDirty()) {
      if (confirm('Ada perubahan yang belum disimpan di halaman ini.\n\nOK = Simpan dulu\nBatal = Buang perubahan')) activeEditor.save();
    }
    activeEditor = null;
  }

  /* ---------- login ---------- */
  function loggedIn() { try { return sessionStorage.getItem(SESSION) === '1'; } catch (e) { return false; } }

  function renderLogin() {
    clear(app);
    var err = h('div', { class: 'err', role: 'alert', hidden: true });
    var user = h('input', { type: 'text', id: 'u', autocomplete: 'username', required: true });
    var pass = h('input', { type: 'password', id: 'p', autocomplete: 'current-password', required: true });
    var form = h('form', {
      onsubmit: function (ev) {
        ev.preventDefault();
        if (user.value.trim() === ADMIN_USER && pass.value === ADMIN_PASS) {
          try { sessionStorage.setItem(SESSION, '1'); } catch (e) { /* abaikan */ }
          route();
        } else {
          err.textContent = 'Nama pengguna atau kata sandi salah.';
          err.hidden = false;
          pass.value = '';
          pass.focus();
        }
      }
    },
      h('label', { for: 'u', text: 'Nama pengguna' }), user,
      h('label', { for: 'p', text: 'Kata sandi' }), pass,
      err,
      h('button', { type: 'submit', class: 'btn btn-gold full', text: 'Masuk' })
    );
    app.appendChild(h('div', { class: 'login-wrap' },
      h('div', { class: 'login-card' },
        h('img', { class: 'logo', src: '../assets/img/logo-pas.png', alt: 'PT Prima Armada Samudra' }),
        h('h1', { text: 'Login Admin' }),
        h('p', { class: 'sub', text: 'Masuk untuk mengubah isi halaman website.' }),
        form,
        h('a', { class: 'back', href: '../index.html', text: '← Kembali ke website' })
      )
    ));
    user.focus();
  }

  function logout() {
    leaveGuard();
    try { sessionStorage.removeItem(SESSION); } catch (e) { /* abaikan */ }
    location.hash = '';
    route();
  }

  /* ---------- kerangka (sidebar) ---------- */
  function shell(activeKey, mobileTitle, content) {
    var all = PASSite.load();
    var side = h('aside', { class: 'side', id: 'side' });
    var scrim = h('div', { class: 'scrim', onclick: closeMenu });
    function closeMenu() { side.classList.remove('open'); scrim.classList.remove('open'); }

    var items = [h('div', { class: 'grp-title', text: 'Menu' }),
      h('a', { class: 'item' + (activeKey === 'dashboard' ? ' on' : ''), href: '#dashboard' }, h('span', { text: 'Dashboard' }))];
    items.push(h('div', { class: 'grp-title', text: 'Edit halaman (' + lastLang.toUpperCase() + ')' }));
    PAGES.forEach(function (p) {
      var n = countEdits(all[lastLang + '/' + p.slug]);
      items.push(h('a', { class: 'item' + (activeKey === p.slug ? ' on' : ''), href: '#' + lastLang + '/' + p.slug },
        h('span', { text: p.name }),
        h('span', { class: 'badge', id: 'bd-' + p.slug, text: String(n), hidden: n === 0 })));
    });

    side.appendChild(h('div', { class: 'brand' },
      h('span', { class: 'pill' }, h('img', { src: '../assets/img/logo-pas.png', alt: 'PT Prima Armada Samudra' })),
      h('small', { text: 'Panel Admin' })));
    side.appendChild(h('nav', { 'aria-label': 'Menu admin' }, items));
    side.appendChild(h('div', { class: 'foot' },
      h('a', { href: '../' + (lastLang === 'id' ? 'id/' : '') + 'index.html', target: '_blank', rel: 'noopener', text: 'Lihat website ↗' }),
      h('button', { type: 'button', onclick: exportBackup, text: 'Ekspor JSON' }),
      h('button', { type: 'button', onclick: pickImport, text: 'Impor JSON' }),
      h('button', { type: 'button', onclick: logout, text: 'Keluar' })));
    side.addEventListener('click', function (ev) { if (ev.target.closest('a.item')) closeMenu(); });

    var mbar = h('div', { class: 'mbar' },
      h('button', { type: 'button', 'aria-label': 'Buka menu', onclick: function () { side.classList.add('open'); scrim.classList.add('open'); }, text: '☰' }),
      h('strong', { text: mobileTitle }));

    clear(app);
    app.appendChild(side);
    app.appendChild(scrim);
    app.appendChild(h('div', { class: 'main' }, mbar, h('div', { class: 'wrap' }, content)));
  }

  /* ---------- dashboard ---------- */
  function renderDashboard() {
    var all = PASSite.load();
    var total = 0;
    var rows = PAGES.map(function (p) {
      var ne = countEdits(all['en/' + p.slug]), ni = countEdits(all['id/' + p.slug]);
      total += ne + ni;
      function cnt(n) { return h('td', { class: 'n' + (n ? '' : ' zero'), text: n ? n + ' perubahan' : '—' }); }
      return h('tr', null,
        h('td', null, h('strong', { text: p.name }), h('div', { style: 'font-size:13px;color:#56697E', text: p.file })),
        cnt(ne), cnt(ni),
        h('td', null, h('div', { class: 'actions' },
          h('a', { class: 'btn btn-line btn-sm', href: '#en/' + p.slug, text: 'Edit EN' }),
          h('a', { class: 'btn btn-line btn-sm', href: '#id/' + p.slug, text: 'Edit ID' }))));
    });
    var used = (localStorage.getItem(PASSite.KEY) || '').length;
    var pct = Math.min(100, Math.round(used / QUOTA_CHARS * 100));

    shell('dashboard', 'Dashboard', [
      h('p', { class: 'eyebrow', text: 'Panel Admin' }),
      h('h1', { class: 'pt', text: 'Dashboard' }),
      h('p', { class: 'lead', text: 'Pilih halaman di menu kiri untuk mengubah teks dan gambarnya. Setiap halaman tersedia dalam bahasa Inggris (EN) dan Indonesia (ID).' }),
      h('div', { class: 'note' },
        h('strong', { text: 'Penting: ' }),
        'klik Simpan perubahan di setiap halaman untuk menyimpan. Perubahan hanya tersimpan di browser ini (localStorage), jadi pengunjung lain tidak melihatnya. Klik Ekspor JSON secara berkala; jika data browser terhapus, cukup Impor JSON untuk memulihkan semuanya.'),
      h('div', { class: 'stats' },
        h('div', { class: 'stat' }, h('b', { text: String(total) }), h('span', { text: 'Total perubahan tersimpan' })),
        h('div', { class: 'stat' }, h('b', { text: String(PAGES.length * 2) }), h('span', { text: 'Halaman bisa diedit (7 × EN/ID)' })),
        h('div', { class: 'stat' }, h('b', { text: Math.round(used / 1024) + ' KB' }), h('span', { text: 'Penyimpanan terpakai (±5 MB)' }),
          h('div', { class: 'meter' }, h('i', { style: 'width:' + pct + '%' })))),
      h('div', { class: 'card' }, h('h2', { text: 'Halaman' }),
        h('div', { style: 'overflow-x:auto' }, h('table', { class: 'tb' },
          h('thead', null, h('tr', null, h('th', { text: 'Halaman' }), h('th', { text: 'EN' }), h('th', { text: 'ID' }), h('th', { text: '' }))),
          h('tbody', null, rows)))),
      h('div', { class: 'card' }, h('h2', { text: 'Cadangan JSON & reset' }),
        h('div', { class: 'pad' },
          h('p', { style: 'margin:0 0 14px;color:#56697E', text: 'Ekspor JSON menyimpan semua perubahan (semua halaman, EN dan ID) ke satu file. Impor JSON memulihkannya dan menggantikan perubahan yang ada sekarang. Tombol yang sama ada di menu kiri bawah pada setiap halaman.' }),
          h('div', { class: 'actions' },
            h('button', { type: 'button', class: 'btn btn-gold', onclick: exportBackup, text: 'Ekspor JSON' }),
            h('button', { type: 'button', class: 'btn btn-line', onclick: pickImport, text: 'Impor JSON' }),
            h('button', { type: 'button', class: 'btn btn-danger', onclick: resetAll, text: 'Hapus semua perubahan' }))))
    ]);
  }

  function exportBackup() {
    if (activeEditor && activeEditor.isDirty()) {
      if (!activeEditor.save()) return; // gagal menyimpan: batalkan ekspor
    }
    var data = { app: 'pas-site-edits', version: 1, exported: new Date().toISOString(), data: PASSite.load() };
    var url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
    var a = h('a', { href: url, download: 'cadangan-website-pas-' + new Date().toISOString().slice(0, 10) + '.json' });
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    toast('File JSON diunduh. Simpan di tempat aman.');
  }

  function pickImport() {
    var inp = h('input', { type: 'file', accept: 'application/json,.json', onchange: importBackup });
    inp.click();
  }

  function importBackup(ev) {
    var f = ev.target.files[0];
    if (!f) return;
    var r = new FileReader();
    r.onload = function () {
      try {
        var j = JSON.parse(r.result);
        var data = j && j.app === 'pas-site-edits' ? j.data : j;
        if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('format');
        Object.keys(data).forEach(function (k) { if (!/^(en|id)\/[a-z]+$/.test(k)) throw new Error('format'); });
        if (!confirm('Impor akan menggantikan semua perubahan yang tersimpan sekarang (dan membuang yang belum disimpan). Lanjutkan?')) return;
        PASSite.save(data);
        activeEditor = null;
        toast('JSON berhasil diimpor. Semua perubahan dipulihkan.');
        route();
      } catch (e) {
        toast(e.name === 'QuotaExceededError' ? 'Gagal: file cadangan terlalu besar untuk penyimpanan browser.' : 'File cadangan tidak valid.');
      }
    };
    r.readAsText(f);
    ev.target.value = '';
  }

  function resetAll() {
    if (!confirm('Hapus SEMUA perubahan di semua halaman? Tindakan ini tidak bisa dibatalkan kecuali Anda sudah Ekspor JSON.')) return;
    activeEditor = null;
    try { localStorage.removeItem(PASSite.KEY); } catch (e) { /* abaikan */ }
    toast('Semua perubahan dihapus.');
    route();
  }

  /* ---------- editor halaman ---------- */
  function previewSrc(lang, src) {
    if (/^(data:|https?:|\/\/)/.test(src)) return src;
    return lang === 'en' ? '../' + src : src;
  }
  function baseName(s) { return s.split('/').pop(); }

  // Perkecil gambar sebelum disimpan agar muat di localStorage.
  function fileToDataURL(file) {
    return new Promise(function (resolve, reject) {
      var rd = new FileReader();
      rd.onerror = function () { reject(new Error('Gagal membaca file.')); };
      rd.onload = function () {
        if (file.type === 'image/svg+xml') {
          if (file.size > 300 * 1024) return reject(new Error('File SVG terlalu besar (maks. 300 KB).'));
          return resolve(rd.result);
        }
        var img = new Image();
        img.onerror = function () { reject(new Error('File bukan gambar yang valid.')); };
        img.onload = function () {
          var png = file.type === 'image/png';
          var max = png ? 800 : 1400;
          var sc = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
          var c = document.createElement('canvas');
          c.width = Math.max(1, Math.round(img.naturalWidth * sc));
          c.height = Math.max(1, Math.round(img.naturalHeight * sc));
          var ctx = c.getContext('2d');
          if (!png) { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height); }
          ctx.drawImage(img, 0, 0, c.width, c.height);
          resolve(png ? c.toDataURL('image/png') : c.toDataURL('image/jpeg', 0.82));
        };
        img.src = rd.result;
      };
      rd.readAsDataURL(file);
    });
  }

  function renderEditor(lang, slug) {
    var page = pageOf(slug), key = lang + '/' + slug, m = M[key];
    if (!page || !m) { location.hash = '#dashboard'; return; }
    lastLang = lang;

    var stored = PASSite.load()[key];
    var cur = stored ? JSON.parse(JSON.stringify(stored)) : {};
    var timer = null;
    var rows = [];          // { el, s, group }
    var groups = [];        // { el, rows[], chip, total }

    /* penyimpanan: perubahan ditampung dulu, disimpan saat tombol Simpan ditekan */
    var dirty = false;
    var statusEl = h('span', { class: 'status idle', 'aria-live': 'polite' });
    var saveBtn = h('button', { type: 'button', class: 'btn btn-gold', disabled: true, text: 'Simpan perubahan', onclick: function () { save(); } });
    function idleText() {
      var n = countEdits(cur);
      return n ? n + ' perubahan tersimpan di browser ini' : 'Belum ada perubahan';
    }
    function setStatus(msg, kind) {
      statusEl.textContent = msg;
      statusEl.className = 'status' + (kind ? ' ' + kind : '');
      clearTimeout(statusTimer);
      if (kind === 'ok') statusTimer = setTimeout(function () {
        if (!dirty) { statusEl.className = 'status idle'; statusEl.textContent = idleText(); }
      }, 2500);
    }
    function refreshCounts() {
      var n = countEdits(cur);
      var b = document.getElementById('bd-' + slug);
      if (b) { b.textContent = String(n); b.hidden = n === 0; }
      groups.forEach(function (g) {
        var c = g.rows.filter(function (r) { return r.el.classList.contains('changed'); }).length;
        g.chip.textContent = c ? c + ' diubah' : '';
        g.chip.hidden = !c;
      });
    }
    function save() {
      var all = PASSite.load();
      if (isEmpty(cur)) delete all[key]; else all[key] = cur;
      try { PASSite.save(all); }
      catch (e) {
        setStatus('Gagal menyimpan: penyimpanan browser penuh. Ganti gambar dengan ukuran lebih kecil atau hapus perubahan lain.', 'err');
        return false;
      }
      dirty = false; saveBtn.disabled = true;
      setStatus('Perubahan tersimpan ✓', 'ok');
      refreshCounts();
      return true;
    }
    function persist() {
      dirty = true; saveBtn.disabled = false;
      setStatus('Ada perubahan yang belum disimpan', 'warn');
    }
    activeEditor = { isDirty: function () { return dirty; }, save: save };
    function setT(i, orig, v) {
      v = v.replace(/\s*\n\s*/g, ' ').trim();
      if (v === orig) { if (cur.t) { delete cur.t[i]; if (!Object.keys(cur.t).length) delete cur.t; } }
      else (cur.t = cur.t || {})[i] = { o: orig, v: v };
      persist();
      return v !== orig;
    }

    /* baris: teks */
    function textRow(entry, g) {
      var i = entry[0], tag = entry[2], orig = entry[3];
      var sv = cur.t && cur.t[i];
      var val = sv ? sv.v : orig;
      var long = orig.length > 70 || val.length > 70;
      var inp = long
        ? h('textarea', { rows: Math.min(9, Math.ceil(Math.max(orig.length, val.length) / 85)), 'aria-label': TAGS[tag] || 'Teks' })
        : h('input', { type: 'text', 'aria-label': TAGS[tag] || 'Teks' });
      inp.value = val;
      var rv = h('button', { type: 'button', class: 'rv', text: 'Kembalikan', hidden: !sv });
      var el = h('div', { class: 'row' + (sv ? ' changed' : '') },
        h('div', { class: 'rl' }, h('span', { class: 'tag', text: TAGS[tag] || 'Teks' }), rv), inp);
      function sync(changed) { el.classList.toggle('changed', changed); rv.hidden = !changed; refreshCounts(); }
      inp.addEventListener('input', function () { sync(setT(i, orig, inp.value)); });
      if (long) inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') e.preventDefault(); });
      rv.addEventListener('click', function () { inp.value = orig; sync(setT(i, orig, orig)); inp.focus(); });
      rows.push({ el: el, s: (orig + ' ' + val).toLowerCase(), group: g });
      return el;
    }

    /* baris: gambar */
    function imageRow(entry, g) {
      var i = entry[0], orig = entry[2], alt = entry[3];
      var sv = cur.im && cur.im[i];
      var thumb = h('img', { alt: '', src: previewSrc(lang, sv ? sv.v : orig) });
      var fn = h('p', { class: 'fn' });
      var rv = h('button', { type: 'button', class: 'btn btn-line btn-sm', text: 'Kembalikan', hidden: !sv });
      var el = h('div', { class: 'row img' + (sv ? ' changed' : '') });
      var fileIn = h('input', { type: 'file', accept: 'image/*', hidden: true });
      function label() {
        var s = cur.im && cur.im[i];
        fn.textContent = s ? 'Gambar baru diunggah (±' + Math.round(s.v.length * 0.75 / 1024) + ' KB). Asli: ' + baseName(orig)
                           : baseName(orig) + (alt ? ' — ' + alt : '');
      }
      label();
      function sync() {
        var s = cur.im && cur.im[i];
        el.classList.toggle('changed', !!s);
        rv.hidden = !s;
        thumb.src = previewSrc(lang, s ? s.v : orig);
        label(); refreshCounts();
      }
      fileIn.addEventListener('change', function () {
        var f = fileIn.files[0]; fileIn.value = '';
        if (!f) return;
        setStatus('Memproses gambar…');
        fileToDataURL(f).then(function (url) {
          (cur.im = cur.im || {})[i] = { o: orig, v: url };
          sync(); persist();
        }).catch(function (e) { setStatus(e.message, 'err'); });
      });
      rv.addEventListener('click', function () {
        if (cur.im) { delete cur.im[i]; if (!Object.keys(cur.im).length) delete cur.im; }
        sync(); persist();
      });
      el.appendChild(h('div', { class: 'thumb' }, thumb));
      el.appendChild(h('div', { class: 'ii' },
        h('div', { class: 'rl' }, h('span', { class: 'tag', text: 'Gambar' })), fn,
        h('div', { class: 'btns' },
          h('button', { type: 'button', class: 'btn btn-line btn-sm', onclick: function () { fileIn.click(); }, text: 'Ganti gambar…' }),
          rv, fileIn)));
      rows.push({ el: el, s: (orig + ' ' + alt + ' gambar').toLowerCase(), group: g });
      return el;
    }

    /* baris: judul tab browser */
    function titleRow(g) {
      var orig = m.title, sv = cur.title, val = sv ? sv.v : orig;
      var inp = h('input', { type: 'text', 'aria-label': 'Judul tab browser' });
      inp.value = val;
      var rv = h('button', { type: 'button', class: 'rv', text: 'Kembalikan', hidden: !sv });
      var el = h('div', { class: 'row' + (sv ? ' changed' : '') },
        h('div', { class: 'rl' }, h('span', { class: 'tag', text: 'Judul tab browser' }), rv), inp);
      function set(v) {
        v = v.trim();
        if (v === orig) delete cur.title; else cur.title = { o: orig, v: v };
        el.classList.toggle('changed', v !== orig); rv.hidden = v === orig;
        persist(); refreshCounts();
      }
      inp.addEventListener('input', function () { set(inp.value); });
      rv.addEventListener('click', function () { inp.value = orig; set(orig); });
      rows.push({ el: el, s: (orig + ' judul tab browser title').toLowerCase(), group: g });
      return el;
    }

    /* grup */
    function groupEl(label, kind, openDefault, nodes) {
      var chip = h('span', { class: 'chip ch', hidden: true });
      var body = h('div', { class: 'gbody' }, nodes);
      var total = nodes.length;
      var det = h('details', { class: 'grp', open: openDefault },
        h('summary', null,
          h('span', { class: 't' }, label, kind && KINDS[kind] ? h('span', { class: 'kind', text: '  ·  ' + KINDS[kind] }) : null),
          chip, h('span', { class: 'chip', text: total + ' bidang' })),
        body);
      var g = { el: det, rows: [], chip: chip, defaultOpen: openDefault };
      nodes.forEach(function (n) { rows.forEach(function (r) { if (r.el === n) { r.group = g; g.rows.push(r); } }); });
      groups.push(g);
      return det;
    }

    var groupNodes = [];
    var pg = [titleRow(null)];
    groupNodes.push(groupEl('Pengaturan halaman', null, true, pg));
    m.groups.forEach(function (gr, gi) {
      var nodes = [];
      m.images.forEach(function (im) { if (im[1] === gi) nodes.push(imageRow(im, null)); });
      m.texts.forEach(function (t) { if (t[1] === gi) nodes.push(textRow(t, null)); });
      if (!nodes.length) return;
      var open = gr.kind === 'section' || gr.kind === 'other';
      groupNodes.push(groupEl(gr.label, open ? null : gr.kind, open, nodes));
    });

    var empty = h('div', { class: 'empty card', hidden: true, text: 'Tidak ada bidang yang cocok dengan pencarian.' });
    var search = h('input', { type: 'search', class: 'search', placeholder: 'Cari teks atau gambar di halaman ini…', 'aria-label': 'Cari' });
    search.addEventListener('input', function () {
      var q = search.value.trim().toLowerCase(), any = false;
      rows.forEach(function (r) { r.el.hidden = !!q && r.s.indexOf(q) === -1; });
      groups.forEach(function (g) {
        var vis = g.rows.some(function (r) { return !r.el.hidden; });
        g.el.hidden = !vis;
        if (vis) any = true;
        if (q) g.el.open = vis; else g.el.open = g.defaultOpen;
      });
      empty.hidden = any || !q;
    });

    var viewHref = '../' + (lang === 'id' ? 'id/' : '') + page.file;
    var head = h('div', { class: 'ehead' },
      h('div', { class: 'row1' },
        h('div', null,
          h('p', { class: 'eyebrow', style: 'margin-bottom:4px', text: 'Edit halaman' }),
          h('h1', { text: page.name }),
          h('p', { class: 'meta', text: LANGS[lang] + ' · ' + (lang === 'id' ? 'id/' : '') + page.file })),
        h('div', { class: 'tools' },
          h('span', { class: 'seg', role: 'group', 'aria-label': 'Bahasa' },
            h('a', { href: '#en/' + slug, class: lang === 'en' ? 'on' : '', text: 'EN' }),
            h('a', { href: '#id/' + slug, class: lang === 'id' ? 'on' : '', text: 'ID' })),
          h('a', { class: 'btn btn-line', href: viewHref, target: '_blank', rel: 'noopener', text: 'Lihat halaman ↗' }),
          h('button', {
            type: 'button', class: 'btn btn-danger', text: 'Reset halaman',
            onclick: function () {
              if (!countEdits(cur)) return toast('Halaman ini belum punya perubahan.');
              if (!confirm('Kembalikan halaman "' + page.name + '" (' + lang.toUpperCase() + ') ke isi aslinya?')) return;
              cur = {}; save(); dirty = false; route();
            }
          }),
          saveBtn)),
      h('div', { class: 'row2' }, search, statusEl));

    shell(slug, page.name, [head, empty, groupNodes]);
    refreshCounts();
    statusEl.textContent = idleText();
  }

  /* ---------- routing ---------- */
  function route() {
    leaveGuard();
    if (!loggedIn()) return renderLogin();
    var hash = location.hash.replace(/^#/, '');
    var mt = hash.match(/^(en|id)\/([a-z]+)$/);
    window.scrollTo(0, 0);
    if (mt && pageOf(mt[2])) renderEditor(mt[1], mt[2]);
    else renderDashboard();
  }

  window.addEventListener('hashchange', route);
  window.addEventListener('beforeunload', function (e) {
    if (activeEditor && activeEditor.isDirty()) { e.preventDefault(); e.returnValue = ''; }
  });
  window.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's' && activeEditor) {
      e.preventDefault();
      if (activeEditor.isDirty()) activeEditor.save();
    }
  });
  route();
})();
