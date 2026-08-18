<?php get_header(); $scenes=array(
array('gateway','وقتی داده، فرایند و تصمیم از هم جدا می‌شوند','سامانه‌های جزیره‌ای و دید محدود، تصمیم‌گیری و رشد سازمان را کند می‌کنند.'),
array('discover','تحول از شناخت دقیق مسئله آغاز می‌شود','بررسی میدانی و تحلیل وضع موجود، مسئلهٔ واقعی را از نشانه‌های آن جدا می‌کند.'),
array('design','معماری‌ای که فناوری را به عملیات متصل می‌کند','نیاز کسب‌وکار، زیرساخت، داده و امنیت در یک نقشهٔ اجرایی کنار هم قرار می‌گیرند.'),
array('build-secure','پیاده‌سازی کنترل‌شده، از ارتباطات تا پلتفرم','شبکه، مرکز داده، ابر، نرم‌افزار و امنیت لایه‌ای، بنیانی پایدار می‌سازند.'),
array('oil-gas','از میدان تا مرکز عملیات، یک جریان مطمئن اطلاعات','اتصال ایمن تجهیزات و یکپارچگی IT و OT، دادهٔ عملیاتی را به تصمیم تبدیل می‌کند.'),
array('petrochemical','کیفیت، نگهداری و تولید بر یک بستر داده','دادهٔ آزمایشگاه، تجهیزات و برنامه‌ریزی تولید در یک نمای مشترک قرار می‌گیرد.'),
array('connected-operations','دید یکپارچه از تولید تا مدیریت منابع','پایش شبکه و دارایی‌های تولید، تصویر عملیاتی مشترکی برای هماهنگی روزمره می‌سازد.'),
array('intelligence','هوش مصنوعی در خدمت تصمیم و اجرا','دوقلوی دیجیتال، تحلیل پیش‌بینانه و دستیارهای سازمانی توان تیم‌ها را افزایش می‌دهند.'),
array('outcomes','چرخه‌ای که با تحویل پایان نمی‌یابد','هر پروژه به یک قابلیت پایدار برای بهره‌برداری، یادگیری و رشد تبدیل می‌شود.'),
array('finale','تحول یک پروژه نیست؛ قابلیتی است که باقی می‌ماند','پایان این روایت، نقطهٔ آغاز گفت‌وگوی تحول سازمان شماست.') ); ?>
<main id="main" class="scrollwise-story"><?php foreach($scenes as $i=>$scene):$image=get_stylesheet_directory_uri().'/assets/scenes/'.$scene[0].'.webp';?><section class="scrollwise-scene" style="--scene:url('<?php echo esc_url($image);?>')"><div class="scrollwise-card"><p>ARANDI / <?php echo esc_html(sprintf('%02d',$i+1));?></p><?php if(!$i):?><h1><?php echo esc_html($scene[1]);?></h1><?php else:?><h2><?php echo esc_html($scene[1]);?></h2><?php endif;?><p><?php echo esc_html($scene[2]);?></p><?php if($i===count($scenes)-1):?><a class="scrollwise-cta" href="<?php echo esc_url(home_url('/contact/'));?>">شروع گفتگو</a><?php endif;?></div></section><?php endforeach;?></main><?php get_footer();
