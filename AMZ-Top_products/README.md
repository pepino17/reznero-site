# AMZ Top Products

A powerful WordPress plugin for creating and managing Amazon affiliate product comparison lists with SEO optimization and performance in mind.

## Features

- Create beautiful product comparison pages with ease
- Import/export product data via CSV or JSON
- SEO-optimized templates with Schema.org structured data
- Mobile-responsive design
- Track affiliate link clicks
- User feedback system
- Performance optimized with lazy loading and caching
- Built with ACF Pro for easy content management

## Requirements

- WordPress 5.6 or higher
- PHP 7.4 or higher
- Advanced Custom Fields Pro (recommended) or ACF Free
- WooCommerce (optional, for additional integration)

## Installation

1. Upload the `AMZ-Top_products` folder to the `/wp-content/plugins/` directory
2. Activate the plugin through the 'Plugins' menu in WordPress
3. Configure the plugin settings under 'AMZ Products' in the WordPress admin
4. Start creating your product comparison pages!

## Usage

### Creating a New Product Comparison

1. Go to 'AMZ Products' > 'Add New' in the WordPress admin
2. Enter a title and description for your product comparison
3. Use the ACF fields to add products, including:
   - Product name and description
   - Price and availability
   - Product images and gallery
   - Pros and cons
   - Affiliate links
4. Publish your comparison page

### Using Shortcodes

Display a list of product comparisons:

```
[amz_products category="electronics" limit="5" orderby="date" order="DESC"]
```

### Importing Products

1. Go to 'AMZ Products' > 'Import/Export'
2. Choose a CSV or JSON file with your product data
3. Map the fields to the correct columns
4. Click 'Import' to create your products

## Template Overrides

You can override templates by copying them to your theme directory:

1. Create a directory called `amz-top-products` in your theme
2. Copy the template file you want to override from `plugins/AMZ-Top_products/templates/` to `your-theme/amz-top-products/`
3. Make your customizations to the template in your theme directory

## Filters and Actions

The plugin provides several filters and actions for customization:

### Filters

- `amz_product_data` - Filter product data before display
- `amz_affiliate_url` - Modify Amazon affiliate URLs
- `amz_schema_data` - Modify Schema.org structured data

### Actions

- `amz_before_product_content` - Before the product content
- `amz_after_product_content` - After the product content
- `amz_before_product_loop` - Before the product loop
- `amz_after_product_loop` - After the product loop

## Performance Optimization

For best performance, we recommend:

1. Using a caching plugin like WP Rocket or W3 Total Cache
2. Enabling a CDN for static assets
3. Optimizing product images before uploading
4. Keeping the number of products per comparison reasonable (5-10 recommended)

## Support

For support, please [open an issue](https://github.com/yourusername/amz-top-products/issues) on GitHub.

## Contributing

We welcome contributions! Please read our [contributing guidelines](CONTRIBUTING.md) before submitting pull requests.

## License

This plugin is licensed under the GPL v2 or later.

## Changelog

### 1.0.0
* Initial release
