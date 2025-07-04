<?php
/**
 * Plugin Name: AMZ Top Products
 * Plugin URI: https://reznero.com/plugins/amz-top-products
 * Description: A plugin to display and manage Amazon affiliate product comparisons.
 * Version: 1.0.0
 * Author: Reznero Team
 * Author URI: https://reznero.com
 * Text Domain: amz-top-products
 * Domain Path: /languages
 * Requires at least: 5.6
 * Requires PHP: 7.4
 *
 * @package AMZ_Top_Products
 */

// If this file is called directly, abort.
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants.
define('AMZ_TOP_PRODUCTS_VERSION', '1.0.0');
define('AMZ_TOP_PRODUCTS_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('AMZ_TOP_PRODUCTS_PLUGIN_URL', plugin_dir_url(__FILE__));

// Include required files
require_once AMZ_TOP_PRODUCTS_PLUGIN_DIR . 'includes/class-amz-top-products.php';
require_once AMZ_TOP_PRODUCTS_PLUGIN_DIR . 'includes/class-amz-post-type.php';
require_once AMZ_TOP_PRODUCTS_PLUGIN_DIR . 'includes/class-amz-acf-fields.php';
require_once AMZ_TOP_PRODUCTS_PLUGIN_DIR . 'includes/class-amz-import-export.php';
require_once AMZ_TOP_PRODUCTS_PLUGIN_DIR . 'includes/amz-functions.php';

// Initialize the plugin
function amz_top_products_init() {
    // Load textdomain for translations
    load_plugin_textdomain(
        'amz-top-products',
        false,
        dirname(plugin_basename(__FILE__)) . '/languages/'
    );
    
    // Initialize plugin classes
    $plugin = new AMZ_Top_Products();
    $post_type = new AMZ_Post_Type();
    $acf_fields = new ACF_Fields();
    $import_export = new AMZ_Import_Export();
    
    // Register hooks
    add_action('init', array($post_type, 'register_post_type'));
    add_action('init', array($post_type, 'register_taxonomy'));
    add_action('acf/init', array($acf_fields, 'register_fields'));
    add_action('admin_menu', array($import_export, 'add_import_export_page'));
    add_action('admin_enqueue_scripts', array($plugin, 'enqueue_admin_scripts'));
    add_action('wp_enqueue_scripts', array($plugin, 'enqueue_public_scripts'));
    add_action('save_post_amz_listing', array($plugin, 'save_post_meta'), 10, 3);
    
    // AJAX handlers
    add_action('wp_ajax_amz_save_feedback', 'amz_handle_feedback');
    add_action('wp_ajax_nopriv_amz_save_feedback', 'amz_handle_feedback');
    
    // Register shortcodes
    add_shortcode('amz_products', 'amz_products_shortcode');
    
    // Register template path
    add_filter('template_include', array($plugin, 'template_loader'));
}
add_action('plugins_loaded', 'amz_top_products_init');

/**
 * Activation hook.
 */
function amz_top_products_activate() {
    // Register post type and flush rewrite rules
    $post_type = new AMZ_Post_Type();
    $post_type->register_post_type();
    $post_type->register_taxonomy();
    
    // Set up default options
    update_option('amz_default_affiliate_tag', 'reznero-21');
    update_option('amz_enable_analytics', 'yes');
    update_option('amz_track_clicks', 'yes');
    
    // Flush rewrite rules
    flush_rewrite_rules();
}
register_activation_hook(__FILE__, 'amz_top_products_activate');

/**
 * Deactivation hook.
 */
function amz_top_products_deactivate() {
    // Clean up options if needed
    // delete_option('amz_default_affiliate_tag');
    
    // Flush rewrite rules
    flush_rewrite_rules();
}
register_deactivation_hook(__FILE__, 'amz_top_products_deactivate');

/**
 * Uninstall hook.
 */
function amz_top_products_uninstall() {
    // Clean up options
    delete_option('amz_default_affiliate_tag');
    delete_option('amz_enable_analytics');
    delete_option('amz_track_clicks');
    
    // Remove all plugin data if needed
    // $posts = get_posts(array(
    //     'post_type' => 'amz_listing',
    //     'numberposts' => -1,
    //     'post_status' => 'any',
    // ));
    
    // foreach ($posts as $post) {
    //     wp_delete_post($post->ID, true);
    // }
    
    // Flush rewrite rules
    flush_rewrite_rules();
}
register_uninstall_hook(__FILE__, 'amz_top_products_uninstall');

/**
 * Activation hook.
 */
function amz_top_products_activate() {
    // Crear páginas necesarias
    if (!get_page_by_path('amz-top-products')) {
        $page_data = array(
            'post_title'    => 'Top Productos Amazon',
            'post_name'     => 'amz-top-products',
            'post_status'   => 'publish',
            'post_type'     => 'page',
            'post_content'  => '[amz_top_products]'
        );
        wp_insert_post($page_data);
    }
}

// Desactivación del plugin
register_deactivation_hook(__FILE__, 'amz_top_products_deactivate');
function amz_top_products_deactivate() {
    // Limpiar opciones si es necesario
}
