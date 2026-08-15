import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, Factory, Layers3 } from "lucide-react";

import { Container } from "@/components/layout/Container";
import { SectionReveal } from "@/components/ui/SectionReveal";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { cn } from "@/lib/utils";

type FeaturedProject = {
  id: string;
  title: string;
  summary: string;
  impact: string;
  mediaUrl?: string;
  mediaAlt?: string;
};

type FeaturedProjectsProps = {
  lang: "en" | "fa";
  projects: FeaturedProject[];
  serviceCount: number;
  industryCount: number;
};

export function FeaturedProjects({ lang, projects, serviceCount, industryCount }: FeaturedProjectsProps) {
  const copy = lang === "fa"
    ? {
        eyebrow: "شواهد همکاری",
        title: "نمونه‌هایی از تحویل در محیط‌های واقعی",
        description: "جزئیات هر پروژه از محتوای منتشرشدهٔ سایت خوانده می‌شود و تصویر هر کارت از پنل مدیریت قابل انتخاب و تغییر است.",
        view: "مشاهدهٔ همهٔ پروژه‌ها",
        detail: "مطالعهٔ Case Study",
        signals: [
          { label: "پروژهٔ مستند", value: projects.length, icon: BriefcaseBusiness },
          { label: "توانمندی کلیدی", value: serviceCount, icon: Layers3 },
          { label: "صنعت هدف", value: industryCount, icon: Factory },
        ],
      }
    : {
        eyebrow: "Delivery evidence",
        title: "Selected work in real operating environments",
        description: "Each project is read from published website content, and its card image can be selected or changed in the Admin Media Library.",
        view: "View all projects",
        detail: "Read case study",
        signals: [
          { label: "Documented projects", value: projects.length, icon: BriefcaseBusiness },
          { label: "Core capabilities", value: serviceCount, icon: Layers3 },
          { label: "Target industries", value: industryCount, icon: Factory },
        ],
      };

  return (
    <section className="border-y border-border/70 bg-background" dir={lang === "fa" ? "rtl" : "ltr"}>
      <Container className="ds-section-padding">
        <SectionReveal className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className={cn("max-w-2xl", lang === "fa" ? "text-right" : "text-left")}>
            <p className="ds-eyebrow text-primary">{copy.eyebrow}</p>
            <h2 className="ds-heading-2 mt-4 font-semibold text-foreground">{copy.title}</h2>
            <p className="ds-body-lg mt-5 text-muted-foreground">{copy.description}</p>
          </div>
          <Link href={`/projects?lang=${lang}`} className="inline-flex items-center gap-2 self-start font-semibold text-primary hover:underline lg:self-auto">
            {copy.view}<ArrowRight className="size-4 rtl:rotate-180" />
          </Link>
        </SectionReveal>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {copy.signals.map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-2xl border border-border/70 bg-muted/30 p-5">
              <Icon className="size-5 text-primary" />
              <p className="mt-5 text-3xl font-semibold tracking-tight text-foreground">{value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          {projects.slice(0, 3).map((project) => (
            <SectionReveal key={project.id} className="h-full">
              <SpotlightCard className="group flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-border/70 bg-card shadow-[0_18px_50px_-28px_rgba(15,23,42,0.25)] transition-shadow hover:shadow-[0_24px_70px_-40px_rgba(15,23,42,0.34)]">
                {project.mediaUrl ? (
                  <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                    <Image src={project.mediaUrl} alt={project.mediaAlt ?? project.title} fill sizes="(max-width: 1024px) 100vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                  </div>
                ) : (
                  <div className="flex aspect-[16/7] items-end bg-[linear-gradient(135deg,rgba(14,116,144,0.16),rgba(255,255,255,0.7))] p-5">
                    <span className="rounded-full border border-primary/20 bg-background/70 px-3 py-1.5 text-xs font-semibold text-primary">{project.impact}</span>
                  </div>
                )}
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-xl font-semibold text-foreground">{project.title}</h3>
                  <p className="mt-3 flex-1 text-sm leading-7 text-muted-foreground">{project.summary}</p>
                  <Link href={`/projects/${project.id}?lang=${lang}`} className="mt-6 inline-flex items-center gap-2 font-semibold text-primary hover:underline">
                    {copy.detail}<ArrowRight className="size-4 rtl:rotate-180" />
                  </Link>
                </div>
              </SpotlightCard>
            </SectionReveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
