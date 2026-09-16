"use client";

import { useCallback, useState } from "react";
import { Header } from "./header";
import { SearchDialog } from "./search-dialog";

/**
 * پوسته تعاملی مشترک بین همه صفحات: هدر استیکی + دیالوگ جستجو.
 * در layout روت قرار می‌گیرد تا در تمام مسیرها حفظ شود.
 */
export function SiteChrome() {
  const [searchOpen, setSearchOpen] = useState(false);
  const closeSearch = useCallback(() => setSearchOpen(false), []);

  return (
    <>
      <Header onOpenSearch={() => setSearchOpen(true)} />
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} onNavigate={closeSearch} />
    </>
  );
}
