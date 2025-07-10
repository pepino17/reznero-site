import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Configuración de rutas para módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuración
const BLOG_POSTS_FILE = path.join(__dirname, 'assets', 'data', 'blog-posts.json');
const TEMPLATE_FILE = path.join(__dirname, 'blog-post-template.html');
const OUTPUT_DIR = path.join(__dirname, 'blog-posts');

async function generateBlogPosts() {
  try {
    // Leer el archivo de posts
    const postsData = await fs.readFile(BLOG_POSTS_FILE, 'utf-8');
    const posts = JSON.parse(postsData);
    
    // Leer la plantilla
    const template = await fs.readFile(TEMPLATE_FILE, 'utf-8');
    
    // Crear el directorio de salida si no existe
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
    
    // Generar un archivo para cada post
    for (const post of posts) {
      const postDir = path.join(OUTPUT_DIR, post.slug);
      await fs.mkdir(postDir, { recursive: true });
      
      // Reemplazar placeholders en la plantilla
      let postHtml = template
        .replace(/{{TITLE}}/g, post.title)
        .replace(/{{CONTENT}}/g, generatePostContent(post))
        .replace(/{{DATE}}/g, post.datePublished)
        .replace(/{{IMAGE}}/g, post.image)
        .replace(/{{CATEGORY}}/g, post.categoryName);
      
      // Escribir el archivo index.html en la carpeta del post
      await fs.writeFile(
        path.join(postDir, 'index.html'),
        postHtml,
        'utf-8'
      );
      
      console.log(`✅ Generado: ${post.slug}/index.html`);
    }
    
    console.log('\n✅ Todos los posts han sido generados correctamente.');
    console.log(`📂 Los archivos se encuentran en: ${OUTPUT_DIR}`);
    
  } catch (error) {
    console.error('❌ Error al generar los posts:', error);
    process.exit(1);
  }
}

function generatePostContent(post) {
  return `
    <article class="blog-post">
      <header class="post-header">
        <h1>${post.title}</h1>
        <div class="post-meta">
          <time datetime="${post.datePublished}">${post.datePublished}</time>
          <span class="category">${post.categoryName}</span>
        </div>
        ${post.image ? `<img src="/AMZ-Top_products/assets/images/${post.image}" alt="${post.title}" class="post-image">` : ''}
      </header>
      <div class="post-content">
        <!-- El contenido del post se cargará dinámicamente -->
        <div id="post-content">Cargando contenido...</div>
      </div>
    </article>
    
    <script>
      // Cargar el contenido del post dinámicamente
      document.addEventListener('DOMContentLoaded', async () => {
        try {
          const response = await fetch('/AMZ-Top_products/assets/data/blog-posts.json');
          const posts = await response.json();
          const post = posts.find(p => p.slug === '${post.slug}');
          
          if (post && post.content) {
            document.getElementById('post-content').innerHTML = post.content;
          } else {
            document.getElementById('post-content').innerHTML = 
              '<p>No se pudo cargar el contenido del post. Por favor, inténtalo de nuevo más tarde.</p>';
          }
        } catch (error) {
          console.error('Error al cargar el post:', error);
          document.getElementById('post-content').innerHTML = 
            '<p>Error al cargar el contenido del post. Por favor, inténtalo de nuevo más tarde.</p>';
        }
      });
    </script>
  `;
}

// Ejecutar la generación
generateBlogPosts();
