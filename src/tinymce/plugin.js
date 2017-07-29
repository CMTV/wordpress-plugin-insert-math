tinymce.PluginManager.add('math_plugin', (editor) => {
    let dialog =                $('#math_plugin-insert-math-dialog');
    let preview_math_mode =     '\\displaystyle';
    let current_node;
    let expression_input =      dialog.find('#math_plugin-expression');
    let display_mode_buttons =  dialog.find('.math_plugin-display-button');
    let display_mode_block =    dialog.find('.math_plugin-display-value-block');
    let display_mode_inline =   dialog.find('.math_plugin-display-value-inline');
    let insert_button =         dialog.find('.math_plugin-insert-button');

    function resize_dialog() {
        if($(window).width() <= dialog.width()) {
            dialog.dialog("option", "width", $(window).width());
        }
    }

    function center_dialog() {
        dialog.dialog("option", "position", {my: "center", at: "center", of: window});
    }

    function trigger_preview() {
        expression_input.trigger('input');
    }

    function insert_math() {
        dialog.addClass('_to-insert');
        dialog.dialog('close');
    }

    function get_display_mode() {
        if(display_mode_block.hasClass('math_plugin-checked')) {
            return 'block';
        } else {
            return 'inline';
        }
    }

    function clear_dialog() {
        dialog.removeClass('_to-insert');

        display_mode_buttons.removeClass('math_plugin-checked');
        display_mode_block.addClass('math_plugin-checked');

        expression_input.val('');
    }

    dialog.dialog({
        autoOpen: false,
        modal: true,
        dialogClass: 'math_plugin-insert-math-dialog',
        draggable: false,
        width: 'auto',
        height: 'auto',
        open: () => {
            resize_dialog();

            /* Closing on overlay click + coloring int */
            $('.ui-widget-overlay').bind('click', function() {
                dialog.dialog('close');
            }).css({
                background: '#000',
                opacity: '0.7'
            });


            expression_input.focus();

            center_dialog();
        },
        close: () => {
            let wrapper_start, wrapper_end;

            if(get_display_mode() === 'block') {
                wrapper_start = '<p class="math">\\[';
                wrapper_end = '\\]</p>';
            } else {
                wrapper_start = '<span class="math">\\(';
                wrapper_end = '\\)</span>';

                if(!$(current_node).hasClass('math')) {
                    /* Adding zero-spaces allowing caret to move out of inserted span */
                    wrapper_start = '&#8203;' + wrapper_start;
                    wrapper_end += '&#8203;';
                }
            }

            let value = expression_input.val().trim();

            if(value) {
                /* Insert closing or just closing */
                if(dialog.hasClass('_to-insert')) {
                    if($(current_node).hasClass('math')) {
                        current_node.remove();
                    }

                    editor.insertContent(`${wrapper_start} ${value} ${wrapper_end}`);
                }
            }

            clear_dialog();
            trigger_preview();
        }
    });

    $(window).resize(() => {
        resize_dialog();
        center_dialog();
    });

    /* Switching display mode */
    display_mode_buttons.click(() => {
        if(get_display_mode() === 'block') {
            display_mode_buttons.removeClass('math_plugin-checked');
            preview_math_mode = '\\textstyle';
            display_mode_inline.addClass('math_plugin-checked');
        } else {
            display_mode_buttons.removeClass('math_plugin-checked');
            preview_math_mode = '\\displaystyle';
            display_mode_block.addClass('math_plugin-checked');
        }

        trigger_preview();
    });

    /* Typing math */
    let preview_delay_timeout;
    expression_input.on('input', () => {
        clearTimeout(preview_delay_timeout);

        let value = expression_input.val().trim();

        if(value) {
            preview_delay_timeout = setTimeout(() => {
                dialog.find('.math_plugin-empty').hide();

                /* Rendering math and inserting it in preview area */
                MathJax.Hub.queue.Push(['Text', MathJax.Hub.getAllJax('math_plugin-preview')[0],`${preview_math_mode}{${value}}`], () => {
                    dialog.find('.math_plugin-preview-math').show();
                    center_dialog();
                });
            }, 300);
        } else {
            expression_input.val('');
            dialog.find('.math_plugin-empty').show();
            dialog.find('.math_plugin-preview-math').hide();
        }
    });

    /* Clicking on "Insert" */
    insert_button.click(() => {
        insert_math();
    });

    /* "Enter" will close dialog and insert too */
    dialog.keypress((e) => {
        if(e.keyCode === $.ui.keyCode.ENTER) {
            insert_math();
        }
    });

    /* Adding "Insert math" button */
    editor.addButton('math_plugin-insert-math-button', {
        image: MATH_PLUGIN_CONSTANTS_719342.BUTTON_ICON_URL,
        tooltip: MATH_PLUGIN_CONSTANTS_719342.BUTTON_TOOLTIP,
        stateSelector : '.math',
        onclick: () => {
            current_node = editor.selection.getNode();

            if($(current_node).hasClass('math')) {
                /* Setting up dialog */
                if(current_node.tagName !== 'P') {
                    display_mode_buttons.removeClass('math_plugin-checked');
                    display_mode_inline.addClass('math_plugin-checked');
                    preview_math_mode = '\\textstyle';
                }

                expression_input.val(
                    $(current_node).html().replace('\\[ ', '').replace(' \\]', '').replace('\\( ', '').replace(' \\)', '')
                );

                trigger_preview();
            }

            dialog.dialog('open');
        }
    });

});