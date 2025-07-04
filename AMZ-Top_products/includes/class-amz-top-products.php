<?php
/**
 * Clase principal del plugin AMZ Top Products
 */
class AMZ_Top_Products {

    /**
     * The unique identifier of this plugin.
     *
     * @since    1.0.0
     * @access   protected
     * @var      string    $plugin_name    The string used to uniquely identify this plugin.
     */
    protected $plugin_name;

    /**
     * The current version of the plugin.
     *
     * @since    1.0.0
     * @access   protected
     * @var      string    $version    The current version of the plugin.
     */
    protected $version;

    /**
     * Initialize the class and set its properties.
     */
    public function __construct() {
        $this->version = AMZ_TOP_PRODUCTS_VERSION;
        $this->plugin_name = 'amz-top-products';
        $this->load_dependencies();
        $this->set_locale();
    }

    /**
     * Cargar dependencias
     */
    private function load_dependencies() {
        // Cargar archivos necesarios
    }

    /**
     * Configurar la localización
     */
    private function set_locale() {
        add_action('plugins_loaded', array($this, 'load_plugin_textdomain'));
    }

    /**
     * Cargar archivos de traducción
     */
    public function load_plugin_textdomain() {
        load_plugin_textdomain(
            'amz-top-products',
            false,
            dirname(dirname(plugin_basename(__FILE__))) . '/languages/'
        );
    }

    /**
     * Enqueue admin-specific styles and scripts.
     */
    public function enqueue_admin_scripts($hook) {
        // Only load on our plugin pages
        $screen = get_current_screen();
        if (strpos($hook, 'amz-') === false && $screen->post_type !== 'amz_listing') {
            return;
        }

        // Admin styles
        wp_enqueue_style(
            $this->plugin_name . '-admin',
            AMZ_TOP_PRODUCTS_PLUGIN_URL . 'assets/css/admin-styles.css',
            array(),
            $this->version,
            'all'
        );

        // Admin scripts
        wp_enqueue_script(
            $this->plugin_name . '-admin',
            AMZ_TOP_PRODUCTS_PLUGIN_URL . 'assets/js/admin-scripts.js',
            array('jquery'),
            $this->version,
            true
        );

        // Localize script with data
        wp_localize_script($this->plugin_name . '-admin', 'amzAdminData', array(
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('amz_admin_nonce'),
            'i18n' => array(
                'confirm_delete' => __('Are you sure you want to delete this item?', 'amz-top-products'),
                'error_occurred' => __('An error occurred. Please try again.', 'amz-top-products'),
            )
        ));
    }

    /**
     * Enqueue public-facing styles and scripts.
     */
    public function enqueue_public_scripts() {
        // Only load on single listings
        if (!is_singular('amz_listing')) {
            return;
        }

        // Main styles (already registered in amz-functions.php)
        wp_enqueue_style('amz-styles');

        // Main scripts (already registered in amz-functions.php)
        wp_enqueue_script('amz-scripts');

        // Add additional inline styles for dynamic content
        $custom_css = "
            .amz-product-card {
                transition: all 0.3s ease;
            }
            .amz-product-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 10px 20px rgba(0,0,0,0.1);
            }
        ";
        wp_add_inline_style('amz-styles', $custom_css);
    }

    /**
     * Handle saving post meta data.
     */
    public function save_post_meta($post_id, $post, $update) {
        // Check if this is an autosave
        if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
            return;
        }

        // Check permissions
        if (!current_user_can('edit_post', $post_id)) {
            return;
        }

        // Check if this is a revision
        if (wp_is_post_revision($post_id)) {
            return;
        }

        // Save view count if not set
        if (!get_post_meta($post_id, 'amz_view_count', true)) {
            update_post_meta($post_id, 'amz_view_count', 0);
        }
    }

    /**
     * Template loader.
     */
    public function template_loader($template) {
        $find = array();
        $file = '';

        if (is_singular('amz_listing')) {
            $file = 'single-amz_listing.php';
            $find[] = $file;
            $find[] = 'templates/' . $file;
        }

        if ($file) {
            $template_locate = locate_template($find);
            
            if ($template_locate) {
                // Use theme template if it exists
                return $template_locate;
            } else {
                // Use plugin template
                return AMZ_TOP_PRODUCTS_PLUGIN_DIR . 'templates/' . $file;
            }
        }

        return $template;
    }

    /**
     * Get the plugin URL.
     */
    public function get_plugin_url() {
        return AMZ_TOP_PRODUCTS_PLUGIN_URL;
    }

    /**
     * Get the plugin path.
     */
    public function get_plugin_path() {
        return AMZ_TOP_PRODUCTS_PLUGIN_DIR;
    }

    /**
     * Get the plugin basename.
     */
    public function get_plugin_basename() {
        return plugin_basename(AMZ_TOP_PRODUCTS_PLUGIN_DIR . $this->plugin_name . '.php');
    }

    /**
     * Activation function.
     */
    public static function activate() {
        // Create necessary database tables or options
        if (!get_option('amz_flush_rewrite_rules_flag')) {
            add_option('amz_flush_rewrite_rules_flag', true);
        }
        
        // Set default options
        update_option('amz_default_affiliate_tag', 'reznero-21');
        update_option('amz_enable_analytics', 'yes');
        update_option('amz_track_clicks', 'yes');
        
        // Flush rewrite rules on next init
        flush_rewrite_rules();
    }

    /**
     * Deactivation function.
     */
    public static function deactivate() {
        // Clean up options if needed
        // delete_option('amz_default_affiliate_tag');
        
        // Flush rewrite rules
        flush_rewrite_rules();
    }

    /**
     * Uninstall function.
     */
    public static function uninstall() {
        // Clean up options
        delete_option('amz_default_affiliate_tag');
        delete_option('amz_enable_analytics');
        delete_option('amz_track_clicks');
        delete_option('amz_flush_rewrite_rules_flag');
        
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

    /**
     * Ejecutar el plugin
     */
    public function run() {
        $this->define_admin_hooks();
        $this->define_public_hooks();
    }

    /**
     * Registrar hooks del área de administración
     */
    private function define_admin_hooks() {
        // Aquí irán los hooks del área de administración
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_scripts'));
    }

    /**
     * Registrar hooks del área pública
     */
    private function define_public_hooks() {
        // Aquí irán los hooks del área pública
        add_action('wp_enqueue_scripts', array($this, 'enqueue_public_scripts'));
        add_filter('template_include', array($this, 'template_loader'));
        add_action('save_post', array($this, 'save_post_meta'), 10, 3);
    }
}
