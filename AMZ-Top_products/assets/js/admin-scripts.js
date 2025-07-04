/**
 * AMZ Top Products - Admin Scripts
 */
(function($) {
    'use strict';

    // Document ready
    $(document).ready(function() {
        // Tabs functionality
        $('.amz-tab-button').on('click', function(e) {
            e.preventDefault();
            
            const $this = $(this);
            const tabId = $this.data('tab');
            
            // Update active tab
            $('.amz-tab-button').removeClass('active');
            $this.addClass('active');
            
            // Show corresponding content
            $('.amz-tab-content').removeClass('active');
            $(`#${tabId}`).addClass('active');
        });

        // Handle file upload for import
        $('#amz-import-form').on('submit', function(e) {
            e.preventDefault();
            
            const $form = $(this);
            const $submitButton = $form.find('button[type="submit"]');
            const originalButtonText = $submitButton.text();
            const $spinner = $('<span class="amz-spinner"></span>');
            
            // Show loading state
            $submitButton.prop('disabled', true).prepend($spinner);
            
            // Create form data
            const formData = new FormData($form[0]);
            
            // Send AJAX request
            $.ajax({
                url: amzAdminData.ajax_url,
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                dataType: 'json',
                success: function(response) {
                    if (response.success) {
                        // Show success message
                        showNotice('success', response.data.message || 'Import completed successfully!');
                        
                        // Reload the page after a short delay to show updated data
                        setTimeout(function() {
                            window.location.reload();
                        }, 1500);
                    } else {
                        // Show error message
                        showNotice('error', response.data.message || 'An error occurred during import.');
                    }
                },
                error: function(xhr, status, error) {
                    console.error('Import error:', error);
                    showNotice('error', 'An error occurred during import. Please try again.');
                },
                complete: function() {
                    // Reset button state
                    $submitButton.prop('disabled', false).find('.amz-spinner').remove();
                }
            });
        });

        // Handle export form submission
        $('#amz-export-form').on('submit', function(e) {
            e.preventDefault();
            
            const $form = $(this);
            const $submitButton = $form.find('button[type="submit"]');
            const originalButtonText = $submitButton.text();
            
            // Show loading state
            $submitButton.prop('disabled', true).html(`<span class="amz-spinner"></span> ${originalButtonText}`);
            
            // Get form data
            const formData = $form.serialize();
            
            // Create a hidden iframe for the download
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            document.body.appendChild(iframe);
            
            // Set the form target to the iframe
            $form.attr('target', 'export-iframe');
            
            // Create a name for the iframe
            const timestamp = new Date().getTime();
            const iframeName = 'export-iframe-' + timestamp;
            iframe.name = iframeName;
            $form.attr('target', iframeName);
            
            // Submit the form
            $form[0].submit();
            
            // Reset the form target
            setTimeout(function() {
                $form.removeAttr('target');
                $submitButton.prop('disabled', false).text(originalButtonText);
                document.body.removeChild(iframe);
            }, 1000);
        });

        // Handle bulk actions
        $('.amz-bulk-actions').on('click', '.amz-bulk-action', function(e) {
            e.preventDefault();
            
            const $button = $(this);
            const action = $button.data('action');
            const selectedItems = [];
            
            // Get selected items
            $('.amz-item-checkbox:checked').each(function() {
                selectedItems.push($(this).val());
            });
            
            if (selectedItems.length === 0) {
                showNotice('warning', 'Please select at least one item.');
                return;
            }
            
            if (!confirm(amzAdminData.i18n.confirm_delete)) {
                return;
            }
            
            // Show loading state
            const originalButtonText = $button.html();
            $button.prop('disabled', true).html(`<span class="amz-spinner"></span> ${originalButtonText}`);
            
            // Send AJAX request
            $.ajax({
                url: amzAdminData.ajax_url,
                type: 'POST',
                data: {
                    action: 'amz_handle_bulk_action',
                    nonce: amzAdminData.nonce,
                    bulk_action: action,
                    items: selectedItems
                },
                success: function(response) {
                    if (response.success) {
                        showNotice('success', response.data.message || 'Bulk action completed successfully!');
                        // Reload the page to reflect changes
                        setTimeout(function() {
                            window.location.reload();
                        }, 1500);
                    } else {
                        showNotice('error', response.data.message || 'An error occurred during the bulk action.');
                    }
                },
                error: function() {
                    showNotice('error', amzAdminData.i18n.error_occurred);
                },
                complete: function() {
                    $button.prop('disabled', false).html(originalButtonText);
                }
            });
        });

        // Toggle all checkboxes
        $('.amz-toggle-all').on('change', function() {
            const isChecked = $(this).prop('checked');
            $('.amz-item-checkbox').prop('checked', isChecked);
        });

        // Show/hide advanced options
        $('.amz-toggle-advanced').on('click', function(e) {
            e.preventDefault();
            $(this).closest('.amz-card').find('.amz-advanced-options').slideToggle();
        });

        // ACF Repeater field enhancements
        $(document).on('acf/setup_fields', function(e, el) {
            // Make repeater fields sortable
            $('.acf-repeater:not(.ui-sortable)').each(function() {
                const $repeater = $(this);
                
                $repeater.sortable({
                    handle: '.acf-row-handle',
                    items: '> .acf-row',
                    update: function() {
                        // Update row numbers after sorting
                        $repeater.find('.acf-row').each(function(index) {
                            $(this).find('> .acf-row-handle .acf-row-number').text(index + 1);
                        });
                    }
                });
            });
        });
    });

    /**
     * Show a notice message
     */
    function showNotice(type, message) {
        // Remove any existing notices
        $('.amz-notice').remove();
        
        // Create notice element
        const $notice = $(`
            <div class="notice notice-${type} amz-notice amz-notice-${type} is-dismissible">
                <p>${message}</p>
                <button type="button" class="notice-dismiss">
                    <span class="screen-reader-text">Dismiss this notice.</span>
                </button>
            </div>
        `);
        
        // Add to page
        $notice.prependTo('.wrap h1').first().after($notice);
        
        // Auto-dismiss after 5 seconds
        setTimeout(function() {
            $notice.fadeOut(300, function() {
                $(this).remove();
            });
        }, 5000);
        
        // Handle dismiss button
        $notice.on('click', '.notice-dismiss', function() {
            $notice.fadeOut(300, function() {
                $(this).remove();
            });
        });
    }

    /**
     * Format bytes to human-readable format
     */
    function formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    // Initialize any tooltips
    if (typeof tippy === 'function') {
        tippy('[data-tippy-content]', {
            allowHTML: true,
            arrow: true,
            theme: 'light',
            animation: 'shift-away',
            delay: [100, 0],
            duration: [200, 150]
        });
    }

})(jQuery);
