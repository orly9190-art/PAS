/*
 * Membuat ulang assets/js/admin-data.js (daftar teks & gambar tiap halaman untuk panel admin).
 * Jalankan dari folder situs-pas setelah Anda mengubah isi file HTML secara langsung:
 *   npm i playwright && npx playwright install chromium
 *   node tools/buat-manifest.js
 */
const {chromium}=require('playwright');
const fs=require('fs'), path=require('path');
const root=process.cwd();
const slugs=['index','layanan','keberlanjutan','media','karir','kontak','legal'];
(async()=>{
  const b=await chromium.launch(); const p=await b.newPage();
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
      return {title:document.title,groups,texts,imgs};
    });
    out[lang+'/'+slug]={file,lang,title:d.title,groups:d.groups,texts:d.texts,images:d.imgs};
    console.log(lang+'/'+slug, 'teks:',d.texts.length,'gambar:',d.imgs.length,'grup:',d.groups.length);
  }
  await b.close();
  fs.writeFileSync('assets/js/admin-data.js','/* Dibuat otomatis: daftar teks & gambar tiap halaman untuk panel admin.\n   Jika isi halaman HTML diubah langsung, jalankan ulang pembuatan manifest ini. */\nwindow.PAS_MANIFEST='+JSON.stringify(out)+';\n');
  console.log('size',fs.statSync('assets/js/admin-data.js').size);
})().catch(e=>{console.error(e);process.exit(1)});
