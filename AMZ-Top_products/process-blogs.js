import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { JSDOM } from 'jsdom';
import { execSync } from 'child_process';

// Get the current directory name in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const BLOGS_DIR = path.join(__dirname, 'Blogs');
const OUTPUT_DIR = path.join(__dirname, 'assets', 'data');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'blog-posts.json');
const BLOG_OUTPUT_DIR = path.join(__dirname, 'blog');
const MAIN_INDEX = path.join(__dirname, 'index.html');

/**
 * Create URL-friendly slug from string
 * @param {string} str - String to convert to slug
 * @returns {string} URL-friendly slug
 */
function createSlug(str) {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-')       // Replace spaces with -
    .replace(/--+/g, '-')       // Replace multiple - with single -
    .trim();
}

/**
 * Extract metadata from a blog post HTML file
 * @param {string} filePath - Path to the blog post HTML file
 * @returns {Object} Extracted metadata
 */
function extractMetadata(filePath) {
  try {
    const html = fs.readFileSync(filePath, 'utf8');
    const dom = new JSDOM(html);
    const doc = dom.window.document;

    // Extract basic information
    const title = doc.querySelector('title')?.textContent || 'Untitled';
    const slug = createSlug(path.basename(filePath, '.html'));
    
    // Extract date from meta tags, time element, or use file creation date
    let datePublished = '';
    const dateMeta = doc.querySelector('meta[property="article:published_time"], meta[name="date"]');
    if (dateMeta) {
      datePublished = dateMeta.getAttribute('content') || dateMeta.getAttribute('value') || '';
    } else {
      const timeElement = doc.querySelector('time[datetime]');
      if (timeElement) {
        datePublished = timeElement.getAttribute('datetime');
      } else {
        // Use file creation date as fallback
        const stats = fs.statSync(filePath);
        datePublished = stats.birthtime.toISOString();
      }
    }

    // Extract excerpt (first paragraph in article)
    const excerpt = doc.querySelector('article p')?.textContent?.trim() || '';
    
    // Extract category from breadcrumbs or use default
    let categoryName = 'Uncategorized';
    let categorySlug = 'uncategorized';
    const breadcrumbLinks = doc.querySelectorAll('.breadcrumbs a');
    if (breadcrumbLinks.length >= 2) {
      const categoryLink = breadcrumbLinks[1];
      if (categoryLink) {
        categoryName = categoryLink.textContent.trim();
        const href = categoryLink.getAttribute('href') || '';
        categorySlug = href.split('/').filter(Boolean).pop() || createSlug(categoryName);
      }
    }

    // Extract featured image (if available)
    let image = '';
    const ogImage = doc.querySelector('meta[property="og:image"]');
    if (ogImage) {
      image = ogImage.getAttribute('content') || '';
    } else {
      const firstImage = doc.querySelector('article img');
      if (firstImage) {
        image = firstImage.getAttribute('src') || '';
      }
    }

    return {
      slug,
      title,
      datePublished,
      excerpt: excerpt.length > 200 ? excerpt.substring(0, 200) + '...' : excerpt,
      categoryName,
      categorySlug,
      image,
      filename: path.basename(filePath),
      url: `/blog/${slug}/`
    };
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
    return null;
  }
}

/**
 * Ensure directory exists, create if it doesn't
 * @param {string} dirPath - Directory path to check/create
 */
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    console.log(`Creating directory: ${dirPath}`);
    fs.mkdirSync(dirPath, { recursive: true });
  } else {
    console.log(`Directory exists: ${dirPath}`);
  }
}

/**
 * Process a single blog post file
 * @param {string} filePath - Path to the blog post file
 * @param {Array} allPosts - Array of all blog posts
 * @returns {Object} Processed post metadata
 */
function processBlogPost(filePath, allPosts) {
  const stats = fs.statSync(filePath);
  const slug = createSlug(path.basename(filePath, '.html'));
  const outputDir = path.join(BLOG_OUTPUT_DIR, slug);
  const outputFile = path.join(outputDir, 'index.html');
  
  // Skip if output is newer than source
  if (fs.existsSync(outputFile) && fs.statSync(outputFile).mtime > stats.mtime) {
    console.log(`Skipping up-to-date: ${filePath}`);
    return null;
  }

  console.log(`Processing: ${filePath}`);
  
  // Read and update the HTML content
  let html = fs.readFileSync(filePath, 'utf8');
  const dom = new JSDOM(html);
  const doc = dom.window.document;
  
  // Update any internal links to be relative
  const links = doc.querySelectorAll('a[href^="/"], link[href^="/"], script[src^="/"], img[src^="/"], source[src^="/"]');
  links.forEach(el => {
    const attr = el.hasAttribute('href') ? 'href' : 'src';
    const value = el.getAttribute(attr);
    if (value.startsWith('/assets/')) {
      el.setAttribute(attr, `../../assets${value.substring(8)}`);
    } else if (value.startsWith('/')) {
      el.setAttribute(attr, `../..${value}`);
    }
  });
  
  // Add canonical URL
  let head = doc.querySelector('head');
  if (!head) {
    head = doc.createElement('head');
    doc.documentElement.insertBefore(head, doc.body);
  }
  
  // Create output directory and write the file
  ensureDirectoryExists(outputDir);
  fs.writeFileSync(outputFile, doc.documentElement.outerHTML);
  
  // Extract and return metadata
  return extractMetadata(filePath);
}

/**
 * Update the main index.html with blog listings
 * @param {Array} posts - Array of blog post metadata
 */
function updateMainIndex(posts) {
  if (!fs.existsSync(MAIN_INDEX)) {
    console.warn(`Main index file not found: ${MAIN_INDEX}`);
    return;
  }
  
  let html = fs.readFileSync(MAIN_INDEX, 'utf8');
  const dom = new JSDOM(html);
  const doc = dom.window.document;
  
  // Find or create blog section
  let blogSection = doc.getElementById('blog-posts');
  if (!blogSection) {
    blogSection = doc.createElement('section');
    blogSection.id = 'blog-posts';
    blogSection.innerHTML = '<h2>Latest Blog Posts</h2><div class="blog-grid"></div>';
    const main = doc.querySelector('main') || doc.body;
    main.appendChild(blogSection);
  }
  
  const blogGrid = blogSection.querySelector('.blog-grid') || blogSection;
  blogGrid.innerHTML = ''; // Clear existing content
  
  // Sort posts by date (newest first)
  const sortedPosts = [...posts].sort((a, b) => 
    new Date(b.datePublished) - new Date(a.datePublished)
  );
  
  // Add blog post cards
  sortedPosts.forEach(post => {
    const postElement = doc.createElement('article');
    postElement.className = 'blog-card';
    postElement.innerHTML = `
      <h3><a href="${post.url}">${post.title}</a></h3>
      <p class="post-meta">${new Date(post.datePublished).toLocaleDateString()}</p>
      <p class="post-excerpt">${post.excerpt}</p>
      <a href="${post.url}" class="read-more">Read more →</a>
    `;
    blogGrid.appendChild(postElement);
  });
  
  // Save the updated index.html
  fs.writeFileSync(MAIN_INDEX, doc.documentElement.outerHTML);
}

/**
 * Process all blog posts in the Blogs directory
 */
function processBlogs() {
  try {
    // Ensure necessary directories exist
    ensureDirectoryExists(OUTPUT_DIR);
    ensureDirectoryExists(BLOG_OUTPUT_DIR);
    ensureDirectoryExists(path.join(__dirname, 'assets'));

    // Check if Blogs directory exists
    if (!fs.existsSync(BLOGS_DIR)) {
      throw new Error(`Blogs directory not found: ${BLOGS_DIR}`);
    }

    // Get all HTML files in the Blogs directory
    console.log(`Reading files from: ${BLOGS_DIR}`);
    const files = fs.readdirSync(BLOGS_DIR)
      .filter(file => file.endsWith('.html'))
      .map(file => path.join(BLOGS_DIR, file));
      
    console.log(`Found ${files.length} blog post(s) to process`);

    // Process each file and collect metadata
    const posts = [];
    for (const file of files) {
      try {
        const post = processBlogPost(file, posts);
        if (post) {
          posts.push(post);
        }
      } catch (error) {
        console.error(`Error processing ${file}:`, error);
      }
    }

    // Write metadata to JSON file
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(posts, null, 2));
    console.log(`Successfully wrote metadata to ${OUTPUT_FILE}`);

    // Update main index with blog listings
    updateMainIndex(posts);
    console.log('Updated main index with blog listings');

    return posts;
    console.log(`📄 Output saved to: ${OUTPUT_FILE}`);
    
    return { success: true, count: posts.length, outputFile: OUTPUT_FILE };
    
    return { success: false, error: error.message };
  } catch (error) {
    console.error('Error processing blog posts:', error);
    return [];
  }
}

// Run the processing if this file is executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  processBlogs();
}

export { processBlogs };
