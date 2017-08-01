tinymce.PluginManager.add('insert_math', (editor) => {
    editor.addButton('insert_math-button', {
        image: Insert_Math_Dialog.TinyMCE.BUTTON_ICON_URL,
        tooltip: Insert_Math_Dialog.TinyMCE.BUTTON_TOOLTIP,
        stateSelector : '.math',
        onclick: () => {
            let current_node = tinymce.EditorManager.activeEditor.selection.getNode();

            Insert_Math_Dialog.editor = editor;

            if($(current_node).hasClass('math')) {
                Insert_Math_Dialog.current_node = current_node;
                Insert_Math_Dialog.edit();
            } else {
                Insert_Math_Dialog.editor = editor;
                Insert_Math_Dialog.dialog.dialog('open');
            }
        }
    });

    /* Changing math highlighting when math node is in focus */
    let previous_element;
    editor.on('NodeChange', function (e) {
        if(previous_element)
            $(previous_element).removeClass('_focus');

        if($(e.element).hasClass('math')) {
            $(e.element).addClass('_focus');
        }

        previous_element = e.element;
    });
});