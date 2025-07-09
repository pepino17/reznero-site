const fs = require('fs');
const path = require('path');
const { format } = require('date-fns');

// Configuration
const SITE_URL = 'https://reznero.com/AMZ-Top_products';
const BLOG_DIR = path.join(__dirname, 'blog');
const SITEMAP_PATH = path.join(__dirname, 'sitemap.xml');
const TODAY = format(new Date(), 'yyyy-MM-dd');

// Blog post template for sitemap
function createBlogPostEntry(slug, lastmod = TODAY, changefreq = 'weekly', priority = '0.7') {
  return `  <url>
    <loc>${SITE_URL}/blog/${slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

// Sample blog posts (in a real app, this would read from your blog directory or API)
const BLOG_POSTS = [
  { slug: 'best-tech-gadgets-2025', date: '2025-07-05' },
  { slug: 'home-essentials-on-amazon', date: '2025-06-28' },
  { slug: 'top-books-summer-reading', date: '2025-06-20' },
  { slug: 'kitchen-gadgets-worth-buying', date: '2025-06-15' },
  { slug: 'tech-accessories-for-productivity', date: '2025-06-10' },
];

// Generate blog post entries
const blogEntries = BLOG_POSTS.map(post => 
  createBlogPostEntry(post.slug, post.date)
).join('\n');

// Read the existing sitemap
fs.readFile(SITEMAP_PATH, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading sitemap:', err);
    return;
  }

  // Find the position to insert blog posts (before the closing </urlset> tag)
  const insertPosition = data.lastIndexOf('</url>') + 7; // 7 is the length of '</url>\n'
  
  // Create the new sitemap content
  const newSitemap = [
    data.slice(0, insertPosition),
    '\n  <!-- Blog Posts -->',
    blogEntries,
    '\n</urlset>'
  ].join('');

  // Write the updated sitemap
  fs.writeFile(SITEMAP_PATH, newSitemap, 'utf8', (err) => {
    if (err) {
      console.error('Error writing sitemap:', err);
      return;
    }
    console.log('Sitemap updated successfully with blog posts!');
  });
});
