<?php
/**
 * Funciones auxiliares para AMZ Top Products
 */

if (!defined('ABSPATH')) {
    exit; // Salir si se accede directamente
}

/**
 * Obtener el contador de visitas de un listado
 */
function amz_get_view_count($post_id = null) {
    if (null === $post_id) {
        $post_id = get_the_ID();
    }
    
    $count = get_post_meta($post_id, 'amz_view_count', true);
    return $count ? (int) $count : 0;
}

/**
 * Incrementar el contador de visitas
 */
function amz_increment_view_count($post_id = null) {
    if (null === $post_id) {
        $post_id = get_the_ID();
    }
    
    $count = amz_get_view_count($post_id);
    $count++;
    update_post_meta($post_id, 'amz_view_count', $count);
    
    return $count;
}

/**
 * Obtener botones de compartir en redes sociales
 */
function amz_get_social_share_buttons($post_id = null) {
    if (null === $post_id) {
        $post_id = get_the_ID();
    }
    
    $url = urlencode(get_permalink($post_id));
    $title = urlencode(get_the_title($post_id));
    $excerpt = urlencode(get_the_excerpt($post_id));
    $image = has_post_thumbnail($post_id) ? wp_get_attachment_image_src(get_post_thumbnail_id($post_id), 'large') : '';
    $image_url = $image ? urlencode($image[0]) : '';
    
    $networks = array(
        'facebook' => array(
            'url' => "https://www.facebook.com/sharer/sharer.php?u={$url}",
            'icon' => 'facebook-f',
            'label' => 'Compartir en Facebook',
        ),
        'twitter' => array(
            'url' => "https://twitter.com/intent/tweet?url={$url}&text={$title}",
            'icon' => 'twitter',
            'label' => 'Compartir en Twitter',
        ),
        'pinterest' => array(
            'url' => "https://pinterest.com/pin/create/button/?url={$url}&media={$image_url}&description={$title}",
            'icon' => 'pinterest-p',
            'label' => 'Guardar en Pinterest',
        ),
        'whatsapp' => array(
            'url' => "https://wa.me/?text={$title}%20{$url}",
            'icon' => 'whatsapp',
            'label' => 'Compartir por WhatsApp',
        ),
        'email' => array(
            'url' => "mailto:?subject={$title}&body={$excerpt}%0D%0A%0D%0ALee más: {$url}",
            'icon' => 'envelope',
            'label' => 'Enviar por correo',
        ),
    );
    
    $html = '<div class="amz-social-share flex items-center space-x-2 mt-4">';
    $html .= '<span class="text-sm text-gray-600 mr-2">Compartir:</span>';
    
    foreach ($networks as $network) {
        $html .= sprintf(
            '<a href="%s" target="_blank" rel="noopener noreferrer" ' . 
            'class="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center ' . 
            'text-gray-700 hover:text-white transition-colors" title="%s">' .
            '<i class="fab fa-%s"></i></a>',
            esc_url($network['url']),
            esc_attr($network['label']),
            esc_attr($network['icon'])
        );
    }
    
    $html .= '</div>';
    
    return $html;
}

/**
 * Generar schema.org JSON-LD para los productos
 */
function amz_generate_product_schema($products, $page_title, $page_description, $page_url) {
    if (empty($products) || !is_array($products)) {
        return '';
    }
    
    $site_name = get_bloginfo('name');
    $site_url = home_url('/');
    $logo = get_theme_mod('custom_logo') ? 
        wp_get_attachment_image_src(get_theme_mod('custom_logo'), 'full')[0] : 
        '';
    
    // Schema principal (ItemList)
    $schema = array(
        '@context' => 'https://schema.org',
        '@type' => 'ItemList',
        'itemListOrder' => 'https://schema.org/ItemListOrderDescending',
        'numberOfItems' => count($products),
        'name' => $page_title,
        'description' => wp_strip_all_tags($page_description),
        'url' => $page_url,
        'itemListElement' => array(),
    );
    
    // Agregar cada producto a la lista
    foreach ($products as $index => $product) {
        $product_url = !empty($product['affiliate_link']) ? $product['affiliate_link'] : $page_url;
        $price = preg_replace('/[^0-9,.]/', '', $product['price']);
        $price = str_replace(',', '.', $price);
        
        $product_schema = array(
            '@type' => 'ListItem',
            'position' => $index + 1,
            'item' => array(
                '@type' => 'Product',
                'name' => $product['name'],
                'url' => $product_url,
                'position' => $index + 1,
                'offers' => array(
                    '@type' => 'Offer',
                    'url' => $product_url,
                    'priceCurrency' => 'EUR',
                    'price' => $price,
                    'availability' => 'https://schema.org/InStock',
                    'priceValidUntil' => date('Y-m-d', strtotime('+1 year')),
                    'itemCondition' => 'https://schema.org/NewCondition',
                    'seller' => array(
                        '@type' => 'Organization',
                        'name' => 'Amazon',
                        'url' => 'https://www.amazon.es/'
                    )
                ),
                'brand' => array(
                    '@type' => 'Brand',
                    'name' => $product['brand'] ?? 'Varios'
                )
            )
        );
        
        // Agregar imagen si está disponible
        if (!empty($product['image']['url'])) {
            $product_schema['item']['image'] = $product['image']['url'];
        }
        
        // Agregar descripción si está disponible
        if (!empty($product['description'])) {
            $product_schema['item']['description'] = wp_strip_all_tags($product['description']);
        }
        
        // Agregar calificación si está disponible
        if (!empty($product['rating'])) {
            $product_schema['item']['aggregateRating'] = array(
                '@type' => 'AggregateRating',
                'ratingValue' => $product['rating'],
                'reviewCount' => $product['review_count'] ?? 1,
                'bestRating' => '5',
                'worstRating' => '1'
            );
        }
        
        $schema['itemListElement'][] = $product_schema;
    }
    
    // Agregar WebPage y WebSite al schema
    $full_schema = array(
        array(
            '@context' => 'https://schema.org',
            '@type' => 'WebPage',
            'name' => $page_title,
            'description' => wp_strip_all_tags($page_description),
            'url' => $page_url,
            'mainEntity' => $schema
        ),
        array(
            '@context' => 'https://schema.org',
            '@type' => 'WebSite',
            'name' => $site_name,
            'url' => $site_url,
            'potentialAction' => array(
                '@type' => 'SearchAction',
                'target' => $site_url . '?s={search_term_string}',
                'query-input' => 'required name=search_term_string'
            )
        )
    );
    
    // Agregar Organization schema si hay logo
    if ($logo) {
        $full_schema[] = array(
            '@context' => 'https://schema.org',
            '@type' => 'Organization',
            'name' => $site_name,
            'url' => $site_url,
            'logo' => $logo,
            'sameAs' => array(
                'https://www.facebook.com/' . get_theme_mod('facebook_handle'),
                'https://twitter.com/' . get_theme_mod('twitter_handle'),
                'https://www.instagram.com/' . get_theme_mod('instagram_handle')
            )
        );
    }
    
    // Generar el HTML del script
    $html = '<!-- Schema.org markup for Google -->' . "\n";
    $html .= '<script type="application/ld+json">' . "\n";
    $html .= wp_json_encode($full_schema, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . "\n";
    $html .= '</script>' . "\n";
    
    return $html;
}

/**
 * Registrar y cargar estilos y scripts
 */
function amz_enqueue_scripts() {
    // Estilos
    wp_enqueue_style(
        'amz-styles',
        plugins_url('assets/css/amz-styles.css', dirname(__FILE__)),
        array(),
        '1.0.0'
    );
    
    // Scripts
    wp_enqueue_script(
        'amz-scripts',
        plugins_url('assets/js/amz-scripts.js', dirname(__FILE__)),
        array('jquery'),
        '1.0.0',
        true
    );
    
    // Localizar script con datos de WordPress
    wp_localize_script('amz-scripts', 'amzData', array(
        'ajaxurl' => admin_url('admin-ajax.php'),
        'nonce' => wp_create_nonce('amz_ajax_nonce'),
        'isMobile' => wp_is_mobile(),
    ));
    
    // Font Awesome para iconos de redes sociales
    wp_enqueue_style(
        'font-awesome',
        'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css',
        array(),
        '5.15.4'
    );
}
add_action('wp_enqueue_scripts', 'amz_enqueue_scripts');

/**
 * Manejar feedback de los usuarios
 */
function amz_handle_feedback() {
    // Verificar nonce
    if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'amz_feedback_nonce')) {
        wp_send_json_error('Nonce verification failed');
    }
    
    $post_id = isset($_POST['post_id']) ? intval($_POST['post_id']) : 0;
    $feedback = isset($_POST['feedback']) ? sanitize_text_field($_POST['feedback']) : '';
    
    if (!$post_id || !$feedback) {
        wp_send_json_error('Datos incompletos');
    }
    
    // Obtener feedback actual
    $current_feedback = get_post_meta($post_id, 'amz_feedback', true);
    if (!is_array($current_feedback)) {
        $current_feedback = array(
            'yes' => 0,
            'no' => 0,
            'total' => 0
        );
    }
    
    // Actualizar contadores
    $current_feedback[$feedback]++;
    $current_feedback['total']++;
    
    // Guardar en la base de datos
    update_post_meta($post_id, 'amz_feedback', $current_feedback);
    
    // Devolver éxito
    wp_send_json_success(array(
        'message' => '¡Gracias por tu feedback!',
        'stats' => $current_feedback
    ));
}
add_action('wp_ajax_amz_save_feedback', 'amz_handle_feedback');
add_action('wp_ajax_nopriv_amz_save_feedback', 'amz_handle_feedback');

/**
 * Registrar el shortcode para mostrar listados de productos
 */
function amz_products_shortcode($atts) {
    // Atributos por defecto
    $atts = shortcode_atts(array(
        'category' => '',
        'limit' => 5,
        'orderby' => 'date',
        'order' => 'DESC',
        'ids' => '',
    ), $atts, 'amz_products');
    
    // Preparar argumentos de la consulta
    $args = array(
        'post_type' => 'amz_listing',
        'posts_per_page' => intval($atts['limit']),
        'orderby' => sanitize_text_field($atts['orderby']),
        'order' => strtoupper($atts['order']) === 'ASC' ? 'ASC' : 'DESC',
        'post_status' => 'publish',
    );
    
    // Filtrar por categoría si se especifica
    if (!empty($atts['category'])) {
        $args['tax_query'] = array(
            array(
                'taxonomy' => 'amz_product_category',
                'field'    => 'slug',
                'terms'    => explode(',', $atts['category']),
            ),
        );
    }
    
    // Filtrar por IDs si se especifican
    if (!empty($atts['ids'])) {
        $args['post__in'] = array_map('intval', explode(',', $atts['ids']));
        $args['orderby'] = 'post__in';
    }
    
    // Ejecutar la consulta
    $query = new WP_Query($args);
    
    // Iniciar el buffer de salida
    ob_start();
    
    if ($query->have_posts()) :
        echo '<div class="amz-products-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">';
        
        while ($query->have_posts()) : $query->the_post();
            $products = get_field('products', get_the_ID());
            $main_product = is_array($products) ? reset($products) : array();
            $product_url = !empty($main_product['affiliate_link']) ? $main_product['affiliate_link'] : get_permalink();
            ?>
            <div class="amz-product-card bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
                <a href="<?php echo esc_url($product_url); ?>" class="block">
                    <?php if (has_post_thumbnail()) : ?>
                        <div class="h-48 bg-gray-100 overflow-hidden">
                            <?php the_post_thumbnail('large', array('class' => 'w-full h-full object-cover')); ?>
                        </div>
                    <?php endif; ?>
                    
                    <div class="p-4">
                        <h3 class="font-semibold text-lg mb-2 hover:text-blue-600"><?php the_title(); ?></h3>
                        
                        <?php if (get_field('subtitle', get_the_ID())) : ?>
                            <p class="text-gray-600 text-sm mb-3"><?php echo esc_html(get_field('subtitle', get_the_ID())); ?></p>
                        <?php endif; ?>
                        
                        <?php if (!empty($main_product['price'])) : ?>
                            <div class="text-lg font-bold text-blue-700"><?php echo esc_html($main_product['price']); ?></div>
                        <?php endif; ?>
                        
                        <?php if (!empty($main_product['pros'])) : ?>
                            <ul class="mt-2 space-y-1 text-sm text-gray-700">
                                <?php foreach (array_slice($main_product['pros'], 0, 3) as $pro) : ?>
                                    <li class="flex items-start">
                                        <svg class="h-4 w-4 text-green-500 mr-1 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                                        </svg>
                                        <span><?php echo esc_html($pro['text']); ?></span>
                                    </li>
                                <?php endforeach; ?>
                            </ul>
                        <?php endif; ?>
                        
                        <div class="mt-4">
                            <span class="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                                Ver oferta
                                <svg class="ml-1 w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                                </svg>
                            </span>
                        </div>
                    </div>
                </a>
            </div>
            <?php
        endwhile;
        
        echo '</div>';
        
        // Restaurar datos del post original
        wp_reset_postdata();
    else :
        echo '<p>No se encontraron productos.</p>';
    endif;
    
    // Devolver el contenido del buffer
    return ob_get_clean();
}
add_shortcode('amz_products', 'amz_products_shortcode');
