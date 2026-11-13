/*
 * Panel admin: "Konten Halaman".
 * Tambah konten untuk halaman mana pun; di dalam tiap konten bisa menambah paragraf (editor teks kaya)
 * dan gambar, serta mengubah urutannya. Bergantung pada admin.js (PASAdmin), admin-editor.js
 * (PASAdminEdit.focal) dan pas-data.js (PASData: penyaring HTML + penyimpanan).
 */
(function () {
  'use strict';
  var A = window.PASAdmin, h = A.h, D = window.PASData, E = window.PASAdminEdit;
  var PAGES = A.PAGES;
  var LANGL = { semua: 'Semua bahasa', id: 'Indonesia (ID)', en: 'Inggris (EN)' };
  var BUILTIN = [['assets/img/kapal-tunda.jpg', 'Kapal tunda'], ['assets/img/kapal-tunda-tongkang.jpg', 'Kapal tunda & tongkang'],
    ['assets/img/tarikan-sungai.jpg', 'Tarikan sungai'], ['assets/img/armada-dermaga.jpg', 'Armada di dermaga'],
    ['assets/img/anjungan.jpg', 'Anjungan'], ['assets/img/dek-keselamatan.jpg', 'Dek keselamatan'], ['assets/img/kru-kapal.jpg', 'Kru kapal']];
  var filter = 'semua';

  var ICON = {
    left: '<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M2 3h12M2 6.5h8M2 10h12M2 13.5h8" stroke="currentColor" stroke-width="1.6" fill="none"/></svg>',
    center: '<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M2 3h12M4 6.5h8M2 10h12M4 13.5h8" stroke="currentColor" stroke-width="1.6" fill="none"/></svg>',
    right: '<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M2 3h12M6 6.5h8M2 10h12M6 13.5h8" stroke="currentColor" stroke-width="1.6" fill="none"/></svg>',
    full: '<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M2 3h12M2 6.5h12M2 10h12M2 13.5h12" stroke="currentColor" stroke-width="1.6" fill="none"/></svg>',
    ul: '<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><circle cx="2.5" cy="4" r="1.3" fill="currentColor"/><circle cx="2.5" cy="8" r="1.3" fill="currentColor"/><circle cx="2.5" cy="12" r="1.3" fill="currentColor"/><path d="M6 4h8M6 8h8M6 12h8" stroke="currentColor" stroke-width="1.6" fill="none"/></svg>',
    ol: '<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><text x="0" y="6" font-size="6" fill="currentColor" font-family="sans-serif">1</text><text x="0" y="10.5" font-size="6" fill="currentColor" font-family="sans-serif">2</text><text x="0" y="15" font-size="6" fill="currentColor" font-family="sans-serif">3</text><path d="M6 4h8M6 8h8M6 12h8" stroke="currentColor" stroke-width="1.6" fill="none"/></svg>',
    link: '<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M6.5 9.5l3-3M7 4.5l1-1a3 3 0 014.2 4.2l-1 1M9 11.5l-1 1A3 3 0 013.8 8.3l1-1" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>',
    unlink: '<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M7 4.5l1-1a3 3 0 014.2 4.2l-1 1M9 11.5l-1 1A3 3 0 013.8 8.3l1-1M2 2l12 12" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>',
    hr: '<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M1 8h14" stroke="currentColor" stroke-width="1.8"/></svg>',
    clear: '<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 3h9M7.5 3L6 13M4 13h5M10 9l4 4M14 9l-4 4" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/></svg>',
    undo: '<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 6h6a3.5 3.5 0 010 7H6M4 6l2.5-2.5M4 6l2.5 2.5" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>',
    redo: '<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M12 6H6a3.5 3.5 0 000 7h4M12 6L9.5 3.5M12 6L9.5 8.5" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>'
  };

  var css = document.createElement('style');
  css.textContent = D.richCss +
    '.bk-tabs{display:flex;flex-wrap:wrap;gap:6px;margin:14px 0 0}.bk-tabs button{min-height:36px;padding:0 14px;border:1px solid #BCCBDA;background:#fff;border-radius:18px;font-weight:600;font-size:14px;color:var(--navy)}.bk-tabs button.on{background:var(--navy);border-color:var(--navy);color:#fff}.bk-tabs b{margin-left:6px;opacity:.7;font-weight:700}' +
    '.bk-list{display:grid;gap:12px;margin-top:16px}.bk-item{display:flex;gap:14px;align-items:flex-start;background:#fff;border:1px solid var(--line);border-radius:3px;padding:14px 16px}.bk-item.off{opacity:.62}' +
    '.bk-item .th{flex:none;width:84px;height:60px;border-radius:2px;background:var(--bg);overflow:hidden;display:flex;align-items:center;justify-content:center;color:var(--mut);font-size:12px}.bk-item .th img{width:100%;height:100%;object-fit:cover;display:block}' +
    '.bk-item .in{flex:1;min-width:0}.bk-item h3{margin:0 0 2px;font-size:17px;color:var(--navy)}.bk-item .mt{font-size:13.5px;color:var(--mut);display:flex;flex-wrap:wrap;gap:4px 12px;align-items:center}.bk-item .sn{margin:6px 0 0;font-size:14px;color:#3C4F63;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
    '.bk-item .ac{display:flex;flex-wrap:wrap;gap:6px;justify-content:flex-end}.bk-pill{padding:2px 9px;border-radius:10px;background:var(--bg);font-weight:700;font-size:12px;color:var(--mut)}.bk-pill.ok{background:#DDF1E6;color:var(--ok)}' +
    '.bk-ov{position:fixed;inset:0;background:rgba(10,34,64,.6);z-index:90;display:flex;align-items:center;justify-content:center;padding:12px}.bk-box{background:#fff;border-radius:4px;width:100%;max-width:900px;max-height:96vh;display:flex;flex-direction:column;overflow:hidden}' +
    '.bk-hd{padding:16px 22px;border-bottom:1px solid var(--line)}.bk-hd h2{margin:0;font-size:20px;color:var(--navy)}.bk-bd{padding:18px 22px;overflow:auto;flex:1}.bk-ft{padding:12px 22px;border-top:1px solid var(--line);display:flex;gap:8px;justify-content:flex-end;background:#FAFCFD}' +
    '.bk-meta{display:grid;grid-template-columns:1fr 1fr;gap:12px 14px}.bk-meta .wide{grid-column:1/-1}.bk-f{display:block}.bk-f>span{display:block;font-weight:600;font-size:13.5px;color:var(--navy);margin:0 0 4px}.bk-f input[type=text],.bk-f select{width:100%;min-height:40px;padding:0 10px;border:1px solid #BCCBDA;border-radius:2px;background:#fff}' +
    '.bk-chk{display:flex;align-items:center;gap:8px;font-weight:600;font-size:14.5px;color:var(--navy)}.bk-chk input{width:18px;height:18px}' +
    '.bk-sec{margin:22px 0 10px;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--gold)}.bk-els{display:grid;gap:14px}' +
    '.bk-el{border:1px solid var(--line);border-radius:3px;background:#fff}.bk-el>.eh{display:flex;align-items:center;gap:8px;padding:8px 12px;background:var(--bg);border-bottom:1px solid var(--line)}.bk-el>.eh .tt{flex:1;font-weight:700;font-size:13px;letter-spacing:1px;text-transform:uppercase;color:var(--blue)}.bk-el>.eb{padding:12px}' +
    '.bk-addbar{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}' +
    '.bk-rich{border:1px solid #BCCBDA;border-radius:2px;background:#fff}.bk-rich:focus-within{outline:3px solid var(--gold);outline-offset:1px}.bk-tools{display:flex;flex-wrap:wrap;align-items:center;gap:2px;padding:6px;border-bottom:1px solid var(--line);background:#F7FAFC;position:sticky;top:0;z-index:2}' +
    '.bk-tb{min-width:32px;height:32px;padding:0 7px;border:1px solid transparent;border-radius:3px;background:none;color:var(--navy);font-size:15px;line-height:1;display:inline-flex;align-items:center;justify-content:center}.bk-tb:hover{background:#E6EEF5}.bk-tb.on{background:var(--navy);color:#fff}.bk-sep{width:1px;height:22px;background:var(--line);margin:0 5px}' +
    '.bk-fmt{height:32px;border:1px solid #BCCBDA;border-radius:3px;background:#fff;padding:0 6px;font-size:14px;max-width:150px}' +
    '.bk-area{min-height:150px;max-height:520px;overflow:auto;padding:14px 16px;outline:none}.bk-area:empty:before{content:attr(data-ph);color:#8A9BAD}' +
    '.bk-img{display:grid;grid-template-columns:200px 1fr;gap:16px;align-items:start}.bk-prev{width:200px;height:140px;border:1px solid var(--line);border-radius:2px;background:repeating-conic-gradient(#EEF3F7 0 25%,#fff 0 50%) 0 0/16px 16px;display:flex;align-items:center;justify-content:center;overflow:hidden;color:var(--mut);font-size:13px;text-align:center}.bk-prev img{max-width:100%;max-height:100%;display:block}' +
    '.bk-fields{display:grid;grid-template-columns:1fr 1fr;gap:10px 12px}.bk-fields .wide{grid-column:1/-1}' +
    '@media(max-width:700px){.bk-meta,.bk-fields,.bk-img{grid-template-columns:1fr}.bk-prev{width:100%}.bk-item{flex-wrap:wrap}.bk-item .ac{justify-content:flex-start}.bk-ov{padding:0}.bk-box{max-height:100vh;height:100%;border-radius:0}}';
  document.head.appendChild(css);

  /* ---------- util ---------- */
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function pv(s) { return !s || /^(data:|https?:|\/)/.test(s) ? s : '../' + s.replace(/^\.\.\//, ''); }
  function pageName(slug) { var p = A.pageOf(slug); return p ? p.name : slug; }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function normalize(b) { b = clone(b); b.elemen = clone(D.elemen(b)); if (b.tampil == null) b.tampil = true; return b; }
  function loadAll() { return D.list('blok').map(normalize); }
  function persist(list) { D.setList('blok', list); }
  function sel(opts, val, fn, cls) {
    var s = h('select', { class: cls }, opts.map(function (o) { return h('option', { value: o[0], text: o[1], selected: o[0] === val }); }));
    s.addEventListener('change', function () { fn(s.value); }); return s;
  }
  function field(label, ctl, cls) { return h('label', { class: 'bk-f' + (cls ? ' ' + cls : '') }, h('span', { text: label }), ctl); }
  function textInput(val, fn, ph) { var i = h('input', { type: 'text', placeholder: ph || '' }); i.value = val || ''; i.addEventListener('input', function () { fn(i.value); }); return i; }
  function plain(html) { var d = document.createElement('div'); d.innerHTML = D.clean(html); return d.textContent.replace(/\s+/g, ' ').trim(); }

  /* ---------- editor teks kaya ---------- */
  var BLOCKS = [['p', 'Paragraf'], ['h1', 'Judul 1 (H1)'], ['h2', 'Judul 2 (H2)'], ['h3', 'Judul 3 (H3)'], ['h4', 'Judul 4 (H4)'], ['h5', 'Judul 5 (H5)'], ['h6', 'Judul 6 (H6)'], ['blockquote', 'Kutipan']];
  var STATE = ['bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript', 'insertUnorderedList', 'insertOrderedList', 'justifyCenter', 'justifyRight', 'justifyFull'];
  try { document.execCommand('defaultParagraphSeparator', false, 'p'); } catch (e) { /* abaikan */ }

  function rich(html, onChange) {
    var area = h('div', { class: 'bk-area pas-rich', contenteditable: 'true', spellcheck: 'true', role: 'textbox', 'aria-multiline': 'true', 'aria-label': 'Isi paragraf', 'data-ph': 'Tulis teks di sini…' });
    area.innerHTML = D.clean(html || '');
    var saved = null, btns = {}, fmt;

    function inArea(n) { return !!n && area.contains(n); }
    function remember() { var s = window.getSelection(); if (s.rangeCount && inArea(s.anchorNode)) saved = s.getRangeAt(0).cloneRange(); }
    function restore() {                                                       // hanya pulihkan seleksi jika fokus sempat pindah (mis. ke menu jenis teks)
      var s = window.getSelection();
      if (document.activeElement === area && s.rangeCount && inArea(s.anchorNode)) return;
      area.focus(); if (saved) { s.removeAllRanges(); s.addRange(saved); }
    }
    function sync() { if (area.innerHTML === '<br>') area.innerHTML = ''; onChange(area.innerHTML); }
    function curBlock() {
      var s = window.getSelection(), n = s.anchorNode, found = 'p';
      while (n && n !== area) {
        var t = n.nodeName.toLowerCase();
        if (/^(h[1-6]|blockquote)$/.test(t)) return t;
        n = n.parentNode;
      }
      return found;
    }
    function refresh() {
      var s = window.getSelection(); if (!s.rangeCount || !inArea(s.anchorNode)) return;
      STATE.forEach(function (c) {
        var on = false; try { on = document.queryCommandState(c); } catch (e) { /* abaikan */ }
        if (btns[c]) { btns[c].classList.toggle('on', on); btns[c].setAttribute('aria-pressed', on ? 'true' : 'false'); }
      });
      fmt.value = curBlock();
    }
    function exec(cmd, val) {
      restore();
      var align = /^justify/.test(cmd);
      try { document.execCommand('styleWithCSS', false, align); document.execCommand(cmd, false, val == null ? null : val); document.execCommand('styleWithCSS', false, false); } catch (e) { /* abaikan */ }
      sync(); remember(); refresh();
    }
    function insertLink() {
      remember();
      var s = window.getSelection(), n = s.anchorNode, cur = null;
      while (n && n !== area) { if (n.nodeName === 'A') { cur = n; break; } n = n.parentNode; }
      var url = window.prompt('Alamat tautan (contoh: https://contoh.com). Kosongkan untuk menghapus tautan.', cur ? cur.getAttribute('href') : 'https://');
      if (url === null) return;
      url = url.trim();
      if (!url || url === 'https://') { exec('unlink'); return; }
      if (!/^(https?:\/\/|mailto:|tel:|#|\/)/i.test(url)) url = /^[\w-]+(\.[\w-]+)+/.test(url) ? 'https://' + url : '';
      if (!url) { A.toast('Alamat tautan tidak valid.'); return; }
      restore();
      if (saved && saved.collapsed && !cur) exec('insertHTML', '<a href="' + esc(url).replace(/"/g, '&quot;') + '">' + esc(url) + '</a>');
      else exec('createLink', url);
    }
    function tb(cmd, title, content, fn) {
      var b = h('button', { type: 'button', class: 'bk-tb', title: title, 'aria-label': title });
      if (content.charAt(0) === '<') b.innerHTML = content; else b.textContent = content;
      b.addEventListener('mousedown', function (e) { e.preventDefault(); });      // jaga seleksi teks tetap aktif
      b.addEventListener('click', fn || function () { exec(cmd); });
      if (STATE.indexOf(cmd) > -1) btns[cmd] = b;
      return b;
    }
    function sep() { return h('span', { class: 'bk-sep', role: 'separator' }); }

    fmt = sel(BLOCKS, 'p', function (v) { exec('formatBlock', '<' + v + '>'); }, 'bk-fmt');
    fmt.setAttribute('aria-label', 'Jenis teks (paragraf atau judul)'); fmt.title = 'Jenis teks: paragraf, H1–H6, kutipan';
    var bar = h('div', { class: 'bk-tools', role: 'toolbar', 'aria-label': 'Format teks' },
      tb('undo', 'Urungkan (Ctrl+Z)', ICON.undo), tb('redo', 'Ulangi (Ctrl+Y)', ICON.redo), sep(), fmt, sep(),
      tb('bold', 'Tebal (Ctrl+B)', '<b>B</b>'), tb('italic', 'Miring (Ctrl+I)', '<i style="font-family:serif">I</i>'),
      tb('underline', 'Garis bawah (Ctrl+U)', '<u>U</u>'), tb('strikeThrough', 'Coret', '<s>S</s>'),
      tb('subscript', 'Subskrip', 'x₂'), tb('superscript', 'Superskrip', 'x²'), sep(),
      tb('insertUnorderedList', 'Daftar berpoin', ICON.ul), tb('insertOrderedList', 'Daftar bernomor', ICON.ol), sep(),
      tb('justifyLeft', 'Rata kiri', ICON.left), tb('justifyCenter', 'Rata tengah', ICON.center), tb('justifyRight', 'Rata kanan', ICON.right), tb('justifyFull', 'Rata kiri-kanan', ICON.full), sep(),
      tb('link', 'Sisipkan / ubah tautan (Ctrl+K)', ICON.link, insertLink), tb('unlink', 'Hapus tautan', ICON.unlink),
      tb('insertHorizontalRule', 'Garis pemisah', ICON.hr), tb('removeFormat', 'Hapus format teks', ICON.clear, function () { exec('removeFormat'); exec('formatBlock', '<p>'); }));

    area.addEventListener('input', function () { sync(); remember(); });
    area.addEventListener('keyup', function () { remember(); refresh(); });
    area.addEventListener('mouseup', function () { remember(); refresh(); });
    area.addEventListener('blur', remember);
    area.addEventListener('keydown', function (e) { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); insertLink(); } });
    area.addEventListener('paste', function (e) {                              // tempelan disaring: format Word/web jadi tag aman
      var cd = e.clipboardData; if (!cd) return;
      e.preventDefault();
      var src = cd.getData('text/html'), txt = cd.getData('text/plain'), out;
      if (src) out = D.clean(src);
      else out = txt.split(/\n{2,}/).filter(function (p) { return p.trim(); }).map(function (p) { return '<p>' + esc(p.trim()).replace(/\n/g, '<br>') + '</p>'; }).join('');
      if (out) { document.execCommand('insertHTML', false, out); sync(); }
    });
    ['dragover', 'drop'].forEach(function (ev) { area.addEventListener(ev, function (e) { if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) e.preventDefault(); }); });
    function onSel() { if (!area.isConnected) { document.removeEventListener('selectionchange', onSel); return; } if (document.activeElement === area) { remember(); refresh(); } }
    document.addEventListener('selectionchange', onSel);
    return h('div', { class: 'bk-rich' }, bar, area);
  }

  /* ---------- elemen gambar ---------- */
  function imageBody(it, touch) {
    var prev = h('div', { class: 'bk-prev' }), fw = null, fwBox = h('div', { style: 'margin-top:12px' });
    function show() {
      prev.textContent = '';
      if (it.src) prev.appendChild(h('img', { src: pv(it.src), alt: '' })); else prev.appendChild(h('span', { text: 'Belum ada gambar. Unggah atau pilih dari daftar.' }));
    }
    function setSrc(u) { it.src = u; it.f = ''; touch(); show(); if (fw) { fw.setSrc(u); fw.reset(); } }
    var file = h('input', { type: 'file', accept: 'image/*', hidden: true });
    file.addEventListener('change', function () {
      var f = file.files[0]; file.value = ''; if (!f) return;
      A.fileToDataURL(f).then(setSrc, function (e) { A.toast(e.message); });
    });
    var bi = sel([['', 'Pilih gambar bawaan situs…']].concat(BUILTIN), '', function (v) { if (v) setSrc(v); bi.value = ''; });
    bi.style.cssText = 'width:100%;min-height:36px;margin-top:8px;border:1px solid #BCCBDA;border-radius:2px;padding:0 8px;background:#fff';
    function drawFocal() {
      fwBox.textContent = ''; fw = null;
      if (!it.potong || !E || !E.focal) return;
      fw = E.focal(it.src, it.f, function (p) { it.f = p; touch(); });
      fwBox.appendChild(fw.el);
    }
    var left = h('div', null, prev,
      h('button', { type: 'button', class: 'btn btn-line btn-sm', style: 'margin-top:8px', text: 'Unggah gambar…', onclick: function () { file.click(); } }), file, bi);
    var right = h('div', { class: 'bk-fields' },
      field('Teks alternatif (untuk pembaca layar)', textInput(it.alt, function (v) { it.alt = v; touch(); }, 'Jelaskan isi gambar'), 'wide'),
      field('Keterangan di bawah gambar', textInput(it.caption, function (v) { it.caption = v; touch(); }, 'Opsional'), 'wide'),
      field('Ukuran', sel([['penuh', 'Lebar penuh'], ['sedang', 'Sedang'], ['kecil', 'Kecil']], it.ukuran || 'penuh', function (v) { it.ukuran = v; touch(); })),
      field('Posisi', sel([['kiri', 'Kiri'], ['tengah', 'Tengah'], ['kanan', 'Kanan']], it.posisi || 'kiri', function (v) { it.posisi = v; touch(); })),
      field('Tampilan', sel([['utuh', 'Utuh (tidak dipotong)'], ['potong', 'Dipotong, pilih fokus']], it.potong ? 'potong' : 'utuh', function (v) { it.potong = v === 'potong'; touch(); drawFocal(); }), 'wide'));
    show(); drawFocal();
    return h('div', null, h('div', { class: 'bk-img' }, left, right), fwBox);
  }

  /* ---------- jendela tambah / ubah konten ---------- */
  function openEditor(item, done) {
    var isNew = !item;
    var w = item ? normalize(item) : { id: uid(), halaman: filter !== 'semua' ? filter : 'index', bahasa: 'semua', judul: '', tampil: true, elemen: [{ tipe: 'teks', html: '' }] };
    var dirty = false, els = h('div', { class: 'bk-els' });
    function touch() { dirty = true; }

    function draw(focusIdx) {
      els.textContent = '';
      if (!w.elemen.length) els.appendChild(h('div', { class: 'empty', text: 'Belum ada isi. Tambahkan paragraf atau gambar dengan tombol di bawah.' }));
      w.elemen.forEach(function (it, i) { els.appendChild(card(it, i)); });
      if (focusIdx != null && els.children[focusIdx]) els.children[focusIdx].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
    function move(i, d) {
      var j = i + d; if (j < 0 || j >= w.elemen.length) return;
      var t = w.elemen[i]; w.elemen[i] = w.elemen[j]; w.elemen[j] = t; touch(); draw(j);
    }
    function card(it, i) {
      var isText = it.tipe === 'teks';
      var head = h('div', { class: 'eh' },
        h('span', { class: 'tt', text: (i + 1) + '. ' + (isText ? 'Paragraf / teks' : 'Gambar') }),
        h('button', { type: 'button', class: 'btn btn-line btn-sm', 'aria-label': 'Pindah ke atas', title: 'Pindah ke atas', text: '↑', disabled: i === 0, onclick: function () { move(i, -1); } }),
        h('button', { type: 'button', class: 'btn btn-line btn-sm', 'aria-label': 'Pindah ke bawah', title: 'Pindah ke bawah', text: '↓', disabled: i === w.elemen.length - 1, onclick: function () { move(i, 1); } }),
        h('button', { type: 'button', class: 'btn btn-danger btn-sm', text: 'Hapus', onclick: function () {
          if (isText ? plain(it.html) && !confirm('Hapus paragraf ini?') : it.src && !confirm('Hapus gambar ini?')) return;
          w.elemen.splice(i, 1); touch(); draw();
        } }));
      var body = isText ? rich(it.html, function (v) { it.html = v; touch(); }) : imageBody(it, touch);
      return h('div', { class: 'bk-el' }, head, h('div', { class: 'eb' }, body));
    }
    function addEl(tipe) {
      w.elemen.push(tipe === 'teks' ? { tipe: 'teks', html: '' } : { tipe: 'gambar', src: '', f: '', alt: '', caption: '', ukuran: 'penuh', posisi: 'kiri', potong: false });
      touch(); draw(w.elemen.length - 1);
      var last = els.lastElementChild, ed = last && last.querySelector('.bk-area'); if (ed) ed.focus();
    }

    var meta = h('div', { class: 'bk-meta' },
      field('Halaman', sel(PAGES.map(function (p) { return [p.slug, p.name]; }), w.halaman, function (v) { w.halaman = v; touch(); })),
      field('Tampil di bahasa', sel(Object.keys(LANGL).map(function (k) { return [k, LANGL[k]]; }), w.bahasa || 'semua', function (v) { w.bahasa = v; touch(); })),
      field('Judul konten (tampil sebagai judul bagian)', textInput(w.judul, function (v) { w.judul = v; touch(); }, 'Contoh: Visi kami'), 'wide'),
      h('label', { class: 'bk-chk wide' }, h('input', { type: 'checkbox', checked: w.tampil !== false, onchange: function (e) { w.tampil = e.target.checked; touch(); } }), 'Tampilkan di website'));

    var ov = h('div', { class: 'bk-ov' });
    function close(force) {
      if (!force && dirty && !confirm('Ada perubahan yang belum disimpan. Tutup tanpa menyimpan?')) return;
      document.removeEventListener('keydown', onKey); ov.remove();
    }
    function onKey(e) { if (e.key === 'Escape' && !e.defaultPrevented) close(); }
    function save() {
      var out = clone(w);
      out.judul = (out.judul || '').trim();
      out.elemen = out.elemen.map(function (it) {
        if (it.tipe === 'teks') return { tipe: 'teks', html: D.clean(it.html) };
        return it;
      }).filter(function (it) { return it.tipe === 'teks' ? it.html : !!it.src; });
      if (!out.judul && !out.elemen.length) { A.toast('Isi judul, paragraf, atau gambar dulu.'); return; }
      delete out.isi; delete out.gambar; delete out.gambar_f;                  // data format lama diganti format elemen
      var list = loadAll(), at = -1;
      list.forEach(function (b, i) { if (b.id === out.id) at = i; });
      if (at > -1) list[at] = out; else { out.dibuat = new Date().toISOString(); list.push(out); }
      try { persist(list); } catch (e) { A.toast('Gagal menyimpan: penyimpanan browser penuh. Perkecil/hapus gambar lalu coba lagi.'); return; }
      close(true); A.toast(isNew ? 'Konten ditambahkan.' : 'Perubahan disimpan.'); done();
    }

    var box = h('div', { class: 'bk-box', role: 'dialog', 'aria-modal': 'true', 'aria-label': isNew ? 'Tambah konten' : 'Ubah konten' },
      h('div', { class: 'bk-hd' }, h('h2', { text: isNew ? 'Tambah konten halaman' : 'Ubah konten halaman' })),
      h('div', { class: 'bk-bd' }, meta,
        h('div', { class: 'bk-sec', text: 'Isi konten' }), els,
        h('div', { class: 'bk-addbar' },
          h('button', { type: 'button', class: 'btn btn-line', text: '+ Paragraf', onclick: function () { addEl('teks'); } }),
          h('button', { type: 'button', class: 'btn btn-line', text: '+ Gambar', onclick: function () { addEl('gambar'); } }))),
      h('div', { class: 'bk-ft' },
        h('button', { type: 'button', class: 'btn btn-line', text: 'Batal', onclick: function () { close(); } }),
        h('button', { type: 'button', class: 'btn btn-gold', text: 'Simpan konten', onclick: save })));
    ov.appendChild(box); document.body.appendChild(ov);
    document.addEventListener('keydown', onKey);
    draw();
  }

  /* ---------- daftar konten ---------- */
  function exportJson() {
    var u = URL.createObjectURL(new Blob([JSON.stringify(loadAll(), null, 2)], { type: 'application/json' })), a = h('a', { href: u, download: 'pas-konten-halaman.json' });
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(u); }, 1000);
  }
  function importJson(done) {
    var inp = h('input', { type: 'file', accept: 'application/json,.json' });
    inp.addEventListener('change', function () {
      var f = inp.files[0]; if (!f) return;
      var r = new FileReader();
      r.onload = function () {
        try {
          var j = JSON.parse(r.result); if (j && !Array.isArray(j) && Array.isArray(j.data)) j = j.data;
          if (!Array.isArray(j)) throw new Error('format');
          var slugs = PAGES.map(function (p) { return p.slug; });
          var list = j.filter(function (b) { return b && typeof b === 'object' && slugs.indexOf(b.halaman) > -1; }).map(function (b) {
            var n = normalize(b); n.id = n.id || uid();
            n.elemen = n.elemen.map(function (it) { return it.tipe === 'teks' ? { tipe: 'teks', html: D.clean(it.html) } : it; });
            return n;
          });
          if (!list.length) throw new Error('kosong');
          if (!confirm('Impor ' + list.length + ' konten akan MENGGANTIKAN semua konten halaman yang ada sekarang. Lanjutkan?')) return;
          persist(list); A.toast('Konten berhasil diimpor.'); done();
        } catch (e) { A.toast(e.name === 'QuotaExceededError' ? 'File terlalu besar untuk penyimpanan browser.' : 'File tidak valid.'); }
      };
      r.readAsText(f);
    });
    inp.click();
  }

  function view() {
    var body = h('div'), tabs = h('div', { class: 'bk-tabs', role: 'group', 'aria-label': 'Filter halaman' });

    function shift(id, dir) {                                                   // pindah urutan di antara konten pada halaman yang sama
      var list = loadAll(), i = -1; list.forEach(function (b, k) { if (b.id === id) i = k; });
      if (i < 0) return;
      for (var j = i + dir; j >= 0 && j < list.length; j += dir) {
        if (list[j].halaman === list[i].halaman) { var t = list[i]; list[i] = list[j]; list[j] = t; try { persist(list); } catch (e) { A.toast(e.message); } return view(); }
      }
    }
    function toggle(id) { var list = loadAll(); list.forEach(function (b) { if (b.id === id) b.tampil = !b.tampil; }); try { persist(list); } catch (e) { A.toast(e.message); } view(); }
    function remove(b) {
      if (!confirm('Hapus konten "' + (b.judul || 'tanpa judul') + '"? Tindakan tidak bisa dibatalkan.')) return;
      persist(loadAll().filter(function (x) { return x.id !== b.id; })); A.toast('Konten dihapus.'); view();
    }

    function drawTabs(all) {
      tabs.textContent = '';
      [['semua', 'Semua']].concat(PAGES.map(function (p) { return [p.slug, p.name]; })).forEach(function (t) {
        var n = t[0] === 'semua' ? all.length : all.filter(function (b) { return b.halaman === t[0]; }).length;
        tabs.appendChild(h('button', { type: 'button', class: filter === t[0] ? 'on' : '', 'aria-pressed': filter === t[0] ? 'true' : 'false', onclick: function () { filter = t[0]; view(); } }, t[1], h('b', { text: String(n) })));
      });
    }
    function draw() {
      var all = loadAll(); drawTabs(all);
      var rows = all.filter(function (b) { return filter === 'semua' || b.halaman === filter; });
      body.textContent = '';
      if (!rows.length) { body.appendChild(h('div', { class: 'empty card', text: all.length ? 'Belum ada konten untuk halaman ini. Klik “+ Tambah Konten”.' : 'Belum ada konten. Klik “+ Tambah Konten” untuk membuat yang pertama.' })); return; }
      var wrap = h('div', { class: 'bk-list' });
      rows.forEach(function (b) {
        var firstImg = b.elemen.filter(function (e) { return e.tipe === 'gambar' && e.src; })[0];
        var firstTxt = b.elemen.filter(function (e) { return e.tipe === 'teks' && plain(e.html); })[0];
        var nT = b.elemen.filter(function (e) { return e.tipe === 'teks'; }).length, nG = b.elemen.filter(function (e) { return e.tipe === 'gambar'; }).length;
        wrap.appendChild(h('div', { class: 'bk-item' + (b.tampil === false ? ' off' : '') },
          h('div', { class: 'th' }, firstImg ? h('img', { src: pv(firstImg.src), alt: '' }) : 'Teks'),
          h('div', { class: 'in' },
            h('h3', { text: b.judul || '(Tanpa judul)' }),
            h('div', { class: 'mt' }, h('span', { text: pageName(b.halaman) }), h('span', { text: LANGL[b.bahasa || 'semua'] }),
              h('span', { text: nT + ' paragraf · ' + nG + ' gambar' }), h('span', { class: 'bk-pill' + (b.tampil === false ? '' : ' ok'), text: b.tampil === false ? 'Disembunyikan' : 'Tampil' })),
            firstTxt ? h('p', { class: 'sn', text: plain(firstTxt.html) }) : null),
          h('div', { class: 'ac' },
            h('button', { type: 'button', class: 'btn btn-line btn-sm', title: 'Naikkan urutan', 'aria-label': 'Naikkan urutan', text: '↑', onclick: function () { shift(b.id, -1); } }),
            h('button', { type: 'button', class: 'btn btn-line btn-sm', title: 'Turunkan urutan', 'aria-label': 'Turunkan urutan', text: '↓', onclick: function () { shift(b.id, 1); } }),
            h('button', { type: 'button', class: 'btn btn-line btn-sm', text: b.tampil === false ? 'Tampilkan' : 'Sembunyikan', onclick: function () { toggle(b.id); } }),
            h('button', { type: 'button', class: 'btn btn-line btn-sm', text: 'Ubah', onclick: function () { openEditor(b, view); } }),
            h('button', { type: 'button', class: 'btn btn-danger btn-sm', text: 'Hapus', onclick: function () { remove(b); } }))));
      });
      body.appendChild(wrap);
    }

    A.shell('k/blok', 'Konten Halaman', h('div', null,
      h('p', { class: 'eyebrow', text: 'Kelola Konten' }),
      h('h1', { class: 'pt', text: 'Konten Halaman' }),
      h('p', { class: 'lead', text: 'Tambahkan konten baru ke halaman mana pun. Di dalam setiap konten Anda bisa menambah paragraf (dengan tebal, miring, judul H1–H6, daftar, tautan, dll.) dan gambar. Konten tampil di bagian bawah halaman, sebelum footer, sesuai urutan di sini.' }),
      h('div', { class: 'ehead', style: 'position:static;border:0;padding:0;margin:0;background:none' }, h('div', { class: 'row2', style: 'margin-top:0' },
        h('button', { type: 'button', class: 'btn btn-gold', text: '+ Tambah Konten', onclick: function () { openEditor(null, view); } }),
        h('button', { type: 'button', class: 'btn btn-line', text: 'Ekspor JSON', onclick: exportJson }),
        h('button', { type: 'button', class: 'btn btn-line', text: 'Impor JSON', onclick: function () { importJson(view); } }))),
      tabs, body));
    draw();
  }

  window.PASBlocks = { view: view, rich: rich, imageBody: imageBody, field: field, sel: sel, textInput: textInput, plain: plain };
})();
