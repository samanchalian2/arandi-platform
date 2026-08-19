<?php
/**
 * Scrollwise front page.
 *
 * @package Arandi_Scrollwise
 */

get_header();

$is_english = str_starts_with( determine_locale(), 'en' );
$direction  = $is_english ? 'ltr' : 'rtl';
$scene_uri  = trailingslashit( get_stylesheet_directory_uri() ) . 'assets/scenes/';

$copy = array(
	'fa' => array(
		array( 'gateway', 'مسئله', 'وقتی داده، فرایند و تصمیم از هم جدا می‌شوند', 'سامانه‌های جزیره‌ای و دید محدود، تصمیم‌گیری و رشد سازمان را کند می‌کنند.', 'برای دیدن مسیر، ابتدا باید نشانه‌ها را بدون پیش‌داوری ببینیم.', 'از نشانه به مسئله', 'چالش اصلی سازمان شما کجاست؟' ),
		array( 'discover', 'کشف', 'تحول از شناخت دقیق مسئله آغاز می‌شود', 'بررسی میدانی و تحلیل وضع موجود، مسئلهٔ واقعی را از نشانه‌های آن جدا می‌کند.', 'وقتی مسئله برای همه یکسان دیده شود، می‌توان مسیر تغییر را طراحی کرد.', 'تصویر مشترک', 'مسئله را پیش از انتخاب فناوری تعریف می‌کنیم.' ),
		array( 'design', 'نقشه تحول', 'معماری‌ای که فناوری را به عملیات متصل می‌کند', 'نیاز کسب‌وکار، زیرساخت، داده و امنیت در یک نقشهٔ اجرایی کنار هم قرار می‌گیرند.', 'نقشه زمانی ارزش دارد که عملیات روزمره بتواند با اطمینان بر آن بنا شود.', 'انتخاب مسیر', 'از راهبرد به برنامه‌ای که قابل اجراست.' ),
		array( 'build-secure', 'بنیان دیجیتال', 'پیاده‌سازی کنترل‌شده، از ارتباطات تا پلتفرم', 'شبکه، مرکز داده، ابر، نرم‌افزار و امنیت لایه‌ای، بنیانی پایدار می‌سازند.', 'وقتی بنیان قابل اعتماد باشد، فناوری می‌تواند وارد قلب عملیات شود.', 'زیرساخت آماده صنعت', 'تحول پایدار به یک بنیان امن نیاز دارد.' ),
		array( 'oil-gas', 'نفت و گاز', 'از میدان تا مرکز عملیات، یک جریان مطمئن اطلاعات', 'اتصال ایمن تجهیزات و یکپارچگی IT و OT، دادهٔ عملیاتی را به تصمیم تبدیل می‌کند.', 'همان جریان قابل اعتماد، در کارخانه به کیفیت و نگهداری نزدیک می‌شود.', 'فناوری در میدان', 'دیدپذیری و قابلیت اتکا برای عملیات نفت و گاز.' ),
		array( 'petrochemical', 'پتروشیمی', 'کیفیت، نگهداری و تولید بر یک بستر داده', 'دادهٔ آزمایشگاه، تجهیزات و برنامه‌ریزی تولید در یک نمای مشترک قرار می‌گیرد.', 'در مقیاس شبکه، همین زبان مشترک باید منابع متنوع را هماهنگ کند.', 'عملیات داده‌محور', 'از کنترل کیفیت تا برنامه‌ریزی یکپارچه.' ),
		array( 'connected-operations', 'انرژی متصل', 'دید یکپارچه از تولید تا مدیریت منابع', 'پایش شبکه و دارایی‌های تولید، تصویر عملیاتی مشترکی برای هماهنگی روزمره می‌سازد.', 'اکنون که داده قابل اعتماد و نزدیک به عملیات است، می‌توان آن را به تصمیم نزدیک‌تر کرد.', 'عملیات متصل', 'یک نمای مشترک برای یک اکوسیستم پیچیده.' ),
		array( 'intelligence', 'سازمان هوشمند', 'هوش مصنوعی در خدمت تصمیم و اجرا', 'دوقلوی دیجیتال، تحلیل پیش‌بینانه و دستیارهای سازمانی توان تیم‌ها را افزایش می‌دهند.', 'هوشمندی زمانی پایدار است که هر روز بهره‌برداری، ارزیابی و بهتر شود.', 'هوشمندی مسئولانه', 'انسان در مرکز سازمان هوشمند باقی می‌ماند.' ),
		array( 'outcomes', 'نتیجه', 'چرخه‌ای که با تحویل پایان نمی‌یابد', 'هر پروژه به یک قابلیت پایدار برای بهره‌برداری، یادگیری و رشد تبدیل می‌شود.', 'هر تحویل، باید به قابلیتی تبدیل شود که مرحله بعدی رشد را ممکن کند.', 'اثبات، نه ادعا', 'نتیجه‌ها از شواهد واقعی پروژه‌ها بیان می‌شوند.' ),
		array( 'finale', 'تصویر کامل', 'تحول یک پروژه نیست؛ قابلیتی است که باقی می‌ماند', 'پایان این روایت، نقطهٔ آغاز گفت‌وگوی تحول سازمان شماست.', 'مسیر بعدی را با یک گفت‌وگوی روشن آغاز کنیم.', '', '' ),
	),
	'en' => array(
		array( 'gateway', 'Problem', 'When data, process and decisions drift apart', 'Disconnected systems and limited visibility slow decisions and organizational growth.', 'First, we observe the signals without preconceptions.', 'From signal to problem', 'Where is your organization’s real bottleneck?' ),
		array( 'discover', 'Discover', 'Transformation begins with a precise understanding', 'Field observation and current-state analysis separate the real problem from its symptoms.', 'When everyone sees the same problem, the path of change can be designed.', 'A shared picture', 'Define the problem before choosing technology.' ),
		array( 'design', 'Transformation roadmap', 'Architecture that connects technology to operations', 'Business needs, infrastructure, data and security become one executable roadmap.', 'A blueprint matters when everyday operations can rely on it.', 'Choosing the path', 'Turn strategy into an executable program.' ),
		array( 'build-secure', 'Digital foundation', 'Controlled delivery, from connectivity to platform', 'Network, data center, cloud, software and layered security create a resilient foundation.', 'With a trusted foundation, technology can enter the heart of operations.', 'Industry-ready infrastructure', 'Durable transformation needs a secure foundation.' ),
		array( 'oil-gas', 'Oil and gas', 'A trusted flow from field to operations center', 'Secure equipment connectivity and IT/OT integration turn operational data into timely decisions.', 'The same trusted flow moves closer to quality and maintenance inside the plant.', 'Technology in the field', 'Visibility and reliability for oil and gas operations.' ),
		array( 'petrochemical', 'Petrochemical', 'Quality, maintenance and production on one data layer', 'Laboratory, equipment and production-planning data form one shared view.', 'At grid scale, the same common language must coordinate diverse resources.', 'Data-driven operations', 'From quality control to integrated planning.' ),
		array( 'connected-operations', 'Connected energy', 'A unified view from generation to resource management', 'Grid and generation monitoring create a shared operational picture for daily coordination.', 'Trusted operational data can now move closer to decisions.', 'Connected operations', 'One shared view for a complex ecosystem.' ),
		array( 'intelligence', 'Intelligent enterprise', 'Artificial intelligence in service of decisions', 'Digital twins, predictive analytics and enterprise assistants extend expert capability.', 'Intelligence becomes durable when it is operated, evaluated and improved every day.', 'Responsible intelligence', 'People remain at the center of the intelligent enterprise.' ),
		array( 'outcomes', 'Outcomes', 'A cycle that does not end at delivery', 'Every project becomes a lasting capability for operation, learning and growth.', 'Every delivery should enable the next stage of growth.', 'Evidence, not assertion', 'Outcomes are drawn from real project evidence.' ),
		array( 'finale', 'The complete picture', 'Transformation is not a project; it is a capability that remains', 'The end of this story is the beginning of your transformation conversation.', 'Begin the next path with a clear conversation.', '', '' ),
	),
);

$scenes = $copy[ $is_english ? 'en' : 'fa' ];
?>
<main id="main" class="scrollwise-story" dir="<?php echo esc_attr( $direction ); ?>" data-scrollwise-story>
	<div class="scrollwise-stage" aria-hidden="true">
		<picture class="scrollwise-stage-fallback">
			<source media="(max-width: 767px)" srcset="<?php echo esc_url( $scene_uri . 'gateway-mobile.webp' ); ?>">
			<img src="<?php echo esc_url( $scene_uri . 'gateway.webp' ); ?>" alt="" width="3200" height="900" fetchpriority="high">
		</picture>
		<canvas class="scrollwise-canvas" data-scrollwise-canvas></canvas>
		<div class="scrollwise-stage-wash"></div>
		<div class="scrollwise-veil" data-scrollwise-veil></div>
	</div>

	<div class="scrollwise-track">
		<?php foreach ( $scenes as $index => $scene ) : ?>
			<?php
			$key         = $scene[0];
			$desktop_url = $scene_uri . $key . '.webp';
			$mobile_url  = $scene_uri . $key . '-mobile.webp';
			$is_finale   = count( $scenes ) - 1 === $index;
			?>
			<div
				class="scrollwise-chapter<?php echo $is_finale ? ' is-finale' : ''; ?>"
				data-scrollwise-chapter="<?php echo esc_attr( $key ); ?>"
				data-desktop-image="<?php echo esc_url( $desktop_url ); ?>"
				data-mobile-image="<?php echo esc_url( $mobile_url ); ?>"
			>
				<section id="<?php echo esc_attr( $key ); ?>" class="scrollwise-scene" aria-labelledby="<?php echo esc_attr( $key ); ?>-title">
					<picture class="scrollwise-static-image" aria-hidden="true">
						<source media="(max-width: 767px)" srcset="<?php echo esc_url( $mobile_url ); ?>">
						<img src="<?php echo esc_url( $desktop_url ); ?>" alt="" width="3200" height="900" loading="<?php echo 0 === $index ? 'eager' : 'lazy'; ?>">
					</picture>
					<div class="scrollwise-panel-wrap">
						<div class="scrollwise-card">
							<p class="scrollwise-eyebrow"><span aria-hidden="true"></span><?php echo esc_html( $scene[1] ); ?> · <?php echo esc_html( sprintf( '%02d', $index + 1 ) ); ?></p>
							<?php if ( 0 === $index ) : ?>
								<h1 id="<?php echo esc_attr( $key ); ?>-title"><?php echo esc_html( $scene[2] ); ?></h1>
							<?php else : ?>
								<h2 id="<?php echo esc_attr( $key ); ?>-title"><?php echo esc_html( $scene[2] ); ?></h2>
							<?php endif; ?>
							<p class="scrollwise-description"><?php echo esc_html( $scene[3] ); ?></p>
							<p class="scrollwise-bridge"><?php echo esc_html( $scene[4] ); ?></p>
							<?php if ( $is_finale ) : ?>
								<a class="scrollwise-cta" href="<?php echo esc_url( home_url( '/contact/' ) ); ?>"><?php echo esc_html( $is_english ? 'Start a conversation' : 'شروع گفتگو' ); ?></a>
							<?php endif; ?>
						</div>
					</div>
				</section>
				<?php if ( ! $is_finale ) : ?>
					<section class="scrollwise-interlude" aria-label="<?php echo esc_attr( $scene[5] ); ?>">
						<div class="scrollwise-interlude-card">
							<p><?php echo esc_html( $scene[5] ); ?></p>
							<h3><?php echo esc_html( $scene[6] ); ?></h3>
						</div>
					</section>
				<?php endif; ?>
			</div>
		<?php endforeach; ?>
	</div>
</main>
<?php
get_footer();
