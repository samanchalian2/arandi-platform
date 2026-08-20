<?php
defined('ABSPATH') || exit;

add_action('after_setup_theme', function () {
    register_nav_menus(array('primary' => 'منوی اصلی آرندی'));
});

add_action('wp_enqueue_scripts', function () {
    $style_path = get_stylesheet_directory() . '/style.css';
    $script_path = get_stylesheet_directory() . '/assets/scrollwise.js';

    wp_enqueue_style(
        'arandi-scrollwise',
        get_stylesheet_uri(),
        array('generate-style'),
        (string) filemtime($style_path)
    );
    wp_enqueue_script(
        'arandi-scrollwise',
        get_stylesheet_directory_uri() . '/assets/scrollwise.js',
        array(),
        (string) filemtime($script_path),
        true
    );
});
