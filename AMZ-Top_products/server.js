import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const BLOG_BASE_PATH = '/AMZ-Top_products';
const BLOG_POSTS_DIR = path.join(__dirname, 'blog-posts');

// Serve static files from the root directory
app.use(express.static(__dirname));

// Function to get all blog post slugs
const getBlogPostSlugs = () => {
    try {
        return fs.readdirSync(BLOG_POSTS_DIR, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);
    } catch (error) {
        console.error('Error reading blog posts directory:', error);
        return [];
    }
};

// Generate routes for all blog posts
const setupBlogRoutes = () => {
    const blogSlugs = getBlogPostSlugs();
    
    blogSlugs.forEach(slug => {
        // Handle direct blog post URLs (without the base path)
        app.get(`/${slug}`, (req, res) => {
            res.redirect(301, `${BLOG_BASE_PATH}/${slug}`);
        });

        // Handle blog post URLs with the base path
        app.get(`${BLOG_BASE_PATH}/${slug}`, (req, res) => {
            const blogPath = path.join(BLOG_POSTS_DIR, slug, 'index.html');
            if (fs.existsSync(blogPath)) {
                res.sendFile(blogPath);
            } else {
                // If the index.html doesn't exist, try to serve the blog-post.html
                const altBlogPath = path.join(BLOG_POSTS_DIR, slug, 'blog-post.html');
                if (fs.existsSync(altBlogPath)) {
                    res.sendFile(altBlogPath);
                } else {
                    // Fallback to the main index if the blog post isn't found
                    res.sendFile(path.join(__dirname, 'index.html'));
                }
            }
        });
    });
};

// Initialize blog routes
setupBlogRoutes();

// Handle client-side routing for all other routes
app.get('*', (req, res) => {
    // Check if this is a request for a blog post that wasn't found
    const pathSegments = req.path.split('/').filter(Boolean);
    if (pathSegments.length === 1) {
        const potentialSlug = pathSegments[0];
        const blogPath = path.join(BLOG_POSTS_DIR, potentialSlug, 'index.html');
        if (fs.existsSync(blogPath)) {
            return res.redirect(301, `${BLOG_BASE_PATH}/${potentialSlug}`);
        }
    }
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Watch for changes in the blog posts directory
if (process.env.NODE_ENV !== 'production') {
    fs.watch(BLOG_POSTS_DIR, (eventType, filename) => {
        if (eventType === 'rename') {
            console.log('Blog posts directory changed, updating routes...');
            setupBlogRoutes();
        }
    });
}

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Blog posts directory: ${BLOG_POSTS_DIR}`);
    console.log(`Available blog posts:`, getBlogPostSlugs());
    console.log(`Blog posts are accessible at: ${BLOG_BASE_PATH}/:slug`);
});
