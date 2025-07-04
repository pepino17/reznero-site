<?php
/**
 * Clase para manejar el Custom Post Type de productos
 */
class AMZ_Post_Type {

    /**
     * Registrar el Custom Post Type
     */
    public function register_post_type() {
        $labels = array(
            'name'                  => _x('Listados AMZ', 'Post Type General Name', 'amz-top-products'),
            'singular_name'         => _x('Listado', 'Post Type Singular Name', 'amz-top-products'),
            'menu_name'             => __('Listados AMZ', 'amz-top-products'),
            'name_admin_bar'        => __('Listado', 'amz-top-products'),
            'archives'              => __('Archivo de Listados', 'amz-top-products'),
            'attributes'            => __('Atributos del Listado', 'amz-top-products'),
            'parent_item_colon'     => __('Listado padre:', 'amz-top-products'),
            'all_items'             => __('Todos los Listados', 'amz-top-products'),
            'add_new_item'          => __('Añadir Nuevo Listado', 'amz-top-products'),
            'add_new'               => __('Añadir Nuevo', 'amz-top-products'),
            'new_item'              => __('Nuevo Listado', 'amz-top-products'),
            'edit_item'             => __('Editar Listado', 'amz-top-products'),
            'update_item'           => __('Actualizar Listado', 'amz-top-products'),
            'view_item'             => __('Ver Listado', 'amz-top-products'),
            'view_items'            => __('Ver Listados', 'amz-top-products'),
            'search_items'          => __('Buscar Listado', 'amz-top-products'),
            'not_found'             => __('No se encontraron listados', 'amz-top-products'),
            'not_found_in_trash'    => __('No se encontraron listados en la papelera', 'amz-top-products'),
            'featured_image'        => __('Imagen destacada', 'amz-top-products'),
            'set_featured_image'    => __('Establecer imagen destacada', 'amz-top-products'),
            'remove_featured_image' => __('Quitar imagen destacada', 'amz-top-products'),
            'use_featured_image'    => __('Usar como imagen destacada', 'amz-top-products'),
            'insert_into_item'      => __('Insertar en el listado', 'amz-top-products'),
            'uploaded_to_this_item' => __('Subido a este listado', 'amz-top-products'),
            'items_list'            => __('Lista de listados', 'amz-top-products'),
            'items_list_navigation' => __('Navegación de listados', 'amz-top-products'),
            'filter_items_list'     => __('Filtrar listados', 'amz-top-products'),
        );

        $rewrite = array(
            'slug'                  => 'AMZ-Top_products',
            'with_front'            => true,
            'pages'                 => true,
            'feeds'                 => true,
        );

        $args = array(
            'label'                 => __('Listado', 'amz-top-products'),
            'description'           => __('Listados de productos de afiliados', 'amz-top-products'),
            'labels'                => $labels,
            'supports'              => array('title', 'editor', 'thumbnail', 'revisions', 'custom-fields'),
            'taxonomies'            => array('category', 'post_tag'),
            'hierarchical'          => false,
            'public'                => true,
            'show_ui'               => true,
            'show_in_menu'          => true,
            'menu_position'         => 25,
            'menu_icon'             => 'dashicons-star-filled',
            'show_in_admin_bar'     => true,
            'show_in_nav_menus'     => true,
            'can_export'            => true,
            'has_archive'           => true,
            'exclude_from_search'   => false,
            'publicly_queryable'    => true,
            'rewrite'               => $rewrite,
            'capability_type'       => 'post',
            'show_in_rest'          => true,
        );

        register_post_type('amz_listing', $args);
    }

    /**
     * Registrar taxonomías personalizadas
     */
    public function register_taxonomies() {
        // Categorías de productos
        $category_labels = array(
            'name'              => _x('Categorías', 'taxonomy general name', 'amz-top-products'),
            'singular_name'     => _x('Categoría', 'taxonomy singular name', 'amz-top-products'),
            'search_items'      => __('Buscar Categorías', 'amz-top-products'),
            'all_items'         => __('Todas las Categorías', 'amz-top-products'),
            'parent_item'       => __('Categoría Padre', 'amz-top-products'),
            'parent_item_colon' => __('Categoría Padre:', 'amz-top-products'),
            'edit_item'         => __('Editar Categoría', 'amz-top-products'),
            'update_item'       => __('Actualizar Categoría', 'amz-top-products'),
            'add_new_item'      => __('Añadir Nueva Categoría', 'amz-top-products'),
            'new_item_name'     => __('Nuevo Nombre de Categoría', 'amz-top-products'),
            'menu_name'         => __('Categorías', 'amz-top-products'),
        );

        $category_args = array(
            'hierarchical'      => true,
            'labels'            => $category_labels,
            'show_ui'           => true,
            'show_admin_column' => true,
            'query_var'         => true,
            'rewrite'           => array('slug' => 'categoria-producto'),
            'show_in_rest'      => true,
        );

        register_taxonomy('amz_product_category', array('amz_listing'), $category_args);
    }

    /**
     * Registrar roles y capacidades
     */
    public function register_roles() {
        $admin_capabilities = array(
            'edit_amz_listing'              => true,
            'read_amz_listing'              => true,
            'delete_amz_listing'            => true,
            'edit_amz_listings'             => true,
            'edit_others_amz_listings'      => true,
            'publish_amz_listings'          => true,
            'read_private_amz_listings'     => true,
            'delete_amz_listings'           => true,
            'delete_private_amz_listings'   => true,
            'delete_published_amz_listings' => true,
            'delete_others_amz_listings'    => true,
            'edit_private_amz_listings'     => true,
            'edit_published_amz_listings'   => true,
        );

        add_role('amz_manager', __('Gestor de Productos AMZ', 'amz-top-products'), $admin_capabilities);

        // Añadir capacidades al administrador
        $admin_role = get_role('administrator');
        if ($admin_role) {
            foreach ($admin_capabilities as $cap => $grant) {
                $admin_role->add_cap($cap, $grant);
            }
        }

        // Añadir capacidades al rol de editor
        $editor_role = get_role('editor');
        if ($editor_role) {
            foreach ($admin_capabilities as $cap => $grant) {
                $editor_role->add_cap($cap, $grant);
            }
        }
    }

    /**
     * Registrar estado personalizado para listados
     */
    public function register_post_status() {
        register_post_status('needs_update', array(
            'label'                     => _x('Necesita actualización', 'amz-top-products'),
            'public'                    => false,
            'exclude_from_search'       => true,
            'show_in_admin_all_list'    => true,
            'show_in_admin_status_list' => true,
            'label_count'               => _n_noop('Necesita actualización <span class="count">(%s)</span>', 'Necesitan actualización <span class="count">(%s)</span>', 'amz-top-products'),
        ));
    }

    /**
     * Registrar shortcodes
     */
    public function register_shortcodes() {
        add_shortcode('amz_top_products', array($this, 'render_top_products_shortcode'));
    }

    /**
     * Renderizar shortcode de productos destacados
     */
    public function render_top_products_shortcode($atts) {
        $atts = shortcode_atts(array(
            'category' => '',
            'limit'    => 5,
            'orderby'  => 'date',
            'order'    => 'DESC',
        ), $atts, 'amz_top_products');

        ob_start();
        
        // Aquí irá la lógica para mostrar los productos
        echo '<div class="amz-top-products-container">';
        echo '<p>Lista de productos destacados aparecerá aquí</p>';
        echo '</div>';
        
        return ob_get_clean();
    }
}
