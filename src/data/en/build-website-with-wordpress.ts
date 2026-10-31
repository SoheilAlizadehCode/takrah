import type { Article } from "@/lib/blog-types";

// English version of the Persian article "build-website-with-wordpress" — editorial translation
export const EN_ARTICLE: Article = {
  slug: "build-website-with-wordpress",
  title: "Build a Website With WordPress: A Step-by-Step No-Code Guide",
  excerpt:
    "You do not need to code to build a website. WordPress makes it easy — this step-by-step guide walks you from domain and hosting to publishing your first post.",
  category: "web-tools",
  tags: ["wordpress", "website building", "domain", "hosting", "CMS"],
  date: "June 2, 2026",
  readMinutes: 9,
  cover: "/images/covers/wordpress.png",
  blocks: [
    {
      type: "p",
      text: "The dream of having your own website no longer requires programming knowledge. More than 40 percent of all websites in the world — from personal blogs to large stores — are built with a system called WordPress: a free, open-source platform that has made building and managing a site possible for everyone. Whether you want a site for your business, plan to start blogging, or are even thinking of earning income from content, this step-by-step guide is exactly for you — no confusing jargon, with everything explained from the first choice to publishing your first post.",
    },
    { type: "h2", text: "What is WordPress, and why does everyone use it?" },
    {
      type: "p",
      text: "WordPress is a “content management system”, or CMS: software that lets you build a site, publish content, and change its appearance without writing a single line of code. Imagine being handed a ready building where all you have to do is paint the walls and arrange the furniture. The three main reasons for WordPress’s popularity are that it is free and open source, its extraordinary flexibility (thousands of ready themes and plugins for every need), and its huge user community — meaning a ready solution exists for almost any problem. Important note: WordPress comes in two versions: WordPress.com (a ready hosting service) and the self-hosted WordPress that you install on your own hosting. This guide covers the self-hosted version, which offers full flexibility and is what professional sites use.",
    },
    { type: "h2", text: "Step one: domain and hosting — the land and the deed of your building" },
    {
      type: "p",
      text: "You need two things before starting. First, a domain: your site’s address, such as example.ir, bought annually for a small fee from local or global domain registrars (.ir is Iran’s country extension). Second, hosting: space on a server where your site’s files are stored — like the land your building stands on. Iranian hosting providers give better speed for a domestic audience and make payment in rial easy, while foreign hosts suit an international audience better. To start, an affordable shared host with a simple control panel is enough, and you can upgrade whenever your traffic grows. Follow three principles when choosing a domain: short and memorable, relevant to your site’s topic, and — if possible — with the .ir extension for an Iranian audience or .com for a global one.",
    },
    { type: "h2", text: "Step two: installing WordPress in five minutes" },
    {
      type: "p",
      text: "The good news is that almost every hosting company offers automatic WordPress installation. After buying hosting, log into your control panel, find the “Quick Install” or “Softaculous” section, choose WordPress, and enter your domain, site name, admin username, and a strong password. A few minutes later your site is ready: visiting yoursite.ir/wp-admin gives you access to the dashboard, the place from which all site work is done. First task after logging in: under Settings, enter the site title and short description, and set Permalinks to “Post name” so that page addresses are optimized for search engines.",
    },
    { type: "h2", text: "Step three: choosing a theme — your site’s face" },
    {
      type: "p",
      text: "The theme determines your site’s appearance and layout, and fortunately thousands of free and paid themes exist. From the dashboard, open Appearance, then Themes, and click “Add New Theme” to open the store of free themes. Four criteria matter when choosing: speed and lightness (cluttered themes slow the site down), mobile friendliness (most visits come from phones), regular updates from the developer, and compatibility with the WordPress block editor. Themes like Astra, GeneratePress, and Kadence are among the most popular lightweight, fast options. After installing, the “Customize” tool lets you change the logo, colors, and fonts. Important advice: drop the theme obsession — a few simple tweaks to a light, fast theme beat hours of hopping between themes.",
    },
    { type: "h2", text: "Step four: essential plugins" },
    {
      type: "p",
      text: "Plugins are like phone apps: each one adds a new capability to your site. You are faced with tens of thousands of free plugins in the WordPress repository, but to start you need only a few. Golden rule: less is more — every extra plugin can slow the site down and create security headaches.",
    },
    {
      type: "list",
      items: [
        "An SEO plugin such as Rank Math or Yoast SEO: optimizing pages for search engines, generating a sitemap, and controlling how the site appears in Google — nearly the most essential plugin any site can have",
        "A security plugin such as Wordfence: protection against common attacks, a firewall, and malware scanning",
        "A caching plugin such as WP Fastest Cache or LiteSpeed Cache: multiplying page-load speed by caching pages",
        "A form builder such as Contact Form 7 or WPForms: creating a contact form in minutes",
        "A backup plugin such as UpdraftPlus: automatic scheduled backups of the whole site — permanent peace of mind",
      ],
    },
    {
      type: "tip",
      title: "Important note",
      text: "Install plugins only from the official WordPress repository or reputable stores, and always keep them updated. Outdated and nulled plugins (pirated copies not distributed through the official site) are the most common way attackers break into WordPress sites.",
    },
    { type: "h2", text: "Step five: structure and content — where value is built" },
    {
      type: "p",
      text: "Before publishing your first post, set up the site’s basic structure. Create the essential static pages: home, about us, contact us, and — if needed — services or products. Then define your post categories; for an educational site, for example: tutorials, news, and tool reviews. A good category structure gives visitors a better experience and helps Google understand what your site is about. As for content, the golden rule is this: ten detailed, accurate, valuable articles beat a hundred short, hollow ones. Every article should answer a real question, have a clear structure with headings, and include relevant images. A regular weekly publishing rhythm matters more than dropping thirty articles in a single week; Google favors sites that are alive and active.",
    },
    { type: "h2", text: "Step six: basic SEO tips for a right start" },
    {
      type: "list",
      ordered: true,
      items: [
        "Register your site in Google Search Console and submit the sitemap generated by your SEO plugin so indexing happens faster.",
        "Define one target keyword for each article and work it naturally into the title, URL, meta description, and a few places in the text; avoid artificial repetition.",
        "Compress images before uploading and write alt text for each one; this raises speed and brings traffic from image search.",
        "Link related articles to each other; internal linking is one of the most powerful free SEO tools.",
        "Measure your site’s speed with Google’s PageSpeed Insights and fix the problems it reports.",
        "Be patient; SEO results usually appear after three to six months of consistent activity. Those who quit in the second month never see the results.",
      ],
    },
    { type: "h2", text: "Costs and realistic expectations" },
    {
      type: "p",
      text: "Let us be honest about money. WordPress itself is free, but the domain and hosting cost money — a reasonable yearly amount depending on quality and provider, roughly the cost of one family meal per month. Free themes and plugins are completely enough to start; buy premium versions only when the site’s growth truly demands them. The biggest investment you will make is not money but time and consistency. A site that publishes two quality articles a month will, after a year, own a valuable asset — whether for a personal brand, a business, or income from ads and brand partnerships.",
    },
    { type: "h2", text: "Wrap-up" },
    {
      type: "p",
      text: "Building a website with WordPress was once specialists’ work; today it takes an afternoon and a little curiosity. Let us recap the path: buy a domain and hosting, install WordPress, pick a lightweight theme, install the five essential plugins, set up your page structure, and publish your first valuable article. Care about SEO from day one and publish consistently. Your site is a garden: planting happens on day one, but the harvest comes in later seasons. If you hit a snag during installation and setup, the TakRah comments and contact channels are always open for your questions.",
    },
  ],
};
