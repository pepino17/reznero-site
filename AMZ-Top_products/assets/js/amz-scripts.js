/**
 * AMZ Top Products - Frontend Scripts
 */

jQuery(document).ready(function($) {
    'use strict';

    // Gallery modal functionality
    const galleryModal = $('.amz-gallery-modal');
    const modalContent = $('.amz-gallery-modal-content');
    
    // Open gallery modal when clicking on a gallery item
    $('.amz-gallery-item').on('click', function() {
        const imgSrc = $(this).find('img').attr('src');
        const imgAlt = $(this).find('img').attr('alt') || '';
        
        modalContent.html(`
            <span class="amz-gallery-close">&times;</span>
            <img src="${imgSrc}" alt="${imgAlt}">
        `);
        
        galleryModal.addClass('active');
        $('body').css('overflow', 'hidden');
    });
    
    // Close modal when clicking the close button or outside the image
    galleryModal.on('click', function(e) {
        if ($(e.target).hasClass('amz-gallery-modal') || $(e.target).hasClass('amz-gallery-close')) {
            closeModal();
        }
    });
    
    // Close modal with ESC key
    $(document).on('keyup', function(e) {
        if (e.key === 'Escape' && galleryModal.hasClass('active')) {
            closeModal();
        }
    });
    
    function closeModal() {
        galleryModal.removeClass('active');
        $('body').css('overflow', '');
        // Small delay before clearing content to allow for fade out animation
        setTimeout(() => modalContent.empty(), 300);
    }
    
    // Handle feedback submission
    $('.amz-feedback-button').on('click', function() {
        const $button = $(this);
        const $container = $button.closest('.amz-feedback');
        const feedback = $button.data('feedback');
        const postId = $button.data('post-id');
        const nonce = amzData.nonce;
        
        // Prevent multiple clicks
        if ($button.hasClass('loading')) return;
        
        $button.addClass('loading').append('<span class="amz-loading"></span>');
        $button.siblings('.amz-feedback-button').prop('disabled', true);
        
        // Send AJAX request
        $.ajax({
            url: amzData.ajaxurl,
            type: 'POST',
            data: {
                action: 'amz_save_feedback',
                nonce: nonce,
                post_id: postId,
                feedback: feedback
            },
            success: function(response) {
                if (response.success) {
                    // Update UI
                    $button
                        .addClass(feedback === 'yes' ? 'liked' : 'disliked')
                        .removeClass('loading')
                        .find('.amz-loading')
                        .remove();
                    
                    // Show thank you message
                    $container.find('.amz-feedback-message').remove();
                    $container.append(`
                        <div class="amz-alert amz-alert-success">
                            ¡Gracias por tu feedback! Nos ayuda a mejorar.
                        </div>
                    `);
                } else {
                    showError();
                }
            },
            error: function() {
                showError();
            }
        });
        
        function showError() {
            $button.removeClass('loading').find('.amz-loading').remove();
            $button.siblings('.amz-feedback-button').prop('disabled', false);
            
            $container.find('.amz-feedback-message').remove();
            $container.append(`
                <div class="amz-alert amz-alert-error">
                    Error al enviar tu feedback. Por favor, inténtalo de nuevo.
                </div>
            `);
        }
    });
    
    // Track affiliate link clicks
    $('a[href*="amazon."]').filter(function() {
        return this.href.match(/amazon\.[a-z.]+\/([\w-]*(?:\/)?(?:dp|gp\/product)\/([\w-]+))?/i);
    }).on('click', function(e) {
        const $link = $(this);
        const href = $link.attr('href');
        const isAffiliateLink = href.includes('tag=');
        
        // Only track if it's an affiliate link
        if (isAffiliateLink) {
            e.preventDefault();
            
            // Send click data to GA4 if available
            if (typeof gtag === 'function') {
                gtag('event', 'click', {
                    'event_category': 'affiliate',
                    'event_label': 'Amazon Affiliate Link',
                    'value': href,
                    'transport_type': 'beacon',
                    'event_callback': function() {
                        window.open(href, '_blank', 'noopener,noreferrer');
                    }
                });
            } else {
                // Fallback to direct navigation if GA is not available
                window.open(href, '_blank', 'noopener,noreferrer');
            }
        }
    });
    
    // Smooth scrolling for anchor links
    $('a[href^="#"]').on('click', function(e) {
        const target = $(this.getAttribute('href'));
        
        if (target.length) {
            e.preventDefault();
            $('html, body').animate({
                scrollTop: target.offset().top - 100
            }, 800);
        }
    });
    
    // Mobile menu toggle
    $('.amz-mobile-menu-toggle').on('click', function() {
        $('.amz-mobile-menu').slideToggle();
    });
    
    // Initialize tooltips if using a library like Tippy.js
    if (typeof tippy === 'function') {
        tippy('[data-tippy-content]');
    }
    
    // Lazy load images
    if ('loading' in HTMLImageElement.prototype) {
        // Native lazy loading is supported
        document.querySelectorAll('img[loading="lazy"]').forEach(img => {
            img.src = img.dataset.src;
        });
    } else {
        // Fallback for browsers that don't support native lazy loading
        const lazyImages = [].slice.call(document.querySelectorAll('img[loading="lazy"]'));
        
        if ('IntersectionObserver' in window) {
            const lazyImageObserver = new IntersectionObserver(function(entries, observer) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        const lazyImage = entry.target;
                        lazyImage.src = lazyImage.dataset.src;
                        lazyImage.classList.remove('lazy');
                        lazyImageObserver.unobserve(lazyImage);
                    }
                });
            });
            
            lazyImages.forEach(function(lazyImage) {
                lazyImageObserver.observe(lazyImage);
            });
        } else {
            // Fallback for very old browsers
            let active = false;
            
            const lazyLoad = function() {
                if (active === false) {
                    active = true;
                    
                    setTimeout(function() {
                        lazyImages.forEach(function(lazyImage) {
                            if ((lazyImage.getBoundingClientRect().top <= window.innerHeight && 
                                 lazyImage.getBoundingClientRect().bottom >= 0) && 
                                getComputedStyle(lazyImage).display !== 'none') {
                                
                                lazyImage.src = lazyImage.dataset.src;
                                lazyImage.classList.remove('lazy');
                                
                                lazyImages = lazyImages.filter(function(image) {
                                    return image !== lazyImage;
                                });
                                
                                if (lazyImages.length === 0) {
                                    document.removeEventListener('scroll', lazyLoad);
                                    window.removeEventListener('resize', lazyLoad);
                                    window.removeEventListener('orientationchange', lazyLoad);
                                }
                            }
                        });
                        
                        active = false;
                    }, 200);
                }
            };
            
            document.addEventListener('scroll', lazyLoad);
            window.addEventListener('resize', lazyLoad);
            window.addEventListener('orientationchange', lazyLoad);
        }
    }
    
    // Handle tabbed content if any
    $('.amz-tab-button').on('click', function() {
        const tabId = $(this).data('tab');
        
        // Update active tab
        $('.amz-tab-button').removeClass('active');
        $(this).addClass('active');
        
        // Show corresponding content
        $('.amz-tab-content').removeClass('active');
        $(`#${tabId}`).addClass('active');
    });
});

// Helper function to debounce function calls
function debounce(func, wait, immediate) {
    let timeout;
    return function() {
        const context = this, args = arguments;
        const later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

// Helper function to throttle function calls
function throttle(callback, limit) {
    let waiting = false;
    return function() {
        if (!waiting) {
            callback.apply(this, arguments);
            waiting = true;
            setTimeout(function() {
                waiting = false;
            }, limit);
        }
    };
}
