<?php
/**
 * Clase para manejar los campos ACF del plugin
 */
class AMZ_ACF_Fields {

    /**
     * Inicializar campos ACF
     */
    public function init() {
        if (function_exists('acf_add_local_field_group')) {
            $this->register_product_fields();
            $this->add_options_pages();
        } else {
            add_action('admin_notices', array($this, 'acf_notice'));
        }
    }

    /**
     * Mostrar aviso si ACF no está activo
     */
    public function acf_notice() {
        ?>
        <div class="notice notice-error">
            <p><?php _e('El plugin AMZ Top Products requiere Advanced Custom Fields PRO para funcionar correctamente.', 'amz-top-products'); ?></p>
        </div>
        <?php
    }

    /**
     * Registrar campos de producto
     */
    private function register_product_fields() {
        acf_add_local_field_group(array(
            'key' => 'group_amz_product_details',
            'title' => 'Detalles del Producto',
            'fields' => array(
                $this->get_subtitle_field(),
                $this->get_introduction_field(),
                $this->get_products_repeater_field(),
                $this->get_conclusion_field(),
                $this->get_seo_fields(),
            ),
            'location' => array(
                array(
                    array(
                        'param' => 'post_type',
                        'operator' => '==',
                        'value' => 'amz_listing',
                    ),
                ),
            ),
            'menu_order' => 0,
            'position' => 'normal',
            'style' => 'default',
            'label_placement' => 'top',
            'instruction_placement' => 'label',
            'hide_on_screen' => '',
            'active' => true,
            'description' => '',
        ));
    }

    /**
     * Obtener campo de subtítulo
     */
    private function get_subtitle_field() {
        return array(
            'key' => 'field_subtitle',
            'label' => 'Subtítulo',
            'name' => 'subtitle',
            'type' => 'text',
            'instructions' => 'Ejemplo: "Los 7 mejores gadgets de cocina en 2023"',
            'required' => 1,
            'wrapper' => array(
                'width' => '100%',
                'class' => '',
                'id' => '',
            ),
        );
    }

    /**
     * Obtener campo de introducción
     */
    private function get_introduction_field() {
        return array(
            'key' => 'field_introduction',
            'label' => 'Introducción',
            'name' => 'introduction',
            'type' => 'wysiwyg',
            'instructions' => 'Descripción introductoria del listado',
            'required' => 1,
            'tabs' => 'all',
            'toolbar' => 'full',
            'media_upload' => 1,
            'delay' => 0,
        );
    }

    /**
     * Obtener campo de productos (repeater)
     */
    private function get_products_repeater_field() {
        return array(
            'key' => 'field_products',
            'label' => 'Productos',
            'name' => 'products',
            'type' => 'repeater',
            'instructions' => 'Añade los productos para comparar',
            'required' => 1,
            'collapsed' => 'field_product_name',
            'min' => 1,
            'max' => 0,
            'layout' => 'block',
            'button_label' => 'Añadir Producto',
            'sub_fields' => array(
                $this->get_product_image_field(),
                $this->get_product_name_field(),
                $this->get_product_price_field(),
                $this->get_affiliate_link_field(),
                $this->get_pros_field(),
                $this->get_cons_field(),
                $this->get_product_description_field(),
            ),
        );
    }

    /**
     * Obtener campo de imagen del producto
     */
    private function get_product_image_field() {
        return array(
            'key' => 'field_product_image',
            'label' => 'Imagen del Producto',
            'name' => 'image',
            'type' => 'image',
            'instructions' => 'Sube una imagen del producto o pega la URL de la imagen',
            'required' => 1,
            'return_format' => 'array',
            'preview_size' => 'medium',
            'library' => 'all',
            'mime_types' => 'jpg,jpeg,png,webp',
            'wrapper' => array(
                'width' => '30%',
            ),
        );
    }

    /**
     * Obtener campo de nombre del producto
     */
    private function get_product_name_field() {
        return array(
            'key' => 'field_product_name',
            'label' => 'Nombre del Producto',
            'name' => 'name',
            'type' => 'text',
            'required' => 1,
            'wrapper' => array(
                'width' => '70%',
            ),
        );
    }

    /**
     * Obtener campo de precio del producto
     */
    private function get_product_price_field() {
        return array(
            'key' => 'field_product_price',
            'label' => 'Precio',
            'name' => 'price',
            'type' => 'text',
            'instructions' => 'Ejemplo: 49,99€',
            'required' => 1,
            'wrapper' => array(
                'width' => '33%',
            ),
        );
    }

    /**
     * Obtener campo de enlace de afiliado
     */
    private function get_affiliate_link_field() {
        return array(
            'key' => 'field_affiliate_link',
            'label' => 'Enlace de Afiliado',
            'name' => 'affiliate_link',
            'type' => 'url',
            'instructions' => 'Pega el enlace de afiliado de Amazon',
            'required' => 1,
            'wrapper' => array(
                'width' => '67%',
            ),
        );
    }

    /**
     * Obtener campo de ventajas
     */
    private function get_pros_field() {
        return array(
            'key' => 'field_pros',
            'label' => 'Ventajas',
            'name' => 'pros',
            'type' => 'repeater',
            'instructions' => 'Añade las ventajas de este producto',
            'layout' => 'table',
            'button_label' => 'Añadir ventaja',
            'sub_fields' => array(
                array(
                    'key' => 'field_pro_text',
                    'label' => 'Ventaja',
                    'name' => 'text',
                    'type' => 'text',
                    'required' => 1,
                ),
            ),
            'wrapper' => array(
                'width' => '50%',
            ),
        );
    }

    /**
     * Obtener campo de desventajas
     */
    private function get_cons_field() {
        return array(
            'key' => 'field_cons',
            'label' => 'Desventajas',
            'name' => 'cons',
            'type' => 'repeater',
            'instructions' => 'Añade las desventajas de este producto',
            'layout' => 'table',
            'button_label' => 'Añadir desventaja',
            'sub_fields' => array(
                array(
                    'key' => 'field_con_text',
                    'label' => 'Desventaja',
                    'name' => 'text',
                    'type' => 'text',
                    'required' => 1,
                ),
            ),
            'wrapper' => array(
                'width' => '50%',
            ),
        );
    }

    /**
     * Obtener campo de descripción del producto
     */
    private function get_product_description_field() {
        return array(
            'key' => 'field_product_description',
            'label' => 'Descripción detallada',
            'name' => 'description',
            'type' => 'wysiwyg',
            'instructions' => 'Descripción detallada del producto',
            'tabs' => 'all',
            'toolbar' => 'full',
            'media_upload' => 1,
            'delay' => 0,
        );
    }

    /**
     * Obtener campo de conclusión
     */
    private function get_conclusion_field() {
        return array(
            'key' => 'field_conclusion',
            'label' => 'Conclusión',
            'name' => 'conclusion',
            'type' => 'wysiwyg',
            'instructions' => 'Resumen final y llamada a la acción',
            'tabs' => 'all',
            'toolbar' => 'full',
            'media_upload' => 1,
            'delay' => 0,
        );
    }

    /**
     * Obtener campos SEO
     */
    private function get_seo_fields() {
        return array(
            'key' => 'field_seo_tab',
            'label' => 'SEO',
            'name' => '',
            'type' => 'tab',
            'instructions' => '',
            'required' => 0,
            'conditional_logic' => 0,
            'wrapper' => array(
                'width' => '',
                'class' => '',
                'id' => '',
            ),
            'placement' => 'top',
            'endpoint' => 0,
        );
    }

    /**
     * Añadir páginas de opciones
     */
    private function add_options_pages() {
        if (function_exists('acf_add_options_page')) {
            // Página principal de opciones
            acf_add_options_page(array(
                'page_title' => 'Configuración AMZ Top Products',
                'menu_title' => 'Configuración AMZ',
                'menu_slug' => 'amz-top-products-settings',
                'capability' => 'manage_options',
                'redirect' => true,
                'position' => 30,
                'icon_url' => 'dashicons-amazon',
            ));

            // Subpáginas
            acf_add_options_sub_page(array(
                'page_title' => 'Configuración General',
                'menu_title' => 'General',
                'parent_slug' => 'amz-top-products-settings',
            ));

            acf_add_options_sub_page(array(
                'page_title' => 'Configuración de Afiliados',
                'menu_title' => 'Afiliados',
                'parent_slug' => 'amz-top-products-settings',
            ));
        }
    }
}
