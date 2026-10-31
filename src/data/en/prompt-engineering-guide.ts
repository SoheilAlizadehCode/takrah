import type { Article } from "@/lib/blog-types";

// English version of "پرامپت‌نویسی حرفه‌ای؛ فرمول ساده‌ای که جواب‌های هوش مصنوعی را ۱۰ برابر بهتر می‌کند" — editorial translation
export const EN_ARTICLE: Article = {
  slug: "prompt-engineering-guide",
  title: "Prompt Engineering: The Simple Formula for 10x Better AI Answers",
  excerpt:
    "Two people, same tool: one gets brilliant answers, the other bland text. The difference is the prompt. Inside: the four-part formula, seven techniques, a before-and-after table and a seven-day practice plan.",
  category: "ai",
  tags: ["prompt engineering", "prompting", "ChatGPT", "AI training", "artificial intelligence"],
  date: "October 2, 2026",
  readMinutes: 12,
  cover: "/images/covers/prompt-engineering.png",
  blocks: [
    {
      type: "p",
      text: "It may have happened to you: a friend gets amazing answers from the very same ChatGPT you use, while you — having asked the same question — receive a generic, lifeless text. The secret of this difference lies neither in the tool version nor in faster internet; it lies in prompt quality. A prompt is the instruction you give the AI, and talking to it is like a conversation with a very intelligent colleague who knows absolutely nothing about your mind. In our AI learning roadmap, we called prompting “the most important skill of the year” and promised to dig into it seriously; this article is that promise. By the end of it, you will hold a simple formula that works with any tool — from ChatGPT to Claude and Gemini.",
    },
    { type: "h2", text: "Why does a weak prompt get a weak answer?" },
    {
      type: "p",
      text: "To write good prompts, you first have to understand how AI “thinks”. Language models are trained to predict the continuation of text based on billions of examples — so when you ask a generic question, they return the statistically most common generic answers. The prompt “write a resume” has been asked millions of times and has millions of repetitive answers waiting for it, so you get a repetitive resume. But a prompt that describes your specific situation pulls you out of the statistical average and produces an answer written only for you. In other words, output quality is a direct reflection of input quality — not tool magic.",
    },
    {
      type: "p",
      text: "A simple analogy: AI is like a superb graphic designer who has just walked in and does not know you at all. Say “make me a nice poster” and they are forced to work from general guesses. But say “a minimal poster with warm colors for a café in Tehran with young customers, to promote specialty coffee” and the same designer produces work that looks like they have known you for years. That is exactly what prompting does: it replaces guessing with knowing.",
    },
    { type: "h2", text: "The four-part formula for a professional prompt" },
    {
      type: "p",
      text: "Every strong prompt — even the shortest one — shares four components. Learn this formula and you will never write a one-line prompt again:",
    },
    {
      type: "list",
      ordered: true,
      items: [
        "Role: tell the model who it is — “you are a food-marketing specialist”. Assigning a role steers the tone, vocabulary, and depth of the answer in the right direction.",
        "Context: supply the necessary information — what the product is, who the audience is, what the constraints are, what has happened before. Every relevant detail means one fewer guess for the model.",
        "A precise request: state exactly what you want — “three 50-word captions with a call to action”, not “write something about the product”.",
        "Output format: define the shape of the answer — a table, a numbered list, formal text, 3 options with explanation. A clear format makes the answer directly usable.",
      ],
    },
    {
      type: "p",
      text: "Let us run this formula on a real example. Weak prompt: “Write an Instagram post for a clothing shop.” Now the professional version with all four parts: “You are a copywriter who writes for women's clothing brands (role). We sell spring coats for customers aged 25 to 40; the brand tone is friendly and energetic, and we have a 20% discount this week (context). Write three Instagram captions, each opening from a different angle: comfort, styling, and the limited-time discount (precise request). Each caption is at most 60 words, ends with a call to action, and includes 3 relevant hashtags (format).” The gap between these two outputs resembles the gap between a street hawker and an advertising agency.",
    },
    { type: "h2", text: "Before and after: three real prompts we rewrote" },
    {
      type: "table",
      headers: ["Weak prompt", "Professional prompt (with the formula)", "Result"],
      rows: [
        ["Write a collaboration request email", "You are the communications manager of an education startup; write a content-partnership proposal email to a high-traffic Persian blog; formal but warm tone; at most 120 words, with a suggested topic at the end", "An email that needs only one read to get a reply"],
        ["Write about the benefits of walking", "A 300-word blog post for an inactive 40-year-old who has just decided to change; an encouraging tone without preaching; end with a plan for the first week", "Content that “sees” your exact reader and leads to practical action"],
        ["Suggest a name for my Telegram channel", "Suggest 15 short names for a Persian-language AI education channel; simple, memorable, and free of the market's overused words; in a table with one explanatory sentence for each name", "A pickable list instead of ten scattered names"],
      ],
    },
    {
      type: "tip",
      title: "The golden trick: ask the AI itself",
      text: "If you do not know what information to provide, ask this before your main prompt: “What questions should you ask me so that you can do this job at its best?” The model asks you precise questions, you answer them — and the result is a complete prompt with no prior prompting knowledge required. This technique works miracles for beginners.",
    },
    { type: "h2", text: "Seven techniques that make your work professional" },
    {
      type: "list",
      items: [
        "Give examples (few-shot): put one or two samples of the style you want into the prompt; the model follows your pattern. “Write a caption like this example: ...”",
        "Ask step by step: for complex tasks, write “first give me the options, then let's review them together, and finally the final version” — your quality and control both rise.",
        "Name the audience: “write for a 50-year-old manager” and “write for a student” are worlds apart.",
        "Set smart constraints: word counts, banned words, tone, things that must not be mentioned. Constraints steer the model's creativity in the right direction.",
        "Do not accept the first answer: say “make this shorter and catchier” or “a second version with a playful tone”. The best outputs are always built in the second and third rounds.",
        "Do not abandon the chat: keep every revision inside the same conversation; the model learns from previous answers and from your feedback, and gets sharper each time.",
        "Ask it to argue against you: for decisions, ask “what are the weak points of this idea? Argue against me” — this technique prevents one-sided decisions.",
      ],
    },
    { type: "h2", text: "Mistakes 90% of users make" },
    {
      type: "list",
      items: [
        "A generic prompt with specific expectations: “write an article”, then surprise at the faceless text. If you want specific, ask specific.",
        "Ten requests in one prompt: when you want everything at once, everything arrives mediocre. Break big tasks into several prompts.",
        "Withholding information that is not actually confidential: audience, budget, tone, and goal are not secrets; withholding them means the model works from guesses.",
        "Copying other people's prompts without adapting them: ready-made prompts on the internet are starting points, not final versions; without your context, they do not speak in your voice.",
        "Blaming the tool instead of fixing the prompt: before saying “this AI does not give the right answer”, rewrite the prompt once using the four-part formula.",
      ],
    },
    { type: "h2", text: "The 7-day practice plan: become a pro starting today" },
    {
      type: "p",
      text: "Prompting is not learned by reading; it is learned by practicing on your own real tasks. Each day takes only 15 minutes:",
    },
    {
      type: "list",
      ordered: true,
      items: [
        "Day 1: pick one of today's real tasks and write it with the four-part formula; save the before and after.",
        "Day 2: get the same task done in three different tones and compare the differences.",
        "Day 3: use the “ask me questions” trick and build one complete prompt.",
        "Day 4: run a multi-step prompt for a heavier task (such as a week's content plan).",
        "Day 5: take a first answer through three rounds of revision to a final version, and note the revision path.",
        "Day 6: turn one successful prompt into a template, so that weeks later you only swap the details.",
        "Day 7: review all the week's prompts and write down your personal pattern — this is your “prompting style”.",
      ],
    },
    {
      type: "quote",
      text: "AI is the mirror of your question: ask vaguely, get a vague answer; ask precisely, get a precise answer.",
    },
    {
      type: "p",
      text: "Prompting is a skill that will stay with you from today to the end of your working life, and whatever new tool arrives, the same formula works: role, context, precise request, format. If you have not yet set up the basic tools, start with our list of 7 free AI tools, then go deeper with the advanced ChatGPT tricks — and keep this article at hand, because in the next article we will use these very techniques for image prompting. Wrote a prompt and did not get a good answer? Send it to the comments; we will rewrite a few of them together!",
    },
  ],
};
