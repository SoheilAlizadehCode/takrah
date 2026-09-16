"use client";

import { useMemo, useState } from "react";
import { Search, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { searchArticles } from "@/data";
import { getCategory } from "@/lib/site";
import { CategoryIcon } from "./category-icon";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate: () => void;
}

export function SearchDialog({ open, onOpenChange, onNavigate }: SearchDialogProps) {
  const [query, setQuery] = useState("");
  const results = useMemo(() => searchArticles(query), [query]);

  // هنگام بستن دیالوگ (Escape، کلیک بیرون یا دکمه بستن) عبارت پاک می‌شود
  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
    if (!nextOpen) setQuery("");
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent aria-describedby={undefined} className="max-w-lg gap-0 p-0 sm:rounded-2xl" dir="rtl">
        <DialogHeader className="border-b border-border/60 p-4 text-start">
          <DialogTitle className="sr-only">جستجو در مقالات تک‌راه</DialogTitle>
          <div className="relative">
            <Search
              className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="جستجوی مقاله، ترفند یا موضوع…"
              className="h-12 rounded-xl pe-10 text-base"
              aria-label="عبارت جستجو"
            />
          </div>
        </DialogHeader>

        <div className="max-h-[50vh] overflow-y-auto p-2">
          {query.trim() === "" ? (
            <p className="p-6 text-center text-sm text-muted-foreground">
              عبارت موردنظر را بنویسید؛ مثلاً «باتری» یا «ChatGPT»
            </p>
          ) : results.length === 0 ? (
            <p className="p-6 text-center text-sm text-muted-foreground">
              نتیجه‌ای برای «{query}» پیدا نشد.
            </p>
          ) : (
            <ul className="space-y-1">
              {results.map((a) => (
                <li key={a.slug}>
                  <a
                    href={`#/article/${a.slug}`}
                    onClick={() => {
                      setQuery("");
                      onNavigate();
                    }}
                    className="flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-muted"
                  >
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <CategoryIcon id={a.category} className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-bold">{a.title}</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {getCategory(a.category).name} · {a.date}
                      </span>
                    </span>
                    <FileText
                      className="ms-auto mt-1 h-4 w-4 shrink-0 text-muted-foreground/50"
                      aria-hidden="true"
                    />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
