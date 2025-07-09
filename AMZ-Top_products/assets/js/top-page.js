import { ProductService } from './api-service.js';
import { createProductCard, showTooltip, hideTooltip, formatPrice } from './ui-utils.js';

class TopPage {
  constructor() {
    this.productService = new ProductService();
    this.productsContainer = document.getElementById('products-container');
    this.loadingIndicator = document.getElementById('loading-indicator');
    this.noResults = document.getElementById('no-results');
    this.currentPage = 1;
    this.isLoading = false;
    this.hasMore = true;
    
    // Get category from URL
    const urlParams = new URLSearchParams(window.location.search);
    this.currentCategory = urlParams.get('category') || 'all';
    
    this.init();
  }
  
  async init() {
    this.updatePageTitle();
    this.setupEventListeners();
    await this.loadProducts();
  }
  
  updatePageTitle() {
    const categoryMap = {
      'electronics': 'Electronics',
      'home': 'Home & Kitchen',
      'books': 'Books',
      'clothing': 'Clothing',
      'all': 'All Products'
    };
    
    const categoryName = categoryMap[this.currentCategory] || 'Products';
    document.title = `Top ${categoryName} | Amazon US`;
    document.querySelector('h1[data-page-title]').textContent = `Top ${categoryName}`;
    document.querySelector('[data-breadcrumb-current]').textContent = categoryName;
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.content = `Discover the best ${categoryName.toLowerCase()} on Amazon. Our expert picks include top-rated products with Prime shipping available.`;
    }
    
    // Update schema.org data
    this.updateSchemaData(categoryName);
  }
  
  updateSchemaData(categoryName) {
    const schemaScript = document.querySelector('script[type="application/ld+json"]');
    if (schemaScript) {
      const schemaData = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "itemListElement": [],
        "name": `Top ${categoryName}`,
        "description": `Best ${categoryName} on Amazon according to our expert reviews`
      };
      schemaScript.textContent = JSON.stringify(schemaData, null, 2);
    }
  }
  
  setupEventListeners() {
    // Infinite scroll
    window.addEventListener('scroll', this.handleScroll.bind(this));
    
    // Handle window resize for responsive adjustments
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        this.handleResize();
      }, 250);
    });
    
    // Handle back button navigation
    window.addEventListener('popstate', () => {
      const urlParams = new URLSearchParams(window.location.search);
      const newCategory = urlParams.get('category') || 'all';
      if (newCategory !== this.currentCategory) {
        this.currentCategory = newCategory;
        this.resetAndLoad();
      }
    });
  }
  
  async handleScroll() {
    if (this.isLoading || !this.hasMore) return;
    
    const scrollPosition = window.innerHeight + window.scrollY;
    const pageHeight = document.documentElement.scrollHeight - 500; // Load before reaching bottom
    
    if (scrollPosition >= pageHeight) {
      await this.loadMore();
    }
  }
  
  handleResize() {
    // Adjust any responsive elements if needed
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
      // Example: Update any responsive elements
    });
  }
  
  async resetAndLoad() {
    this.currentPage = 1;
    this.hasMore = true;
    this.productsContainer.innerHTML = '';
    this.updatePageTitle();
    await this.loadProducts();
  }
  
  async loadProducts() {
    if (this.isLoading || !this.hasMore) return;
    
    this.isLoading = true;
    this.showLoading(true);
    
    try {
      const products = await this.productService.getProducts({
        category: this.currentCategory,
        page: this.currentPage,
        pageSize: 12
      });
      
      if (products.length === 0) {
        this.hasMore = false;
        if (this.currentPage === 1) {
          this.showNoResults(true);
        }
      } else {
        this.renderProducts(products);
        this.currentPage++;
        this.updateSchemaWithProducts(products);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      // Show error message to user
      const errorElement = document.createElement('div');
      errorElement.className = 'error-message';
      errorElement.textContent = 'Failed to load products. Please try again later.';
      this.productsContainer.appendChild(errorElement);
    } finally {
      this.isLoading = false;
      this.showLoading(false);
    }
  }
  
  renderProducts(products) {
    const fragment = document.createDocumentFragment();
    
    products.forEach((product, index) => {
      const productCard = createProductCard(product);
      productCard.dataset.asin = product.asin;
      productCard.dataset.position = index + 1;
      fragment.appendChild(productCard);
    });
    
    this.productsContainer.appendChild(fragment);
    
    // Initialize tooltips for new elements
    this.initializeTooltips();
  }
  
  initializeTooltips() {
    const tooltipTriggers = document.querySelectorAll('[data-tooltip]');
    tooltipTriggers.forEach(trigger => {
      trigger.addEventListener('mouseenter', (e) => {
        const tooltipText = trigger.getAttribute('data-tooltip');
        showTooltip(e.target, tooltipText);
      });
      
      trigger.addEventListener('mouseleave', () => {
        hideTooltip();
      });
      
      // Keyboard support
      trigger.addEventListener('focus', (e) => {
        const tooltipText = trigger.getAttribute('data-tooltip');
        showTooltip(e.target, tooltipText);
      });
      
      trigger.addEventListener('blur', () => {
        hideTooltip();
      });
    });
  }
  
  updateSchemaWithProducts(products) {
    const schemaScript = document.querySelector('script[type="application/ld+json"]');
    if (!schemaScript) return;
    
    try {
      const schemaData = JSON.parse(schemaScript.textContent);
      
      products.forEach((product, index) => {
        const position = (this.currentPage - 1) * 12 + index + 1;
        
        schemaData.itemListElement.push({
          "@type": "ListItem",
          "position": position,
          "item": {
            "@type": "Product",
            "name": product.title,
            "description": product.description,
            "image": product.image,
            "url": product.url,
            "offers": {
              "@type": "Offer",
              "price": product.price?.value || 0,
              "priceCurrency": product.price?.currency || "USD",
              "availability": "https://schema.org/InStock",
              "priceValidUntil": product.dealExpires || ""
            }
          }
        });
      });
      
      schemaScript.textContent = JSON.stringify(schemaData, null, 2);
    } catch (error) {
      console.error('Error updating schema data:', error);
    }
  }
  
  async loadMore() {
    if (this.isLoading || !this.hasMore) return;
    await this.loadProducts();
  }
  
  showLoading(show) {
    if (show) {
      this.loadingIndicator.style.display = 'flex';
    } else {
      this.loadingIndicator.style.display = 'none';
    }
  }
  
  showNoResults(show) {
    if (show) {
      this.noResults.hidden = false;
    } else {
      this.noResults.hidden = true;
    }
  }
}

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Track page view
  if (window.gtag) {
    gtag('event', 'page_view', {
      page_title: document.title,
      page_location: window.location.href,
      page_path: window.location.pathname + window.location.search
    });
  }
  
  // Initialize the page
  const topPage = new TopPage();
  
  // Make it available globally for debugging
  window.topPage = topPage;
});
