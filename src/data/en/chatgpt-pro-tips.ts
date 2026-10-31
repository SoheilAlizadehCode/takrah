import type { Article } from "@/lib/blog-types";

// English version of "۱۰ ترفند طلایی برای استفاده حرفه‌ای از ChatGPT" — editorial translation
export const EN_ARTICLE: Article = {
  slug: "chatgpt-pro-tips",
  title: "ChatGPT Pro Tips: 10 Golden Rules for Better AI Answers",
  excerpt:
    "The difference between ordinary answers and amazing ones lies in how you write your request. With these 10 practical tricks, get the most out of ChatGPT.",
  category: "ai",
  tags: ["ChatGPT", "prompt writing", "artificial intelligence", "productivity"],
  date: "September 9, 2026",
  readMinutes: 8,
  cover: "/images/covers/chatgpt-tricks.png",
  blocks: [
    {
      type: "p",
      text: "ChatGPT is the most popular AI tool in the world, used by hundreds of millions of people every month. Yet here is the interesting part: the quality of the answers two different users get from this exact same tool can differ enormously. The secret behind that difference is a skill called prompt writing — the art of stating your requests to the AI correctly. In this article we will go through ten practical, battle-tested tricks that will completely transform the quality of your work with ChatGPT.",
    },
    { type: "h2", text: "The basics: why do weak prompts get weak answers?" },
    {
      type: "p",
      text: "ChatGPT is like a brilliant employee who knows nothing about you. If you say “write a text”, it does not know who the text is for, what tone to use, how long it should be, or what the goal is. The result will be generic, lifeless prose. But if you make the same request with full details — audience, purpose, tone, length, and special requirements — the answer you receive can sometimes outperform a professional writer. The golden rule is this: the more context you provide, the more precise the output you get.",
    },
    { type: "h2", text: "Ten practical tricks" },
    {
      type: "list",
      ordered: true,
      items: [
        "Give it a role: start the conversation by assigning a role, such as “You are a professional Persian-language editor” or “You are a phone-buying consultant with ten years of experience”. This keeps the answers within that specialty and delivers them in the right tone.",
        "Give full context and details: instead of “any suggestions for a trip?”, write: “Plan a detailed three-day trip to the north of the country in mid-spring, limited budget, two people, with budget accommodation suggestions”. Details turn a clichéd answer into a tailor-made plan.",
        "Specify the output format: if you want a table, say table; if you want a numbered list, say so. For example: “Write the pros and cons in a two-column table”. This trick is extremely effective for office work and comparisons.",
        "Use examples: if you have a sample of the style you are after, put it in the prompt and ask for output in the same style. The model picks up the pattern of tone and structure from your example.",
        "Break big requests into steps: instead of asking for a very long text in one go, ask for the outline first, then each section separately. This approach raises quality and prevents the text from ending up incomplete.",
        "Use step-by-step thinking: for calculation and logic problems, write “think through it step by step, then give the final answer”. This one simple sentence noticeably increases accuracy on complex problems.",
        "Ask for edits and revisions: the first answer is not the final answer. Write “make it shorter”, “make the tone friendlier”, “give more examples”. Talking to the model is like working with a real assistant — you have to steer it.",
        "Request a review from a different angle: ask it to “critique this text from the perspective of an experienced hiring manager” or “write three different versions of this ad message”. Multiple viewpoints surface ideas that would never occur to you on your own.",
        "Complete the personalization settings: in the custom settings section you can specify what your job is, what tone you want in responses, and what language the output should use. Set it once and benefit from it in every conversation.",
        "Try English for specialized topics: models usually answer in more depth in English. If you know English, write your prompts for technical subjects in English and then ask the model to render them in Persian.",
      ],
    },
    { type: "h2", text: "Three common mistakes to quit today" },
    {
      type: "p",
      text: "Alongside the tricks, knowing the common mistakes matters too. Mistake one: some users type sensitive information such as passwords, card numbers, or confidential work documents into the chat; this is strongly discouraged, because the data may be used to improve the model. Mistake two: trusting the answers unconditionally. ChatGPT sometimes states incorrect information with complete confidence, so always verify important figures and claims against primary sources. Mistake three: abandoning the conversation after the first unsatisfactory answer. Most professional users request corrections at least two or three times before they reach the output they want.",
    },
    {
      type: "tip",
      title: "A ready-made prompt to get started",
      text: "Save this template and each time change only the parts inside the brackets: “You are a [specialist role]. For [specific audience] whose goal is [goal], write a [type of output] in a [tone] tone, about [number] words long. Make sure to respect [specific requirement].”",
    },
    { type: "h2", text: "Wrapping up" },
    {
      type: "p",
      text: "Prompt writing is a skill, not a piece of knowledge you learn once and keep forever. The best way to learn it is steady practice and watching how the results change. We suggest picking three tricks from this list today and trying them at your first opportunity. You will soon notice that ChatGPT has turned from a source of entertainment into a powerful assistant for your work, studies, and daily life. In the upcoming articles of the TakRah AI series, we will walk you through more specialized tools and more advanced tricks.",
    },
  ],
};
