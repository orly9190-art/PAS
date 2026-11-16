/*
 * PT Prima Armada Samudra - EDITOR TAMPILAN LANGSUNG
 * v8: + SEMUA salinan (cp/ns/add) + anak-anaknya bisa diedit & disimpan
 *     + keyOf/elOf mendukung path relatif untuk anak cp/ns
 *     + mk() mengaplikasikan style add saat render
 *     + render() mengaplikasikan W.x untuk path relatif cp/ns
 *     + applyBgImage reset bersih
 *     + cleanHtml mempertahankan <br>
 *     + drag-to-move, keyboard shortcut, copy-paste multi-select
 */
(function (g, d) {
  'use strict';

  var KEY = 'pas_live_v1', SESSION = 'pas_admin_session';
  var SIMKEY = 'pas_live_sim_v1', UIKEY = 'pas_live_ui_v1';
  var GKEY = 'pas_global_v1';
  var SYNKEY = 'pas_sync_v1';
  var CLIPKEY = 'pas_clip_v4';
  var SIM = g.name === 'pas-sim';
  var tag = d.querySelector('script[data-page]');
  var PAGE = tag && tag.getAttribute('data-page');
  if (!PAGE) return;

  var DEEP = '#0A2240', SAND = '#C9872F';
  var SW = ['#FFFFFF', '#F3F7FA', '#E2E8F0', '#64748B', '#334155', '#0F172A', '#DBEAFE', '#2E9BD6',
            '#13508C', '#0A2240', '#DCFCE7', '#15803D', '#FEF3C7', '#C9872F', '#FECACA', '#DC2626'];
  var KINDS = [['h', 'Judul'], ['p', 'Paragraf'], ['ul', 'Poin-poin'], ['img', 'Gambar'], ['vid', 'Video'],
               ['btn', 'Tombol'], ['card', 'Kotak sorotan'], ['hr', 'Garis'], ['sp', 'Jarak kosong']];
  var NAMA = { h: 'Judul', p: 'Paragraf', ul: 'Poin-poin', img: 'Gambar', vid: 'Video', btn: 'Tombol',
               card: 'Kotak sorotan', hr: 'Garis', sp: 'Jarak kosong' };
  var PLACEHOLDER = 'data:image/svg+xml;utf8,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450"><rect width="100%" height="100%" fill="#E2E8F0"/>' +
    '<text x="50%" y="50%" fill="#64748B" font-family="Arial" font-size="28" text-anchor="middle">Klik "Ganti gambar" di panel</text></svg>');

  var FONTS = [
    ['', 'Bawaan situs'],
    ['Barlow,"Segoe UI",Arial,sans-serif', 'Barlow'],
    ['Arial,Helvetica,sans-serif', 'Arial'],
    ['Verdana,Geneva,sans-serif', 'Verdana'],
    ['"Trebuchet MS",Tahoma,sans-serif', 'Trebuchet MS'],
    ['Georgia,"Times New Roman",serif', 'Georgia'],
    ['"Times New Roman",Times,serif', 'Times New Roman'],
    ['"Courier New",Courier,monospace', 'Courier New'],
    ['Poppins,Arial,sans-serif', 'Poppins (Google Fonts)'],
    ['Roboto,Arial,sans-serif', 'Roboto (Google Fonts)'],
    ['Montserrat,Arial,sans-serif', 'Montserrat (Google Fonts)'],
    ['"Open Sans",Arial,sans-serif', 'Open Sans (Google Fonts)'],
    ['Lato,Arial,sans-serif', 'Lato (Google Fonts)'],
    ['"Playfair Display",Georgia,serif', 'Playfair Display (Google Fonts)'],
    ['Merriweather,Georgia,serif', 'Merriweather (Google Fonts)']
  ];
  var GF = { 'Poppins': 'Poppins:wght@400;500;600;700', 'Roboto': 'Roboto:wght@400;500;700', 'Montserrat': 'Montserrat:wght@400;500;600;700',
             'Open Sans': 'Open+Sans:wght@400;500;600;700', 'Lato': 'Lato:wght@400;700', 'Playfair Display': 'Playfair+Display:wght@400;600;700',
             'Merriweather': 'Merriweather:wght@400;700' };
  var WEIGHTS = [['', 'Bawaan'], ['400', 'Normal'], ['500', 'Sedang'], ['600', 'Semi tebal'], ['700', 'Tebal'], ['800', 'Sangat tebal']];
  var DEVICES = [['Ponsel kecil', 360, 640], ['Ponsel', 390, 844], ['Tablet', 768, 1024], ['Laptop', 1280, 800], ['Desktop', 1440, 900]];
  var SELCSS = 'width:100%;padding:8px;border:1px solid #CBD5E1;border-radius:3px;font:inherit;background:#fff;color:' + DEEP + ';box-sizing:border-box';

  /* ------------------------------------------------------------ utilitas */
  function qa(s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function uid() { return 'n' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function safeHtml(h) { return String(h == null ? '' : h).replace(/<(?!br\s*\/?>)[^>]*>/gi, ''); }
  function safeUrl(u) {
    u = String(u || '').trim();
    return /^(https?:|mailto:|tel:|data:video\/|data:image\/|[\w.\/#?=&%-]+$)/i.test(u) ? u : '';
  }
  function ui(t, css, txt) {
    var x = d.createElement(t);
    if (css) x.style.cssText = css;
    if (txt != null) x.textContent = txt;
    x.setAttribute('data-pas-editor', ''); x.setAttribute('data-noedit', '');
    return x;
  }
  function hex(c, fb) {
    var m = /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?/.exec(c || '');
    if (!m || (m[4] !== undefined && +m[4] === 0)) return fb || '#ffffff';
    return '#' + [m[1], m[2], m[3]].map(function (n) { return ('0' + (+n).toString(16)).slice(-2); }).join('');
  }
  function lum(h) {
    h = (h || '').replace('#', '');
    if (h.length !== 6) return 1;
    return (0.299 * parseInt(h.substr(0, 2), 16) + 0.587 * parseInt(h.substr(2, 2), 16) + 0.114 * parseInt(h.substr(4, 2), 16)) / 255;
  }

  /* ------------------------------------------------------------ data */
  function loadAll() { try { return JSON.parse(g.localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function loadSim() { try { return JSON.parse(g.sessionStorage.getItem(SIMKEY)) || {}; } catch (e) { return {}; } }
  function loadGlobal() { try { return JSON.parse(g.localStorage.getItem(GKEY)) || {}; } catch (e) { return {}; } }
  function saveGlobal(m) { try { g.localStorage.setItem(GKEY, JSON.stringify(m)); } catch (e) {} }
  function loadSync() { try { return JSON.parse(g.localStorage.getItem(SYNKEY)) || {}; } catch (e) { return {}; } }
  function saveSync(m) { try { g.localStorage.setItem(SYNKEY, JSON.stringify(m)); } catch (e) {} }
  function metaBase() { var m = d.querySelector('meta[name="pas-live-base"]'); return m ? m.getAttribute('content') : ''; }
  function blank() { return { base: metaBase(), st: {}, x: {}, ad: {}, ns: [], cp: [] }; }
  function isEmpty(m) {
    return !Object.keys(m.st).length && !Object.keys(m.x).length &&
           !Object.keys(m.ad).some(function (k) { return m.ad[k].length; }) &&
           !(m.ns && m.ns.length) &&
           !(m.cp && m.cp.length);
  }
  var rec = (SIM ? loadSim() : loadAll())[PAGE];
  var SAVED = rec && (rec.base || '') === metaBase() ? rec : null;
  var W = SAVED ? clone(SAVED) : blank();
  W.st = W.st || {}; W.x = W.x || {}; W.ad = W.ad || {}; W.ns = W.ns || []; W.cp = W.cp || [];
  var SAVED_STR = JSON.stringify(W);

  function pageLang() { return /(^|\/)id\//.test(PAGE) ? 'id' : 'en'; }
  function pageSibling() { return PAGE.indexOf('id/') === 0 ? PAGE.slice(3) : 'id/' + PAGE; }

  /* ------------------------------------------------------------ alamat elemen (path) */
  function kids(p) {
    return Array.prototype.filter.call(p.children, function (c) {
      return !c.hasAttribute('data-le-add') && !c.hasAttribute('data-pas-editor') && !c.hasAttribute('data-runtime') &&
             !c.hasAttribute('data-noedit') && !c.hasAttribute('data-le-ns') && !c.hasAttribute('data-le-cp') &&
             !/^(SCRIPT|STYLE)$/.test(c.tagName);
    });
  }
  function pathOf(el) {
    var a = [];
    while (el && el !== d.body) { a.unshift(el.tagName.toLowerCase() + ':' + kids(el.parentNode).indexOf(el)); el = el.parentNode; }
    return a.join('/');
  }
  function byPath(s) {
    var el = d.body, parts = s.split('/');
    for (var i = 0; i < parts.length; i++) {
      var m = /^([a-z0-9]+):(\d+)$/.exec(parts[i]);
      if (!m) return null;
      el = kids(el)[+m[2]];
      if (!el || el.tagName.toLowerCase() !== m[1]) return null;
    }
    return el;
  }

  /* --- path relatif untuk anak cp/ns --- */
  function pathRel(root, el) {
    var a = [];
    while (el && el !== root) {
      a.unshift(el.tagName.toLowerCase() + ':' + Array.prototype.indexOf.call(el.parentNode.children, el));
      el = el.parentNode;
    }
    return a.join('/');
  }
  function byPathRel(root, s) {
    var el = root, parts = s.split('/');
    for (var i = 0; i < parts.length; i++) {
      var m = /^([a-z0-9]+):(\d+)$/.exec(parts[i]);
      if (!m) return null;
      el = el.children[+m[2]];
      if (!el || el.tagName.toLowerCase() !== m[1]) return null;
    }
    return el;
  }

  /* ------------------------------------------------------------ keyOf / elOf (v8) */
  function keyOf(el) {
    if (!el) return null;
    // root cp
    if (el.hasAttribute('data-le-cp')) return 'cp:' + el.getAttribute('data-le-cp');
    // root ns
    if (el.hasAttribute('data-le-ns')) return 'ns:' + el.getAttribute('data-le-ns');
    // item add (bisa di dalam cp/ns atau langsung di section)
    var a = el.closest('[data-le-add]');
    if (a) return 'add:' + a.getAttribute('data-le-add');
    // anak dari cp
    var cp = el.closest('[data-le-cp]');
    if (cp) {
      var rel = pathRel(cp, el);
      return 'cp:' + cp.getAttribute('data-le-cp') + '|' + rel;
    }
    // anak dari ns
    var ns = el.closest('[data-le-ns]');
    if (ns) {
      var rel2 = pathRel(ns, el);
      return 'ns:' + ns.getAttribute('data-le-ns') + '|' + rel2;
    }
    // halaman asli
    return pathOf(el);
  }

  function elOf(key) {
    if (!key) return null;
    if (key.indexOf('add:') === 0) return d.querySelector('[data-le-add="' + key.slice(4) + '"]');
    if (key.indexOf('ns:') === 0) {
      var rest = key.slice(3), pipe = rest.indexOf('|');
      if (pipe < 0) return d.querySelector('[data-le-ns="' + rest + '"]');
      var nsRoot = d.querySelector('[data-le-ns="' + rest.slice(0, pipe) + '"]');
      if (!nsRoot) return null;
      return byPathRel(nsRoot, rest.slice(pipe + 1));
    }
    if (key.indexOf('cp:') === 0) {
      var rest2 = key.slice(3), pipe2 = rest2.indexOf('|');
      if (pipe2 < 0) return d.querySelector('[data-le-cp="' + rest2 + '"]');
      var cpRoot = d.querySelector('[data-le-cp="' + rest2.slice(0, pipe2) + '"]');
      if (!cpRoot) return null;
      return byPathRel(cpRoot, rest2.slice(pipe2 + 1));
    }
    return byPath(key);
  }

  /* apakah key milik anak cp/ns? */
  function isChildKey(key) {
    return key && (key.indexOf('cp:') === 0 || key.indexOf('ns:') === 0) && key.indexOf('|') > 0;
  }
  function parentRootKey(key) {
    if (!isChildKey(key)) return null;
    var i = key.indexOf('|');
    return key.slice(0, i);
  }

  var innerCache = new WeakMap();
  function innerOf(sec) {
    if (innerCache.has(sec)) return innerCache.get(sec);
    var r = sec;
    for (var c = sec.firstElementChild; c; c = c.nextElementSibling) {
      if (c.tagName === 'DIV' && !c.hasAttribute('data-le-add') && !c.hasAttribute('data-pas-editor') &&
          !c.hasAttribute('data-le-cp') && !c.hasAttribute('data-le-ns') &&
          g.getComputedStyle(c).position !== 'absolute') { r = c; break; }
    }
    innerCache.set(sec, r);
    return r;
  }

  function findItem(id) {
    for (var k in W.ad) for (var i = 0; i < W.ad[k].length; i++) if (W.ad[k][i].id === id) return { it: W.ad[k][i], list: W.ad[k], i: i, sec: k };
    for (var j = 0; j < (W.ns || []).length; j++) {
      var ns = W.ns[j];
      for (var i2 = 0; i2 < (ns.ad || []).length; i2++) if (ns.ad[i2].id === id) return { it: ns.ad[i2], list: ns.ad, i: i2, sec: 'ns:' + ns.id };
    }
    for (var k2 = 0; k2 < (W.cp || []).length; k2++) {
      var cp = W.cp[k2];
      for (var i3 = 0; i3 < (cp.ad || []).length; i3++) if (cp.ad[i3].id === id) return { it: cp.ad[i3], list: cp.ad, i: i3, sec: 'cp:' + cp.id };
    }
    return null;
  }
  function findNs(id) { for (var i = 0; i < (W.ns || []).length; i++) if (W.ns[i].id === id) return W.ns[i]; return null; }
  function findCp(id) { for (var i = 0; i < (W.cp || []).length; i++) if (W.cp[i].id === id) return W.cp[i]; return null; }

  function globalOf(el) { var gEl = el && el.closest('[data-global]'); return gEl ? gEl.getAttribute('data-global') : null; }
  function syncOf(el) { var sEl = el && el.closest('[data-sync]'); return sEl ? sEl.getAttribute('data-sync') : null; }

  function applyGlobalsToModel(model, pageTag) {
    var G = loadGlobal();
    var tags = ['navbar', 'footer', 'header'];
    tags.forEach(function (t) {
      var r = G[t];
      if (!r || !r.st) return;
      model.st = model.st || {};
      Object.keys(r.st).forEach(function (sub) {
        model.st['global:' + t + '|' + sub] = r.st[sub];
      });
    });
    var S = loadSync();
    var lang = pageLang();
    Object.keys(S).forEach(function (syncId) {
      var rec2 = S[syncId];
      if (!rec2) return;
      var applyTo = rec2.applyTo;
      if (applyTo === 'both' || applyTo === lang) {
        if (rec2.st) Object.keys(rec2.st).forEach(function (sub) {
          model.st = model.st || {};
          model.st['sync:' + syncId + '|' + sub] = rec2.st[sub];
        });
        if (rec2.ns && rec2.ns.length) {
          model.ns = model.ns || [];
          rec2.ns.forEach(function (n) {
            if (!model.ns.some(function (x) { return x.id === n.id; })) model.ns.push(clone(n));
          });
        }
      }
    });
    return model;
  }
  function saveGlobalsFromModel() {
    var G = loadGlobal();
    var tags = ['navbar', 'footer', 'header'];
    tags.forEach(function (t) {
      var gEl = d.querySelector('[data-global="' + t + '"]');
      if (!gEl) return;
      G[t] = G[t] || { st: {} };
      qa('*', gEl).concat([gEl]).forEach(function (el) {
        var k = pathOf(el);
        if (W.st[k]) {
          var sub = relativePath(gEl, el);
          G[t].st[sub] = W.st[k];
        }
      });
    });
    saveGlobal(G);
  }
  function saveSyncFromModel() {
    var S = loadSync();
    qa('[data-sync]').forEach(function (sec) {
      var syncId = sec.getAttribute('data-sync');
      if (!syncId) return;
      S[syncId] = S[syncId] || { st: {}, ns: [], applyTo: 'both' };
      var k = pathOf(sec);
      if (W.st[k]) {
        S[syncId].st = S[syncId].st || {};
        Object.keys(W.st[k]).forEach(function (prop) {
          if (/^(bg|bd|pv|iw|zm|dx|dy|bgImg|bgSize|bgPos|bgRepeat|bgFixed|bgOverlay)$/.test(prop)) {
            S[syncId].st['__root__|' + prop] = W.st[k][prop];
          }
        });
      }
      qa('*', sec).forEach(function (c) {
        var ck = pathOf(c);
        if (!W.st[ck]) return;
        var sub = relativePath(sec, c);
        S[syncId].st = S[syncId].st || {};
        Object.keys(W.st[ck]).forEach(function (prop) {
          if (/^(bg|bd|dx|dy|zm)$/.test(prop)) S[syncId].st[sub + '|' + prop] = W.st[ck][prop];
        });
      });
      if (W.ns) {
        W.ns.forEach(function (ns) {
          if (ns.afterKey === k && !S[syncId].ns.some(function (x) { return x.id === ns.id; })) S[syncId].ns.push(clone(ns));
        });
      }
    });
    saveSync(S);
  }
  function relativePath(root, el) {
    var a = [];
    while (el && el !== root) {
      a.unshift(el.tagName.toLowerCase() + ':' + Array.prototype.indexOf.call(el.parentNode.children, el));
      el = el.parentNode;
    }
    return a.join('/');
  }

  /* ------------------------------------------------------------ membuat konten tambahan */
  function videoEmbed(u) {
    var m = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{6,})/.exec(u);
    if (m) return 'https://www.youtube.com/embed/' + m[1];
    m = /vimeo\.com\/(\d+)/.exec(u);
    return m ? 'https://player.vimeo.com/video/' + m[1] : '';
  }
  function mk(it) {
    var r = d.createElement('div');
    r.setAttribute('data-le-add', it.id); r.setAttribute('data-k', it.k);
    r.style.cssText = 'margin-top:22px;max-width:100%';
    var e;
    if (it.k === 'h') {
      e = d.createElement('h3'); e.style.cssText = 'margin:0;font-size:26px;line-height:1.25;font-weight:700';
      e.innerHTML = safeHtml(it.v); e.setAttribute('data-f', 'v'); r.appendChild(e);
    } else if (it.k === 'p') {
      e = d.createElement('p'); e.style.cssText = 'margin:0;max-width:820px;line-height:1.75';
      e.innerHTML = safeHtml(it.v); e.setAttribute('data-f', 'v'); r.appendChild(e);
    } else if (it.k === 'ul') {
      e = d.createElement('ul'); e.style.cssText = 'margin:0;padding-left:22px;line-height:1.85;max-width:820px';
      (it.v || []).forEach(function (t) { var li = d.createElement('li'); li.innerHTML = safeHtml(t); li.setAttribute('data-f', 'li'); e.appendChild(li); });
      r.appendChild(e);
    } else if (it.k === 'img') {
      e = d.createElement('img'); e.src = it.s || PLACEHOLDER; e.alt = it.alt || '';
      e.style.cssText = 'display:block;width:100%;height:auto;border-radius:3px;object-fit:cover'; r.appendChild(e);
    } else if (it.k === 'vid') {
      var emb = videoEmbed(it.u || ''), u = safeUrl(it.u);
      if (emb) {
        r.style.position = 'relative'; r.style.paddingTop = '56.25%';
        e = d.createElement('iframe'); e.src = emb; e.setAttribute('allowfullscreen', ''); e.setAttribute('loading', 'lazy');
        e.title = 'Video'; e.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:0'; r.appendChild(e);
      } else if (u) {
        e = d.createElement('video'); e.src = u; e.controls = true; e.style.cssText = 'display:block;width:100%'; r.appendChild(e);
      } else {
        e = d.createElement('div'); e.textContent = 'Video belum diisi. Tempel tautan YouTube / Vimeo / MP4 di panel.';
        e.style.cssText = 'padding:40px 20px;text-align:center;background:rgba(128,128,128,.18);border:2px dashed rgba(128,128,128,.5)'; r.appendChild(e);
      }
    } else if (it.k === 'btn') {
      e = d.createElement('a'); e.className = 'tautan'; e.href = safeUrl(it.u) || '#'; e.setAttribute('data-f', 'v'); e.innerHTML = safeHtml(it.v);
      e.style.cssText = 'display:inline-flex;align-items:center;background:' + SAND + ';color:#fff;font-weight:600;font-size:15.5px;padding:13px 28px;border-radius:2px;min-height:48px;text-decoration:none';
      r.appendChild(e);
    } else if (it.k === 'card') {
      r.style.cssText += ';background:#fff;color:' + DEEP + ';padding:22px 24px;border-radius:4px;border-left:4px solid ' + SAND;
      var h = d.createElement('h3'); h.style.cssText = 'margin:0 0 8px;font-size:21px'; h.innerHTML = safeHtml(it.h); h.setAttribute('data-f', 'h');
      var p = d.createElement('p'); p.style.cssText = 'margin:0;line-height:1.7'; p.innerHTML = safeHtml(it.v); p.setAttribute('data-f', 'v');
      r.appendChild(h); r.appendChild(p);
    } else if (it.k === 'hr') {
      r.style.borderTop = '2px solid rgba(128,128,128,.45)'; r.style.height = '0';
    } else if (it.k === 'sp') {
      r.style.height = (it.n || 40) + 'px'; r.style.marginTop = '0';
    }
    // v8: terapkan style tersimpan untuk item add
    var saved = W.st['add:' + it.id];
    if (saved) applySt(r, saved);
    return r;
  }
  function newItem(k) {
    var o = { id: uid(), k: k };
    if (k === 'h') o.v = 'Judul baru';
    if (k === 'p') o.v = 'Tulis paragraf Anda di sini. Klik dua kali teks ini untuk mengetik.';
    if (k === 'ul') o.v = ['Poin pertama', 'Poin kedua', 'Poin ketiga'];
    if (k === 'btn') { o.v = 'Hubungi Kami'; o.u = 'kontak.html'; }
    if (k === 'card') { o.h = 'Judul kotak'; o.v = 'Isi kotak sorotan.'; }
    if (k === 'img') o.s = '';
    if (k === 'vid') o.u = '';
    if (k === 'sp') o.n = 40;
    return o;
  }

  /* ------------------------------------------------------------ render */
  function snap(el) { if (!el.hasAttribute('data-le-o')) el.setAttribute('data-le-o', el.getAttribute('style') || ''); }
  function restore() {
    qa('[data-le-add]').forEach(function (x) { x.remove(); });
    qa('[data-le-cp]').forEach(function (x) { x.remove(); });
    qa('[data-le-ns]').forEach(function (x) { x.remove(); });
    qa('[data-le-ox]').forEach(function (el) { el.innerHTML = el.getAttribute('data-le-ox'); el.removeAttribute('data-le-ox'); });
    qa('[data-le-os]').forEach(function (el) { el.setAttribute('src', el.getAttribute('data-le-os')); el.removeAttribute('data-le-os'); });
    qa('[data-le-o]').forEach(function (el) {
      var o = el.getAttribute('data-le-o');
      if (o) el.setAttribute('style', o); else el.removeAttribute('style');
      el.removeAttribute('data-le-o');
      el._bgApplied = false;
    });
  }
  function transparan(v) { return !v || v === 'transparent' || /rgba\(\s*0,\s*0,\s*0,\s*0\s*\)/.test(v); }
  function latarSendiri(el, akar) {
    for (var x = el; x && x !== akar.parentElement; x = x.parentElement) {
      var cs = g.getComputedStyle(x);
      if (x !== akar && (!transparan(cs.backgroundColor) || (cs.backgroundImage && cs.backgroundImage !== 'none'))) return true;
    }
    return false;
  }
  function punyaTeks(el) {
    for (var c = el.firstChild; c; c = c.nextSibling) if (c.nodeType === 3 && c.nodeValue.trim()) return true;
    return false;
  }

  function applyBgImage(el, s) {
    var hasBg = !!s.bgImg;
    if (!hasBg) {
      if (el._bgApplied) {
        snap(el);
        el.style.backgroundImage = '';
        el.style.backgroundSize = '';
        el.style.backgroundPosition = '';
        el.style.backgroundRepeat = '';
        el.style.backgroundAttachment = '';
        el.style.backgroundBlendMode = '';
        if (!s.bg) el.style.backgroundColor = '';
        el._bgApplied = false;
      }
      return;
    }
    snap(el);
    el._bgApplied = true;
    el.style.backgroundImage = 'url("' + s.bgImg + '")';
    el.style.backgroundSize = s.bgSize || 'cover';
    el.style.backgroundPosition = s.bgPos || 'center center';
    el.style.backgroundRepeat = s.bgRepeat || 'no-repeat';
    el.style.backgroundAttachment = s.bgFixed ? 'fixed' : 'scroll';
    if (s.bgOverlay) {
      el.style.backgroundBlendMode = 'multiply';
      el.style.backgroundColor = s.bgOverlay;
    } else {
      el.style.backgroundBlendMode = '';
      if (!s.bg) el.style.backgroundColor = 'transparent';
    }
    if (s.bgPad != null) {
      el.style.paddingTop = s.bgPad + 'px';
      el.style.paddingBottom = s.bgPad + 'px';
    }
  }

  function applySt(el, s) {
    if (!el || !s) return;
    var add = el.hasAttribute('data-le-add') || el.hasAttribute('data-le-cp') || el.hasAttribute('data-le-ns');
    var im = el.tagName === 'IMG' ? el : (add ? el.querySelector('img') : null);
    var cs = g.getComputedStyle(el);
    if (s.bg) { snap(el); el.style.background = s.bg; }
    if (s.bd) {
      snap(el); el.style.borderColor = s.bd;
      if (!parseFloat(cs.borderTopWidth)) el.style.border = '2px solid ' + s.bd;
    }
    if (add) { snap(el); if (s.w) el.style.width = s.w + '%'; }
    if (add && s.al) {
      snap(el); el.style.marginLeft = s.al === 'l' ? '0' : 'auto'; el.style.marginRight = s.al === 'r' ? '0' : 'auto';
    }
    if (s.dx || s.dy) { snap(el); el.style.translate = (s.dx || 0) + 'px ' + (s.dy || 0) + 'px'; }
    if (s.zm && s.zm !== 100 && /^(SECTION|FOOTER|HEADER|NAV)$/.test(el.tagName)) {
      snap(el);
      el.style.transformOrigin = '50% 0';
      el.style.transform = 'scale(' + (s.zm / 100) + ')';
      el.style.marginBottom = (el.getBoundingClientRect().height * (s.zm / 100 - 1)) + 'px';
    }
    if (im) {
      snap(im);
      var abs = g.getComputedStyle(im).position === 'absolute';
      if (!add && s.w && !abs) im.style.width = s.w + '%';
      if (s.h && !abs) { im.style.height = s.h + 'px'; im.style.objectFit = 'cover'; }
      if (s.pos) im.style.objectPosition = s.pos;
      if (s.z && s.z !== 100) {
        im.style.transformOrigin = s.pos || '50% 50%'; im.style.transform = 'scale(' + (s.z / 100) + ')';
        var par = im.parentElement; if (par) { snap(par); par.style.overflow = 'hidden'; }
      }
      if (s.src) { if (!im.hasAttribute('data-le-os') && !add) im.setAttribute('data-le-os', im.getAttribute('src')); im.removeAttribute('srcset'); im.setAttribute('src', s.src); }
    }
    if (/^(SECTION|FOOTER)$/.test(el.tagName) && (s.pv != null || s.iw)) {
      var inn = innerOf(el); snap(inn);
      if (s.pv != null) { inn.style.paddingTop = s.pv + 'px'; inn.style.paddingBottom = s.pv + 'px'; }
      if (s.iw) inn.style.maxWidth = s.iw + 'px';
    }
    applyBgImage(el, s);
  }
  function applyFg(el, s) {
    var all = [el];
    if (s.fa) qa('*', el).forEach(function (x) {
      if (/^(SCRIPT|STYLE|IMG|SVG|INPUT|TEXTAREA|SELECT)$/i.test(x.tagName) || x.closest('svg,[data-pas-editor]')) return;
      if (punyaTeks(x) && !latarSendiri(x, el)) all.push(x);
    });
    all.forEach(function (x) { snap(x); x.style.setProperty('color', s.fg, 'important'); });
  }

  function ensureFont(stack) {
    var m = /^"?([^",]+)"?/.exec(stack || '');
    if (!m || !GF[m[1]]) return;
    var id = 'pas-gf-' + m[1].replace(/\s+/g, '-');
    if (d.getElementById(id)) return;
    var l = d.createElement('link'); l.id = id; l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=' + GF[m[1]] + '&display=swap';
    d.head.appendChild(l);
  }
  function typoTarget(el) {
    if (el.hasAttribute('data-le-add') && /^(h|p|ul|btn)$/.test(el.getAttribute('data-k'))) return el.firstElementChild || el;
    return el;
  }
  function hasTypo(s) { return s.ff || s.fs || s.fw || s.fi || s.fu || s.tt || s.ta || s.lh || s.ls != null; }
  function applyTypo(el, s) {
    if (!hasTypo(s)) return;
    var tg = typoTarget(el), all = [tg];
    if (s.ia || (el.hasAttribute('data-le-add') && tg === el)) {
      qa('*', tg).forEach(function (x) {
        if (/^(SCRIPT|STYLE|IMG|SVG|INPUT|TEXTAREA|SELECT|IFRAME|VIDEO)$/i.test(x.tagName) || x.closest('svg,[data-pas-editor]')) return;
        if (punyaTeks(x)) all.push(x);
      });
    }
    var origs = all.map(function (x) { return parseFloat(g.getComputedStyle(x).fontSize) || 16; });
    var ratio = s.fs ? s.fs / (origs[0] || 16) : 1;
    all.forEach(function (x, i) {
      snap(x);
      var P = function (k, v) { x.style.setProperty(k, v, 'important'); };
      if (s.ff) { P('font-family', s.ff); ensureFont(s.ff); }
      if (s.fs) P('font-size', (i === 0 ? s.fs : Math.round(origs[i] * ratio * 10) / 10) + 'px');
      if (s.fw) P('font-weight', s.fw);
      if (s.fi) P('font-style', 'italic');
      if (s.fu) P('text-decoration', 'underline');
      if (s.tt) P('text-transform', 'uppercase');
      if (s.ta) P('text-align', s.ta);
      if (s.lh) P('line-height', String(s.lh / 100));
      if (s.ls != null) P('letter-spacing', s.ls + 'px');
    });
  }

  function render() {
    restore();
    innerCache = new WeakMap();

    // render item add di section asli
    Object.keys(W.ad).forEach(function (sk) {
      var sec = byPath(sk); if (!sec) return;
      var inn = innerOf(sec);
      W.ad[sk].forEach(function (it) { inn.appendChild(mk(it)); });
    });

    // render ns
    (W.ns || []).forEach(function (ns) {
      var wrapper = d.createElement('div');
      wrapper.innerHTML = ns.html;
      var el = wrapper.firstElementChild;
      if (!el) return;
      el.setAttribute('data-le-ns', ns.id);
      if (ns.syncTag) el.setAttribute('data-sync', ns.syncTag);
      if (ns.globalTag) el.setAttribute('data-global', ns.globalTag);
      if (ns.style) applySt(el, ns.style);
      if (ns.ad && ns.ad.length) {
        var inn2 = innerOf(el);
        ns.ad.forEach(function (it) { inn2.appendChild(mk(it)); });
      }
      var target = ns.afterKey ? byPath(ns.afterKey) : null;
      if (target && target.parentNode) target.parentNode.insertBefore(el, target.nextSibling);
      else d.body.appendChild(el);
    });

    // render cp
    (W.cp || []).forEach(function (cp) {
      var wrapper = d.createElement('div');
      wrapper.innerHTML = cp.html;
      var el = wrapper.firstElementChild;
      if (!el) return;
      el.setAttribute('data-le-cp', cp.id);
      if (cp.ad && cp.ad.length) {
        cp.ad.forEach(function (it) { el.appendChild(mk(it)); });
      }
      var target = cp.parentSec ? (cp.parentSec.indexOf('ns:') === 0 ? d.querySelector('[data-le-ns="' + cp.parentSec.slice(3) + '"]') : byPath(cp.parentSec)) : null;
      if (!target) target = d.querySelector('section,footer');
      if (!target) return;
      if (cp.afterItem) {
        var ref = target.querySelector('[data-le-add="' + cp.afterItem + '"],[data-le-cp="' + cp.afterItem + '"]');
        if (ref && ref.parentNode) { ref.parentNode.insertBefore(el, ref.nextSibling); return; }
      }
      var inn3 = innerOf(target);
      inn3.appendChild(el);
    });

    // apply style normal (halaman, global, sync)
    var keys = Object.keys(W.st);
    keys.forEach(function (k) {
      if (k.indexOf('global:') === 0 || k.indexOf('sync:') === 0) return;
      var el = elOf(k); if (el) applySt(el, W.st[k]);
    });
    keys.forEach(function (k) {
      if (k.indexOf('global:') !== 0) return;
      var m = /^global:([^|]+)\|(.*)$/.exec(k);
      if (!m) return;
      var gEl = d.querySelector('[data-global="' + m[1] + '"]');
      if (!gEl) return;
      var sub = m[2], el = gEl;
      if (sub) {
        var parts = sub.split('/');
        for (var i = 0; i < parts.length; i++) {
          var mm = /^([a-z0-9]+):(\d+)$/.exec(parts[i]);
          if (!mm) { el = null; break; }
          el = Array.prototype.filter.call(el.children, function (c) { return !c.hasAttribute('data-pas-editor'); })[+mm[2]];
          if (!el) break;
        }
      }
      if (el) applySt(el, W.st[k]);
    });
    keys.forEach(function (k) {
      if (k.indexOf('sync:') !== 0) return;
      var m = /^sync:([^|]+)\|(.*)$/.exec(k);
      if (!m) return;
      var sEl = d.querySelector('[data-sync="' + m[1] + '"]');
      if (!sEl) return;
      var sub = m[2];
      if (sub === '__root__') return;
      var pipe = sub.lastIndexOf('|');
      var pathPart = pipe > 0 ? sub.slice(0, pipe) : sub;
      var prop = pipe > 0 ? sub.slice(pipe + 1) : null;
      var el = sEl;
      if (pathPart) {
        var parts = pathPart.split('/');
        for (var i = 0; i < parts.length; i++) {
          var mm = /^([a-z0-9]+):(\d+)$/.exec(parts[i]);
          if (!mm) { el = null; break; }
          el = Array.prototype.filter.call(el.children, function (c) { return !c.hasAttribute('data-pas-editor'); })[+mm[2]];
          if (!el) break;
        }
      }
      if (el && prop) { var fake = {}; fake[prop] = W.st[k]; applySt(el, fake); }
    });

    // apply teks hasil edit (W.x) — v8: dukung path relatif cp/ns
    Object.keys(W.x).forEach(function (k) {
      if (k.indexOf('global:') === 0 || k.indexOf('sync:') === 0) return;
      var el = elOf(k);
      if (!el) return;
      var r = W.x[k];
      var curTxt = el.textContent.trim().replace(/\s+/g, ' ');
      if (r.o != null && curTxt !== r.o && !r.force) return;
      if (!el.hasAttribute('data-le-ox')) el.setAttribute('data-le-ox', el.innerHTML);
      if (r.n != null) { var tn = el.childNodes[r.n]; if (tn && tn.nodeType === 3) tn.nodeValue = r.v; }
      else el.innerHTML = safeHtml(r.v);
    });

    // apply fg & typo (global) — termasuk untuk key child cp/ns
    keys.forEach(function (k) {
      if (k.indexOf('global:') === 0 || k.indexOf('sync:') === 0) return;
      var s = W.st[k], el = elOf(k); if (!el) return;
      if (s.fg) applyFg(el, s);
      applyTypo(el, s);
    });
  }

  /* ------------------------------------------------------------ boot */
  function simRibbon() {
    var r = ui('div', 'position:fixed;left:0;top:0;z-index:2147483000;background:#13508C;color:#fff;font:700 11px Barlow,Arial,sans-serif;' +
      'letter-spacing:.8px;padding:3px 9px;border-radius:0 0 4px 0;pointer-events:none;opacity:.92', 'SIMULASI · formulir tidak menyimpan data');
    d.body.appendChild(r);
  }
  function boot() {
    applyGlobalsToModel(W, PAGE);
    W.ns = W.ns || []; W.cp = W.cp || [];
    if (SAVED && !isEmpty(SAVED)) render();
    if (SIM) { simRibbon(); return; }
    startUI();
  }

  /* ================================================================ ANTARMUKA EDITOR */
  var aktif = false, sel = null, selKey = null, hist = [], hi = -1, rafId = 0;
  var multiSel = [];
  var clip = null;
  var searchBox = null, searchHits = [], searchIdx = 0;
  var toast, fab, bar, panel, hov, selb, selLabel, fileIn, gaya, dirtyDot, bUndo, bRedo, bSimpan, panelBody, panelTutup;
  var hovLabel, bBack, bFwd, selJump, backPill, tglBtn = {}, hoverT = 0, trail = [], ti = -1, STEP = 5;
  var selMarks = [];
  var simEl = null, simFrame = null, simStage = null, simHolder = null, simDev = null, simInfo = null, simMode = 'draf', simW = 390, simH = 844,
      simZoom = 'fit', simPrint = false, simBtns = [], simWi = null, simHi = null;
  function loadUI() { try { return JSON.parse(g.sessionStorage.getItem(UIKEY)) || {}; } catch (e) { return {}; } }
  var UI = loadUI();
  if (UI.hs === undefined) UI.hs = true;
  if (UI.fk === undefined) UI.fk = true;
  if (UI.md !== 'bagian') UI.md = 'tepat';
  UI.lk = false;
  function saveUI() { try { g.sessionStorage.setItem(UIKEY, JSON.stringify(UI)); } catch (e) {} }

  function dirty() { return JSON.stringify(W) !== SAVED_STR; }
  function msg(t, bad) {
    if (!toast) {
      toast = ui('div', 'position:fixed;left:50%;bottom:84px;transform:translateX(-50%);z-index:2147483600;max-width:min(560px,92vw);' +
        'padding:12px 18px;border-radius:4px;font:600 14px/1.5 Barlow,Arial,sans-serif;box-shadow:0 8px 28px rgba(10,34,64,.35);' +
        'transition:opacity .25s;pointer-events:none');
      d.body.appendChild(toast);
    }
    toast.style.bottom = ((bar && bar.offsetHeight ? bar.offsetHeight : 56) + 18) + 'px';
    toast.textContent = t; toast.style.background = bad ? '#7F1D1D' : DEEP; toast.style.color = '#fff'; toast.style.opacity = '1';
    clearTimeout(toast._t); toast._t = setTimeout(function () { toast.style.opacity = '0'; }, bad ? 6500 : 2400);
  }
  function later() { if (!rafId) rafId = g.requestAnimationFrame(function () { rafId = 0; var k = selKey; render(); reselect(k); refresh(); }); }
  function reselect(k) { sel = k ? elOf(k) : null; if (!sel) selKey = null; place(); }
  function refresh() {
    var dt = dirty();
    if (dirtyDot) { dirtyDot.textContent = dt ? '● Belum disimpan' : '✓ Tersimpan'; dirtyDot.style.color = dt ? '#FCD34D' : '#86EFAC'; }
    if (bSimpan) { bSimpan.disabled = !dt; bSimpan.style.opacity = dt ? '1' : '.5'; }
    if (bUndo) { bUndo.disabled = hi <= 0; bUndo.style.opacity = hi > 0 ? '1' : '.4'; }
    if (bRedo) { bRedo.disabled = hi >= hist.length - 1; bRedo.style.opacity = hi < hist.length - 1 ? '1' : '.4'; }
    var back = ti > 0, fwd = ti >= 0 && ti < trail.length - 1;
    if (bBack) { bBack.disabled = !back; bBack.style.opacity = back ? '1' : '.4'; }
    if (bFwd) { bFwd.disabled = !fwd; bFwd.style.opacity = fwd ? '1' : '.4'; }
    if (backPill) backPill.style.display = aktif && back ? 'block' : 'none';
  }
  function commit() {
    var s = JSON.stringify(W);
    if (hist[hi] === s) { refresh(); return; }
    hist = hist.slice(0, hi + 1); hist.push(s); hi = hist.length - 1; refresh();
  }
  function jump(n) {
    if (n < 0 || n >= hist.length) return;
    hi = n; W = JSON.parse(hist[hi]);
    W.ns = W.ns || []; W.cp = W.cp || [];
    var k = selKey; render(); reselect(k); buildPanel(); refresh();
  }
  function setSt(key, prop, val) {
    if (!key) return;
    var o = W.st[key] || (W.st[key] = {});
    if (val == null || val === '' || val === false) delete o[prop]; else o[prop] = val;
    if (!Object.keys(o).length) delete W.st[key];
    later();
  }

  function loggedIn() { try { return g.sessionStorage.getItem(SESSION) === '1'; } catch (e) { return false; } }
  function showFab() {
    if (fab) return;
    fab = ui('button', 'position:fixed;left:22px;bottom:22px;z-index:2147482000;min-height:50px;padding:0 20px;border:0;border-radius:25px;' +
      'background:' + DEEP + ';color:#fff;font:700 15px Barlow,Arial,sans-serif;cursor:pointer;box-shadow:0 4px 16px rgba(10,34,64,.35)',
      loggedIn() ? '✎ Edit tampilan' : '🔐 Login Admin');
    fab.type = 'button';
    fab.addEventListener('click', function () { if (loggedIn()) nyala(); else loginBox(); });
    d.body.appendChild(fab);
  }
  function loginBox() {
    if (loggedIn()) { showFab(); nyala(); return; }
    var A = g.PAS_AUTH || { user: 'admin', pass: 'admin123' };
    var ov = ui('div', 'position:fixed;inset:0;z-index:2147483500;background:rgba(10,34,64,.6);display:flex;align-items:center;justify-content:center;padding:16px');
    var f = ui('form', 'background:#fff;color:' + DEEP + ';border-radius:6px;padding:24px;width:min(340px,100%);font:500 14.5px/1.5 Barlow,Arial,sans-serif;box-shadow:0 16px 50px rgba(0,0,0,.4)');
    var inp = 'display:block;width:100%;margin:4px 0 12px;padding:10px;border:1px solid #CBD5E1;border-radius:3px;font:inherit;box-sizing:border-box';
    var u = ui('input', inp), p = ui('input', inp), er = ui('div', 'color:#B3261E;min-height:20px;font-size:13px');
    u.autocomplete = 'username'; p.type = 'password'; p.autocomplete = 'current-password';
    var ok = ui('button', 'background:' + SAND + ';color:#fff;border:0;border-radius:3px;padding:11px 18px;font-weight:700;cursor:pointer', 'Masuk & edit');
    var no = ui('button', 'background:#fff;border:1px solid #CBD5E1;border-radius:3px;padding:10px 14px;margin-left:8px;cursor:pointer', 'Batal');
    ok.type = 'submit'; no.type = 'button';
    f.appendChild(ui('strong', 'font-size:18px;display:block;margin-bottom:10px', 'Login editor tampilan'));
    f.appendChild(ui('label', '', 'Nama pengguna')); f.appendChild(u);
    f.appendChild(ui('label', '', 'Kata sandi')); f.appendChild(p);
    f.appendChild(er); f.appendChild(ok); f.appendChild(no); ov.appendChild(f); d.body.appendChild(ov);
    u.focus();
    no.addEventListener('click', function () { ov.remove(); });
    f.addEventListener('submit', function (ev) {
      ev.preventDefault();
      if (u.value.trim() === A.user && p.value === A.pass) {
        try { g.sessionStorage.setItem(SESSION, '1'); } catch (e) {}
        ov.remove(); showFab(); nyala();
      } else { er.textContent = 'Nama pengguna atau kata sandi salah.'; p.value = ''; }
    });
  }

  function mkBtn(label, fn, css) { var b = ui('button', css || '', label); b.type = 'button'; b.addEventListener('click', fn); return b; }
  function lb(label, fn, extra) { var b = mkBtn(label, fn, extra || ''); b.className = 'le-b'; return b; }
  function opt(v, t) { var o = ui('option', '', t); o.value = v; return o; }

  function buildChrome() {
    gaya = d.createElement('style'); gaya.setAttribute('data-pas-editor', '');
    gaya.textContent =
      '[data-le-on] [data-le-add] iframe,[data-le-on] [data-le-add] video{pointer-events:none}' +
      '[data-le-on] [data-k=sp]{background:repeating-linear-gradient(45deg,rgba(201,135,47,.18) 0 6px,transparent 6px 12px)}' +
      '[data-le-on] [data-k=hr]{min-height:6px;border-top-style:dashed}' +
      '[contenteditable=true]{outline:2px solid ' + SAND + ' !important;outline-offset:3px;cursor:text}' +
      '[data-pas-editor] button{font:600 13px/1 Barlow,Arial,sans-serif;cursor:pointer}' +
      '[data-pas-editor] button:disabled{cursor:not-allowed}' +
      '.le-panel{position:fixed;right:12px;top:12px;bottom:70px;width:318px;z-index:2147481500;background:#fff;color:' + DEEP + ';border-radius:8px;' +
      'box-shadow:0 10px 38px rgba(10,34,64,.38);display:flex;flex-direction:column;font:500 13.5px/1.45 Barlow,Arial,sans-serif;overflow:hidden}' +
      '.le-panel h4{margin:16px 0 8px;font-size:12px;letter-spacing:1.4px;text-transform:uppercase;color:#56697E}' +
      '.le-panel input[type=range]{width:100%;accent-color:' + SAND + '}' +
      '.le-sw{width:22px;height:22px;border-radius:4px;border:1px solid rgba(10,34,64,.25);padding:0}' +
      '.le-b{background:#F3F7FA;color:' + DEEP + ';border:1px solid #DEE6EE;border-radius:3px;padding:8px 10px;min-height:34px}' +
      '.le-b:hover{background:#E6EEF6}' +
      '.le-on,.le-on:hover{background:' + SAND + ' !important;color:#fff !important;border-color:' + SAND + ' !important}' +
      '.le-b:disabled{opacity:.45}' +
      '[data-le-multi]{outline:2px dashed #2E9BD6 !important;outline-offset:-2px}' +
      '[data-le-ns]{outline:3px dotted #2E9BD6 !important;outline-offset:-3px}' +
      '[data-le-cp]{outline:3px dotted #22C55E !important;outline-offset:-3px}' +
      '.le-multi-badge{position:fixed;z-index:2147481400;background:#2E9BD6;color:#fff;font:700 11px Barlow,Arial,sans-serif;padding:2px 6px;border-radius:3px;pointer-events:none}' +
      '.le-multi-outline{position:absolute;pointer-events:none;z-index:2147480150;outline:2px dashed #2E9BD6;outline-offset:-2px;background:rgba(46,155,214,.06)}' +
      '@media(max-width:760px){.le-panel{left:8px;right:8px;top:auto;width:auto;bottom:66px;max-height:44vh}}' +
      '[data-le-on] [data-le-cp],[data-le-on] [data-le-ns],[data-le-on] [data-le-add]{cursor:grab}' +
      '[data-le-on] [data-le-cp]:active,[data-le-on] [data-le-ns]:active,[data-le-on] [data-le-add]:active{cursor:grabbing}' +
      '[data-le-on] [data-le-cp] *,[data-le-on] [data-le-ns] *,[data-le-on] [data-le-add] *{cursor:inherit}';

    bar = ui('div', 'position:fixed;left:0;right:0;bottom:0;z-index:2147481800;background:' + DEEP + ';color:#fff;display:flex;flex-wrap:wrap;' +
      'align-items:center;gap:8px 10px;padding:9px 14px;font:500 13.5px Barlow,Arial,sans-serif;box-shadow:0 -3px 14px rgba(0,0,0,.3)');
    bar.appendChild(ui('strong', 'letter-spacing:1.5px;color:' + SAND + ';font-size:12.5px', 'MODE EDIT'));
    dirtyDot = ui('span', 'font-weight:600;min-width:120px', '');
    bar.appendChild(dirtyDot);
    var ghost = 'background:transparent;color:#fff;border:1px solid rgba(255,255,255,.45);border-radius:3px;padding:8px 12px;min-height:36px';
    bUndo = mkBtn('↶ Urungkan', function () { jump(hi - 1); }, ghost);
    bRedo = mkBtn('↷ Ulangi', function () { jump(hi + 1); }, ghost);
    bSimpan = mkBtn('Simpan perubahan', simpan, 'background:' + SAND + ';color:#fff;border:0;border-radius:3px;padding:9px 16px;min-height:36px;font-weight:700');
    [bUndo, bRedo, bSimpan, mkBtn('Buang draf', buang, ghost), mkBtn('Unduh halaman', unduh, ghost),
     mkBtn('Kembalikan ke asli', asli, ghost), mkBtn('Selesai', selesai, ghost), mkBtn('Keluar login', keluar, ghost)]
      .forEach(function (b) { bar.appendChild(b); });

    bar.appendChild(ui('div', 'flex:0 0 100%;height:0'));
    bar.appendChild(ui('strong', 'letter-spacing:1.2px;color:' + SAND + ';font-size:12px', 'ALAT'));

    var searchWrap = ui('div', 'display:flex;align-items:center;gap:4px;background:#0B1B33;border:1px solid rgba(255,255,255,.35);border-radius:3px;padding:0 4px');
    searchBox = ui('input', 'background:transparent;border:0;color:#fff;padding:7px 6px;min-height:34px;width:180px;font:500 13px Barlow,Arial,sans-serif;outline:none');
    searchBox.type = 'search'; searchBox.placeholder = '🔍 Cari teks di halaman…';
    searchBox.addEventListener('input', doSearch);
    searchBox.addEventListener('keydown', function (ev) {
      if (ev.key === 'Enter') { ev.preventDefault(); gotoHit(ev.shiftKey ? -1 : 1); }
      if (ev.key === 'Escape') { searchBox.value = ''; doSearch(); searchBox.blur(); }
    });
    var sPrev = mkBtn('◀', function () { gotoHit(-1); }, 'background:transparent;color:#fff;border:0;padding:4px 7px;min-height:30px');
    var sNext = mkBtn('▶', function () { gotoHit(1); }, 'background:transparent;color:#fff;border:0;padding:4px 7px;min-height:30px');
    searchWrap.appendChild(searchBox); searchWrap.appendChild(sPrev); searchWrap.appendChild(sNext);
    bar.appendChild(searchWrap);

    selJump = ui('select', 'min-height:36px;border-radius:3px;border:1px solid rgba(255,255,255,.45);background:' + DEEP + ';color:#fff;padding:0 8px;font:600 13px Barlow,Arial,sans-serif;max-width:230px');
    selJump.addEventListener('mousedown', fillJump); selJump.addEventListener('focus', fillJump);
    selJump.addEventListener('change', function () {
      var list = secList(), e = list[+selJump.value]; selJump.value = '';
      if (e) goTo(e);
    });
    fillJump();
    bBack = mkBtn('↩ Kembali', function () { trailTo(ti - 1); }, ghost);
    bFwd = mkBtn('↪ Maju', function () { trailTo(ti + 1); }, ghost);
    bar.appendChild(selJump); bar.appendChild(bBack); bar.appendChild(bFwd);

    var modeBtn = mkBtn('', function () { UI.md = UI.md === 'tepat' ? 'bagian' : 'tepat'; saveUI(); syncTgl(); }, ghost);
    tglBtn.md = modeBtn; bar.appendChild(modeBtn);
    [['hs', 'Hover = pilih', 'Arahkan pointer ke sebuah area dan diamkan sebentar: area itu otomatis terpilih.'],
     ['fk', 'Fokus area', 'Redupkan semua yang di luar area terpilih supaya jelas di mana perubahan berlaku.'],
     ['lk', '🔒 Kunci pilihan', 'Kunci pilihan sekarang: pointer yang lewat tidak mengganti area terpilih.']].forEach(function (t) {
      var b = mkBtn(t[1], function () { UI[t[0]] = !UI[t[0]]; saveUI(); syncTgl(); if (t[0] === 'fk') place(); }, ghost);
      b.title = t[2]; tglBtn[t[0]] = b; bar.appendChild(b);
    });
    bar.appendChild(ui('span', 'flex:1 1 auto'));
    var bs = mkBtn('▶ Simulasi website', simOpen, 'background:#13508C;color:#fff;border:0;border-radius:3px;padding:9px 16px;min-height:36px;font-weight:700');
    bar.appendChild(bs);
    syncTgl();

    panel = ui('div', ''); panel.className = 'le-panel';
    var head = ui('div', 'display:flex;align-items:center;padding:10px 14px;background:' + DEEP + ';color:#fff');
    head.appendChild(ui('strong', 'flex:1;font-size:14px', 'Pengaturan elemen'));
    panelTutup = mkBtn('Sembunyikan', function () {
      var h = panelBody.style.display === 'none'; panelBody.style.display = h ? '' : 'none'; panelTutup.textContent = h ? 'Sembunyikan' : 'Tampilkan';
      panel.style.bottom = h ? '' : 'auto';
    }, 'background:transparent;color:#fff;border:1px solid rgba(255,255,255,.4);border-radius:3px;padding:5px 9px');
    head.appendChild(panelTutup); panel.appendChild(head);
    panelBody = ui('div', 'padding:4px 14px 18px;overflow-y:auto;flex:1'); panel.appendChild(panelBody);

    hov = ui('div', 'position:absolute;pointer-events:none;z-index:2147480000;outline:2px dashed ' + SAND + ';outline-offset:-2px;display:none');
    hovLabel = ui('span', 'position:absolute;left:0;top:-22px;background:' + DEEP + ';color:#fff;font:600 11.5px Barlow,Arial,sans-serif;padding:3px 8px;border-radius:3px;white-space:nowrap;max-width:90vw;overflow:hidden;text-overflow:ellipsis');
    hov.appendChild(hovLabel);
    selb = ui('div', 'position:absolute;pointer-events:none;z-index:2147480100;outline:2px solid ' + SAND + ';outline-offset:-2px;display:none');
    selLabel = ui('span', 'position:absolute;left:0;top:-22px;background:' + SAND + ';color:#fff;font:700 11.5px Barlow,Arial,sans-serif;padding:3px 8px;border-radius:3px;white-space:nowrap');
    selb.appendChild(selLabel);
    fileIn = ui('input', 'display:none'); fileIn.type = 'file';
    backPill = mkBtn('↩ Kembali ke posisi tadi', function () { trailTo(ti - 1); },
      'position:fixed;left:14px;bottom:70px;z-index:2147481700;display:none;background:#13508C;color:#fff;border:0;border-radius:20px;padding:10px 16px;font-weight:700;box-shadow:0 4px 14px rgba(10,34,64,.4)');
  }
  function syncTgl() {
    if (tglBtn.md) tglBtn.md.textContent = 'Pilih: ' + (UI.md === 'tepat' ? 'Tepat' : 'Seluruh bagian');
    ['hs', 'fk', 'lk'].forEach(function (k) { var b = tglBtn[k]; if (b) b.className = UI[k] ? 'le-on' : ''; });
  }
  function fitBar() {
    if (!bar || !aktif) return;
    var h = bar.offsetHeight;
    d.body.style.paddingBottom = (h + 8) + 'px';
    if (g.innerWidth > 760 && panelBody && panelBody.style.display !== 'none') panel.style.bottom = (h + 8) + 'px';
    if (backPill) backPill.style.bottom = (h + 12) + 'px';
  }

  function box(b, el) {
    if (!el || !d.body.contains(el)) { b.style.display = 'none'; return; }
    var r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) { b.style.display = 'none'; return; }
    b.style.display = 'block';
    b.style.left = (r.left + g.scrollX) + 'px'; b.style.top = (r.top + g.scrollY) + 'px';
    b.style.width = r.width + 'px'; b.style.height = r.height + 'px';
  }
  function place() {
    if (!aktif) return;
    box(selb, sel);
    selb.style.boxShadow = UI.fk && sel && selb.style.display !== 'none' ? '0 0 0 9999px rgba(10,34,64,.38)' : 'none';
    if (sel) {
      selLabel.textContent = describe(sel) + (multiSel.length > 1 ? '  (+' + (multiSel.length - 1) + ' terpilih)' : '');
      selLabel.style.top = (selb.getBoundingClientRect().top < 28 ? 2 : -22) + 'px';
    }
    selMarks.forEach(function (m) { m.remove(); });
    selMarks = [];
    if (multiSel.length) {
      multiSel.forEach(function (e) {
        if (e === sel) return;
        var r = e.getBoundingClientRect();
        if (r.width < 2 || r.height < 2) return;
        var m = ui('div', 'position:absolute;pointer-events:none;z-index:2147480150;outline:2px dashed #2E9BD6;outline-offset:-2px;background:rgba(46,155,214,.06)');
        m.style.left = (r.left + g.scrollX) + 'px';
        m.style.top = (r.top + g.scrollY) + 'px';
        m.style.width = r.width + 'px';
        m.style.height = r.height + 'px';
        d.body.appendChild(m);
        selMarks.push(m);
      });
    }
  }

  function describe(el) {
    if (!el) return '';
    if (el.hasAttribute('data-le-cp')) return 'Komponen (salinan)';
    if (el.hasAttribute('data-le-ns')) return 'Section baru';
    if (el.hasAttribute('data-le-add')) return NAMA[el.getAttribute('data-k')] + ' (tambahan)';
    var cp = el.closest('[data-le-cp]');
    if (cp) return 'Isi komponen: ' + (el.tagName || '').toLowerCase();
    var ns = el.closest('[data-le-ns]');
    if (ns) return 'Isi section baru: ' + (el.tagName || '').toLowerCase();
    var t = el.tagName;
    if (t === 'SECTION') return 'Bagian ' + (qa('section').indexOf(el) + 1);
    if (t === 'FOOTER') return 'Footer';
    if (t === 'HEADER') return 'Header';
    if (t === 'NAV') return 'Menu navigasi';
    if (t === 'IMG') return 'Gambar';
    if (t === 'A') return el.classList.contains('tautan') && el.querySelector('svg') ? 'Tombol' : 'Tautan';
    if (/^H[1-6]$/.test(t)) return 'Judul';
    if (t === 'P') return 'Paragraf';
    if (t === 'LI') return 'Poin';
    if (t === 'BUTTON') return 'Tombol';
    if (el.parentNode === d.body) return 'Header / bilah atas';
    return 'Kotak (' + t.toLowerCase() + ')';
  }
  function region(el) { return el && el.closest('section,footer'); }

  function resolve(t) {
    if (!t || t === d.body || t === d.documentElement || t.closest('[data-pas-editor]')) return null;
    return t.closest('[data-le-add],[data-le-ns],[data-le-cp]') || t;
  }
  function select(el, quiet) {
    sel = el; selKey = el ? keyOf(el) : null; place(); buildPanel();
    if (hov) hov.style.display = 'none';
    if (!quiet && el && !/^(IMG)$/.test(el.tagName) && panelBody.style.display === 'none') panelTutup.click();
  }
  function toArea(t) {
    if (!t || UI.md !== 'bagian') return t;
    if (t.hasAttribute('data-le-cp') || t.hasAttribute('data-le-ns') || t.hasAttribute('data-le-add')) return t;
    var a = t.closest('section,footer,header,nav');
    if (a) return resolve(a);
    var x = t; while (x.parentElement && x.parentElement !== d.body) x = x.parentElement;
    return resolve(x);
  }
  function pickAt(raw) { var r = resolve(raw); return r ? toArea(r) : null; }

  function onClick(ev) {
    if (!aktif) return;
    if (dragBlockClick) { dragBlockClick = false; return; }
    if (dragMove && dragMove.moved) return;
    if (ev.target.closest('[data-pas-editor]')) return;
    if (ev.target.isContentEditable && ev.target.closest('[contenteditable=true]')) return;
    ev.preventDefault(); ev.stopPropagation();
    clearTimeout(hoverT);
    var t = pickAt(ev.target);
    if (!t) return;

    if (ev.shiftKey) {
      var idx = multiSel.indexOf(t);
      if (idx >= 0) { multiSel.splice(idx, 1); t.removeAttribute('data-le-multi'); }
      else { multiSel.push(t); t.setAttribute('data-le-multi', ''); }
      if (multiSel.length) { sel = multiSel[multiSel.length - 1]; selKey = keyOf(sel); }
      else { sel = null; selKey = null; }
      place(); buildPanel(); refresh();
      if (multiSel.length) msg(multiSel.length + ' area terpilih. Ctrl+C untuk menyalin semua, Ctrl+V untuk menempel.');
      else msg('Pilihan banyak dibatalkan.');
      return;
    }

    clearMulti();
    select(t);
  }
  function clearMulti() {
    multiSel.forEach(function (e) { e.removeAttribute('data-le-multi'); });
    multiSel = [];
    selMarks.forEach(function (m) { m.remove(); });
    selMarks = [];
  }
  function onOver(ev) {
    if (!aktif) return;
    if (dragMove) return;
    clearTimeout(hoverT);
    var t = pickAt(ev.target);
    if (!t || t === sel) { hov.style.display = 'none'; return; }
    box(hov, t);
    var auto = UI.hs && !UI.lk;
    hovLabel.textContent = 'Area: ' + describe(t) + (auto ? '  ·  diamkan sebentar untuk memilih' : '  ·  klik untuk memilih') + '  ·  Shift+klik = pilih banyak';
    hovLabel.style.top = (hov.getBoundingClientRect().top < 26 ? 2 : -22) + 'px';
    if (auto && !pan && !ev.buttons && !(d.activeElement && d.activeElement.isContentEditable)) {
      hoverT = setTimeout(function () {
        if (aktif && !pan && d.body.contains(t) && !(d.activeElement && d.activeElement.isContentEditable)) select(t, true);
      }, 500);
    }
  }

  function visible(e) { var r = e.getBoundingClientRect(); return r.width > 2 && r.height > 2; }
  function sameBox(a, b) {
    var x = a.getBoundingClientRect(), y = b.getBoundingClientRect();
    return Math.abs(x.left - y.left) < 2 && Math.abs(x.top - y.top) < 2 && Math.abs(x.width - y.width) < 2 && Math.abs(x.height - y.height) < 2;
  }
  function navKids(p) {
    return Array.prototype.filter.call(p.children, function (c) {
      return !c.hasAttribute('data-pas-editor') && !c.hasAttribute('data-runtime') && !c.hasAttribute('data-noedit') && !/^(SCRIPT|STYLE|LINK|META|NOSCRIPT|BR)$/.test(c.tagName);
    });
  }
  function focusEl(el) {
    if (!el) return;
    select(el, true);
    var r = el.getBoundingClientRect();
    if (r.top < 0 || r.bottom > g.innerHeight - 80) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
  function navUp() {
    if (!sel) return;
    if (sel.hasAttribute('data-le-ns') || sel.hasAttribute('data-le-cp')) { msg('Elemen ini tidak punya induk.'); return; }
    var p = sel.parentElement;
    while (p && p !== d.body && !/^(SECTION|FOOTER|HEADER|NAV)$/.test(p.tagName) && sameBox(p, sel)) p = p.parentElement;
    p = p && p !== d.body ? resolve(p) : null;
    if (p) focusEl(p); else msg('Sudah di tingkat paling atas.');
  }
  function navDown() {
    if (!sel) return;
    var c = navKids(sel).filter(visible)[0], n;
    while (c && (n = navKids(c).filter(visible)).length === 1 && sameBox(c, n[0])) c = n[0];
    c = c && resolve(c);
    if (c && c !== sel) focusEl(c); else msg('Tidak ada elemen di dalamnya yang bisa dipilih.');
  }
  function navSide(dir) {
    if (!sel || !sel.parentElement) return;
    if (sel.hasAttribute('data-le-ns')) { moveNs(sel.getAttribute('data-le-ns'), dir); return; }
    if (sel.hasAttribute('data-le-cp')) { moveCp(sel.getAttribute('data-le-cp'), dir); return; }
    var list = navKids(sel.parentElement).filter(visible), i = list.indexOf(sel);
    if (i < 0) { msg('Elemen ini tidak punya pendamping.'); return; }
    var n = list[i + dir];
    if (n) focusEl(resolve(n) || n); else msg(dir < 0 ? 'Ini yang paling awal di dalam induknya.' : 'Ini yang paling akhir di dalam induknya.');
  }

  function secList() {
    var secs = qa('section,footer').filter(function (x) { return !x.closest('[data-pas-editor]'); });
    var hd = d.body.firstElementChild;
    while (hd && (hd.hasAttribute('data-runtime') || hd.hasAttribute('data-noedit') || hd.hasAttribute('data-pas-editor'))) hd = hd.nextElementSibling;
    return (hd && !/^(SECTION|FOOTER)$/.test(hd.tagName) ? [hd] : []).concat(secs);
  }
  function secName(x) {
    if (x.hasAttribute('data-le-ns')) return 'Section baru (salinan)';
    var h = x.querySelector('h1,h2,h3'), t = h ? h.textContent.trim().replace(/\s+/g, ' ') : '';
    return describe(x) + (t ? ' — ' + (t.length > 30 ? t.slice(0, 30) + '…' : t) : '');
  }
  function fillJump() {
    if (!selJump) return;
    selJump.innerHTML = '';
    selJump.appendChild(opt('', '⤓ Loncat ke bagian…'));
    secList().forEach(function (x, i) { selJump.appendChild(opt(String(i), secName(x))); });
    selJump.value = '';
  }
  function here() { return { y: Math.round(g.scrollY), key: selKey }; }
  function goTo(el) {
    if (!el) return;
    var cur = here();
    if (ti < 0) { trail = [cur]; ti = 0; } else trail[ti] = cur;
    trail = trail.slice(0, ti + 1);
    var y = Math.max(0, Math.round(el.getBoundingClientRect().top + g.scrollY - 70));
    select(el, true);
    g.scrollTo({ top: y, behavior: 'smooth' });
    trail.push({ y: y, key: selKey });
    if (trail.length > 30) trail.shift();
    ti = trail.length - 1; refresh();
  }
  function trailTo(n) {
    if (n < 0 || n >= trail.length) return;
    trail[ti] = here(); ti = n;
    var e = trail[n], el = e.key ? elOf(e.key) : null;
    g.scrollTo({ top: e.y, behavior: 'smooth' });
    select(el || null, true); refresh();
  }

  function doSearch() {
    var q = (searchBox.value || '').trim().toLowerCase();
    searchHits = []; searchIdx = 0;
    qa('[data-le-search-hit]').forEach(function (e) { e.removeAttribute('data-le-search-hit'); });
    if (!q) return;
    var walker = d.createTreeWalker(d.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        if (!n.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        if (n.parentNode.closest('[data-pas-editor]')) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var n;
    while ((n = walker.nextNode())) {
      if (n.nodeValue.toLowerCase().indexOf(q) >= 0) {
        var el = n.parentElement;
        if (el) searchHits.push(el);
      }
    }
    searchHits = searchHits.filter(function (e, i, a) { return a.indexOf(e) === i; });
    if (searchHits.length) { markHits(); gotoHit(0); msg(searchHits.length + ' hasil untuk "' + q + '". Enter = berikutnya, Shift+Enter = sebelumnya.'); }
    else msg('Tidak ada teks yang cocok dengan "' + q + '".', true);
  }
  function markHits() {
    searchHits.forEach(function (e, i) { e.setAttribute('data-le-search-hit', i); });
    if (!d.getElementById('le-search-style')) {
      var s = d.createElement('style'); s.id = 'le-search-style'; s.setAttribute('data-pas-editor', '');
      s.textContent = '[data-le-search-hit]{outline:2px dashed #2E9BD6 !important;outline-offset:2px}';
      d.head.appendChild(s);
    }
  }
  function gotoHit(dir) {
    if (!searchHits.length) return;
    searchIdx = (searchIdx + dir + searchHits.length) % searchHits.length;
    var e = searchHits[searchIdx];
    e.scrollIntoView({ block: 'center', behavior: 'smooth' });
    e.style.boxShadow = '0 0 0 3px #2E9BD6';
    setTimeout(function () { e.style.boxShadow = ''; }, 1200);
    msg('Hasil ' + (searchIdx + 1) + ' dari ' + searchHits.length);
  }

  /* ================================================================
     COPY / PASTE — v8: dukung anak cp/ns
     ================================================================ */
  function serialItem(it) { return clone(it); }

  function orderedSelection(list) {
    return list.slice().sort(function (a, b) {
      if (a === b) return 0;
      var pos = a.compareDocumentPosition(b);
      if (pos & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
      if (pos & Node.DOCUMENT_POSITION_PRECEDING) return 1;
      return 0;
    });
  }

  function computedStyleSnapshot(el) {
    var cs = g.getComputedStyle(el);
    var keys = ['display','position','width','height','minWidth','maxWidth','minHeight','maxHeight',
                'margin','padding','flex','flexDirection','justifyContent','alignItems','gap',
                'gridTemplateColumns','gridTemplateRows','gridGap','gridColumn','gridRow',
                'background','backgroundColor','backgroundImage','backgroundSize','backgroundPosition',
                'backgroundRepeat','border','borderRadius','boxShadow','color',
                'fontFamily','fontSize','fontWeight','lineHeight','letterSpacing','textAlign',
                'textTransform','overflow','opacity','transform','objectFit','objectPosition',
                'aspectRatio','zIndex','gridAutoFlow'];
    var out = {};
    keys.forEach(function (k) {
      var v = cs[k];
      if (v && v !== 'none' && v !== 'normal' && v !== 'auto' && v !== '0px' && v !== 'rgba(0, 0, 0, 0)' && v !== 'visible') out[k] = v;
    });
    return out;
  }

  function cleanComponentHtml(el, includeComputed) {
    var c = el.cloneNode(true);
    qa('[data-pas-editor]', c).forEach(function (x) { x.remove(); });
    qa('[contenteditable]', c).forEach(function (x) { x.removeAttribute('contenteditable'); x.removeAttribute('spellcheck'); });
    qa('[data-le-o],[data-le-ox],[data-le-os],[data-le-multi],[data-le-search-hit],[data-le-ns],[data-le-cp],[data-le-add]', c).forEach(function (x) {
      ['data-le-o','data-le-ox','data-le-os','data-le-multi','data-le-search-hit','data-le-ns','data-le-cp','data-le-add','data-k'].forEach(function (a) { x.removeAttribute(a); });
    });
    qa('[data-f],[data-k]', c).forEach(function (x) { x.removeAttribute('data-f'); x.removeAttribute('data-k'); });
    if (includeComputed && el) {
      var snapStyle = computedStyleSnapshot(el);
      var inline = '';
      Object.keys(snapStyle).forEach(function (k) {
        var cssK = k.replace(/[A-Z]/g, function (m) { return '-' + m.toLowerCase(); });
        inline += cssK + ':' + snapStyle[k] + ';';
      });
      if (inline) c.setAttribute('style', (c.getAttribute('style') || '') + ';' + inline);
      var origChildren = qa('*', el);
      var clonedChildren = qa('*', c);
      origChildren.forEach(function (origChild, idx) {
        var clonedChild = clonedChildren[idx];
        if (!clonedChild) return;
        var cs2 = computedStyleSnapshot(origChild);
        var inline2 = '';
        var existing = clonedChild.getAttribute('style') || '';
        Object.keys(cs2).forEach(function (k) {
          var cssK = k.replace(/[A-Z]/g, function (m) { return '-' + m.toLowerCase(); });
          if (!existing.includes(cssK + ':')) inline2 += cssK + ':' + cs2[k] + ';';
        });
        if (inline2) clonedChild.setAttribute('style', existing + ';' + inline2);
      });
    }
    return c.outerHTML;
  }

  function cleanSectionHtml(sec) {
    var c = sec.cloneNode(true);
    qa('[data-pas-editor],[data-runtime]', c).forEach(function (x) { x.remove(); });
    qa('[data-le-add],[data-le-multi],[data-le-search-hit],[data-le-ns],[data-le-cp]', c).forEach(function (x) {
      ['data-le-add','data-le-multi','data-le-search-hit','data-le-ns','data-le-cp'].forEach(function (a) { x.removeAttribute(a); });
    });
    qa('[contenteditable]', c).forEach(function (x) { x.removeAttribute('contenteditable'); x.removeAttribute('spellcheck'); });
    qa('[data-le-o],[data-le-ox],[data-le-os]', c).forEach(function (x) {
      ['data-le-o','data-le-ox','data-le-os'].forEach(function (a) { x.removeAttribute(a); });
    });
    qa('[data-f],[data-k]', c).forEach(function (x) { x.removeAttribute('data-f'); x.removeAttribute('data-k'); });
    return c.outerHTML;
  }

  function copySel() {
    var list = multiSel.slice();
    if (sel && list.indexOf(sel) < 0) list.push(sel);
    list = list.filter(function (e, i, a) {
      return a.indexOf(e) === i && !e.closest('[data-pas-editor]') && d.body.contains(e);
    });
    if (!list.length) { msg('Pilih dulu area yang mau disalin (Shift+klik untuk banyak).', true); return; }

    list = orderedSelection(list);
    var payload = { v: 4, page: PAGE, at: Date.now(), items: [], modes: [] };

    list.forEach(function (el) {
      if (el.hasAttribute('data-le-ns')) {
        var ns = findNs(el.getAttribute('data-le-ns'));
        if (ns) { payload.items.push({ kind: 'ns', data: clone(ns) }); payload.modes.push('section'); }
        return;
      }
      if (el.hasAttribute('data-le-cp')) {
        var cp = findCp(el.getAttribute('data-le-cp'));
        if (cp) { payload.items.push({ kind: 'cp', data: clone(cp) }); payload.modes.push('component'); }
        return;
      }
      if (el.hasAttribute('data-le-add')) {
        var fi = findItem(el.getAttribute('data-le-add'));
        if (fi) { payload.items.push({ kind: 'item', item: serialItem(fi.it) }); payload.modes.push('component'); }
        return;
      }
      if (/^(SECTION|FOOTER|HEADER)$/.test(el.tagName)) {
        payload.items.push({
          kind: 'section',
          data: {
            key: pathOf(el),
            tag: el.tagName.toLowerCase(),
            html: cleanSectionHtml(el),
            syncTag: el.getAttribute('data-sync') || null,
            globalTag: el.getAttribute('data-global') || null,
            st: W.st[pathOf(el)] ? clone(W.st[pathOf(el)]) : null,
            ad: (W.ad[pathOf(el)] || []).map(serialItem)
          }
        });
        payload.modes.push('section');
        return;
      }
      // v8: elemen di dalam cp/ns → salin sebagai komponen dengan HTML-nya
      payload.items.push({
        kind: 'component',
        html: cleanComponentHtml(el, true),
        st: W.st[keyOf(el)] ? clone(W.st[keyOf(el)]) : null
      });
      payload.modes.push('component');
    });

    if (!payload.items.length) { msg('Tidak ada yang bisa disalin.', true); return; }
    clip = payload;
    try { g.localStorage.setItem(CLIPKEY, JSON.stringify(payload)); } catch (e) {}
    var secCount = payload.modes.filter(function (m) { return m === 'section'; }).length;
    var compCount = payload.modes.length - secCount;
    msg(compCount + ' komponen (utuh + style) & ' + secCount + ' section disalin. Ctrl+V di area tujuan.');
  }

  function pasteInto(target) {
    if (!clip) { try { clip = JSON.parse(g.localStorage.getItem(CLIPKEY)); } catch (e) {} }
    if (!clip) { msg('Clipboard kosong. Salin dulu dengan Ctrl+C.', true); return; }
    if (clip.v !== 4 && clip.v !== 3 && clip.v !== 2) { msg('Clipboard versi lama. Salin ulang dengan Ctrl+C.', true); return; }

    var tSec = target && (target.closest('section,footer') || target);
    if (!tSec) { msg('Klik dulu area tujuan (bagian yang akan menerima tempelan).', true); return; }
    var tk = pathOf(tSec);
    var countComp = 0, countSec = 0, newIds = [];

    clip.items.forEach(function (it, i) {
      var mode = clip.modes[i];
      if (mode === 'component') {
        if (it.kind === 'item') {
          var copy = clone(it.item); copy.id = uid();
          (W.ad[tk] = W.ad[tk] || []).push(copy);
          newIds.push('add:' + copy.id); countComp++;
        } else if (it.kind === 'cp') {
          var ncp = clone(it.data);
          ncp.id = 'cp' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
          ncp.parentSec = tk; ncp.afterItem = null;
          (W.cp = W.cp || []).push(ncp);
          newIds.push('cp:' + ncp.id); countComp++;
        } else {
          var ncp2 = {
            id: 'cp' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
            html: it.html, parentSec: tk, afterItem: null, ad: []
          };
          (W.cp = W.cp || []).push(ncp2);
          if (it.st) W.st['cp:' + ncp2.id] = clone(it.st);
          newIds.push('cp:' + ncp2.id); countComp++;
        }
      } else if (mode === 'section') {
        var newNs;
        if (it.kind === 'ns') {
          newNs = clone(it.data);
          newNs.id = 'ns' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
          newNs.afterKey = tk;
          newNs.ad = (newNs.ad || []).map(function (x) { var c = clone(x); c.id = uid(); return c; });
        } else {
          newNs = {
            id: 'ns' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
            srcKey: it.data.key, tag: it.data.tag, html: it.data.html,
            style: it.data.st ? clone(it.data.st) : null,
            ad: (it.data.ad || []).map(function (x) { var c = clone(x); c.id = uid(); return c; }),
            afterKey: tk, syncTag: it.data.syncTag || null, globalTag: it.data.globalTag || null
          };
        }
        W.ns.push(newNs);
        newIds.push('ns:' + newNs.id); countSec++;
      }
    });

    commit(); render(); place(); refresh();
    if (newIds.length) select(elOf(newIds[0]), true);
    buildPanel();
    msg(countComp + ' komponen & ' + countSec + ' section baru ditempel.');
  }

  function moveNs(id, dir) {
    var ns = findNs(id); if (!ns) return;
    var cur = byPath(ns.afterKey);
    if (!cur) { msg('Tidak bisa menemukan posisi tujuan.'); return; }
    var sib = dir < 0 ? cur.previousElementSibling : cur.nextElementSibling;
    while (sib && (sib.hasAttribute('data-le-ns') || sib.hasAttribute('data-pas-editor') || sib.hasAttribute('data-le-cp'))) {
      sib = dir < 0 ? sib.previousElementSibling : sib.nextElementSibling;
    }
    if (!sib) { if (dir < 0) ns.afterKey = ''; else { msg('Sudah di posisi paling bawah.'); return; } }
    else ns.afterKey = pathOf(sib);
    commit(); later();
  }

  function deleteNs(id) {
    var i = (W.ns || []).findIndex(function (x) { return x.id === id; });
    if (i < 0) return;
    W.ns.splice(i, 1);
    sel = null; selKey = null;
    commit(); render(); place(); buildPanel(); refresh();
  }

  function moveCp(id, dir) {
    var cp = findCp(id); if (!cp) return;
    var sec = cp.parentSec ? (cp.parentSec.indexOf('ns:') === 0 ? d.querySelector('[data-le-ns="' + cp.parentSec.slice(3) + '"]') : byPath(cp.parentSec)) : null;
    if (!sec) { msg('Section tujuan tidak ditemukan.'); return; }
    var inn = innerOf(sec);
    var kids2 = Array.prototype.filter.call(inn.children, function (c) {
      return c.hasAttribute('data-le-cp') || c.hasAttribute('data-le-add');
    });
    var idx = -1;
    for (var i = 0; i < kids2.length; i++) if (kids2[i].getAttribute('data-le-cp') === id) { idx = i; break; }
    if (idx < 0) { msg('Komponen belum dirender. Coba lagi.'); return; }
    var sib = kids2[idx + dir];
    if (!sib) { msg(dir < 0 ? 'Sudah di posisi paling atas.' : 'Sudah di posisi paling bawah.'); return; }
    if (dir < 0) {
      var prevSib = kids2[idx - 1];
      cp.afterItem = prevSib ? (prevSib.getAttribute('data-le-cp') || prevSib.getAttribute('data-le-add')) : null;
    } else {
      cp.afterItem = sib.getAttribute('data-le-cp') || sib.getAttribute('data-le-add');
    }
    commit(); later();
  }

  function deleteCp(id) {
    var i = (W.cp || []).findIndex(function (x) { return x.id === id; });
    if (i < 0) return;
    W.cp.splice(i, 1);
    // hapus semua style anak cp
    Object.keys(W.st).forEach(function (k) {
      if (k === 'cp:' + id || k.indexOf('cp:' + id + '|') === 0) delete W.st[k];
    });
    Object.keys(W.x).forEach(function (k) {
      if (k === 'cp:' + id || k.indexOf('cp:' + id + '|') === 0) delete W.x[k];
    });
    sel = null; selKey = null;
    commit(); render(); place(); buildPanel(); refresh();
  }

  /* ---------- edit teks — v8: dukung anak cp/ns ---------- */
  function editableText(el) {
    if (!el || /^(IMG|SVG|SCRIPT|STYLE|INPUT|TEXTAREA|SELECT|IFRAME|VIDEO|HR)$/i.test(el.tagName)) return false;
    if (!el.textContent.trim()) return false;
    return Array.prototype.every.call(el.children, function (c) { return c.tagName === 'BR'; });
  }
  function cleanHtml(el) {
    var o = '';
    Array.prototype.forEach.call(el.childNodes, function (n) {
      if (n.nodeType === 3) o += esc(n.nodeValue);
      else if (n.nodeName === 'BR') o += '<br>';
      else o += esc(n.textContent);
    });
    return o.replace(/(<br>)+$/, '');
  }
  function onDbl(ev) {
    if (!aktif || ev.target.closest('[data-pas-editor]')) return;
    var el = ev.target;
    if (!editableText(el)) {
      var a = el.closest('a,button');
      if (a && !a.closest('[data-le-add],[data-le-ns],[data-le-cp]') && punyaTeks(a)) {
        var tn = Array.prototype.filter.call(a.childNodes, function (c) { return c.nodeType === 3 && c.nodeValue.trim(); })[0];
        var idx = Array.prototype.indexOf.call(a.childNodes, tn);
        var baru = g.prompt('Ubah teks:', tn.nodeValue.trim());
        if (baru && baru.trim()) {
          var k = pathOf(a), o = W.x[k] ? W.x[k].o : a.textContent.trim().replace(/\s+/g, ' ');
          W.x[k] = { o: o, n: idx, v: baru.trim() }; commit(); later();
        }
      }
      return;
    }
    ev.preventDefault();
    var isAdd = !!el.closest('[data-le-add]');
    var k0 = isAdd ? null : keyOf(el); // v8: pakai keyOf agar stabil untuk anak cp/ns
    var origHtml = el.hasAttribute('data-le-ox') ? el.getAttribute('data-le-ox') : el.innerHTML;
    var origTxt = origHtml.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    el.contentEditable = 'true'; el.spellcheck = false; el.focus();
    var rg = d.createRange(); rg.selectNodeContents(el); var sl = g.getSelection(); sl.removeAllRanges(); sl.addRange(rg);
    function fin(cancel) {
      el.removeEventListener('blur', onBlur); el.removeEventListener('keydown', onKey); el.removeEventListener('paste', onPaste);
      el.removeAttribute('contenteditable');
      if (!cancel) {
        var v = cleanHtml(el);
        if (!v.replace(/<br>/g, '').trim()) { msg('Teks tidak boleh kosong.', true); }
        else if (isAdd) {
          var root = el.closest('[data-le-add]'), f = findItem(root.getAttribute('data-le-add')), field = el.getAttribute('data-f');
          if (f && field) {
            if (field === 'li') f.it.v = qa('li', root).map(function (li) { return cleanHtml(li); }).filter(function (t) { return t.trim(); });
            else f.it[field] = v;
          }
        } else if (v === origHtml) { delete W.x[k0]; }
        else { W.x[k0] = { o: origTxt, v: v, force: true }; }
        commit();
      }
      var k = selKey; render(); reselect(k); buildPanel(); refresh();
    }
    function onBlur() { fin(false); }
    function onKey(e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); el.blur(); }
      if (e.key === 'Escape') { e.preventDefault(); fin(true); }
    }
    function onPaste(e) { e.preventDefault(); d.execCommand('insertText', false, (e.clipboardData || g.clipboardData).getData('text/plain').replace(/\s+/g, ' ')); }
    el.addEventListener('blur', onBlur); el.addEventListener('keydown', onKey); el.addEventListener('paste', onPaste);
  }

  /* ================================================================
     DRAG-TO-MOVE
     ================================================================ */
  var pan = null;
  var dragMove = null;
  var dragBlockClick = false;

  function onDragDown(ev) {
    if (!aktif) return;
    if (ev.button !== 0) return;
    if (ev.target.closest('[data-pas-editor]')) return;
    if (ev.target.isContentEditable) return;
    if (ev.shiftKey || ev.ctrlKey || ev.metaKey || ev.altKey) return;

    var el = ev.target.closest('[data-le-cp],[data-le-ns],[data-le-add]');
    if (!el) return;
    if (el !== ev.target && !el.contains(ev.target)) return;

    var tg = ev.target.tagName;
    if (/^(A|BUTTON|INPUT|TEXTAREA|SELECT|IFRAME|VIDEO)$/.test(tg) && !el.hasAttribute('data-le-add')) return;

    var key = keyOf(el);
    var st = W.st[key] || {};
    dragMove = {
      el: el, key: key,
      startX: ev.clientX, startY: ev.clientY,
      baseDx: st.dx || 0, baseDy: st.dy || 0,
      moved: false, threshold: 4
    };
    if (sel !== el) { clearMulti(); select(el, true); }
    el.style.cursor = 'grabbing';
    el.style.userSelect = 'none';
    ev.preventDefault();
  }

  function onDragMove(ev) {
    if (!dragMove) return;
    var dx = ev.clientX - dragMove.startX;
    var dy = ev.clientY - dragMove.startY;
    if (!dragMove.moved && Math.abs(dx) < dragMove.threshold && Math.abs(dy) < dragMove.threshold) return;
    dragMove.moved = true;
    var nx = dragMove.baseDx + dx;
    var ny = dragMove.baseDy + dy;
    var el = dragMove.el;
    if (!el.hasAttribute('data-le-o')) snap(el);
    el.style.translate = nx + 'px ' + ny + 'px';
    el.style.zIndex = '9999';
    el.style.opacity = '0.85';
    var offOut = panelBody && panelBody.querySelector('[data-le-offout]');
    if (offOut) offOut.textContent = 'Kiri-kanan ' + Math.round(nx) + ' px · Atas-bawah ' + Math.round(ny) + ' px';
  }

  function onDragUp(ev) {
    if (!dragMove) return;
    var el = dragMove.el, key = dragMove.key;
    el.style.cursor = '';
    el.style.userSelect = '';
    el.style.zIndex = '';
    el.style.opacity = '';
    if (dragMove.moved) {
      var dx = ev.clientX - dragMove.startX + dragMove.baseDx;
      var dy = ev.clientY - dragMove.startY + dragMove.baseDy;
      dx = Math.round(dx / 5) * 5;
      dy = Math.round(dy / 5) * 5;
      setSt(key, 'dx', dx || null);
      setSt(key, 'dy', dy || null);
      commit();
      dragBlockClick = true;
      setTimeout(function () { dragBlockClick = false; }, 100);
      msg('Posisi digeser: ' + dx + ' px, ' + dy + ' px');
      later();
    } else {
      var st = W.st[key] || {};
      if (st.dx || st.dy) el.style.translate = (st.dx || 0) + 'px ' + (st.dy || 0) + 'px';
      else el.style.translate = '';
    }
    dragMove = null;
  }

  /* ---------- pan gambar ---------- */
  function onDown(ev) {
    if (!aktif || !sel || ev.target.closest('[data-pas-editor]')) return;
    var im = sel.tagName === 'IMG' ? sel : (sel.hasAttribute('data-le-add') ? sel.querySelector('img') : null);
    if (!im || ev.target !== im) return;
    var cs = g.getComputedStyle(im).objectPosition.split(' ');
    pan = { im: im, x: ev.clientX, y: ev.clientY, px: parseFloat(cs[0]) || 50, py: parseFloat(cs[1]) || 50, v: null };
    ev.preventDefault();
  }
  function onMove(ev) {
    if (!pan) return;
    var r = pan.im.getBoundingClientRect();
    var nx = Math.max(0, Math.min(100, pan.px - (ev.clientX - pan.x) / r.width * 100));
    var ny = Math.max(0, Math.min(100, pan.py - (ev.clientY - pan.y) / r.height * 100));
    pan.v = Math.round(nx) + '% ' + Math.round(ny) + '%';
    pan.im.style.objectPosition = pan.v; pan.im.style.transformOrigin = pan.v;
  }
  function onUp() {
    if (!pan) return;
    if (pan.v) { setSt(keyOf(sel), 'pos', pan.v); commit(); }
    pan = null;
  }

  /* ---------- panel helper ---------- */
  function row(label, node) {
    var w = ui('div', 'margin:6px 0'); if (label) w.appendChild(ui('div', 'font-weight:600;margin-bottom:3px', label)); w.appendChild(node); return w;
  }
  function slider(label, min, max, val, unit, onInput, auto) {
    var wrap = ui('div', 'margin:8px 0');
    var top = ui('div', 'display:flex;justify-content:space-between;font-weight:600');
    var vl = ui('span', 'color:#56697E;font-weight:500', val == null ? 'asli' : Math.round(val) + unit);
    top.appendChild(ui('span', '', label)); top.appendChild(vl);
    var line = ui('div', 'display:flex;gap:6px;align-items:center');
    var r = ui('input'); r.type = 'range'; r.min = min; r.max = max; r.step = 1; r.value = val == null ? min : val;
    var m = mkBtn('−', function () { r.value = Math.max(min, +r.value - Math.ceil((max - min) / 20)); r.dispatchEvent(new Event('input')); r.dispatchEvent(new Event('change')); }, 'background:#F3F7FA;border:1px solid #DEE6EE;border-radius:3px;width:30px;height:30px');
    var p = mkBtn('+', function () { r.value = Math.min(max, +r.value + Math.ceil((max - min) / 20)); r.dispatchEvent(new Event('input')); r.dispatchEvent(new Event('change')); }, 'background:#F3F7FA;border:1px solid #DEE6EE;border-radius:3px;width:30px;height:30px');
    r.addEventListener('input', function () { vl.textContent = r.value + unit; onInput(+r.value); });
    r.addEventListener('change', commit);
    line.appendChild(m); line.appendChild(r); line.appendChild(p);
    wrap.appendChild(top); wrap.appendChild(line);
    if (auto) {
      var ab = mkBtn('Kembali ke asli', function () { auto(); commit(); buildPanel(); },
        'background:none;border:0;color:#13508C;padding:2px 0;font-weight:600;text-decoration:underline');
      wrap.appendChild(ab);
    }
    return wrap;
  }
  function colorRow(key, label, prop, cssProp, targetEl) {
    var cur = (W.st[key] || {})[prop];
    var wrap = ui('div', 'margin:8px 0');
    var top = ui('div', 'display:flex;align-items:center;gap:8px;margin-bottom:5px');
    var inp = ui('input', 'width:38px;height:30px;padding:0;border:1px solid #CBD5E1;border-radius:3px;background:#fff'); inp.type = 'color';
    var te = targetEl || sel;
    inp.value = cur || (te ? hex(g.getComputedStyle(te).backgroundColor, prop === 'fg' ? '#0a2240' : '#ffffff') : '#ffffff');
    top.appendChild(inp); top.appendChild(ui('strong', 'flex:1', label));
    top.appendChild(ui('span', 'color:#56697E;font-size:12px', cur ? cur.toUpperCase() : 'asli'));
    top.appendChild(mkBtn('Asli', function () { setSt(key, prop, null); if (prop === 'fg') setSt(key, 'fa', null); commit(); buildPanel(); },
      'background:#fff;border:1px solid #CBD5E1;border-radius:3px;padding:5px 8px;min-height:28px'));
    inp.addEventListener('input', function () { setSt(key, prop, inp.value); });
    inp.addEventListener('change', function () { commit(); buildPanel(); });
    var sw = ui('div', 'display:flex;flex-wrap:wrap;gap:4px');
    SW.forEach(function (c) {
      var b = ui('button', 'background:' + c); b.className = 'le-sw'; b.type = 'button'; b.title = c;
      b.addEventListener('click', function () { setSt(key, prop, c); commit(); buildPanel(); }); sw.appendChild(b);
    });
    wrap.appendChild(top); wrap.appendChild(sw);
    if (prop === 'fg') {
      var cb = ui('input'); cb.type = 'checkbox'; cb.checked = !!(W.st[key] || {}).fa;
      var lab = ui('label', 'display:flex;gap:7px;align-items:center;margin-top:7px;font-size:12.5px'); lab.appendChild(cb);
      lab.appendChild(d.createTextNode('Termasuk semua teks di dalamnya'));
      cb.addEventListener('change', function () { setSt(key, 'fa', cb.checked); commit(); });
      wrap.appendChild(lab);
    }
    return wrap;
  }

  function fileToData(file, cb, maks) {
    var url = URL.createObjectURL(file), im = new Image();
    im.onload = function () {
      var w = im.naturalWidth, h = im.naturalHeight, r = Math.min(1, (maks || 1600) / Math.max(w, h));
      var c = d.createElement('canvas'); c.width = Math.round(w * r); c.height = Math.round(h * r);
      var x = c.getContext('2d'), png = /png|svg|webp|gif/.test(file.type);
      if (!png) { x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); }
      x.drawImage(im, 0, 0, c.width, c.height);
      var out = png ? c.toDataURL('image/png') : c.toDataURL('image/jpeg', 0.82);
      if (png && out.length > 900000) out = c.toDataURL('image/jpeg', 0.85);
      URL.revokeObjectURL(url); cb(null, out);
    };
    im.onerror = function () { URL.revokeObjectURL(url); cb(new Error('x')); };
    im.src = url;
  }
  function pickFile(accept, fn) {
    fileIn.accept = accept; fileIn.value = '';
    fileIn.onchange = function () { var f = fileIn.files && fileIn.files[0]; if (f) fn(f); };
    fileIn.click();
  }
  function gantiGambar(key) {
    pickFile('image/*', function (f) {
      msg('Memproses gambar…');
      fileToData(f, function (err, data) {
        if (err) { msg('Berkas itu tidak bisa dibaca sebagai gambar.', true); return; }
        var fi = key.indexOf('add:') === 0 ? findItem(key.slice(4)) : null;
        if (fi) fi.it.s = data;
        else setSt(key, 'src', data);
        commit(); setTimeout(buildPanel, 60);
      });
    });
  }

  function addItem(secKey, kind) {
    var it = newItem(kind);
    if (secKey.indexOf('ns:') === 0) {
      var ns = findNs(secKey.slice(3)); if (!ns) return; ns.ad.push(it);
    } else if (secKey.indexOf('cp:') === 0) {
      var cp = findCp(secKey.slice(3)); if (!cp) return; cp.ad = cp.ad || []; cp.ad.push(it);
    } else {
      (W.ad[secKey] = W.ad[secKey] || []).push(it);
    }
    selKey = 'add:' + it.id; commit(); render(); reselect(selKey); buildPanel(); refresh();
    if (sel) sel.scrollIntoView({ block: 'center', behavior: 'smooth' });
    if (kind === 'img') gantiGambar(selKey);
  }

  function buildPanel() {
    if (!panelBody) return;
    panelBody.innerHTML = '';

    // PANEL COMPONENT UTUH (W.cp)
    var cpId = sel && sel.getAttribute('data-le-cp');
    if (cpId) {
      var cp = findCp(cpId);
      if (cp) {
        panelBody.appendChild(ui('strong', 'display:block;font-size:15px;margin:10px 0 4px', 'Komponen (salinan utuh)'));
        panelBody.appendChild(ui('div', 'background:#DCFCE7;border:1px solid #86EFAC;border-radius:4px;padding:7px 9px;font-size:12.5px;color:#166534;margin-bottom:6px',
          'Komponen ini hasil salin — isi, wadah, dan style-nya bisa diedit. Klik dua kali teks di halaman untuk mengetik. Geser dengan kursor untuk memindahkan posisi.'));

        var mv = ui('div', 'display:flex;gap:6px;margin:8px 0;flex-wrap:wrap');
        mv.appendChild(mkBtn('⇈ Pindah ke atas', function () { moveCp(cpId, -1); setTimeout(buildPanel, 80); },
          'background:#F3F7FA;border:1px solid #DEE6EE;border-radius:3px;padding:9px 12px;font-weight:600'));
        mv.appendChild(mkBtn('⇊ Pindah ke bawah', function () { moveCp(cpId, +1); setTimeout(buildPanel, 80); },
          'background:#F3F7FA;border:1px solid #DEE6EE;border-radius:3px;padding:9px 12px;font-weight:600'));
        mv.appendChild(mkBtn('🗑 Hapus komponen', function () {
          if (g.confirm('Hapus komponen ini?')) deleteCp(cpId);
        }, 'background:#FEE2E2;color:#7F1D1D;border:1px solid #FECACA;border-radius:3px;padding:9px 12px;font-weight:600;margin-left:auto'));
        panelBody.appendChild(mv);

        var posSel = ui('select', SELCSS + ';margin:6px 0');
        posSel.appendChild(opt('', 'Pindahkan ke section lain…'));
        secList().forEach(function (x) {
          if (x.closest('[data-pas-editor]')) return;
          var k2 = x.hasAttribute('data-le-ns') ? 'ns:' + x.getAttribute('data-le-ns') : pathOf(x);
          if (k2 !== cp.parentSec) posSel.appendChild(opt(k2, secName(x)));
        });
        posSel.addEventListener('change', function () {
          var t = posSel.value; if (!t) return;
          cp.parentSec = t; cp.afterItem = null;
          commit(); render();
          setTimeout(function () { select(d.querySelector('[data-le-cp="' + cpId + '"]'), true); buildPanel(); }, 80);
          msg('Komponen dipindahkan ke section lain.');
        });
        panelBody.appendChild(posSel);

        panelBody.appendChild(ui('h4', '', 'Warna latar (opsional)'));
        panelBody.appendChild(colorRow('cp:' + cpId, 'Latar', 'bg', 'backgroundColor', sel));

        panelBody.appendChild(ui('h4', '', 'Geser posisi (drag pakai kursor)'));
        var offOutCP = ui('div', 'font-size:12.5px;color:#56697E;text-align:center;margin:6px 0 2px');
        offOutCP.setAttribute('data-le-offout', '');
        var stCP = W.st['cp:' + cpId] || {};
        offOutCP.textContent = 'Kiri-kanan ' + (stCP.dx || 0) + ' px · Atas-bawah ' + (stCP.dy || 0) + ' px';
        panelBody.appendChild(offOutCP);
        panelBody.appendChild(mkBtn('⟲ Reset posisi', function () {
          setSt('cp:' + cpId, 'dx', null); setSt('cp:' + cpId, 'dy', null);
          commit(); buildPanel();
        }, 'background:#F3F7FA;border:1px solid #DEE6EE;border-radius:3px;padding:7px 10px;width:100%'));

        panelBody.appendChild(ui('h4', '', 'Tambah konten di dalam komponen ini'));
        var gr = ui('div', 'display:grid;grid-template-columns:1fr 1fr;gap:6px');
        KINDS.forEach(function (k) {
          gr.appendChild(mkBtn('+ ' + k[1], function () { addItem('cp:' + cpId, k[0]); },
            'background:#F3F7FA;border:1px solid #DEE6EE;border-radius:3px;padding:9px 6px;min-height:36px;text-align:left'));
        });
        panelBody.appendChild(gr);
        return;
      }
    }

    // PANEL SECTION BARU (W.ns)
    var nsId = sel && sel.getAttribute('data-le-ns');
    if (nsId) {
      var ns = findNs(nsId);
      if (ns) {
        panelBody.appendChild(ui('strong', 'display:block;font-size:15px;margin:10px 0 4px', 'Section baru (hasil tempel)'));
        panelBody.appendChild(ui('div', 'background:#E0F2FE;border:1px solid #7DD3FC;border-radius:4px;padding:7px 9px;font-size:12.5px;color:#075985;margin-bottom:6px',
          'Section ini salinan. Klik dua kali teks untuk mengetik. Geser dengan kursor untuk memindahkan.'));

        var mv2 = ui('div', 'display:flex;gap:6px;margin:8px 0;flex-wrap:wrap');
        mv2.appendChild(mkBtn('⇈ Pindah ke atas', function () { moveNs(nsId, -1); setTimeout(buildPanel, 80); },
          'background:#F3F7FA;border:1px solid #DEE6EE;border-radius:3px;padding:9px 12px;font-weight:600'));
        mv2.appendChild(mkBtn('⇊ Pindah ke bawah', function () { moveNs(nsId, +1); setTimeout(buildPanel, 80); },
          'background:#F3F7FA;border:1px solid #DEE6EE;border-radius:3px;padding:9px 12px;font-weight:600'));
        mv2.appendChild(mkBtn('🗑 Hapus section', function () {
          if (g.confirm('Hapus section baru ini?')) deleteNs(nsId);
        }, 'background:#FEE2E2;color:#7F1D1D;border:1px solid #FECACA;border-radius:3px;padding:9px 12px;font-weight:600;margin-left:auto'));
        panelBody.appendChild(mv2);

        var posSel2 = ui('select', SELCSS + ';margin:6px 0');
        posSel2.appendChild(opt('', 'Pindah setelah section…'));
        secList().forEach(function (x) {
          if (x === sel || x.hasAttribute('data-le-ns')) return;
          var k2 = pathOf(x);
          posSel2.appendChild(opt(k2, secName(x)));
        });
        posSel2.addEventListener('change', function () {
          var t = posSel2.value; if (!t) return;
          ns.afterKey = t;
          commit(); render();
          setTimeout(function () { select(d.querySelector('[data-le-ns="' + nsId + '"]'), true); buildPanel(); }, 80);
        });
        panelBody.appendChild(posSel2);

        panelBody.appendChild(ui('h4', '', 'Warna latar section'));
        panelBody.appendChild(colorRow('ns:' + nsId, 'Latar', 'bg', 'backgroundColor', sel));

        panelBody.appendChild(ui('h4', '', 'Gambar latar section'));
        panelBody.appendChild(mkBtn('🖼 Pilih gambar latar…', function () {
          pickFile('image/*', function (f) {
            msg('Memproses gambar…');
            fileToData(f, function (err, data) {
              if (err) { msg('Berkas tidak bisa dibaca.', true); return; }
              setSt('ns:' + nsId, 'bgImg', data);
              commit(); setTimeout(buildPanel, 60);
            }, 1920);
          });
        }, 'background:' + SAND + ';color:#fff;border:0;border-radius:3px;padding:9px 14px;min-height:36px;width:100%'));
        var stN = W.st['ns:' + nsId] || {};
        if (stN.bgImg) {
          var prevN = ui('div', 'margin:8px 0;border:1px solid #DEE6EE;border-radius:3px;overflow:hidden;height:80px');
          prevN.style.backgroundImage = 'url("' + stN.bgImg + '")';
          prevN.style.backgroundSize = 'cover'; prevN.style.backgroundPosition = 'center';
          panelBody.appendChild(prevN);
          var bgSizeSel = ui('select', SELCSS); bgSizeSel.style.marginTop = '6px';
          [['cover','Cover'],['contain','Contain'],['auto','Auto'],['100% 100%','Stretch']].forEach(function (o) { bgSizeSel.appendChild(opt(o[0], o[1])); });
          bgSizeSel.value = stN.bgSize || 'cover';
          bgSizeSel.addEventListener('change', function () { setSt('ns:' + nsId, 'bgSize', bgSizeSel.value); commit(); later(); });
          panelBody.appendChild(row('Ukuran', bgSizeSel));
          var bgPosSel = ui('select', SELCSS);
          [['center center','Tengah'],['center top','Atas'],['center bottom','Bawah'],['left center','Kiri'],['right center','Kanan']].forEach(function (o) { bgPosSel.appendChild(opt(o[0], o[1])); });
          bgPosSel.value = stN.bgPos || 'center center';
          bgPosSel.addEventListener('change', function () { setSt('ns:' + nsId, 'bgPos', bgPosSel.value); commit(); later(); });
          panelBody.appendChild(row('Posisi', bgPosSel));
          panelBody.appendChild(mkBtn('Hapus gambar latar', function () {
            setSt('ns:' + nsId, 'bgImg', null); commit(); buildPanel();
          }, 'background:#FEE2E2;color:#7F1D1D;border:1px solid #FECACA;border-radius:3px;padding:7px 10px;width:100%;margin-top:6px'));
        }

        panelBody.appendChild(ui('h4', '', 'Geser posisi (drag pakai kursor)'));
        var offOutNS = ui('div', 'font-size:12.5px;color:#56697E;text-align:center;margin:6px 0 2px');
        offOutNS.setAttribute('data-le-offout', '');
        offOutNS.textContent = 'Kiri-kanan ' + (stN.dx || 0) + ' px · Atas-bawah ' + (stN.dy || 0) + ' px';
        panelBody.appendChild(offOutNS);
        panelBody.appendChild(mkBtn('⟲ Reset posisi', function () {
          setSt('ns:' + nsId, 'dx', null); setSt('ns:' + nsId, 'dy', null);
          commit(); buildPanel();
        }, 'background:#F3F7FA;border:1px solid #DEE6EE;border-radius:3px;padding:7px 10px;width:100%'));

        panelBody.appendChild(ui('h4', '', 'Tambah konten'));
        var gr2 = ui('div', 'display:grid;grid-template-columns:1fr 1fr;gap:6px');
        KINDS.forEach(function (k) {
          gr2.appendChild(mkBtn('+ ' + k[1], function () { addItem('ns:' + nsId, k[0]); },
            'background:#F3F7FA;border:1px solid #DEE6EE;border-radius:3px;padding:9px 6px;min-height:36px;text-align:left'));
        });
        panelBody.appendChild(gr2);
        return;
      }
    }

    // PANEL KOSONG
    if (!sel || !d.body.contains(sel)) {
      panelBody.appendChild(ui('p', 'color:#56697E;margin:14px 0', 'Klik bagian mana pun di halaman untuk mengatur warna, ukuran, dan background gambar. Klik dua kali teks untuk mengetik. Shift+klik = pilih banyak area. Seret (drag) salinan untuk memindahkan posisinya.'));
      panelBody.appendChild(ui('h4', '', 'Loncat ke bagian'));
      secList().forEach(function (x) {
        panelBody.appendChild(lb(secName(x), function () { goTo(x); }, 'display:block;width:100%;text-align:left;margin:3px 0;padding:9px 10px'));
      });
      return;
    }

    // PANEL NORMAL
    var key = keyOf(sel), isAdd = sel.hasAttribute('data-le-add'), kind = isAdd ? sel.getAttribute('data-k') : null;
    var st = W.st[key] || {};
    var isImg = sel.tagName === 'IMG' || kind === 'img';
    var im = sel.tagName === 'IMG' ? sel : (isAdd ? sel.querySelector('img') : null);
    var isReg = /^(SECTION|FOOTER)$/.test(sel.tagName);
    var rg = region(sel);
    panelBody.appendChild(ui('strong', 'display:block;font-size:15px;margin:10px 0 4px', describe(sel) + (multiSel.length ? '  ·  ' + multiSel.length + ' area terpilih' : '')));

    if (multiSel.length > 1) {
      panelBody.appendChild(ui('div', 'background:#E0F2FE;border:1px solid #7DD3FC;border-radius:4px;padding:7px 9px;font-size:12.5px;color:#075985;margin-bottom:6px',
        multiSel.length + ' area terpilih. Ctrl+C untuk menyalin semua, atau klik area lain tanpa Shift untuk membatalkan.'));
      var lst = ui('div', 'max-height:180px;overflow:auto;border:1px solid #DEE6EE;border-radius:3px;padding:4px;margin-bottom:6px;font-size:12px');
      multiSel.forEach(function (e, i) {
        var rowD = ui('div', 'padding:4px 6px;border-bottom:1px solid #F1F5F9;display:flex;gap:6px;align-items:center');
        rowD.appendChild(ui('span', 'color:#94A3B8;font-weight:700;min-width:18px', String(i + 1)));
        rowD.appendChild(ui('span', 'flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap', describe(e)));
        var rm = mkBtn('×', function () {
          var k = multiSel.indexOf(e);
          if (k >= 0) { multiSel.splice(k, 1); e.removeAttribute('data-le-multi'); }
          if (multiSel.length) { sel = multiSel[multiSel.length - 1]; selKey = keyOf(sel); }
          else { sel = null; selKey = null; }
          place(); buildPanel(); refresh();
        }, 'background:#FEE2E2;color:#7F1D1D;border:1px solid #FECACA;border-radius:3px;padding:1px 7px;min-height:22px;font-size:12px');
        rowD.appendChild(rm);
        lst.appendChild(rowD);
      });
      panelBody.appendChild(lst);
      panelBody.appendChild(mkBtn('📋 Salin semua terpilih (Ctrl+C)', copySel, 'background:' + SAND + ';color:#fff;border:0;border-radius:3px;padding:9px 14px;font-weight:700;min-height:36px;margin-bottom:6px'));
    }

    var cp2 = ui('div', 'display:flex;gap:6px;margin:6px 0;flex-wrap:wrap');
    cp2.appendChild(mkBtn('📋 Salin (Ctrl+C)', copySel, 'background:#F3F7FA;border:1px solid #DEE6EE;border-radius:3px;padding:7px 10px;font-weight:600'));
    cp2.appendChild(mkBtn('📌 Tempel ke area ini (Ctrl+V)', function () { pasteInto(sel); }, 'background:#F3F7FA;border:1px solid #DEE6EE;border-radius:3px;padding:7px 10px;font-weight:600'));
    if (multiSel.length) cp2.appendChild(mkBtn('✕ Batal pilih banyak (' + multiSel.length + ')', function () { clearMulti(); place(); buildPanel(); }, 'background:#FEE2E2;color:#7F1D1D;border:1px solid #FECACA;border-radius:3px;padding:7px 10px;font-weight:600'));
    panelBody.appendChild(cp2);

    var nav = ui('div', 'display:grid;grid-template-columns:repeat(3,1fr);gap:5px;margin:6px 0 2px');
    nav.appendChild(lb('← Sebelum', function () { navSide(-1); }));
    nav.appendChild(lb('↑ Induk', navUp));
    nav.appendChild(lb('Sesudah →', function () { navSide(1); }));
    nav.appendChild(lb('⌂ Bagian', function () { if (rg && rg !== sel) focusEl(rg); else msg('Ini sudah bagian paling luar.'); }));
    nav.appendChild(lb('↓ Anak', navDown));
    nav.appendChild(lb('✕ Lepas', function () { select(null, true); clearMulti(); place(); }));
    panelBody.appendChild(nav);

    if (isAdd) {
      var fi = findItem(sel.getAttribute('data-le-add'));
      if (fi) {
        var ctl = ui('div', 'display:flex;gap:6px;margin:8px 0;flex-wrap:wrap');
        ctl.appendChild(mkBtn('↑ Naik', function () {
          if (fi.i > 0) { fi.list.splice(fi.i - 1, 0, fi.list.splice(fi.i, 1)[0]); commit(); later(); setTimeout(buildPanel, 50); }
        }, 'background:#F3F7FA;border:1px solid #DEE6EE;border-radius:3px;padding:7px 10px'));
        ctl.appendChild(mkBtn('↓ Turun', function () {
          if (fi.i < fi.list.length - 1) { fi.list.splice(fi.i + 1, 0, fi.list.splice(fi.i, 1)[0]); commit(); later(); setTimeout(buildPanel, 50); }
        }, 'background:#F3F7FA;border:1px solid #DEE6EE;border-radius:3px;padding:7px 10px'));
        ctl.appendChild(mkBtn('Hapus', function () {
          fi.list.splice(fi.i, 1); delete W.st[key];
          if (!fi.list.length && fi.sec.indexOf('ns:') !== 0 && fi.sec.indexOf('cp:') !== 0) delete W.ad[fi.sec];
          sel = null; selKey = null; commit(); render(); place(); buildPanel(); refresh();
        }, 'background:#FEE2E2;color:#7F1D1D;border:1px solid #FECACA;border-radius:3px;padding:7px 10px;margin-left:auto'));
        panelBody.appendChild(ctl);
        var ord = ui('div', 'display:flex;gap:6px;margin:0 0 6px;flex-wrap:wrap');
        ord.appendChild(lb('⇈ Paling atas', function () {
          if (fi.i > 0) { fi.list.unshift(fi.list.splice(fi.i, 1)[0]); commit(); later(); setTimeout(buildPanel, 50); }
        }));
        ord.appendChild(lb('⇊ Paling bawah', function () {
          if (fi.i < fi.list.length - 1) { fi.list.push(fi.list.splice(fi.i, 1)[0]); commit(); later(); setTimeout(buildPanel, 50); }
        }));
        panelBody.appendChild(ord);
        if (kind !== 'sp' && kind !== 'hr') {
          panelBody.appendChild(ui('h4', '', 'Posisi: kiri / tengah / kanan'));
          var al = ui('div', 'display:flex;gap:6px');
          [['l', '◧ Kiri'], ['c', '◫ Tengah'], ['r', '◨ Kanan']].forEach(function (a) {
            var on = st.al === a[0], b = lb(a[1], function () { setSt(key, 'al', on ? null : a[0]); commit(); buildPanel(); });
            if (on) b.className = 'le-b le-on'; al.appendChild(b);
          });
          panelBody.appendChild(al);
        }
        var mvSel = ui('select', SELCSS + ';margin:6px 0');
        mvSel.appendChild(opt('', 'Pindahkan ke bagian lain…'));
        secList().forEach(function (x) {
          if (x.closest('[data-pas-editor]')) return;
          var k2 = x.hasAttribute('data-le-ns') ? 'ns:' + x.getAttribute('data-le-ns') : pathOf(x);
          if (k2 !== fi.sec) mvSel.appendChild(opt(k2, secName(x)));
        });
        mvSel.addEventListener('change', function () {
          var t = mvSel.value; if (!t) return;
          var item = fi.list.splice(fi.i, 1)[0];
          if (!fi.list.length && fi.sec.indexOf('ns:') !== 0 && fi.sec.indexOf('cp:') !== 0) delete W.ad[fi.sec];
          if (t.indexOf('ns:') === 0) { var nsT = findNs(t.slice(3)); if (nsT) nsT.ad.push(item); }
          else { (W.ad[t] = W.ad[t] || []).push(item); }
          selKey = 'add:' + item.id; commit(); render(); reselect(selKey); buildPanel(); refresh();
          if (sel) sel.scrollIntoView({ block: 'center', behavior: 'smooth' });
          msg('Konten dipindahkan ke bagian lain.');
        });
        panelBody.appendChild(mvSel);
        if (kind === 'ul') panelBody.appendChild(mkBtn('+ Tambah poin', function () { fi.it.v.push('Poin baru'); commit(); later(); }, 'background:#F3F7FA;border:1px solid #DEE6EE;border-radius:3px;padding:7px 10px;margin-bottom:6px'));
        if (kind === 'btn' || kind === 'vid') {
          var ti2 = ui('input', 'width:100%;padding:8px;border:1px solid #CBD5E1;border-radius:3px;box-sizing:border-box;font:inherit');
          ti2.value = fi.it.u || ''; ti2.placeholder = kind === 'btn' ? 'kontak.html atau https://…' : 'https://youtu.be/… atau tautan .mp4';
          ti2.addEventListener('input', function () { fi.it.u = ti2.value; later(); }); ti2.addEventListener('change', commit);
          panelBody.appendChild(row(kind === 'btn' ? 'Tautan tombol' : 'Tautan video', ti2));
        }
        if (kind === 'sp') panelBody.appendChild(slider('Tinggi jarak', 10, 300, fi.it.n || 40, ' px', function (v) { fi.it.n = v; later(); }));
      }
    } else if (editableText(sel) || (punyaTeks(sel) && sel.querySelector('svg'))) {
      panelBody.appendChild(ui('p', 'margin:4px 0 0;font-size:12.5px;color:#56697E', 'Klik dua kali teks di halaman untuk mengetik langsung.'));
    }

    if (isImg) {
      panelBody.appendChild(ui('h4', '', 'Gambar'));
      panelBody.appendChild(mkBtn('Ganti gambar…', function () { gantiGambar(key); }, 'background:' + SAND + ';color:#fff;border:0;border-radius:3px;padding:9px 14px;min-height:36px'));
      if (!isAdd && st.src) panelBody.appendChild(mkBtn('Gambar asli', function () { setSt(key, 'src', null); commit(); buildPanel(); }, 'background:none;border:0;color:#13508C;padding:6px 8px;font-weight:600;text-decoration:underline'));
      var abs = im && g.getComputedStyle(im).position === 'absolute';
      panelBody.appendChild(slider('Zoom (perbesar isi gambar)', 100, 400, st.z || 100, '%', function (v) { setSt(key, 'z', v === 100 ? null : v); }, function () { setSt(key, 'z', null); setSt(key, 'pos', null); }));
      if (!abs) {
        var cw = im ? (im.getBoundingClientRect().width / (sel.parentElement.getBoundingClientRect().width || 1) * 100) : 100;
        panelBody.appendChild(slider('Lebar gambar', 10, 100, st.w || Math.min(100, cw), '%', function (v) { setSt(key, 'w', v); }, function () { setSt(key, 'w', null); }));
        panelBody.appendChild(slider('Tinggi gambar', 80, 900, st.h || (im ? im.getBoundingClientRect().height : 300), ' px', function (v) { setSt(key, 'h', v); }, function () { setSt(key, 'h', null); }));
      }
    } else if (isAdd && kind !== 'sp') {
      panelBody.appendChild(slider('Lebar', 20, 100, st.w || 100, '%', function (v) { setSt(key, 'w', v); }, function () { setSt(key, 'w', null); }));
    }

    if (isReg) {
      var inn = innerOf(sel), cs = g.getComputedStyle(inn);
      panelBody.appendChild(ui('h4', '', 'Ukuran bagian'));
      panelBody.appendChild(slider('Tinggi (jarak atas & bawah)', 0, 260, st.pv != null ? st.pv : parseFloat(cs.paddingTop) || 0, ' px', function (v) { setSt(key, 'pv', v); }, function () { setSt(key, 'pv', null); }));
      panelBody.appendChild(slider('Lebar isi', 480, 1700, st.iw || parseFloat(cs.maxWidth) || Math.min(1200, inn.getBoundingClientRect().width), ' px', function (v) { setSt(key, 'iw', v); }, function () { setSt(key, 'iw', null); }));
      panelBody.appendChild(slider('Zoom bagian (perbesar / perkecil tampilan)', 50, 150, st.zm || 100, '%', function (v) { setSt(key, 'zm', v === 100 ? null : v); }, function () { setSt(key, 'zm', null); }));
    }

    // BACKGROUND GAMBAR
    if (sel.tagName !== 'IMG') {
      panelBody.appendChild(ui('h4', '', 'Gambar latar (background)'));
      panelBody.appendChild(mkBtn(st.bgImg ? '🖼 Ganti gambar latar…' : '🖼 Pilih gambar latar…', function () {
        pickFile('image/*', function (f) {
          msg('Memproses gambar…');
          fileToData(f, function (err, data) {
            if (err) { msg('Berkas tidak bisa dibaca.', true); return; }
            setSt(key, 'bgImg', data);
            commit(); setTimeout(buildPanel, 60);
          }, 1920);
        });
      }, 'background:' + SAND + ';color:#fff;border:0;border-radius:3px;padding:9px 14px;min-height:36px;width:100%'));
      if (st.bgImg) {
        var prev = ui('div', 'margin:8px 0;border:1px solid #DEE6EE;border-radius:3px;overflow:hidden;height:80px');
        prev.style.backgroundImage = 'url("' + st.bgImg + '")';
        prev.style.backgroundSize = 'cover'; prev.style.backgroundPosition = 'center';
        panelBody.appendChild(prev);
        var bgSizeSel = ui('select', SELCSS); bgSizeSel.style.marginTop = '6px';
        [['cover','Cover'],['contain','Contain'],['auto','Auto'],['100% 100%','Stretch']].forEach(function (o) { bgSizeSel.appendChild(opt(o[0], o[1])); });
        bgSizeSel.value = st.bgSize || 'cover';
        bgSizeSel.addEventListener('change', function () { setSt(key, 'bgSize', bgSizeSel.value); commit(); later(); });
        panelBody.appendChild(row('Ukuran', bgSizeSel));
        var bgPosSel = ui('select', SELCSS);
        [['center center','Tengah'],['center top','Atas'],['center bottom','Bawah'],['left center','Kiri'],['right center','Kanan']].forEach(function (o) { bgPosSel.appendChild(opt(o[0], o[1])); });
        bgPosSel.value = st.bgPos || 'center center';
        bgPosSel.addEventListener('change', function () { setSt(key, 'bgPos', bgPosSel.value); commit(); later(); });
        panelBody.appendChild(row('Posisi', bgPosSel));
        var bgRep = ui('input'); bgRep.type = 'checkbox'; bgRep.checked = !!st.bgRepeat;
        var labRep = ui('label', 'display:flex;gap:7px;align-items:center;font-size:12.5px;margin-top:4px'); labRep.appendChild(bgRep);
        labRep.appendChild(d.createTextNode('Ulangi gambar (repeat)'));
        bgRep.addEventListener('change', function () { setSt(key, 'bgRepeat', bgRep.checked ? 'repeat' : null); commit(); later(); });
        panelBody.appendChild(labRep);
        var bgFix = ui('input'); bgFix.type = 'checkbox'; bgFix.checked = !!st.bgFixed;
        var labFix = ui('label', 'display:flex;gap:7px;align-items:center;font-size:12.5px'); labFix.appendChild(bgFix);
        labFix.appendChild(d.createTextNode('Parallax (fixed)'));
        bgFix.addEventListener('change', function () { setSt(key, 'bgFixed', bgFix.checked); commit(); later(); });
        panelBody.appendChild(labFix);
        panelBody.appendChild(mkBtn('Hapus gambar latar', function () {
          setSt(key, 'bgImg', null); commit(); buildPanel(); later();
        }, 'background:#FEE2E2;color:#7F1D1D;border:1px solid #FECACA;border-radius:3px;padding:7px 10px;width:100%;margin-top:6px'));
      }
    }

    // WARNA
    panelBody.appendChild(ui('h4', '', 'Warna'));
    panelBody.appendChild(colorRow(key, 'Warna latar', 'bg', 'backgroundColor', sel));
    if (!isImg) panelBody.appendChild(colorRow(key, 'Warna teks', 'fg', 'color', sel));

    // TIPOGRAFI
    if (!isImg && sel.tagName !== 'HR') {
      panelBody.appendChild(ui('h4', '', 'Tipografi'));
      var ff = ui('select', SELCSS);
      FONTS.forEach(function (f) { ff.appendChild(opt(f[0], f[1])); });
      ff.value = st.ff || '';
      ff.addEventListener('change', function () { setSt(key, 'ff', ff.value || null); commit(); buildPanel(); });
      panelBody.appendChild(row('Jenis huruf', ff));
      var fw = ui('select', SELCSS);
      WEIGHTS.forEach(function (w) { fw.appendChild(opt(w[0], w[1])); });
      fw.value = st.fw || '';
      fw.addEventListener('change', function () { setSt(key, 'fw', fw.value || null); commit(); buildPanel(); });
      panelBody.appendChild(row('Ketebalan', fw));
      panelBody.appendChild(slider('Ukuran huruf', 10, 72, st.fs || parseFloat(g.getComputedStyle(sel).fontSize) || 16, ' px', function (v) { setSt(key, 'fs', v); }, function () { setSt(key, 'fs', null); }));
      panelBody.appendChild(slider('Jarak baris', 100, 250, st.lh || Math.round((parseFloat(g.getComputedStyle(sel).lineHeight) || 1.5) * 100), '%', function (v) { setSt(key, 'lh', v); }, function () { setSt(key, 'lh', null); }));
      var al2 = ui('div', 'display:flex;gap:6px;margin-top:4px');
      [['left', '◧'], ['center', '◫'], ['right', '◨'], ['justify', '☰']].forEach(function (a) {
        var on = st.ta === a[0], b = lb(a[1], function () { setSt(key, 'ta', on ? null : a[0]); commit(); buildPanel(); });
        if (on) b.className = 'le-b le-on'; al2.appendChild(b);
      });
      panelBody.appendChild(row('Rata teks', al2));
    }

    // HAPUS elemen anak cp/ns
    if (isChildKey(key) && !isAdd) {
      panelBody.appendChild(ui('h4', '', 'Hapus'));
      panelBody.appendChild(mkBtn('🗑 Hapus elemen ini', function () {
        if (!g.confirm('Hapus elemen ini dari salinan?')) return;
        var el2 = elOf(key);
        if (el2 && el2.parentNode) el2.parentNode.removeChild(el2);
        // hapus style & x untuk key ini dan anak-anaknya
        Object.keys(W.st).forEach(function (k) { if (k === key || k.indexOf(key + '|') === 0) delete W.st[k]; });
        Object.keys(W.x).forEach(function (k) { if (k === key || k.indexOf(key + '|') === 0) delete W.x[k]; });
        // hapus dari HTML cp/ns root
        var rootK = parentRootKey(key);
        if (rootK && rootK.indexOf('cp:') === 0) {
          var cpR = findCp(rootK.slice(3));
          if (cpR) cpR.html = d.querySelector('[data-le-cp="' + rootK.slice(3) + '"]').outerHTML
            .replace(/ data-le-cp="[^"]*"/, '').replace(/ data-le-ns="[^"]*"/, '')
            .replace(/ data-le-add="[^"]*"/g, '').replace(/ data-le-o="[^"]*"/g, '');
        }
        sel = null; selKey = null; commit(); render(); place(); buildPanel(); refresh();
      }, 'background:#FEE2E2;color:#7F1D1D;border:1px solid #FECACA;border-radius:3px;padding:9px 12px;width:100%'));
    }
  }

  /* ---------- simpan / buang / unduh / asli / selesai / keluar ---------- */
  function simpan() {
    try {
      var all = loadAll();
      var base = metaBase();
      W.base = base; W.savedAt = Date.now();
      all[PAGE] = clone(W);
      g.localStorage.setItem(KEY, JSON.stringify(all));
      saveGlobalsFromModel(); saveSyncFromModel();
      SAVED_STR = JSON.stringify(W);
      msg('Perubahan disimpan di peramban ini. Salin ke situs: Unduh halaman.');
      refresh();
    } catch (e) { msg('Gagal menyimpan: ' + e.message, true); }
  }
  function buang() {
    if (!g.confirm('Buang semua draf perubahan di halaman ini?')) return;
    try {
      var all = loadAll(); delete all[PAGE]; g.localStorage.setItem(KEY, JSON.stringify(all));
    } catch (e) {}
    W = blank(); hist = []; hi = -1; commit();
    render(); place(); buildPanel(); refresh(); msg('Draf dibuang.');
  }
  function unduh() {
    var html = '<!doctype html>\n' + d.documentElement.outerHTML;
    qa('[data-pas-editor]').forEach(function (x) { x.remove(); });
    // hapus atribut editor sisa
    qa('[data-le-o],[data-le-ox],[data-le-os],[data-le-multi],[data-le-search-hit]').forEach(function (x) {
      ['data-le-o','data-le-ox','data-le-os','data-le-multi','data-le-search-hit'].forEach(function (a) { x.removeAttribute(a); });
    });
    var bersih = '<!doctype html>\n' + d.documentElement.outerHTML;
    var blob = new Blob([bersih], { type: 'text/html' });
    var a = d.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = (PAGE || 'halaman').replace(/\//g, '-') + '.html';
    a.click(); URL.revokeObjectURL(a.href);
    msg('Halaman diunduh.');
  }
  function asli() {
    if (!g.confirm('Kembalikan halaman ke tampilan asli (hapus semua perubahan di halaman ini)?')) return;
    try {
      var all = loadAll(); delete all[PAGE]; g.localStorage.setItem(KEY, JSON.stringify(all));
      var sim = loadSim(); delete sim[PAGE]; g.sessionStorage.setItem(SIMKEY, JSON.stringify(sim));
    } catch (e) {}
    g.location.reload();
  }
  function selesai() {
    aktif = false;
    d.document.documentElement.removeAttribute('data-le-on');
    [bar, panel, hov, selb, backPill, gaya].forEach(function (x) { if (x) x.remove(); });
    qa('.le-panel,.le-multi-outline,.le-multi-badge').forEach(function (x) { x.remove(); });
    selMarks.forEach(function (m) { m.remove(); }); selMarks = [];
    d.body.style.paddingBottom = '';
    showFab();
    render();
  }
  function keluar() {
    try { g.sessionStorage.removeItem(SESSION); } catch (e) {}
    selesai();
    if (fab) fab.remove(); fab = null;
    showFab();
  }

  /* ---------- simulasi ---------- */
  function simOpen() {
    if (simEl) { simEl.style.display = 'flex'; simBuild(); return; }
    simEl = ui('div', 'position:fixed;inset:0;z-index:2147483000;background:#0B1B33;display:flex;flex-direction:column');
    var head = ui('div', 'display:flex;align-items:center;gap:8px;padding:8px 12px;background:' + DEEP + ';color:#fff;font:600 13px Barlow,Arial,sans-serif;flex-wrap:wrap');
    head.appendChild(ui('strong', '', 'Simulasi website'));
    var devSel = ui('select', 'background:#fff;color:' + DEEP + ';border-radius:3px;padding:5px 8px;font:inherit');
    DEVICES.forEach(function (dv) { devSel.appendChild(opt(dv[1] + ' (' + dv[1] + ')', dv[0] + ' · ' + dv[1] + '×' + dv[2])); });
    devSel.value = 'Ponsel';
    devSel.addEventListener('change', function () {
      var dv = DEVICES.filter(function (x) { return x[0] === devSel.value; })[0];
      if (dv) { simW = dv[1]; simH = dv[2]; simBuild(); }
    });
    head.appendChild(devSel);
    var modeSel = ui('select', 'background:#fff;color:' + DEEP + ';border-radius:3px;padding:5px 8px;font:inherit');
    modeSel.appendChild(opt('draf', 'Tampilan draf (editor)'));
    modeSel.appendChild(opt('asli', 'Tampilan asli (tanpa editor)'));
    modeSel.value = simMode;
    modeSel.addEventListener('change', function () { simMode = modeSel.value; simBuild(); });
    head.appendChild(modeSel);
    head.appendChild(ui('span', 'flex:1'));
    var close = mkBtn('Tutup', function () { simEl.style.display = 'none'; }, 'background:' + SAND + ';color:#fff;border:0;border-radius:3px;padding:8px 14px;font-weight:700');
    head.appendChild(close);
    simEl.appendChild(head);
    simStage = ui('div', 'flex:1;display:flex;align-items:center;justify-content:center;overflow:auto;padding:14px');
    simEl.appendChild(simStage);
    d.body.appendChild(simEl);
    simBuild();
  }
  function simBuild() {
    if (!simStage) return;
    simStage.innerHTML = '';
    var holder = ui('div', 'background:#fff;box-shadow:0 10px 40px rgba(0,0,0,.5);border-radius:8px;overflow:hidden;display:flex;flex-direction:column');
    holder.style.width = simW + 'px'; holder.style.maxWidth = '100%'; holder.style.height = 'min(' + simH + 'px, 100%)';
    var frame = d.createElement('iframe'); frame.style.cssText = 'border:0;width:100%;flex:1;background:#fff';
    frame.name = 'pas-sim';
    holder.appendChild(frame);
    simStage.appendChild(holder);
    // tulis konten
    var fdoc = frame.contentDocument;
    var base = g.location.href.split('#')[0];
    var src = (SIM ? g.name : '') === 'pas-sim' ? base : base + (base.indexOf('?') >= 0 ? '&' : '?') + 'pas-sim=1';
    frame.src = base.split('?')[0] + '?pas-sim=1';
  }

  /* ---------- start UI ---------- */
  function nyala() {
    if (aktif) return;
    aktif = true;
    d.document.documentElement.setAttribute('data-le-on', '');
    buildChrome();
    d.head.appendChild(gaya);
    d.body.appendChild(bar); d.body.appendChild(panel); d.body.appendChild(hov); d.body.appendChild(selb); d.body.appendChild(fileIn); d.body.appendChild(backPill);
    d.addEventListener('click', onClick, true);
    d.addEventListener('mouseover', onOver, true);
    d.addEventListener('dblclick', onDbl, true);
    d.addEventListener('mousedown', onDragDown, true);
    d.addEventListener('mousedown', onDown, true);
    d.addEventListener('mousemove', onDragMove, true);
    d.addEventListener('mousemove', onMove, true);
    d.addEventListener('mouseup', onDragUp, true);
    d.addEventListener('mouseup', onUp, true);
    d.addEventListener('keydown', onKeyGlobal, true);
    g.addEventListener('scroll', place, { passive: true });
    g.addEventListener('resize', tick);
    commit(); fitBar(); refresh();
    if (fab) fab.style.display = 'none';
    msg('Editor aktif. Klik area untuk memilih, klik dua kali teks untuk mengetik, seret salinan untuk memindahkan.');
  }

  function onKeyGlobal(ev) {
    if (!aktif) return;
    if (d.activeElement && d.activeElement.isContentEditable) return;
    if (ev.target.closest && ev.target.closest('[data-pas-editor]')) {
      if (ev.key === 'Escape') { ev.target.blur && ev.target.blur(); }
      return;
    }
    var k = ev.key;
    var mod = ev.ctrlKey || ev.metaKey;
    if (mod && !ev.shiftKey && k.toLowerCase() === 'c') { ev.preventDefault(); copySel(); return; }
    if (mod && !ev.shiftKey && k.toLowerCase() === 'v') { ev.preventDefault(); pasteInto(sel); return; }
    if (mod && !ev.shiftKey && k.toLowerCase() === 'z') { ev.preventDefault(); jump(hi - 1); return; }
    if (mod && !ev.shiftKey && k.toLowerCase() === 'y') { ev.preventDefault(); jump(hi + 1); return; }
    if (mod && k.toLowerCase() === 's') { ev.preventDefault(); simpan(); return; }
    if (k === 'Escape') { select(null, true); clearMulti(); place(); return; }
    if (k === '[') { trailTo(ti - 1); return; }
    if (k === ']') { trailTo(ti + 1); return; }
    if (k === 'ArrowUp') { ev.preventDefault(); navUp(); return; }
    if (k === 'ArrowDown') { ev.preventDefault(); navDown(); return; }
    if (k === 'ArrowLeft') { ev.preventDefault(); navSide(-1); return; }
    if (k === 'ArrowRight') { ev.preventDefault(); navSide(1); return; }
    if (k === 'Delete' || k === 'Backspace') {
      if (sel && sel.hasAttribute('data-le-add')) {
        ev.preventDefault();
        var fi = findItem(sel.getAttribute('data-le-add'));
        if (fi) {
          fi.list.splice(fi.i, 1);
          sel = null; selKey = null; commit(); render(); place(); buildPanel(); refresh();
        }
      }
    }
  }

  // Ctrl+Shift+E buka login/editor
  d.addEventListener('keydown', function (ev) {
    if ((ev.ctrlKey || ev.metaKey) && ev.shiftKey && ev.key.toLowerCase() === 'e') {
      ev.preventDefault();
      if (!loggedIn()) loginBox(); else if (!aktif) nyala(); else selesai();
    }
  });

  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', boot);
  else boot();

})(window, document);
