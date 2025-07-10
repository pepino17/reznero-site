const fs = require('fs-extra');
const path = require('path');
const Handlebars = require('handlebars');
const chokidar = require('chokidar');

const TEMPLATE_PATH = path.join(__dirname, '..', 'templates', 'post-template.html');
const DATA_DIR = path.join(__dirname, 'data', 'posts');
const DIST_DIR = path.join(__dirname, 'dist');

async function build() {
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
