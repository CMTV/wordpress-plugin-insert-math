<?php
/*
Plugin Name: Insert math
Plugin URI: https://github.com/CMTV/wordpress-plugin-insert-math
Text Domain: insert-math
Domain Path: /languages
Description: Fast and handy insert any math formulas in your posts.
Version: 1.0
Author: CMTV
License: GPL3
*/

/** Link to MathJax library */
define('MATH_PLUGIN_MATHJAX_URL', '//cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.1/MathJax.js');

/** Link to jQuery UI stylesheet */
define('MATH_PLUGIN_JQUERY_UI_CSS_URL', '//code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css');

/* ------------------------------------------------------------------------------------------------------------------ */
/* Adding MathJax support for both frontend and admin panel */
/* ------------------------------------------------------------------------------------------------------------------ */
function math_plugin_mathjax_support() {
	/* Configuring MathJax */
	wp_enqueue_script('mathjax-config', plugin_dir_url(__FILE__) . 'mathjax/config.js');

	/* Calling MathJax library */
	wp_enqueue_script('mathjax-lib', MATH_PLUGIN_MATHJAX_URL, ['mathjax-config']);

	/*
	 * Adding some flexibility to MathJax.
	 * When math formula is bigger than browser viewport it automatically adds nicely stylised x-scrollbar
	 */
	wp_enqueue_style('mathjax-scroll-math-css', plugin_dir_url(__FILE__) . 'mathjax/scroll-math.css');
}
add_action('wp_enqueue_scripts', 'math_plugin_mathjax_support');
add_action('admin_enqueue_scripts', 'math_plugin_mathjax_support');

/* ------------------------------------------------------------------------------------------------------------------ */
/* Adding jQuery UI and "Inserting math" dialog to DOM */
/* ------------------------------------------------------------------------------------------------------------------ */

/* Adding jQuery UI & dialog JS/CSS files */
function math_plugin_jquery_ui() {
	/* Adding jQuery UI library */
	wp_enqueue_script('jquery-ui-core');
	wp_enqueue_script('jquery-ui-dialog');
	wp_enqueue_script('jquery-ui-resizable');

	/* Adding default jQuery UI stylesheet */
	wp_enqueue_style('jquery-ui-css', MATH_PLUGIN_JQUERY_UI_CSS_URL);

	/* Adding dialog stylesheet */
	wp_enqueue_style('math_plugin-dialog', plugin_dir_url(__FILE__) . 'tinymce/dialog.css');
}
add_action('wp_enqueue_scripts', 'math_plugin_jquery_ui');
add_action('admin_enqueue_scripts', 'math_plugin_jquery_ui');

/* Adding "Inserting math" dialog to DOM */
function math_plugin_dialog() {
	?>
		<div title="<?php _e('Inserting math', 'insert-math'); ?>" id="math_plugin-insert-math-dialog">

			<div class="math_plugin-display-mode-container math_plugin-container">
                <div class="math_plugin-label"><?php _e('Insert math as...', 'insert-math'); ?></div>
                <div class="math_plugin-display-button math_plugin-display-value-block math_plugin-checked">
                    <?php _e('Block', 'insert-math'); ?>
                </div>
                <div class="math_plugin-display-button math_plugin-display-value-inline">
                    <?php _e('Inline', 'insert-math'); ?>
                </div>
			</div>

			<div class="math_plugin-expression-container math_plugin-container">
				<div class="math_plugin-label">
					<?php echo __('Math must be written in', 'insert-math') . ' '; ?>
					<a href="https://en.wikibooks.org/wiki/LaTeX/Mathematics#Symbols" target="_blank">LaTeX</a>
				</div>
				<textarea rows="3" id="math_plugin-expression" placeholder="<?php _e('Start typing math here...', 'insert-math'); ?>"></textarea>
			</div>

			<div class="math_plugin-preview-container math_plugin-container">
				<div class="math_plugin-label"><?php _e('Preview', 'insert-math'); ?></div>
				<div id="math_plugin-preview">
                    <div class="math_plugin-preview-math">\({}\)</div>
                    <span class="math_plugin-empty"><?php _e('Nothing to preview', 'insert-math'); ?></span>
                </div>
			</div>

            <div class="math_plugin-insert-button"><?php _e('Insert', 'insert-math'); ?></div>

			<div class="math_plugin-ad">
                <div class="math_plugin-ad-inner">
                    <script async src="//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
                    <!-- [Wordpress Плагин] Math -->
                    <ins class="adsbygoogle"
                         style="display:inline-block;width:320px;height:50px"
                         data-ad-client="ca-pub-8094912170389944"
                         data-ad-slot="9637138293"></ins>
                    <script>
                        (adsbygoogle = window.adsbygoogle || []).push({});
                    </script>
                </div>
			</div>

		</div>
	<?php
}
add_action('wp_footer', 'math_plugin_dialog');
add_action('in_admin_header', 'math_plugin_dialog');

/* ------------------------------------------------------------------------------------------------------------------ */
/* TinyMCE */
/* ------------------------------------------------------------------------------------------------------------------ */

/* Passing button icon url and button tooltip to TinyMCE plugin js file through unique global js array */
function math_plugin_js_constants() {
    $constants = [];
    $constants['BUTTON_ICON_URL'] = plugin_dir_url(__FILE__) . 'tinymce/button-icon.svg';
    $constants['BUTTON_TOOLTIP'] = __('Insert/edit math', 'insert-math');

    wp_add_inline_script('mathjax-lib', 'var MATH_PLUGIN_CONSTANTS_719342 = ' . json_encode($constants) . ';', 'after');
}
add_action('wp_enqueue_scripts', 'math_plugin_js_constants');
add_action('admin_enqueue_scripts', 'math_plugin_js_constants');

/* Registering plugin */
function math_plugin_tinymce($plugins) {
    $plugins['math_plugin'] = plugin_dir_url(__FILE__) . 'tinymce/plugin.js';
    return $plugins;
}
add_filter('mce_external_plugins', 'math_plugin_tinymce');

/* Adding button to TinyMCE's toolbar before wp_adv button */
function math_plugin_add_button($buttons) {
    array_splice($buttons, array_search('wp_adv', $buttons), 0, 'math_plugin-insert-math-button');
    return $buttons;
}
add_filter('mce_buttons', 'math_plugin_add_button');

/* Styling math div's and span's in editor */
function math_plugin_add_editor_style() {
	if (is_admin()) {
		add_editor_style(plugin_dir_url(__FILE__) . 'tinymce/editor.css?' . rand());
	}

	global $editor_styles;
	if(is_array($editor_styles)) {
	    array_push($editor_styles, plugin_dir_url(__FILE__) . 'tinymce/editor.css?' . rand());
    } else {
		$editor_styles = [plugin_dir_url(__FILE__) . 'tinymce/editor.css?' . rand()];
	}
}
add_action('wp_head', "math_plugin_add_editor_style");
add_action('admin_init', "math_plugin_add_editor_style");

/* ------------------------------------------------------------------------------------------------------------------ */
/* Translations */
/* ------------------------------------------------------------------------------------------------------------------ */
function math_plugin_load_textdomain() {
	load_plugin_textdomain('insert-math', FALSE, basename(dirname(__FILE__)) . '/languages/');
}
add_action('plugins_loaded', 'math_plugin_load_textdomain');