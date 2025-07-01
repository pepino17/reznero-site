const fs = require('fs');
const path = require('path');

// Function to generate a URL-friendly slug from a string
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/&/g, '-and-')
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/[-]+/g, '-')
    .substring(0, 80);
}

// Path to the products file
const productsPath = path.join(__dirname, '..', 'AMZ-links_eu', 'data', 'products_eu.json');

// Read the products file
fs.readFile(productsPath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading products file:', err);
    return;
  }

  try {
    const products = JSON.parse(data);
    
    // Update each product with a slug and clean URL
    const updatedProducts = products.map(product => {
      // Generate a slug from the product title
      const slug = slugify(product.title);
      
      // Create a clean URL for the product
      const cleanUrl = `/producto/${slug}/`;
      
      // Return the updated product with the new fields
      return {
        ...product,
        slug,
        cleanUrl,
        // Keep the original affiliate link in a separate field
        affiliateLink: product.link,
        // Update the main link to use the clean URL
        link: cleanUrl
      };
    });

    // Write the updated products back to the file
    fs.writeFile(
      productsPath,
      JSON.stringify(updatedProducts, null, 2),
      'utf8',
      (err) => {
        if (err) {
          console.error('Error writing updated products file:', err);
          return;
        }
        console.log('Successfully updated products with slugs and clean URLs!');
      }
    );
  } catch (error) {
    console.error('Error processing products:', error);
  }
});
