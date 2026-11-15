/*
 * Membuat ulang assets/js/admin-data.js TANPA Chromium (lebih ringan dari buat-manifest.js).
 * Jalankan dari folder situs-pas setelah Anda mengubah isi file HTML secara langsung:
 *   npm i jsdom
 *   node tools/buat-manifest-ringan.js
 * Hasilnya identik dengan buat-manifest.js (sudah diuji pada ke-14 halaman).
 */
// Basisnya DOM statis — sama dengan yang dipakai site-edit.js saat menerapkan perubahan.
const { JSDOM } = require('jsdom');
const fs = require('fs'), path = require('path');
const root = process.argv[2] || process.cwd();
const SITE_EDIT = fs.readFileSync(path.join(root, 'assets/js/site-edit.js'), 'utf8');
const slugs = ['index','layanan','keberlanjutan','media','karir','kontak','legal'];
const out = {};
for (const lang of ['en','id']) for (const slug of slugs) {
  const file = (lang==='id'?'id/':'') + slug + '.html';
  const dom = new JSDOM(fs.readFileSync(path.join(root,file),'utf8'), { runScripts: 'outside-only' });
  const w = dom.window, document = w.document;
  w.localStorage = { getItem:()=>null, setItem(){} };
  w.eval(SITE_EDIT);
  const PASSite = w.PASSite;
  const secs=[...document.body.querySelectorAll('section')];
  const groups=[]; const gi={};
  function g(el){
    let key,label,kind;
    if(el.closest('footer')){key='footer';label='Footer';kind='footer';}
    else{
      const sec=el.closest('section');
      if(sec){
        const n=secs.indexOf(sec); key='s'+n; kind='section';
        const h=sec.querySelector('h1,h2');
        let t=h?h.textContent.trim():'';
        if(t.length>64)t=t.slice(0,61)+'…';
        label=(h?t:'Bagian tanpa judul');
      } else {
        let top=el; while(top.parentElement&&top.parentElement!==document.body)top=top.parentElement;
        if(top===document.body.firstElementChild){key='header';label='Header & menu';kind='header';}
        else{key='other';label='Catatan lain';kind='other';}
      }
    }
    if(!(key in gi)){gi[key]=groups.length;groups.push({label,kind});}
    return gi[key];
  }
  const texts=PASSite.textNodes(document).map((n,i)=>[i,g(n.parentElement),n.parentElement.tagName.toLowerCase(),n.nodeValue.trim()]);
  const imgs=PASSite.images(document).map((el,i)=>[i,g(el),el.getAttribute('src'),el.getAttribute('alt')||'']);
  out[lang+'/'+slug]={file,lang,title:document.title,groups,texts,images:imgs};
}
fs.writeFileSync(path.join(root, 'assets/js/admin-data.js'),
  '/* Dibuat otomatis: daftar teks & gambar tiap halaman untuk panel admin.\n' +
  '   Jika isi halaman HTML diubah langsung, jalankan ulang pembuatan manifest ini. */\n' +
  'window.PAS_MANIFEST=' + JSON.stringify(out) + ';\n');
Object.keys(out).forEach(k => console.log(k, 'teks:', out[k].texts.length, 'gambar:', out[k].images.length));
