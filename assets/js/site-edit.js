/*
 * PT Prima Armada Samudra - penerap perubahan dari halaman admin.
 *
 * Perubahan disimpan di localStorage browser (kunci KEY) oleh admin/index.html,
 * lalu skrip ini menerapkannya ke halaman saat dimuat.
 *
 * Elemen yang bisa diubah dikenali dari URUTANNYA di halaman:
 *   - teks  : setiap node teks yang tidak kosong di dalam <body>
 *   - gambar: setiap <img>
 * Setiap perubahan menyimpan teks/gambar aslinya (o). Jika isi halaman sudah
 * berbeda dari aslinya (misalnya file HTML diedit), perubahan itu dilewati
 * supaya tidak salah menimpa teks lain.
 *
 * Elemen dengan atribut data-noedit (mis. tombol Login) tidak ikut dihitung.
 *
 * Daftar poin (misi, kartu, butir sertifikat, pasal legal, baris tabel, dst.) dikenali
 * otomatis oleh lists(). Perubahan struktur disimpan di e.ls[nomorDaftar] = { n, d, a }:
 *   n = jumlah poin asli (pengaman), d = nomor poin asli yang dihapus,
 *   a = poin baru [{ t: [teks...], im: {nomorGambar: dataURL} }] (disalin dari poin contoh).
 * Penghapusan/penambahan diterapkan SETELAH perubahan teks & gambar, supaya nomor teks tetap stabil.
 */
(function (global) {
  'use strict';

  var KEY = 'pas_site_edits_v1';

  function load() {
    try { return JSON.parse(global.localStorage.getItem(KEY)) || {}; }
    catch (e) { return {}; }
  }

  // Bisa melempar error (mis. penyimpanan penuh); pemanggil yang menangani.
  function save(all) {
    global.localStorage.setItem(KEY, JSON.stringify(all));
  }

  function textNodesIn(root) {
    var out = [];
    var walker = root.ownerDocument.createTreeWalker(root, 4 /* SHOW_TEXT */, null);
    var n;
    while ((n = walker.nextNode())) {
      if (!n.nodeValue.trim()) continue;
      var p = n.parentNode;
      if (!p || /^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE)$/.test(p.nodeName)) continue;
      if (p.closest && p.closest('[data-noedit]')) continue;
      out.push(n);
    }
    return out;
  }

  function textNodes(doc) { return textNodesIn(doc.body); }

  function images(doc) {
    return Array.prototype.filter.call(doc.body.querySelectorAll('img'), function (im) {
      return !im.closest('[data-noedit]');
    });
  }


  /* ---------- daftar poin ---------- */
  var ITEM_TAGS = { LI: 1, DIV: 1, P: 1, FIGURE: 1, TR: 1 };

  function tagSet(el) {
    var m = {};
    textNodesIn(el).forEach(function (n) { m[n.parentNode.nodeName] = 1; });
    return Object.keys(m);
  }
  function similar(a, b) {
    var i = 0;
    a.forEach(function (t) { if (b.indexOf(t) > -1) i++; });
    var u = a.length + b.length - i;
    return u > 0 && i / u >= 0.5;
  }
  // Poin yang boleh ditambah/dihapus: punya teks, bukan formulir, bukan daftar lowongan
  // (lowongan & berita diatur lewat Kelola Konten).
  function okItem(el) {
    if (!ITEM_TAGS[el.nodeName]) return false;
    if (el.querySelector('form,input,select,textarea,button,iframe')) return false;
    if (el.querySelector('a[href$="kontak.html"]') && el.querySelector('h3')) return false;
    return textNodesIn(el).length > 0;
  }
  // Barisan anak berurutan terpanjang yang bentuknya mirip.
  function bestRun(kids) {
    var best = [], run = [], ts = null;
    kids.forEach(function (k) {
      var ok = okItem(k), t = ok ? tagSet(k) : null;
      if (ok && run.length && k.nodeName === run[0].nodeName && similar(ts, t) &&
          (k.nodeName !== 'P' || k.getAttribute('style') === run[0].getAttribute('style'))) { run.push(k); return; }   // paragraf: gaya harus sama (bukan label + isi)
      if (run.length > best.length) best = run;
      run = ok ? [k] : []; ts = t;
    });
    return run.length > best.length ? run : best;
  }
  // Poin bernomor (1,2,3 atau "1. Judul"): nomor ikut otomatis saat ada tambah/hapus.
  function numInfo(run) {
    var vals = [], mode = null, pad = 0, els = [];
    for (var i = 0; i < run.length; i++) {
      var n0 = textNodesIn(run[i])[0], t = n0 ? n0.nodeValue.trim() : '', m;
      if ((m = /^(\d{1,3})$/.exec(t))) { if (mode && mode !== 'whole') return null; mode = 'whole'; if (!vals.length && t.length > 1 && t.charAt(0) === '0') pad = t.length; }
      else if ((m = /^(\d{1,3})\.\s+\S/.exec(t))) { if (mode && mode !== 'prefix') return null; mode = 'prefix'; }
      else continue;
      vals.push(+m[1]); els.push(run[i]);
    }
    if (vals.length < 2) return null;
    for (var j = 1; j < vals.length; j++) if (vals[j] !== vals[j - 1] + 1) return null;
    return { mode: mode, start: vals[0], pad: pad, els: els };
  }

  function lists(doc) {
    var out = [], taken = [];
    Array.prototype.forEach.call(doc.body.querySelectorAll('ul,ol,div,tbody'), function (c) {
      if (!c.closest('section') || c.closest('footer') || c.closest('[data-noedit]') || c.closest('form')) return;
      var run = bestRun(Array.prototype.slice.call(c.children));
      if (run.length < 2) return;
      // div di dalam sebuah poin (mis. angka + label dalam kartu) bukan daftar tersendiri
      if (c.nodeName === 'DIV' && taken.some(function (it) { return it.contains(c); })) return;
      var cnt = run.map(function (k) { return textNodesIn(k).length; }), mx = Math.max.apply(null, cnt), ti = cnt.lastIndexOf(mx);
      taken = taken.concat(run);
      out.push({ el: c, items: run, ti: ti, tplEl: run[ti], num: numInfo(run) });
    });
    return out;
  }

  function setText(n, v) {
    var cur = n.nodeValue;
    n.nodeValue = cur.match(/^\s*/)[0] + v + cur.match(/\s*$/)[0];
  }

  function applyLists(LS, ls) {
    Object.keys(ls).forEach(function (k) {
      var l = LS[+k], r = ls[k];
      if (!l || !r || l.items.length !== r.n) return;           // halaman sudah berubah: lewati
      var ref = l.tplEl, added = [], nm = l.num;
      (r.a || []).forEach(function (a) {
        var tx = a.t || [], im = a.im || {}, any = Object.keys(im).length > 0;
        tx.forEach(function (v, i) { if ((v || '').trim() && !(nm && nm.mode === 'whole' && i === 0)) any = true; });
        if (!any) return;                                       // poin kosong tidak ditampilkan
        var c = l.tpl.cloneNode(true);
        textNodesIn(c).forEach(function (n, i) { if (!(nm && nm.mode === 'whole' && i === 0)) setText(n, String(tx[i] || '').trim()); });
        Array.prototype.forEach.call(c.querySelectorAll('img'), function (el, i) {
          if (!im[i]) return;
          el.removeAttribute('srcset'); el.setAttribute('src', im[i]);
        });
        ref.parentNode.insertBefore(c, ref.nextSibling); ref = c; added.push(c);
      });
      (r.d || []).forEach(function (i) { var it = l.items[i]; if (it && it.parentNode) it.parentNode.removeChild(it); });
      if (nm) {
        var seq = Array.prototype.filter.call(l.el.children, function (ch) { return nm.els.indexOf(ch) > -1 || added.indexOf(ch) > -1; });
        seq.forEach(function (ch, j) {
          var n0 = textNodesIn(ch)[0]; if (!n0) return;
          var num = String(nm.start + j); while (num.length < nm.pad) num = '0' + num;
          setText(n0, nm.mode === 'whole' ? num : num + '. ' + n0.nodeValue.trim().replace(/^\d{1,3}\.\s*/, ''));
        });
      }
    });
  }

  function apply(pageKey) {
    var e = load()[pageKey];
    if (!e) return;

    // poin contoh disalin dari isi asli, sebelum teks diubah
    var LS = null;
    if (e.ls && Object.keys(e.ls).length) {
      LS = lists(document);
      LS.forEach(function (l) { l.tpl = l.tplEl.cloneNode(true); });
    }

    if (e.title && document.title === e.title.o) document.title = e.title.v;

    if (e.t) {
      var tn = textNodes(document);
      Object.keys(e.t).forEach(function (i) {
        var r = e.t[i], n = tn[+i];
        if (!n || n.nodeValue.trim() !== r.o) return;
        var cur = n.nodeValue;
        n.nodeValue = cur.match(/^\s*/)[0] + r.v + cur.match(/\s*$/)[0];
      });
    }

    if (e.im) {
      var im = images(document);
      Object.keys(e.im).forEach(function (i) {
        var r = e.im[i], el = im[+i];
        if (!el || el.getAttribute('src') !== r.o) return;
        el.removeAttribute('srcset');
        el.setAttribute('src', r.v);
        if (r.f) el.style.objectPosition = r.f;  // fokus gambar (mis. "40% 25%")
      });
    }

    if (LS) applyLists(LS, e.ls);
  }

  global.PASSite = { KEY: KEY, load: load, save: save, textNodes: textNodes, textNodesIn: textNodesIn, images: images, lists: lists, apply: apply };

  // Penerapan otomatis di halaman publik: <script src="..." data-page="en/index">
  var s = document.currentScript;
  var page = s && s.getAttribute('data-page');
  if (page) apply(page);
})(window);
