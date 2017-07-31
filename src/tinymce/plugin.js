tinymce.PluginManager.add('math_plugin', (editor) => {
    let dialog =                $('#math_plugin-insert-math-dialog');
    let preview_math_mode =     '\\displaystyle';
    let current_node;
    let expression_input =      dialog.find('#math_plugin-expression');

    let display_mode_buttons =  dialog.find('.math_plugin-display-button');
    let display_mode_block =    dialog.find('.math_plugin-display-value-block');
    let display_mode_inline =   dialog.find('.math_plugin-display-value-inline');

    let formula_color_buttons = dialog.find('.math_plugin-color-button');
    let formula_color_default = dialog.find('.math_plugin-color-default');
    let formula_color_custom =  dialog.find('.math_plugin-color-custom');

    let formula_id_input =      dialog.find('#math_plugin-formula-id');
    let formula_classes_input = dialog.find('#math_plugin-formula-classes');

    let insert_button =         dialog.find('.math_plugin-insert-button');
    let additional_settings =   dialog.find('.math_plugin-additional-settings-container');

    function resize_dialog() {
        if($(window).width() <= dialog.width()) {
            dialog.dialog("option", "width", $(window).width());
        }
    }

    function center_dialog() {
        dialog.dialog("option", "position", {my: "center", at: "center", of: window});
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

    function get_formula_color() {
        if(formula_color_default.hasClass('math_plugin-checked')) {
            return 'default';
        } else {
            return formula_color_custom.text();
        }
    }

    function rgb_to_hex(rgb) {
        return '#' + rgb.substr(4, rgb.indexOf(')') - 4).split(',').map((color) => parseInt(color).toString(16)).join('');
    }

    function clear_dialog() {
        dialog.removeClass('_to-insert');

        preview_math_mode = '\\displaystyle';

        display_mode_buttons.removeClass('math_plugin-checked');
        display_mode_block.addClass('math_plugin-checked');

        if(additional_settings.find('.math_plugin-header').hasClass('_showing')) {
            toggle_additional_settings();
        }
        formula_color_buttons.removeClass('math_plugin-checked');
        formula_color_default.addClass('math_plugin-checked');
        formula_color_custom.css('color', '#333333').text('#333333');

        formula_id_input.val('');
        formula_classes_input.val('');

        expression_input.val('');
    }

    function toggle_additional_settings() {
        additional_settings.find('.math_plugin-header').toggleClass('_showing');
        additional_settings.find('.math_plugin-additional-settings').toggleClass('_showing').finish().slideToggle(250);
    }

    function render_preview() {
        let value = expression_input.val().trim();

        if(value) {
            dialog.find('.math_plugin-empty').hide();

            MathJax.Hub.queue.Push(['Text', MathJax.Hub.getAllJax('math_plugin-preview')[0],`${preview_math_mode}{${value}}`], () => {
                let color = get_formula_color();
                if(color !== 'default') {
                    dialog.find('.math_plugin-preview-math').css('color', color);
                } else {
                    dialog.find('.math_plugin-preview-math').css('color', '');
                }

                dialog.find('.math_plugin-preview-math').show();
                center_dialog();
            });
        } else {
            expression_input.val('');
            dialog.find('.math_plugin-empty').show();
            dialog.find('.math_plugin-preview-math').hide();
        }
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
            let inherit_color = '', color = get_formula_color();

            /* Checking formula color */
            if(color === 'default') {
                inherit_color = 'inherit-color';
                color = '';
            }

            /* Checking formula ID and classes */
            let formula_id = formula_id_input.val().trim();
            if(formula_id) {
                formula_id = 'id="' + formula_id + '"';
            } else {
                formula_id = '';
            }
            let formula_classes = formula_classes_input.val().trim();
            if(!formula_classes) {
                formula_classes = '';
            }

            if(get_display_mode() === 'block') {
                wrapper_start = `<p class="math block-math ${inherit_color} ${formula_classes}" ${formula_id} style="color: ${color};">\\[`;
                wrapper_end = '\\]</p>';
            } else {
                wrapper_start = `<span class="math block-math ${inherit_color} ${formula_classes}" ${formula_id} style="color: ${color}">\\(`;
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
            render_preview();
        }
    });

    $(window).resize(() => {
        resize_dialog();
        center_dialog();
    });

    /* Switching display mode */
    display_mode_buttons.click((e) => {
        if(e.target === display_mode_block.get(0)) {
            display_mode_buttons.removeClass('math_plugin-checked');
            preview_math_mode = '\\displaystyle';
            display_mode_block.addClass('math_plugin-checked');
        } else {
            display_mode_buttons.removeClass('math_plugin-checked');
            preview_math_mode = '\\textstyle';
            display_mode_inline.addClass('math_plugin-checked');
        }

        render_preview();
    });

    /* Typing math */
    let preview_delay_timeout;
    expression_input.on('input', () => {
        clearTimeout(preview_delay_timeout);

        let value = expression_input.val().trim();

        if(value) {
            preview_delay_timeout = setTimeout(() => {
                dialog.find('.math_plugin-empty').hide();

                render_preview();
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

    /* -------------------------------------------------------------------------------------------------------------- */
    /* Additional settings */
    /* -------------------------------------------------------------------------------------------------------------- */

    /* Opening additional settings */
    additional_settings.find('.math_plugin-header').click(() => {
        toggle_additional_settings();
    });

    /* Color picker */
    additional_settings.find('.math_plugin-default-color-container').iris({
        palettes: ['#C02E1D', '#F16C20', '#EBC844', '#A2B86C', '#1395BA', '#0D3C55'],
        change: (event, ui) => {
            formula_color_custom.css('color', ui.color.toString()).text(ui.color.toString());
        }
    });

    /* Switching formula color */
    formula_color_buttons.click((e) => {
        if(e.target === formula_color_default.get(0)) {
            formula_color_buttons.removeClass('math_plugin-checked');
            formula_color_default.addClass('math_plugin-checked');
        } else {
            formula_color_buttons.removeClass('math_plugin-checked');
            formula_color_custom.addClass('math_plugin-checked');
            additional_settings.find('.math_plugin-default-color-container').iris('show');
            picker_click_call++;
        }

        render_preview();
    });

    /* Closing color picker */
    let picker_click_call = 0;
    dialog.click((e) => {
        if(e.target === formula_color_custom.get(0) && picker_click_call > 1) {
            additional_settings.find('.math_plugin-default-color-container').iris('hide');
            render_preview();
            picker_click_call = 0;
        }

        if(!$(e.target).closest('.iris-picker').length > 0 && !(e.target === formula_color_custom.get(0))) {
            additional_settings.find('.math_plugin-default-color-container').iris('hide');
            render_preview();
            picker_click_call = 0;
        }
    });

    /* -------------------------------------------------------------------------------------------------------------- */
    /* TinyMCE */
    /* -------------------------------------------------------------------------------------------------------------- */

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

                if(!$(current_node).hasClass('inherit-color')) {
                    let color = rgb_to_hex($(current_node).css('color'));
                    formula_color_custom.text(color).css('color', color);

                    formula_color_buttons.removeClass('math_plugin-checked');
                    formula_color_custom.addClass('math_plugin-checked');
                }

                /* Getting ID and classes */
                formula_classes_input.val(
                    $(current_node).attr('class') === undefined ? '' : $(current_node).attr('class')
                        .replace('math', '')
                        .replace('block-math', '')
                        .replace('inline-math', '')
                        .replace('inherit-color', '')
                        .replace('_focus', '')
                        .trim()
                );
                formula_id_input.val($(current_node).attr('id') === undefined ? '' : $(current_node).attr('id').trim());

                render_preview();
            }

            dialog.dialog('open');
        }
    });

    /* Changing math highlighting when math node is in focus */
    let previous_element;
    editor.on('NodeChange', function (e) {
        if($(e.element).hasClass('math')) {
            $(e.element).addClass('_focus');
        }

        if(e.element !== previous_element) {
            $(previous_element).removeClass('_focus');
        }

        previous_element = e.element;
    });

});