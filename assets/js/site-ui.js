/*
 * PT Prima Armada Samudra - pelengkap tampilan di setiap halaman publik:
 *   1. tautan "lewati ke isi" untuk pengguna papan ketik dan pembaca layar
 *   2. tombol WhatsApp melayang (hanya muncul bila nomornya sudah diisi)
 *   3. tombol kembali ke atas (muncul setelah halaman di-scroll)
 *
 * Nomor WhatsApp diisi di PAS_CONFIG.waNumber pada assets/js/pas-data.js,
 * dalam format internasional tanpa tanda plus, contoh: '628123456789'.
 */
(function (g, d) {
  'use strict';

  var CFG = g.PAS_CONFIG = g.PAS_CONFIG || {};
  var ID = (d.documentElement.getAttribute('lang') || 'en') === 'id';
  var SAND = '#C9872F';
  var DEEP = '#0A2240';

  var TEKS = {
    lewati: ID ? 'Lewati ke isi halaman' : 'Skip to main content',
    atas: ID ? 'Kembali ke atas halaman' : 'Back to top',
    wa: ID ? 'Hubungi kami lewat WhatsApp' : 'Contact us on WhatsApp'
  };

  function siap(fn) {
    if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  siap(function () {
    /* ---------- 1. tautan lewati ---------- */
    var isi = d.querySelector('main') || d.querySelector('section');
    if (isi) {
      if (!isi.id) isi.id = 'isi-utama';
      var lewati = d.createElement('a');
      lewati.href = '#' + isi.id;
      lewati.textContent = TEKS.lewati;
      lewati.setAttribute('data-noedit', ''); lewati.setAttribute('data-runtime', '');
      lewati.style.cssText =
        'position:absolute;left:-9999px;top:0;z-index:200;background:' + DEEP +
        ';color:#fff;padding:12px 20px;font-weight:600;border-radius:0 0 3px 0;text-decoration:none';
      lewati.addEventListener('focus', function () { lewati.style.left = '0'; });
      lewati.addEventListener('blur', function () { lewati.style.left = '-9999px'; });
      d.body.insertBefore(lewati, d.body.firstChild);
    }

    /* ---------- 2. tombol WhatsApp ---------- */
    var nomor = (CFG.waNumber || '').replace(/[^0-9]/g, '');
    if (nomor) {
      var wa = d.createElement('a');
      wa.href = 'https://wa.me/' + nomor;
      wa.target = '_blank';
      wa.rel = 'noopener';
      wa.setAttribute('aria-label', TEKS.wa);
      wa.setAttribute('data-noedit', ''); wa.setAttribute('data-runtime', '');
      wa.style.cssText =
        'position:fixed;right:22px;bottom:88px;z-index:90;min-height:52px;border-radius:26px;' +
        'background:#1EA952;color:#fff;display:inline-flex;align-items:center;gap:10px;' +
        'padding:0 20px;text-decoration:none;font-weight:600;font-size:15px;' +
        'box-shadow:0 4px 16px rgba(10,34,64,.3)';
      wa.innerHTML =
        '<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
        '<path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01' +
        'c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2zm5.8 14.03c-.24.68-1.42 1.3-1.96 1.35-.5.05-.97.23-3.27-.68' +
        '-2.75-1.08-4.49-3.88-4.63-4.06-.13-.18-1.1-1.46-1.1-2.79s.7-1.98.95-2.25c.25-.27.54-.34.72-.34h.52c.17 0 .39-.06.61.47' +
        '.23.55.78 1.9.85 2.04.07.14.11.3.02.48-.09.18-.14.29-.27.45-.14.16-.29.35-.41.47-.14.14-.28.28-.12.55.16.27.71 1.17 1.52 1.9' +
        '1.04.93 1.92 1.21 2.19 1.35.27.14.43.11.59-.07.16-.18.68-.79.86-1.07.18-.27.36-.22.61-.13.25.09 1.6.75 1.87.89.27.14.45.2.52.32' +
        '.07.11.07.65-.17 1.33z"/></svg>WhatsApp';
      d.body.appendChild(wa);
    }

    /* ---------- 3. tombol ke atas ---------- */
    var atas = d.createElement('button');
    atas.type = 'button';
    atas.setAttribute('aria-label', TEKS.atas);
    atas.setAttribute('data-noedit', ''); atas.setAttribute('data-runtime', '');
    atas.style.cssText =
      'position:fixed;right:22px;bottom:22px;z-index:90;width:52px;height:52px;border:0;' +
      'border-radius:50%;background:' + SAND + ';color:#fff;cursor:pointer;' +
      'display:none;align-items:center;justify-content:center;' +
      'box-shadow:0 4px 16px rgba(10,34,64,.3)';
    atas.innerHTML =
      '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M12 19V6"/><path d="M5 13l7-7 7 7"/></svg>';
    atas.addEventListener('click', function () {
      var halus = !g.matchMedia || !g.matchMedia('(prefers-reduced-motion: reduce)').matches;
      g.scrollTo({ top: 0, behavior: halus ? 'smooth' : 'auto' });
    });
    d.body.appendChild(atas);

    var tampil = false;
    function cek() {
      var perlu = (g.pageYOffset || d.documentElement.scrollTop) > 400;
      if (perlu !== tampil) {
        tampil = perlu;
        atas.style.display = perlu ? 'inline-flex' : 'none';
      }
    }
    g.addEventListener('scroll', cek, { passive: true });
    cek();
  });

  /* ---------- 4. perbesar foto: <img data-zoom> ---------- */
  siap(function () {
    var lapis = null;
    function tutup() { if (lapis) { lapis.remove(); lapis = null; d.removeEventListener('keydown', esc); } }
    function esc(e) { if (e.key === 'Escape') tutup(); }
    d.addEventListener('click', function (e) {
      var im = e.target.closest && e.target.closest('img[data-zoom]');
      if (!im) return;
      // jangan ganggu Mode Edit
      if (d.querySelector('.pas-chip')) return;
      e.preventDefault();
      lapis = d.createElement('div');
      lapis.setAttribute('data-runtime', ''); lapis.setAttribute('data-noedit', '');
      lapis.setAttribute('role', 'dialog'); lapis.setAttribute('aria-label', im.alt || '');
      lapis.style.cssText = 'position:fixed;inset:0;z-index:2147483000;background:rgba(10,34,64,.88);display:flex;align-items:center;justify-content:center;padding:18px;cursor:zoom-out';
      var besar = d.createElement('img');
      besar.src = im.currentSrc || im.src; besar.alt = im.alt || '';
      besar.style.cssText = 'max-width:100%;max-height:100%;object-fit:contain;border-radius:4px;box-shadow:0 18px 50px rgba(0,0,0,.45);background:#fff';
      var x = d.createElement('button');
      x.type = 'button'; x.textContent = '\u00d7'; x.setAttribute('aria-label', ID ? 'Tutup' : 'Close');
      x.style.cssText = 'position:absolute;top:14px;right:16px;width:44px;height:44px;border:0;border-radius:50%;background:#fff;color:' + DEEP + ';font:700 26px/1 Arial,sans-serif;cursor:pointer';
      lapis.appendChild(besar); lapis.appendChild(x);
      lapis.addEventListener('click', tutup);
      d.body.appendChild(lapis);
      d.addEventListener('keydown', esc);
      x.focus();
    });
  });
})(window, document);
