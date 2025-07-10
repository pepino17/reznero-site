/**
 * build-blog-list.js
 * Fetches and displays the 3 most recent blog posts from the processed JSON file
 * Handles placeholders when fewer than 3 posts are available
 */

document.addEventListener('DOMContentLoaded', function() {
  // Check if we're on a category page
  const isCategoryPage = window.location.pathname.includes('/categories/');
  const categorySlug = isCategoryPage ? window.location.pathname.split('/').filter(Boolean).pop() : null;
  
  // Fetch and display blog posts
  fetchBlogPosts()
    .then(posts => {
      // Filter posts by category if on a category page
      const filteredPosts = isCategoryPage 
        ? posts.filter(post => post.categorySlug === categorySlug)
        : posts;
      
      // Generate HTML for the latest 3 posts
      const postsHtml = generateBlogPostsHtml(filteredPosts);
      
      // Inject HTML into the page
      const section = document.getElementById(isCategoryPage ? 'category-blogs' : 'latest-blogs');
      if (section) {
        const container = section.querySelector('.blog-posts-grid') || section;
        container.innerHTML = postsHtml;
        
        // Add view all link for category pages
        if (isCategoryPage && filteredPosts.length > 3) {
          const viewAllLink = document.createElement('div');
          viewAllLink.className = 'view-all-container';
          viewAllLink.innerHTML = `
            <a href="/blog" class="btn btn-outline">View All ${filteredPosts.length} Articles</a>
          `;
          section.appendChild(viewAllLink);
        }
      }
    })
    .catch(error => {
      console.error('Error loading blog posts:', error);
      // Fallback to placeholder if there's an error
      injectPlaceholderBlogs(isCategoryPage ? 'category-blogs' : 'latest-blogs');
    });
});

/**
 * Fetches the processed blog posts from the JSON file
 * @returns {Promise<Array>} Array of blog post objects
 */
async function fetchBlogPosts() {
  try {
    const response = await fetch('/assets/data/blog-posts.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const posts = await response.json();
    
    // Ensure all posts have required fields
    return posts.map(post => ({
      slug: post.slug || '',
      title: post.title || 'Untitled',
      datePublished: post.datePublished || new Date().toISOString(),
      excerpt: post.excerpt || '',
      categoryName: post.categoryName || 'Uncategorized',
      categorySlug: post.categorySlug || 'uncategorized',
      image: post.image || '',
      url: post.url || `https://reznero.com/AMZ-Top_products/${post.slug || ''}/`
    }));
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
  // Sort posts by date (newest first)
  const sortedPosts = [...posts].sort((a, b) => 
    new Date(b.datePublished) - new Date(a.datePublished)
  );
  
  // Take the first 3 posts
  const latestPosts = sortedPosts.slice(0, 3);
  
  // If no posts, return a message
  if (latestPosts.length === 0) {
    return `
      <div class="no-posts">
        <p>No blog posts found. Check back soon for updates!</p>
      </div>
    `;
  }
  
  // Generate HTML for each post
  return latestPosts.map(post => `
    <article class="blog-item" data-category="${post.categorySlug || 'uncategorized'}">
      <a href="${post.url}" class="blog-link">
        ${post.image ? `
          <div class="blog-image-container">
            <img src="${post.image}" alt="${post.title}" class="blog-image" loading="lazy">
          </div>
        ` : ''}
        <div class="blog-content">
          <h3 class="blog-title">${post.title}</h3>
          <div class="blog-meta">
            <time datetime="${post.datePublished}" class="blog-date">
              ${formatDate(post.datePublished)}
            </time>
            ${post.categoryName ? `<span class="blog-category">${post.categoryName}</span>` : ''}
          </div>
          ${post.excerpt ? `<p class="blog-excerpt">${post.excerpt}</p>` : ''}
        </div>
      </a>
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
  
  try {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  } catch (e) {
    console.warn('Invalid date string:', dateString);
    return '';
  }
}

/**
 * Fallback function to inject placeholder blogs if there's an error
 * @param {string} containerId - ID of the container to inject placeholders into
 */
function injectPlaceholderBlogs(containerId = 'latest-blogs') {
  const section = document.getElementById(containerId);
  if (!section) return;
  
  let html = '';
  for (let i = 0; i < 3; i++) {
    html += `
      <article class="blog-item placeholder">
        <div class="empty-card">
          <div class="placeholder-content">
            <div class="placeholder-image"></div>
            <div class="placeholder-text"></div>
            <div class="placeholder-text shorter"></div>
          </div>
        </div>
      </article>
    `;
  }
  
  section.innerHTML = `
    <div class="blog-posts-container">
      <div class="blog-posts-grid">
        ${html}
      </div>
    </div>
  `;
}
