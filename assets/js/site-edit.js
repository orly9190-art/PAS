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

  function sections(doc) {
    return Array.prototype.filter.call(doc.body.querySelectorAll('section'), function (el) {
      return !el.closest('[data-noedit]');
    });
  }


  /* ---------- warna tulisan per bagian ---------- */
  // Tulisan yang diwarnai: elemen di dalam bagian yang punya teks langsung dan
  // TIDAK berada di dalam kotak berlatar sendiri (kartu putih, tombol), supaya
  // tombol dan kartu tetap terbaca. Teks sekunder (paragraf, daftar) dibuat
  // sedikit lebih pudar agar hierarki judul tetap terasa.
  var SEKUNDER = /^(P|LI|FIGCAPTION|DD|SMALL|TD|LABEL)$/;
  var MIX = !!(global.CSS && global.CSS.supports && global.CSS.supports('color', 'color-mix(in srgb, red 50%, transparent)'));

  function punyaTeks(el) {
    for (var c = el.firstChild; c; c = c.nextSibling) {
      if (c.nodeType === 3 && c.nodeValue.trim()) return true;
      if (c.nodeType === 1 && c.classList && c.classList.contains('pas-ed-t') && c.textContent.trim()) return true;
    }
    return false;
  }

  function transparan(v) { return !v || v === 'transparent' || /rgba\(\s*0,\s*0,\s*0,\s*0\s*\)/.test(v); }

  function latarSendiri(el, sek) {
    for (var x = el; x && x !== sek; x = x.parentElement) {
      var cs = global.getComputedStyle(x);
      if (!transparan(cs.backgroundColor)) return true;
      if (cs.backgroundImage && cs.backgroundImage !== 'none') return true;
    }
    return false;
  }

  function targetTulisan(sek) {
    return Array.prototype.filter.call(sek.querySelectorAll('*'), function (el) {
      if (el.closest('svg,[data-pas-editor],[data-noedit]')) return false;
      if (/^(SCRIPT|STYLE|IMG|INPUT|TEXTAREA|SELECT|OPTION|BUTTON)$/.test(el.tagName)) return false;
      if (el.classList.contains('pas-ed-t')) return false;
      return punyaTeks(el) && !latarSendiri(el, sek);
    });
  }

  function applyFg(sek, warna) {
    targetTulisan(sek).forEach(function (el) {
      if (!el.hasAttribute('data-orig-fg')) {
        el.setAttribute('data-orig-fg', el.style.getPropertyValue('color') + '|' + el.style.getPropertyPriority('color'));
      }
      var w = (MIX && SEKUNDER.test(el.tagName)) ? 'color-mix(in srgb, ' + warna + ' 84%, transparent)' : warna;
      el.style.setProperty('color', w, 'important');
    });
  }

  function clearFg(sek) {
    Array.prototype.forEach.call(sek.querySelectorAll('[data-orig-fg]'), function (el) {
      var p = el.getAttribute('data-orig-fg').split('|');
      el.style.removeProperty('color');
      if (p[0]) el.style.setProperty('color', p[0], p[1] || '');
      el.removeAttribute('data-orig-fg');
    });
  }

  // Peta urutan dibuat SEKALI saat halaman dimuat, sebelum skrip lain menyuntikkan
  // elemen (tombol WhatsApp, kartu berita dari panel admin, dll). Editor di halaman
  // memakai peta ini supaya nomor urut selalu sama dengan yang dipakai apply().
  function buildIndex(doc) {
    var t = new Map(), m = new Map(), s = new Map();
    textNodes(doc).forEach(function (n, i) { t.set(n, i); });
    images(doc).forEach(function (el, i) { m.set(el, i); });
    sections(doc).forEach(function (el, i) { s.set(el, i); });
    return { t: t, im: m, sec: s };
  }

  function apply(pageKey) {
    if (global.PASSite) global.PASSite.idx = buildIndex(document);
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

    if (e.pos) {
      var ip = images(document);
      Object.keys(e.pos).forEach(function (i) {
        var el = ip[+i];
        if (!el) return;
        if (!el.hasAttribute('data-orig-pos')) el.setAttribute('data-orig-pos', el.style.objectPosition || '');
        el.style.objectPosition = e.pos[i];
      });
    }

    if (e.sec) {
      var sc = sections(document);
      Object.keys(e.sec).forEach(function (i) {
        var el = sc[+i];
        if (!el) return;
        if (!el.hasAttribute('data-orig-bg')) el.setAttribute('data-orig-bg', el.style.background || '');
        el.style.background = e.sec[i];
      });
    }

    if (e.fg) {
      var sf = sections(document);
      Object.keys(e.fg).forEach(function (i) {
        var el = sf[+i];
        if (el) applyFg(el, e.fg[i]);
      });
    }
  }

  global.PASSite = { KEY: KEY, load: load, save: save, textNodes: textNodes, images: images, sections: sections, buildIndex: buildIndex, apply: apply, applyFg: applyFg, clearFg: clearFg };

  // Penerapan otomatis di halaman publik: <script src="..." data-page="en/index">
  var s = document.currentScript;
  var page = s && s.getAttribute('data-page');
  if (page) apply(page);
})(window);
