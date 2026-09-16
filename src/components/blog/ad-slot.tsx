import { siteConfig } from "@/lib/site";

interface AdSlotProps {
  /** شناسه یکتای جایگاه تبلیغ برای ردیابی */
  slotKey: string;
  /** فرم جایگاه: افقی (بنر پهن)، مربعی یا درون‌متنی */
  format?: "horizontal" | "square" | "inline";
  className?: string;
}

/**
 * جایگاه تبلیغات گوگل ادسنس.
 * اگر siteConfig.adsenseClientId پر شده باشد، واحد واقعی ادسنس رندر می‌شود؛
 * در غیر این صورت یک جای‌نگهدار زیبا و کم‌ارتفاع نمایش داده می‌شود.
 */
export function AdSlot({ slotKey, format = "horizontal", className = "" }: AdSlotProps) {
  const clientId = siteConfig.adsenseClientId;

  const heights: Record<string, string> = {
    horizontal: "min-h-[110px]",
    square: "min-h-[260px]",
    inline: "min-h-[90px]",
  };

  if (clientId) {
    return (
      <div className={`my-8 ${className}`}>
        <ins
          className="adsbygoogle block"
          style={{ display: "block" }}
          data-ad-client={clientId}
          data-ad-slot={slotKey}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    );
  }

  return (
    <div
      aria-hidden="true"
      className={`my-8 flex ${heights[format]} w-full flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border/80 bg-muted/40 text-center ${className}`}
    >
      <span className="text-xs font-medium text-muted-foreground/70">فضای تبلیغاتی</span>
      <span className="text-[10px] text-muted-foreground/50">محل نمایش تبلیغات گوگل ادسنس</span>
    </div>
  );
}
