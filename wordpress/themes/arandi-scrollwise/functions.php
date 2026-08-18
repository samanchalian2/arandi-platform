<?php
defined('ABSPATH') || exit;
add_action('after_setup_theme',function(){register_nav_menus(array('primary'=>'منوی اصلی آرندی'));});
add_action('wp_enqueue_scripts',function(){wp_enqueue_style('arandi-scrollwise',get_stylesheet_uri(),array('generate-style'),'1.0.0');wp_enqueue_script('arandi-scrollwise',get_stylesheet_directory_uri().'/assets/scrollwise.js',array(), '1.0.0',true);});
