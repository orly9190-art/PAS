/*
 * PT Prima Armada Samudra - tabel domain di halaman Links/Tautan.
 * Baris disimpan di localStorage (kunci KEY, sama untuk EN/ID/中文).
 * Tanpa data tersimpan, baris awal dibaca dari <tr data-link data-status> di HTML,
 * jadi file hasil "Unduh website + semua perubahan" sudah memuat daftar terbaru.
 * Tombol tambah/hapus hanya muncul untuk admin yang sudah login.
 */
(function (g, d) {
  'use strict';
  var KEY = 'pas_links_v1';
  var LANG = (d.documentElement.lang || 'en').slice(0, 2);
  var T = {
    en: { ok: 'Available', no: 'Not available', grpNo: 'Not available', add: 'Add row', del: 'Delete', ph: 'e.g. example.com',
          tambah: 'Add domain', batal: 'Cancel', kosong: 'No domains yet.', yakin: 'Confirm delete?', reset: 'Restore default list',
          info: 'Admin: add or delete rows here. Changes are saved in this browser; use "Download website + all changes" in the admin panel to publish them.' },
    id: { ok: 'Tersedia', no: 'Tidak tersedia', grpNo: 'Tidak tersedia', add: 'Tambah baris', del: 'Hapus', ph: 'mis. contoh.com',
          tambah: 'Tambah domain', batal: 'Batal', kosong: 'Belum ada domain.', yakin: 'Yakin hapus?', reset: 'Kembalikan daftar awal',
          info: 'Admin: tambah atau hapus baris di sini. Perubahan tersimpan di browser ini; pakai "Unduh website + semua perubahan" di panel admin untuk menerbitkannya.' },
    zh: { ok: '可用', no: '不可用', grpNo: '不可用', add: '添加一行', del: '删除', ph: '例如 example.com',
          tambah: '添加域名', batal: '取消', kosong: '暂无域名。', yakin: '确认删除？', reset: '恢复默认列表',
          info: '管理员：可在此添加或删除行。更改保存在本浏览器中；请在管理面板使用“下载网站及所有更改”发布。' }
  }[LANG] || null;

  function admin() {
    try {
      if (g.sessionStorage.getItem('pas_admin_session') === '1') return true;
      return (+g.localStorage.getItem('pas_admin_login') || 0) > Date.now();
    } catch (e) { return false; }
  }
  function muat(tb) {
    try { var x = JSON.parse(g.localStorage.getItem(KEY)); if (x && Array.isArray(x.rows)) return x.rows; } catch (e) {}
    return Array.prototype.map.call(tb.querySelectorAll('tr[data-link]'), function (tr) {
      return { link: tr.getAttribute('data-link'), status: tr.getAttribute('data-status') === 'no' ? 'no' : 'ok' };
    });
  }
  function simpan(rows) {
    try { g.localStorage.setItem(KEY, JSON.stringify({ rows: rows, ts: Date.now() })); } catch (e) {}
  }
  function el(tag, css, txt) { var x = d.createElement(tag); if (css) x.style.cssText = css; if (txt != null) x.textContent = txt; return x; }

  var TD = 'padding: 15px 20px; font-size: 15px; ';
  function mulai() {
    var tb = d.querySelector('tbody[data-pas-links]');
    if (!tb || !T) return;
    var awal = Array.prototype.map.call(tb.querySelectorAll('tr[data-link]'), function (tr) {
      return { link: tr.getAttribute('data-link'), status: tr.getAttribute('data-status') === 'no' ? 'no' : 'ok' };
    });
    var rows = muat(tb), isAdmin = admin();

    function render() {
      tb.innerHTML = '';
      var ok = [], no = [];
      rows.forEach(function (r, i) { (r.status === 'no' ? no : ok).push(i); });
      if (!rows.length) { var tr0 = el('tr'); var td0 = el('td', TD + 'color: #56697E', T.kosong); td0.colSpan = 3; tr0.appendChild(td0); tb.appendChild(tr0); }
      function baris(i, n) {
        var r = rows[i];
        var tr = el('tr', 'border-bottom: 1px solid #DEE6EE');
        tr.setAttribute('data-link', r.link); tr.setAttribute('data-status', r.status);
        tr.appendChild(el('td', TD + 'font-weight: 600; color: #0A2240; width: 70px', String(n)));
        tr.appendChild(el('td', TD + 'color: #0A2240; font-weight: 600; word-break: break-all', r.link));
        var st = el('td', TD + 'width: 230px');
        var b = el('span', 'display: inline-block; padding: 4px 12px; border-radius: 999px; font-size: 13px; font-weight: 700; ' +
          (r.status === 'no' ? 'background: #FBE9E7; color: #B3261E' : 'background: #E3F4EA; color: #1B7A43'), r.status === 'no' ? T.no : T.ok);
        st.appendChild(b);
        if (isAdmin) {
          var x = el('button', 'margin-left: 10px; min-height: 30px; padding: 0 10px; border: 1px solid #DEE6EE; background: #FFFFFF; color: #B3261E; border-radius: 3px; font: inherit; font-size: 12.5px; font-weight: 700; cursor: pointer', T.del);
          x.type = 'button'; x.setAttribute('data-runtime', ''); x.setAttribute('aria-label', T.del + ' ' + r.link);
          // Tanpa confirm(): di dalam artifact Claude jendela konfirmasi diblokir sehingga selalu dianggap "batal".
          // Klik pertama mengubah tombol jadi "Yakin hapus?", klik kedua (dalam 4 detik) menghapus.
          x.onclick = function () {
            if (x.getAttribute('data-yakin') === '1') { rows.splice(i, 1); simpan(rows); render(); return; }
            x.setAttribute('data-yakin', '1'); x.textContent = T.yakin;
            x.style.background = '#B3261E'; x.style.color = '#FFFFFF'; x.style.borderColor = '#B3261E';
            setTimeout(function () { if (x.isConnected) { x.removeAttribute('data-yakin'); x.textContent = T.del; x.style.background = '#FFFFFF'; x.style.color = '#B3261E'; x.style.borderColor = '#DEE6EE'; } }, 4000);
          };
          st.appendChild(x);
        }
        tr.appendChild(st);
        tb.appendChild(tr);
      }
      ok.forEach(function (i, k) { baris(i, k + 1); });
      if (no.length) {
        var h = el('tr', 'background: #F3F7FA'); h.setAttribute('data-runtime', '');
        var th = el('td', 'padding: 10px 20px; font-size: 12.5px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #56697E', T.grpNo);
        th.colSpan = 3; h.appendChild(th); tb.appendChild(h);
        no.forEach(function (i, k) { baris(i, k + 1); });
      }
    }

    function panel() {
      var box = el('div', 'margin-top: 18px; padding: 16px 18px; background: #FFFFFF; border: 1px dashed #C9872F; border-radius: 3px');
      box.setAttribute('data-runtime', ''); box.setAttribute('data-noedit', '');
      box.appendChild(el('p', 'margin: 0 0 12px; font-size: 13px; color: #56697E; line-height: 1.6', T.info));
      var f = el('form', 'display: flex; flex-wrap: wrap; gap: 10px; align-items: center');
      var inp = el('input', 'flex: 1 1 220px; min-height: 40px; padding: 0 12px; border: 1px solid #C7D3DF; border-radius: 3px; font: inherit; font-size: 15px');
      inp.placeholder = T.ph; inp.setAttribute('aria-label', T.ph); inp.required = true;
      var sel = el('select', 'min-height: 40px; padding: 0 10px; border: 1px solid #C7D3DF; border-radius: 3px; font: inherit; font-size: 15px; background: #FFFFFF');
      [['ok', T.ok], ['no', T.no]].forEach(function (o) { var op = el('option', null, o[1]); op.value = o[0]; sel.appendChild(op); });
      sel.setAttribute('aria-label', 'Status');
      var go = el('button', 'min-height: 40px; padding: 0 18px; border: 0; background: #0A2240; color: #FFFFFF; border-radius: 3px; font: inherit; font-size: 14px; font-weight: 700; cursor: pointer', '+ ' + T.tambah);
      go.type = 'submit';
      var rs = el('button', 'min-height: 40px; padding: 0 12px; border: 1px solid #DEE6EE; background: #FFFFFF; color: #56697E; border-radius: 3px; font: inherit; font-size: 13px; cursor: pointer', T.reset);
      rs.type = 'button';
      rs.onclick = function () { rows = awal.map(function (r) { return { link: r.link, status: r.status }; }); try { g.localStorage.removeItem(KEY); } catch (e) {} render(); };
      f.onsubmit = function (e) {
        e.preventDefault();
        var v = inp.value.trim().replace(/^https?:\/\//i, '').replace(/\/+$/, '');
        if (!v) return;
        rows.push({ link: v, status: sel.value }); simpan(rows); render(); inp.value = ''; inp.focus();
      };
      f.appendChild(inp); f.appendChild(sel); f.appendChild(go); f.appendChild(rs);
      box.appendChild(f);
      var wrap = tb.closest('table').parentNode;
      wrap.parentNode.insertBefore(box, wrap.nextSibling);
    }

    render();
    if (isAdmin) panel();
  }
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', mulai); else mulai();
})(window, document);
