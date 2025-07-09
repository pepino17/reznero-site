/**
 * Blog functionality for Reznero Blog
 * Handles loading and displaying blog posts with infinite scroll and category filtering
 */

class Blog {
  constructor() {
    this.postsContainer = document.getElementById('posts-container');
    this.loadMoreBtn = document.getElementById('load-more-posts');
    this.categoryFilters = document.querySelectorAll('.category-filter');
    this.postsPerPage = 9; // Increased for better initial load
    this.currentPage = 1;
    this.allPosts = [];
    this.filteredPosts = [];
    this.currentCategory = 'all';
    this.isLoading = false;
    this.hasMorePosts = true;
    
    // Initialize the blog
    this.init();
  }

  async init() {
    if (!this.postsContainer) return;

    // Set up category filters
    this.setupCategoryFilters();
    
    // Load initial posts
    await this.loadPosts();
    
    // Set up infinite scroll
    this.setupInfiniteScroll();
    
    // Handle back/forward navigation
    window.addEventListener('popstate', () => this.handleUrlChange());
  }

  setupCategoryFilters() {
    this.categoryFilters.forEach(filter => {
      filter.addEventListener('click', (e) => {
        e.preventDefault();
        const category = filter.getAttribute('data-category');
        this.filterByCategory(category);
        
        // Update URL without page reload
        const url = category === 'all' ? '#' : `#category=${category}`;
        window.history.pushState({ category }, '', url);
      });
    });
  }
  
  handleUrlChange() {
    const params = new URLSearchParams(window.location.search);
    const category = params.get('category') || 'all';
    this.filterByCategory(category, false);
  }
  
  filterByCategory(category, updateHistory = true) {
    this.currentCategory = category;
    this.currentPage = 1;
    this.hasMorePosts = true;
    
    // Update active state of category filters
    this.categoryFilters.forEach(filter => {
      const filterCategory = filter.getAttribute('data-category');
      if (filterCategory === category) {
        filter.classList.add('active');
        filter.setAttribute('aria-current', 'page');
      } else {
        filter.classList.remove('active');
        filter.removeAttribute('aria-current');
      }
    });
    
    // Show loading state
    this.setLoadingState(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      // Filter posts
      this.filteredPosts = this.allPosts.filter(post => 
        category === 'all' || post.categories.includes(category)
      );
      
      // Re-render posts
      this.postsContainer.innerHTML = '';
      this.renderPosts(this.getPaginatedPosts());
      
      // Update URL if needed
      if (updateHistory) {
        const url = category === 'all' 
          ? window.location.pathname 
          : `${window.location.pathname}?category=${category}`;
        window.history.pushState({ category }, '', url);
      }
      
      // Reset loading state
      this.setLoadingState(false);
      
      // Check if we should show load more button
      this.updateLoadMoreButton();
    }, 300);
  }

  createSkeletonLoader(count = 6) {
    const fragment = document.createDocumentFragment();
    
    for (let i = 0; i < count; i++) {
      const skeleton = document.createElement('div');
      skeleton.className = 'post-card skeleton';
      skeleton.innerHTML = `
        <div class="post-image"></div>
        <div class="post-content">
          <div class="post-category"></div>
          <h3 class="post-title"></h3>
          <p class="post-excerpt"></p>
          <div class="post-meta"></div>
        </div>
      `;
      fragment.appendChild(skeleton);
    }
    
    this.postsContainer.appendChild(fragment);
  }

  async loadPosts() {
    if (this.isLoading || !this.hasMorePosts) return;
    
    this.isLoading = true;
    this.setLoadingState(true);
    
    // Show skeleton loaders
    if (this.currentPage === 1) {
      this.createSkeletonLoader(this.postsPerPage);
    }

    try {
      // In a real app, this would be an API call to fetch posts
      const mockPosts = this.generateMockPosts(this.postsPerPage);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // If first page, replace all posts, otherwise append
      if (this.currentPage === 1) {
        this.allPosts = [...mockPosts];
      } else {
        this.allPosts = [...this.allPosts, ...mockPosts];
      }
      
      // Update filtered posts based on current category
      this.filteredPosts = this.currentCategory === 'all' 
        ? [...this.allPosts]
        : this.allPosts.filter(post => post.categories.includes(this.currentCategory));
      
      // Render or update posts
      if (this.currentPage === 1) {
        this.postsContainer.innerHTML = '';
        this.renderPosts(this.getPaginatedPosts());
      } else {
        this.renderPosts(this.getPaginatedPosts());
      }
      
      this.currentPage++;
      
      // Check if we've reached the end of posts
      if (mockPosts.length < this.postsPerPage) {
        this.hasMorePosts = false;
      }
      
      // Update load more button
      this.updateLoadMoreButton();
      
    } catch (error) {
      console.error('Error loading posts:', error);
      this.showError('Failed to load posts. Please try again later.');
    } finally {
      this.isLoading = false;
      this.setLoadingState(false);
    }
  }

  getPaginatedPosts() {
    const start = 0; // Always show all filtered posts for now
    const end = this.filteredPosts.length;
    return this.filteredPosts.slice(start, end);
  }
  
  renderPosts(posts) {
    const fragment = document.createDocumentFragment();
    
    posts.forEach(post => {
      const postElement = this.createPostElement(post);
      fragment.appendChild(postElement);
    });
    
    this.postsContainer.appendChild(fragment);
    
    // Initialize any lazy loading for images
    this.initLazyLoading();
  }
  
  initLazyLoading() {
    const lazyImages = document.querySelectorAll('img[data-src]');
    
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.add('loaded');
            img.removeAttribute('data-src');
            observer.unobserve(img);
          }
        });
      });
      
      lazyImages.forEach(img => imageObserver.observe(img));
    } else {
      // Fallback for browsers that don't support IntersectionObserver
      lazyImages.forEach(img => {
        img.src = img.dataset.src;
        img.classList.add('loaded');
        img.removeAttribute('data-src');
      });
    }
  }

  createPostElement(post) {
    const article = document.createElement('article');
    article.className = 'post-card';
    article.setAttribute('data-categories', post.categories.join(' '));
    
    const date = new Date(post.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    
    // Get the first category for display
    const displayCategory = post.categories[0] || 'Uncategorized';
    
    article.innerHTML = `
      <a href="${post.url}" class="post-card-link" aria-label="Read more about ${post.title}">
        <div class="post-image">
          <img 
            data-src="${post.image}" 
            alt="${post.title}" 
            loading="lazy"
            width="400"
            height="225"
            class="post-image-img"
          >
          <span class="category-badge">${displayCategory}</span>
        </div>
        <div class="post-content">
          <div class="post-category">${displayCategory}</div>
          <h3 class="post-title">${post.title}</h3>
          <p class="post-excerpt">${post.excerpt}</p>
          <div class="post-meta">
            <time datetime="${new Date(post.date).toISOString()}">${date}</time>
            <span>•</span>
            <span>${post.readTime} min read</span>
          </div>
        </div>
      </a>
    `;
    
    return article;
  }

  async loadMore() {
    if (this.isLoading || !this.hasMorePosts) return;
    this.loadPosts();
  }

  setLoadingState(isLoading) {
    this.isLoading = isLoading;
    
    if (isLoading) {
      document.body.classList.add('loading-posts');
      if (this.loadMoreBtn) {
        this.loadMoreBtn.classList.add('loading');
        this.loadMoreBtn.setAttribute('aria-busy', 'true');
        this.loadMoreBtn.disabled = true;
      }
    } else {
      document.body.classList.remove('loading-posts');
      if (this.loadMoreBtn) {
        this.loadMoreBtn.classList.remove('loading');
        this.loadMoreBtn.setAttribute('aria-busy', 'false');
        this.loadMoreBtn.disabled = false;
      }
      
      // Update the sentinel element for infinite scroll
      this.observeLastPost();
    }
  }

  observeLastPost() {
    if (!this.intersectionObserver) return;
    
    // Stop observing previous last post
    if (this.lastPostObserver) {
      this.intersectionObserver.unobserve(this.lastPostObserver);
    }
    
    // Observe the new last post or load more button
    const posts = this.postsContainer.querySelectorAll('.post-card');
    if (posts.length > 0) {
      this.lastPostObserver = posts[posts.length - 1];
      this.intersectionObserver.observe(this.lastPostObserver);
    } else if (this.loadMoreBtn) {
      this.intersectionObserver.observe(this.loadMoreBtn);
    }
  }
  
  updateLoadMoreButton() {
    if (!this.loadMoreBtn) return;
    
    if (!this.hasMorePosts || this.filteredPosts.length < this.postsPerPage) {
      this.loadMoreBtn.style.display = 'none';
    } else {
      this.loadMoreBtn.style.display = 'block';
    }
  }

  hideLoadMore() {
    if (this.loadMoreBtn) {
      this.loadMoreBtn.style.display = 'none';
    }
  }
  
  setupInfiniteScroll() {
    if (!('IntersectionObserver' in window)) {
      // Fallback for browsers that don't support IntersectionObserver
      window.addEventListener('scroll', () => {
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 1000 && !this.isLoading && this.hasMorePosts) {
          this.loadMore();
        }
      });
      return;
    }
    
    // Use IntersectionObserver for better performance
    this.intersectionObserver = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !this.isLoading && this.hasMorePosts) {
        this.loadMore();
      }
    }, {
      root: null,
      rootMargin: '100px',
      threshold: 0.1
    });
    
    // Start observing the sentinel element (load more button or last post)
    this.observeLastPost();
  }

  generateMockPosts(count) {
    const mockPosts = [];
    const categories = {
      'technology': ['Web Development', 'AI & Machine Learning', 'Gadgets', 'Programming'],
      'lifestyle': ['Productivity', 'Travel', 'Health & Wellness', 'Minimalism'],
      'tutorials': ['Guides', 'How-To', 'Tutorials', 'Walkthroughs'],
      'reviews': ['Product Reviews', 'Book Reviews', 'Gear Reviews', 'Software Reviews']
    };
    
    const allCategories = Object.values(categories).flat();
    
    for (let i = 0; i < count; i++) {
      const categoryGroup = Object.keys(categories)[Math.floor(Math.random() * Object.keys(categories).length)];
      const postCategories = [
        categoryGroup,
        allCategories[Math.floor(Math.random() * allCategories.length)]
      ];
      
      // Ensure unique categories
      const uniqueCategories = [...new Set(postCategories)];
      
      const id = Math.floor(Math.random() * 10000);
      const titleWords = ['The Ultimate Guide', 'How to Master', '10 Tips for', 'The Future of', 'Beginner\'s Guide to', 'Advanced Techniques for'];
      const titleTopics = ['Web Development', 'JavaScript', 'React', 'CSS', 'Design Systems', 'Performance', 'Accessibility'];
      
      mockPosts.push({
        id,
        title: `${titleWords[Math.floor(Math.random() * titleWords.length)]} ${titleTopics[Math.floor(Math.random() * titleTopics.length)]}`,
        excerpt: 'This is a comprehensive guide that covers everything you need to know about this topic. Learn the best practices and latest techniques used by industry experts.',
        image: `https://source.unsplash.com/random/800x450/?${categoryGroup},tech,${id}`,
        categories: uniqueCategories,
        date: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
        readTime: Math.floor(Math.random() * 8) + 3, // 3-10 min read
        url: `/blog/post-${id}`,
        author: 'John Doe',
        authorImage: `https://i.pravatar.cc/100?img=${Math.floor(Math.random() * 70)}`
      });
    }
    
    return mockPosts;
  }
}

// Initialize blog functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Check if we're on a page with blog posts
  if (document.getElementById('posts-container')) {
    window.blog = new Blog();
  }
});
