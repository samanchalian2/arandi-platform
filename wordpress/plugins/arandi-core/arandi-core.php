<?php
/**
 * Plugin Name: Arandi Core
 * Description: Bilingual-ready Arandi content, settings, starter data and secure contact handling.
 * Version: 1.0.0
 * Requires PHP: 8.1
 */
defined( 'ABSPATH' ) || exit;
final class Arandi_Core {
  public static function boot() : void {
    add_action( 'init', array( __CLASS__, 'types' ) );
    add_shortcode( 'arandi_listing', array( __CLASS__, 'listing' ) );
    add_action( 'admin_post_nopriv_arandi_contact', array( __CLASS__, 'contact' ) );
    add_action( 'admin_post_arandi_contact', array( __CLASS__, 'contact' ) );
  }
  public static function types() : void {
    foreach ( array( 'service'=>'خدمات', 'solution'=>'راهکارها', 'industry'=>'صنایع', 'project'=>'پروژه‌ها', 'article'=>'مقالات' ) as $key=>$label ) register_post_type( 'arandi_'.$key, array( 'labels'=>array('name'=>$label), 'public'=>true, 'show_in_rest'=>true, 'has_archive'=>$key.'s', 'rewrite'=>array('slug'=>$key.'s'), 'supports'=>array('title','editor','excerpt','thumbnail'), 'menu_icon'=>'dashicons-portfolio' ) );
  }
  public static function listing() : string {
    $map=array('services'=>'arandi_service','solutions'=>'arandi_solution','industries'=>'arandi_industry','projects'=>'arandi_project','articles'=>'arandi_article'); $slug=get_post_field('post_name',get_queried_object_id());
    if ('contact'===$slug) return '<form class="arandi-contact" method="post" action="'.esc_url(admin_url('admin-post.php')).'">'.wp_nonce_field('arandi_contact','arandi_contact_nonce',true,false).'<input type="hidden" name="action" value="arandi_contact"><label>نام<input required name="name" autocomplete="name"></label><label>ایمیل<input required type="email" name="email" autocomplete="email"></label><label>پیام<textarea required name="message" rows="6"></textarea></label><input class="arandi-hp" tabindex="-1" name="website"><button>ارسال پیام</button></form>';
    if (!isset($map[$slug])) return ''; $items=get_posts(array('post_type'=>$map[$slug],'numberposts'=>-1,'post_status'=>'publish')); ob_start(); echo '<section class="arandi-list">'; foreach($items as $item) echo '<article class="arandi-card"><h2><a href="'.esc_url(get_permalink($item)).'">'.esc_html(get_the_title($item)).'</a></h2><p>'.esc_html(get_the_excerpt($item)).'</p></article>'; echo '</section>'; return (string)ob_get_clean();
  }
  public static function contact() : void {
    $nonce=isset($_POST['arandi_contact_nonce'])?sanitize_text_field(wp_unslash($_POST['arandi_contact_nonce'])):''; if(!wp_verify_nonce($nonce,'arandi_contact')||!empty($_POST['website'])) wp_die('Invalid request.',400);
    $name=sanitize_text_field(wp_unslash($_POST['name']??'')); $email=sanitize_email(wp_unslash($_POST['email']??'')); $message=sanitize_textarea_field(wp_unslash($_POST['message']??'')); if(!$name||!is_email($email)||!$message) wp_die('Please complete all fields.',400);
    wp_mail(get_option('admin_email'),'Arandi contact: '.$name,$message."\n\n".$email); wp_safe_redirect(add_query_arg('sent','1',wp_get_referer()?:home_url('/contact/'))); exit;
  }
  public static function seed() : void {
    self::types(); foreach(array('company'=>'شرکت','services'=>'خدمات','solutions'=>'راهکارها','industries'=>'صنایع','projects'=>'پروژه‌ها','contact'=>'تماس','articles'=>'مقالات') as $slug=>$title) if(!get_page_by_path($slug)) wp_insert_post(array('post_type'=>'page','post_status'=>'publish','post_title'=>$title,'post_name'=>$slug,'post_content'=>in_array($slug,array('services','solutions','industries','projects','contact','articles'),true)?'[arandi_listing]':'آرندی، شریک تحول دیجیتال شما.'));
    $home=get_page_by_path('home'); $home=$home?$home->ID:wp_insert_post(array('post_type'=>'page','post_status'=>'publish','post_title'=>'آرندی','post_name'=>'home')); update_option('show_on_front','page'); update_option('page_on_front',(int)$home);
    foreach(array('service'=>array('تحول دیجیتال','اتوماسیون صنعتی','داده و هوش مصنوعی'),'solution'=>array('عملیات متصل','تصمیم‌گیری مبتنی بر داده'),'industry'=>array('نفت و گاز','پتروشیمی','صنعت و تولید'),'project'=>array('معماری داده سازمانی','سامانه عملیات هوشمند','نقشه راه تحول دیجیتال')) as $type=>$titles) foreach($titles as $title) if(!get_page_by_title($title,OBJECT,'arandi_'.$type)) wp_insert_post(array('post_type'=>'arandi_'.$type,'post_status'=>'publish','post_title'=>$title,'post_excerpt'=>'راهکاری قابل اتکا و متناسب با واقعیت سازمان.'));
    $menu_name='Arandi Primary'; $menu=wp_get_nav_menu_object($menu_name); $menu_id=$menu?$menu->term_id:wp_create_nav_menu($menu_name); if($menu_id && !wp_get_nav_menu_items($menu_id)) foreach(array('company','services','solutions','industries','projects','contact','articles') as $slug){$page=get_page_by_path($slug); if($page) wp_update_nav_menu_item($menu_id,0,array('menu-item-object-id'=>$page->ID,'menu-item-object'=>'page','menu-item-type'=>'post_type','menu-item-status'=>'publish'));} $locations=get_theme_mod('nav_menu_locations',array()); $locations['primary']=$menu_id; set_theme_mod('nav_menu_locations',$locations);
    flush_rewrite_rules();
  }
}
Arandi_Core::boot(); register_activation_hook(__FILE__,array('Arandi_Core','seed'));
if ( defined( 'WP_CLI' ) && WP_CLI ) WP_CLI::add_command( 'arandi-core seed', array( 'Arandi_Core', 'seed' ) );
