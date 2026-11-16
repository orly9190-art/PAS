/*
 * PT Prima Armada Samudra - EDITOR LANGSUNG DI HALAMAN
 *
 * Tombol "Edit" hanya muncul setelah login di admin/index.html (sesi tab yang sama).
 * Saat mode edit aktif:
 *   - teks         : klik lalu ketik langsung, Enter untuk selesai
 *   - foto         : "Ganti foto" mengambil berkas dari laptop
 *   - posisi foto  : "Posisi" untuk menggeser foto naik/turun/kiri/kanan
 *   - warna latar  : ikon palet di pojok tiap bagian, 32 warna dasar
 *
 * Semua perubahan memakai penyimpanan yang sama dengan panel admin
 * (localStorage, kunci PASSite.KEY) dan nomor urut yang sama dengan site-edit.js,
 * jadi keduanya saling melihat perubahan masing-masing.
 *
 * PENTING: perubahan hanya tersimpan di browser ini. Agar pengunjung ikut melihat,
 * klik "Unduh halaman", lalu unggah berkas itu ke GitHub menggantikan yang lama.
 */
(function (g, d) {
  'use strict';

  var S = g.PASSite;
  if (!S || !S.idx) return;

  var tag = d.querySelector('script[data-page]');
  var PAGE = tag && tag.getAttribute('data-page');
  if (!PAGE) return;

  function loggedIn() {
    try {
      if (g.sessionStorage.getItem('pas_admin_session') === '1') return true;
      return (+g.localStorage.getItem('pas_admin_login') || 0) > Date.now();
    } catch (e) { return false; }
  }

  var SAND = '#C9872F', DEEP = '#0A2240';

  var PALET = [
    ['#FFFFFF', 'Putih'], ['#F8FAFC', 'Putih salju'], ['#F3F7FA', 'Abu sangat muda'], ['#EEF2F6', 'Abu muda'],
    ['#E2E8F0', 'Abu'], ['#CBD5E1', 'Abu sedang'], ['#64748B', 'Abu tua'], ['#334155', 'Arang'],
    ['#EFF6FF', 'Biru es'], ['#DBEAFE', 'Biru muda'], ['#93C5FD', 'Biru langit'], ['#2E9BD6', 'Biru laut'],
    ['#13508C', 'Biru samudra'], ['#0A2240', 'Navy'], ['#1E3A8A', 'Biru tua'], ['#0F172A', 'Hitam biru'],
    ['#ECFDF5', 'Hijau es'], ['#CCFBF1', 'Tosca muda'], ['#5EEAD4', 'Tosca'], ['#0F766E', 'Tosca tua'],
    ['#DCFCE7', 'Hijau muda'], ['#86EFAC', 'Hijau daun'], ['#15803D', 'Hijau'], ['#14532D', 'Hijau hutan'],
    ['#FFFBEB', 'Krem'], ['#FEF3C7', 'Kuning muda'], ['#FCD34D', 'Kuning'], ['#C9872F', 'Pasir'],
    ['#FFF1F2', 'Merah muda'], ['#FECACA', 'Salem'], ['#DC2626', 'Merah'], ['#7F1D1D', 'Marun']
  ];

  /* ---------------------------------------------------------------- utilitas */
  function el(tagName, css, text) {
    var x = d.createElement(tagName);
    if (css) x.style.cssText = css;
    if (text != null) x.textContent = text;
    x.setAttribute('data-pas-editor', '');
    x.setAttribute('data-noedit', '');
    return x;
  }

  function entry(all) { return all[PAGE] || (all[PAGE] = {}); }
  // foto, posisi, dan warna: dipakai bersama halaman EN dan ID
  function entryV(all) { var k = S.vkey(PAGE); return all[k] || (all[k] = {}); }
  // foto bertanda data-ed-lang (mis. peta bergambar tulisan) disimpan per bahasa
  function entryFoto(all, img) { return img && img.hasAttribute('data-ed-lang') ? entry(all) : entryV(all); }

  function bersihkan(all) {
    [PAGE, S.vkey(PAGE)].forEach(function (k) {
      var e = all[k];
      if (!e) return;
      ['t', 'im', 'pos', 'sec', 'fg'].forEach(function (f) {
        if (e[f] && !Object.keys(e[f]).length) delete e[f];
      });
      if (!Object.keys(e).length) delete all[k];
    });
  }

  function simpan(all) {
    bersihkan(all);
    try { S.save(all); return true; }
    catch (err) {
      pesan('Ruang penyimpanan browser penuh (sekitar 5 MB). Unduh halaman ini, unggah ke GitHub, ' +
            'lalu klik "Kembalikan ke asli" untuk mengosongkan ruang.', true);
      return false;
    }
  }

  function luminans(warna) {
    var m = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(warna);
    var r, gg, b;
    if (m) { r = +m[1]; gg = +m[2]; b = +m[3]; }
    else {
      var h = (warna || '').replace('#', '');
      if (h.length !== 6) return 1;
      r = parseInt(h.substr(0, 2), 16); gg = parseInt(h.substr(2, 2), 16); b = parseInt(h.substr(4, 2), 16);
    }
    return (0.299 * r + 0.587 * gg + 0.114 * b) / 255;
  }

  function persen(str, sumbu) {
    var kata = { left: 0, top: 0, center: 50, right: 100, bottom: 100 };
    var bag = (str || '50% 50%').trim().split(/\s+/);
    var v = bag[sumbu] != null ? bag[sumbu] : '50%';
    if (kata[v] != null) return kata[v];
    var n = parseFloat(v);
    return isNaN(n) ? 50 : n;
  }

  /* ---------------------------------------------------------------- pesan singkat */
  var toast;
  function pesan(teks, penting) {
    if (!toast) {
      toast = el('div', 'position:fixed;left:50%;bottom:28px;transform:translateX(-50%);z-index:2147483000;' +
        'max-width:min(560px,92vw);padding:13px 18px;border-radius:4px;font:600 14.5px/1.5 Barlow,Arial,sans-serif;' +
        'box-shadow:0 8px 28px rgba(10,34,64,.35);transition:opacity .25s');
      d.body.appendChild(toast);
    }
    toast.textContent = teks;
    toast.style.background = penting ? '#7F1D1D' : DEEP;
    toast.style.color = '#fff';
    toast.style.opacity = '1';
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { toast.style.opacity = '0'; }, penting ? 7000 : 2600);
  }

  /* ---------------------------------------------------------------- gaya mode edit */
  var gaya = el('style');
  gaya.textContent =
    '.pas-ed-t{outline:1px dashed rgba(201,135,47,.6);outline-offset:2px;border-radius:2px;cursor:text;transition:outline-color .15s}' +
    '.pas-ed-t:hover{outline:1px solid ' + SAND + '}' +
    '.pas-ed-t:focus{outline:2px solid ' + SAND + ';outline-offset:3px}' +
    '[data-pas-editor] button{font:600 13px/1 Barlow,Arial,sans-serif;cursor:pointer}' +
    '.pas-chip{display:inline-flex;gap:6px;align-items:center}' +
    '.pas-chip button{background:#fff;color:' + DEEP + ';border:0;border-radius:3px;padding:8px 11px;min-height:34px;' +
    'box-shadow:0 2px 10px rgba(10,34,64,.3)}' +
    '.pas-chip button:hover{background:' + SAND + ';color:#fff}' +
    '.pas-sw{width:30px;height:30px;border-radius:4px;border:1px solid rgba(10,34,64,.2);padding:0}' +
    '.pas-sw:hover,.pas-sw:focus-visible{outline:2px solid ' + SAND + ';outline-offset:2px}';

  /* ---------------------------------------------------------------- tombol Edit utama */
  var aktif = false;
  var fab = el('button',
    'position:fixed;left:22px;bottom:22px;z-index:2147482000;min-height:50px;padding:0 20px;border:0;border-radius:25px;' +
    'background:' + DEEP + ';color:#fff;display:inline-flex;align-items:center;gap:9px;' +
    'font:700 15px Barlow,Arial,sans-serif;cursor:pointer;box-shadow:0 4px 16px rgba(10,34,64,.35)');
  fab.type = 'button';

  function labelFab() {
    fab.innerHTML = '';
    var ikon = d.createElementNS('http://www.w3.org/2000/svg', 'svg');
    ikon.setAttribute('width', '18'); ikon.setAttribute('height', '18'); ikon.setAttribute('viewBox', '0 0 24 24');
    ikon.setAttribute('fill', 'none'); ikon.setAttribute('stroke', 'currentColor'); ikon.setAttribute('stroke-width', '2.2');
    ikon.setAttribute('stroke-linecap', 'round'); ikon.setAttribute('stroke-linejoin', 'round'); ikon.setAttribute('aria-hidden', 'true');
    ikon.innerHTML = aktif ? '<path d="M5 12l5 5L20 7"/>' : '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>';
    fab.appendChild(ikon);
    fab.appendChild(d.createTextNode(aktif ? 'Selesai edit' : 'Edit halaman'));
    fab.style.background = aktif ? SAND : DEEP;
  }

  /* ---------------------------------------------------------------- bilah atas */
  var bilah = el('div',
    'position:fixed;top:0;left:0;right:0;z-index:2147481000;background:' + DEEP + ';color:#fff;' +
    'display:none;flex-wrap:wrap;align-items:center;gap:10px 18px;padding:10px 18px;' +
    'font:500 13.5px/1.45 Barlow,Arial,sans-serif;box-shadow:0 3px 14px rgba(0,0,0,.3)');
  var judul = el('strong', 'letter-spacing:1.5px;color:' + SAND + ';font-size:12.5px', 'MODE EDIT');
  var petunjuk = el('span', 'flex:1 1 360px;color:#C9D8E6',
    'Klik teks untuk mengubah. Arahkan ke foto untuk ganti atau atur posisi. ' +
    'Ikon palet di pojok bagian untuk warna latar dan tulisan, tombol ↑ ↓ untuk memindah bagian. Foto, warna, dan urutan bagian berlaku untuk EN dan ID. Tersimpan otomatis.');
  var tUnduh = el('button', 'background:' + SAND + ';color:#fff;border:0;border-radius:3px;padding:9px 14px;min-height:36px', 'Unduh halaman');
  var tAsli = el('button', 'background:transparent;color:#fff;border:1px solid rgba(255,255,255,.45);border-radius:3px;padding:8px 13px;min-height:36px', 'Kembalikan ke asli');
  [tUnduh, tAsli].forEach(function (b) { b.type = 'button'; });
  bilah.appendChild(judul); bilah.appendChild(petunjuk); bilah.appendChild(tUnduh); bilah.appendChild(tAsli);

  /* ---------------------------------------------------------------- lapisan tombol foto & palet */
  var lapisan = el('div', 'position:absolute;left:0;top:0;width:0;height:0;z-index:2147480000');
  var chipFoto = [], chipSek = [], chipGeser = [];

  /* ================================================================ TEKS */
  var bentang = [];

  function bungkusTeks() {
    S.idx.t.forEach(function (idx, node) {
      var p = node.parentNode;
      if (!p || !d.body.contains(node)) return;
      if (p.closest('svg,[data-noedit],textarea,select,option,script,style')) return;
      if (!node.nodeValue.trim()) return;
      var sp = d.createElement('span');
      sp.className = 'pas-ed-t';
      sp.contentEditable = 'true';
      sp.spellcheck = false;
      sp.setAttribute('data-ed-idx', idx);
      sp.setAttribute('data-ed-o', node.nodeValue.trim());
      p.insertBefore(sp, node);
      sp.appendChild(node);
      sp.addEventListener('keydown', function (ev) {
        if (ev.key === 'Enter') { ev.preventDefault(); sp.blur(); }
        if (ev.key === 'Escape') { ev.preventDefault(); sp.textContent = sp.getAttribute('data-ed-o'); sp.blur(); }
      });
      sp.addEventListener('paste', function (ev) {
        ev.preventDefault();
        var teks = (ev.clipboardData || g.clipboardData).getData('text/plain').replace(/\s+/g, ' ');
        d.execCommand('insertText', false, teks);
      });
      sp.addEventListener('focus', function () { sp.setAttribute('data-ed-before', sp.textContent); });
      sp.addEventListener('blur', function () { simpanTeks(sp); });
      bentang.push(sp);
    });
  }

  function simpanTeks(sp) {
    var idx = sp.getAttribute('data-ed-idx');
    var v = sp.textContent.replace(/\s+/g, ' ').trim();
    if (!v) {
      sp.textContent = sp.getAttribute('data-ed-before') || sp.getAttribute('data-ed-o');
      pesan('Teks tidak boleh dikosongkan. Kalau ingin menghapus bagian ini, beri tahu pengembang.', true);
      return;
    }
    if (v === (sp.getAttribute('data-ed-before') || '').replace(/\s+/g, ' ').trim()) return;
    var all = S.load(), e = entry(all);
    e.t = e.t || {};
    var lama = e.t[idx];
    var o = lama ? lama.o : sp.getAttribute('data-ed-o');
    if (v === o) delete e.t[idx]; else e.t[idx] = { o: o, v: v };
    if (simpan(all)) pesan('Teks tersimpan.');
    aturLetak();
  }

  function lepasTeks() {
    if (d.activeElement && d.activeElement.classList && d.activeElement.classList.contains('pas-ed-t')) d.activeElement.blur();
    bentang.forEach(function (sp) {
      if (!sp.parentNode) return;
      var idx = +sp.getAttribute('data-ed-idx');
      var lamaNode = sp.firstChild;
      var baru = d.createTextNode(sp.textContent);
      sp.parentNode.replaceChild(baru, sp);
      S.idx.t.forEach(function (i, n) { if (i === idx) S.idx.t.delete(n); });
      S.idx.t.set(baru, idx);
      if (lamaNode) S.idx.t.delete(lamaNode);
    });
    bentang = [];
  }

  /* ================================================================ FOTO */
  var pilihBerkas = el('input');
  pilihBerkas.type = 'file';
  pilihBerkas.accept = 'image/*';
  pilihBerkas.style.display = 'none';
  var fotoTarget = null;

  function berkasKeData(file, cb) {
    var url = URL.createObjectURL(file);
    var im = new Image();
    im.onload = function () {
      var maks = 1800, w = im.naturalWidth || 1600, h = im.naturalHeight || 1000;
      var r = Math.min(1, maks / Math.max(w, h));
      var c = d.createElement('canvas');
      c.width = Math.round(w * r); c.height = Math.round(h * r);
      var ctx = c.getContext('2d');
      var transparan = /png|svg|webp|gif/.test(file.type);
      if (!transparan) { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height); }
      ctx.drawImage(im, 0, 0, c.width, c.height);
      var hasil = transparan ? c.toDataURL('image/png') : c.toDataURL('image/jpeg', 0.82);
      if (transparan && hasil.length > 900000) hasil = c.toDataURL('image/jpeg', 0.85);
      URL.revokeObjectURL(url);
      cb(null, hasil);
    };
    im.onerror = function () { URL.revokeObjectURL(url); cb(new Error('gagal')); };
    im.src = url;
  }

  pilihBerkas.addEventListener('change', function () {
    var f = pilihBerkas.files && pilihBerkas.files[0];
    var target = fotoTarget;
    pilihBerkas.value = '';
    if (!f || !target) return;
    pesan('Memproses foto…');
    berkasKeData(f, function (err, data) {
      if (err) { pesan('Berkas itu tidak bisa dibaca sebagai gambar.', true); return; }
      var idx = S.idx.im.get(target);
      var all = S.load(), e = entryFoto(all, target);
      e.im = e.im || {};
      var lama = e.im[idx];
      var o = lama ? lama.o : S.norm(S.origSrc(target));
      if (!target.hasAttribute('data-orig-src')) target.setAttribute('data-orig-src', target.getAttribute('src') || '');
      var srcSebelum = target.getAttribute('src');
      e.im[idx] = { o: o, v: data };
      target.removeAttribute('srcset');
      target.setAttribute('src', data);
      if (simpan(all)) pesan('Foto diganti dan tersimpan.');
      else target.setAttribute('src', srcSebelum);
      setTimeout(aturLetak, 120);
    });
  });

  function fotoAsli(img) {
    var idx = S.idx.im.get(img);
    var all = S.load(), e = entryFoto(all, img);
    if (!(e.im && e.im[idx])) e = entryV(all);
    if (e.im && e.im[idx]) {
      img.setAttribute('src', img.getAttribute('data-orig-src') || ((PAGE.indexOf('id/') === 0 ? '../' : '') + e.im[idx].o));
      delete e.im[idx];
      if (simpan(all)) pesan('Foto dikembalikan ke aslinya.');
    }
  }

  function buatChipFoto() {
    S.idx.im.forEach(function (idx, img) {
      if (!d.body.contains(img) || img.closest('header,[data-noedit]')) return;
      if (menempel.some(function (m) { return m.contains(img); })) return;
      var chip = el('div', 'position:absolute;display:flex;gap:6px;flex-wrap:wrap;pointer-events:auto');
      chip.className = 'pas-chip';
      var bGanti = el('button', '', 'Ganti foto');
      var bPos = el('button', '', 'Posisi');
      var bAsli = el('button', '', 'Asli');
      [bGanti, bPos, bAsli].forEach(function (b) { b.type = 'button'; chip.appendChild(b); });
      bGanti.addEventListener('click', function () { fotoTarget = img; pilihBerkas.click(); });
      bPos.addEventListener('click', function () { bukaPosisi(img); });
      bAsli.addEventListener('click', function () { fotoAsli(img); });
      bAsli.title = 'Kembalikan foto asli';
      lapisan.appendChild(chip);
      chipFoto.push({ chip: chip, img: img, asli: bAsli, idx: idx });
    });
  }

  /* ---------------------------------------------------------------- panel posisi */
  var panelPos = el('div',
    'position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:2147483100;width:min(440px,94vw);' +
    'background:#fff;color:' + DEEP + ';border-radius:6px;padding:18px 20px;display:none;' +
    'box-shadow:0 12px 40px rgba(10,34,64,.38);font:500 14px/1.5 Barlow,Arial,sans-serif');
  var seret = el('div', 'position:absolute;cursor:grab;background:rgba(201,135,47,.12);outline:2px dashed ' + SAND +
    ';display:none;touch-action:none');
  var posImg = null, posAwal = '', posX = 50, posY = 50;

  function slider(label) {
    var w = el('label', 'display:block;margin:10px 0 2px;font-weight:600;font-size:13.5px', label);
    var r = el('input', 'width:100%;accent-color:' + SAND);
    r.type = 'range'; r.min = '0'; r.max = '100'; r.step = '1';
    w.appendChild(r);
    return { wrap: w, input: r };
  }
  var sY = slider('Atas \u2194 Bawah');
  var sX = slider('Kiri \u2194 Kanan');
  var preset = el('div', 'display:flex;gap:8px;margin-top:12px;flex-wrap:wrap');
  var tombolPanel = el('div', 'display:flex;gap:8px;margin-top:16px;justify-content:flex-end');
  var pSimpan = el('button', 'background:' + SAND + ';color:#fff;border:0;border-radius:3px;padding:10px 16px;min-height:40px', 'Simpan posisi');
  var pBatal = el('button', 'background:#fff;color:' + DEEP + ';border:1px solid #CBD5E1;border-radius:3px;padding:9px 14px;min-height:40px', 'Batal');
  var pReset = el('button', 'background:#fff;color:' + DEEP + ';border:1px solid #CBD5E1;border-radius:3px;padding:9px 14px;min-height:40px;margin-right:auto', 'Posisi asli');

  panelPos.appendChild(el('strong', 'display:block;font-size:16px', 'Atur posisi foto'));
  panelPos.appendChild(el('span', 'display:block;color:#56697E;font-size:13px;margin-top:2px',
    'Geser slider, pilih cepat di bawah, atau seret foto langsung.'));
  panelPos.appendChild(sY.wrap); panelPos.appendChild(sX.wrap);
  [['Atas', 15], ['Tengah', 50], ['Bawah', 85]].forEach(function (p) {
    var b = el('button', 'background:#F3F7FA;color:' + DEEP + ';border:1px solid #DEE6EE;border-radius:3px;padding:8px 14px;min-height:36px', p[0]);
    b.type = 'button';
    b.addEventListener('click', function () { setPos(posX, p[1]); });
    preset.appendChild(b);
  });
  panelPos.appendChild(preset);
  [pReset, pBatal, pSimpan].forEach(function (b) { b.type = 'button'; tombolPanel.appendChild(b); });
  panelPos.appendChild(tombolPanel);

  function setPos(x, y) {
    posX = Math.max(0, Math.min(100, Math.round(x)));
    posY = Math.max(0, Math.min(100, Math.round(y)));
    sX.input.value = posX; sY.input.value = posY;
    if (posImg) posImg.style.objectPosition = posX + '% ' + posY + '%';
  }
  sX.input.addEventListener('input', function () { setPos(+sX.input.value, posY); });
  sY.input.addEventListener('input', function () { setPos(posX, +sY.input.value); });

  function bukaPosisi(img) {
    tutupPalet();
    posImg = img;
    if (!img.hasAttribute('data-orig-pos')) img.setAttribute('data-orig-pos', img.style.objectPosition || '');
    posAwal = img.style.objectPosition || '';
    var cs = g.getComputedStyle(img).objectPosition;
    setPos(persen(cs, 0), persen(cs, 1));
    panelPos.style.display = 'block';
    var r = img.getBoundingClientRect();
    seret.style.left = (r.left + g.scrollX) + 'px';
    seret.style.top = (r.top + g.scrollY) + 'px';
    seret.style.width = r.width + 'px';
    seret.style.height = r.height + 'px';
    seret.style.display = 'block';
    if (g.getComputedStyle(img).objectFit !== 'cover') {
      pesan('Foto ini tampil utuh, jadi posisinya mungkin tidak berubah terlihat.');
    }
  }

  function tutupPosisi() {
    panelPos.style.display = 'none';
    seret.style.display = 'none';
    posImg = null;
  }

  pBatal.addEventListener('click', function () { if (posImg) posImg.style.objectPosition = posAwal; tutupPosisi(); });
  pReset.addEventListener('click', function () {
    if (!posImg) return;
    var idx = S.idx.im.get(posImg);
    var all = S.load(), e = entryFoto(all, posImg);
    if (e.pos) delete e.pos[idx];
    posImg.style.objectPosition = posImg.getAttribute('data-orig-pos') || '';
    if (simpan(all)) pesan('Posisi foto dikembalikan.');
    tutupPosisi();
  });
  pSimpan.addEventListener('click', function () {
    if (!posImg) return;
    var idx = S.idx.im.get(posImg);
    var all = S.load(), e = entryFoto(all, posImg);
    e.pos = e.pos || {};
    e.pos[idx] = posX + '% ' + posY + '%';
    if (simpan(all)) pesan('Posisi foto tersimpan.');
    tutupPosisi();
  });

  (function () {
    var tarik = false, sx = 0, sy = 0, ax = 50, ay = 50;
    seret.addEventListener('pointerdown', function (ev) {
      if (!posImg) return;
      tarik = true; sx = ev.clientX; sy = ev.clientY; ax = posX; ay = posY;
      seret.setPointerCapture(ev.pointerId);
      seret.style.cursor = 'grabbing';
    });
    seret.addEventListener('pointermove', function (ev) {
      if (!tarik || !posImg) return;
      var r = posImg.getBoundingClientRect();
      setPos(ax - (ev.clientX - sx) / r.width * 100, ay - (ev.clientY - sy) / r.height * 100);
    });
    function lepas() { tarik = false; seret.style.cursor = 'grab'; }
    seret.addEventListener('pointerup', lepas);
    seret.addEventListener('pointercancel', lepas);
  })();

  /* ================================================================ WARNA LATAR & TULISAN */
  var palet = el('div',
    'position:absolute;z-index:2147483050;background:#fff;border-radius:6px;padding:14px;display:none;width:300px;' +
    'box-shadow:0 12px 40px rgba(10,34,64,.38);font:500 13.5px/1.45 Barlow,Arial,sans-serif;color:' + DEEP);
  var paletJudul = el('strong', 'display:block;font-size:15px;margin-bottom:10px', 'Warna bagian ini');

  var tabWrap = el('div', 'display:flex;margin-bottom:12px;border:1px solid #CBD5E1;border-radius:4px;overflow:hidden');
  var tabLatar = el('button', 'flex:1;border:0;padding:9px 0;min-height:36px', 'Latar');
  var tabTulis = el('button', 'flex:1;border:0;border-left:1px solid #CBD5E1;padding:9px 0;min-height:36px', 'Tulisan');
  [tabLatar, tabTulis].forEach(function (b) { b.type = 'button'; tabWrap.appendChild(b); });

  var paletKisi = el('div', 'display:grid;grid-template-columns:repeat(8,30px);gap:6px');
  var paletPeringatan = el('div', 'margin:12px 0 0;padding:10px 12px;background:#FFF8EE;border-left:3px solid ' + SAND +
    ';color:#7A4A06;font-size:12.5px;display:none');
  var tPeringatan = el('span', 'display:block;margin-bottom:8px', 'Tulisan di bagian ini sulit dibaca di atas warna latar ini.');
  var bSesuaikan = el('button', 'background:' + SAND + ';color:#fff;border:0;border-radius:3px;padding:7px 11px;min-height:32px', 'Sesuaikan tulisan otomatis');
  bSesuaikan.type = 'button';
  paletPeringatan.appendChild(tPeringatan); paletPeringatan.appendChild(bSesuaikan);

  var paletBawah = el('div', 'display:flex;gap:8px;margin-top:12px;flex-wrap:wrap');
  var bOtomatis = el('button', 'background:#F3F7FA;color:' + DEEP + ';border:1px solid #DEE6EE;border-radius:3px;padding:8px 12px;min-height:36px', 'Otomatis');
  var bAsli = el('button', 'background:#fff;color:' + DEEP + ';border:1px solid #CBD5E1;border-radius:3px;padding:8px 12px;min-height:36px', 'Warna asli');
  var bTutup = el('button', 'background:' + DEEP + ';color:#fff;border:0;border-radius:3px;padding:9px 14px;min-height:36px;margin-left:auto', 'Tutup');
  bOtomatis.title = 'Pilih putih atau navy, mana yang paling terbaca di atas latar bagian ini';
  [bOtomatis, bAsli, bTutup].forEach(function (b) { b.type = 'button'; paletBawah.appendChild(b); });

  palet.appendChild(paletJudul); palet.appendChild(tabWrap); palet.appendChild(paletKisi);
  palet.appendChild(paletPeringatan); palet.appendChild(paletBawah);

  var sekTarget = null;
  var mode = 'latar';

  function setMode(m) {
    mode = m;
    var on = 'background:' + DEEP + ';color:#fff', off = 'background:#fff;color:' + DEEP;
    tabLatar.style.cssText += ';' + (m === 'latar' ? on : off);
    tabTulis.style.cssText += ';' + (m === 'tulisan' ? on : off);
    bOtomatis.style.display = m === 'tulisan' ? '' : 'none';
    paletJudul.textContent = m === 'latar' ? 'Warna latar bagian ini' : 'Warna tulisan bagian ini';
    cekKontras();
  }
  tabLatar.addEventListener('click', function () { setMode('latar'); });
  tabTulis.addEventListener('click', function () { setMode('tulisan'); });

  PALET.forEach(function (w) {
    var sw = el('button', 'background:' + w[0]);
    sw.type = 'button';
    sw.className = 'pas-sw';
    sw.title = w[1] + ' ' + w[0];
    sw.setAttribute('aria-label', w[1]);
    sw.addEventListener('click', function () {
      if (mode === 'latar') pasangLatar(w[0]); else pasangTulisan(w[0]);
    });
    paletKisi.appendChild(sw);
  });

  function warnaLatar(sek) {
    var bg = g.getComputedStyle(sek).backgroundColor;
    if (!bg || /rgba\(\s*0,\s*0,\s*0,\s*0\s*\)/.test(bg) || bg === 'transparent') return '#FFFFFF';
    return bg;
  }

  function warnaTulisanUtama(sek) {
    var h = sek.querySelector('h1,h2,h3,p');
    return h ? g.getComputedStyle(h).color : DEEP;
  }

  function cekKontras() {
    if (!sekTarget) { paletPeringatan.style.display = 'none'; return; }
    var beda = Math.abs(luminans(warnaLatar(sekTarget)) - luminans(warnaTulisanUtama(sekTarget)));
    paletPeringatan.style.display = beda < 0.38 ? 'block' : 'none';
  }

  function simpanSek(kunci, nilai) {
    var idx = S.idx.sec.get(sekTarget);
    var all = S.load(), e = entryV(all);
    e[kunci] = e[kunci] || {};
    if (nilai == null) delete e[kunci][idx]; else e[kunci][idx] = nilai;
    return simpan(all);
  }

  function pasangLatar(warna) {
    if (!sekTarget) return;
    if (!sekTarget.hasAttribute('data-orig-bg')) sekTarget.setAttribute('data-orig-bg', sekTarget.style.background || '');
    sekTarget.style.background = warna;
    if (simpanSek('sec', warna)) pesan('Warna latar tersimpan.');
    cekKontras();
  }

  function pasangTulisan(warna) {
    if (!sekTarget) return;
    S.applyFg(sekTarget, warna);
    if (simpanSek('fg', warna)) pesan('Warna tulisan tersimpan.');
    cekKontras();
  }

  function tulisanOtomatis() {
    if (!sekTarget) return;
    pasangTulisan(luminans(warnaLatar(sekTarget)) < 0.55 ? '#FFFFFF' : DEEP);
  }
  bOtomatis.addEventListener('click', tulisanOtomatis);
  bSesuaikan.addEventListener('click', function () { setMode('tulisan'); tulisanOtomatis(); });

  bAsli.addEventListener('click', function () {
    if (!sekTarget) return;
    if (mode === 'latar') {
      sekTarget.style.background = sekTarget.getAttribute('data-orig-bg') || '';
      if (simpanSek('sec', null)) pesan('Warna latar dikembalikan.');
    } else {
      S.clearFg(sekTarget);
      if (simpanSek('fg', null)) pesan('Warna tulisan dikembalikan.');
    }
    cekKontras();
  });
  bTutup.addEventListener('click', tutupPalet);

  function bukaPalet(sek, x, y) {
    tutupPosisi();
    sekTarget = sek;
    palet.style.left = Math.max(8, Math.min(x, g.scrollX + d.documentElement.clientWidth - 316)) + 'px';
    palet.style.top = y + 'px';
    palet.style.display = 'block';
    setMode('latar');
  }
  function tutupPalet() { palet.style.display = 'none'; sekTarget = null; }

  function punyaFotoLatar(sek) {
    var im = sek.querySelector(':scope > img');
    return im && g.getComputedStyle(im).position === 'absolute';
  }

  function buatChipSek() {
    S.idx.sec.forEach(function (idx, sek) {
      if (!d.body.contains(sek) || punyaFotoLatar(sek)) return;
      var b = el('button',
        'position:absolute;width:34px;height:34px;border:0;border-radius:50%;background:#fff;' +
        'box-shadow:0 2px 10px rgba(10,34,64,.32);display:flex;align-items:center;justify-content:center;pointer-events:auto');
      b.type = 'button';
      b.title = 'Ganti warna latar atau tulisan bagian ini';
      b.setAttribute('aria-label', 'Ganti warna latar atau tulisan bagian ini');
      b.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="' + SAND + '" stroke-width="2" ' +
        'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3a9 9 0 1 0 0 18c1 0 1.6-.8 1.6-1.7 ' +
        '0-.5-.2-.9-.5-1.2-.3-.3-.5-.7-.5-1.2 0-.9.8-1.7 1.7-1.7H16a5 5 0 0 0 5-5c0-4-4-7.2-9-7.2z"/>' +
        '<circle cx="7.5" cy="10.5" r="1.3"/><circle cx="12" cy="7.5" r="1.3"/><circle cx="16.5" cy="10.5" r="1.3"/></svg>';
      b.addEventListener('click', function () {
        var r = b.getBoundingClientRect();
        bukaPalet(sek, r.left + g.scrollX, r.bottom + g.scrollY + 8);
      });
      lapisan.appendChild(b);
      chipSek.push({ chip: b, sek: sek });
    });
  }

  /* ---------------------------------------------------------------- pindah bagian naik/turun */
  function urutanKini() {
    var L = S.idx.geser || [], v = S.load()[S.vkey(PAGE)] || {};
    var o = v.ord;
    if (!Array.isArray(o) || o.length !== L.length) o = L.map(function (x, i) { return i; });
    return o.slice();
  }
  function geser(asal, arah) {
    var o = urutanKini(), p = o.indexOf(asal), q = p + arah;
    if (p < 0 || q < 0 || q >= o.length) { pesan(arah < 0 ? 'Bagian ini sudah paling atas.' : 'Bagian ini sudah paling bawah.'); return; }
    var tmp = o[p]; o[p] = o[q]; o[q] = tmp;
    var all = S.load(), e = entryV(all);
    var identitas = o.every(function (x, i) { return x === i; });
    if (identitas) delete e.ord; else e.ord = o;
    S.reorder(o);
    if (simpan(all)) pesan(arah < 0 ? 'Bagian dipindah ke atas.' : 'Bagian dipindah ke bawah.');
    var sek = (S.idx.geser || [])[asal];
    setTimeout(function () {
      aturLetak();
      if (sek) g.scrollTo({ top: sek.getBoundingClientRect().top + g.scrollY - 120, behavior: 'smooth' });
    }, 30);
  }
  function buatChipGeser() {
    (S.idx.geser || []).forEach(function (sek, asal) {
      var w = el('div', 'position:absolute;display:flex;gap:4px;pointer-events:auto;background:#fff;border-radius:18px;padding:3px;box-shadow:0 2px 10px rgba(10,34,64,.32)');
      [['\u2191', -1, 'Pindahkan bagian ini ke atas'], ['\u2193', 1, 'Pindahkan bagian ini ke bawah']].forEach(function (x) {
        var b = el('button', 'width:30px;height:28px;border:0;border-radius:14px;background:' + DEEP + ';color:#fff;font:700 15px/1 Arial,sans-serif;cursor:pointer', x[0]);
        b.type = 'button'; b.title = x[2]; b.setAttribute('aria-label', x[2]);
        b.addEventListener('click', function () { geser(asal, x[1]); });
        w.appendChild(b);
      });
      lapisan.appendChild(w);
      chipGeser.push({ chip: w, sek: sek });
    });
  }

  /* ================================================================ TATA LETAK LAPISAN */
  function aturLetak() {
    if (!aktif) return;
    var all = S.load(), e = all[S.vkey(PAGE)] || {}, eo = all[PAGE] || {};
    chipFoto.forEach(function (c) {
      var r = c.img.getBoundingClientRect();
      var tampak = r.width > 40 && r.height > 30;
      c.chip.style.display = tampak ? 'flex' : 'none';
      c.chip.style.left = (r.left + g.scrollX + 10) + 'px';
      c.chip.style.top = (r.top + g.scrollY + 10) + 'px';
      c.asli.style.display = ((e.im && e.im[c.idx]) || (eo.im && eo.im[c.idx])) ? '' : 'none';
    });
    chipSek.forEach(function (c) {
      var r = c.sek.getBoundingClientRect();
      c.chip.style.display = r.height > 30 ? 'flex' : 'none';
      c.chip.style.left = (r.right + g.scrollX - 46) + 'px';
      c.chip.style.top = (r.top + g.scrollY + 10) + 'px';
    });
    chipGeser.forEach(function (c) {
      var r = c.sek.getBoundingClientRect();
      c.chip.style.display = r.height > 30 ? 'flex' : 'none';
      c.chip.style.left = (r.right + g.scrollX - 128) + 'px';
      c.chip.style.top = (r.top + g.scrollY + 12) + 'px';
    });
  }

  /* ================================================================ CEGAH TAUTAN SAAT EDIT */
  function tahanKlik(ev) {
    if (!aktif) return;
    if (ev.target.closest('[data-pas-editor]')) return;
    if (ev.target.closest('a,button,input[type=submit]')) {
      ev.preventDefault();
      ev.stopPropagation();
    }
  }

  /* ================================================================ UNDUH HALAMAN */
  function unduh() {
    if (d.activeElement && d.activeElement.classList && d.activeElement.classList.contains('pas-ed-t')) d.activeElement.blur();
    var salin = d.documentElement.cloneNode(true);
    Array.prototype.forEach.call(salin.querySelectorAll('[data-pas-editor],[data-runtime]'), function (x) { x.remove(); });
    Array.prototype.forEach.call(salin.querySelectorAll('span.pas-ed-t'), function (sp) {
      sp.parentNode.replaceChild(d.createTextNode(sp.textContent), sp);
    });
    Array.prototype.forEach.call(salin.querySelectorAll('[data-orig-pos]'), function (x) { x.removeAttribute('data-orig-pos'); });
    Array.prototype.forEach.call(salin.querySelectorAll('[data-orig-bg]'), function (x) { x.removeAttribute('data-orig-bg'); });
    Array.prototype.forEach.call(salin.querySelectorAll('[data-orig-fg]'), function (x) { x.removeAttribute('data-orig-fg'); });
    Array.prototype.forEach.call(salin.querySelectorAll('[data-ed-top]'), function (x) {
      x.style.top = x.getAttribute('data-ed-top') || ''; x.removeAttribute('data-ed-top');
    });
    var bd = salin.querySelector('body');
    if (bd) { bd.style.paddingTop = ''; if (!bd.getAttribute('style')) bd.removeAttribute('style'); }
    var B = g.parent !== g && g.parent.__PASBUNDLE;
    if (B) B.restore(salin, PAGE);
    var html = '<!doctype html>\n' + salin.outerHTML;

    var nama = PAGE.split('/').pop() + '.html';
    var folder = PAGE.indexOf('id/') === 0 ? 'id/' : '';
    var lanjut = 'Unggah ke GitHub di folder ' + (folder || 'utama (root)') +
                 ', menggantikan berkas lama. Setelah itu pengunjung ikut melihat perubahannya.';
    if (B) {
      B.save(nama, html).then(function (ok) {
        if (ok) pesan('Berkas ' + nama + ' disimpan. ' + lanjut);
      }, function (err) {
        pesan(err && err.code === 'declined' ? 'Penyimpanan dibatalkan.' : 'Unduhan tidak tersedia di tampilan ini.', true);
      });
      return;
    }
    var blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    var a = d.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = nama;
    d.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
    pesan('Berkas ' + nama + ' diunduh. ' + lanjut);
  }

  function kembalikanAsli() {
    if (!g.confirm('Semua perubahan di halaman ini akan dihapus dari browser ini: teks halaman ini, serta foto, posisi, dan warna yang dipakai bersama versi EN dan ID. Lanjutkan?')) return;
    var all = S.load();
    delete all[PAGE];
    delete all[S.vkey(PAGE)];
    try { S.save(all); } catch (err) { /* abaikan */ }
    location.reload();
  }

  tUnduh.addEventListener('click', unduh);
  tAsli.addEventListener('click', kembalikanAsli);

  /* ================================================================ HIDUP / MATI */
  var jam = null;

  function elemenMenempel() {
    return Array.prototype.filter.call(d.body.children, function (x) {
      return !x.hasAttribute('data-pas-editor') && g.getComputedStyle(x).position === 'sticky';
    });
  }
  var menempel = [];

  function nyalakan() {
    aktif = true;
    d.head.appendChild(gaya);
    d.body.appendChild(lapisan);
    d.body.appendChild(bilah);
    d.body.appendChild(palet);
    d.body.appendChild(panelPos);
    d.body.appendChild(seret);
    d.body.appendChild(pilihBerkas);
    bilah.style.display = 'flex';
    d.body.style.paddingTop = bilah.offsetHeight + 'px';
    menempel = elemenMenempel();
    menempel.forEach(function (m) {
      m.setAttribute('data-ed-top', m.style.top || '');
      m.style.top = bilah.offsetHeight + 'px';
    });
    bungkusTeks();
    buatChipFoto();
    buatChipSek();
    buatChipGeser();
    aturLetak();
    jam = setInterval(aturLetak, 900);
    g.addEventListener('resize', aturLetak);
    d.addEventListener('click', tahanKlik, true);
    labelFab();
    pesan('Mode edit aktif.');
  }

  function matikan() {
    aktif = false;
    lepasTeks();
    tutupPalet(); tutupPosisi();
    clearInterval(jam);
    g.removeEventListener('resize', aturLetak);
    d.removeEventListener('click', tahanKlik, true);
    chipFoto.forEach(function (c) { c.chip.remove(); }); chipFoto = [];
    chipSek.forEach(function (c) { c.chip.remove(); }); chipSek = [];
    chipGeser.forEach(function (c) { c.chip.remove(); }); chipGeser = [];
    [lapisan, bilah, palet, panelPos, seret, gaya].forEach(function (x) { if (x.parentNode) x.parentNode.removeChild(x); });
    d.body.style.paddingTop = '';
    menempel.forEach(function (m) { m.style.top = m.getAttribute('data-ed-top') || ''; m.removeAttribute('data-ed-top'); });
    menempel = [];
    labelFab();
    pesan('Mode edit ditutup. Perubahan tetap tersimpan di browser ini.');
  }

  fab.addEventListener('click', function () { if (aktif) matikan(); else nyalakan(); });

  function mulai() {
    if (!loggedIn()) return;
    labelFab();
    d.body.appendChild(fab);
  }
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', mulai); else mulai();
})(window, document);
