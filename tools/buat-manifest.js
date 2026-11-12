/*
 * Membuat ulang assets/js/admin-data.js (daftar teks & gambar tiap halaman untuk panel admin).
 * Jalankan dari folder situs-pas setelah Anda mengubah isi file HTML secara langsung:
 *   npm i playwright && npx playwright install chromium
 *   node tools/buat-manifest.js
 */
const {chromium}=require('playwright');
// DOM dibaca dalam keadaan asli (sebelum pas-data.js mengisi berita/lowongan), sama seperti saat site-edit.js bekerja di halaman publik.
const fs=require('fs'), path=require('path');
const root=process.cwd();
const slugs=['index','layanan','keberlanjutan','media','karir','kontak','legal'];
(async()=>{
  const b=await chromium.launch(); const p=await b.newPage();
  await p.route(/\/(pas-data|site-search|admin-data)\.js$/, r=>r.abort());
  const out={};
  for (const lang of ['en','id']) for (const slug of slugs) {
    const file=(lang==='id'?'id/':'')+slug+'.html';
    await p.goto('file://'+path.join(root,file));
    const d=await p.evaluate(()=>{
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
      // urutkan grup sesuai urutan kemunculan di halaman (sudah demikian), header di depan
      // daftar poin (misi, kartu, butir, pasal, baris tabel) yang bisa ditambah/dihapus lewat admin
      const tn=PASSite.textNodes(document), im=PASSite.images(document);
      const lists=PASSite.lists(document).map(l=>{
        const pv=el=>{const a=PASSite.textNodesIn(el).map(n=>n.nodeValue.trim()); let t=(l.num&&l.num.mode==='whole'?a.slice(1):a).join(' ').replace(/^\d{1,3}\.\s+/,''); return t.length>70?t.slice(0,67)+'…':t;};
        return {g:g(l.el),tag:l.el.tagName,n:l.items.length,ti:l.ti,
          num:l.num?{mode:l.num.mode,start:l.num.start,pad:l.num.pad}:null,
          items:l.items.map(it=>({t:PASSite.textNodesIn(it).map(x=>tn.indexOf(x)),p:pv(it)})),
          tpl:{t:PASSite.textNodesIn(l.tplEl).map(x=>[x.parentNode.tagName.toLowerCase(),x.nodeValue.trim()]),
               im:Array.from(l.tplEl.querySelectorAll('img')).map(x=>[x.getAttribute('src'),x.getAttribute('alt')||''])}};
      });
      return {title:document.title,groups,texts,imgs,lists};
    });
    out[lang+'/'+slug]={file,lang,title:d.title,groups:d.groups,texts:d.texts,images:d.imgs,lists:d.lists};
    console.log(lang+'/'+slug, 'teks:',d.texts.length,'gambar:',d.imgs.length,'grup:',d.groups.length,'daftar:',d.lists.length);
  }
  await b.close();
  fs.writeFileSync(process.env.OUT||'assets/js/admin-data.js','/* Dibuat otomatis: daftar teks & gambar tiap halaman untuk panel admin.\n   Jika isi halaman HTML diubah langsung, jalankan ulang pembuatan manifest ini. */\nwindow.PAS_MANIFEST='+JSON.stringify(out)+';\n');
  console.log('size',fs.statSync('assets/js/admin-data.js').size);
})().catch(e=>{console.error(e);process.exit(1)});
