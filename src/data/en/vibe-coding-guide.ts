import type { Article } from "@/lib/blog-types";

// English version of "وایب کدینگ؛ ساخت اپلیکیشن و سایت با هوش مصنوعی بدون یک خط کد" — editorial translation
export const EN_ARTICLE: Article = {
  slug: "vibe-coding-guide",
  title: "Vibe Coding: Build Apps and Sites with AI, Zero Code",
  excerpt:
    "Speak in plain language and watch an app build itself. Learn what vibe coding is, which tools to start with, and how to build — and monetize — your first project.",
  category: "programming",
  tags: ["vibe coding", "app building", "ai coding", "Cursor", "artificial intelligence"],
  date: "October 13, 2026",
  readMinutes: 12,
  cover: "/images/covers/vibe-coding.png",
  blocks: [
    {
      type: "p",
      text: "Say one simple sentence: “Build a salon booking app with a customer form and an admin panel” — and five minutes later, that very app is running in front of your eyes. No six-month course, no installing dozens of tools, not even a single line of hand-written code. This is exactly what is called vibe coding; a trend that in less than two years went from a joking tweet to an official job skill, and is now red hot in tech companies all over the world. In this article you will learn what vibe coding really is, which tools to start with, how to build your first project step by step, which mistakes kill every beginner and — why not — how to make money with this very skill.",
    },
    { type: "h2", text: "What exactly is vibe coding?" },
    {
      type: "p",
      text: "Vibe coding means building software by describing it in natural language instead of writing code. Instead of talking to the computer in JavaScript, you talk to the AI in your own language: “Add a login button that works with a mobile number”, and the AI writes the code, runs it and shows you the result. If you don't like the result, you fix it right there in plain human language: “Make it a bit simpler and turn it green.” The “vibe” in the name comes from exactly this: instead of managing technical details, you set the feel and the general direction — the vibe — of the product, and the execution belongs to the AI. For more precise prompts, the prompt-writing techniques we taught earlier pay off directly here.",
    },
    {
      type: "p",
      text: "One important note before we continue: vibe coding does not take the place of professional programmers; it takes the place of “ideas dying unrealized”. Millions of good ideas stayed locked in people's heads because building them required a technical team and a budget. Vibe coding broke that lock: today a teacher, a shopkeeper or a school student can build the small tool made exactly for their own work — a tool that would get lost in a hundred-user world but is gold for the job at hand.",
    },
    { type: "h2", text: "Why did this trend explode so fast?" },
    {
      type: "list",
      items: [
        "Model quality crossed the threshold: the models of 2026 not only write code but run it, test it and fix their own errors; the complete building loop is no longer tied to a human.",
        "Cost collapsed: the leading tools have free or cheap plans; work that once required tens of thousands of dollars of team budget now happens on a monthly subscription priced like a sandwich.",
        "Market speed changed: startups realized the first version of a product can be built in days, not months; a product manager with an idea no longer waits in the dev team's queue.",
        "Learning went street-level: instead of dry formulas and patterns, you start by building through conversation, and the technical concepts get learned gradually, right when you need them — a path that can be combined with the classic programming roadmap too.",
      ],
    },
    { type: "h2", text: "The main vibe coding tools of 2026" },
    {
      type: "p",
      text: "The tool market is crowded, but four or five main names do the job. The table below is your guide to choosing:",
    },
    {
      type: "table",
      headers: ["Tool", "How it works", "Best for", "Starting cost"],
      rows: [
        ["Lovable", "Fully browser-based, complete app with database", "Absolute beginners, MVPs and small apps", "Limited free plan"],
        ["Bolt.new", "Builds in the browser with a live preview", "Quick prototypes, landing pages, simple apps", "Limited free plan"],
        ["Replit", "Complete online environment + database + deployment", "More serious apps with easy iteration", "Limited free plan"],
        ["Cursor", "Professional editor built on VS Code", "More serious projects and people who want to understand the code", "Limited free plan"],
        ["Claude Code", "Terminal agent inside your project", "Developers and large projects", "Claude subscription"],
        ["v0", "Generates beautiful user interfaces", "Designing pages and components", "Limited free plan"],
      ],
    },
    {
      type: "p",
      text: "An honest recommendation for starting out: if you have no technical background at all, begin with Lovable or Bolt — everything is in the browser and you see the result instantly. If you are a little curious about code, try Replit or Cursor; watching the code the AI writes is itself the best programming class. And if you want to sprinkle free tools like these into your workflow, see our list of free AI tools.",
    },
    { type: "h2", text: "Build your first project in 7 steps" },
    {
      type: "p",
      text: "Enough theory; build your first app tonight. Follow these seven steps exactly:",
    },
    {
      type: "list",
      ordered: true,
      items: [
        "Pick one small, real problem: “my daily to-do list with a repeat option”, “monthly expense tracking with a chart”, “a page presenting my services with an order form”. The first project must be small enough to be finished; finishing matters more than being perfect.",
        "Before typing, write a one-paragraph description: what the app does, what pages it has, what data is stored, who uses it. That very paragraph is your first prompt.",
        "Build version one with one complete prompt, and be patient: if your tool allows it, write “first show me the structure, then write the code” so you keep more control.",
        "The one-change-per-message rule: instead of ten requests in one sentence, make one change at a time and look at the result; the biggest beginner mistake is drowning the AI in ten simultaneous requests.",
        "Test it yourself after every change: press the buttons, fill the form with wrong data, refresh the page; find the bug before the AI does and report it precisely: “when I submit the empty form it throws an error; add validation.”",
        "Save your version: whenever your app works correctly, create a version/commit; that way if the next change breaks something, you go back to the healthy version and never start from zero.",
        "Publish it and show it off: all of these tools have a publish button; give the link to your friends and gather feedback. Your first live app is ahead of the thousands of ideas killed inside people's heads.",
      ],
    },
    {
      type: "tip",
      title: "Before a real launch",
      text: "AI-generated code is great for personal and experimental projects, but if it is going to collect real user data — passwords, phone numbers, payments — make sure of three things: HTTPS is enabled, passwords are stored hashed, and database access is locked down. Most well-known tools set these correctly by default, but take a look yourself or ask a technical acquaintance for a five-minute review. Building trust takes years; leaking one database takes minutes.",
    },
    { type: "h2", text: "Earning from vibe coding — real or hype?" },
    {
      type: "p",
      text: "It is real, but not magical. These three paths are field-tested:",
    },
    {
      type: "list",
      ordered: true,
      items: [
        "Building MVPs for startups and businesses: idea owners have money but no prototype; with vibe coding you deliver an MVP in a few days at a price a traditional team would not even lend an ear to. Two or three personal portfolio pieces are enough to start — and the full path is laid out in the AI freelancing roadmap.",
        "Niche tools on subscription: a highly specialized tool for one specific job (an exchange profit calculator, a gym training planner, a salon booking manager) sold as a monthly subscription; a small market, but loyal and lightly contested.",
        "Automating your own business: if you own a shop or a company, build its internal tools yourself — an order-entry system, simple inventory management, a report generator — and erase the developer's multimillion-toman salary; this alone is a hidden income.",
      ],
    },
    { type: "h2", text: "Five common mistakes you should know about" },
    {
      type: "list",
      items: [
        "Starting from a big project: everyone starts with “my own social network app” and abandons it; start with a one-page tool.",
        "Vague prompts: “make it better” means nothing; “show the empty-form error as a red message in Persian” means everything.",
        "Stacked changes: ten fixes in one message means none of them is traceable; one at a time.",
        "Ignoring cost: free plans have limits; know your quota before the day starts and get an inexpensive subscription for serious projects.",
        "Handing security over to the AI: the AI sets up security “usually” correctly; “usually” is not enough for customer data — reread the note above.",
      ],
    },
    {
      type: "quote",
      text: "For the first time in history, the most expensive skill is not typing out code; it is a clear vision of the thing worth building. The rest is an intimate conversation with an artificial intelligence.",
    },
    {
      type: "p",
      text: "Vibe coding is the new kid in town and still mid-growth; every week a new tool or technique comes out. Build your first app, send us its link, and if you get stuck at a hard spot, write about it in the comments so we can untangle it together — and follow TakRah's Telegram channel for what's new in this world. The next step toward going professional? Our article on building a sales chatbot without coding shows you how to turn this very skill into a revenue-generating product.",
    },
  ],
};
