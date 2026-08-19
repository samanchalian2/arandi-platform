<?php
get_header();

$requested_language = isset($_GET['lang']) ? sanitize_key(wp_unslash($_GET['lang'])) : '';
$is_english = 'en' === $requested_language;
$language = $is_english ? 'en' : 'fa';
$direction = $is_english ? 'ltr' : 'rtl';
$contact_url = $is_english
    ? add_query_arg('lang', 'en', home_url('/contact/'))
    : home_url('/contact/');
$contact_label = $is_english ? 'Start a conversation' : 'شروع گفتگو';

$scenes = array(
    array(
        'gateway',
        'وقتی داده، فرایند و تصمیم از هم جدا می‌شوند',
        'سامانه‌های جزیره‌ای و دید محدود، تصمیم‌گیری و رشد سازمان را کند می‌کنند.',
        'گسست‌های پنهان را پیدا کنیم',
    ),
    array(
        'discover',
        'تحول از شناخت دقیق مسئله آغاز می‌شود',
        'بررسی میدانی و تحلیل وضع موجود، مسئلهٔ واقعی را از نشانه‌های آن جدا می‌کند.',
        'مسئله را پیش از انتخاب فناوری تعریف می‌کنیم',
    ),
    array(
        'design',
        'معماری‌ای که فناوری را به عملیات متصل می‌کند',
        'نیاز کسب‌وکار، زیرساخت، داده و امنیت در یک نقشهٔ اجرایی کنار هم قرار می‌گیرند.',
        'راهی که پیش از اجرا قابل سنجش است',
    ),
    array(
        'build-secure',
        'پیاده‌سازی کنترل‌شده، از ارتباطات تا پلتفرم',
        'شبکه، مرکز داده، ابر، نرم‌افزار و امنیت لایه‌ای، بنیانی پایدار می‌سازند.',
        'یک بنیان امن برای مرحلهٔ بعد',
    ),
    array(
        'oil-gas',
        'از میدان تا مرکز عملیات، یک جریان مطمئن اطلاعات',
        'اتصال ایمن تجهیزات و یکپارچگی IT و OT، دادهٔ عملیاتی را به تصمیم تبدیل می‌کند.',
        'فناوری در میدان',
    ),
    array(
        'petrochemical',
        'کیفیت، نگهداری و تولید بر یک بستر داده',
        'دادهٔ آزمایشگاه، تجهیزات و برنامه‌ریزی تولید در یک نمای مشترک قرار می‌گیرد.',
        'از کیفیت تا برنامه‌ریزی',
    ),
    array(
        'connected-operations',
        'دید یکپارچه از تولید تا مدیریت منابع',
        'پایش شبکه و دارایی‌های تولید، تصویر عملیاتی مشترکی برای هماهنگی روزمره می‌سازد.',
        'یک بنیان؛ سه میدان عمل',
    ),
    array(
        'intelligence',
        'هوش مصنوعی در خدمت تصمیم و اجرا',
        'دوقلوی دیجیتال، تحلیل پیش‌بینانه و دستیارهای سازمانی توان تیم‌ها را افزایش می‌دهند.',
        'انسان در مرکز سازمان هوشمند باقی می‌ماند',
    ),
    array(
        'outcomes',
        'چرخه‌ای که با تحویل پایان نمی‌یابد',
        'هر پروژه به یک قابلیت پایدار برای بهره‌برداری، یادگیری و رشد تبدیل می‌شود.',
        'اثبات، نه ادعا',
    ),
    array(
        'finale',
        'تحول یک پروژه نیست؛ قابلیتی است که باقی می‌ماند',
        'پایان این روایت، نقطهٔ آغاز گفت‌وگوی تحول سازمان شماست.',
        '',
    ),
);

if ($is_english) {
    $scenes = array(
        array(
            'gateway',
            'When data, processes and decisions drift apart',
            'Siloed systems, limited visibility and disconnected workflows slow decisions and growth—even when technology is present everywhere.',
            "Where is your organization's real constraint?",
        ),
        array(
            'discover',
            'Transformation begins with a precise understanding',
            'Field observation, stakeholder dialogue and current-state analysis separate the real operating problem from its symptoms.',
            'Define the problem before choosing technology',
        ),
        array(
            'design',
            'Architecture that connects technology to operations',
            'Business needs, infrastructure, networks, data, software and security become one coherent, phased delivery blueprint.',
            'From strategy to an executable program',
        ),
        array(
            'build-secure',
            'Controlled delivery, from communications to platform',
            'Networks, data centers, cloud, software and layered security create a resilient, observable foundation for the next stage.',
            'Durable transformation needs a secure foundation',
        ),
        array(
            'oil-gas',
            'One trusted information flow from field to operations',
            'Secure instrumentation, industrial communications and IT/OT integration turn field data into timely operational decisions.',
            'Visibility and reliability for oil and gas operations',
        ),
        array(
            'petrochemical',
            'Quality, maintenance and production on one data foundation',
            'Laboratory, asset and production-planning data form a shared view that reduces downtime, rework and uncertainty.',
            'From quality control to integrated planning',
        ),
        array(
            'connected-operations',
            'One operating view from generation to resource management',
            'Grid monitoring, generation assets and diverse energy resources form a common operational picture for everyday coordination.',
            'A shared view for a complex ecosystem',
        ),
        array(
            'intelligence',
            'AI in service of decisions and delivery',
            'Digital twins, predictive insight, enterprise assistants and automation extend expert capability within a governed operating model.',
            'People remain at the center of the intelligent enterprise',
        ),
        array(
            'outcomes',
            'A lifecycle that continues beyond handover',
            "Each project becomes a lasting capability for operations, learning and the organization's next stage of growth.",
            'Transformation is a capability, not a destination',
        ),
        array(
            'finale',
            'Transformation is not a project; it is a capability that remains',
            'The opening picture is now complete, and the end of this story begins your transformation conversation.',
            '',
        ),
    );
}

$first_image = get_stylesheet_directory_uri() . '/assets/scenes/' . $scenes[0][0] . '.webp';
?>
<main
    id="main"
    class="scrollwise-story"
    dir="<?php echo esc_attr($direction); ?>"
    lang="<?php echo esc_attr($language); ?>"
    data-scrollwise-story
    data-scene-count="<?php echo esc_attr((string) count($scenes)); ?>"
>
    <div class="scrollwise-stage" data-scrollwise-stage aria-hidden="true">
        <picture class="scrollwise-stage__fallback">
            <img
                src="<?php echo esc_url($first_image); ?>"
                alt=""
                width="3200"
                height="900"
                fetchpriority="high"
            >
        </picture>
        <canvas class="scrollwise-canvas" data-scrollwise-canvas></canvas>
        <div class="scrollwise-stage__wash"></div>
        <div class="scrollwise-veil" data-scrollwise-veil></div>
    </div>

    <div class="scrollwise-scenes">
        <?php foreach ($scenes as $index => $scene) : ?>
            <?php
            $image = get_stylesheet_directory_uri() . '/assets/scenes/' . $scene[0] . '.webp';
            $is_last = $index === count($scenes) - 1;
            ?>
            <section
                id="<?php echo esc_attr($scene[0]); ?>"
                class="scrollwise-scene<?php echo $is_last ? ' scrollwise-scene--finale' : ''; ?>"
                data-scrollwise-scene="<?php echo esc_attr($scene[0]); ?>"
                data-scene-index="<?php echo esc_attr((string) $index); ?>"
                data-scene-src="<?php echo esc_url($image); ?>"
                data-card-align="<?php echo esc_attr($index % 2 === 0 ? 'start' : 'end'); ?>"
                aria-labelledby="<?php echo esc_attr($scene[0] . '-title'); ?>"
            >
                <div class="scrollwise-scene__story">
                    <div class="scrollwise-card">
                        <p class="scrollwise-card__eyebrow">
                            ARANDI / <?php echo esc_html(sprintf('%02d', $index + 1)); ?>
                        </p>
                        <?php if ($index === 0) : ?>
                            <h1 id="<?php echo esc_attr($scene[0] . '-title'); ?>">
                                <?php echo esc_html($scene[1]); ?>
                            </h1>
                        <?php else : ?>
                            <h2 id="<?php echo esc_attr($scene[0] . '-title'); ?>">
                                <?php echo esc_html($scene[1]); ?>
                            </h2>
                        <?php endif; ?>
                        <p><?php echo esc_html($scene[2]); ?></p>
                        <?php if ($is_last) : ?>
                            <a class="scrollwise-cta" href="<?php echo esc_url($contact_url); ?>">
                                <?php echo esc_html($contact_label); ?>
                            </a>
                        <?php endif; ?>
                    </div>
                </div>

                <?php if (!$is_last) : ?>
                    <div
                        class="scrollwise-interlude"
                        data-scrollwise-interlude="<?php echo esc_attr($scene[0]); ?>"
                    >
                        <div class="scrollwise-interlude__panel">
                            <p class="scrollwise-interlude__eyebrow">
                                <?php echo esc_html(sprintf('%02d', $index + 1)); ?> / 10
                            </p>
                            <h3><?php echo esc_html($scene[3]); ?></h3>
                        </div>
                    </div>
                <?php endif; ?>
            </section>
        <?php endforeach; ?>
    </div>
</main>
<?php
get_footer();
