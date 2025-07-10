import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const BLOG_POSTS_DIR = join(__dirname, 'blog-posts');
const BLOG_DATA_FILE = join(__dirname, 'assets', 'data', 'blog-posts.json');
const BLOG_BASE_PATH = '/AMZ-Top_products';

// Function to update all blog post URLs in the JSON file
function updateBlogPostUrls() {
    try {
        // Read the existing blog posts data
        const blogData = JSON.parse(readFileSync(BLOG_DATA_FILE, 'utf8'));
        
        // Get all blog post directories
        const blogDirs = readdirSync(BLOG_POSTS_DIR, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);
        
        // Update URLs for each blog post
        const updatedBlogData = blogData.map(post => {
            if (blogDirs.includes(post.slug)) {
                return {
                    ...post,
                    url: `${BLOG_BASE_PATH}/${post.slug}/`
                };
            }
            return post;
        });
        
        // Ensure the directory exists
        if (!existsSync(dirname(BLOG_DATA_FILE))) {
            mkdirSync(dirname(BLOG_DATA_FILE), { recursive: true });
        }
        
        // Write the updated data back to the file
        writeFileSync(BLOG_DATA_FILE, JSON.stringify(updatedBlogData, null, 2));
        console.log('✅ Successfully updated blog post URLs');
        console.log('Updated blog posts:', updatedBlogData);
        
    } catch (error) {
        console.error('❌ Error updating blog post URLs:', error);
    }
}

// Function to create a new blog post with the correct structure
function createNewBlogPost(slug, title, category) {
    const blogDir = path.join(BLOG_POSTS_DIR, slug);
    const blogIndexFile = path.join(blogDir, 'index.html');
    
    // Create the blog post directory if it doesn't exist
    if (!existsSync(blogDir)) {
        mkdirSync(blogDir, { recursive: true });
    }
    
    // Create a basic index.html for the blog post if it doesn't exist
    if (!fs.existsSync(blogIndexFile)) {
        const template = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <link rel="stylesheet" href="/assets/css/styles.css">
</head>
<body>
    <div class="blog-post">
        <h1>${title}</h1>
        <div class="blog-content">
            <!-- Your blog content goes here -->
            <p>This is a new blog post about ${title}.</p>
        </div>
    </div>
</body>
</html>`;
        
writeFileSync(blogIndexFile, template);
        console.log(`✅ Created new blog post: ${slug}`);
    }
    
    // Add the new blog post to the blog-posts.json file
    updateBlogPostInManifest(slug, title, category);
}

// Function to update the blog post in the manifest
function updateBlogPostInManifest(slug, title, category) {
    try {
        let blogData = [];
        
        // Read existing data if the file exists
        if (existsSync(BLOG_DATA_FILE)) {
            blogData = JSON.parse(readFileSync(BLOG_DATA_FILE, 'utf8'));
        }
        
        // Check if the blog post already exists
        const existingPostIndex = blogData.findIndex(post => post.slug === slug);
        
        const newPost = {
            slug,
            title: title || `New Blog Post - ${new Date().toLocaleDateString()}`,
            datePublished: new Date().toISOString().split('T')[0],
            excerpt: `${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} • by Author Name`,
            categoryName: category || 'Uncategorized',
            categorySlug: (category || 'uncategorized').toLowerCase().replace(/\s+/g, '-'),
            image: 'default-blog-image.jpg',
            url: `${BLOG_BASE_PATH}/${slug}/`
        };
        
        if (existingPostIndex >= 0) {
            // Update existing post
            blogData[existingPostIndex] = { ...blogData[existingPostIndex], ...newPost };
            console.log(`✅ Updated existing blog post: ${slug}`);
        } else {
            // Add new post
            blogData.unshift(newPost);
            console.log(`✅ Added new blog post to manifest: ${slug}`);
        }
        
        // Ensure the directory exists
        if (!existsSync(dirname(BLOG_DATA_FILE))) {
            mkdirSync(dirname(BLOG_DATA_FILE), { recursive: true });
        }
        
        // Write the updated data back to the file
        writeFileSync(BLOG_DATA_FILE, JSON.stringify(blogData, null, 2));
        
    } catch (error) {
        console.error('❌ Error updating blog post manifest:', error);
    }
}

// Run the URL update by default
updateBlogPostUrls();

// If this script is run directly, update all blog post URLs
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    updateBlogPostUrls();
}
