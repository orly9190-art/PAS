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

  function textNodes(doc) {
    var out = [];
    var walker = doc.createTreeWalker(doc.body, 4 /* SHOW_TEXT */, null);
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

  function images(doc) {
    return Array.prototype.filter.call(doc.body.querySelectorAll('img'), function (im) {
      return !im.closest('[data-noedit]');
    });
  }

  function apply(pageKey) {
    var e = load()[pageKey];
    if (!e) return;

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
      });
    }
  }

  global.PASSite = { KEY: KEY, load: load, save: save, textNodes: textNodes, images: images, apply: apply };

  // Penerapan otomatis di halaman publik: <script src="..." data-page="en/index">
  var s = document.currentScript;
  var page = s && s.getAttribute('data-page');
  if (page) apply(page);
})(window);
