$(() => {
    class Insert_Math_Dialog {
        constructor() {
            this.dialog = $('#insert_math-dialog');

            this.checked_class = 'insert_math-checked';

            this.display_mode = {
                buttons: this.dialog.find('.insert_math-display-mode-container .insert_math-button'),
                block_button: this.dialog.find('.insert_math-display-block'),
                inline_button: this.dialog.find('.insert_math-display-inline')
            };

            this.additional_settings = {
                container: this.dialog.find('.insert_math-additional-settings-container'),
                header: this.dialog.find('.insert_math-additional-settings-header'),
                body: this.dialog.find('.insert_math-additional-settings')
            };

            this.formula_color = {
                buttons: this.dialog.find('.insert_math-color-container .insert_math-button'),
                default_button: this.dialog.find('.insert_math-color-default'),
                custom_button: this.dialog.find('.insert_math-color-custom')
            };

            this.formula_id = this.dialog.find('#insert_math-formula-id');

            this.formula_classes = this.dialog.find('#insert_math-formula-classes');

            this.preview = {
                icon: this.dialog.find('.insert_math-preview-icon'),
                math: this.dialog.find('.insert_math-preview-math'),
                empty: this.dialog.find('.insert_math-preview-empty')
            };

            this.expression = this.dialog.find('#insert_math-expression');

            this.insert_button = this.dialog.find('.insert_math-insert');

            /* Iris color picker initialization */
            this.picker_click_call = 0;
            this.color_picker = this.dialog.find('.insert_math-color-container').iris({
                palettes: ['#C02E1D', '#F16C20', '#EBC844', '#A2B86C', '#1395BA', '#0D3C55'],
                change: (event, ui) => {
                    this.formula_color.custom_button.text(ui.color.toString());
                    this.set_custom_formula_color();
                }
            });
            this.dialog.click(e => {
                if(e.target === this.formula_color.custom_button.get(0)
                    && this.picker_click_call > 1) {
                    this.color_picker.iris('hide');
                    this.picker_click_call = 0;
                }

                if(!$(e.target).closest('.iris-picker').length > 0 && !(e.target === this.formula_color.custom_button.get(0))) {
                    this.color_picker.iris('hide');
                    this.picker_click_call = 0;
                }
            });

            this.init_dialog();
        }

        init_dialog() {
            /* jQuery UI dialog initialization */
            this.dialog.dialog({
                autoOpen: false,
                resizable: false,
                modal: true,
                dialogClass: 'insert_math-dialog',
                draggable: false,
                width: 'auto',
                height: 'auto',
                open: () => {
                    /* Set focus on expression textarea */
                    this.expression.focus();

                    /* Closing dialog on overlay click & coloring it */
                    $('.ui-widget-overlay').bind('click', () => {
                        this.dialog.dialog('close');
                    }).css({
                        background: '#000',
                        opacity: '0.7'
                    });
                },
                close: () => {
                    this.clear();
                }
            });

            /* Resizing dialog and keeping it at browser viewport center */
            $(window).resize(() => {
                this.center_dialog();
            });

            /* Switching display mode */
            this.display_mode.block_button.click(() => {
                if(!this.display_mode.block_button.hasClass(this.checked_class)) {
                    this.display_mode.buttons.removeClass(this.checked_class);
                    this.display_mode.block_button.addClass(this.checked_class);
                    this.render_preview();
                }
            });
            this.display_mode.inline_button.click(() => {
                if(!this.display_mode.inline_button.hasClass(this.checked_class)) {
                    this.display_mode.buttons.removeClass(this.checked_class);
                    this.display_mode.inline_button.addClass(this.checked_class);
                    this.render_preview();
                }
            });

            /* Switching formula color */
            this.formula_color.default_button.click(() => {
                if(!this.formula_color.default_button.hasClass(this.checked_class)) {
                    this.formula_color.buttons.removeClass(this.checked_class);
                    this.formula_color.default_button.addClass(this.checked_class);
                    this.render_preview();
                }
            });
            this.formula_color.custom_button.click(() => {
                if(!this.formula_color.custom_button.hasClass(this.checked_class)) {
                    this.formula_color.buttons.removeClass(this.checked_class);
                    this.formula_color.custom_button.addClass(this.checked_class);
                }

                this.color_picker.find('.iris-picker').css('top', this.color_picker.outerHeight() + 5);
                this.color_picker.iris('show');
                this.picker_click_call++;
            });

            /* Typing/pasting formula color directly */
            this.formula_color.custom_button.on('keydown', (e) => {
                if(e.keyCode === 13) e.preventDefault();

                if(this.formula_color.custom_button.text().length >= 7
                    && e.keyCode !== 8 && e.keyCode !== 46
                    && e.keyCode !== 39 && e.keyCode !== 37) {
                    e.preventDefault();
                }
            });
            this.formula_color.custom_button.on('keyup', () => {
                this.set_custom_formula_color();
            });
            this.formula_color.custom_button.on('paste', (e) => {
                e.preventDefault();

                let text_to_paste = (event.originalEvent || event).clipboardData.getData('text/plain').replace(/<(?:.|\n)*?>/gm, '');

                if(text_to_paste.length > 7) {
                    text_to_paste = text_to_paste.slice(0, -(text_to_paste.length - 7));
                }

                this.formula_color.custom_button.text(text_to_paste);

                this.set_custom_formula_color();
            });

            /* Switching additional settings */
            this.additional_settings.header.click(() => {
                this.additional_settings.header.toggleClass('_showing');
                this.additional_settings.body.toggleClass('_showing').slideToggle(150, () => {
                    this.center_dialog();
                });
            });

            /* Typing math */
            let type_timeout;
            this.expression.on('input', () => {
                clearTimeout(type_timeout);

                let value = this.expression.val().trim();

                if(value) {
                    type_timeout = setTimeout(() => {
                        this.render_preview();
                    }, 300);
                } else {
                    this.preview.math.hide();
                    this.preview.empty.show();
                }
            });

            /* Inserting/Editing math */
            this.insert_button.click(() => {this.insert();});

            /* Insert on pressing "Enter" */
            this.dialog.keypress((e) => {
                if(e.keyCode === $.ui.keyCode.ENTER && !$(e.target).hasClass('insert_math-color-custom')) {
                    this.insert();
                }
            });
        }

        /**
         * Current display mode
         *
         * @returns {string} 'block' or 'inline'
         */
        get_display_mode() {
            if(this.display_mode.block_button.hasClass(this.checked_class)) {
                return 'block';
            } else {
                return 'inline';
            }
        }

        /**
         * Current formula color
         *
         * @returns {string} 'default' or hex color
         */
        get_formula_color() {
            if(this.formula_color.default_button.hasClass(this.checked_class)) {
                return 'default';
            } else {
                return this.formula_color.custom_button.text();
            }
        }

        /** Render formula in render box */
        render_preview() {
            let value = this.expression.val().trim();

            if(!value) {
                this.preview.math.hide();
                this.preview.empty.show();
                return;
            }

            this.preview.icon.addClass('_rendering');
            this.preview.empty.hide();

            let display_mode = '';
            if(this.get_display_mode() === 'block') display_mode = '\\displaystyle';
            else display_mode = '\\textstyle';

            let color = this.get_formula_color();
            if(color === 'default') {
                this.preview.math.css('color', '');
            } else {
                this.preview.math.css('color', color);
            }

            MathJax.Hub.queue.Push(['Text', MathJax.Hub.getAllJax('insert_math-preview')[0],`${display_mode}{${value}}`], () => {
                this.preview.math.show();
                this.preview.icon.removeClass('_rendering');

                this.center_dialog();
            });
        }

        /** Handling custom and applying it if valid */
        set_custom_formula_color() {
            this.formula_color.custom_button.addClass('_applying-color');

            if(/^#[0-9a-f]{3}(?:[0-9a-f]{3})?$/i.test(this.formula_color.custom_button.text())) {
                let color = this.formula_color.custom_button.text();

                this.formula_color.custom_button.css('color', color);

                this.render_preview();
            }

            this.formula_color.custom_button.removeClass('_applying-color');
        }

        /** Centering dialog */
        center_dialog() {
            this.dialog.dialog("option", "position", {my: "center", at: "center", of: window});
        }

        /** Resetting dialog to default and empty state */
        clear() {
            /* Setting default dialog title */
            this.dialog.closest('.ui-dialog').find('.ui-dialog-title').text(this.dialog.data('title'));

            /* Setting default display mode */
            this.display_mode.buttons.removeClass(this.checked_class);
            this.display_mode.block_button.addClass(this.checked_class);

            /* Setting default formula color and custom formula color */
            this.formula_color.buttons.removeClass(this.checked_class);
            this.formula_color.default_button.addClass(this.checked_class);
            this.formula_color.custom_button.css('color', '#333').text('#333333');

            /* Clearing ID and classes values */
            this.formula_id.val('');
            this.formula_classes.val('');

            /* Clearing expression value */
            this.expression.val('');

            /* Closing additional settings */
            this.additional_settings.header.removeClass('_showing');
            this.additional_settings.body.removeClass('_showing').hide();

            /* Default Insert button text */
            this.insert_button.text(this.insert_button.data('value'));

            /* Clearing current node */
            this.current_node = null;

            /* Clearing preview area */
            this.render_preview();
        }

        /** */
        edit() {
            /* Changing dialog title */
            this.dialog.closest('.ui-dialog').find('.ui-dialog-title').text(this.dialog.data('title-edit'));

            /* Setting display mode */
            if(this.current_node.tagName.toLowerCase() !== 'p') {
                this.display_mode.buttons.removeClass(this.checked_class);
                this.display_mode.inline_button.addClass(this.checked_class);
            }

            /* Setting formula color */
            if(!$(this.current_node).hasClass('inherit-color')) {
                this.formula_color.buttons.removeClass(this.checked_class);
                this.formula_color.custom_button.addClass(this.checked_class)
                    .css('color', Insert_Math_Dialog.rgb_to_hex($(this.current_node).css('color')))
                    .text(Insert_Math_Dialog.rgb_to_hex($(this.current_node).css('color')));
            }

            /* Setting formula id */
            this.formula_id.val($(this.current_node).attr('id') === undefined ? '' : $(this.current_node).attr('id').trim());

            /* Setting formula classes */
            this.formula_classes.val(
                $(this.current_node).attr('class') === undefined ? '' : $(this.current_node).attr('class')
                    .replace('math', '')
                    .replace('inherit-color', '')
                    .replace('_focus', '')
                    .trim()
            );

            /* Setting expression */
            this.expression.val(
                $(this.current_node).text().replace('\\[ ', '').replace(' \\]', '').replace('\\( ', '').replace(' \\)', '')
            );

            /* Setting button text */
            this.insert_button.text(this.insert_button.data('value-edit'));

            this.render_preview();

            this.dialog.dialog('open');
        }

        insert() {
            let value = this.expression.val().trim();

            let output;

            if(value) {
                /* Preparing formula ID */
                let formula_id = this.formula_id.val().trim();
                if(formula_id) {
                    formula_id = `id="${formula_id}"`;
                }

                /* Preparing formula classes */
                let formula_classes = this.formula_classes.val().trim();

                /* Preparing formula color */
                let color = this.get_formula_color();
                if(color === 'default') {
                    formula_classes = 'inherit-color ' + formula_classes;
                } else {
                    color = `style="color: ${color};"`;
                }

                if(this.get_display_mode() === 'block') {
                    output = `<p ${formula_id} class="math ${formula_classes}" ${color}>\\[ ${value} \\]</p>`;
                } else {
                    output = `<span ${formula_id} class="math ${formula_classes}" ${color}>\\( ${value} \\)</span>`;

                    if(!this.current_node) {
                        output = '&#8203;' + output + '&#8203;';
                    }
                }

                if(this.current_node && this.editor.id === Insert_Math_Dialog.get_editor().id) {
                    this.current_node.remove();
                }

                this.editor.insertContent(output);
            }

            this.dialog.dialog('close');
        }

        static get_editor() {
            return tinymce.EditorManager.activeEditor;
        }

        static rgb_to_hex(rgb) {
            return '#' + rgb.substr(4, rgb.indexOf(')') - 4).split(',').map((color) => parseInt(color).toString(16)).join('');
        }
    }

    window.Insert_Math_Dialog = new Insert_Math_Dialog;
});