import type { Article } from "@/lib/blog-types";

// English version of "ادسنس یا یکتانت؟ راهنمای صادقانه درآمد سایت‌های فارسی" — editorial translation
export const EN_ARTICLE: Article = {
  slug: "adsense-vs-yektanet",
  title: "Google AdSense vs Yektanet: An Honest Guide for Persian Sites",
  excerpt:
    "Your site is live and visits are coming — so which ad service pays? We compare Google AdSense and Yektanet across six criteria, with an AdSense acceptance checklist and a hybrid strategy.",
  category: "ai",
  tags: ["AdSense", "Yektanet", "site income", "blogging", "online advertising", "SEO"],
  date: "October 4, 2026",
  readMinutes: 11,
  cover: "/images/covers/adsense-vs-yektanet.png",
  blocks: [
    {
      type: "p",
      text: "The biggest question of every Persian-speaking webmaster after the first visits arrive is exactly this: AdSense or Yektanet? On the internet you find two kinds of answers: either an advertisement for one of the two, or old experiences that no longer fit today's conditions. We at TakRah walk this road step by step ourselves, and this article is the honest summary of that experience and an analysis of the current situation: who should reach for AdSense, who should start with Yektanet from day one, and why we believe the two are not enemies of each other at all. If you do not yet have a site and base content, read 10 Real Ways to Earn Income from AI first and then come to this article.",
    },
    { type: "h2", text: "A quick introduction to both players" },
    {
      type: "p",
      text: "Google AdSense is the largest ad network in the world: advertisers from all over the globe bid in it, Google shows the visitor an ad relevant to the content of each page, and it pays the site's share in dollars. For this reason, AdSense's revenue rates — especially for non-Iranian audiences and profitable topics like technology and finance — are higher than any domestic option. Yektanet, however, is Iran's largest ad network: Iranian advertisers do business in it, your site is approved within a few days, and your income arrives in toman, deposited directly into an Iranian bank account. These are two different worlds: one a vast global market with a hard entrance, the other a smaller domestic market with an easy one.",
    },
    { type: "h2", text: "A comparison across six key criteria" },
    {
      type: "table",
      headers: ["Criterion", "Google AdSense", "Yektanet"],
      rows: [
        ["Site acceptance", "Strict and perfectionist; you may be rejected several times", "Fast and simple; usually a matter of days"],
        ["Revenue rate (CPM)", "Higher; a global market of advertisers", "Lower; a domestic market"],
        ["Currency and payout", "Dollars; Iranians need a currency-receiving solution", "Toman; direct deposit into an Iranian account"],
        ["Acceptance requirements", "Original content, complete pages, compliance with Google's policies", "An active site with acceptable content"],
        ["Target audience of the ads", "Global; excellent for international content", "Iranian; for domestic Persian content"],
        ["Risks", "Account suspension for any small violation", "Lower rates and less control over ad quality"],
      ],
    },
    {
      type: "p",
      text: "Reading this table without analysis is misleading. Yes, AdSense's rate is higher, but “a high rate for a site that never got accepted” equals exactly zero. And yes, Yektanet is easier, but if your traffic is non-Iranian, domestic ads neither pay well nor are relevant to your audience. So the right choice depends on two things: the stage your site is in, and where your audience sits. Our simple rule: a beginner site with Iranian traffic starts with Yektanet and, in parallel, matures toward AdSense; a site with international content or foreign traffic aims for AdSense from day one.",
    },
    { type: "h2", text: "AdSense: how do we get accepted?" },
    {
      type: "p",
      text: "AdSense rejects weak applications — and, well, most first applications are weak. Complete this checklist, then apply:",
    },
    {
      type: "list",
      ordered: true,
      items: [
        "At least twenty to thirty original, long articles (a thousand words and up) that are genuinely useful to the reader — not rushed rewrites; this is exactly why Google demands “valuable content” as an acceptance criterion.",
        "The essential pages complete: About, Contact, Privacy Policy, and Terms; their absence is one of the most common reasons for rejection.",
        "A site with a clear identity: a suitable domain, clean design, proper menus and categories, and a flawless mobile experience.",
        "Organic traffic and a bit of domain age: a site that receives real visits from search and social networks has already proven itself.",
        "Registering the site in Search Console and submitting the sitemap: essential for SEO, and it also shows Google that your site is managed seriously.",
        "After a rejection, find the mistakes, fix them, and apply again; many successful sites were accepted on their second or third application.",
      ],
    },
    { type: "h2", text: "Yektanet: from registering your site to the first toman" },
    {
      type: "p",
      text: "Yektanet's path is shorter: sign up and add the site, wait for approval (usually a few days), and then choose the ad placement among the site-wide banners, the sidebar ads, and in-text ads. Your income accumulates based on impressions and clicks and lands in your profile in toman. A few tips from experience: do not clutter the page with ads — one banner at the top of the page and one in the middle of the content is the balance of income and user experience; and know your highest-traffic pages (ask Search Console) and place ads there intelligently, not uniformly everywhere.",
    },
    {
      type: "tip",
      title: "The hybrid strategy we chose",
      text: "You do not have to choose only one. Our suggested pattern: until your AdSense approval arrives, keep Yektanet active so your visits are not wasted; after the AdSense approval, show the global ads to your non-Iranian audience and keep part of the ad spaces for Yektanet. Just one golden rule: keep the number of ad units low — user experience is your long-term capital, and a site crammed with ads is punished both by search and by the audience's heart.",
    },
    { type: "h2", text: "Realistic expectations: how much income?" },
    {
      type: "p",
      text: "Let us do some rough math so that big dreams do not block our view. Ad income is traffic multiplied by the display rate; a site with a few thousand monthly visits — with AdSense or with Yektanet — will earn about the price of one meal, and that is completely normal. The game becomes interesting where monthly visits reach the tens of thousands and the site's topic is profitable; that is where the difference between AdSense and Yektanet turns into meaningful numbers too. The more important point: ads are only the base layer of a good site's income, not its whole building. Affiliate links (such as recommending products with a partner link), sponsored posts, and finally your own product — the one we opened up completely in the digital products with AI article — are the next layers of income for a serious blog. Combining these layers is what turns a hobby into a business.",
    },
    { type: "h2", text: "Five common mistakes that burn accounts" },
    {
      type: "list",
      items: [
        "Applying to AdSense with ten weak articles: applying too early only burns your confidence; complete the checklist above first.",
        "Clicking your own ads and encouraging others to click: the fastest route to permanent account suspension; Google recognizes the pattern of unnatural clicks better than anyone.",
        "Excessive, intrusive ads: pop-ups, jumping banners, and an ad in the middle of every paragraph; the user flees, and so does your search ranking.",
        "Copied or shallowly rewritten content: poison both for AdSense acceptance and for search ranking; no ad network invests in a worthless site.",
        "Deciding without data: without Search Console and analytics, you do not know where your audience comes from or what it wants; running ads without data is a shot in the dark.",
      ],
    },
    {
      type: "quote",
      text: "Ads are the income of your traffic; the audience's trust is the income of the site's entire lifetime. Never pay for the first with the second.",
    },
    {
      type: "p",
      text: "Our conclusion is simple: Yektanet is the starting road, AdSense is the growth destination, and the two complement each other rather than compete. Build your site seriously, publish content in depth, gather data, and add income layer by layer — exactly the road TakRah itself walks and writes about uncensored here. For the big picture, read 10 Real Ways to Earn Income from AI, the five-path comparison, and the guide to AI income in Iran, in that order. Which service does your site work with now, and what experience have you had? Write in the comments — your experience might be exactly the answer to someone else's question.",
    },
  ],
};
