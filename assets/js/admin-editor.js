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
  css.textContent = '.bi{display:grid;grid-template-columns:1fr 1fr;gap:12px}.bi.one{grid-template-columns:1fr}.bi .lg{display:block;font-size:11.5px;font-weight:700;letter-spacing:1.2px;color:var(--mut);margin:0 0 3px}.langsel{width:100%;min-height:40px;padding:0 10px;border-radius:3px;border:1px solid rgba(255,255,255,.25);background:rgba(255,255,255,.08);color:#fff}.langsel option{color:#1C2733}.side .pg{display:flex;align-items:stretch}.side .pg a.item{flex:1;min-width:0}.side .pg .tg{flex:none;width:34px;background:none;border:0;color:#CFDEEC;font-size:14px}.side .sub{margin:0 0 6px 14px;border-left:1px solid rgba(255,255,255,.15)}.side .sub a{display:block;padding:6px 12px;color:#AFC3D6;text-decoration:none;font-size:13.5px;line-height:1.35}.side .sub a:hover{color:#fff;background:rgba(255,255,255,.06)}.focal{display:flex;flex-wrap:wrap;gap:16px;align-items:flex-start}.fbox{position:relative;display:inline-block;line-height:0;cursor:crosshair;touch-action:none;border:1px solid var(--line);background:#fff}.fbox img{max-width:100%;max-height:210px;display:block;user-select:none;-webkit-user-drag:none}.fdot{position:absolute;width:22px;height:22px;margin:-11px 0 0 -11px;border:3px solid #fff;border-radius:50%;box-shadow:0 0 0 2px var(--gold),0 2px 6px rgba(0,0,0,.4);pointer-events:none}.fcrop{width:200px;height:112px;overflow:hidden;border:1px solid var(--line);background:#EEF3F7}.fcrop img{width:100%;height:100%;object-fit:cover;display:block}.focal small{display:block;color:var(--mut);font-size:12.5px;line-height:1.35;margin:4px 0;max-width:220px}.lst{border:1px solid var(--line);border-radius:4px;background:#fff;margin:0 0 16px;padding:12px 14px}.lst .lh{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin:0 0 6px}.lst .lh b{font-size:14px;flex:1;min-width:0}.lst .hint{margin:0 0 8px;color:var(--mut);font-size:12.5px;line-height:1.4}.li{display:flex;align-items:center;gap:10px;padding:7px 0;border-bottom:1px solid var(--line)}.li .ln{flex:none;width:26px;color:var(--mut);font-size:12px}.li .lp{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:14px}.li.gone .lp{text-decoration:line-through;opacity:.55}.nw{border:1px dashed var(--gold);border-radius:4px;padding:10px 12px;margin:10px 0;background:#FFFBF3}.nw .cap{display:block;font-size:12px;font-weight:600;color:var(--mut);margin:10px 0 3px}.nw .thumb{max-width:160px;max-height:90px;display:block;border:1px solid var(--line);margin:4px 0 6px}.row.gone{opacity:.45}@media(max-width:700px){.bi{grid-template-columns:1fr}}';
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
    function counts() { groups.forEach(function (g) { var c = g.rows.filter(function (r) { return r.el.classList.contains('changed'); }).length; (g.lists || []).forEach(function (l) { c += l.count(); }); g.chip.textContent = c ? c + ' diubah' : ''; g.chip.hidden = !c; }); }
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
      var r = { el: el, s: s, ti: i }; rows.push(r); return r;
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

    /* ---------- daftar poin: tambah / hapus (misi, kartu, butir, pasal, baris tabel, paragraf) ---------- */
    var LSM = MI.lists || [], LST = [], lpanels = [];
    function clone0(x) { return JSON.parse(JSON.stringify(x || {})); }
    function lsLoad(k) {
      var m = LSM[k], a = (cur.id.ls || {})[k], b = (cur.en.ls || {})[k], base = b || a || {};
      if (base.n != null && base.n !== m.n) { a = b = null; base = {}; }   // halaman sudah berubah sejak disimpan: abaikan
      var s = { d: (base.d || []).slice(), a: [] }, n = Math.max(((a || {}).a || []).length, ((b || {}).a || []).length);
      function bl() { var z = []; for (var i = 0; i < m.tpl.t.length; i++) z.push(''); return z; }
      for (var j = 0; j < n; j++) {
        var x = ((a || {}).a || [])[j] || {}, y = ((b || {}).a || [])[j] || {};
        s.a.push({ t: { id: (x.t || bl()).slice(), en: (y.t || bl()).slice() }, im: clone0(x.im || y.im) });
      }
      return s;
    }
    function lsStore(k) {
      var s = LST[k], m = LSM[k];
      ['id', 'en'].forEach(function (L) {
        if (!s.d.length && !s.a.length) { if (cur[L].ls) { delete cur[L].ls[k]; if (!Object.keys(cur[L].ls).length) delete cur[L].ls; } return; }
        (cur[L].ls = cur[L].ls || {})[k] = { n: m.n, d: s.d.slice().sort(function (p, q) { return p - q; }),
          a: s.a.map(function (it) { var o = { t: it.t[L].slice() }; if (Object.keys(it.im).length) o.im = clone0(it.im); return o; }) };
      });
    }
    function refreshGone() {
      var gone = {};
      LSM.forEach(function (m, k) { if (LST[k]) LST[k].d.forEach(function (i) { m.items[i].t.forEach(function (x) { gone[x] = 1; }); }); });
      rows.forEach(function (r) { if (r.ti != null) r.el.classList.toggle('gone', !!gone[r.ti]); });
    }
    function listPanel(k) {
      var m = LSM[k], s = LST[k] = lsLoad(k), tpl = m.tpl, whole = !!(m.num && m.num.mode === 'whole'), pref = !!(m.num && m.num.mode === 'prefix');
      var T = { id: MI.lists[k].tpl.t, en: ME.lists[k].tpl.t }, unit = m.tag === 'TBODY' ? 'baris' : 'poin';
      var body = h('div'), chip = h('span', { class: 'chip' });
      function strip(t) { return pref ? t.replace(/^\d{1,3}\.\s*/, '') : t; }
      function pvItem(i) {
        var arr = m.items[i].t.map(function (x) { var e = cur[lead].t && cur[lead].t[x]; return e ? e.v : M[lead + '/' + slug].texts[x][3]; });
        if (whole) arr = arr.slice(1);
        var t = strip(arr.join(' ').trim()); return t.length > 90 ? t.slice(0, 87) + '…' : t;
      }
      function change() { lsStore(k); render(); refreshGone(); touch(); }
      function newItem(it, idx) {
        var box = h('div', { class: 'nw' }, h('div', { style: 'display:flex;align-items:center;justify-content:space-between;gap:10px' }, h('span', { class: 'tag', text: 'Baru: ' + unit + ' tambahan' }),
          h('button', { type: 'button', class: 'btn btn-line btn-sm', text: 'Hapus ' + unit + ' ini', onclick: function () { s.a.splice(idx, 1); change(); } })));
        tpl.t.forEach(function (tt, j) {
          if (j === 0 && whole) return;
          var ent = {}; langs.forEach(function (L) { var o = strip(T[L][j][1]); ent[L] = { orig: o, val: it.t[L][j] || '', long: false }; });
          var c = cols(ent, function (L, v) { it.t[L][j] = v.replace(/\s*\n\s*/g, ' ').trim(); lsStore(k); touch(); });
          langs.forEach(function (L) { c.ins[L].placeholder = strip(T[L][j][1]); });
          box.appendChild(h('span', { class: 'cap', text: A.TAGS[tt[0]] || 'Teks' })); box.appendChild(c.el);
        });
        (tpl.im || []).forEach(function (im, j) {
          var thumb = h('img', { class: 'thumb', alt: '', src: pv(it.im[j] || im[0]) }), f = h('input', { type: 'file', accept: 'image/*', hidden: true });
          f.addEventListener('change', function () {
            var fl = f.files[0]; f.value = ''; if (!fl) return; status('Memproses gambar…');
            A.fileToDataURL(fl).then(function (u) { it.im[j] = u; thumb.src = u; lsStore(k); touch(); }, function (e) { status(e.message, 'err'); });
          });
          box.appendChild(h('span', { class: 'cap', text: 'Gambar (berlaku untuk ID dan EN)' })); box.appendChild(thumb);
          box.appendChild(h('div', { class: 'btns' }, h('button', { type: 'button', class: 'btn btn-line btn-sm', text: 'Pilih gambar…', onclick: function () { f.click(); } }),
            h('button', { type: 'button', class: 'btn btn-line btn-sm', text: 'Pakai gambar contoh', onclick: function () { delete it.im[j]; thumb.src = pv(im[0]); lsStore(k); touch(); } }), f));
        });
        return box;
      }
      function render() {
        while (body.firstChild) body.removeChild(body.firstChild);
        m.items.forEach(function (it, i) {
          var gone = s.d.indexOf(i) > -1;
          body.appendChild(h('div', { class: 'li' + (gone ? ' gone' : '') }, h('span', { class: 'ln', text: String(i + 1) }), h('span', { class: 'lp', text: pvItem(i) }),
            h('button', { type: 'button', class: 'btn btn-line btn-sm', text: gone ? 'Batalkan hapus' : 'Hapus', onclick: function () { var p = s.d.indexOf(i); if (p > -1) s.d.splice(p, 1); else s.d.push(i); change(); } })));
        });
        s.a.forEach(function (it, idx) { body.appendChild(newItem(it, idx)); });
        body.appendChild(h('div', { class: 'btns', style: 'margin-top:10px' }, h('button', { type: 'button', class: 'btn btn-gold btn-sm', text: '+ Tambah ' + unit,
          onclick: function () { s.a.push({ t: { id: tpl.t.map(function () { return ''; }), en: tpl.t.map(function () { return ''; }) }, im: {} }); change(); } })));
        var c = s.d.length + s.a.length; chip.textContent = c ? c + ' diubah' : ''; chip.hidden = !c;
      }
      var el = h('div', { class: 'lst' }, h('div', { class: 'lh' }, h('b', { text: (unit === 'baris' ? 'Baris tabel' : 'Daftar poin') + ': ' + pvItem(0).slice(0, 40) + (pvItem(0).length > 40 ? '…' : '') }), chip),
        h('p', { class: 'hint', text: 'Tambah atau hapus ' + unit + ' di bagian ini. ' + (m.num ? 'Nomor mengikuti urutan secara otomatis. ' : '') + 'Isi teks ' + unit + ' yang sudah ada diubah di kolom di bawah daftar ini. Klik Simpan perubahan agar berlaku di kedua bahasa.' }), body);
      render();
      return { el: el, count: function () { return s.d.length + s.a.length; } };
    }
    LSM.forEach(function (m, k) { lpanels[k] = listPanel(k); });

    /* susun grup */
    var G = (mode === 'en' ? ME : MI).groups, gnodes = [];
    var tr = titleRow(); gnodes.push({ label: 'Judul tab browser', kind: null, rs: [tr] });
    G.forEach(function (g, gi) {
      var rs = [];
      MI.images.forEach(function (im) { if (im[1] === gi) rs.push(imageRow(im[0])); });
      MI.texts.forEach(function (t) { if (t[1] === gi) rs.push(textRow(t[0])); });
      var ln = []; LSM.forEach(function (m, k) { if (m.g === gi) ln.push(lpanels[k]); });
      gnodes.push({ label: g.label, kind: g.kind, rs: rs, gi: gi, ls: ln });
    });
    var firstSec = null;
    gnodes.forEach(function (n) { if (firstSec === null && n.kind === 'section') firstSec = n.gi; });
    var tgt = target != null && target !== '' ? +target : firstSec;
    var KIND = { header: 'Bagian atas', footer: 'Bagian bawah', other: 'Lainnya' };
    var list = h('div');
    gnodes.forEach(function (n) {
      var chip = h('span', { class: 'chip ch', hidden: true }), body = h('div', { class: 'gbody' }, (n.ls || []).map(function (l) { return l.el; }), n.rs.map(function (r) { return r.el; }));
      var det = h('details', { class: 'grp', id: n.gi != null ? 'g-' + n.gi : null, open: n.gi === tgt },
        h('summary', null, h('span', { class: 't' }, n.label, n.kind && KIND[n.kind] ? h('span', { class: 'kind', text: '  ·  ' + KIND[n.kind] }) : null), chip, h('span', { class: 'chip', text: n.rs.length + ' bidang' })), body);
      var g = { el: det, rows: n.rs, chip: chip, open0: n.gi === tgt, lists: n.ls || [] }; groups.push(g); list.appendChild(det);
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
    idle(); counts(); refreshGone();
    if (target != null && target !== '') setTimeout(function () { window.PASAdminEdit.jump(tgt); }, 30);
  }
  window.PASAdminEdit = { view: view, sidebar: sidebar, focal: focal, jump: null };
  reroute();
})();
