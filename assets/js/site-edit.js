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
 * Foto, posisi foto, warna latar, dan warna tulisan disimpan BERSAMA untuk versi
 * EN dan ID (kunci "v/<halaman>"), karena susunan kedua versi sama. Teks tetap
 * per bahasa. Data lama per bahasa dipindahkan otomatis ke penyimpanan bersama.
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
    all.__ts = Date.now(); // kapan perubahan terakhir dibuat
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
    return { t: t, im: m, sec: s, geser: movable(doc) };
  }

  /* ---------- urutan bagian (naik/turun) ---------- */
  // Bagian yang bisa dipindah: <section> tingkat atas yang berinduk sama.
  function movable(doc) {
    var all = sections(doc);
    if (!all.length) return [];
    var par = all[0].parentNode;
    return all.filter(function (el) { return el.parentNode === par; });
  }
  function urutanSah(ord, n) {
    if (!Array.isArray(ord) || ord.length !== n) return false;
    var lihat = {};
    for (var i = 0; i < n; i++) { if (typeof ord[i] !== 'number' || ord[i] < 0 || ord[i] >= n || lihat[ord[i]]) return false; lihat[ord[i]] = 1; }
    return true;
  }
  // ord[k] = nomor asli bagian yang kini menempati slot ke-k
  function reorder(ord) {
    var L = global.PASSite && global.PASSite.idx && global.PASSite.idx.geser;
    if (!L || !L.length) return;
    if (!urutanSah(ord, L.length)) ord = L.map(function (x, i) { return i; });
    var par = L[0].parentNode, doc = par.ownerDocument;
    var tanda = L.map(function (el) { var c = doc.createComment('pas-slot'); par.insertBefore(c, el); return c; });
    var urutDom = Array.prototype.filter.call(par.childNodes, function (n) { return tanda.indexOf(n) >= 0; });
    urutDom.forEach(function (c, k) { par.replaceChild(L[ord[k]], c); });
  }

  /* ---------- penyimpanan bersama EN + ID ---------- */
  var VIS = ['im', 'pos', 'sec', 'fg'];
  function vkey(pageKey) { return 'v/' + String(pageKey).split('/')[1]; }
  function pairKey(pageKey) { var p = String(pageKey).split('/'); return (p[0] === 'en' ? 'id/' : 'en/') + p[1]; }
  function norm(s) {
    s = String(s || '');
    if (/^data:/.test(s)) return s;
    return s.replace(/^(\.\.\/)+/, '').replace(/-(en|id)(\.[a-z0-9]+)$/i, '$2');
  }
  function origSrc(el) { return el.getAttribute('data-bundle-img') || el.getAttribute('src') || ''; }
  function cocokSrc(el, o) {
    return norm(origSrc(el)) === norm(o) || el.getAttribute('src') === o;
  }

  // Pindahkan foto/warna yang masih tersimpan per bahasa ke penyimpanan bersama.
  function migrate(all, pageKey, doc) {
    var vk = vkey(pageKey), ims = images(doc), ubah = false;
    [pairKey(pageKey), pageKey].forEach(function (k) {
      var e = all[k];
      if (!e) return;
      VIS.forEach(function (f) {
        if (!e[f]) return;
        var v = all[vk] || (all[vk] = {});
        v[f] = v[f] || {};
        var sisa = {};
        Object.keys(e[f]).forEach(function (i) {
          var val = e[f][i];
          // foto bertanda data-ed-lang tetap tersimpan per bahasa
          if ((f === 'im' || f === 'pos') && ims[+i] && ims[+i].hasAttribute('data-ed-lang')) { sisa[i] = val; return; }
          if (f === 'im') {
            var el = ims[+i];
            if (!el || !val) return;
            if (!(/^data:/.test(val.o) || norm(val.o) === norm(origSrc(el)))) return;
            val = { o: norm(origSrc(el)), v: val.v };
          }
          v[f][i] = val;
        });
        if (Object.keys(sisa).length) { if (Object.keys(sisa).length !== Object.keys(e[f]).length) ubah = true; e[f] = sisa; }
        else { delete e[f]; ubah = true; }
      });
      if (!Object.keys(e).length) delete all[k];
    });
    if (ubah) { try { save(all); } catch (err) { /* penyimpanan penuh: tetap terapkan */ } }
    return all;
  }

  function apply(pageKey) {
    if (global.PASSite) global.PASSite.idx = buildIndex(document);
    var all = load();
    // Halaman hasil "Unduh website + perubahan" sudah memuat perubahan sampai saat ekspor.
    var exp = +(document.documentElement.getAttribute('data-pas-export') || 0);
    if (exp && (+all.__ts || 0) <= exp) return;
    all = migrate(all, pageKey, document);
    var own = all[pageKey] || {}, sh = all[vkey(pageKey)] || {};
    var e = {};
    Object.keys(own).forEach(function (k) { e[k] = own[k]; });
    VIS.forEach(function (k) {
      if (!sh[k]) return;
      // foto bertanda data-ed-lang boleh berbeda per bahasa: milik bahasa ini didahulukan
      var m = {};
      Object.keys(sh[k]).forEach(function (i) { m[i] = sh[k][i]; });
      if (own[k]) Object.keys(own[k]).forEach(function (i) { m[i] = own[k][i]; });
      e[k] = m;
    });
    if (!Object.keys(e).length && !sh.ord) return;

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
        if (!el || !cocokSrc(el, r.o)) return;
        if (!el.hasAttribute('data-orig-src')) el.setAttribute('data-orig-src', el.getAttribute('src') || '');
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

    if (sh.ord) reorder(sh.ord);
  }

  global.PASSite = { KEY: KEY, load: load, save: save, vkey: vkey, pairKey: pairKey, norm: norm, origSrc: origSrc, textNodes: textNodes, images: images, sections: sections, buildIndex: buildIndex, apply: apply, reorder: reorder, applyFg: applyFg, clearFg: clearFg };

  // Penerapan otomatis di halaman publik: <script src="..." data-page="en/index">
  var s = document.currentScript;
  var page = s && s.getAttribute('data-page');
  if (page) apply(page);
})(window);
