/**
 * Convert a string to a URL-friendly slug
 * @param {string} text - The text to convert to a slug
 * @returns {string} The URL-friendly slug
 */
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/&/g, '-and-')         // Replace & with 'and'
    .replace(/[\s\W-]+/g, '-')     // Replace spaces, non-word characters and dashes with a single dash
    .replace(/^-+|-+$/g, '')        // Remove leading/trailing dashes
    .replace(/[-]+/g, '-')          // Replace multiple dashes with a single dash
    .replace(/[^\w\-]+/g, '')      // Remove all non-word characters (except dashes)
    .substring(0, 80);              // Limit length to 80 characters
}

/**
 * Get the current category from the URL
 * @returns {string} The current category slug
 */
function getCurrentCategory() {
  const path = window.location.pathname;
  const match = path.match(/\/categoria\/([^/]+)/);
  return match ? match[1] : null;
}

/**
 * Get the current product slug from the URL
 * @returns {string} The current product slug
 */
function getCurrentProductSlug() {
  const path = window.location.pathname;
  const match = path.match(/\/producto\/([^/]+)/);
  return match ? match[1] : null;
}

/**
 * Generate a URL for a category page
 * @param {string} category - The category name
 * @returns {string} The category URL
 */
function getCategoryUrl(category) {
  return `/categoria/${slugify(category)}/`;
}

/**
 * Generate a URL for a product page
 * @param {string} title - The product title
 * @returns {string} The product URL
 */
function getProductUrl(title) {
  return `/producto/${slugify(title)}/`;
}

export {
  slugify,
  getCurrentCategory,
  getCurrentProductSlug,
  getCategoryUrl,
  getProductUrl
};
