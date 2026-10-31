import type { Article } from "@/lib/blog-types";

// English version of the Persian article "programming-roadmap" — editorial translation
export const EN_ARTICLE: Article = {
  slug: "programming-roadmap",
  title: "The Programming Roadmap From Zero: Where Should You Start?",
  excerpt:
    "Want to become a programmer but not sure where to start? This step-by-step roadmap shows the real path from your first line of code to landing your first job.",
  category: "programming",
  tags: ["programming", "roadmap", "python", "learning", "career"],
  date: "June 10, 2026",
  readMinutes: 11,
  cover: "/images/covers/programming-roadmap.png",
  blocks: [
    {
      type: "p",
      text: "Programming is one of the most in-demand skills in the world today: attractive salaries, the option to work remotely, and a job market that is always hunting for good people. On the other hand, beginners face a thousand questions: Which language should I start with? Do I need a powerful laptop? How many years will it take? Worst of all, the sheer volume of learning resources creates confusion. In this article we offer a realistic, step-by-step roadmap that — based on the experience of thousands of successful programmers — actually works and steers you clear of the most common traps on the path.",
    },
    { type: "h2", text: "Before you start: three myths to throw out right now" },
    {
      type: "p",
      text: "Many people give in to false beliefs before they even make their first attempt. Myth one: “I have to be a math genius to program.” The truth is that most programming work requires simple logic, attention to detail, and problem-solving — not advanced mathematics; higher math is only needed for specialized fields like machine learning and 3D game development. Myth two: “I started too late.” Successful programmers have started at every age imaginable, and in this profession a portfolio matters more than degrees or age. Myth three: “I have to learn everything first, then start.” It is exactly the opposite: real learning happens while building, and anyone waiting to feel “fully ready” never gets ready.",
    },
    { type: "h2", text: "Choosing your path: where do you fit in the programming world?" },
    {
      type: "p",
      text: "“Become a programmer” is not a goal in itself; you need to pick a specialty. The four main career paths are web development (building websites and web applications), mobile development, data analysis and AI, and desktop and systems software development. The common advice for beginners is to start with the web or Python, because learning materials are abundant, the communities are large, and the job markets are active. The table below offers a quick comparison of the paths.",
    },
    {
      type: "table",
      headers: ["Path", "Main languages", "Entry difficulty", "Job market"],
      rows: [
        ["Front-end web development", "HTML, CSS, JavaScript", "Gentle", "Very high demand"],
        ["Back-end web development", "Python, PHP, Node.js", "Moderate", "High demand"],
        ["Mobile apps", "Kotlin, Swift, Flutter", "Moderate", "High demand"],
        ["Data and AI", "Python, SQL", "Hard at first", "Growing fast"],
      ],
    },
    { type: "h2", text: "Which language first? Our honest recommendation" },
    {
      type: "p",
      text: "This question gets argued for hours in forums, but the answer is simple. If you are drawn to building websites and user interfaces, start with the web trio: first HTML and CSS (not programming languages proper — they create the structure and look of the page), then JavaScript, which adds logic to the page. If data, artificial intelligence, or even testing and automation excite you, Python is the best choice: a language with clean, readable syntax that makes learning programming concepts easier. What matters more than the choice is not obsessing over it. The core concepts — variables, conditionals, loops, functions — are shared by every language, and switching paths later is far easier than you think.",
    },
    { type: "h2", text: "The six-month roadmap: move forward step by step" },
    {
      type: "list",
      ordered: true,
      items: [
        "Month one — core concepts: learn variables, data types, conditionals, loops, and functions in your chosen language. Write code at least one hour every day; watching videos without typing produces no results.",
        "Month two — problem-solving practice: solve two or three simple exercises a day from sites like W3Schools, or work through classic problems, until programming logic settles into your mind.",
        "Month three — your first real project: build something small but real: a calculator, a to-do list, or a personal introduction page. This is where real questions arise and learning becomes deep.",
        "Month four — professional tools: learn to work with Git and GitHub (code history and sharing) and make your workflow professional. Employers take this skill seriously during hiring.",
        "Month five — depth and a second project: build something slightly more complex that works with data or an external service, such as a weather app or a simple online store. Finish the first version even if it is incomplete.",
        "Month six — portfolio and networking: publish your projects on GitHub, build a LinkedIn profile, and start contributing to open-source projects or helping newer learners; the best way to consolidate what you know is to teach it.",
      ],
    },
    {
      type: "tip",
      title: "The one-hour rule",
      text: "Consistency matters more than intensity. One hour of coding every day is far more effective than eight hours on the weekend. The brain learns through regular repetition, not through long, spaced-out sessions. Open your calendar and book a fixed coding hour today.",
    },
    { type: "h2", text: "Free resources that actually help" },
    {
      type: "p",
      text: "The good news is that the best programming education resources in the world are free. freeCodeCamp offers complete web and Python courses with interactive exercises, and its learning paths give beginners solid structure. On YouTube, channels like Traversy Media and Programming with Mosh teach complete project-based lessons, and Persian speakers can also find numerous channels and sites offering quality free instruction. The official documentation of languages and frameworks is your best permanent reference: get into the habit of reading docs from day one, because they will accompany you throughout your entire career. And do not forget: depending on a single source is risky — balance a main resource with independent searching.",
    },
    { type: "h2", text: "Five traps that knock down most beginners" },
    {
      type: "p",
      text: "Dropout rates in programming are high, and the main cause is behavioral traps rather than the difficulty of the subject itself. The first and biggest trap is “tutorial hell”: endlessly watching courses without building anything — it creates a false sense of progress but builds no skill. The second trap is comparing yourself to others: you are in your first week, you see someone with five years of experience, and you lose heart; the only comparison allowed is you today versus you yesterday. The third trap is constantly jumping between languages and frameworks, which means always starting over. The fourth trap is giving up when errors appear, even though debugging is the very heart of programming and that skill is built through practice. The fifth trap is going it alone: online communities and Persian-language Telegram and Discord groups are full of people who have solved problems just like yours and are happy to help.",
    },
    { type: "h2", text: "Entering the job market: when am I ready?" },
    {
      type: "p",
      text: "The eternal question: when can I get a job? The realistic answer: when you can build two or three complete, working projects that solve a real problem and clearly explain how you built them. Interviewers look less at certificates and courses and more at whether you can think, read code, and solve problems. Early entry routes include internships at startups, small freelance projects on freelancing platforms, building websites for businesses around you, and even volunteer work for non-profit organizations. Every small real project is worth more than ten unfinished courses. Do not fixate on your first salary: the programming job market is a growth champion, and the path rises fast for anyone who keeps learning.",
    },
    { type: "h2", text: "Wrap-up: where to start today" },
    {
      type: "p",
      text: "Let us make this simple. Do three things today: first, choose your path (if in doubt, pick front-end web development or Python); second, choose one main resource (freeCodeCamp or a reputable course in your own language); and third, reserve your fixed daily hour. Starting tomorrow, code for one hour a day, and after every topic, write a small exercise. Six months from now, you will be amazed at how far you have come. And remember: programming is a marathon, not a sprint; the champion of this path is not the person who started fastest, but the one who never quit. Follow the rest of this series on TakRah — the next step is a step-by-step HTML tutorial and your first web page.",
    },
  ],
};
