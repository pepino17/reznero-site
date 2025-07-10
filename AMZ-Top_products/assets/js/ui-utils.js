/**
 * UI Utilities
 * Handles tooltips, loading states, and other UI enhancements
 */

export class UIUtils {
  /**
   * Initialize tooltips for elements with data-tooltip attribute
   */
  static initTooltips() {
    document.addEventListener('mouseover', (e) => {
      const element = e.target.closest('[data-tooltip]');
      if (!element) return;
      
      const tooltipText = element.getAttribute('data-tooltip');
      if (!tooltipText) return;
      
      // Create tooltip if it doesn't exist
      let tooltip = element.querySelector('.tooltip');
      
      if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.setAttribute('role', 'tooltip');
        tooltip.textContent = tooltipText;
        
        // Position the tooltip
        const rect = element.getBoundingClientRect();
        tooltip.style.position = 'absolute';
        tooltip.style.top = `${window.scrollY + rect.top - 40}px`;
        tooltip.style.left = `${window.scrollX + rect.left}px`;
        
        element.style.position = 'relative';
        element.appendChild(tooltip);
        
        // Add event listeners for keyboard
        element.addEventListener('focus', UIUtils.showTooltip);
        element.addEventListener('blur', UIUtils.hideTooltip);
        element.addEventListener('mouseleave', UIUtils.hideTooltip);
      }
      
      tooltip.classList.add('visible');
    });
    
    // Close tooltips when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('[data-tooltip]')) {
        document.querySelectorAll('.tooltip.visible').forEach(tooltip => {
          tooltip.classList.remove('visible');
        });
      }
    });
    
    // Close tooltips when pressing Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.tooltip.visible').forEach(tooltip => {
          tooltip.classList.remove('visible');
        });
      }
    });
  }
  
  /**
   * Show tooltip
   * @param {Event} e - The event object
   */
  static showTooltip(e) {
    const element = e.target;
    const tooltip = element.querySelector('.tooltip');
    if (tooltip) {
      tooltip.classList.add('visible');
    }
  }
  
  /**
   * Hide tooltip
   * @param {Event} e - The event object
   */
  static hideTooltip(e) {
    const element = e.target;
    const tooltip = element.querySelector('.tooltip');
    if (tooltip) {
      tooltip.classList.remove('visible');
    }
  }
  
  /**
   * Format price with currency
   * @param {string|number} price - The price to format
   * @param {string} currency - The currency symbol (default: '$')
   * @returns {string} Formatted price
   */
  static formatPrice(price, currency = '$') {
    if (price === null || price === undefined) return 'N/A';
    const num = parseFloat(price);
    if (isNaN(num)) return 'N/A';
    return `${currency}${num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  }
  
  /**
   * Format date to MM/DD/YYYY
   * @param {string|Date} date - The date to format
   * @returns {string} Formatted date
   */
  static formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const year = d.getFullYear();
    
    return `${month}/${day}/${year}`;
  }
  
  /**
   * Calculate days until expiration
   * @param {string|Date} expiryDate - The expiration date
   * @returns {number} Days until expiration
   */
  static daysUntilExpiry(expiryDate) {
    if (!expiryDate) return null;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0);
    
    if (isNaN(expiry.getTime())) return null;
    
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays >= 0 ? diffDays : null;
  }
  
  /**
   * Get expiration text for tooltip
   * @param {string|Date} expiryDate - The expiration date
   * @returns {string} Expiration text
   */
  static getExpiryText(expiryDate) {
    const days = this.daysUntilExpiry(expiryDate);
    
    if (days === null) return 'Limited time offer';
    if (days === 0) return 'Expires today';
    if (days === 1) return 'Expires tomorrow';
    if (days <= 7) return `Expires in ${days} days`;
    
    return `Valid until ${this.formatDate(expiryDate)}`;
  }
  
  /**
   * Create a loading spinner
   * @param {string} size - Size of the spinner (sm, md, lg)
   * @returns {HTMLElement} Loading spinner element
   */
  static createSpinner(size = 'md') {
    const sizes = {
      sm: '1rem',
      md: '2rem',
      lg: '3rem'
    };
    
    const spinner = document.createElement('div');
    spinner.className = 'spinner';
    spinner.style.width = sizes[size] || sizes.md;
    spinner.style.height = sizes[size] || sizes.md;
    spinner.setAttribute('aria-hidden', 'true');
    
    return spinner;
  }
  
  /**
   * Show loading state for an element
   * @param {HTMLElement} element - The element to show loading state for
   * @param {string} size - Size of the spinner
   */
  static showLoading(element, size = 'md') {
    if (!element) return;
    
    // Save original content
    if (!element.hasAttribute('data-original-content')) {
      element.setAttribute('data-original-content', element.innerHTML);
    }
    
    // Create loading container
    const loadingContainer = document.createElement('div');
    loadingContainer.className = 'loading-container';
    loadingContainer.style.display = 'flex';
    loadingContainer.style.justifyContent = 'center';
    loadingContainer.style.alignItems = 'center';
    loadingContainer.style.minHeight = '100px';
    
    // Add spinner
    const spinner = this.createSpinner(size);
    loadingContainer.appendChild(spinner);
    
    // Replace content with loading state
    element.innerHTML = '';
    element.appendChild(loadingContainer);
    element.setAttribute('aria-busy', 'true');
  }
  
  /**
   * Hide loading state for an element
   * @param {HTMLElement} element - The element to hide loading state for
   */
  static hideLoading(element) {
    if (!element) return;
    
    // Restore original content
    const originalContent = element.getAttribute('data-original-content');
    if (originalContent) {
      element.innerHTML = originalContent;
      element.removeAttribute('data-original-content');
    }
    
    element.setAttribute('aria-busy', 'false');
  }
}

// Initialize tooltips when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  UIUtils.initTooltips();
});
