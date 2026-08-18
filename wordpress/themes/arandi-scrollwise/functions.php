<?php
defined('ABSPATH') || exit;
add_action('wp_enqueue_scripts',function(){wp_enqueue_style('arandi-scrollwise',get_stylesheet_uri(),array('generate-style'),'1.0.0');});
