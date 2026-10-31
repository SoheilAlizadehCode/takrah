import type { Article } from "@/lib/blog-types";

// English version of the Persian article "python-for-ai-guide" — editorial translation
export const EN_ARTICLE: Article = {
  slug: "python-for-ai-guide",
  title: "Python for AI: From Your First Line of Code to Your First Model",
  excerpt:
    "Why does all of AI speak Python? Get the full learning map: the four golden libraries, your first machine learning model step by step, and the mistakes that trip beginners up.",
  category: "programming",
  tags: [
    "python for AI",
    "machine learning",
    "NumPy",
    "Pandas",
    "PyTorch",
    "learning path",
  ],
  date: "October 14, 2026",
  readMinutes: 12,
  cover: "/images/covers/python-for-ai.png",
  blocks: [
    {
      type: "p",
      text: "Behind every magical thing you have seen AI do — image recognition, translation, ChatGPT — one simple fact is hiding: they are all built with Python. Not because Python is the fastest language in the world (it is not), not because it is better than the rest (that is debatable), but because the entire AI ecosystem — from libraries to tutorials to pre-trained models — is built around Python. If you want to turn from an “AI user” into an “AI builder”, this path is fixed, and its first paving stone is Python. In this article you will see why Python is the king of AI, get to know the four golden libraries, build your first machine learning model step by step, and understand how this skill turns into real income.",
    },
    { type: "h2", text: "Why is Python the language of AI?" },
    {
      type: "p",
      text: "A good question, because in raw execution speed Python is slower than languages like C++ — and doesn't AI need heavy computation? The answer is clever: AI's heavy computation is not actually done in Python; it runs on graphics processors and optimized low-level code written by specialist teams in C and CUDA. Python is only the “commander”: you give orders in Python and the fast infrastructure executes them. That means the best of both worlds: simplicity of writing plus speed of execution. Add to that an ocean of ready-made libraries (whatever you can think of has a library), endless learning resources, and a community where every question of yours has already been asked by someone — and you understand why every serious AI article and every AI job lists Python as requirement number one. You have read the conceptual side in learning AI from zero; here is that same path with the real tools.",
    },
    { type: "h2", text: "The four golden libraries you need to know" },
    {
      type: "p",
      text: "The world of AI libraries is like a grand bazaar; but to start, only four shops matter — the rest will come your way later:",
    },
    {
      type: "table",
      headers: ["Library", "What it does", "Like this", "Learning stage"],
      rows: [
        ["NumPy", "Working with arrays and fast numerical computation", "An ultra-professional calculator for tables of numbers", "First"],
        ["Pandas", "Reading, cleaning, and analyzing tabular data", "Excel that understands code", "Second"],
        ["Matplotlib", "Drawing charts and visualizing data", "The painter of data", "Alongside Pandas"],
        ["Scikit-learn", "Ready-made machine learning algorithms", "The classic modeling toolbox", "Third"],
        ["PyTorch / TensorFlow", "Building neural networks and deep learning", "The engine of modern AI", "Fourth (later)"],
      ],
    },
    {
      type: "p",
      text: "Take the order seriously: many people get hyped watching neural-network videos, jump straight to PyTorch, and quit in the second week. The right path starts from data, not from neural networks; because 80% of real AI work is cleaning and understanding data — the job Pandas rules.",
    },
    { type: "h2", text: "Your first machine learning model in five steps" },
    {
      type: "p",
      text: "Let us look at the whole cycle with a small, real example: predicting a house's price from its area in square meters. These five steps are the pattern behind all classic machine learning projects:",
    },
    {
      type: "list",
      ordered: true,
      items: [
        "Get the data and look at it: use Pandas to read the houses CSV file and view its first few rows with head(); always look at the data first — never build a model blindly.",
        "Prepare the data: clean out broken and empty columns, turn area and price into numbers; if the data is dirty, the model built on it produces garbage — the famous “Garbage In, Garbage Out” rule.",
        "Split the data: divide it into a “training” part and a “test” part (usually 80/20); the model learns from the training part, and with the test part we check whether it truly learned or just memorized.",
        "Train the model: with Scikit-learn it is three lines of code — pick a model (say LinearRegression), train it on the training data with fit(), and predict the prices of new houses with predict().",
        "Evaluate: use the model's accuracy on the test data to see how well it performs; a model without evaluation is like a student who claims to have passed without ever taking the exam.",
      ],
    },
    {
      type: "p",
      text: "You can run these five steps right now with a free dataset such as Boston house prices or student scores, in Google Colab — without installing anything. The moment your first prediction model works, the world of AI is no longer magic to you; it is engineering you know how to do.",
    },
    {
      type: "tip",
      title: "The key question before every AI project",
      text: "Before choosing any algorithm, ask yourself: “what type of output do I want?” If it is predicting a number (price, temperature, sales), go for regression; if it is choosing between several categories (spam/normal, sick/healthy), go for classification; if you want the data to group itself, that is clustering. Beginners usually start from the algorithm and get lost halfway; professionals start from the question and the algorithm finds itself.",
    },
    { type: "h2", text: "How does this path turn into money?" },
    {
      type: "list",
      items: [
        "Data analysis for businesses: every shop and every website has data, but nobody analyzes it for them; sales-forecast reports or customer-behavior analysis are profitable orders that fit right into AI freelancing.",
        "Custom modeling: predicting warehouse inventory, detecting unusual changes in accounts, ranking sales leads — intermediate projects with a high income ceiling.",
        "A full-time job: data analyst and machine learning engineer are among the best-paid jobs in the tech market, and their entry path is exactly this article.",
        "Products and content: building small sellable smart tools, or even the content-creation path about AI — because knowing the newest things is itself an asset.",
      ],
    },
    { type: "h2", text: "The 90-day map from basic Python to your first real model" },
    {
      type: "list",
      ordered: true,
      items: [
        "Month one: Python fundamentals following the learn-Python-from-zero guide; goal: comfort with variables, conditions, loops, functions, and files.",
        "Month two: NumPy and Pandas with practice on free real datasets (students, sales, movies); goal: cleaning and analyzing one real, messy dataset from start to finish.",
        "Month three: Scikit-learn with three classic projects (house price prediction, spam detection, customer clustering) and publishing them on GitHub; goal: three presentable portfolio pieces that stack up in interviews and freelancing.",
      ],
    },
    {
      type: "quote",
      text: "AI does not build the future; people who have learned to talk to data build it — and the language of that conversation is Python.",
    },
    {
      type: "p",
      text: "The path from “ChatGPT user” to “model builder” crosses a single bridge paved with Python, and its signposts are always lit. Today only one step is needed: open Colab and write your first line of code. If you get stuck, ask in the comments — and for a step-by-step learning path, do not miss TakRah's Python series: learn-Python-from-zero and Python automation are the steps just before and after this article. Follow TakRah's Telegram channel for what is new in AI as well.",
    },
  ],
};
