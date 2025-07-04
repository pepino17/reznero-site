<?php
/**
 * Clase para manejar la importación y exportación de datos
 */
class AMZ_Import_Export {

    /**
     * Inicializar hooks
     */
    public function init() {
        add_action('admin_menu', array($this, 'add_import_export_page'));
        add_action('admin_init', array($this, 'handle_import'));
        add_action('admin_init', array($this, 'handle_export'));
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_scripts'));
    }

    /**
     * Añadir página de importación/exportación
     */
    public function add_import_export_page() {
        add_submenu_page(
            'edit.php?post_type=amz_listing',
            __('Importar/Exportar Productos', 'amz-top-products'),
            __('Importar/Exportar', 'amz-top-products'),
            'manage_options',
            'amz-import-export',
            array($this, 'render_import_export_page')
        );
    }

    /**
     * Renderizar página de importación/exportación
     */
    public function render_import_export_page() {
        ?>
        <div class="wrap">
            <h1><?php _e('Importar/Exportar Productos', 'amz-top-products'); ?></h1>
            
            <div class="card">
                <h2><?php _e('Importar Productos', 'amz-top-products'); ?></h2>
                <p><?php _e('Importa productos desde un archivo CSV o JSON.', 'amz-top-products'); ?></p>
                
                <form method="post" enctype="multipart/form-data" action="">
                    <?php wp_nonce_field('amz_import_action', 'amz_import_nonce'); ?>
                    <table class="form-table">
                        <tr>
                            <th scope="row">
                                <label for="import_file"><?php _e('Archivo a importar', 'amz-top-products'); ?></label>
                            </th>
                            <td>
                                <input type="file" name="import_file" id="import_file" accept=".csv,.json" required>
                                <p class="description">
                                    <?php _e('Formatos aceptados: CSV, JSON', 'amz-top-products'); ?>
                                </p>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">
                                <?php _e('Opciones de importación', 'amz-top-products'); ?>
                            </th>
                            <td>
                                <label>
                                    <input type="checkbox" name="update_existing" value="1" checked>
                                    <?php _e('Actualizar productos existentes', 'amz-top-products'); ?>
                                </label>
                                <p class="description">
                                    <?php _e('Si está marcado, los productos con el mismo ID serán actualizados.', 'amz-top-products'); ?>
                                </p>
                            </td>
                        </tr>
                    </table>
                    
                    <?php submit_button(__('Importar Productos', 'amz-top-products'), 'primary', 'submit_import'); ?>
                </form>
            </div>
            
            <div class="card" style="margin-top: 20px;">
                <h2><?php _e('Exportar Productos', 'amz-top-products'); ?></h2>
                <p><?php _e('Exporta los productos a un archivo CSV o JSON.', 'amz-top-products'); ?></p>
                
                <form method="post" action="">
                    <?php wp_nonce_field('amz_export_action', 'amz_export_nonce'); ?>
                    <table class="form-table">
                        <tr>
                            <th scope="row">
                                <label for="export_format"><?php _e('Formato de exportación', 'amz-top-products'); ?></label>
                            </th>
                            <td>
                                <select name="export_format" id="export_format">
                                    <option value="csv">CSV</option>
                                    <option value="json">JSON</option>
                                </select>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">
                                <label for="export_status"><?php _e('Estado', 'amz-top-products'); ?></label>
                            </th>
                            <td>
                                <select name="export_status" id="export_status">
                                    <option value="all"><?php _e('Todos', 'amz-top-products'); ?></option>
                                    <option value="publish"><?php _e('Publicados', 'amz-top-products'); ?></option>
                                    <option value="draft"><?php _e('Borradores', 'amz-top-products'); ?></option>
                                    <option value="pending"><?php _e('Pendientes', 'amz-top-products'); ?></option>
                                </select>
                            </td>
                        </tr>
                    </table>
                    
                    <?php submit_button(__('Exportar Productos', 'amz-top-products'), 'secondary', 'submit_export'); ?>
                </form>
            </div>
        </div>
        <?php
    }

    /**
     * Manejar la importación de productos
     */
    public function handle_import() {
        if (!isset($_POST['submit_import']) || !isset($_FILES['import_file'])) {
            return;
        }

        // Verificar nonce
        if (!isset($_POST['amz_import_nonce']) || !wp_verify_nonce($_POST['amz_import_nonce'], 'amz_import_action')) {
            wp_die(__('Acción no permitida.', 'amz-top-products'));
        }

        // Verificar permisos
        if (!current_user_can('import')) {
            wp_die(__('No tienes permisos suficientes para importar productos.', 'amz-top-products'));
        }

        $file = $_FILES['import_file'];
        $file_type = wp_check_filetype($file['name']);
        $update_existing = isset($_POST['update_existing']) && $_POST['update_existing'];

        try {
            if ($file_type['ext'] === 'csv') {
                $this->import_from_csv($file['tmp_name'], $update_existing);
            } elseif ($file_type['ext'] === 'json') {
                $this->import_from_json($file['tmp_name'], $update_existing);
            } else {
                throw new Exception(__('Formato de archivo no soportado.', 'amz-top-products'));
            }

            // Redirigir con mensaje de éxito
            wp_redirect(add_query_arg('import', 'success', admin_url('edit.php?post_type=amz_listing&page=amz-import-export')));
            exit;
        } catch (Exception $e) {
            wp_die($e->getMessage());
        }
    }

    /**
     * Importar desde archivo CSV
     */
    private function import_from_csv($file_path, $update_existing = false) {
        if (!file_exists($file_path)) {
            throw new Exception(__('El archivo no existe.', 'amz-top-products'));
        }

        $handle = fopen($file_path, 'r');
        if ($handle === false) {
            throw new Exception(__('No se pudo abrir el archivo CSV.', 'amz-top-products'));
        }

        // Leer la primera línea como encabezados
        $headers = fgetcsv($handle);
        if ($headers === false) {
            fclose($handle);
            throw new Exception(__('El archivo CSV está vacío o es inválido.', 'amz-top-products'));
        }

        // Mapear encabezados a índices
        $header_map = array();
        foreach ($headers as $index => $header) {
            $header_map[strtolower(trim($header))] = $index;
        }

        // Verificar encabezados obligatorios
        $required_headers = array('title', 'subtitle');
        foreach ($required_headers as $required) {
            if (!isset($header_map[$required])) {
                fclose($handle);
                throw new Exception(sprintf(__('El archivo CSV debe contener la columna: %s', 'amz-top-products'), $required));
            }
        }

        $imported = 0;
        $updated = 0;
        $row = 1; // Empezamos desde 1 porque la fila 0 son los encabezados

        while (($data = fgetcsv($handle)) !== false) {
            $row++;
            
            // Saltar filas vacías
            if (count($data) === 1 && empty($data[0])) {
                continue;
            }

            // Preparar datos del listado
            $listing_data = array(
                'post_title'   => $this->get_csv_value($data, $header_map, 'title'),
                'post_content' => $this->get_csv_value($data, $header_map, 'content', ''),
                'post_status'  => 'publish',
                'post_type'    => 'amz_listing',
            );

            // Verificar si el listado ya existe
            $existing_id = 0;
            if ($update_existing) {
                $existing = get_page_by_title($listing_data['post_title'], OBJECT, 'amz_listing');
                if ($existing) {
                    $listing_data['ID'] = $existing->ID;
                    $existing_id = $existing->ID;
                }
            }

            // Insertar o actualizar el listado
            $post_id = wp_insert_post($listing_data, true);
            
            if (is_wp_error($post_id)) {
                throw new Exception(sprintf(__('Error en la fila %d: %s', 'amz-top-products'), $row, $post_id->get_error_message()));
            }

            // Actualizar campos ACF
            $this->update_acf_fields($post_id, $data, $header_map);

            if ($existing_id) {
                $updated++;
            } else {
                $imported++;
            }
        }

        fclose($handle);

        // Mostrar resultados
        add_action('admin_notices', function() use ($imported, $updated) {
            ?>
            <div class="notice notice-success is-dismissible">
                <p><?php 
                    printf(
                        _n(
                            'Importación completada: %d producto importado, %d actualizado.',
                            'Importación completada: %d productos importados, %d actualizados.',
                            $imported,
                            'amz-top-products'
                        ),
                        $imported,
                        $updated
                    );
                ?></p>
            </div>
            <?php
        });
    }

    /**
     * Importar desde archivo JSON
     */
    private function import_from_json($file_path, $update_existing = false) {
        if (!file_exists($file_path)) {
            throw new Exception(__('El archivo no existe.', 'amz-top-products'));
        }

        $json_content = file_get_contents($file_path);
        if ($json_content === false) {
            throw new Exception(__('No se pudo leer el archivo JSON.', 'amz-top-products'));
        }

        $data = json_decode($json_content, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception(__('El archivo JSON no es válido: ', 'amz-top-products') . json_last_error_msg());
        }

        if (!is_array($data)) {
            throw new Exception(__('El archivo JSON debe contener un array de productos.', 'amz-top-products'));
        }

        $imported = 0;
        $updated = 0;

        foreach ($data as $item) {
            if (!isset($item['title'])) {
                continue;
            }

            // Preparar datos del listado
            $listing_data = array(
                'post_title'   => $item['title'],
                'post_content' => $item['content'] ?? '',
                'post_status'  => 'publish',
                'post_type'    => 'amz_listing',
            );

            // Verificar si el listado ya existe
            $existing_id = 0;
            if ($update_existing) {
                $existing = get_page_by_title($listing_data['post_title'], OBJECT, 'amz_listing');
                if ($existing) {
                    $listing_data['ID'] = $existing->ID;
                    $existing_id = $existing->ID;
                }
            }

            // Insertar o actualizar el listado
            $post_id = wp_insert_post($listing_data, true);
            
            if (is_wp_error($post_id)) {
                throw new Exception(__('Error al importar el producto: ', 'amz-top-products') . $post_id->get_error_message());
            }

            // Actualizar campos ACF
            $this->update_acf_fields_from_json($post_id, $item);

            if ($existing_id) {
                $updated++;
            } else {
                $imported++;
            }
        }

        // Mostrar resultados
        add_action('admin_notices', function() use ($imported, $updated) {
            ?>
            <div class="notice notice-success is-dismissible">
                <p><?php 
                    printf(
                        _n(
                            'Importación completada: %d producto importado, %d actualizado.',
                            'Importación completada: %d productos importados, %d actualizados.',
                            $imported,
                            'amz-top-products'
                        ),
                        $imported,
                        $updated
                    );
                ?></p>
            </div>
            <?php
        });
    }

    /**
     * Actualizar campos ACF desde datos CSV
     */
    private function update_acf_fields($post_id, $data, $header_map) {
        // Mapeo de campos ACF
        $acf_fields = array(
            'subtitle'       => 'field_subtitle',
            'introduction'   => 'field_introduction',
            'conclusion'     => 'field_conclusion',
        );

        // Actualizar campos simples
        foreach ($acf_fields as $field_key => $acf_key) {
            if (isset($header_map[$field_key])) {
                update_field($acf_key, $data[$header_map[$field_key]], $post_id);
            }
        }

        // Procesar productos (repeater)
        if (isset($header_map['products']) && !empty($data[$header_map['products']])) {
            $products = json_decode($data[$header_map['products']], true);
            if (is_array($products)) {
                update_field('field_products', $products, $post_id);
            }
        }
    }

    /**
     * Actualizar campos ACF desde datos JSON
     */
    private function update_acf_fields_from_json($post_id, $data) {
        // Mapeo de campos ACF
        $acf_fields = array(
            'subtitle'       => 'field_subtitle',
            'introduction'   => 'field_introduction',
            'products'       => 'field_products',
            'conclusion'     => 'field_conclusion',
        );

        // Actualizar campos
        foreach ($acf_fields as $field_key => $acf_key) {
            if (isset($data[$field_key])) {
                update_field($acf_key, $data[$field_key], $post_id);
            }
        }
    }

    /**
     * Manejar la exportación de productos
     */
    public function handle_export() {
        if (!isset($_POST['submit_export'])) {
            return;
        }

        // Verificar nonce
        if (!isset($_POST['amz_export_nonce']) || !wp_verify_nonce($_POST['amz_export_nonce'], 'amz_export_action')) {
            wp_die(__('Acción no permitida.', 'amz-top-products'));
        }

        // Verificar permisos
        if (!current_user_can('export')) {
            wp_die(__('No tienes permisos suficientes para exportar productos.', 'amz-top-products'));
        }

        $format = isset($_POST['export_format']) ? sanitize_text_field($_POST['export_format']) : 'csv';
        $status = isset($_POST['export_status']) ? sanitize_text_field($_POST['export_status']) : 'all';

        // Configurar argumentos de la consulta
        $args = array(
            'post_type'      => 'amz_listing',
            'posts_per_page' => -1,
            'post_status'    => ($status === 'all') ? 'any' : $status,
        );

        $query = new WP_Query($args);
        $export_data = array();

        if ($query->have_posts()) {
            while ($query->have_posts()) {
                $query->the_post();
                $post_id = get_the_ID();

                $export_item = array(
                    'ID'           => $post_id,
                    'title'        => get_the_title(),
                    'content'      => get_the_content(),
                    'status'       => get_post_status(),
                    'subtitle'     => get_field('subtitle', $post_id),
                    'introduction' => get_field('introduction', $post_id),
                    'products'     => get_field('products', $post_id),
                    'conclusion'   => get_field('conclusion', $post_id),
                );

                $export_data[] = $export_item;
            }
            wp_reset_postdata();
        }

        // Generar archivo de exportación
        if ($format === 'csv') {
            $this->export_to_csv($export_data);
        } else {
            $this->export_to_json($export_data);
        }
    }

    /**
     * Exportar a CSV
     */
    private function export_to_csv($data) {
        if (empty($data)) {
            return;
        }

        $filename = 'amz-products-export-' . date('Y-m-d') . '.csv';
        
        // Establecer cabeceras para descarga
        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename=' . $filename);
        
        $output = fopen('php://output', 'w');
        
        // Escribir encabezados
        $headers = array_keys($data[0]);
        fputcsv($output, $headers);
        
        // Escribir datos
        foreach ($data as $row) {
            // Convertir arrays a JSON para campos complejos
            foreach ($row as $key => $value) {
                if (is_array($value)) {
                    $row[$key] = json_encode($value);
                }
            }
            fputcsv($output, $row);
        }
        
        fclose($output);
        exit;
    }

    /**
     * Exportar a JSON
     */
    private function export_to_json($data) {
        $filename = 'amz-products-export-' . date('Y-m-d') . '.json';
        
        // Establecer cabeceras para descarga
        header('Content-Type: application/json; charset=utf-8');
        header('Content-Disposition: attachment; filename=' . $filename);
        
        echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        exit;
    }

    /**
     * Obtener valor de CSV con manejo de errores
     */
    private function get_csv_value($data, $header_map, $key, $default = '') {
        return isset($header_map[$key]) && isset($data[$header_map[$key]]) 
            ? $data[$header_map[$key]] 
            : $default;
    }

    /**
     * Cargar scripts y estilos del administrador
     */
    public function enqueue_admin_scripts($hook) {
        if (strpos($hook, 'amz-import-export') === false) {
            return;
        }

        wp_enqueue_style(
            'amz-import-export-css',
            plugins_url('assets/css/admin-import-export.css', dirname(__FILE__)),
            array(),
            '1.0.0'
        );

        wp_enqueue_script(
            'amz-import-export-js',
            plugins_url('assets/js/admin-import-export.js', dirname(__FILE__)),
            array('jquery'),
            '1.0.0',
            true
        );

        wp_localize_script('amz-import-export-js', 'amzImportExport', array(
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce'    => wp_create_nonce('amz_import_export_nonce'),
            'messages' => array(
                'confirm_import' => __('¿Estás seguro de que deseas importar estos productos?', 'amz-top-products'),
                'importing'      => __('Importando productos, por favor espera...', 'amz-top-products'),
                'error'          => __('Ocurrió un error durante la importación.', 'amz-top-products'),
            ),
        ));
    }
}
