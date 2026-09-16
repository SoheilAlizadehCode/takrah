import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center sm:px-6">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Compass className="h-8 w-8" aria-hidden="true" />
      </span>
      <h1 className="mt-6 text-3xl font-extrabold">این مسیر وجود ندارد</h1>
      <p className="mt-3 text-sm leading-8 text-muted-foreground sm:text-base">
        صفحه‌ای که دنبالش بودید پیدا نشد؛ ممکن است آدرس تغییر کرده باشد یا مقاله جابه‌جا شده
        باشد. از جستجو استفاده کنید یا از صفحه اصلی مسیر خود را ادامه دهید.
      </p>
      <Link
        href="/"
        className="mt-8 flex h-11 items-center gap-2 rounded-xl bg-primary px-6 text-sm font-bold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
      >
        بازگشت به صفحه اصلی
      </Link>
    </div>
  );
}
