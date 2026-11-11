/* Pencarian di navbar: hasil tampil langsung saat mengetik; jika tidak ada yang cocok, tidak ada yang ditampilkan.
 * Sumber: teks semua halaman (admin-data.js + perubahan admin) dan konten dari admin (berita, lowongan, blok). */
(function () {
  'use strict';
  var st = document.querySelector('script[data-page]'); if (!st) return;
  var LANG = st.getAttribute('data-page').split('/')[0], ROOT = LANG === 'id' ? '../' : '';
  var nav = document.querySelector('header nav, nav'); if (!nav) return;
  var SLUGS = ['index', 'layanan', 'keberlanjutan', 'media', 'karir', 'kontak', 'legal'], NAME = {};
  nav.querySelectorAll('a[href]').forEach(function (a) { var m = a.getAttribute('href').match(/^([a-z]+)\.html$/); if (m) NAME[m[1]] = a.textContent.trim(); });
  SLUGS.forEach(function (s) { NAME[s] = NAME[s] || s; });
  var SKIP = { media: 2, karir: 6 }; // grup yang diganti data dari admin (berita, lowongan)
  var index = null;

  function build() {
    var out = [], M = window.PAS_MANIFEST || {}, ed = window.PASSite ? PASSite.load() : {};
    SLUGS.forEach(function (slug) {
      var key = LANG + '/' + slug, p = M[key]; if (!p) return;
      var e = (ed[key] || {}).t || {};
      p.texts.forEach(function (t) {
        var g = p.groups[t[1]]; if (!g || g.kind === 'header' || g.kind === 'footer' || SKIP[slug] === t[1]) return;
        var txt = t[3], r = e[t[0]]; if (r && r.o === txt) txt = r.v;
        if (txt.length > 2) out.push({ slug: slug, sec: g.label, text: txt });
      });
    });
    if (window.PASData) {
      PASData.list('berita').forEach(function (b) { var t = (b['judul_' + LANG] || '') + ' — ' + (b['isi_' + LANG] || ''); out.push({ slug: 'media', sec: b.kategori || '', text: t, hit: b['judul_' + LANG] }); });
      PASData.list('lowongan').forEach(function (l) { if (l.status !== 'Nonaktif') out.push({ slug: 'karir', sec: l.penempatan || '', text: (l['judul_' + LANG] || '') + ' · ' + [l.penempatan, l.jenis].filter(Boolean).join(' · '), hit: l['judul_' + LANG] }); });
      PASData.list('blok').forEach(function (b) { if (b.bahasa && b.bahasa !== 'semua' && b.bahasa !== LANG) return; out.push({ slug: b.halaman, sec: b.judul || '', text: (b.judul || '') + ' — ' + (b.isi || '').replace(/\s+/g, ' '), hit: b.judul }); });
    }
    return out;
  }

  function el(t, css, txt) { var e = document.createElement(t); if (css) e.style.cssText = css; if (txt != null) e.textContent = txt; return e; }
  function snippet(text, q) {
    var i = text.toLowerCase().indexOf(q[0]), a = Math.max(0, i - 40), s = text.slice(a, a + 130);
    return (a > 0 ? '…' : '') + s + (a + 130 < text.length ? '…' : '');
  }
  function mark(parent, text, q) {
    var re = new RegExp('(' + q.map(function (w) { return w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }).join('|') + ')', 'gi');
    text.split(re).forEach(function (part, i) { parent.appendChild(i % 2 ? el('mark', 'background:#F6D99B;color:inherit;padding:0', part) : document.createTextNode(part)); });
  }

  var wrap = el('div', 'position:relative'); wrap.setAttribute('data-noedit', '');
  var inp = el('input', 'min-height:38px;width:190px;max-width:44vw;border:1px solid #A9BACB;border-radius:3px;padding:0 12px;font:inherit;font-size:14px;color:#1C2733;background:#fff');
  inp.type = 'search'; inp.placeholder = LANG === 'id' ? 'Cari…' : 'Search…'; inp.setAttribute('aria-label', inp.placeholder); inp.autocomplete = 'off';
  var box = el('div', 'display:none;position:absolute;right:0;top:44px;width:min(420px,92vw);max-height:70vh;overflow:auto;background:#fff;border:1px solid #BCCBDA;border-radius:3px;box-shadow:0 10px 30px rgba(10,34,64,.2);z-index:300');
  box.setAttribute('role', 'listbox'); wrap.appendChild(inp); wrap.appendChild(box); nav.appendChild(wrap);

  function run() {
    var q = inp.value.toLowerCase().split(/\s+/).filter(function (w) { return w.length > 1 || /\d/.test(w); });
    box.textContent = ''; box.style.display = 'none'; if (!q.length) return;
    index = index || build();
    var res = index.filter(function (r) { var t = r.text.toLowerCase(); return q.every(function (w) { return t.indexOf(w) > -1; }); }).slice(0, 8);
    if (!res.length) return; // tidak ada hasil: tidak menampilkan apa pun
    res.forEach(function (r) {
      var a = el('a', 'display:block;padding:10px 14px;border-bottom:1px solid #EEF3F7;text-decoration:none;color:#1C2733;font-size:14px;line-height:1.45');
      a.href = r.slug + '.html'; a.setAttribute('role', 'option');
      var h = el('div', 'font-weight:700;color:#0A2240;font-size:13px', NAME[r.slug] + (r.sec ? ' › ' + r.sec : '')); a.appendChild(h);
      var p = el('div', 'color:#56697E'); mark(p, snippet(r.text, q), q); a.appendChild(p);
      a.addEventListener('click', function () { try { sessionStorage.setItem('pas_find', JSON.stringify({ q: q[0], t: r.hit || r.text.slice(0, 60) })); } catch (e) {} });
      box.appendChild(a);
    });
    box.style.display = 'block';
  }
  inp.addEventListener('input', run);
  inp.addEventListener('focus', run);
  inp.addEventListener('keydown', function (e) { if (e.key === 'Escape') { inp.value = ''; run(); } });
  document.addEventListener('click', function (e) { if (!wrap.contains(e.target)) box.style.display = 'none'; });

  /* di halaman tujuan: gulir ke teks yang dicari dan sorot sebentar */
  function jump() {
    var f; try { f = JSON.parse(sessionStorage.getItem('pas_find')); sessionStorage.removeItem('pas_find'); } catch (e) {} if (!f) return;
    var w = document.createTreeWalker(document.body, 4, null), n, key = f.t.toLowerCase().slice(0, 40);
    while ((n = w.nextNode())) {
      var p = n.parentNode; if (!p || /^(SCRIPT|STYLE)$/.test(p.nodeName) || p.closest('[data-noedit]')) continue;
      if (n.nodeValue.toLowerCase().indexOf(key) > -1 || (f.q && n.nodeValue.toLowerCase().indexOf(f.q) > -1 && key.length < 3)) {
        p.scrollIntoView({ block: 'center' }); var old = p.style.cssText; p.style.cssText += ';background:#F6D99B;transition:background 1.5s'; setTimeout(function () { p.style.background = ''; }, 1800); return;
      }
    }
  }
  if (document.readyState === 'complete') setTimeout(jump, 60); else window.addEventListener('load', function () { setTimeout(jump, 60); });
})();
