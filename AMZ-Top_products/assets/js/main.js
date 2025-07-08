/**
 * AMZ Top Products - Main JavaScript File
 * Contiene la lógica principal del sitio web
 */

document.addEventListener('DOMContentLoaded', function() {
    // Datos de ejemplo para los productos (serán reemplazados por datos reales)
    const sampleProducts = [
        {
            id: 1,
            name: 'Auriculares Inalámbricos Bluetooth con Cancelación de Ruido',
            price: 79.99,
            originalPrice: 99.99,
            image: 'https://m.media-amazon.com/images/I/61CGHv6kmWL._AC_SL1500_.jpg',
            category: 'Tecnología',
            rating: 4.5,
            reviews: 1243,
            isDeal: true,
            url: 'https://www.amazon.es/dp/B08NTT1C3F',
            description: 'Auriculares inalámbricos con cancelación activa de ruido y hasta 30 horas de batería.'
        },
        {
            id: 2,
            name: 'Smartwatch con Monitor de Frecuencia Cardíaca y Oxígeno en Sangre',
            price: 129.99,
            originalPrice: 159.99,
            image: 'https://m.media-amazon.com/images/I/71Zf0q5tV5L._AC_SL1500_.jpg',
            category: 'Tecnología',
            rating: 4.7,
            reviews: 856,
            isDeal: true,
            url: 'https://www.amazon.es/dp/B08XK5F6VJ',
            description: 'Smartwatch con seguimiento de actividad, monitorización de sueño y resistencia al agua.'
        },
        {
            id: 3,
            name: 'Altavoz Bluetooth Portátil Impermeable',
            price: 45.50,
            originalPrice: 59.99,
            image: 'https://m.media-amazon.com/images/I/71y6T9ZY5VL._AC_SL1500_.jpg',
            category: 'Tecnología',
            rating: 4.3,
            reviews: 2105,
            isDeal: false,
            url: 'https://www.amazon.es/dp/B07QK1Y5CY',
            description: 'Altavoz inalámbrico resistente al agua con sonido estéreo y batería de larga duración.'
        },
        {
            id: 4,
            name: 'Cámara Deportiva 4K Ultra HD',
            price: 199.99,
            originalPrice: 249.99,
            image: 'https://m.media-amazon.com/images/I/61B04fQsMvL._AC_SL1500_.jpg',
            category: 'Tecnología',
            rating: 4.8,
            reviews: 3421,
            isDeal: true,
            url: 'https://www.amazon.es/dp/B08G2H4VBG',
            description: 'Cámara de acción 4K con estabilización de imagen y control por voz.'
        },
        {
            id: 5,
            name: 'Tablet 10 Pulgadas 128GB, Android 12',
            price: 259.99,
            originalPrice: 299.99,
            image: 'https://m.media-amazon.com/images/I/71LqS7SwdjL._AC_SL1500_.jpg',
            category: 'Tecnología',
            rating: 4.6,
            reviews: 1789,
            isDeal: true,
            url: 'https://www.amazon.es/dp/B09NWHV9R7',
            description: 'Tablet de alto rendimiento con pantalla Full HD y 6GB de RAM.'
        },
        {
            id: 6,
            name: 'Teclado Mecánico para Gaming con Retroiluminación RGB',
            price: 89.99,
            originalPrice: 119.99,
            image: 'https://m.media-amazon.com/images/I/71Uv3hO3QFL._AC_SL1500_.jpg',
            category: 'Tecnología',
            rating: 4.4,
            reviews: 932,
            isDeal: false,
            url: 'https://www.amazon.es/dp/B08N3X5Z8T',
            description: 'Teclado mecánico con switches azules y retroiluminación personalizable.'
        },
        {
            id: 7,
            name: 'Monitor Gaming Curvo 27" 144Hz',
            price: 289.99,
            originalPrice: 349.99,
            image: 'https://m.media-amazon.com/images/I/71rXSVqET9L._AC_SL1500_.jpg',
            category: 'Tecnología',
            rating: 4.7,
            reviews: 2156,
            isDeal: true,
            url: 'https://www.amazon.es/dp/B07YV5Y6H8',
            description: 'Monitor curvo Full HD con tiempo de respuesta de 1ms y FreeSync.'
        },
        {
            id: 8,
            name: 'Impresora Multifunción Inalámbrica',
            price: 149.99,
            originalPrice: 179.99,
            image: 'https://m.media-amazon.com/images/I/71p7rNzV4gL._AC_SL1500_.jpg',
            category: 'Oficina',
            rating: 4.5,
            reviews: 1872,
            isDeal: true,
            url: 'https://www.amazon.es/dp/B07P5PRK7J',
            description: 'Impresora todo en uno con Wi-Fi, escáner y copiadora.'
        }
    ];

    // Elementos del DOM
    const featuredProductsContainer = document.getElementById('featured-products');
    const dealsProductsContainer = document.getElementById('deals-products');
    const categoryCards = document.querySelectorAll('.category-card');
    const searchInput = document.querySelector('.search-input');
    const searchButton = document.querySelector('.search-button');
    const categoryFilter = document.querySelector('.category-filter');
    const priceFilter = document.querySelector('.price-filter');
    const sortSelect = document.querySelector('.sort-select');

    // Estado de la aplicación
    let currentProducts = [...sampleProducts];
    let cart = [];

    // Inicialización
    function init() {
        displayFeaturedProducts();
        displayDeals();
        setupEventListeners();
        updateCartCount();
        
        // Mostrar productos al cargar
        filterAndSortProducts();
    }

    // Configurar event listeners
    function setupEventListeners() {
        // Búsqueda
        if (searchButton) {
            searchButton.addEventListener('click', filterAndSortProducts);
        }
        
        if (searchInput) {
            searchInput.addEventListener('keyup', function(e) {
                if (e.key === 'Enter') {
                    filterAndSortProducts();
                }
            });
        }

        // Filtros
        if (categoryFilter) {
            categoryFilter.addEventListener('change', filterAndSortProducts);
        }
        
        if (priceFilter) {
            priceFilter.addEventListener('change', filterAndSortProducts);
        }
        
        if (sortSelect) {
            sortSelect.addEventListener('change', filterAndSortProducts);
        }

        // Categorías
        categoryCards.forEach(card => {
            card.addEventListener('click', function() {
                const category = this.getAttribute('data-category');
                if (categoryFilter) {
                    categoryFilter.value = category;
                    filterAndSortProducts();
                }
            });
        });
    }

    // Filtrar y ordenar productos
    function filterAndSortProducts() {
        let filteredProducts = [...sampleProducts];
        
        // Aplicar filtro de búsqueda
        if (searchInput && searchInput.value) {
            const searchTerm = searchInput.value.toLowerCase();
            filteredProducts = filteredProducts.filter(product => 
                product.name.toLowerCase().includes(searchTerm) || 
                product.description.toLowerCase().includes(searchTerm)
            );
        }
        
        // Aplicar filtro de categoría
        if (categoryFilter && categoryFilter.value) {
            filteredProducts = filteredProducts.filter(
                product => product.category === categoryFilter.value
            );
        }
        
        // Aplicar filtro de precio
        if (priceFilter && priceFilter.value) {
            const [min, max] = priceFilter.value.split('-').map(Number);
            filteredProducts = filteredProducts.filter(
                product => product.price >= min && product.price <= max
            );
        }
        
        // Aplicar ordenación
        if (sortSelect && sortSelect.value) {
            switch(sortSelect.value) {
                case 'price-asc':
                    filteredProducts.sort((a, b) => a.price - b.price);
                    break;
                case 'price-desc':
                    filteredProducts.sort((a, b) => b.price - a.price);
                    break;
                case 'rating':
                    filteredProducts.sort((a, b) => b.rating - a.rating);
                    break;
                case 'reviews':
                    filteredProducts.sort((a, b) => b.reviews - a.reviews);
                    break;
            }
        }
        
        // Actualizar productos mostrados
        currentProducts = filteredProducts;
        renderProducts(currentProducts, document.getElementById('products-container'));
    }

    // Mostrar productos destacados
    function displayFeaturedProducts() {
        const featuredProducts = [...sampleProducts]
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 4);
            
        renderProducts(featuredProducts, featuredProductsContainer);
    }

    // Mostrar ofertas
    function displayDeals() {
        const dealProducts = sampleProducts
            .filter(product => product.isDeal)
            .sort((a, b) => {
                const discountA = ((a.originalPrice - a.price) / a.originalPrice) * 100;
                const discountB = ((b.originalPrice - b.price) / b.originalPrice) * 100;
                return discountB - discountA;
            });
            
        renderProducts(dealProducts, dealsProductsContainer, true);
    }

    // Renderizar productos
    function renderProducts(products, container, showDealBadge = false) {
        if (!container) return;
        
        // Limpiar contenedor
        container.innerHTML = '';
        
        if (!products || products.length === 0) {
            container.innerHTML = '<div class="no-products">No se encontraron productos que coincidan con tu búsqueda.</div>';
            return;
        }
        
        // Crear elementos de producto
        products.forEach(product => {
            const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
            
            const productElement = document.createElement('div');
            productElement.className = 'product-card';
            productElement.innerHTML = `
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}" loading="lazy">
                    ${showDealBadge && product.isDeal ? '<span class="deal-badge">¡Oferta Especial!</span>' : ''}
                    ${discount > 0 ? `<span class="discount-badge">-${discount}%</span>` : ''}
                </div>
                <div class="product-info">
                    <h3 class="product-title">${product.name}</h3>
                    <div class="product-price">
                        ${product.price.toFixed(2)}€
                        ${product.originalPrice > product.price ? 
                            `<span class="original-price">${product.originalPrice.toFixed(2)}€</span>` : ''}
                    </div>
                    <div class="product-rating">
                        ${generateStarRating(product.rating)}
                        <span class="review-count">(${product.reviews})</span>
                    </div>
                    <p class="product-description">${product.description}</p>
                    <div class="product-actions">
                        <button class="btn btn-primary add-to-cart" data-id="${product.id}">
                            <i class="fas fa-shopping-cart"></i> Añadir al carrito
                        </button>
                        <a href="${product.url}" target="_blank" class="btn btn-outline" onclick="trackEvent('Product', 'View on Amazon', '${product.name}')">
                            Ver en Amazon
                        </a>
                    </div>
                </div>
            `;
            
            container.appendChild(productElement);
        });
        
        // Añadir event listeners a los botones de añadir al carrito
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', function() {
                const productId = parseInt(this.getAttribute('data-id'));
                addToCart(productId);
            });
        });
    }

    // Añadir producto al carrito
    function addToCart(productId) {
        const product = sampleProducts.find(p => p.id === productId);
        if (!product) return;
        
        const existingItem = cart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                ...product,
                quantity: 1
            });
        }
        
        updateCartCount();
        showNotification(`${product.name} añadido al carrito`);
        saveCart();
        
        // Trackear evento de Google Analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'add_to_cart', {
                'event_category': 'Ecommerce',
                'event_label': product.name,
                'value': product.price,
                'items': [{
                    'id': product.id,
                    'name': product.name,
                    'category': product.category,
                    'price': product.price,
                    'quantity': 1
                }]
            });
        }
    }

    // Actualizar contador del carrito
    function updateCartCount() {
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
            cartCount.textContent = totalItems;
            cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
        }
    }

    // Guardar carrito en localStorage
    function saveCart() {
        localStorage.setItem('amzTopProductsCart', JSON.stringify(cart));
    }

    // Cargar carrito desde localStorage
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
        
        // Mostrar notificación
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // Ocultar notificación después de 3 segundos
        setTimeout(() => {
            notification.classList.remove('show');
            
            // Eliminar del DOM después de la animación
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    // Generar estrellas de valoración
    function generateStarRating(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        let stars = '';
        
        // Estrellas llenas
        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="fas fa-star"></i>';
        }
        
        // Media estrella
        if (hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        }
        
        // Estrellas vacías
        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            stars += '<i class="far fa-star"></i>';
        }
        
        return `<div class="star-rating">${stars}</div>`;
    }

    // Inicializar la aplicación
    loadCart();
    init();
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