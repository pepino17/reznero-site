const fs = require('fs-extra');
const path = require('path');
const Handlebars = require('handlebars');
const chokidar = require('chokidar');

const TEMPLATE_PATH = path.join(__dirname, '..', 'templates', 'post-template.html');
const DATA_DIR = path.join(__dirname, 'data', 'posts');
const DIST_DIR = path.join(__dirname, 'dist');

async function build() {
  await buildBlogList();
  const templateSrc = await fs.readFile(TEMPLATE_PATH, 'utf-8');
  const template = Handlebars.compile(templateSrc);

  const files = await fs.readdir(DATA_DIR);
  for (const file of files) {
    if (!file.endsWith('.json')) continue;
    const postData = await fs.readJson(path.join(DATA_DIR, file));

    // Generar summaryFields si no existen y hay productos
    if (!postData.summaryFields && postData.products && postData.products.length) {
      postData.summaryFields = Object.keys(postData.products[0]).filter(
        k => !['name', 'badge', 'image', 'altText', 'pros', 'cons', 'features', 'price', 'rating', 'link'].includes(k)
      );
    }

    // Generar TOC si no existe (opcional, aquí lo dejamos vacío)
    if (!postData.toc) {
      postData.toc = [];
    }

    const html = template(postData);
    const outDir = path.join(DIST_DIR, postData.slug);
    await fs.ensureDir(outDir);
    await fs.writeFile(path.join(outDir, 'index.html'), html, 'utf-8');
    console.log(`Generated: ${outDir}/index.html`);
  }
}

async function watch() {
  await build();
  chokidar.watch([TEMPLATE_PATH, DATA_DIR]).on('change', async () => {
    console.log('Change detected, rebuilding...');
    await build();
  });
}

if (require.main === module) {
  if (process.argv.includes('--watch')) {
    watch();
  } else {
    build();
  }
}

module.exports = { build };

// --- BLOG LIST GENERATION ---
async function buildBlogList() {
  const blogsDir = path.join(__dirname, 'Blogs');
  const outJs = path.join(__dirname, 'build-blog-list.js');
  const files = (await fs.readdir(blogsDir)).filter(f => f.endsWith('.html'));
  let blogObjs = [];
  for(const file of files){
    const filePath = path.join(blogsDir, file);
    const html = await fs.readFile(filePath, 'utf-8');
    const slug = file.replace(/\.html$/, '');
    // Extraer <title>
    const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : slug;
    // Extraer <time datetime="...">...</time>
    let datePublished = '';
    const timeMatch = html.match(/<time[^>]*datetime=["']([^"']+)["'][^>]*>([^<]*)<\/time>/i);
    if(timeMatch){
      datePublished = timeMatch[1];
    }else{
      // Buscar en JSON-LD si existe
      const ldMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i);
      if(ldMatch){
        try{
          const ld = JSON.parse(ldMatch[1]);
          if(ld.datePublished) datePublished = ld.datePublished;
        }catch(e){}
      }
    }
    // Extraer excerpt: primer <p> dentro de <article>, si no hay, primer <p> global
    let excerpt = '';
    let articleMatch = html.match(/<article[\s\S]*?<p[^>]*>(.*?)<\/p>/is);
    if(articleMatch){
      excerpt = articleMatch[1].replace(/<[^>]+>/g, '').trim();
    }else{
      const pMatch = html.match(/<p[^>]*>(.*?)<\/p>/is);
      if(pMatch){
        excerpt = pMatch[1].replace(/<[^>]+>/g, '').trim();
      }
    }
    blogObjs.push({slug, title, datePublished, excerpt});
  }
  // Ordenar por datePublished descendente (ISO 8601 fechas)
  blogObjs.sort((a, b) => (b.datePublished || '').localeCompare(a.datePublished || ''));
  // Limitar a los 3 últimos blogs
  const latestBlogs = blogObjs.slice(0, 3);
  // Generar HTML solo para los más recientes
  const articlesHtml = latestBlogs.map(({slug, title, datePublished, excerpt}) =>
    `<article class="blog-item">
      <a href="https://reznero.com/AMZ-Top_products/${slug}/">
        <h3>${title}</h3>
        ${datePublished ? `<time datetime="${datePublished}">${datePublished}</time>` : ''}
        <p>${excerpt}</p>
      </a>
    </article>`
  ).join('\n');
  const js = `document.getElementById('latest-blogs').innerHTML = `<h2>Latest Blog Posts</h2>` + `${articlesHtml}`;`;
  await fs.writeFile(outJs, js, 'utf-8');
  console.log('Generated: build-blog-list.js');
}
