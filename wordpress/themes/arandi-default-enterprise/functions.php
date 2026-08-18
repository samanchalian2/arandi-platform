<?php
defined('ABSPATH') || exit;
add_action('after_setup_theme',function(){register_nav_menus(array('primary'=>'منوی اصلی آرندی'));});
add_action('wp_enqueue_scripts',function(){wp_enqueue_style('arandi-default-enterprise',get_stylesheet_uri(),array('generate-style'),'1.0.0');});
