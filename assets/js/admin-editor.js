/* Panel admin: editor halaman dua bahasa sekaligus (ID + EN), pemilih fokus gambar, dan menu sisi dengan dropdown bagian. */
(function () {
  'use strict';
  var A = window.PASAdmin, h = A.h, M = A.M, PAGES = A.PAGES, VK = 'pas_admin_view';
  var LN = { id: 'Indonesia', en: 'Inggris' };
  function getView() { try { return localStorage.getItem(VK) || 'both'; } catch (e) { return 'both'; } }
  function setView(v) { try { localStorage.setItem(VK, v); } catch (e) {} }
  function pv(s) { return /^(data:|https?:|\/)/.test(s) ? s : '../' + s.replace(/^\.\.\//, ''); }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function reroute() { window.dispatchEvent(new Event('hashchange')); }

  var css = document.createElement('style');
  css.textContent = '.bi{display:grid;grid-template-columns:1fr 1fr;gap:12px}.bi.one{grid-template-columns:1fr}.bi .lg{display:block;font-size:11.5px;font-weight:700;letter-spacing:1.2px;color:var(--mut);margin:0 0 3px}.langsel{width:100%;min-height:40px;padding:0 10px;border-radius:3px;border:1px solid rgba(255,255,255,.25);background:rgba(255,255,255,.08);color:#fff}.langsel option{color:#1C2733}.side .pg{display:flex;align-items:stretch}.side .pg a.item{flex:1;min-width:0}.side .pg .tg{flex:none;width:34px;background:none;border:0;color:#CFDEEC;font-size:14px}.side .sub{margin:0 0 6px 14px;border-left:1px solid rgba(255,255,255,.15)}.side .sub a{display:block;padding:6px 12px;color:#AFC3D6;text-decoration:none;font-size:13.5px;line-height:1.35}.side .sub a:hover{color:#fff;background:rgba(255,255,255,.06)}.focal{display:flex;flex-wrap:wrap;gap:16px;align-items:flex-start}.fbox{position:relative;display:inline-block;line-height:0;cursor:crosshair;touch-action:none;border:1px solid var(--line);background:#fff}.fbox img{max-width:100%;max-height:210px;display:block;user-select:none;-webkit-user-drag:none}.fdot{position:absolute;width:22px;height:22px;margin:-11px 0 0 -11px;border:3px solid #fff;border-radius:50%;box-shadow:0 0 0 2px var(--gold),0 2px 6px rgba(0,0,0,.4);pointer-events:none}.fcrop{width:200px;height:112px;overflow:hidden;border:1px solid var(--line);background:#EEF3F7}.fcrop img{width:100%;height:100%;object-fit:cover;display:block}.focal small{display:block;color:var(--mut);font-size:12.5px;line-height:1.35;margin:4px 0;max-width:220px}@media(max-width:700px){.bi{grid-template-columns:1fr}}';
  document.head.appendChild(css);

  /* pemilih fokus gambar: klik / geser di gambar; pratinjau menunjukkan hasil potongan */
  function focal(src, val, onChange) {
    var pos = val || '50% 50%', drag = false;
    var img = h('img', { alt: '', draggable: 'false' }), cimg = h('img', { alt: '' }), dot = h('span', { class: 'fdot' });
    var box = h('div', { class: 'fbox' }, img, dot);
    function upd() { var p = pos.split(' '); dot.style.left = p[0]; dot.style.top = p[1]; cimg.style.objectPosition = pos; }
    function setSrc(s) { img.src = cimg.src = s ? pv(s) : ''; }
    function from(e) {
      var r = img.getBoundingClientRect(); if (!r.width) return;
      var x = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)), y = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
      pos = Math.round(x * 100) + '% ' + Math.round(y * 100) + '%'; upd(); onChange(pos);
    }
    box.addEventListener('pointerdown', function (e) { drag = true; try { box.setPointerCapture(e.pointerId); } catch (x) {} from(e); });
    box.addEventListener('pointermove', function (e) { if (drag) from(e); });
    box.addEventListener('pointerup', function () { drag = false; });
    img.addEventListener('load', upd);
    setSrc(src); upd();
    return { setSrc: setSrc, reset: function () { pos = '50% 50%'; upd(); }, set: function (v) { pos = v || '50% 50%'; upd(); },
      el: h('div', { class: 'focal' }, h('div', null, box, h('small', { text: 'Klik atau geser pada gambar untuk memilih bagian yang difokuskan.' })),
        h('div', null, h('small', { text: 'Pratinjau potongan' }), h('div', { class: 'fcrop' }, cimg))) };
  }

  function sidebar(active) {
    var all = PASSite.load(), mode = getView(), items = [];
    var sel = h('select', { class: 'langsel', 'aria-label': 'Bahasa tampilan' }, [['both', 'Indonesia + Inggris'], ['id', 'Indonesia saja'], ['en', 'Inggris saja']].map(function (o) { return h('option', { value: o[0], text: o[1], selected: o[0] === mode }); }));
    sel.addEventListener('change', function () { setView(sel.value); reroute(); });
    items.push(h('div', { class: 'grp-title', text: 'Bahasa tampilan' }), h('div', { style: 'padding:0 6px' }, sel), h('div', { class: 'grp-title', text: 'Edit halaman' }));
    PAGES.forEach(function (p) {
      var n = A.countEdits(all['en/' + p.slug]) + A.countEdits(all['id/' + p.slug]), isA = active === p.slug;
      var mm = M[(mode === 'en' ? 'en' : 'id') + '/' + p.slug], sub = h('div', { class: 'sub', hidden: !isA });
      if (mm) mm.groups.forEach(function (g, gi) {
        if (g.kind === 'header' || g.kind === 'footer') return;
        sub.appendChild(h('a', { href: '#p/' + p.slug + '/' + gi, text: g.label, onclick: function (e) { if (active === p.slug && window.PASAdminEdit.jump) { e.preventDefault(); window.PASAdminEdit.jump(gi); } } }));
      });
      var tg = h('button', { type: 'button', class: 'tg', 'aria-label': 'Daftar bagian ' + p.name, text: isA ? '▴' : '▾', onclick: function () { sub.hidden = !sub.hidden; tg.textContent = sub.hidden ? '▾' : '▴'; } });
      items.push(h('div', { class: 'pg' }, h('a', { class: 'item' + (isA ? ' on' : ''), href: '#p/' + p.slug }, h('span', { text: p.name }), h('span', { class: 'badge', id: 'bd-' + p.slug, text: String(n), hidden: n === 0 })), tg), sub);
    });
    return items;
  }

  function view(slug, target) {
    var page = A.pageOf(slug), mode = getView(), langs = mode === 'both' ? ['id', 'en'] : [mode], lead = langs[0];
    var MI = M['id/' + slug], ME = M['en/' + slug]; if (!page || !MI || !ME) { location.hash = '#dashboard'; return; }
    var st = PASSite.load(), cur = { en: clone(st['en/' + slug] || {}), id: clone(st['id/' + slug] || {}) };
    var dirty = false, rows = [], groups = [], statusEl = h('span', { class: 'status idle', 'aria-live': 'polite' }), tm = null;
    var saveBtn = h('button', { type: 'button', class: 'btn btn-gold', disabled: true, text: 'Simpan perubahan', onclick: function () { save(); } });
    function total() { return A.countEdits(cur.en) + A.countEdits(cur.id); }
    function status(msg, kind) { statusEl.textContent = msg; statusEl.className = 'status' + (kind ? ' ' + kind : ''); }
    function idle() { status(total() ? total() + ' perubahan tersimpan di browser ini' : 'Belum ada perubahan', 'idle'); }
    function touch() { dirty = true; saveBtn.disabled = false; status('Ada perubahan yang belum disimpan', 'warn'); counts(); }
    function counts() { groups.forEach(function (g) { var c = g.rows.filter(function (r) { return r.el.classList.contains('changed'); }).length; g.chip.textContent = c ? c + ' diubah' : ''; g.chip.hidden = !c; }); }
    function save() {
      var all = PASSite.load();
      ['en', 'id'].forEach(function (L) { if (A.isEmpty(cur[L])) delete all[L + '/' + slug]; else all[L + '/' + slug] = cur[L]; });
      try { PASSite.save(all); } catch (e) { status('Gagal menyimpan: penyimpanan browser penuh. Perkecil gambar atau hapus perubahan lain.', 'err'); return false; }
      dirty = false; saveBtn.disabled = true; status('Tersimpan untuk kedua bahasa ✓', 'ok'); clearTimeout(tm); tm = setTimeout(function () { if (!dirty) idle(); }, 2500);
      var b = document.getElementById('bd-' + slug); if (b) { b.textContent = String(total()); b.hidden = !total(); }
      return true;
    }
    A.setEditor({ isDirty: function () { return dirty; }, save: save });

    /* kolom per bahasa untuk satu bidang teks / judul */
    function cols(entries, onSet) {
      var wrap = h('div', { class: 'bi' + (langs.length === 1 ? ' one' : '') }), ins = {};
      langs.forEach(function (L) {
        var e = entries[L], long = e.orig.length > 70 || e.long, inp = h(long ? 'textarea' : 'input', long ? { rows: Math.min(6, Math.ceil(e.orig.length / 70) + 1) } : { type: 'text' });
        inp.value = e.val; ins[L] = inp;
        if (long) inp.addEventListener('keydown', function (ev) { if (ev.key === 'Enter') ev.preventDefault(); });
        inp.addEventListener('input', function () { onSet(L, inp.value); });
        wrap.appendChild(h('div', null, langs.length > 1 ? h('span', { class: 'lg', text: L.toUpperCase() }) : null, inp));
      });
      return { el: wrap, ins: ins };
    }
    function textRow(i) {
      var ent = {}; langs.forEach(function (L) { var t = M[L + '/' + slug].texts[i], s = cur[L].t && cur[L].t[i]; ent[L] = { orig: t[3], val: s ? s.v : t[3] }; });
      var tag = h('span', { class: 'tag', text: A.TAGS[MI.texts[i][2]] || 'Teks' }), rv = h('button', { type: 'button', class: 'rv', text: 'Kembalikan', hidden: true });
      var el = h('div', { class: 'row' }, h('div', { class: 'rl' }, tag, rv));
      function chg() { return langs.some(function (L) { var s = cur[L].t && cur[L].t[i]; return !!s; }); }
      var c = cols(ent, function (L, v) {
        v = v.replace(/\s*\n\s*/g, ' ').trim(); var o = M[L + '/' + slug].texts[i][3];
        if (v === o) { if (cur[L].t) { delete cur[L].t[i]; if (!Object.keys(cur[L].t).length) delete cur[L].t; } } else (cur[L].t = cur[L].t || {})[i] = { o: o, v: v };
        sync(); touch();
      });
      function sync() { var x = chg(); el.classList.toggle('changed', x); rv.hidden = !x; }
      rv.addEventListener('click', function () { langs.forEach(function (L) { c.ins[L].value = M[L + '/' + slug].texts[i][3]; if (cur[L].t) { delete cur[L].t[i]; if (!Object.keys(cur[L].t).length) delete cur[L].t; } }); sync(); touch(); });
      el.appendChild(c.el); sync();
      var s = langs.map(function (L) { return ent[L].orig; }).join(' ').toLowerCase();
      var r = { el: el, s: s }; rows.push(r); return r;
    }
    function titleRow() {
      var ent = {}; langs.forEach(function (L) { var s = cur[L].title; ent[L] = { orig: M[L + '/' + slug].title, val: s ? s.v : M[L + '/' + slug].title, long: false }; });
      var el = h('div', { class: 'row' }, h('div', { class: 'rl' }, h('span', { class: 'tag', text: 'Judul tab browser' })));
      var c = cols(ent, function (L, v) { var o = M[L + '/' + slug].title; v = v.trim(); if (v === o) delete cur[L].title; else cur[L].title = { o: o, v: v }; el.classList.toggle('changed', !!(cur.en.title || cur.id.title)); touch(); });
      el.classList.toggle('changed', !!(cur.en.title || cur.id.title)); el.appendChild(c.el);
      var r = { el: el, s: 'judul tab browser title ' + ME.title.toLowerCase() }; rows.push(r); return r;
    }
    function imageRow(i) {
      var o = { en: ME.images[i][2], id: MI.images[i][2] }, alt = MI.images[i][3] || ME.images[i][3] || '';
      var s0 = (cur.id.im && cur.id.im[i]) || (cur.en.im && cur.en.im[i]);
      var state = { v: s0 && s0.v !== (cur.id.im && cur.id.im[i] ? o.id : o.en) ? s0.v : null, f: s0 && s0.f || null };
      var el = h('div', { class: 'row' }), fn = h('p', { class: 'fn', text: o.id.split('/').pop() + (alt ? ' — ' + alt : '') });
      var fw = focal(state.v || o.id, state.f, function (p) { state.f = p; commit(); });
      var fileIn = h('input', { type: 'file', accept: 'image/*', hidden: true }), rv = h('button', { type: 'button', class: 'rv', text: 'Kembalikan', hidden: true });
      function commit() {
        ['en', 'id'].forEach(function (L) {
          if (!state.v && !state.f) { if (cur[L].im) { delete cur[L].im[i]; if (!Object.keys(cur[L].im).length) delete cur[L].im; } }
          else { var e = { o: o[L], v: state.v || o[L] }; if (state.f) e.f = state.f; (cur[L].im = cur[L].im || {})[i] = e; }
        });
        el.classList.toggle('changed', !!(state.v || state.f)); rv.hidden = !(state.v || state.f); touch();
      }
      fileIn.addEventListener('change', function () {
        var f = fileIn.files[0]; fileIn.value = ''; if (!f) return; status('Memproses gambar…');
        A.fileToDataURL(f).then(function (u) { state.v = u; fw.setSrc(u); commit(); }, function (e) { status(e.message, 'err'); });
      });
      rv.addEventListener('click', function () { state.v = state.f = null; fw.setSrc(o.id); fw.reset(); commit(); });
      el.appendChild(h('div', { class: 'rl' }, h('span', { class: 'tag', text: 'Gambar (berlaku untuk ID dan EN)' }), rv));
      el.appendChild(fn); el.appendChild(fw.el);
      el.appendChild(h('div', { class: 'btns', style: 'margin-top:10px' }, h('button', { type: 'button', class: 'btn btn-line btn-sm', text: 'Ganti gambar…', onclick: function () { fileIn.click(); } }), fileIn));
      el.classList.toggle('changed', !!(state.v || state.f)); rv.hidden = !(state.v || state.f);
      var r = { el: el, s: (o.id + ' ' + alt + ' gambar').toLowerCase() }; rows.push(r); return r;
    }

    /* susun grup */
    var G = (mode === 'en' ? ME : MI).groups, gnodes = [];
    var tr = titleRow(); gnodes.push({ label: 'Judul tab browser', kind: null, rs: [tr] });
    G.forEach(function (g, gi) {
      var rs = [];
      MI.images.forEach(function (im) { if (im[1] === gi) rs.push(imageRow(im[0])); });
      MI.texts.forEach(function (t) { if (t[1] === gi) rs.push(textRow(t[0])); });
      gnodes.push({ label: g.label, kind: g.kind, rs: rs, gi: gi });
    });
    var firstSec = null;
    gnodes.forEach(function (n) { if (firstSec === null && n.kind === 'section') firstSec = n.gi; });
    var tgt = target != null && target !== '' ? +target : firstSec;
    var KIND = { header: 'Bagian atas', footer: 'Bagian bawah', other: 'Lainnya' };
    var list = h('div');
    gnodes.forEach(function (n) {
      var chip = h('span', { class: 'chip ch', hidden: true }), body = h('div', { class: 'gbody' }, n.rs.map(function (r) { return r.el; }));
      var det = h('details', { class: 'grp', id: n.gi != null ? 'g-' + n.gi : null, open: n.gi === tgt },
        h('summary', null, h('span', { class: 't' }, n.label, n.kind && KIND[n.kind] ? h('span', { class: 'kind', text: '  ·  ' + KIND[n.kind] }) : null), chip, h('span', { class: 'chip', text: n.rs.length + ' bidang' })), body);
      var g = { el: det, rows: n.rs, chip: chip, open0: n.gi === tgt }; groups.push(g); list.appendChild(det);
    });
    var empty = h('div', { class: 'empty', hidden: true, text: 'Tidak ada yang cocok dengan pencarian.' });
    var search = h('input', { type: 'search', class: 'search', placeholder: 'Cari teks di halaman ini…', 'aria-label': 'Cari' });
    search.addEventListener('input', function () {
      var q = search.value.trim().toLowerCase(), any = false;
      groups.forEach(function (g) {
        var vis = 0; g.rows.forEach(function (r) { var ok = !q || r.s.indexOf(q) > -1 || (r.el.textContent + Array.prototype.map.call(r.el.querySelectorAll('input,textarea'), function (x) { return x.value; }).join(' ')).toLowerCase().indexOf(q) > -1; r.el.hidden = !ok; if (ok) vis++; });
        g.el.hidden = !!q && !vis; if (q) g.el.open = vis > 0; else g.el.open = g.open0; if (vis) any = true;
      });
      empty.hidden = !q || any;
    });
    function reset() {
      if (!confirm('Kembalikan seluruh halaman ' + page.name + ' ke isi asli (kedua bahasa)?')) return;
      var all = PASSite.load(); delete all['en/' + slug]; delete all['id/' + slug]; PASSite.save(all); dirty = false; A.setEditor(null); reroute();
    }
    window.PASAdminEdit.jump = function (gi) { var d = document.getElementById('g-' + gi); if (!d) return; d.hidden = false; d.open = true; d.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
    A.shell(slug, page.name, h('div', null,
      h('div', { class: 'ehead' },
        h('div', { class: 'row1' }, h('div', null, h('h1', { class: 'pt', text: page.name }), h('p', { class: 'meta', text: mode === 'both' ? 'Perubahan berlaku untuk Bahasa Indonesia dan Inggris sekaligus.' : 'Hanya menampilkan Bahasa ' + LN[mode] + '. Ubah pilihan di menu kiri untuk melihat keduanya.' })),
          h('div', { class: 'tools' }, h('a', { class: 'btn btn-line', href: '../id/' + page.file, target: '_blank', rel: 'noopener', text: 'Lihat ID ↗' }), h('a', { class: 'btn btn-line', href: '../' + page.file, target: '_blank', rel: 'noopener', text: 'Lihat EN ↗' }))),
        h('div', { class: 'row2' }, search, statusEl, h('button', { type: 'button', class: 'btn btn-line', text: 'Reset halaman', onclick: reset }), saveBtn)),
      list, empty));
    idle(); counts();
    if (target != null && target !== '') setTimeout(function () { window.PASAdminEdit.jump(tgt); }, 30);
  }
  window.PASAdminEdit = { view: view, sidebar: sidebar, focal: focal, jump: null };
  reroute();
})();
