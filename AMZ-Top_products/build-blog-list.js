/**
 * build-blog-list.js
 * Fetches and displays the 3 most recent blog posts from the Blogs directory
 * Handles placeholders when fewer than 3 posts are available
 */

// Make function available globally
window.initBlogList = function() {
  console.log('Initializing blog list...');
  const blogContainer = document.getElementById('latest-blogs') || document.getElementById('category-blogs');
  if (!blogContainer) {
    console.warn('Blog container not found');
    return;
  }

  // Check if we're on a category page
  const isCategoryPage = window.location.pathname.includes('/categories/');
  const categorySlug = isCategoryPage ? window.location.pathname.split('/').filter(Boolean).pop() : null;
  
  // Load and display posts
  fetchBlogPosts()
    .then(posts => {
      try {
        // Filter posts by category if on a category page
        const filteredPosts = isCategoryPage && posts && posts.length > 0
          ? posts.filter(post => post && post.categorySlug === categorySlug)
          : posts || [];
        
        // Generate HTML for the latest 3 posts
        const postsHtml = generateBlogPostsHtml(filteredPosts);
        
        // Inject HTML into the page
        const container = blogContainer.querySelector('.blogs-grid');
        if (container) {
          container.innerHTML = postsHtml;
        } else {
          console.warn('Could not find blog posts container');
          injectPlaceholderBlogs(blogContainer.id);
        }
        
        // Add view all link for category pages
        if (isCategoryPage && filteredPosts.length > 3) {
          const viewAllLink = document.createElement('div');
          viewAllLink.className = 'view-all-container';
          viewAllLink.style.textAlign = 'center';
          viewAllLink.style.marginTop = '2rem';
          viewAllLink.innerHTML = `
            <a href="/blog" class="btn btn-outline">View All ${filteredPosts.length} Articles</a>
          `;
          blogContainer.appendChild(viewAllLink);
        }
      } catch (error) {
        console.error('Error processing blog posts:', error);
        injectPlaceholderBlogs(blogContainer.id);
      }
    })
    .catch(error => {
      console.error('Error loading blog posts:', error);
      injectPlaceholderBlogs(blogContainer.id);
    });
}

/**
 * Fetches blog posts from the Blogs directory
 * @returns {Promise<Array>} Array of blog post objects
 */
async function fetchBlogPosts() {
  try {
    // Get list of HTML files in the Blogs directory
    const response = await fetch('/Blogs/');
    if (!response.ok) {
      throw new Error('Failed to fetch blog posts directory');
    }
    
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Extract HTML file links
    const links = Array.from(doc.querySelectorAll('a[href$=".html"]'));
    const posts = [];
    
    // Process each blog post (limited to 10 for performance)
    for (const link of links.slice(0, 10)) {
      try {
        const postUrl = `/Blogs/${link.getAttribute('href')}`;
        const postResponse = await fetch(postUrl);
        if (!postResponse.ok) continue;
        
        const postHtml = await postResponse.text();
        const postDoc = parser.parseFromString(postHtml, 'text/html');
        
        // Extract post data
        const title = postDoc.querySelector('title')?.textContent || 'Untitled';
        const dateMatch = postHtml.match(/<time[^>]*datetime="([^"]+)"/i);
        const excerptMatch = postHtml.match(/<p[^>]*>([^<]+)<\/p>/i);
        const imageMatch = postHtml.match(/<img[^>]*src=["']([^"']+)["']/i);
        
        posts.push({
          title: title.replace(' - Reznero', '').trim(),
          slug: link.getAttribute('href').replace(/\.html$/, ''),
          date: dateMatch ? dateMatch[1] : new Date().toISOString().split('T')[0],
          excerpt: excerptMatch ? excerptMatch[1].substring(0, 160) + '...' : 'No excerpt available',
          image: imageMatch ? imageMatch[1] : '/assets/images/blog-placeholder.jpg',
          url: postUrl.replace('.html', '/')
        });
      } catch (error) {
        console.warn(`Error processing blog post ${link.href}:`, error);
      }
    }
    
    // Sort by date (newest first)
    return posts.sort((a, b) => new Date(b.date) - new Date(a.date));
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return [];
  }
}

/**
 * Generates HTML for blog posts
 * @param {Array} posts - Array of blog post objects
 * @returns {string} HTML string
 */
function generateBlogPostsHtml(posts) {
  if (!posts || posts.length === 0) {
    return `
      <div class="no-posts" style="grid-column: 1 / -1; text-align: center; padding: 2rem;">
        <p>No blog posts found. Check back soon for updates!</p>
      </div>
    `;
  }

  // Get the latest 3 posts for the home page
  const latestPosts = posts.slice(0, 3);
  
  // If no posts, return placeholders
  if (latestPosts.length === 0) {
    return Array(3).fill(`
      <article class="blog-item placeholder">
        <div class="empty-card">Coming soon...</div>
      </article>
    `).join('');
  }
  
  // Generate HTML for each post
  return latestPosts.map(post => `
    <article class="blog-item">
      <img src="${post.image}" alt="${post.title}" loading="lazy">
      <div class="info">
        <time datetime="${post.date}">${formatDate(post.date)}</time>
        <h3>${post.title}</h3>
        <p>${post.excerpt}</p>
        <a href="${post.url}" class="btn-read">Read Article</a>
      </div>
    </article>
  `).join('');
}

/**
 * Formats a date string into a more readable format
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date string
 */
function formatDate(dateString) {
  if (!dateString) return '';
  
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  try {
    const date = new Date(dateString);
    // Check if date is valid
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date');
    }
    return new Intl.DateTimeFormat('en-US', options).format(date);
  } catch (e) {
    console.warn('Invalid date string, using current date:', dateString);
    return new Intl.DateTimeFormat('en-US', options).format(new Date());
  }
}

/**
 * Fallback function to inject placeholder blogs if there's an error
 * @param {string} containerId - ID of the container to inject placeholders into
 */
function injectPlaceholderBlogs(containerId = 'latest-blogs') {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const placeholderHtml = `
    <div class="blogs-grid">
      ${Array(3).fill(`
        <article class="blog-item placeholder">
          <div class="empty-card">Loading content...</div>
        </article>
      `).join('')}
    </div>
  `;
  
  const grid = container.querySelector('.blogs-grid');
  if (grid) {
    grid.innerHTML = placeholderHtml;
  } else {
    container.innerHTML = `
      <div class="container">
        <div class="section-header">
          <h2>Latest Blog Posts</h2>
          <p class="section-description">Discover our most recent articles and guides</p>
        </div>
        ${placeholderHtml}
      </div>
    `;
  }
}
