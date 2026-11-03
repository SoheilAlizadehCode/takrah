import type { Article } from "@/lib/blog-types";

// English version of "توسعه کار و کسب الکترونیکی؛ ساخت فروشگاه اینترنتی و سئو (پودمان دوم)" — editorial translation
export const EN_ARTICLE: Article = {
  slug: "online-store-development-12",
  title: "Building an Online Store with PrestaShop and SEO (Unit 2)",
  excerpt:
    "Unit 2 of the e-commerce textbook: launching a store with PrestaShop, staff and access management, catalog, shipping and orders, Iran's e-Namad trust seal, SEO, and digital marketing.",
  category: "student",
  tags: [
    "e-commerce textbook",
    "12th grade unit 2",
    "online store",
    "PrestaShop",
    "SEO",
    "digital marketing",
  ],
  date: "October 18, 2026",
  readMinutes: 14,
  cover: "/images/covers/online-store-development.png",
  book: "ecommerce-security-12",
  blocks: [
    {
      type: "p",
      text: "Maher and Mobina have their idea and their canvas; now they must build the actual store! Unit 2 of the E-Commerce and Network Security textbook is the busiest unit in the book: from installing a store platform and initial configuration to managing orders, payment, and shipping, meeting Iran's legal requirements, and finally SEO and digital marketing to attract customers. We have rewritten the whole path in the book's order so you can follow along and tick off the workshops one by one.",
    },
    { type: "h2", text: "The store platform: your shop's two faces" },
    {
      type: "p",
      text: "E-commerce content management systems (CMS) like PrestaShop — the platform the book chose for practice — have two faces: the front office, which the customer sees, and the back office, the admin panel where you do the configuration. You can install the store on a local computer (at the localhost address) or on a real host with a domain; the installation steps are exactly like installing any CMS: download, upload to the host, create the database, and run the installation wizard. Take the book's security note seriously: after installation, the admin folder name is changed to a random string so the panel's address cannot be guessed — and you should choose an unpredictable name for it too.",
    },
    { type: "h2", text: "Employees, profiles, and maintenance mode" },
    {
      type: "p",
      text: "Before entering content, set up team management properly. Every collaborator who will handle part of the work needs a separate user account with an appropriate access level. Access is managed through profiles: you will see the default profiles such as SuperAdmin, Salesman, and Translator, and you can create a new one, like “Developer”, and tick box by box which menus are open to it. A professional trick before every major change: switch the store to maintenance mode so visitors see a “store is being updated” message and the search engine does not index your pages; then, in the allowed-IPs section, add your own IP address so only you can see the storefront and make changes without disruption. The maintenance-mode message text is customizable too.",
    },
    { type: "h2", text: "The store's appearance and static pages" },
    {
      type: "p",
      text: "The store's configuration data includes its name, contact information, the shop email (which order notification emails are sent from), and the logos: the header logo, the email and invoice logo, and the favicon (the small icon visible in the browser's address bar and bookmarks). In the static pages section you must also write real, complete terms and conditions of use, the shipping method, legal notes, an About Us page, and a Contact Us page — these pages raise customer trust and search-engine standing together. Friendly URLs are part of search engine optimization too: enable the option to use Persian characters in URLs and separate words with hyphens instead of the half-space character. The homepage image slider and banners are configured from PrestaShop modules: the image, title, description, and destination URL of each slide or banner are editable.",
    },
    { type: "h2", text: "The catalog: categories, attributes, features, and brands" },
    {
      type: "p",
      text: "The product is the heart of the store, and before adding one you must design its structure. Categories are the shop's shelves: they need short, descriptive names, should appear in the main menu, and can have subcategories when needed (the book's example: Handicrafts → Handwoven). Attributes are properties whose selection makes the product different — like size and color, chosen right on the product page. Features, however, are fixed: like a bag's material, which is either canvas or leather and cannot be changed by the customer. Brands and suppliers are two side classifications that get the customer to the product faster and connect you to the real producer — cutting out the middleman, which is exactly the advantage of e-commerce!",
    },
    { type: "h2", text: "Shipping, currency, orders, and discounts" },
    {
      type: "p",
      text: "Product delivery is one of the most challenging parts of Iranian e-commerce; a shipping delay means a customer who never returns — one who would rather pay more for in-store shopping! First define zones (home province, neighboring provinces, non-neighboring) and assign provinces to zones, then create a carrier with a separate rate for each zone — like Express Post, which is disabled for orders above a certain weight. Set the currency to match how people actually speak: the official unit is the rial, but people talk in toman; the book walks through enabling the toman and disabling the rial. Orders follow a status cycle: registered, being prepared, shipped, delivered — and as you update the status, the customer always stays in the loop. For extra appeal, create discount codes with smart limits (validity period, minimum cart amount, number of uses, specific product categories) and also enable the recyclable gift-wrapping option in the order settings.",
    },
    {
      type: "tip",
      title: "Backups and upgrades: a professional habit",
      text: "Before every major change, take a full backup, and use the Database Cleaner module to empty the default store contents before entering real products. For version upgrades, first disable third-party modules, run the upgrade, test it (create a test product and a test order), and if something breaks, roll back with the backup. And remember: secure, non-default passwords on every panel — host, store, and payment gateway — are among the non-technical competency indicators of this unit!",
    },
    { type: "h2", text: "Making the business legal: the e-Namad seal and cybercrime police" },
    {
      type: "p",
      text: "Not everything sellable can be sold online! Iranian internet businesses that offer goods or services and collect payment must obtain the e-Namad electronic trust seal — a mark issued for one year after the website is reviewed and the owner's identity and qualifications are verified. Its benefits go beyond building trust: getting a payment gateway from banks and signing a delivery contract with the national post company are both conditional on it. For cybercrime cases, the cyber police (FATA) and the cyberspace prosecutor's office are the authorities; unauthorized access, data theft, and online fraud are taken seriously. For the list of prohibited goods and the permits some items require, review the rules page of the e-Namad system in the workshop.",
    },
    { type: "h2", text: "SEO: how to get found on Google" },
    {
      type: "p",
      text: "Once the store is live, everyone expects page one of Google; the reality, though, is that users mostly look at the first page of results only. SEO is the set of activities, on and off the site, aimed at a better position in search results. The book's two main tactics: 1) make the site responsive on every device — a mobile user who reaches the content easily comes back, and this steady presence lifts your SEO (check it with tools like Google Mobile Friendly and Responsinator); 2) register the website with Google so crawlers find you faster. A search engine reads pages with crawlers — web spiders — then indexes and ranks them, so write a proper title and meta description for every page and category. For keywords, use Google's autocomplete suggestions, and with tools like KWFinder measure which phrases would improve your SEO and how stiff the competition is. Remember that SEO alone does not do the job — it takes constant practice.",
    },
    { type: "h2", text: "Digital marketing: where selling actually starts" },
    {
      type: "p",
      text: "The unit's final section is market management: reaching marketing goals with digital tools. Get to know them: search engine optimization (the SEO you just read about), content marketing (creating useful content people actually search for), social media channels and pages (list their addresses on your Contact Us page), click advertising, affiliate marketing, and display advertising in the media. Teacher Farahmand's closing lesson is pure gold: the only constant is change. Online, you take the first step and refine the rest of the path with audience feedback — even if it means changing the product or the channel (a pivot). Your success or failure is not about your effort alone; competitors' performance and outside parameters matter too — treat failure as experience and make it the next stepping stone.",
    },
    {
      type: "quote",
      text: "Unit 2 assessment checklist: download and install the store platform on a host and locally + create a profile and an employee + take the store into maintenance mode + configure store data and logos + manage the catalog + back up and upgrade + process an order and a discount code + test responsiveness and register with Google.",
    },
  ],
};
