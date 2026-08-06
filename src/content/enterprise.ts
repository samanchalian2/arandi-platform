import type { Language } from "./company";

export type EnterpriseContentModel = {
    navigation: {
        home: string;
        company: string;
        services: string;
        solutions: string;
        industries: string;
        projects: string;
        contact: string;
    };
    pages: {
        company: {
            metadata: { title: string; description: string };
            breadcrumbLabel: string;
            hero: {
                badge: string;
                title: string;
                description: string;
                primaryAction: string;
                secondaryAction: string;
            };
            overview: { eyebrow: string; title: string; description: string; highlights: string[] };
            missionVision: { eyebrow: string; title: string; missionTitle: string; missionText: string; visionTitle: string; visionText: string };
            coreValues: { eyebrow: string; title: string; values: Array<{ title: string; description: string }> };
            whyArandi: { eyebrow: string; title: string; points: string[] };
            cta: { eyebrow: string; title: string; description: string; action: string };
        };
        services: {
            metadata: { title: string; description: string };
            breadcrumbLabel: string;
            hero: { badge: string; title: string; description: string; primaryAction: string; secondaryAction: string };
            section: { eyebrow: string; title: string; description: string };
            cards: Array<{ id: string; label: string; title: string; summary: string }>;
            cta: { eyebrow: string; title: string; description: string; action: string };
        };
        solutions: {
            metadata: { title: string; description: string };
            breadcrumbLabel: string;
            hero: { badge: string; title: string; description: string; primaryAction: string; secondaryAction: string };
            catalog: { eyebrow: string; title: string; description: string; cards: Array<{ id: string; title: string; summary: string; outcome: string }> };
            delivery: { eyebrow: string; title: string; steps: Array<{ key: string; label: string; text: string }> };
            cta: { eyebrow: string; title: string; description: string; action: string };
        };
        industries: {
            metadata: { title: string; description: string };
            breadcrumbLabel: string;
            hero: { badge: string; title: string; description: string; primaryAction: string; secondaryAction: string };
            section: { eyebrow: string; title: string; description: string; cards: Array<{ id: string; title: string; summary: string }> };
            cta: { eyebrow: string; title: string; description: string; action: string };
        };
        projects: {
            metadata: { title: string; description: string };
            breadcrumbLabel: string;
            hero: { badge: string; title: string; description: string; primaryAction: string; secondaryAction: string };
            section: { eyebrow: string; title: string; description: string; cards: Array<{ id: string; title: string; summary: string; impact: string }> };
            cta: { eyebrow: string; title: string; description: string; action: string };
        };
        contact: {
            metadata: { title: string; description: string };
            breadcrumbLabel: string;
            hero: { badge: string; title: string; description: string };
            methods: { eyebrow: string; title: string; description: string; items: Array<{ key: string; label: string; note: string }> };
            office: {
                eyebrow: string;
                title: string;
                businessHoursTitle: string;
                businessHoursValue: string;
                responseTimeTitle: string;
                responseTimeValue: string;
            };
            form: {
                eyebrow: string;
                title: string;
                description: string;
                labels: {
                    fullName: string;
                    workEmail: string;
                    organization: string;
                    topic: string;
                    message: string;
                };
                placeholders: {
                    fullName: string;
                    workEmail: string;
                    organization: string;
                    topic: string;
                    message: string;
                };
                note: string;
            };
            cta: { eyebrow: string; title: string; description: string; action: string };
        };
    };
};

const enterpriseContent: Record<Language, EnterpriseContentModel> = {
    en: {
        navigation: {
            home: "Home",
            company: "Company",
            services: "Services",
            solutions: "Solutions",
            industries: "Industries",
            projects: "Projects",
            contact: "Contact",
        },
        pages: {
            company: {
                metadata: {
                    title: "Company",
                    description: "Overview of Arandi Bonyan positioning, mission, and enterprise collaboration model.",
                },
                breadcrumbLabel: "Company",
                hero: {
                    badge: "Enterprise Profile",
                    title: "About Arandi Bonyan",
                    description: "Arandi Bonyan partners with enterprise teams to translate strategy into operational execution through technology, data, and modernization programs.",
                    primaryAction: "Contact us",
                    secondaryAction: "Explore services",
                },
                overview: {
                    eyebrow: "Company Overview",
                    title: "Arandi Bonyan at a glance",
                    description: "We combine advisory depth and delivery capability to support complex enterprise transformation journeys.",
                    highlights: [
                        "Business-value orientation with measurable outcomes",
                        "Cross-functional delivery across strategy, technology, and operations",
                        "Phased execution model that balances speed and governance",
                    ],
                },
                missionVision: {
                    eyebrow: "Mission and Vision",
                    title: "Our strategic direction",
                    missionTitle: "Mission",
                    missionText: "Empower organizations to make better decisions and execute faster through reliable technology and data-driven capabilities.",
                    visionTitle: "Vision",
                    visionText: "Become a trusted regional enterprise partner for digital modernization, intelligent operations, and sustainable growth.",
                },
                coreValues: {
                    eyebrow: "Core Values",
                    title: "Principles that guide our delivery",
                    values: [
                        { title: "Accountability", description: "Commitment to quality outcomes, delivery discipline, and transparent communication." },
                        { title: "Practical Innovation", description: "Using modern technology to solve business-critical problems with real impact." },
                        { title: "Partnership", description: "Working alongside client teams to build long-term capability and ownership." },
                        { title: "Security and Governance", description: "Applying strong governance and security standards across every engagement." },
                    ],
                },
                whyArandi: {
                    eyebrow: "Why Arandi",
                    title: "Why enterprise teams choose us",
                    points: [
                        "Strategy-to-execution operating model",
                        "Domain and technical expertise in industrial and public sectors",
                        "Delivery approach optimized for risk control and measurable value",
                    ],
                },
                cta: {
                    eyebrow: "Next Step",
                    title: "Start with one focused business priority",
                    description: "In a short discovery session, we align on current-state realities and define an actionable roadmap.",
                    action: "Book a discovery call",
                },
            },
            services: {
                metadata: {
                    title: "Services",
                    description: "Enterprise service portfolio across AI, software, analytics, cloud, and transformation delivery.",
                },
                breadcrumbLabel: "Services",
                hero: {
                    badge: "Enterprise Services",
                    title: "Core services for enterprise transformation",
                    description: "Our services are designed to connect strategic goals with practical delivery across mission-critical initiatives.",
                    primaryAction: "Review solutions",
                    secondaryAction: "Contact",
                },
                section: {
                    eyebrow: "Service Portfolio",
                    title: "Specialized service areas",
                    description: "Capabilities structured for organizations seeking faster execution, stronger governance, and measurable impact.",
                },
                cards: [
                    { id: "ai", label: "Artificial Intelligence", title: "Artificial Intelligence", summary: "Intelligent assistant design, process automation, and decision-support models for enterprise teams." },
                    { id: "software", label: "Software Development", title: "Software Development", summary: "Secure and scalable software platforms with maintainable architecture and delivery standards." },
                    { id: "enterprise-solutions", label: "Enterprise Solutions", title: "Enterprise Solutions", summary: "Integrated business solutions to optimize operations, resource planning, and collaboration workflows." },
                    { id: "data-analytics", label: "Data & Analytics", title: "Data & Analytics", summary: "Data platform design, executive dashboards, and analytical models for insight-led management." },
                    { id: "cloud-infra", label: "Cloud & Infrastructure", title: "Cloud & Infrastructure", summary: "Infrastructure modernization, cloud migration, and resilient platform engineering for growth." },
                    { id: "digital-transformation", label: "Digital Transformation", title: "Digital Transformation", summary: "Transformation roadmaps, change enablement, and enterprise-scale implementation management." },
                ],
                cta: {
                    eyebrow: "Alignment",
                    title: "Select the right service mix for your priorities",
                    description: "We can assess your current state and propose a targeted service plan for near-term and long-term outcomes.",
                    action: "Request service consultation",
                },
            },
            solutions: {
                metadata: {
                    title: "Solutions",
                    description: "Enterprise solutions designed for modernization, operational excellence, and measurable business outcomes.",
                },
                breadcrumbLabel: "Solutions",
                hero: {
                    badge: "Enterprise Solutions",
                    title: "Applied solutions for real enterprise challenges",
                    description: "Solution tracks tailored for complex environments where speed, reliability, and governance all matter.",
                    primaryAction: "View projects",
                    secondaryAction: "Services",
                },
                catalog: {
                    eyebrow: "Solution Catalog",
                    title: "Enterprise solution tracks",
                    description: "Each solution is structured around tangible outcomes to accelerate implementation value.",
                    cards: [
                        { id: "ops-automation", title: "Enterprise Operations Automation", summary: "Automated operational workflows with real-time monitoring and intelligent alerting.", outcome: "Reduced process latency and improved operational throughput" },
                        { id: "executive-insights", title: "Executive Insights Platform", summary: "Unified data and management dashboards for strategic and operational decision support.", outcome: "Faster and more confident executive decision-making" },
                        { id: "asset-performance", title: "Industrial Asset Performance", summary: "Predictive maintenance and reliability analytics for equipment-intensive environments.", outcome: "Lower unplanned downtime and stronger asset reliability" },
                        { id: "digital-governance", title: "Digital Transformation Governance", summary: "Governance structures to align delivery priorities, risk controls, and cross-functional execution.", outcome: "Higher alignment between business, technology, and leadership" },
                    ],
                },
                delivery: {
                    eyebrow: "Delivery Model",
                    title: "Standard implementation pathway",
                    steps: [
                        { key: "discover", label: "1. Discovery and Assessment", text: "Assess current-state constraints, opportunities, and success criteria." },
                        { key: "design", label: "2. Solution Design", text: "Define architecture, rollout plan, and operating governance model." },
                        { key: "scale", label: "3. Execute and Scale", text: "Deliver in phases, transfer capability, and expand value across teams." },
                    ],
                },
                cta: {
                    eyebrow: "Planning",
                    title: "Select the right solution track for your enterprise",
                    description: "In a focused planning session, we map your priorities to a practical delivery route.",
                    action: "Schedule a planning session",
                },
            },
            industries: {
                metadata: {
                    title: "Industries",
                    description: "Industry-focused modernization support across energy, manufacturing, government, and smart city ecosystems.",
                },
                breadcrumbLabel: "Industries",
                hero: {
                    badge: "Industry Focus",
                    title: "Industry-specific transformation pathways",
                    description: "We tailor architecture and delivery approaches to each sector's regulatory, operational, and technical realities.",
                    primaryAction: "See solutions",
                    secondaryAction: "Projects",
                },
                section: {
                    eyebrow: "Sectors",
                    title: "Priority industry verticals",
                    description: "Sector expertise helps calibrate governance, risk controls, and implementation priorities.",
                    cards: [
                        { id: "oil-gas", title: "Oil & Gas", summary: "Operational intelligence programs for upstream and downstream value chains." },
                        { id: "petrochemical", title: "Petrochemical", summary: "Process optimization and data-driven quality management for production environments." },
                        { id: "energy", title: "Energy", summary: "Energy management modernization, demand forecasting, and grid resilience initiatives." },
                        { id: "manufacturing", title: "Manufacturing", summary: "Digital manufacturing solutions for performance, reliability, and operational visibility." },
                        { id: "government", title: "Government", summary: "Public service transformation with integrated data and service governance models." },
                        { id: "smart-cities", title: "Smart Cities", summary: "Data-enabled urban solutions for mobility, utilities, and citizen experience." },
                    ],
                },
                cta: {
                    eyebrow: "Industry Alignment",
                    title: "Define your sector-specific transformation path",
                    description: "A focused assessment helps identify practical opportunities and implementation priorities.",
                    action: "Request industry assessment",
                },
            },
            projects: {
                metadata: {
                    title: "Projects",
                    description: "Representative enterprise project showcases with measurable outcomes and implementation impact.",
                },
                breadcrumbLabel: "Projects",
                hero: {
                    badge: "Project Overview",
                    title: "Enterprise project showcase",
                    description: "Sample engagements delivered with measurable impact across operations, infrastructure, and digital services.",
                    primaryAction: "Browse industries",
                    secondaryAction: "Solutions",
                },
                section: {
                    eyebrow: "Projects",
                    title: "Featured enterprise initiatives",
                    description: "Representative delivery placeholders across multiple sectors and operating contexts.",
                    cards: [
                        { id: "energy-ops-center", title: "Energy Operations Monitoring Platform", summary: "Integrated operations center for KPI visibility and incident management.", impact: "25% faster response to critical operational events" },
                        { id: "smart-maintenance", title: "Industrial Smart Maintenance Program", summary: "Predictive maintenance workflows for high-value equipment fleets.", impact: "18% reduction in unplanned downtime" },
                        { id: "city-command", title: "Data-Driven City Command Center", summary: "Unified data operations for mobility, utilities, and public service coordination.", impact: "Improved cross-unit municipal coordination" },
                        { id: "gov-digital-services", title: "Government Digital Service Modernization", summary: "Redesigned citizen service journeys and integrated digital channels.", impact: "Shorter service cycles and improved public satisfaction" },
                    ],
                },
                cta: {
                    eyebrow: "Delivery",
                    title: "Start your next initiative with a clear delivery plan",
                    description: "Align scope, risks, and success metrics before launching your next program.",
                    action: "Plan your project",
                },
            },
            contact: {
                metadata: {
                    title: "Contact",
                    description: "Professional contact channels for enterprise inquiries, planning sessions, and partnership discussions.",
                },
                breadcrumbLabel: "Contact",
                hero: {
                    badge: "Enterprise Contact",
                    title: "Connect with us to start your engagement",
                    description: "Use the channels below to align requirements, discuss priorities, and plan your delivery roadmap.",
                },
                methods: {
                    eyebrow: "Contact Channels",
                    title: "Ways to reach our team",
                    description: "Our team is available for initial coordination and enterprise inquiry support.",
                    items: [
                        { key: "email", label: "Email", note: "For discovery calls, project briefs, and RFP submissions" },
                        { key: "phone", label: "Phone", note: "For direct coordination with the business development team" },
                        { key: "location", label: "Head Office", note: "On-site meetings available by prior appointment" },
                    ],
                },
                office: {
                    eyebrow: "Office Information",
                    title: "Availability and coordination",
                    businessHoursTitle: "Business hours",
                    businessHoursValue: "Sunday to Wednesday, 9:00 AM to 5:00 PM",
                    responseTimeTitle: "Initial response window",
                    responseTimeValue: "Within one business day for new inquiries",
                },
                form: {
                    eyebrow: "Contact Form",
                    title: "Engagement request form",
                    description: "This is a UI-only form layout in the current phase and does not submit to a backend.",
                    labels: {
                        fullName: "Full name",
                        workEmail: "Work email",
                        organization: "Organization",
                        topic: "Request topic",
                        message: "Project brief",
                    },
                    placeholders: {
                        fullName: "Your full name",
                        workEmail: "example@company.com",
                        organization: "Company name",
                        topic: "Example: Digital transformation",
                        message: "Share your goals, constraints, and expected timeline",
                    },
                    note: "This form is currently a UI layout only and does not submit data in this phase.",
                },
                cta: {
                    eyebrow: "Get Started",
                    title: "Plan your first conversation around one key challenge",
                    description: "Share your context and our team will prepare a session aligned with your strategic and delivery priorities.",
                    action: "Send inquiry",
                },
            },
        },
    },
    fa: {
        navigation: {
            home: "خانه",
            company: "شرکت",
            services: "خدمات",
            solutions: "راهکارها",
            industries: "صنایع",
            projects: "پروژه ها",
            contact: "تماس",
        },
        pages: {
            company: {
                metadata: {
                    title: "شرکت",
                    description: "معرفی آرندی بنیان، ماموریت، چشم انداز، و مدل همکاری سازمانی.",
                },
                breadcrumbLabel: "شرکت",
                hero: {
                    badge: "پروفایل سازمانی",
                    title: "درباره آرندی بنیان",
                    description: "آرندی بنیان شریک تحول سازمانی است که با تمرکز بر فناوری، داده، و اجرا، مسیر رشد پایدار کسب وکارها را طراحی و پیاده سازی می کند.",
                    primaryAction: "تماس با ما",
                    secondaryAction: "مشاهده خدمات",
                },
                overview: {
                    eyebrow: "نمای کلی شرکت",
                    title: "نگاهی کوتاه به آرندی بنیان",
                    description: "ما با ترکیب بینش صنعت و توان اجرای فنی، سازمان ها را از برنامه ریزی تا نتیجه همراهی می کنیم.",
                    highlights: [
                        "تمرکز بر ارزش تجاری و خروجی قابل اندازه گیری",
                        "همکاری بین واحدی در راهبرد، فناوری، و عملیات",
                        "اجرای مرحله ای با توازن سرعت و حاکمیت",
                    ],
                },
                missionVision: {
                    eyebrow: "ماموریت و چشم انداز",
                    title: "جهت گیری راهبردی ما",
                    missionTitle: "ماموریت",
                    missionText: "توانمندسازی سازمان ها برای تصمیم گیری بهتر و اجرای سریع تر از طریق راهکارهای فناوری و داده محور.",
                    visionTitle: "چشم انداز",
                    visionText: "تبدیل شدن به شریک قابل اتکای سازمان ها در مسیر نوسازی دیجیتال، هوشمندسازی عملیات، و رشد پایدار.",
                },
                coreValues: {
                    eyebrow: "ارزش های بنیادین",
                    title: "اصولی که با آن اجرا می کنیم",
                    values: [
                        { title: "مسئولیت پذیری", description: "تعهد به کیفیت خروجی، انضباط اجرا، و شفافیت در ارتباط." },
                        { title: "نوآوری کاربردی", description: "استفاده از فناوری نو برای حل مسائل واقعی و اولویت دار." },
                        { title: "مشارکت", description: "همکاری نزدیک با تیم مشتری برای توسعه توانمندی های پایدار داخلی." },
                        { title: "امنیت و حاکمیت", description: "رعایت اصول امنیت اطلاعات و انضباط حاکمیتی در تمام پروژه ها." },
                    ],
                },
                whyArandi: {
                    eyebrow: "چرا آرندی",
                    title: "دلایل انتخاب آرندی بنیان",
                    points: [
                        "مدل عملیاتی از راهبرد تا اجرا",
                        "تخصص ترکیبی در حوزه های صنعتی و فناوری",
                        "رویکرد تحویل با تمرکز بر کنترل ریسک و ارزش قابل سنجش",
                    ],
                },
                cta: {
                    eyebrow: "گام بعدی",
                    title: "گفتگو را از یک اولویت کلیدی آغاز کنید",
                    description: "در یک جلسه کوتاه، وضعیت فعلی، فرصت های کلیدی، و نقشه اقدام عملی را مشخص می کنیم.",
                    action: "رزرو جلسه",
                },
            },
            services: {
                metadata: {
                    title: "خدمات",
                    description: "سبد خدمات سازمانی آرندی در حوزه هوش مصنوعی، نرم افزار، داده، ابر، و تحول دیجیتال.",
                },
                breadcrumbLabel: "خدمات",
                hero: {
                    badge: "خدمات سازمانی",
                    title: "خدمات کلیدی برای تحول سازمان",
                    description: "خدمات آرندی با نگاه نتیجه محور طراحی شده تا نیاز راهبردی را به اجرای عملی متصل کند.",
                    primaryAction: "بررسی راهکارها",
                    secondaryAction: "تماس",
                },
                section: {
                    eyebrow: "سبد خدمات",
                    title: "حوزه های تخصصی ارائه",
                    description: "قابلیت هایی برای سازمان هایی که به دنبال چابکی بیشتر، حاکمیت دقیق تر، و خروجی ملموس هستند.",
                },
                cards: [
                    { id: "ai", label: "هوش مصنوعی", title: "هوش مصنوعی", summary: "طراحی دستیارهای هوشمند، خودکارسازی فرآیندها، و مدل های پشتیبان تصمیم گیری." },
                    { id: "software", label: "توسعه نرم افزار", title: "توسعه نرم افزار", summary: "توسعه سامانه های امن و مقیاس پذیر با معماری قابل نگهداری در سطح سازمان." },
                    { id: "enterprise-solutions", label: "راهکارهای سازمانی", title: "راهکارهای سازمانی", summary: "راهکارهای یکپارچه برای بهینه سازی عملیات، منابع، و همکاری بین واحدی." },
                    { id: "data-analytics", label: "داده و تحلیل", title: "داده و تحلیل", summary: "ایجاد بستر داده، داشبورد مدیریتی، و مدل های تحلیلی برای تصمیم دقیق تر." },
                    { id: "cloud-infra", label: "ابر و زیرساخت", title: "ابر و زیرساخت", summary: "نوسازی زیرساخت، مهاجرت به ابر، و طراحی پلتفرم های پایدار و توسعه پذیر." },
                    { id: "digital-transformation", label: "تحول دیجیتال", title: "تحول دیجیتال", summary: "طراحی نقشه تحول، مدیریت تغییر، و اجرای برنامه های تحول در مقیاس سازمان." },
                ],
                cta: {
                    eyebrow: "هماهنگی",
                    title: "ترکیب خدمات مناسب سازمان خود را انتخاب کنید",
                    description: "با یک ارزیابی سریع، نقشه خدمات پیشنهادی متناسب با وضعیت فعلی شما ارائه می شود.",
                    action: "درخواست مشاوره خدمات",
                },
            },
            solutions: {
                metadata: {
                    title: "راهکارها",
                    description: "راهکارهای سازمانی برای نوسازی، بهبود عملیات، و دستیابی به نتایج قابل اندازه گیری.",
                },
                breadcrumbLabel: "راهکارها",
                hero: {
                    badge: "راهکارهای سازمانی",
                    title: "راهکارهای کاربردی برای چالش های واقعی سازمان",
                    description: "مسیرهای راهکاری متناسب با محیط های پیچیده که در آن سرعت، پایداری، و حاکمیت اهمیت دارد.",
                    primaryAction: "مشاهده پروژه ها",
                    secondaryAction: "خدمات",
                },
                catalog: {
                    eyebrow: "کاتالوگ راهکار",
                    title: "مسیرهای راهکار سازمانی",
                    description: "هر راهکار با تمرکز بر خروجی ملموس طراحی شده تا ارزش اجرایی سریع تری ایجاد کند.",
                    cards: [
                        { id: "ops-automation", title: "هوشمندسازی عملیات سازمان", summary: "خودکارسازی جریان های عملیاتی با پایش لحظه ای و هشدارهای هوشمند.", outcome: "کاهش تاخیر فرآیندی و افزایش بهره وری عملیاتی" },
                        { id: "executive-insights", title: "پلتفرم بینش مدیریتی", summary: "یکپارچه سازی داده و داشبوردهای تصمیم سازی برای مدیریت ارشد و واحدهای عملیاتی.", outcome: "تصمیم گیری سریع تر و مطمئن تر در سطح مدیریت" },
                        { id: "asset-performance", title: "مدیریت عملکرد دارایی صنعتی", summary: "نگهداری پیش بینانه و تحلیل قابلیت اطمینان برای تجهیزات با اهمیت بالا.", outcome: "کاهش توقفات ناخواسته و افزایش قابلیت اطمینان" },
                        { id: "digital-governance", title: "حاکمیت تحول دیجیتال", summary: "چارچوب های حاکمیتی برای همسوسازی ریسک، اولویت، و اجرای برنامه های نوسازی.", outcome: "همسویی بیشتر بین کسب وکار، فناوری، و مدیریت" },
                    ],
                },
                delivery: {
                    eyebrow: "مدل اجرا",
                    title: "مسیر استاندارد پیاده سازی",
                    steps: [
                        { key: "discover", label: "۱. کشف و ارزیابی", text: "بررسی وضعیت موجود، محدودیت ها، و شاخص های موفقیت." },
                        { key: "design", label: "۲. طراحی راهکار", text: "تعریف معماری، برنامه استقرار، و مدل حاکمیتی اجرا." },
                        { key: "scale", label: "۳. اجرا و توسعه", text: "تحویل مرحله ای، انتقال توانمندی، و توسعه ارزش در سطح سازمان." },
                    ],
                },
                cta: {
                    eyebrow: "برنامه ریزی",
                    title: "راهکار مناسب سازمان خود را انتخاب کنید",
                    description: "در یک جلسه متمرکز، اولویت های شما را به مسیر اجرایی قابل اتکا نگاشت می کنیم.",
                    action: "رزرو جلسه برنامه ریزی",
                },
            },
            industries: {
                metadata: {
                    title: "صنایع",
                    description: "خدمات نوسازی و تحول متناسب با صنایع انرژی، تولید، دولت، و شهر هوشمند.",
                },
                breadcrumbLabel: "صنایع",
                hero: {
                    badge: "تمرکز صنعتی",
                    title: "مسیرهای تحول متناسب با هر صنعت",
                    description: "رویکرد اجرا و معماری را متناسب با واقعیت های عملیاتی، فنی، و مقرراتی هر حوزه تنظیم می کنیم.",
                    primaryAction: "مشاهده راهکارها",
                    secondaryAction: "پروژه ها",
                },
                section: {
                    eyebrow: "حوزه ها",
                    title: "صنایع اولویت دار",
                    description: "تجربه صنعتی به طراحی دقیق تر حاکمیت، ریسک، و اولویت بندی اجرای پروژه کمک می کند.",
                    cards: [
                        { id: "oil-gas", title: "نفت و گاز", summary: "برنامه های هوشمندسازی عملیات برای زنجیره بالادستی و پایین دستی." },
                        { id: "petrochemical", title: "پتروشیمی", summary: "بهینه سازی فرآیند و مدیریت کیفیت مبتنی بر داده در محیط های تولیدی." },
                        { id: "energy", title: "انرژی", summary: "نوسازی مدیریت انرژی، پیش بینی مصرف، و ارتقای تاب آوری شبکه." },
                        { id: "manufacturing", title: "تولید", summary: "راهکارهای تولید دیجیتال برای عملکرد، پایداری، و دیدپذیری عملیاتی." },
                        { id: "government", title: "دولت", summary: "تحول خدمات عمومی با مدل های یکپارچه داده و حاکمیت خدمت." },
                        { id: "smart-cities", title: "شهر هوشمند", summary: "راهکارهای داده محور شهری برای حمل ونقل، زیرساخت، و تجربه شهروندی." },
                    ],
                },
                cta: {
                    eyebrow: "همسوسازی صنعتی",
                    title: "مسیر تحول متناسب با صنعت خود را تعریف کنید",
                    description: "یک ارزیابی متمرکز، فرصت های اجرایی و اولویت های عملی را مشخص می کند.",
                    action: "درخواست ارزیابی صنعتی",
                },
            },
            projects: {
                metadata: {
                    title: "پروژه ها",
                    description: "نمونه پروژه های سازمانی با نتایج قابل اندازه گیری و اثر اجرایی.",
                },
                breadcrumbLabel: "پروژه ها",
                hero: {
                    badge: "نمای پروژه",
                    title: "نمونه پروژه های سازمانی",
                    description: "نمونه هایی از پروژه های اجراشده با تمرکز بر اثر عملیاتی و مقیاس پذیری راهکار.",
                    primaryAction: "مشاهده صنایع",
                    secondaryAction: "راهکارها",
                },
                section: {
                    eyebrow: "پروژه ها",
                    title: "پروژه های شاخص سازمانی",
                    description: "نمونه هایی از تحویل پروژه در صنایع و زمینه های عملیاتی متفاوت.",
                    cards: [
                        { id: "energy-ops-center", title: "پلتفرم پایش عملیات انرژی", summary: "مرکز عملیات یکپارچه برای دیدپذیری شاخص ها و مدیریت رخداد.", impact: "افزایش ۲۵٪ سرعت واکنش به رخدادهای بحرانی" },
                        { id: "smart-maintenance", title: "برنامه نگهداری هوشمند صنعتی", summary: "استقرار جریان نگهداری پیش بینانه برای تجهیزات با اهمیت بالا.", impact: "کاهش ۱۸٪ توقفات برنامه ریزی نشده" },
                        { id: "city-command", title: "مرکز فرمان شهری داده محور", summary: "یکپارچه سازی داده شهری برای مدیریت حوزه های حمل ونقل، انرژی، و خدمات.", impact: "بهبود هماهنگی بین واحدهای عملیاتی شهری" },
                        { id: "gov-digital-services", title: "نوسازی خدمات دیجیتال دولت", summary: "بازطراحی سفر خدمت و ایجاد کانال های دیجیتال یکپارچه برای شهروندان.", impact: "کاهش زمان خدمت و افزایش رضایت کاربران" },
                    ],
                },
                cta: {
                    eyebrow: "تحویل",
                    title: "پروژه بعدی را با برنامه اجرایی روشن آغاز کنید",
                    description: "پیش از شروع، دامنه، ریسک، و شاخص های موفقیت پروژه را همسو می کنیم.",
                    action: "برنامه ریزی پروژه",
                },
            },
            contact: {
                metadata: {
                    title: "تماس",
                    description: "راه های ارتباط حرفه ای برای درخواست های سازمانی، جلسه های برنامه ریزی، و همکاری های آینده.",
                },
                breadcrumbLabel: "تماس",
                hero: {
                    badge: "تماس سازمانی",
                    title: "برای شروع همکاری با ما در ارتباط باشید",
                    description: "از طریق کانال های زیر می توانید نیازمندی ها را مطرح کرده و مسیر اجرای مناسب را برنامه ریزی کنید.",
                },
                methods: {
                    eyebrow: "کانال های ارتباط",
                    title: "روش های ارتباط با تیم",
                    description: "تیم آرندی برای هماهنگی اولیه و پاسخ به درخواست های سازمانی در دسترس است.",
                    items: [
                        { key: "email", label: "ایمیل", note: "برای درخواست جلسه، معرفی پروژه، یا ارسال RFP" },
                        { key: "phone", label: "تلفن", note: "برای هماهنگی مستقیم با تیم توسعه کسب وکار" },
                        { key: "location", label: "دفتر مرکزی", note: "جلسه حضوری با هماهنگی قبلی امکان پذیر است" },
                    ],
                },
                office: {
                    eyebrow: "اطلاعات دفتر",
                    title: "زمان پاسخگویی و هماهنگی",
                    businessHoursTitle: "ساعات کاری",
                    businessHoursValue: "شنبه تا چهارشنبه، ۹:۰۰ تا ۱۷:۰۰",
                    responseTimeTitle: "زمان پاسخ اولیه",
                    responseTimeValue: "کمتر از یک روز کاری برای درخواست های جدید",
                },
                form: {
                    eyebrow: "فرم تماس",
                    title: "فرم درخواست همکاری",
                    description: "این فرم در این مرحله صرفا چیدمان رابط کاربری است و اتصال بک اند ندارد.",
                    labels: {
                        fullName: "نام و نام خانوادگی",
                        workEmail: "ایمیل کاری",
                        organization: "نام سازمان",
                        topic: "موضوع درخواست",
                        message: "شرح نیاز",
                    },
                    placeholders: {
                        fullName: "نام کامل",
                        workEmail: "example@company.com",
                        organization: "نام سازمان",
                        topic: "مثال: تحول دیجیتال",
                        message: "اهداف، محدودیت ها، و بازه زمانی مدنظر را بنویسید",
                    },
                    note: "این فرم در حال حاضر فقط نمای رابط کاربری است و داده ای ارسال نمی کند.",
                },
                cta: {
                    eyebrow: "شروع",
                    title: "گفتگوی اولیه را حول یک چالش کلیدی برنامه ریزی کنید",
                    description: "با ارسال زمینه نیاز، تیم ما جلسه ای متناسب با اولویت های راهبردی و اجرایی شما آماده می کند.",
                    action: "ارسال درخواست",
                },
            },
        },
    },
};

export function getEnterpriseContent(lang?: string | null): EnterpriseContentModel {
    return lang === "fa" ? enterpriseContent.fa : enterpriseContent.en;
}
