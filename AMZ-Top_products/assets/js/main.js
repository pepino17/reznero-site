/**
 * AMZ Top Products - Main JavaScript File
 * Handles the main logic of the website
 */

// Import API service and UI utilities
import { amazonAPI } from './api-service.js';
import { UIUtils } from './ui-utils.js';

// Register service worker for PWA support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/AMZ-Top_products/sw.js')
      .then(registration => {
        console.log('ServiceWorker registration successful');
      })
      .catch(err => {
        console.error('ServiceWorker registration failed: ', err);
      });
  });
}

// Sticky header functionality
let lastScroll = 0;
const header = document.getElementById('site-header');

function handleScroll() {
  const currentScroll = window.pageYOffset;
  
  // Only apply if scrolled more than 200px
  if (currentScroll > 200) {
    if (currentScroll > lastScroll && !header.classList.contains('hidden')) {
      // Scrolling down
      header.classList.add('hidden');
    } else if (currentScroll < lastScroll && header.classList.contains('hidden')) {
      // Scrolling up
      header.classList.remove('hidden');
    }
  } else {
    // Always show header when near top of page
    header.classList.remove('hidden');
  }
  
  lastScroll = currentScroll;
}

document.addEventListener('DOMContentLoaded', function() {
    // Add a class to the html element to indicate JavaScript is enabled
    document.documentElement.classList.add('js-enabled');
    
    // Initialize sticky header
    if (header) {
      window.addEventListener('scroll', handleScroll, { passive: true });
    }
    
    // Create a style element for screen reader only class
    const style = document.createElement('style');
    style.textContent = `
        .sr-only {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border-width: 0;
        }
        
        /* Focus styles for keyboard navigation */
        *:focus-visible {
            outline: 3px solid var(--primary);
            outline-offset: 2px;
            box-shadow: 0 0 0 4px rgba(74, 108, 247, 0.2);
        }
        
        /* Hide focus styles for mouse users */
        *:focus:not(:focus-visible) {
            outline: none;
            box-shadow: none;
        }
    `;
    document.head.appendChild(style);
    
    // Product data with ASINs for US market
    const productData = [
        {
            id: 1,
            asin: 'B0B4LZ2KQZ',
            name: 'Wireless Earbuds with Active Noise Cancelling',
            category: 'Electronics',
            image: 'https://m.media-amazon.com/images/I/61CGHv6kmWL._AC_SL1500_.jpg',
            primeEligible: true,
            dealEnds: '2025-12-31',
            isDeal: true,
            isPrime: true,
            url: 'https://www.amazon.com/dp/B08NTT1C3F',
            description: 'Wireless noise-canceling headphones with up to 30 hours of battery life.'
        },
        {
            id: 2,
            name: 'Smartwatch with Heart Rate & Blood Oxygen Monitor',
            price: 129.99,
            originalPrice: 159.99,
            image: 'https://m.media-amazon.com/images/I/71Zf0q5tV5L._AC_SL1500_.jpg',
            category: 'Electronics',
            rating: 4.7,
            reviews: 856,
            isDeal: true,
            isPrime: true,
            dealEnds: '07/15/2025',
            url: 'https://www.amazon.com/dp/B08XK5F6VJ',
            description: 'Smartwatch with activity tracking, sleep monitoring, and water resistance.'
        },
        {
            id: 3,
            name: 'Waterproof Bluetooth Speaker',
            price: 45.50,
            originalPrice: 59.99,
            image: 'https://m.media-amazon.com/images/I/71y6T9ZY5VL._AC_SL1500_.jpg',
            category: 'Electronics',
            rating: 4.3,
            reviews: 2105,
            isDeal: true,
            isPrime: true,
            dealEnds: '07/20/2025',
            url: 'https://www.amazon.com/dp/B07QK1Y5CY',
            description: 'Waterproof wireless speaker with stereo sound and long battery life.'
        },
        {
            id: 4,
            name: '4K Ultra HD Action Camera',
            price: 199.99,
            originalPrice: 249.99,
            image: 'https://m.media-amazon.com/images/I/61B04fQsMvL._AC_SL1500_.jpg',
            category: 'Electronics',
            rating: 4.8,
            reviews: 3421,
            isDeal: true,
            isPrime: true,
            dealEnds: '07/25/2025',
            url: 'https://www.amazon.com/dp/B08G2H4VBG',
            description: '4K action camera with image stabilization and voice control.'
        },
        {
            id: 5,
            name: '10-Inch Tablet 128GB, Android 12',
            price: 259.99,
            originalPrice: 299.99,
            image: 'https://m.media-amazon.com/images/I/71LqS7SwdjL._AC_SL1500_.jpg',
            category: 'Electronics',
            rating: 4.6,
            reviews: 1789,
            isDeal: true,
            isPrime: true,
            dealEnds: '07/18/2025',
            url: 'https://www.amazon.com/dp/B09NWHV9R7',
            description: 'High-performance tablet with Full HD display and 6GB RAM.'
        },
        {
            id: 6,
            name: 'Mechanical Gaming Keyboard with RGB Backlit',
            price: 89.99,
            originalPrice: 119.99,
            image: 'https://m.media-amazon.com/images/I/71Uv3hO3QFL._AC_SL1500_.jpg',
            category: 'Electronics',
            rating: 4.4,
            reviews: 932,
            isDeal: true,
            isPrime: true,
            dealEnds: '07/30/2025',
            url: 'https://www.amazon.com/dp/B08N3X5Z8T',
            description: 'Mechanical keyboard with blue switches and customizable RGB backlighting.'
        },
        {
            id: 7,
            name: '27" Curved Gaming Monitor 144Hz',
            price: 289.99,
            originalPrice: 349.99,
            image: 'https://m.media-amazon.com/images/I/71rXSVqET9L._AC_SL1500_.jpg',
            category: 'Electronics',
            rating: 4.7,
            reviews: 2156,
            isDeal: true,
            isPrime: true,
            dealEnds: '07/22/2025',
            url: 'https://www.amazon.com/dp/B07YV5Y6H8',
            description: 'Curved Full HD monitor with 1ms response time and FreeSync technology.'
        },
        {
            id: 8,
            name: 'Wireless All-in-One Printer',
            price: 149.99,
            originalPrice: 179.99,
            image: 'https://m.media-amazon.com/images/I/71p7rNzV4gL._AC_SL1500_.jpg',
            category: 'Office',
            rating: 4.5,
            reviews: 1872,
            isDeal: true,
            isPrime: true,
            dealEnds: '07/28/2025',
            url: 'https://www.amazon.com/dp/B07P5PRK7J',
            description: 'All-in-one wireless printer with Wi-Fi, scanner, and copier functionality.'
        }
    ];

    // DOM Elements
    const featuredProductsContainer = document.getElementById('featured-products');
    const dealsProductsContainer = document.getElementById('deals-products');
    const categoryCards = document.querySelectorAll('.category-card');
    const loadMoreButton = document.querySelector('.load-more-btn');

    // Application state
    let currentProducts = [];
    let productCache = new Map();
    
    // Fetch product data from API
    async function fetchProductData(products) {
        try {
            const asins = products.map(p => p.asin).filter(Boolean);
            if (asins.length === 0) return [];
            
            const response = await amazonAPI.getProducts(asins);
            if (!response || !response.ItemsResult || !response.ItemsResult.Items) {
                console.error('Invalid API response');
                return [];
            }
            
            // Map API response to our product format
            return response.ItemsResult.Items.map(item => {
                const listing = item.Offers?.Listings?.[0] || {};
                const price = listing.Price?.Amount || 0;
                const originalPrice = listing.SavingBasis?.Amount || price;
                const saved = listing.AmountSaved?.Amount || 0;
                const isPrime = listing.DeliveryInfo?.IsPrimeEligible || false;
                
                return {
                    id: item.ASIN,
                    asin: item.ASIN,
                    name: item.ItemInfo?.Title?.DisplayValue || 'Unknown Product',
                    price: price,
                    originalPrice: originalPrice,
                    saved: saved,
                    image: item.Images?.Primary?.Medium?.URL || '',
                    category: item.BrowseNodeInfo?.BrowseNodes?.[0]?.DisplayName || 'Uncategorized',
                    rating: item.CustomerReviews?.StarRating || 0,
                    reviews: item.CustomerReviews?.Count || 0,
                    primeEligible: isPrime,
                    dealEnds: listing.OfferEndTime || '',
                    features: item.ItemInfo?.Features?.DisplayValues || []
                };
            });
        } catch (error) {
            console.error('Error fetching product data:', error);
            return [];
        }
    }
    let cart = [];

    /**
     * Initialize the application
     */
    function init() {
        // Add loaded class and set up initial states
        document.documentElement.classList.add('js-loaded');
        
        // Set up performance monitoring
        if ('connection' in navigator) {
            // If user is on a slow connection, reduce image quality
            if (navigator.connection.saveData || 
                (navigator.connection.effectiveType && 
                 ['slow-2g', '2g', '3g'].includes(navigator.connection.effectiveType))) {
                document.documentElement.classList.add('save-data');
            }
            
            // Watch for connection changes
            navigator.connection.addEventListener('change', function() {
                if (navigator.connection.saveData || 
                    ['slow-2g', '2g', '3g'].includes(navigator.connection.effectiveType)) {
                    document.documentElement.classList.add('save-data');
                } else {
                    document.documentElement.classList.remove('save-data');
                }
            });
        }
        
        // Set up event listeners first for better perceived performance
        setupEventListeners();
        
        // Load products after a small delay to allow the browser to handle initial rendering
        setTimeout(() => {
            // Set up loading states
            const loadingElements = document.querySelectorAll('.loading');
            loadingElements.forEach(el => {
                el.setAttribute('aria-busy', 'true');
            });
            
            // Load content
            displayFeaturedProducts();
            displayDeals();
            
            // Announce page load to screen readers
            const liveRegion = document.createElement('div');
            liveRegion.setAttribute('role', 'status');
            liveRegion.setAttribute('aria-live', 'polite');
            liveRegion.setAttribute('aria-atomic', 'true');
            liveRegion.className = 'sr-only';
            liveRegion.textContent = 'Page loaded';
            document.body.appendChild(liveRegion);
            
            // Remove the live region after announcement
            setTimeout(() => {
                liveRegion.remove();
            }, 1000);
        }, 100);
    }
    
    /**
     * Set up event listeners with proper keyboard support
     */
    function setupEventListeners() {
        // Category selection with keyboard support
        document.querySelectorAll('.category-card').forEach(card => {
            // Click event
            card.addEventListener('click', function(e) {
                e.preventDefault();
                const category = this.getAttribute('data-category');
                if (category) {
                    filterProductsByCategory(category);
                    // Move focus to the first product in the filtered list
                    setTimeout(() => {
                        const firstProduct = document.querySelector('[data-first-product]');
                        if (firstProduct) {
                            firstProduct.focus();
                        }
                    }, 100);
                }
            });

            // Keyboard navigation for category cards
            card.addEventListener('keydown', function(e) {
                // Handle Enter or Space key
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.click();
                }
            });
        });

        // Load more button with proper ARIA attributes
        if (loadMoreButton) {
            loadMoreButton.setAttribute('aria-label', 'Load more products');
            loadMoreButton.addEventListener('click', function() {
                this.setAttribute('aria-busy', 'true');
                this.textContent = 'Loading...';
                loadMoreProducts();
            });
            
            // Keyboard support for load more button
            loadMoreButton.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.click();
                }
            });
        }
    }

    // Load more products
    function loadMoreProducts() {
        // For now, just show all products
        renderProducts(productData, featuredProductsContainer);
        if (loadMoreButton) {
            loadMoreButton.style.display = 'none';
        }
    }

    // Show featured products
    function displayFeaturedProducts() {
        const featuredProducts = [...productData]
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 8);
            
        renderProducts(featuredProducts, featuredProductsContainer);
    }

    // Show deals
    function displayDeals() {
        const dealProducts = productData
            .filter(product => product.isDeal)
            .sort((a, b) => {
                const discountA = ((a.originalPrice - a.price) / a.originalPrice) * 100;
                const discountB = ((b.originalPrice - b.price) / b.originalPrice) * 100;
                return discountB - discountA;
            })
            .slice(0, 4);
            
        renderProducts(dealProducts, dealsProductsContainer, true);
    }

    // Generate responsive image URLs for Amazon product images
    function getResponsiveImageUrl(imageUrl, size = 'AC_SX300') {
        if (!imageUrl) return '';
        
        // If it's already a responsive URL, return as is
        if (imageUrl.includes('AC_')) return imageUrl;
        
        // Convert Amazon image URL to responsive version
        const url = new URL(imageUrl);
        const pathParts = url.pathname.split('.');
        
        if (pathParts.length > 1) {
            const extension = pathParts.pop();
            const baseName = pathParts.join('.');
            return `${baseName}.${size}_.${extension}`;
        }
        
        return imageUrl;
    }
    
    // Lazy load images when they come into view
    function setupLazyLoading() {
        const lazyImages = document.querySelectorAll('img[loading="lazy"]');
        
        if ('loading' in HTMLImageElement.prototype) {
            // Browser supports native lazy loading
            lazyImages.forEach(img => {
                // If src is a placeholder, replace with data-src
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                }
                // Generate responsive srcset if not already set
                if (!img.srcset && img.src) {
                    const src = img.src;
                    img.srcset = [
                        `${getResponsiveImageUrl(src, 'AC_SX180')} 180w`,
                        `${getResponsiveImageUrl(src, 'AC_SX300')} 300w`,
                        `${getResponsiveImageUrl(src, 'AC_SX480')} 480w`,
                        `${getResponsiveImageUrl(src, 'AC_SX600')} 600w`
                    ].join(', ');
                    img.sizes = '(max-width: 480px) 100vw, (max-width: 768px) 50vw, 33vw';
                }
            });
        } else {
            // Fallback for browsers that don't support loading="lazy"
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            // Generate responsive srcset
                            const src = img.src;
                            img.srcset = [
                                `${getResponsiveImageUrl(src, 'AC_SX180')} 180w`,
                                `${getResponsiveImageUrl(src, 'AC_SX300')} 300w`,
                                `${getResponsiveImageUrl(src, 'AC_SX480')} 480w`,
                                `${getResponsiveImageUrl(src, 'AC_SX600')} 600w`
                            ].join(', ');
                            img.sizes = '(max-width: 480px) 100vw, (max-width: 768px) 50vw, 33vw';
                            img.removeAttribute('data-src');
                        }
                        observer.unobserve(img);
                    }
                });
            });

            lazyImages.forEach(img => imageObserver.observe(img));
        }
    }
    
    /**
     * Render products with optimized images and accessibility features
     * @param {Array} products - Array of product objects
     * @param {HTMLElement} container - Container element to append products to
     * @param {boolean} showDealBadge - Whether to show deal badge
     */
    function renderProducts(products, container, showDealBadge = false) {
        if (!container) return;
        
        // Create document fragment for better performance
        const fragment = document.createDocumentFragment();
        
        // Clear loading message
        container.innerHTML = '';
        
        if (!products || products.length === 0) {
            const noResults = document.createElement('p');
            noResults.className = 'no-results';
            noResults.textContent = 'No products found.';
            noResults.setAttribute('role', 'status');
            noResults.setAttribute('aria-live', 'polite');
            container.appendChild(noResults);
            return;
        }
        
        // Create product elements
        products.forEach((product, index) => {
            const productId = `product-${product.id || Date.now() + index}`;
            const productElement = document.createElement('article');
            productElement.className = 'product-card';
            productElement.setAttribute('role', 'listitem');
            productElement.setAttribute('aria-labelledby', `${productId}-title`);
            
            // Generate responsive image URLs
            const imageUrl = product.image || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiB2aWV3Qm94PSIwIDAgMzAwIDMwMCI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkxvYWRpbmcgaW1hZ2UuLi48L3RleHQ+PC9zdmc+';
            const placeholderUrl = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiB2aWV3Qm94PSIwIDAgMzAwIDMwMCI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkxvYWRpbmcgaW1hZ2UuLi48L3RleHQ+PC9zdmc+';
            
            // Create product element with proper semantic structure
            productElement.innerHTML = `
                <a href="${product.url}" 
                   class="product-link" 
                   target="_blank" 
                   rel="noopener noreferrer" 
                   aria-labelledby="${productId}-title ${productId}-link"
                   data-product-id="${product.id || ''}">
                    <div class="product-image-container">
                        <img 
                            src="${placeholderUrl}"
                            data-src="${imageUrl}"
                            alt="" 
                            class="product-image" 
                            loading="lazy"
                            width="300"
                            height="300"
                            aria-hidden="true"
                            onload="this.classList.add('loaded')"
                            onerror="this.src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiB2aWV3Qm94PSIwIDAgMzAwIDMwMCI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkltYWdlIG5vdCBhdmFpbGFibGU8L3RleHQ+PC9zdmc+'; this.onerror=null;"
                        >
                        ${showDealBadge ? `
                        <span class="deal-badge" aria-hidden="true">
                            <span class="sr-only">Special Deal</span>
                            <span aria-hidden="true">Deal</span>
                        </span>` : ''}
                        ${product.isPrime ? `
                        <span class="prime-badge" aria-hidden="true">
                            <span class="sr-only">Prime Eligible</span>
                            <span aria-hidden="true">Prime</span>
                        </span>` : ''}
                    </div>
                    <div class="product-info">
                        <h3 id="${productId}-title" class="product-title">${product.name}</h3>
                        <span id="${productId}-link" class="sr-only">View on Amazon (opens in new tab)</span>
                    </div>
                </a>
            `;
            
            // Add to fragment for better performance
            fragment.appendChild(productElement);
        });
        
        // Append all products at once
        container.appendChild(fragment);
        
        // Set up lazy loading for the newly added images
        setupLazyLoading();
        
        // Focus management for better keyboard navigation
        if (container.children.length > 0) {
            const firstProduct = container.firstElementChild;
            firstProduct.setAttribute('data-first-product', 'true');
            firstProduct.setAttribute('tabindex', '-1');
        }
    }

    // Add product to cart (simplified for current UI)
    function addToCart(productId) {
        const product = productData.find(p => p.id === productId);
        if (!product) return;
        
        // Track Google Analytics event
        if (typeof gtag !== 'undefined') {
            gtag('event', 'select_item', {
                'event_category': 'Ecommerce',
                'event_label': product.name,
                'items': [{
                    'item_id': product.id,
                    'item_name': product.name,
                    'price': product.price,
                    'item_category': product.category
                }]
            });
        }
        
        // Open product in new tab
        window.open(product.url, '_blank');
    }

    // Save cart to localStorage
    function saveCart() {
        localStorage.setItem('amzTopProductsCart', JSON.stringify(cart));
    }

    // Load cart from localStorage
    function loadCart() {
        const savedCart = localStorage.getItem('amzTopProductsCart');
        if (savedCart) {
            cart = JSON.parse(savedCart);
            updateCartCount();
        }
    }

    // Mostrar notificación
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // Hide notification after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            
            // Remove from DOM after animation
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    // Generate star rating
    function generateStarRating(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        let stars = '';
        
        // Full stars
        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="fas fa-star"></i>';
        }
        
        // Half star
        if (hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        }
        
        // Empty stars
        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            stars += '<i class="far fa-star"></i>';
        }
        
        return `<div class="star-rating">${stars}</div>`;
    }

    // Initialize the application
    loadCart();
    
    // Initialize with sample data first, then fetch real data
    init().then(() => {
        // After initial render, fetch and update with real data
        updateProductsWithRealData();
    });
    
    // Update products with real data from API
    async function updateProductsWithRealData() {
        const productContainers = document.querySelectorAll('.products-grid, .featured-products, .deals-grid');
        
        for (const container of productContainers) {
            const productElements = container.querySelectorAll('.product-card');
            const productAsins = Array.from(productElements).map(el => el.dataset.asin).filter(Boolean);
            
            if (productAsins.length > 0) {
                const products = await fetchProductData(productAsins.map(asin => ({ asin })));
                
                // Update product cache
                products.forEach(product => {
                    if (product && product.asin) {
                        productCache.set(product.asin, product);
                    }
                });
                
                // Update UI with real data
                updateProductCards(container, products);
            }
        }
    }
    
    // Update product cards with real data
    function updateProductCards(container, products) {
        products.forEach(product => {
            if (!product || !product.asin) return;
            
            const card = container.querySelector(`.product-card[data-asin="${product.asin}"]`);
            if (!card) return;
            
            // Update price if available
            const priceElement = card.querySelector('.product-price');
            if (priceElement && product.price) {
                priceElement.textContent = UIUtils.formatPrice(product.price);
                
                // Show original price if there's a discount
                if (product.originalPrice > product.price) {
                    const originalPriceElement = document.createElement('span');
                    originalPriceElement.className = 'original-price';
                    originalPriceElement.textContent = UIUtils.formatPrice(product.originalPrice);
                    priceElement.appendChild(originalPriceElement);
                }
            }
            
            // Update rating if available
            const ratingElement = card.querySelector('.product-rating');
            if (ratingElement && product.rating) {
                ratingElement.innerHTML = generateStarRating(product.rating);
                
                // Add review count if available
                if (product.reviews) {
                    const reviewCount = document.createElement('span');
                    reviewCount.className = 'review-count';
                    reviewCount.textContent = `(${product.reviews})`;
                    ratingElement.appendChild(reviewCount);
                }
            }
            
            // Update Prime badge
            const primeBadge = card.querySelector('.prime-badge');
            if (primeBadge) {
                primeBadge.style.display = product.primeEligible ? 'inline-block' : 'none';
            }
            
            // Add deal expiration tooltip if applicable
            if (product.dealEnds) {
                const dealBadge = card.querySelector('.deal-badge');
                if (dealBadge) {
                    dealBadge.setAttribute('data-tooltip', `Deal ends: ${new Date(product.dealEnds).toLocaleDateString()}`);
                }
            }
        });
    }
});

// Función global para rastrear eventos
function trackEvent(category, action, label) {
    if (typeof gtag !== 'undefined') {
        gtag('event', action, {
            'event_category': category,
            'event_label': label
        });
    }
    
    // Registrar en la consola si no hay Google Analytics
    console.log(`Evento: ${category} - ${action} - ${label}`);
}