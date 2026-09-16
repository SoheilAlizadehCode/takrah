"use client";

import { useCallback, useEffect, useState } from "react";
import { Header } from "@/components/blog/header";
import { Footer } from "@/components/blog/footer";
import { HomeView } from "@/components/blog/home-view";
import { CategoryView } from "@/components/blog/category-view";
import { ArticleView } from "@/components/blog/article-view";
import { StaticPageView } from "@/components/blog/static-pages";
import { SearchDialog } from "@/components/blog/search-dialog";
import { getArticle } from "@/data";
import { categories, getCategory, staticPages, siteConfig, type Route } from "@/lib/site";

const DEFAULT_TITLE = `${siteConfig.name} | ${siteConfig.tagline}`;

/** تبدیل هش آدرس به مسیر داخلی */
function parseHash(): Route {
  const hash = window.location.hash.replace(/^#\/?/, "");
  const [head, ...rest] = hash.split("/");
  const value = decodeURIComponent(rest.join("/"));

  switch (head) {
    case "category":
      if (value && categories.some((c) => c.id === value)) {
        return { name: "category", id: value };
      }
      return { name: "home" };
    case "article":
      if (value && getArticle(value)) {
        return { name: "article", slug: value };
      }
      return { name: "home" };
    case "page":
      if (staticPages.some((p) => p.id === value)) {
        return { name: "page", id: value as (typeof staticPages)[number]["id"] };
      }
      return { name: "home" };
    default:
      return { name: "home" };
  }
}

function routeTitle(route: Route): string {
  switch (route.name) {
    case "home":
      return DEFAULT_TITLE;
    case "category":
      return `${getCategory(route.id).name} | ${siteConfig.name}`;
    case "article": {
      const a = getArticle(route.slug);
      return a ? `${a.title} | ${siteConfig.name}` : DEFAULT_TITLE;
    }
    case "page": {
      const p = staticPages.find((x) => x.id === route.id);
      return p ? `${p.title} | ${siteConfig.name}` : DEFAULT_TITLE;
    }
  }
}

export default function Home() {
  const [route, setRoute] = useState<Route>({ name: "home" });
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const onHashChange = () => {
      const next = parseHash();
      setRoute(next);
      // بازگشت به بالای صفحه هنگام تغییر مسیر
      window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "instant" }));
    };
    onHashChange();
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  // به‌روزرسانی عنوان صفحه برای هر مسیر
  useEffect(() => {
    document.title = routeTitle(route);
  }, [route]);

  const closeSearch = useCallback(() => setSearchOpen(false), []);

  return (
    <div className="flex min-h-screen flex-col">
      <Header onOpenSearch={() => setSearchOpen(true)} />

      <main className="flex-1" id="main-content">
        {route.name === "home" && <HomeView />}
        {route.name === "category" && <CategoryView categoryId={route.id} />}
        {route.name === "article" && (
          <ArticleView article={getArticle(route.slug)!} />
        )}
        {route.name === "page" && <StaticPageView pageId={route.id} />}
      </main>

      <Footer />

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} onNavigate={closeSearch} />
    </div>
  );
}
