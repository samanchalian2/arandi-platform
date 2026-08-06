import Link from "next/link";

export default function NotFoundPage() {
    return (
        <div className="mx-auto flex min-h-[60vh] w-full max-w-4xl flex-col items-center justify-center px-5 py-16 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">404</p>
            <h1 className="mt-4 text-4xl font-semibold text-foreground">Page not found · صفحه پیدا نشد</h1>
            <p className="mt-5 max-w-2xl leading-8 text-muted-foreground">
                The requested page is unavailable or has not been published.
                <span className="mt-2 block">صفحه درخواستی در دسترس نیست یا هنوز منتشر نشده است.</span>
            </p>
            <Link className="mt-8 rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground" href="/">
                Home · صفحه اصلی
            </Link>
        </div>
    );
}
