import { permanentRedirect } from "next/navigation";

import { resolveLanguage } from "@/lib/pageMetadata";

type Props = { searchParams?: Promise<{ lang?: string }> | { lang?: string } };

export default async function KnowledgePage({ searchParams }: Props) {
    const lang = await resolveLanguage(searchParams);
    permanentRedirect(`/articles?lang=${lang}`);
}
