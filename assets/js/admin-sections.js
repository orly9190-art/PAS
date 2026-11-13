/*
 * Panel admin: tab "Bagian baru" di Edit Halaman.
 * Tambah / hapus / urutkan bagian; di dalam bagian bisa menambah paragraf, foto, dan video
 * (link YouTube otomatis tampil, atau unggah file video kecil). Data: koleksi 'blok' di pas-data.js.
 */
(function () {
  'use strict';
  var A = window.PASAdmin, h = A.h, D = window.PASData, B = window.PASBlocks;
  var LANGL = [['semua', 'Semua bahasa'], ['id', 'Hanya Indonesia'], ['en', 'Hanya Inggris']];
  var NAME = { teks: 'Paragraf', gambar: 'Foto', video: 'Video' };
  var MAXVID = 2.5 * 1024 * 1024;

  var css = document.createElement('style');
  css.textContent =
    '.sc{background:#fff;border:1px solid var(--line);border-radius:12px;margin:0 0 16px;overflow:hidden;box-shadow:0 1px 2px rgba(10,34,64,.05)}.sc.off{opacity:.72}' +
    '.sc-hd{display:flex;align-items:center;gap:10px;padding:12px 16px;background:#F7FAFC;border-bottom:1px solid var(--line);flex-wrap:wrap}' +
    '.sc-hd .tg{border:0;background:none;font-size:18px;color:var(--gold);width:32px;height:32px}.sc-hd .tt{flex:1;min-width:180px}' +
    '.sc-hd .tt b{display:block;font-size:17px;color:var(--navy)}.sc-hd .tt small{color:var(--mut);font-size:13.5px}.sc-hd .ac{display:flex;gap:6px;flex-wrap:wrap}' +
    '.sc-bd{padding:18px 18px 20px}.sc-add{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin-top:14px;padding:14px;border:2px dashed #C9D6E3;border-radius:10px}' +
    '.sc-add>span{font-weight:600;color:var(--navy);margin-right:4px}.sc-new{display:flex;justify-content:center;margin-top:6px}' +
    '.sc-vp{aspect-ratio:16/9;max-width:480px;background:#0A2240;border-radius:8px;overflow:hidden;display:flex;align-items:center;justify-content:center;color:#cfe0f0;text-align:center;padding:14px;font-size:14px}' +
    '.sc-vp iframe,.sc-vp video{width:100%;height:100%;border:0;display:block;padding:0}' +
    '.sc-empty{text-align:center;padding:44px 20px;background:#fff;border:2px dashed #C9D6E3;border-radius:12px}.sc-empty h2{margin:0 0 6px;color:var(--navy)}.sc-empty p{margin:0 0 18px;color:var(--mut)}' +
    '.sc-hint{margin:8px 0 0;font-size:13.5px;color:var(--mut)}';
  document.head.appendChild(css);

  function norm(b) { b = JSON.parse(JSON.stringify(b)); b.elemen = JSON.parse(JSON.stringify(D.elemen(b))); if (b.tampil == null) b.tampil = true; if (!b.bahasa) b.bahasa = 'semua'; return b; }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function blank(t) {
    if (t === 'teks') return { tipe: 'teks', html: '' };
    if (t === 'gambar') return { tipe: 'gambar', src: '', f: '', alt: '', caption: '', ukuran: 'penuh', posisi: 'kiri', potong: false };
    return { tipe: 'video', sumber: 'youtube', url: '', src: '', caption: '', ukuran: 'penuh', posisi: 'tengah' };
  }
  function hasContent(it) {
    if (it.tipe === 'teks') return !!B.plain(it.html);
    if (it.tipe === 'gambar') return !!it.src;
    if (it.tipe === 'video') return it.sumber === 'file' ? !!it.src : !!D.ytId(it.url);
    return false;
  }

  /* ---------- isi video: link YouTube (otomatis tampil) atau file kecil ---------- */
  function videoBody(it, touch) {
    var box = h('div');
    function build() {
      box.textContent = '';
      var prev = h('div', { class: 'sc-vp' });
      function show() {
        prev.textContent = '';
        if (it.sumber === 'file') {
          if (it.src) { var v = h('video', { controls: true, preload: 'metadata' }); v.src = it.src; prev.appendChild(v); }
          else prev.textContent = 'Belum ada video. Klik “Pilih file video”.';
        } else {
          var id = D.ytId(it.url);
          if (id) prev.appendChild(h('iframe', { src: 'https://www.youtube-nocookie.com/embed/' + id, title: 'Pratinjau video', allowfullscreen: true, loading: 'lazy' }));
          else prev.textContent = it.url ? 'Link belum dikenali. Tempel link YouTube lengkap, misalnya https://www.youtube.com/watch?v=…' : 'Tempel link YouTube di kolom di atas. Videonya langsung tampil di sini.';
        }
      }
      var src = B.sel([['youtube', 'Link YouTube (disarankan)'], ['file', 'Unggah file video (kecil)']], it.sumber || 'youtube', function (v) { it.sumber = v; touch(); build(); });
      var second;
      if (it.sumber === 'file') {
        var f = h('input', { type: 'file', accept: 'video/mp4,video/webm,video/ogg', hidden: true });
        f.addEventListener('change', function () {
          var fl = f.files[0]; f.value = ''; if (!fl) return;
          if (fl.size > MAXVID) { A.toast('Video terlalu besar untuk penyimpanan browser (maks. 2,5 MB). Untuk video panjang, pakai link YouTube.'); return; }
          var r = new FileReader();
          r.onload = function () { it.src = r.result; touch(); show(); };
          r.onerror = function () { A.toast('Gagal membaca file video.'); };
          r.readAsDataURL(fl);
        });
        second = h('div', null, h('button', { type: 'button', class: 'btn btn-line', style: 'margin-top:22px', text: it.src ? 'Ganti file video…' : 'Pilih file video…', onclick: function () { f.click(); } }), f);
      } else {
        second = B.field('Link video YouTube', B.textInput(it.url, function (v) { it.url = v.trim(); touch(); show(); }, 'https://www.youtube.com/watch?v=…'));
      }
      box.appendChild(h('div', { class: 'bk-fields' }, B.field('Sumber video', src), second));
      box.appendChild(h('div', { style: 'margin:12px 0 0' }, prev));
      if (it.sumber === 'file') box.appendChild(h('p', { class: 'sc-hint', text: 'Batas 2,5 MB (MP4/WebM) karena disimpan di browser. Untuk video lebih panjang, unggah ke YouTube lalu tempel link-nya.' }));
      box.appendChild(h('div', { class: 'bk-fields', style: 'margin-top:12px' },
        B.field('Keterangan di bawah video', B.textInput(it.caption, function (v) { it.caption = v; touch(); }, 'Opsional'), 'wide'),
        B.field('Ukuran', B.sel([['penuh', 'Lebar penuh'], ['sedang', 'Sedang'], ['kecil', 'Kecil']], it.ukuran || 'penuh', function (v) { it.ukuran = v; touch(); })),
        B.field('Posisi', B.sel([['kiri', 'Kiri'], ['tengah', 'Tengah'], ['kanan', 'Kanan']], it.posisi || 'tengah', function (v) { it.posisi = v; touch(); }))));
      show();
    }
    build();
    return box;
  }

  /* ---------- halaman "Bagian baru" ---------- */
  function view(slug) {
    var page = A.pageOf(slug), list = D.list('blok').map(norm);
    var mine = list.filter(function (b) { return b.halaman === slug; }), others = list.filter(function (b) { return b.halaman !== slug; });
    var dirty = false, exp = {}, body = h('div'), statusEl = h('span', { class: 'status idle', 'aria-live': 'polite', style: 'flex:1' });
    mine.forEach(function (b) { exp[b.id] = mine.length <= 2; });
    var saveBtn = h('button', { type: 'button', class: 'btn btn-gold', disabled: true, text: 'Simpan perubahan', onclick: function () { save(); } });

    function status(m, k) { statusEl.textContent = m; statusEl.className = 'status' + (k ? ' ' + k : ''); }
    function idle() { status(mine.length ? mine.length + ' bagian baru di halaman ini' : 'Belum ada bagian baru', 'idle'); }
    function touch() { dirty = true; saveBtn.disabled = false; status('Ada perubahan yang belum disimpan', 'warn'); }
    function save() {
      var keep = [];
      mine.forEach(function (b) {
        b.judul = (b.judul || '').trim();
        b.elemen = b.elemen.map(function (it) { if (it.tipe === 'teks') it.html = D.clean(it.html); return it; }).filter(hasContent);
        delete b.isi; delete b.gambar; delete b.gambar_f;
        if (b.judul || b.elemen.length) keep.push(b);
      });
      try { D.setList('blok', others.concat(keep)); }
      catch (e) { status('Gagal menyimpan: penyimpanan browser penuh. Perkecil atau hapus foto/video lalu coba lagi.', 'err'); return false; }
      var gone = mine.length - keep.length; mine = keep; dirty = false; saveBtn.disabled = true;
      status('Tersimpan ✓' + (gone ? ' (' + gone + ' bagian kosong dibuang)' : ''), 'ok'); draw();
      return true;
    }
    A.setEditor({ isDirty: function () { return dirty; }, save: save });

    function swap(arr, i, d) { var j = i + d; if (j < 0 || j >= arr.length) return false; var t = arr[i]; arr[i] = arr[j]; arr[j] = t; return true; }
    function mv(label, d, arr, i) { return h('button', { type: 'button', class: 'btn btn-line btn-sm', title: label, 'aria-label': label, text: d < 0 ? '↑' : '↓', disabled: d < 0 ? i === 0 : i === arr.length - 1, onclick: function () { if (swap(arr, i, d)) { touch(); draw(); } } }); }
    function scrollTo(id, last) {
      var c = body.querySelector('[data-id="' + id + '"]'); if (!c) return;
      var t = last ? c.querySelector('.bk-el:last-child') || c : c; t.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (last) { var ed = t.querySelector('.bk-area'); if (ed) ed.focus(); }
    }
    function addSection() {
      var b = { id: uid(), halaman: slug, bahasa: 'semua', judul: '', tampil: true, dibuat: new Date().toISOString(), elemen: [blank('teks')] };
      mine.push(b); exp[b.id] = true; touch(); draw(); scrollTo(b.id);
    }
    function addEl(b, t) { b.elemen.push(blank(t)); exp[b.id] = true; touch(); draw(); scrollTo(b.id, true); }

    function elCard(b, it, j) {
      var del = h('button', { type: 'button', class: 'btn btn-danger btn-sm', text: 'Hapus', onclick: function () {
        if (hasContent(it) && !confirm('Hapus ' + NAME[it.tipe].toLowerCase() + ' ini?')) return;
        b.elemen.splice(j, 1); touch(); draw();
      } });
      var ctl = it.tipe === 'teks' ? B.rich(it.html, function (v) { it.html = v; touch(); }) : it.tipe === 'gambar' ? B.imageBody(it, touch) : videoBody(it, touch);
      return h('div', { class: 'bk-el' }, h('div', { class: 'eh' }, h('span', { class: 'tt', text: (j + 1) + '. ' + (NAME[it.tipe] || 'Isi') }), mv('Pindah ke atas', -1, b.elemen, j), mv('Pindah ke bawah', 1, b.elemen, j), del), h('div', { class: 'eb' }, ctl));
    }
    function secCard(b, i) {
      var open = !!exp[b.id];
      var cnt = ['teks', 'gambar', 'video'].map(function (t) { var n = b.elemen.filter(function (e) { return e.tipe === t; }).length; return n ? n + ' ' + NAME[t].toLowerCase() : ''; }).filter(Boolean).join(' · ');
      var card = h('div', { class: 'sc' + (b.tampil === false ? ' off' : ''), 'data-id': b.id });
      card.appendChild(h('div', { class: 'sc-hd' },
        h('button', { type: 'button', class: 'tg', 'aria-expanded': open ? 'true' : 'false', 'aria-label': open ? 'Ciutkan bagian' : 'Buka bagian', text: open ? '▾' : '▸', onclick: function () { exp[b.id] = !open; draw(); } }),
        h('div', { class: 'tt' }, h('b', { text: 'Bagian ' + (i + 1) + ': ' + (b.judul || '(belum diberi judul)') }), h('small', { text: (cnt || 'Belum ada isi') + ' · ' + (b.tampil === false ? 'Disembunyikan' : 'Tampil') })),
        h('div', { class: 'ac' }, mv('Naikkan bagian', -1, mine, i), mv('Turunkan bagian', 1, mine, i),
          h('button', { type: 'button', class: 'btn btn-danger btn-sm', text: 'Hapus bagian', onclick: function () {
            if (!confirm('Hapus bagian “' + (b.judul || 'tanpa judul') + '” beserta seluruh isinya?')) return;
            mine.splice(i, 1); touch(); draw();
          } }))));
      if (!open) return card;
      var els = h('div', { class: 'bk-els' });
      if (!b.elemen.length) els.appendChild(h('div', { class: 'empty', text: 'Bagian ini masih kosong. Tambahkan paragraf, foto, atau video di bawah.' }));
      b.elemen.forEach(function (it, j) { els.appendChild(elCard(b, it, j)); });
      function addBtn(t, label) { return h('button', { type: 'button', class: 'btn btn-line', text: label, onclick: function () { addEl(b, t); } }); }
      card.appendChild(h('div', { class: 'sc-bd' },
        h('div', { class: 'bk-meta' },
          B.field('Judul bagian (tampil sebagai judul besar)', B.textInput(b.judul, function (v) { b.judul = v; touch(); }, 'Contoh: Video profil perusahaan'), 'wide'),
          B.field('Tampil di bahasa', B.sel(LANGL, b.bahasa || 'semua', function (v) { b.bahasa = v; touch(); })),
          h('label', { class: 'bk-chk' }, h('input', { type: 'checkbox', checked: b.tampil !== false, onchange: function (e) { b.tampil = e.target.checked; touch(); } }), 'Tampilkan di website')),
        h('div', { class: 'bk-sec', text: 'Isi bagian' }), els,
        h('div', { class: 'sc-add' }, h('span', { text: 'Tambah isi:' }), addBtn('teks', '+ Paragraf'), addBtn('gambar', '+ Foto'), addBtn('video', '+ Video'))));
      return card;
    }
    function draw() {
      body.textContent = '';
      if (!mine.length) {
        body.appendChild(h('div', { class: 'sc-empty' }, h('h2', { text: 'Belum ada bagian baru di halaman ' + page.name }),
          h('p', { text: 'Satu bagian bisa berisi paragraf, foto, dan video. Klik tombol di bawah untuk memulai.' }),
          h('button', { type: 'button', class: 'btn btn-gold', text: '+ Tambah bagian pertama', onclick: addSection })));
        return;
      }
      mine.forEach(function (b, i) { body.appendChild(secCard(b, i)); });
      body.appendChild(h('div', { class: 'sc-new' }, h('button', { type: 'button', class: 'btn btn-gold', text: '+ Tambah bagian', onclick: addSection })));
    }

    A.shell(slug, page.name, h('div', null,
      h('div', { class: 'ehead' },
        h('div', { class: 'row1' },
          h('div', null, h('h1', { text: page.name }), h('p', { class: 'meta', text: 'Susun bagian baru: tiap bagian bisa berisi paragraf, foto, dan video. Tampil di bawah isi halaman, sebelum footer.' })),
          h('div', { class: 'tools' }, h('a', { class: 'btn btn-line', href: '../id/' + page.file, target: '_blank', rel: 'noopener', text: 'Lihat ID ↗' }), h('a', { class: 'btn btn-line', href: '../' + page.file, target: '_blank', rel: 'noopener', text: 'Lihat EN ↗' }))),
        window.PASAdminEdit.tabs(slug, 's'),
        h('div', { class: 'row2' }, statusEl, saveBtn)),
      body));
    idle(); draw();
  }

  window.PASSections = { view: view };
  window.dispatchEvent(new Event('hashchange'));
})();
