<?php
/**
 * Template Name: Plantilla de Listado AMZ
 * Template Post Type: amz_listing
 */

get_header();
?>

<main id="primary" class="site-main container mx-auto px-4 py-8">
    <?php
    while (have_posts()) :
        the_post();
        $products = get_field('products');
        $total_products = is_array($products) ? count($products) : 0;
        $category = '';
        $terms = get_the_terms(get_the_ID(), 'amz_product_category');
        if ($terms && !is_wp_error($terms)) {
            $category = $terms[0]->name;
        }
    ?>
        <article id="post-<?php the_ID(); ?>" <?php post_class('amz-listing'); ?>>
            <!-- Breadcrumbs -->
            <div class="amz-breadcrumbs mb-6 text-sm text-gray-600">
                <?php
                if (function_exists('yoast_breadcrumb')) {
                    yoast_breadcrumb('<p id="breadcrumbs">', '</p>');
                } else {
                    echo '<a href="' . esc_url(home_url('/')) . '">Inicio</a> &raquo; ';
                    echo '<a href="' . esc_url(get_post_type_archive_link('amz_listing')) . '">Listados AMZ</a> &raquo; ';
                    echo '<span class="current">' . get_the_title() . '</span>';
                }
                ?>
            </div>

            <!-- Encabezado -->
            <header class="entry-header mb-8">
                <?php
                the_title('<h1 class="entry-title text-3xl md:text-4xl font-bold mb-4">Top ' . $total_products . ' ', ' en Amazon</h1>');
                
                if (get_field('subtitle')) {
                    echo '<h2 class="text-xl md:text-2xl text-gray-600 mb-6">' . get_field('subtitle') . '</h2>';
                }
                
                // Fecha de actualización
                echo '<div class="text-sm text-gray-500 mb-6">';
                echo '<span class="mr-4"><i class="far fa-calendar-alt mr-1"></i> ' . get_the_modified_date() . '</span>';
                echo '<span><i class="far fa-eye mr-1"></i> ' . amz_get_view_count(get_the_ID()) . ' visitas</span>';
                echo '</div>';
                
                // Botones de redes sociales
                echo amz_get_social_share_buttons();
                ?>
            </header>

            <div class="entry-content">
                <!-- Introducción -->
                <?php if (get_field('introduction')) : ?>
                    <div class="amz-intro prose max-w-none mb-12 p-6 bg-gray-50 rounded-lg">
                        <?php the_field('introduction'); ?>
                    </div>
                <?php endif; ?>

                <!-- Tabla comparativa -->
                <?php if ($products) : ?>
                    <div class="amz-comparison-table mb-16">
                        <h2 class="text-2xl font-bold mb-6">Comparativa de productos</h2>
                        <div class="overflow-x-auto">
                            <table class="min-w-full bg-white rounded-lg overflow-hidden shadow">
                                <thead class="bg-gray-100">
                                    <tr>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acción</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-gray-200">
                                    <?php foreach ($products as $index => $product) : 
                                        $product_id = get_the_ID() . '-' . $index;
                                    ?>
                                        <tr class="hover:bg-gray-50 transition-colors">
                                            <td class="px-6 py-4">
                                                <div class="flex items-center">
                                                    <div class="flex-shrink-0 h-20 w-20">
                                                        <?php if (!empty($product['image'])) : ?>
                                                            <img class="h-full w-full object-contain" 
                                                                src="<?php echo esc_url($product['image']['sizes']['thumbnail']); ?>" 
                                                                alt="<?php echo esc_attr($product['name']); ?>"
                                                                loading="lazy">
                                                        <?php endif; ?>
                                                    </div>
                                                    <div class="ml-4">
                                                        <div class="text-sm font-medium text-gray-900"><?php echo esc_html($product['name']); ?></div>
                                                        <?php if (!empty($product['pros'])) : ?>
                                                            <div class="mt-1 text-xs text-green-600">
                                                                <?php echo esc_html($product['pros'][0]['text']); ?>
                                                                <?php if (count($product['pros']) > 1) echo '...'; ?>
                                                            </div>
                                                        <?php endif; ?>
                                                    </div>
                                                </div>
                                            </td>
                                            <td class="px-6 py-4 whitespace-nowrap text-lg font-bold text-gray-900">
                                                <?php echo esc_html($product['price']); ?>
                                            </td>
                                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <a href="#producto-<?php echo $index + 1; ?>" 
                                                   class="text-indigo-600 hover:text-indigo-900 font-medium">
                                                    Ver detalles
                                                </a>
                                                <span class="mx-2">|</span>
                                                <a href="<?php echo esc_url($product['affiliate_link']); ?>" 
                                                   class="text-green-600 hover:text-green-800 font-medium" 
                                                   target="_blank" 
                                                   rel="nofollow noopener"
                                                   onclick="trackOutboundLink('<?php echo esc_js($product['affiliate_link']); ?>'); return false;">
                                                    Comprar en Amazon
                                                </a>
                                            </td>
                                        </tr>
                                    <?php endforeach; ?>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- Productos detallados -->
                    <div class="amz-product-details">
                        <h2 class="text-2xl font-bold mb-6">Análisis detallado</h2>
                        
                        <?php foreach ($products as $index => $product) : 
                            $product_id = get_the_ID() . '-' . $index;
                        ?>
                            <div id="producto-<?php echo $index + 1; ?>" class="amz-product-detail mb-16 pt-8 border-t border-gray-200">
                                <div class="flex flex-col md:flex-row gap-8">
                                    <!-- Imagen del producto -->
                                    <div class="md:w-1/3">
                                        <div class="sticky top-4">
                                            <?php if (!empty($product['image'])) : ?>
                                                <img src="<?php echo esc_url($product['image']['url']); ?>" 
                                                    alt="<?php echo esc_attr($product['name']); ?>" 
                                                    class="w-full h-auto rounded-lg shadow-md"
                                                    loading="lazy">
                                            <?php endif; ?>
                                            
                                            <div class="mt-4 text-center">
                                                <a href="<?php echo esc_url($product['affiliate_link']); ?>" 
                                                   class="inline-block bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-6 rounded-full mb-4 transition duration-300 w-full text-center" 
                                                   target="_blank" 
                                                   rel="nofollow noopener"
                                                   onclick="trackOutboundLink('<?php echo esc_js($product['affiliate_link']); ?>'); return false;">
                                                    Comprar en Amazon
                                                </a>
                                                <div class="text-2xl font-bold text-gray-900 mb-2"><?php echo esc_html($product['price']); ?></div>
                                                <div class="text-sm text-gray-500">Precio con IVA incluido</div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <!-- Detalles del producto -->
                                    <div class="md:w-2/3">
                                        <div class="flex justify-between items-start mb-4">
                                            <h3 class="text-2xl font-bold"><?php echo esc_html($product['name']); ?></h3>
                                            <span class="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                                                #<?php echo $index + 1; ?> en la lista
                                            </span>
                                        </div>
                                        
                                        <!-- Puntuación (si existe) -->
                                        <?php if (!empty($product['rating'])) : ?>
                                            <div class="flex items-center mb-4">
                                                <div class="flex items-center">
                                                    <?php 
                                                    $rating = floatval($product['rating']);
                                                    $full_stars = floor($rating);
                                                    $has_half_star = ($rating - $full_stars) >= 0.5;
                                                    $empty_stars = 5 - $full_stars - ($has_half_star ? 1 : 0);
                                                    
                                                    // Estrellas llenas
                                                    for ($i = 0; $i < $full_stars; $i++) : ?>
                                                        <svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                        </svg>
                                                    <?php endfor; 
                                                    
                                                    // Media estrella
                                                    if ($has_half_star) : ?>
                                                        <svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                                            <defs>
                                                                <linearGradient id="half-star-<?php echo $product_id; ?>" x1="0" x2="100%" y1="0" y2="0">
                                                                    <stop offset="50%" stop-color="currentColor" />
                                                                    <stop offset="50%" stop-color="#d1d5db" />
                                                                </linearGradient>
                                                            </defs>
                                                            <path fill="url(#half-star-<?php echo $product_id; ?>)" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                        </svg>
                                                    <?php endif;
                                                    
                                                    // Estrellas vacías
                                                    for ($i = 0; $i < $empty_stars; $i++) : ?>
                                                        <svg class="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                        </svg>
                                                    <?php endfor; ?>
                                                </div>
                                                <span class="ml-2 text-sm font-medium text-gray-900"><?php echo number_format($rating, 1, ',', '.'); ?></span>
                                                <span class="mx-1 text-gray-500">·</span>
                                                <a href="#reviews" class="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                                                    <?php echo absint($product['review_count'] ?? 0); ?> reseñas
                                                </a>
                                            </div>
                                        <?php endif; ?>
                                        
                                        <!-- Pros y Contras -->
                                        <?php if (!empty($product['pros']) || !empty($product['cons'])) : ?>
                                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                                <?php if (!empty($product['pros'])) : ?>
                                                    <div class="bg-green-50 p-4 rounded-lg border border-green-100">
                                                        <h4 class="font-semibold text-green-800 mb-3 flex items-center">
                                                            <svg class="w-5 h-5 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                                                            </svg>
                                                            Ventajas
                                                        </h4>
                                                        <ul class="space-y-2">
                                                            <?php foreach ($product['pros'] as $pro) : ?>
                                                                <li class="flex items-start">
                                                                    <svg class="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                                                                    </svg>
                                                                    <span class="text-green-700"><?php echo esc_html($pro['text']); ?></span>
                                                                </li>
                                                            <?php endforeach; ?>
                                                        </ul>
                                                    </div>
                                                <?php endif; ?>
                                                
                                                <?php if (!empty($product['cons'])) : ?>
                                                    <div class="bg-red-50 p-4 rounded-lg border border-red-100">
                                                        <h4 class="font-semibold text-red-800 mb-3 flex items-center">
                                                            <svg class="w-5 h-5 mr-2 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                                                            </svg>
                                                            Desventajas
                                                        </h4>
                                                        <ul class="space-y-2">
                                                            <?php foreach ($product['cons'] as $con) : ?>
                                                                <li class="flex items-start">
                                                                    <svg class="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                                                                    </svg>
                                                                    <span class="text-red-700"><?php echo esc_html($con['text']); ?></span>
                                                                </li>
                                                            <?php endforeach; ?>
                                                        </ul>
                                                    </div>
                                                <?php endif; ?>
                                            </div>
                                        <?php endif; ?>

                                        <!-- Descripción detallada -->
                                        <?php if (!empty($product['description'])) : ?>
                                            <div class="prose max-w-none mb-8">
                                                <h4 class="text-lg font-semibold mb-3">Descripción detallada</h4>
                                                <?php echo wp_kses_post($product['description']); ?>
                                            </div>
                                        <?php endif; ?>

                                        <!-- Botón de compra fijo en móviles -->
                                        <div class="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg p-4 z-10 border-t border-gray-200">
                                            <div class="container mx-auto flex justify-between items-center">
                                                <div>
                                                    <div class="font-medium text-gray-900"><?php echo esc_html($product['price']); ?></div>
                                                    <div class="text-sm text-gray-500">Precio con IVA incluido</div>
                                                </div>
                                                <a href="<?php echo esc_url($product['affiliate_link']); ?>" 
                                                   class="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-6 rounded-full transition duration-300 whitespace-nowrap"
                                                   target="_blank" 
                                                   rel="nofollow noopener"
                                                   onclick="trackOutboundLink('<?php echo esc_js($product['affiliate_link']); ?>'); return false;">
                                                    Comprar en Amazon
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    </div>
                <?php endif; ?>

                <!-- Conclusión -->
                <?php if (get_field('conclusion')) : ?>
                    <div class="amz-conclusion prose max-w-none mt-12 p-6 bg-blue-50 rounded-lg border border-blue-100">
                        <h3 class="text-xl font-bold mb-4 text-blue-800">Conclusión</h3>
                        <?php the_field('conclusion'); ?>
                        
                        <div class="mt-6 pt-4 border-t border-blue-200">
                            <h4 class="font-semibold mb-2">¿Te ha resultado útil esta guía?</h4>
                            <div class="flex space-x-4">
                                <button type="button" class="amz-feedback-btn px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-md text-sm font-medium" data-feedback="yes">
                                    <span class="mr-1">👍</span> Sí
                                </button>
                                <button type="button" class="amz-feedback-btn px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-md text-sm font-medium" data-feedback="no">
                                    <span class="mr-1">👎</span> No
                                </button>
                            </div>
                            <div id="feedback-thanks" class="hidden mt-2 text-sm text-green-600">
                                ¡Gracias por tu feedback!
                            </div>
                        </div>
                    </div>
                <?php endif; ?>

                <!-- Productos relacionados -->
                <?php 
                $related_args = array(
                    'post_type'      => 'amz_listing',
                    'posts_per_page' => 3,
                    'post__not_in'   => array(get_the_ID()),
                    'orderby'        => 'rand',
                );
                
                $related_query = new WP_Query($related_args);
                
                if ($related_query->have_posts()) :
                ?>
                    <div class="amz-related-products mt-16">
                        <h3 class="text-2xl font-bold mb-6">También te puede interesar</h3>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <?php while ($related_query->have_posts()) : $related_query->the_post(); ?>
                                <div class="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
                                    <a href="<?php the_permalink(); ?>" class="block">
                                        <?php if (has_post_thumbnail()) : ?>
                                            <div class="h-48 bg-gray-100 overflow-hidden">
                                                <?php the_post_thumbnail('medium', array('class' => 'w-full h-full object-cover')); ?>
                                            </div>
                                        <?php endif; ?>
                                        <div class="p-4">
                                            <h4 class="font-semibold text-lg mb-2 hover:text-blue-600"><?php the_title(); ?></h4>
                                            <?php if (get_field('subtitle', get_the_ID())) : ?>
                                                <p class="text-gray-600 text-sm"><?php echo esc_html(get_field('subtitle', get_the_ID())); ?></p>
                                            <?php endif; ?>
                                        </div>
                                    </a>
                                </div>
                            <?php endwhile; ?>
                        </div>
                    </div>
                <?php 
                endif;
                wp_reset_postdata();
                ?>
            </div>

            <!-- Schema.org JSON-LD -->
            <?php echo amz_generate_product_schema($products, get_the_title(), get_the_excerpt(), get_permalink()); ?>
            
        </article>

    <?php endwhile; ?>
</main>

<script>
// Función para rastrear clics en enlaces de afiliado
function trackOutboundLink(url) {
    // Enviar evento a Google Analytics si está configurado
    if (typeof gtag !== 'undefined') {
        gtag('event', 'click', {
            'event_category': 'outbound',
            'event_label': url,
            'transport_type': 'beacon',
            'event_callback': function() { document.location = url; }
        });
    } else {
        // Redirección estándar si no hay Google Analytics
        document.location = url;
    }
}

// Manejar feedback
jQuery(document).ready(function($) {
    $('.amz-feedback-btn').on('click', function() {
        const feedback = $(this).data('feedback');
        const postId = <?php echo get_the_ID(); ?>;
        
        // Enviar feedback a través de AJAX
        $.ajax({
            url: '<?php echo admin_url('admin-ajax.php'); ?>',
            type: 'POST',
            data: {
                action: 'amz_save_feedback',
                post_id: postId,
                feedback: feedback,
                nonce: '<?php echo wp_create_nonce('amz_feedback_nonce'); ?>'
            },
            success: function(response) {
                if (response.success) {
                    $('#feedback-thanks').removeClass('hidden').addClass('block');
                    $('.amz-feedback-btn').prop('disabled', true);
                }
            }
        });
    });
});
</script>

<?php
get_footer();
?>
