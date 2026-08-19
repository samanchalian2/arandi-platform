<?php
/**
 * Scrollwise front page.
 *
 * @package Arandi_Scrollwise
 */

get_header();

$requested_language = isset( $_GET['lang'] ) ? sanitize_key( wp_unslash( $_GET['lang'] ) ) : '';
$is_english         = 'en' === $requested_language || ( ! $requested_language && str_starts_with( determine_locale(), 'en' ) );
$language           = $is_english ? 'en' : 'fa';
$direction          = $is_english ? 'ltr' : 'rtl';
$scene_uri          = trailingslashit( get_stylesheet_directory_uri() ) . 'assets/scenes/';
$home_url           = home_url( '/' );
$with_language      = static function ( string $path ) use ( $language ): string {
	return add_query_arg( 'lang', $language, home_url( $path ) );
};

$copy = array(
	'fa' => array(
		'gateway'              => array( 'title' => 'هر توقف بزرگ، از یک گسست کوچک آغاز می‌شود', 'description' => 'جایی میان میدان، کارخانه، مرکز داده و اتاق تصمیم، اطلاعات مسیر خود را گم می‌کند. آرندی دوباره میان فناوری، عملیات و انسان پیوند می‌سازد.', 'bridge' => 'برای دیدن مسیر، ابتدا باید نشانه‌ها را بدون پیش‌داوری ببینیم.', 'interlude_title' => 'گسست‌های پنهان را پیدا کنیم', 'interlude_description' => 'مسیر تحول با دیدن نقاطی آغاز می‌شود که داده، فرایند و تصمیم دیگر به هم نمی‌رسند.' ),
		'discover'             => array( 'title' => 'آنچه دیده نمی‌شود، قابل مدیریت نیست', 'description' => 'داده‌های پراکنده، فرایندهای ناپیوسته و تصمیم‌های دیرهنگام سه نشانه‌اند. گفت‌وگو، مشاهده میدانی و تحلیل وضع موجود از آن‌ها یک تصویر مشترک می‌سازد.', 'bridge' => 'وقتی مسئله برای همه یکسان دیده شود، می‌توان مسیر تغییر را طراحی کرد.', 'interlude_title' => 'مسئله را پیش از انتخاب فناوری تعریف می‌کنیم', 'interlude_description' => 'ارزیابی بلوغ، تحلیل فرایند و معماری وضع موجود، مبنای یک تصمیم اجرایی قابل دفاع می‌شود.' ),
		'design'               => array( 'title' => 'از تصویر مشترک، به یک نقشه مشترک', 'description' => 'وضع موجود، وضعیت مطلوب، اولویت‌ها، وابستگی‌ها و ریسک‌ها در یک نقشه‌راه مرحله‌بندی‌شده کنار هم قرار می‌گیرند.', 'bridge' => 'نقشه زمانی ارزش دارد که عملیات روزمره بتواند با اطمینان بر آن بنا شود.', 'interlude_title' => 'راهی که پیش از اجرا قابل سنجش است', 'interlude_description' => 'نقشه معماری، خروجی‌ها و ترتیب تحویل، گفت‌وگوی راهبردی را به برنامه‌ای قابل اجرا تبدیل می‌کند.' ),
		'build-secure'         => array( 'title' => 'زیرساختی که عملیات بتواند به آن تکیه کند', 'description' => 'شبکه، مرکز داده، ابر، نرم‌افزار و امنیت مانند اجزای یک سیستم واحد، پایدار و قابل پایش ساخته می‌شوند.', 'bridge' => 'وقتی بنیان قابل اعتماد باشد، فناوری می‌تواند وارد قلب عملیات شود.', 'interlude_title' => 'یک بنیان امن برای مرحله بعد', 'interlude_description' => 'دسترس‌پذیری، امنیت، مقیاس‌پذیری و بهره‌برداری روزمره باید هم‌زمان در معماری حضور داشته باشند.' ),
		'oil-gas'              => array( 'title' => 'میدان و مرکز عملیات', 'description' => 'اطلاعات تجهیزات و ارتباطات صنعتی، ایمن و قابل اتکا به مرکز تصمیم می‌رسد تا فاصله میان رخداد و اقدام کوتاه شود.', 'bridge' => 'همان جریان قابل اعتماد، در کارخانه به کیفیت و نگهداری نزدیک می‌شود.', 'interlude_title' => 'فناوری در میدان', 'interlude_description' => 'یک بنیان مشترک باید در سخت‌ترین فاصله‌های عملیاتی نیز قابل اتکا بماند.' ),
		'petrochemical'        => array( 'title' => 'کارخانه و آزمایشگاه', 'description' => 'داده آزمایشگاه، تجهیزات و برنامه‌ریزی تولید در یک نمای مشترک قرار می‌گیرد تا تصمیم‌ها دقیق‌تر و قابل پیگیری شوند.', 'bridge' => 'در مقیاس شبکه، همین زبان مشترک باید منابع متنوع را هماهنگ کند.', 'interlude_title' => 'از کیفیت تا برنامه‌ریزی', 'interlude_description' => 'اطلاعات درست، میان کنترل کیفیت، نگهداری و تولید یک زبان مشترک ایجاد می‌کند.' ),
		'connected-operations' => array( 'title' => 'شبکه و منابع انرژی', 'description' => 'پایش شبکه، دارایی‌های تولید و منابع متنوع انرژی، یک تصویر عملیاتی مشترک برای هماهنگی روزمره می‌سازد.', 'bridge' => 'اکنون که داده قابل اعتماد و نزدیک به عملیات است، می‌توان آن را به تصمیم نزدیک‌تر کرد.', 'interlude_title' => 'یک بنیان؛ سه میدان عمل', 'interlude_description' => 'در میدان، کارخانه و شبکه، اصل یکسان است: اطلاعات درست، در زمان درست، برای فرد درست.' ),
		'intelligence'         => array( 'title' => 'وقتی داده به تصمیم نزدیک می‌شود', 'description' => 'دستیار دانش سازمانی، نگهداری پیش‌بینانه، هوشمندسازی اسناد و تحلیل عملیات، توان کارشناسان را در یک چارچوب حاکمیت‌شده افزایش می‌دهند.', 'bridge' => 'هوشمندی زمانی پایدار است که هر روز بهره‌برداری، ارزیابی و بهتر شود.', 'interlude_title' => 'انسان در مرکز سازمان هوشمند باقی می‌ماند', 'interlude_description' => 'هوش مصنوعی زمانی ارزش می‌سازد که داده قابل اعتماد، هدف روشن، نظارت انسانی و معیار قابل سنجش داشته باشد.' ),
		'outcomes'             => array( 'title' => 'آنچه ساختیم، در عملیات ادامه پیدا می‌کند', 'description' => 'پروژه‌های واقعی پاسخ این روایت‌اند: بنیان یکپارچه، اتصال سایت و دفتر، محیط متصل و مدیریت پیشگیرانه عملیات چندسایتی.', 'bridge' => 'هر تحویل، باید به قابلیتی تبدیل شود که مرحله بعدی رشد را ممکن کند.', 'interlude_title' => 'اثبات، نه ادعا', 'interlude_description' => 'نتیجه‌ها فقط از شواهد منتشرشده پروژه‌ها بیان می‌شوند؛ بدون عدد یا شاخصی که منبع قابل اتکا ندارد.' ),
		'finale'               => array( 'title' => 'تحول یک پروژه نیست؛ قابلیتی است که باقی می‌ماند', 'description' => 'تصویر آغازین اکنون کامل است: جریان‌ها متصل‌اند، تصمیم به عملیات نزدیک است و سازمان می‌تواند مسیر بعدی را با اطمینان بسازد.', 'bridge' => 'مسیر بعدی را با یک گفت‌وگوی روشن آغاز کنیم.', 'interlude_title' => 'از یک گسست کوچک، تا یک تصویر کامل', 'interlude_description' => 'پایان این روایت، نقطه آغاز گفت‌وگوی تحول سازمان شماست.' ),
	),
	'en' => array(
		'gateway'              => array( 'title' => 'Every major disruption begins with a small disconnect', 'description' => 'Somewhere between field, plant, data center and decision room, information loses its path. Arandi reconnects technology, operations and people.', 'bridge' => 'To see the path, we first observe the signals without preconceptions.', 'interlude_title' => 'Find the hidden disconnects', 'interlude_description' => 'Transformation begins by seeing where data, process and decisions no longer meet.' ),
		'discover'             => array( 'title' => 'What remains unseen cannot be managed', 'description' => 'Scattered data, broken workflows and delayed decisions are three signals. Dialogue, field observation and current-state analysis turn them into one shared picture.', 'bridge' => 'When everyone sees the same problem, the path of change can be designed.', 'interlude_title' => 'Define the problem before choosing technology', 'interlude_description' => 'Maturity assessment, process analysis and current-state architecture create a defensible basis for action.' ),
		'design'               => array( 'title' => 'From a shared picture to a shared blueprint', 'description' => 'Current state, target state, priorities, dependencies and risk become one phased transformation roadmap.', 'bridge' => 'A blueprint matters when everyday operations can rely on what it builds.', 'interlude_title' => 'A path that can be tested before delivery', 'interlude_description' => 'Architecture, outputs and delivery sequence turn strategy into an executable program.' ),
		'build-secure'         => array( 'title' => 'A foundation operations can rely on', 'description' => 'Network, data center, cloud, software and security are built as one resilient, observable system.', 'bridge' => 'With a trusted foundation, technology can enter the heart of operations.', 'interlude_title' => 'A secure foundation for what comes next', 'interlude_description' => 'Availability, security, scale and everyday operation must coexist in the architecture.' ),
		'oil-gas'              => array( 'title' => 'Field and operations center', 'description' => 'Industrial communications and equipment information reach the decision center securely and reliably, reducing the distance between event and action.', 'bridge' => 'The same trusted flow moves closer to quality and maintenance inside the plant.', 'interlude_title' => 'Technology in the field', 'interlude_description' => 'A shared foundation must remain dependable across the hardest operational distances.' ),
		'petrochemical'        => array( 'title' => 'Plant and laboratory', 'description' => 'Laboratory, equipment and production-planning data form one shared view for decisions that are more precise and traceable.', 'bridge' => 'At grid scale, the same common language must coordinate diverse resources.', 'interlude_title' => 'From quality to planning', 'interlude_description' => 'Trusted information creates a common language across quality, maintenance and production.' ),
		'connected-operations' => array( 'title' => 'Grid and energy resources', 'description' => 'Grid monitoring, generation assets and diverse resources form a shared operational picture for everyday coordination.', 'bridge' => 'Now that data is trusted and close to operations, it can move closer to decisions.', 'interlude_title' => 'One foundation; three fields of action', 'interlude_description' => 'Across field, plant and grid, the principle is the same: the right information, at the right time, for the right person.' ),
		'intelligence'         => array( 'title' => 'When data moves closer to decisions', 'description' => 'Enterprise knowledge assistants, predictive maintenance, document intelligence and operational analytics extend expert capability within a governed model.', 'bridge' => 'Intelligence becomes durable when it is operated, evaluated and improved every day.', 'interlude_title' => 'People remain at the center of the intelligent enterprise', 'interlude_description' => 'AI creates value with trusted data, a clear purpose, human oversight and measurable criteria.' ),
		'outcomes'             => array( 'title' => 'What we build continues in operations', 'description' => 'Real projects answer the story: integrated foundations, connected project sites, reliable workplaces and proactive multi-site operations.', 'bridge' => 'Every delivery should become a capability for the next stage of growth.', 'interlude_title' => 'Evidence, not assertion', 'interlude_description' => 'Outcomes are drawn only from published project evidence, never from unsupported numbers or claims.' ),
		'finale'               => array( 'title' => 'Transformation is not a project; it is a capability that remains', 'description' => 'The opening picture is now complete: flows connect, decisions move closer to operations and the organization can build its next stage with confidence.', 'bridge' => 'Begin the next path with a clear conversation.', 'interlude_title' => 'From a small disconnect to the complete picture', 'interlude_description' => 'The end of this story is the beginning of your transformation conversation.' ),
	),
);

$meta = $is_english
	? array(
		'gateway' => array( 'Prelude · The disconnect', 'prelude' ), 'discover' => array( '01 · Seeing', 'chapter' ), 'design' => array( '02 · Designing the path', 'chapter' ), 'build-secure' => array( '03 · Building the foundation', 'chapter' ), 'oil-gas' => array( '04 · Technology in the field · Episode 1', 'chapter' ), 'petrochemical' => array( 'Technology in the field · Episode 2', 'episode' ), 'connected-operations' => array( 'Technology in the field · Episode 3', 'episode' ), 'intelligence' => array( '05 · Intelligence', 'chapter' ), 'outcomes' => array( '06 · Proof', 'chapter' ), 'finale' => array( 'Finale · The complete picture', 'finale' ),
	)
	: array(
		'gateway' => array( 'پیش‌درآمد · گسست', 'prelude' ), 'discover' => array( '۰۱ · دیدن', 'chapter' ), 'design' => array( '۰۲ · طراحی مسیر', 'chapter' ), 'build-secure' => array( '۰۳ · ساختن بنیان', 'chapter' ), 'oil-gas' => array( '۰۴ · فناوری در میدان · اپیزود ۱', 'chapter' ), 'petrochemical' => array( 'فناوری در میدان · اپیزود ۲', 'episode' ), 'connected-operations' => array( 'فناوری در میدان · اپیزود ۳', 'episode' ), 'intelligence' => array( '۰۵ · هوشمندی', 'chapter' ), 'outcomes' => array( '۰۶ · اثبات', 'chapter' ), 'finale' => array( 'پایان · تصویر کامل', 'finale' ),
	);
$chapter_labels = $is_english ? array( 'Problem', 'Discover', 'Roadmap', 'Foundation', 'Oil & gas', 'Petrochemicals', 'Energy', 'Intelligence', 'Outcomes' ) : array( 'مسئله', 'کشف', 'نقشه', 'بنیان', 'نفت و گاز', 'پتروشیمی', 'انرژی', 'هوشمندی', 'نتیجه' );
$keys           = array_keys( $copy[ $language ] );
$highlights     = array(
	'gateway' => array( array( '/solutions/', 'بنیان دیجیتال', 'Digital foundation' ), array( '/services/', 'مشاوره تحول دیجیتال', 'Digital transformation consulting' ) ),
	'discover' => array( array( '/services/', 'ارزیابی و مشاوره', 'Assessment and consulting' ), array( '/solutions/', 'راهکارهای سازمانی', 'Enterprise solutions' ) ),
	'design' => array( array( '/services/', 'خدمات آرندی', 'Arandi services' ), array( '/solutions/', 'راهکارهای آرندی', 'Arandi solutions' ) ),
	'build-secure' => array( array( '/services/', 'زیرساخت و شبکه', 'Infrastructure and network' ), array( '/solutions/', 'زیرساخت امن و مدرن', 'Secure modern infrastructure' ) ),
	'oil-gas' => array( array( '/industries/', 'صنایع انرژی', 'Energy industries' ), array( '/services/', 'خدمات مدیریت‌شده', 'Managed services' ) ),
	'petrochemical' => array( array( '/industries/', 'انرژی و پتروشیمی', 'Energy and petrochemicals' ), array( '/solutions/', 'هوش عملیات', 'Operational intelligence' ) ),
	'connected-operations' => array( array( '/industries/', 'صنایع انرژی', 'Energy industries' ), array( '/solutions/', 'بنیان دیجیتال', 'Digital foundation' ) ),
	'intelligence' => array( array( '/solutions/', 'هوش و عملیات', 'AI and operations' ), array( '/services/', 'راهکارهای هوشمند', 'Intelligent solutions' ) ),
	'outcomes' => array( array( '/projects/', 'پروژه‌های آرندی', 'Arandi projects' ), array( '/projects/', 'شواهد پروژه', 'Project evidence' ) ),
);
?>
<main id="main" class="scrollwise-story" dir="<?php echo esc_attr( $direction ); ?>" lang="<?php echo esc_attr( $language ); ?>" data-scrollwise-story data-motion-control="false">
	<header class="scrollwise-header" data-scrollwise-header>
		<div class="scrollwise-header-bar">
			<a class="scrollwise-brand" href="<?php echo esc_url( add_query_arg( 'lang', $language, $home_url ) ); ?>" aria-label="<?php echo esc_attr( $is_english ? 'Arandi home' : 'خانه آرندی' ); ?>">ARANDI</a>
			<nav class="scrollwise-desktop-menu" aria-label="<?php echo esc_attr( $is_english ? 'Story chapters' : 'فصل‌های روایت' ); ?>">
				<?php foreach ( array_slice( $keys, 0, 9 ) as $index => $key ) : ?><a href="#<?php echo esc_attr( $key ); ?>"><?php echo esc_html( $chapter_labels[ $index ] ); ?></a><?php endforeach; ?>
			</nav>
			<div class="scrollwise-header-actions">
				<button class="scrollwise-motion-toggle" type="button" hidden data-scrollwise-motion-toggle aria-pressed="false" aria-label="<?php echo esc_attr( $is_english ? 'Pause motion' : 'توقف حرکت' ); ?>">II</button>
				<a class="scrollwise-language-toggle" href="<?php echo esc_url( add_query_arg( 'lang', $is_english ? 'fa' : 'en', $home_url ) ); ?>" lang="<?php echo esc_attr( $is_english ? 'fa' : 'en' ); ?>"><?php echo esc_html( $is_english ? 'FA' : 'EN' ); ?></a>
				<button class="scrollwise-menu-toggle" type="button" aria-expanded="false" aria-controls="scrollwise-mobile-menu" data-scrollwise-menu-toggle><?php echo esc_html( $is_english ? 'Menu' : 'منو' ); ?></button>
			</div>
		</div>
		<nav id="scrollwise-mobile-menu" class="scrollwise-mobile-menu" hidden aria-label="<?php echo esc_attr( $is_english ? 'Story chapters' : 'فصل‌های روایت' ); ?>">
			<?php foreach ( array_slice( $keys, 0, 9 ) as $index => $key ) : ?><a href="#<?php echo esc_attr( $key ); ?>"><?php echo esc_html( $chapter_labels[ $index ] ); ?></a><?php endforeach; ?>
			<a href="<?php echo esc_url( $with_language( '/projects/' ) ); ?>"><?php echo esc_html( $is_english ? 'View projects' : 'مشاهده پروژه‌ها' ); ?></a>
		</nav>
	</header>

	<div class="scrollwise-stage" aria-hidden="true">
		<picture class="scrollwise-stage-fallback"><source media="(max-width: 767px)" srcset="<?php echo esc_url( $scene_uri . 'gateway-mobile.webp' ); ?>"><img src="<?php echo esc_url( $scene_uri . 'gateway.webp' ); ?>" alt="" width="3200" height="900" fetchpriority="high"></picture>
		<canvas class="scrollwise-canvas" data-scrollwise-canvas></canvas><div class="scrollwise-stage-wash"></div><div class="scrollwise-veil" data-scrollwise-veil></div>
	</div>
	<div class="scrollwise-track">
		<?php foreach ( $keys as $index => $key ) : ?>
			<?php
			$scene        = $copy[ $language ][ $key ];
			$role         = $meta[ $key ][1];
			$is_finale    = 'finale' === $role;
			$is_episode   = 'episode' === $role || 'oil-gas' === $key;
			$next_key     = $keys[ $index + 1 ] ?? '';
			$scene_action = 'gateway' === $key ? '#' . $next_key : ( $is_finale ? $with_language( '/contact/' ) : '' );
			?>
			<div class="scrollwise-chapter<?php echo $is_finale ? ' is-finale' : ''; ?>" data-scrollwise-chapter="<?php echo esc_attr( $key ); ?>" data-scrollwise-role="<?php echo esc_attr( $role ); ?>" data-desktop-image="<?php echo esc_url( $scene_uri . $key . '.webp' ); ?>" data-mobile-image="<?php echo esc_url( $scene_uri . $key . '-mobile.webp' ); ?>">
				<section id="<?php echo esc_attr( $key ); ?>" class="scrollwise-scene<?php echo $is_episode ? ' is-episode' : ''; ?>" aria-labelledby="<?php echo esc_attr( $key ); ?>-title">
					<picture class="scrollwise-static-image" aria-hidden="true"><source media="(max-width: 767px)" srcset="<?php echo esc_url( $scene_uri . $key . '-mobile.webp' ); ?>"><img src="<?php echo esc_url( $scene_uri . $key . '.webp' ); ?>" alt="" width="3200" height="900" loading="<?php echo 0 === $index ? 'eager' : 'lazy'; ?>"></picture>
					<div class="scrollwise-panel-wrap"><div class="scrollwise-card">
						<p class="scrollwise-eyebrow"><span aria-hidden="true"></span><?php echo esc_html( $meta[ $key ][0] ); ?></p>
						<?php if ( 0 === $index ) : ?><h1 id="<?php echo esc_attr( $key ); ?>-title"><?php echo esc_html( $scene['title'] ); ?></h1><?php else : ?><h2 id="<?php echo esc_attr( $key ); ?>-title"><?php echo esc_html( $scene['title'] ); ?></h2><?php endif; ?>
						<p class="scrollwise-description"><?php echo esc_html( $scene['description'] ); ?></p>
						<?php if ( 'discover' === $key ) : ?><ul class="scrollwise-signals"><?php foreach ( $is_english ? array( 'Scattered data', 'Broken workflows', 'Delayed decisions' ) : array( 'داده‌های پراکنده', 'فرایندهای ناپیوسته', 'تصمیم‌های دیرهنگام' ) as $item ) : ?><li><?php echo esc_html( $item ); ?></li><?php endforeach; ?></ul><?php endif; ?>
						<?php if ( 'intelligence' === $key ) : ?><ul class="scrollwise-signals is-intelligence"><?php foreach ( $is_english ? array( 'Enterprise knowledge', 'Predictive maintenance', 'Document intelligence', 'Operational analytics' ) : array( 'دستیار دانش سازمانی', 'نگهداری پیش‌بینانه', 'هوشمندسازی اسناد', 'تحلیل عملیات' ) as $item ) : ?><li><?php echo esc_html( $item ); ?></li><?php endforeach; ?></ul><?php endif; ?>
						<p class="scrollwise-bridge"><?php echo esc_html( $scene['bridge'] ); ?></p>
						<?php if ( $scene_action ) : ?><a class="scrollwise-cta" href="<?php echo esc_url( $scene_action ); ?>"><?php echo esc_html( $is_finale ? ( $is_english ? 'Start a transformation conversation' : 'آغاز گفت‌وگوی تحول' ) : ( $is_english ? 'Begin the journey' : 'شروع مسیر' ) ); ?> <span aria-hidden="true">→</span></a><?php endif; ?>
					</div></div>
					<?php if ( 0 === $index ) : ?><p class="scrollwise-scroll-cue"><?php echo esc_html( $is_english ? 'Scroll to follow the path ↓' : 'برای دیدن مسیر اسکرول کنید ↓' ); ?></p><?php endif; ?>
				</section>
				<?php if ( ! $is_finale ) : ?><section id="<?php echo esc_attr( $key ); ?>-menu" class="scrollwise-interlude<?php echo $is_episode || ( isset( $meta[ $next_key ] ) && 'episode' === $meta[ $next_key ][1] ) ? ' is-compact' : ''; ?>" aria-labelledby="<?php echo esc_attr( $key ); ?>-menu-title" data-scrollwise-interlude="<?php echo esc_attr( $key ); ?>">
					<div class="scrollwise-interlude-card"><p><?php echo esc_html( $is_episode ? $scene['bridge'] : $meta[ $key ][0] ); ?></p><h3 id="<?php echo esc_attr( $key ); ?>-menu-title"><?php echo esc_html( $is_episode ? $scene['bridge'] : $scene['interlude_title'] ); ?></h3><?php if ( ! $is_episode ) : ?><p class="scrollwise-interlude-description"><?php echo esc_html( $scene['interlude_description'] ); ?></p><?php endif; ?>
					<?php if ( ! empty( $highlights[ $key ] ) ) : ?><nav class="scrollwise-highlights" aria-label="<?php echo esc_attr( $is_english ? 'Related paths' : 'مسیرهای مرتبط' ); ?>"><?php foreach ( $highlights[ $key ] as $highlight ) : ?><a href="<?php echo esc_url( $with_language( $highlight[0] ) ); ?>"><strong><?php echo esc_html( $is_english ? $highlight[2] : $highlight[1] ); ?></strong><span aria-hidden="true">↗</span></a><?php endforeach; ?></nav><?php endif; ?>
					<?php if ( ! $is_episode ) : ?><a class="scrollwise-interlude-next" href="#<?php echo esc_attr( $next_key ); ?>"><?php echo esc_html( $is_english ? 'Continue' : 'ادامه مسیر' ); ?> <span aria-hidden="true">↓</span></a><?php endif; ?></div>
				</section><?php endif; ?>
			</div>
		<?php endforeach; ?>
	</div>
	<aside class="scrollwise-summary" aria-label="<?php echo esc_attr( $is_english ? 'Arandi experience summary' : 'خلاصه تجربه آرندی' ); ?>"><div><p><?php echo esc_html( $is_english ? 'From disconnect to durable capability' : 'از گسست تا قابلیت پایدار' ); ?></p><h2><?php echo esc_html( $is_english ? 'One technical partner across the transformation lifecycle' : 'یک شریک فنی برای تمام چرخه تحول' ); ?></h2></div><dl><div><dt><?php echo esc_html( $is_english ? 'Projects' : 'پروژه' ); ?></dt><dd>4</dd></div><div><dt><?php echo esc_html( $is_english ? 'Services' : 'خدمت' ); ?></dt><dd>7</dd></div><div><dt><?php echo esc_html( $is_english ? 'Industries' : 'صنعت' ); ?></dt><dd>6</dd></div></dl></aside>
	<footer class="scrollwise-footer"><p>© <?php echo esc_html( gmdate( 'Y' ) ); ?> Arandi Bonyan</p><nav aria-label="<?php echo esc_attr( $is_english ? 'Closing links' : 'پیوندهای پایانی' ); ?>"><a href="<?php echo esc_url( $with_language( '/projects/' ) ); ?>"><?php echo esc_html( $is_english ? 'Projects' : 'پروژه‌ها' ); ?></a><a href="<?php echo esc_url( $with_language( '/contact/' ) ); ?>"><?php echo esc_html( $is_english ? 'Contact' : 'تماس' ); ?></a></nav></footer>
</main>
<?php get_footer(); ?>
