const fs = require('fs');
const path = require('path');
const BLOGS_DIR = path.join(__dirname, 'Blogs');

let files = fs.readdirSync(BLOGS_DIR)
  .filter(f => f.endsWith('.html'))
  .map(f => {
    let content = fs.readFileSync(path.join(BLOGS_DIR,f), 'utf-8');
    let slug = f.replace(/\.html$/, '');
    let title = content.match(/<title>([^<]+)<\/title>/)[1];
    let date  = content.match(/<time datetime="([^"]+)"/)[1];
    let excerpt = content.match(/<article[\s\S]*?<p>([\s\S]*?)<\/p>/)[1];
    return { slug, title, date, excerpt };
  })
  .sort((a,b) => new Date(b.date) - new Date(a.date));

// Solo 3 últimas, rellena placeholders si faltan
let latest = files.slice(0,3);
while(latest.length<3) latest.push({ placeholder:true });

let html = latest.map(item => item.placeholder
  ? `<article class="blog-item placeholder"><div class="empty-card"></div></article>`
  : `<article class="blog-item">
       <img src="/Blogs/${item.slug}.jpg" alt="" loading="lazy">
       <div class="info">
         <time datetime="${item.date}">${item.date}</time>
         <h3>${item.title}</h3>
         <p>${item.excerpt}</p>
         <a href="https://reznero.com/AMZ-Top_products/${item.slug}/" class="btn-read">Read Article →</a>
       </div>
     </article>`
).join('\n');

// Genera archivo build-blog-list.js
fs.writeFileSync(
  path.join(__dirname,'build-blog-list.js'),
  `document.querySelector('#latest-blogs .blogs-grid').innerHTML = \`${html}\`;`
);
