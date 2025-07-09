/**
 * Blog functionality for AMZ Top Products
 * Handles loading and displaying blog posts
 */

class Blog {
  constructor() {
    this.postsContainer = document.getElementById('posts-container');
    this.loadMoreBtn = document.getElementById('load-more');
    this.categoryLinks = document.querySelectorAll('[data-category]');
    this.postsPerPage = 6;
    this.currentPage = 1;
    this.allPosts = [];
    this.filteredPosts = [];
    this.currentCategory = 'all';
    this.animationFrameId = null;
    this.resizeObserver = null;
    
    // Bind methods
    this.handleResize = this.debounce(this.handleResize.bind(this), 100);
    this.handleScroll = this.debounce(this.handleScroll.bind(this), 100);
    
    // Initialize the blog
    this.init();
  }

  async init() {
    if (!this.postsContainer) return;

    // Set up category navigation
    this.setupCategoryNavigation();
    
    // Set up intersection observer for lazy loading
    this.setupIntersectionObserver();
    
    // Load initial posts
    await this.loadPosts();
    
    // Set up event listeners
    if (this.loadMoreBtn) {
      this.loadMoreBtn.addEventListener('click', () => this.loadMore());
    }
    
    // Handle back/forward navigation
    window.addEventListener('popstate', () => this.handleUrlChange());
    
    // Setup viewport tracking for scroll animations
    this.setupViewportTracking();
    
    // Add event listeners for window resize and scroll
    window.addEventListener('resize', this.handleResize);
    window.addEventListener('scroll', this.handleScroll);
  }

  setupCategoryNavigation() {
    const categoryContainer = document.querySelector('.blog-categories');
    if (!categoryContainer) return;
    
    this.categoryLinks = Array.from(document.querySelectorAll('.category-link'));
    
    this.categoryLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const category = link.getAttribute('data-category');
        this.filterByCategory(category);
        
        // Update URL without page reload
        const url = category === 'all' ? '#' : `#${category.toLowerCase().replace(/\s+/g, '-')}`;
        window.history.pushState({ category }, '', url);
      });
    });
  }
  
  handleUrlChange() {
    const hash = window.location.hash.replace('#', '');
    const category = this.getCategoryFromHash(hash);
    this.filterByCategory(category, false);
  }
  
  getCategoryFromHash(hash) {
    if (!hash) return 'all';
    
    // Convert hash to match category names
    const categoryMap = {
      'electronics': 'Electronics',
      'tech-reviews': 'Tech Reviews',
      'gadgets': 'Gadgets',
      'home-kitchen': 'Home & Kitchen',
      'lifestyle': 'Lifestyle',
      'deals': 'Deals'
    };
    
    return categoryMap[hash] || 'all';
  }
  
  filterByCategory(category, scrollToTop = true) {
    this.currentCategory = category;
    this.currentPage = 1;
    
    // Update active state
    this.categoryLinks.forEach(link => {
      const linkCategory = link.getAttribute('data-category');
      if (linkCategory === category) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      } else {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
      }
    });
    
    // Filter posts
    this.filteredPosts = category === 'all' 
      ? [...this.allPosts]
      : this.allPosts.filter(post => post.category === category);
    
    // Re-render posts
    this.postsContainer.innerHTML = '';
    this.renderPosts(this.filteredPosts);
    
    // Show/hide load more button
    if (this.filteredPosts.length >= this.allPosts.length) {
      this.hideLoadMore();
    } else if (this.loadMoreBtn) {
      this.loadMoreBtn.style.display = 'block';
    }
    
    // Scroll to top
    if (scrollToTop) {
      window.scrollTo({
        top: this.postsContainer.offsetTop - 100,
        behavior: 'smooth'
      });
    }
  }

  createSkeletonLoader(count = 6) {
    this.postsContainer.innerHTML = ''; // Clear existing content
    
    for (let i = 0; i < count; i++) {
      const skeleton = document.createElement('div');
      skeleton.className = 'post-card skeleton';
      skeleton.innerHTML = `
        <div class="skeleton-image"></div>
        <div class="skeleton-content">
          <div class="skeleton-line short"></div>
          <div class="skeleton-line medium"></div>
          <div class="skeleton-line long"></div>
          <div class="skeleton-line button"></div>
        </div>
      `;
      this.postsContainer.appendChild(skeleton);
    }
  }

  async loadPosts() {
    if (this.isLoading) return;
    
    this.isLoading = true;
    this.setLoadingState(true);
    
    // Show skeleton loaders
    this.createSkeletonLoader(this.postsPerPage);

    try {
      // In a real app, this would be an API call to fetch posts
      const mockPosts = this.generateMockPosts(this.postsPerPage);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      this.allPosts = [...this.allPosts, ...mockPosts];
      
      // Filter posts based on current category
      const postsToShow = this.currentCategory === 'all' 
        ? mockPosts 
        : mockPosts.filter(post => post.category === this.currentCategory);
      
      this.renderPosts(postsToShow);
      this.currentPage++;
      
      // Hide load more button if we've reached the end of posts
      if (this.allPosts.length >= 30) { // Assuming 30 is the total number of posts
        this.hideLoadMore();
      }
    } catch (error) {
      console.error('Error loading posts:', error);
      this.showError('Failed to load posts. Please try again later.');
    } finally {
      this.isLoading = false;
      this.setLoadingState(false);
    }
  }

  renderPosts(posts) {
    const fragment = document.createDocumentFragment();
    
    posts.forEach(post => {
      const postElement = this.createPostElement(post);
      fragment.appendChild(postElement);
    });
    
    this.postsContainer.appendChild(fragment);
    
    // Initialize any lazy loading for images
    if (window.lazyLoadInstance) {
      window.lazyLoadInstance.update();
    }
  }

  observeLazyImages() {
    const lazyImages = this.postsContainer.querySelectorAll('img[loading="lazy"]');
    lazyImages.forEach(img => this.observer.observe(img));
  }

  createPostElement(post) {
    const article = document.createElement('article');
    article.className = 'post-card';
    
    // Generate responsive image sources
    const imageUrl = new URL(post.image);
    const imageParams = new URLSearchParams(imageUrl.search);
    const imageBase = imageUrl.origin + imageUrl.pathname;
    
    // Add a small delay to simulate network conditions in development
    const debugDelay = window.location.hostname === 'localhost' ? '?delay=500' : '';
    
    // Create responsive image markup
    const picture = document.createElement('picture');
    
    // WebP format with different sizes
    const webpSource = document.createElement('source');
    webpSource.type = 'image/webp';
    webpSource.sizes = '(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw';
    webpSource.srcset = `
      ${this.getImageUrl(imageBase, 400, 225, 'webp')} 400w,
      ${this.getImageUrl(imageBase, 600, 338, 'webp')} 600w,
      ${this.getImageUrl(imageBase, 800, 450, 'webp')} 800w
    `;
    
    // Fallback to original format
    const fallbackSource = document.createElement('source');
    fallbackSource.sizes = '(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw';
    fallbackSource.srcset = `
      ${this.getImageUrl(imageBase, 400, 225)} 400w,
      ${this.getImageUrl(imageBase, 600, 338)} 600w,
      ${this.getImageUrl(imageBase, 800, 450)} 800w
    `;
    
    // Fallback image with lazy loading
    const img = document.createElement('img');
    img.className = 'post-card__image blur-up';
    img.loading = 'lazy';
    img.decoding = 'async';
    img.width = 800;
    img.height = 450;
    img.alt = post.title;
    
    // Use data-src for lazy loading
    img.setAttribute('data-src', `${this.getImageUrl(imageBase, 800, 450)}${debugDelay}`);
    
    // Add low-quality image placeholder (LQIP)
    if (post.placeholder) {
      img.style.backgroundImage = `url(${post.placeholder})`;
      img.style.backgroundSize = 'cover';
      img.style.backgroundPosition = 'center';
    }
    
    // Assemble the picture element
    picture.appendChild(webpSource);
    picture.appendChild(fallbackSource);
    picture.appendChild(img);
    
    // Create the card content
    article.innerHTML = `
      <a href="${post.url}" class="post-card__link-wrapper">
        <div class="post-card__image-wrapper">
          ${picture.outerHTML}
        </div>
        <div class="post-card__content">
          <span class="post-card__category">${post.category}</span>
          <h3 class="post-card__title">${post.title}</h3>
          <p class="post-card__excerpt">${post.excerpt}</p>
          <span class="post-card__link">
            Read Article
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </span>
        </div>
      </a>
    `;
    
    return article;
  }

  async loadMore() {
    if (this.isLoading) return;
    await this.loadPosts();
  }

  setLoadingState(isLoading) {
    if (!this.loadMoreBtn) return;
    
    if (isLoading) {
      this.loadMoreBtn.classList.add('is-loading');
      this.loadMoreBtn.setAttribute('aria-busy', 'true');
      this.loadMoreBtn.disabled = true;
    } else {
      this.loadMoreBtn.classList.remove('is-loading');
      this.loadMoreBtn.setAttribute('aria-busy', 'false');
      this.loadMoreBtn.disabled = false;
    }
  }

  hideLoadMore() {
    if (this.loadMoreBtn) {
      this.loadMoreBtn.style.display = 'none';
    }
  }
  
  setupIntersectionObserver() {
    // Clean up existing observer if any
    if (this.observer) {
      this.observer.disconnect();
    }

    const options = {
      root: null,
      rootMargin: '200px',
      threshold: 0.01
    };

    this.observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          
          // Only load images that haven't been loaded yet
          if (img.dataset.src) {
            // Use requestAnimationFrame for smoother performance
            this.animationFrameId = requestAnimationFrame(() => {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
              
              // Handle image load state
              if (img.complete) {
                this.handleImageLoad(img);
              } else {
                const loadHandler = () => {
                  this.handleImageLoad(img);
                  img.removeEventListener('load', loadHandler);
                };
                const errorHandler = () => {
                  this.handleImageError(img);
                  img.removeEventListener('error', errorHandler);
                };
                
                img.addEventListener('load', loadHandler, { once: true });
                img.addEventListener('error', errorHandler, { once: true });
              }
              
              observer.unobserve(img);
            });
          }
        }
      });
    }, options);
  }

  handleImageLoad(img) {
    // Remove blur effect and show image
    img.classList.add('loaded');
    
    // If parent has blur-up class, remove it after a short delay
    if (img.classList.contains('blur-up')) {
      setTimeout(() => {
        img.style.backgroundImage = 'none';
      }, 300);
    }
  }

  handleImageError(img) {
    // Handle image loading error
    console.error('Failed to load image:', img.src);
    img.classList.add('error');
    
    // You could show a fallback image or icon here
    const wrapper = img.closest('.post-card__image-wrapper');
    if (wrapper) {
      wrapper.classList.add('error');
    }
  }

  // Update renderPosts to use filtered posts
  renderPosts(posts) {
    if (!posts || !posts.length) {
      this.postsContainer.innerHTML = '<p class="no-posts">No posts found in this category.</p>';
      return;
    }
    
    const fragment = document.createDocumentFragment();
    
    posts.forEach(post => {
      const postElement = this.createPostElement(post);
      fragment.appendChild(postElement);
    });
    
    this.postsContainer.appendChild(fragment);
    
    // Observe all lazy-loaded images
    this.observeLazyImages();
  }

  showError(message) {
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    this.postsContainer.appendChild(errorElement);
  }

  // Helper to generate responsive image URLs
  getImageUrl(base, width, height, format = null) {
    const url = new URL(base);
    const params = new URLSearchParams({
      w: width,
      h: height,
      q: 80,
      fit: 'crop',
      crop: 'entropy',
      auto: 'format',
      ...(format && { fm: format })
    });
    return `${url}?${params}`;
  }

  // Mock data generator - replace with real API call
  generateMockPosts(count) {
    const categories = [
      'Electronics', 'Tech Reviews', 'Gadgets', 
      'Home & Kitchen', 'Lifestyle', 'Deals'
    ];
    
    const mockPosts = [];
    const colors = ['f3f4f6', 'e5e7eb', 'd1d5db', '9ca3af', '6b7280'];
    
    for (let i = 0; i < count; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const id = this.allPosts.length + i + 1;
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      // Generate a simple color placeholder as base64
      const placeholder = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='450' viewBox='0 0 800 450'%3E%3Crect width='800' height='450' fill='%23${color}'/%3E%3C/svg%3E`;
      
      mockPosts.push({
        id,
        title: `The Best ${category} of 2023: Our Top Picks`,
        excerpt: 'Discover our carefully curated selection of the best products in this category based on extensive testing and research.',
        category,
        image: `https://source.unsplash.com/random/800x450/?${encodeURIComponent(category)},tech,product,${id}`,
        placeholder,
        url: `post-${id}.html`,
        date: new Date().toISOString(),
        readingTime: `${Math.floor(Math.random() * 5) + 3} min read`
      });
    }
    
    return mockPosts;
  }
}

// Initialize blog functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new Blog();
});
