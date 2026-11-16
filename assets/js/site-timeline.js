/*
 * PT Prima Armada Samudra - garis waktu milestone (halaman Tentang Kami).
 * Tombol tahun untuk menyaring, dan animasi kartu serta bar armada saat digulir.
 * Tanpa skrip ini semua kartu tetap tampil lengkap.
 */
(function () {
  'use strict';
  var wrap = document.querySelector('.tl-wrap');
  if (!wrap) return;
  var items = Array.prototype.slice.call(wrap.querySelectorAll('.tl-item'));
  var pills = Array.prototype.slice.call(document.querySelectorAll('.tl-pill'));
  var gerak = !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  function sisi() {
    var n = 0;
    items.forEach(function (it) {
      if (it.hidden) return;
      it.classList.toggle('kanan', n % 2 === 1);
      n++;
    });
  }

  function saring(tahun) {
    pills.forEach(function (p) {
      var on = p.getAttribute('data-year') === tahun;
      p.classList.toggle('on', on);
      p.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    items.forEach(function (it) { it.hidden = tahun !== 'all' && it.getAttribute('data-year') !== tahun; });
    sisi();
  }

  pills.forEach(function (p) {
    p.addEventListener('click', function () {
      if (document.body.hasAttribute('data-ed-aktif') || p.isContentEditable || p.querySelector('[contenteditable="true"]')) return;
      saring(p.getAttribute('data-year'));
    });
  });
  sisi();

  if (gerak) {
    document.documentElement.classList.add('tl-js');
    var sisa = items.slice();
    var cek = function () {
      var batas = window.innerHeight * 0.9;
      sisa = sisa.filter(function (it) {
        if (it.getBoundingClientRect().top < batas) { it.classList.add('in'); return false; }
        return true;
      });
      if (!sisa.length) { window.removeEventListener('scroll', cek); window.removeEventListener('resize', cek); }
    };
    window.addEventListener('scroll', cek, { passive: true });
    window.addEventListener('resize', cek);
    setTimeout(cek, 60);
    // pengaman: jika karena sesuatu tidak terpicu, tampilkan semua
    setTimeout(function () { items.forEach(function (it) { it.classList.add('in'); }); }, 8000);
  }
})();
