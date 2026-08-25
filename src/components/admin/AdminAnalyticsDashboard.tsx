"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { BarChart3, MousePointer2, Send, Users } from "lucide-react";

import { AdminCard } from "./AdminCard";
import { AdminStatCard } from "./AdminStatCard";

type Summary = { days: number; pageViews: number; sessions: number; uniqueVisitors: number; submissions: number; conversionRate: number; topPages: Array<{ key: string; count: number }>; sources: Array<{ key: string; count: number }>; devices: Array<{ key: string; count: number }> };
type Envelope<T> = { ok: boolean; data?: T; error?: { message?: string } };

async function load(days: number) { const response = await fetch(`/api/cms/analytics?days=${days}`, { cache: "no-store" }); const body = await response.json() as Envelope<Summary>; if (!response.ok || !body.ok || !body.data) throw new Error(body.error?.message ?? "Unable to load analytics."); return body.data; }
function Breakdown({ title, items }: { title: string; items: Array<{ key: string; count: number }> }) { const max = Math.max(...items.map((item) => item.count), 1); return <section><h2 className="text-sm font-semibold text-foreground">{title}</h2><ul className="mt-3 space-y-2">{items.length ? items.map((item) => <li key={item.key} className="grid grid-cols-[minmax(0,1fr)_3rem] items-center gap-3 text-sm"><span className="truncate">{item.key}</span><span className="text-end tabular-nums text-muted-foreground">{item.count}</span><span className="col-span-2 h-2 overflow-hidden rounded-full bg-muted"><span className="block h-full rounded-full bg-primary" style={{ width: `${(item.count / max) * 100}%` }} /></span></li>) : <li className="text-sm text-muted-foreground">No data yet.</li>}</ul></section>; }

export function AdminAnalyticsDashboard() {
    const [days, setDays] = useState(30);
    const query = useQuery({ queryKey: ["analytics", days], queryFn: () => load(days) });
    if (query.isLoading) return <p className="text-sm text-muted-foreground">Loading analytics…</p>;
    if (query.isError || !query.data) return <p role="alert" className="text-sm text-destructive">{query.error?.message ?? "Analytics could not be loaded."}</p>;
    const data = query.data;
    return <div className="space-y-4"><label className="inline-grid gap-1 text-sm font-medium">Report range<select value={days} onChange={(event) => setDays(Number(event.target.value))} className="h-10 rounded-xl border border-border/70 bg-background px-3 text-sm"><option value={7}>Last 7 days</option><option value={30}>Last 30 days</option><option value={90}>Last 90 days</option></select></label><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><AdminStatCard label="Unique visitors" value={data.uniqueVisitors.toLocaleString()} hint={`Last ${data.days} days`} icon={<Users className="size-5" />} /><AdminStatCard label="Page views" value={data.pageViews.toLocaleString()} hint={`${data.sessions.toLocaleString()} sessions`} icon={<MousePointer2 className="size-5" />} /><AdminStatCard label="Contact requests" value={data.submissions.toLocaleString()} hint={`${data.conversionRate}% per session`} icon={<Send className="size-5" />} /><AdminStatCard label="Tracking" value="Consent" hint="First-party only" icon={<BarChart3 className="size-5" />} /></div><div className="grid gap-4 lg:grid-cols-3"><AdminCard title="Top pages" description={`Page views in the selected ${data.days}-day window`}><Breakdown title="Routes" items={data.topPages} /></AdminCard><AdminCard title="Acquisition" description="Classified from referral host only"><Breakdown title="Sources" items={data.sources} /></AdminCard><AdminCard title="Devices" description="Aggregated user-agent category"><Breakdown title="Categories" items={data.devices} /></AdminCard></div></div>;
}
