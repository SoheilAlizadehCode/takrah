import type { Article } from "@/lib/blog-types";

// English version of the Persian article "learn-python-from-zero" — editorial translation
export const EN_ARTICLE: Article = {
  slug: "learn-python-from-zero",
  title: "Learn Python From Zero: A 30-Day Roadmap for Complete Beginners",
  excerpt:
    "Python is the most popular language in the AI world — and easier to learn than you think! Find out why, write your first program tonight, and take home a 30-day roadmap.",
  category: "programming",
  tags: [
    "learn python",
    "python from zero",
    "programming",
    "python for beginners",
    "python projects",
    "artificial intelligence",
  ],
  date: "October 14, 2026",
  readMinutes: 13,
  cover: "/images/covers/learn-python-zero.png",
  blocks: [
    {
      type: "p",
      text: "If you go looking for a magic trick in the tech world, one language gets named more than any other: Python. It is both the simplest choice for a first programming language and the most powerful tool behind artificial intelligence — from ChatGPT to self-driving cars, Python is working underneath it all. Many people assume programming means heavy math and some rare inborn talent; the reality is that millions of ordinary people — students, nurses, shopkeepers — have learned Python, because it feels more like writing instructions in plain English than “scary coding”. In this article you will walk the same path a real beginner walks: why Python, installation and your first program tonight, four core concepts with simple examples, and a 30-day roadmap that ends with the first real project of your life.",
    },
    { type: "h2", text: "Why Python exactly? (and not ten other languages)" },
    {
      type: "p",
      text: "Beginners usually get lost while choosing a language, and that is exactly where their learning project ends. Three simple reasons make Python the best starting point. First, readability — among well-known languages, Python is the closest to everyday English; where other languages take three lines, Python takes one, and that means far more hope in the first weeks. Second, the job market — Python is the undisputed king of automation, data analysis, and AI; the path you start today leads straight to income, whether freelancing or full-time employment. Third, community and resources — for every error you will ever hit, somebody somewhere in the world has already hit the same error and written the answer down; for a beginner, that means you are never alone. If you have no patience for coding but you do have ideas, there is even a vibe-coding path with AI — but Python gives you real depth.",
    },
    { type: "h2", text: "Setup: write your first program tonight" },
    {
      type: "p",
      text: "You have two paths, and you can try both tonight. The quick path, just to get a feel: go to sites like Google Colab or the Programiz online compiler — write and run code in your browser without installing anything; great for a start and for small exercises. The real path, for serious work: install the latest version from python.org (during installation, tick “Add Python to PATH” — the most common day-one mistake), then install an editor like VS Code and enable its Python extension. Now the most important moment: create a file named hello.py, write print(\"Hello, World!\") inside it, and run it. Done — you are officially programming, and your program just ran on your computer. Every professional's hundred thousand hours started from this single line.",
    },
    { type: "h2", text: "The four concepts everything starts with" },
    {
      type: "p",
      text: "Programming is not a complicated world; it is built from a few simple concepts that every language has. See these four through a small shop example:",
    },
    {
      type: "list",
      ordered: true,
      items: [
        "Variable: a place to store information, like labeled boxes. price = 25000 means a box named price holding the number twenty-five thousand; name = \"Sara\" is a box holding a name. For the rest of your programming life, you will simply be building and changing these boxes.",
        "Condition (if): decision-making. if price > 20000: print(\"expensive\") means: if the price is above twenty thousand, print “expensive”. All the intelligence of any software is built from thousands of small decisions exactly like this.",
        "Loop (for): repeating work — for every item in the list, print its price. Where a human gets tired, loops repeat a thousand times without mistakes — and this is exactly what creates automation.",
        "Function (def): packaging a piece of work for repeated use. def send_sms(user): ... means you write the text-message logic once and call it a hundred times for different users. A function means “write once, use forever”.",
      ],
    },
    {
      type: "p",
      text: "With just these four concepts you can build a number-guessing game, manage a shopping list, and write a calculator. The later concepts — lists, dictionaries, files — are best learned in the middle of projects, not by reading a dry textbook. To see where Python sits in the overall career path, also take a look at the programming roadmap.",
    },
    { type: "h2", text: "Three mistakes that eliminate 90% of beginners" },
    {
      type: "list",
      items: [
        "Reading without writing: two hours of watching videos equals zero progress; twenty minutes of your own coding equals real progress. Rule: for every ten minutes of learning, ten minutes of mandatory practice.",
        "Falling into tutorial hell: watching course after course without a project; you only climb out of this pit by building small things of your own.",
        "Comparing yourself to others: the person whose Instagram is full of polished projects has worked for years; comparing your day three with their year ten is unfair and only kills motivation.",
      ],
    },
    {
      type: "tip",
      title: "The 20-minute rule",
      text: "The best way to learn Python if you have a job or studies is exactly this: twenty minutes a day, every day, no exceptions — instead of four hours on Friday afternoon. The brain builds skill through daily repetition, not cramming sessions, just as an athlete is shaped by daily training rather than one monthly record. If you oversleep one day, do not get romantic about it — do the same 20 minutes anyway, even if it is a single line of code. Consistency beats intensity.",
    },
    { type: "h2", text: "The 30-day roadmap from zero to your first project" },
    {
      type: "list",
      ordered: true,
      items: [
        "Days 1–5: installation, your first program, variables and print; 20 minutes of small daily exercises — a simple calculator, a toman-to-dollar converter, a name-greeting generator.",
        "Days 6–12: conditions and loops; projects: a number-guessing game, an automatic multiplication table, filtering the even numbers out of a list.",
        "Days 13–18: lists, dictionaries, and functions; projects: a manageable shopping list, a text-based phone book, a function that computes a store discount.",
        "Days 19–24: working with files and errors; projects: saving and reading your notebook from a file, a daily expense tracker.",
        "Days 25–30: your first real project of your own — a tool that solves a personal problem of yours (appointment management, a cost calculator, a game you like) — and publish it on GitHub; the first piece of programming work of your life.",
      ],
    },
    {
      type: "quote",
      text: "Programming is not learned by the person who watched the best tutorials; it is learned by the person who wrote the worst code earliest and never stopped fixing it.",
    },
    {
      type: "p",
      text: "After these 30 days, the road opens up in front of you: if you are after money, automation with Python builds income fastest; if you want a career in the world of AI, the Python-for-AI path passes right through here. When will you write your first line of code? Do not skip tonight — and for fresh topics, follow TakRah's Telegram channel.",
    },
  ],
};
