<?php
/**
 * Arandi Scrollwise theme setup.
 *
 * @package Arandi_Scrollwise
 */

defined( 'ABSPATH' ) || exit;

add_action(
	'after_setup_theme',
	static function (): void {
		register_nav_menus( array( 'primary' => 'منوی اصلی آرندی' ) );
	}
);

add_action(
	'wp_enqueue_scripts',
	static function (): void {
		$theme   = wp_get_theme();
		$version = $theme->get( 'Version' );

		wp_enqueue_style( 'arandi-scrollwise', get_stylesheet_uri(), array( 'generate-style' ), $version );
		wp_enqueue_script(
			'arandi-scrollwise',
			get_stylesheet_directory_uri() . '/assets/scrollwise.js',
			array(),
			$version,
			array(
				'in_footer' => true,
				'strategy'  => 'defer',
			)
		);
	}
);
