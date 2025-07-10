import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { JSDOM } from 'jsdom';

// Get the current directory name in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const BLOGS_DIR = path.join(__dirname, 'Blogs');
const OUTPUT_DIR = path.join(__dirname, 'assets', 'data');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'blog-posts.json');

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
    const slug = path.basename(filePath, '.html');
    
    // Extract date from meta tags or time element
    let datePublished = '';
    const dateMeta = doc.querySelector('meta[property="article:published_time"], meta[name="date"]');
    if (dateMeta) {
      datePublished = dateMeta.getAttribute('content') || dateMeta.getAttribute('value') || '';
    } else {
      const timeElement = doc.querySelector('time[datetime]');
      if (timeElement) {
        datePublished = timeElement.getAttribute('datetime');
      }
    }

    // Extract excerpt (first paragraph in article)
    const excerpt = doc.querySelector('article p')?.textContent?.trim() || '';
    
    // Extract category from breadcrumbs (if available)
    let categoryName = '';
    let categorySlug = '';
    const breadcrumbLinks = doc.querySelectorAll('.breadcrumbs a');
    if (breadcrumbLinks.length >= 2) {
      const categoryLink = breadcrumbLinks[1];
      categoryName = categoryLink.textContent.trim();
      const href = categoryLink.getAttribute('href') || '';
      categorySlug = href.split('/').filter(Boolean).pop() || '';
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
      url: `https://reznero.com/AMZ-Top_products/${slug}/`
    };
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
    return null;
  }
}

/**
 * Process all blog posts in the Blogs directory
 */
function processBlogs() {
  try {
    // Create output directory if it doesn't exist
    if (!fs.existsSync(OUTPUT_DIR)) {
      console.log(`Creating directory: ${OUTPUT_DIR}`);
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    } else {
      console.log(`Output directory exists: ${OUTPUT_DIR}`);
    }

    // Check if Blogs directory exists
    if (!fs.existsSync(BLOGS_DIR)) {
      throw new Error(`Blogs directory not found: ${BLOGS_DIR}`);
    }

    // Get all HTML files in the Blogs directory
    console.log(`Reading files from: ${BLOGS_DIR}`);
    const files = fs.readdirSync(BLOGS_DIR)
      .filter(file => file.endsWith('.html'))
      .map(file => path.join(BLOGS_DIR, file));
      
    console.log(`Found ${files.length} blog post files`);

    if (files.length === 0) {
      console.warn('No blog post files found in the Blogs directory');
      return [];
    }

    // Process each file and extract metadata
    const posts = files
      .map(filePath => extractMetadata(filePath))
      .filter(Boolean) // Remove any null entries from failed processing
      .sort((a, b) => new Date(b.datePublished) - new Date(a.datePublished)); // Sort by date (newest first)

    // Save to JSON file
    const jsonData = JSON.stringify(posts, null, 2);
    fs.writeFileSync(OUTPUT_FILE, jsonData, 'utf8');
    console.log(`✅ Processed ${posts.length} blog posts`);
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
